let kuro
let _msg
let _stickers = {}
let _table = 'stickers'
let assets = './files/stickers'
const fs = require('fs')
const axios = require('axios')
const FormData = require('form-data')
const concat = require('concat-stream')

exports.init = function(bot) {
	kuro = bot

	// Create sticker folder if it doesn't exist
	fs.existsSync(assets) || fs.mkdirSync(assets)

	// Create the table where we will be storing this module's data
	bot.db.schema.createTableIfNotExists(_table, (table) => {
		table.increments()
		table.string('name')
		table.string('file')
		table.string('url')
	}).then(() => {
		// Lets load up the existing stickers
		bot.db.table(_table).then((rows) => {
			for (let row of rows) {
				if (row.url !== '' && row.url !== undefined) {
					_stickers[row.name] = row.url
				} else {
					_stickers[row.name] = row.file
				}
			}
		})
	})
	.catch((error) => { kuro.error(error) })
}

exports.run = function(msg, args) {
	_msg = msg

	if (!(args instanceof Array)) {
		if (_stickers.hasOwnProperty(args)) return this.sendSticker(args)
		return _msg.delete()
	}

	let newargs = []
	for (let i = 1; i < args.length; i++) {
		newargs.push(args[i])
	}

	// Subcommand?
	if (args[0] === 'add') return this.add(newargs)
	if (args[0] === 'del') return this.del(newargs)
	if (args[0] === 'ren') return this.ren(newargs)
	if (args[0] === 'list') return this.list()
	if (args[0] === 'migrate') return this.migrate()

	// Not a subcommand, let's see if it's a sticker
	if (_stickers.hasOwnProperty(args[0])) return this.sendSticker(args[0])

	// Ded
	_msg.delete()
}

exports.sendSticker = function(name) {
	if (_stickers[name].startsWith('http')) {
		_msg.edit({
			embed: {
				image: { url: _stickers[name] },
				color: 3290683
			}
		});
	} else {
		let file = `${assets}/${_stickers[name]}`
		fs.access(file, fs.constants.R_OK, (err) => {
			if (err) return _msg.edit(`**Error:**\n${err}`)

			_msg.delete()
			let img = fs.readFileSync(file)
			return _msg.channel.sendFile(img, _stickers[name])
		})
	}
}

exports.add = function(args) {
	if (args[0] === undefined) {
		kuro.edit(_msg, 'No name provided.')
		return
	}

	let name = args[0]

	// Is the name of the sticker already used?
	if (_stickers.hasOwnProperty(name)) {
		kuro.edit(_msg, 'Name already in use.')
		return
	}

	// Prepare the destination container
	let dest = `${assets}/${name}`
	let url = ''

	// Stupid discord renaming stuff, breaks everything
	let discordFilename = ''
	if (args[1] !== undefined) {
		url = args[1]
	} else {
		if (typeof _msg.attachments.first() !== 'undefined') {
			if ('proxyURL' in _msg.attachments.first()) {
				url = _msg.attachments.first().proxyURL
				discordFilename = _msg.attachments.first().filename
			}
		}
	}

	if (url === '') {
		// Welp, couldn't figure out a url
		kuro.edit(_msg, 'You didnt supply either a url nor attachment, or there was an error with the attachment.')
		return
	}

	// Try and gather the extension of the file
	let re = /(?:\.([^.]+))?$/
	let ext = re.exec(url)[1]

	if (discordFilename !== '') {
		ext = re.exec(discordFilename)[1]
	}

	if (ext === undefined) {
		kuro.edit(_msg, 'The file you are linking or trying to attach doesn\'t have an extension. Kuro needs that thingy. pls fam')
		return
	}

	dest = `${dest}.${ext}`
	this.downloadImage(name, url, dest, ext)
}

exports.del = function(args) {
	if (args[0] === undefined) return kuro.edit(_msg, 'No name provided.')

	if (args[0] in _stickers) {
		kuro.db.table(_table)
			.where('name', args[0])
			.del()
			.then(() => {
				delete (_stickers[args[0]])
				return kuro.edit(_msg, 'The sticker was removed.', 1000)
			})
			.catch((e) => { kuro.edit(_msg, `Error: \n${e}`, 0) })
	} else {
		return kuro.edit(_msg, 'There is no sticker by that name.')
	}
}

exports.ren = function(args) {
	if (args[0] === undefined) return kuro.edit(_msg, 'No source sticker supplied.')
	if (args[1] === undefined) return kuro.edit(_msg, 'No destination sticker supplied.')

	if (args[0] in _stickers) {
		kuro.db.table(_table)
			.where('name', args[0])
			.update({ name: args[1] })
			.then(() => {
				_stickers[args[1]] = _stickers[args[0]]
				delete (_stickers[args[0]])
				return kuro.edit(_msg, 'Sticker renamed.', 1000)
			})
			.catch((e) => { kuro.edit(_msg, `Error: \n${e}`, 0) })
	} else {
		return kuro.edit(_msg, 'There is no sticker by that name.')
	}
}

exports.list = function() {
	let list = ''
	for (let sticker in _stickers) {
		if ({}.hasOwnProperty.call(_stickers, sticker)) {
			list = `${list}${sticker}, `
		}
	}

	list = list.substr(0, list.length - 2)
	return kuro.edit(_msg, `**__Stickers list__**\n\`\`\`\n${list}\n\`\`\``, 10000)
}


exports.downloadImage = function(name, url, dest, ext) {
	let saveFile = require('request')
		.get(url)
		.on('error', (err) => {
			kuro.log(err)
			_msg.edit(`***Error:*** ${err}`)
		})
		.pipe(fs.createWriteStream(dest))

	saveFile.on('finish', () => {
		this.uploadImage(name, dest, ext)
	})
}

exports.uploadImage = function(name, dest, ext) {
	const fd = new FormData()

	fd.append('files[]', fs.createReadStream(dest))
	fd.pipe(concat({ encoding: 'buffer' }, data => {
		axios.post('https://safe.moe/api/upload', data, { headers: fd.getHeaders() })
		.then((response) => {
			if (response.data.success === false) {
				console.error('Error uploading to safe.moe: ', response.description)
				kuro.error('Error saving sticker. Check logs')
				return this.saveStickerToDB(name, ext, '')
			}

			return this.saveStickerToDB(name, ext, response.data.files[0].url)
		})
		.catch((err) => console.log(err))
	}))
}

exports.saveStickerToDB = function(name, ext, url) {
	kuro.db.table(_table).insert({
		name: name,
		file: `${name}.${ext}`,
		url: url
	})
	.then(() => {
		_stickers[name] = `${name}.${ext}`
		if (url !== '') _stickers[name] = url
		kuro.edit(_msg, 'Sticker added', 1000)
	})
}

exports.migrate = function() {
	console.log('Starting migration')
	_msg.edit('*Starting migration to kuro v4.1.0, this might take a while depending how many stickers you have. Check the console.*')

	try {

		kuro.db.schema.table(_table, (table) => {
			table.string('url')
		}).then(() => {
			// Done for now
			kuro.db.table(_table).then((rows) => {
				console.log('Found ' + rows.length + ' stickers, starting the upload to safe.moe')

				let counter = 1
				for (let row of rows) {
					if (row.url === '' || row.url === undefined || row.url === null) {
						const fd = new FormData()

						fd.append('files[]', fs.createReadStream(`${assets}/${row.file}`))
						fd.pipe(concat({ encoding: 'buffer' }, data => {
							axios.post('https://safe.moe/api/upload', data, { headers: fd.getHeaders() })
							.then((response) => {
								if (response.data.success === false) {
									console.error('Error uploading to safe.moe: ', response.description)
								} else {
									kuro.db.table(_table).where('id', row.id).update(
										{ url: response.data.files[0].url }
									)
									.then(() => {
										console.log('Finished uploading ' + counter + '/' + rows.length + ': ' + row.name)
										counter++
										_stickers[row.name] = response.data.files[0].url
										if (counter > rows.length) {
											console.log('Migration finished, you can keep using Kuro like you normally would')
											_msg.edit('*Migration finished, you can keep using Kuro like you normally would*')
										}
									})
								}
							})
							.catch((err) => console.log(err))
						}))
					}
				}
			})
		})

		.catch((error) => { kuro.error(error) })
	} catch (e) {
		kuro.error(e)
	}
}

exports.stickerCount = function() {
	return Object.keys(_stickers).length
}

