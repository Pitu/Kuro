let kuro
let _msg
let _stickers = {}
let _table = 'stickers'
let assets = './files/stickers'
let fs

exports.init = function(bot){ 
	kuro = bot
	fs = require('fs')

	// Create sticker folder if it doesn't exist
	fs.existsSync(assets) || fs.mkdirSync(assets)

	// Create the table where we will be storing this module's data
	bot.db.schema.createTableIfNotExists(_table, function (table) {
		table.increments()
		table.string('name')
		table.string('file')
	}).then(function () {
		
		// Lets load up the existing stickers
		bot.db.table(_table).then(function(rows){
			for(let row of rows)
				_stickers[row.name] = row.file
		})

	}).catch(function(error) { kuro.error(error) })
}

exports.run = function(msg, args) {

	_msg = msg

	if(!(args instanceof Array)){
		if(_stickers.hasOwnProperty(args)) return this.sendSticker(args)
		return _msg.delete()
	}

	let newargs  = []
	for(let i = 1; i < args.length; i++)
		newargs.push(args[i])

	// Subcommand?
	if(args[0] === 'add') return this.add(newargs)
	if(args[0] === 'del') return this.del(newargs)
	if(args[0] === 'ren') return this.ren(newargs)
	if(args[0] === 'list') return this.list()
	if(args[0] === 'migrate') return this.migrate()

	// Not a subcommand, let's see if it's a sticker
	if(_stickers.hasOwnProperty(args[0])) return this.sendSticker(args[0])
	
	// Ded
	_msg.delete()
	
}

exports.sendSticker = function(name){
	
	let file = assets + '/' + _stickers[name]
	fs.access(file, fs.constants.R_OK, (err) => {
		if(err) return _msg.edit('**Error:**\n' + err)
		
		_msg.delete()
		let img = fs.readFileSync(file)
		_msg.channel.sendFile(img, _stickers[name])
	})
}

exports.add = function(args){
	if(args[0] === undefined){
		kuro.edit(_msg, 'No name provided.')
		return
	}

	let name = args[0]

	// Is the name of the sticker already used?
	if(_stickers.hasOwnProperty(name)){
		kuro.edit(_msg, 'Name already in use.')
		return
	}

	// Prepare the destination container
	let dest = assets + '/' + name
	let url = ''
	// Stupid discord renaming stuff, breaks everything
	let discordFilename = ''
	if(args[1] !== undefined)
		url = args[1]
	else
		if( typeof _msg.attachments.first() !== 'undefined'){
			if('proxyURL' in _msg.attachments.first())
				url = _msg.attachments.first().proxyURL
				discordFilename = _msg.attachments.first().filename
			}

	if(url === ''){
		// Welp, couldn't figure out a url
		kuro.edit(_msg, 'You didnt supply either a url nor attachment, or there was an error with the attachment.')
		return
	}

	// Try and gather the extension of the file
	let re = /(?:\.([^.]+))?$/
	let ext = re.exec(url)[1]

	if(discordFilename !== '')
		ext = re.exec(discordFilename)[1]

	if(ext === undefined){
		kuro.edit(_msg, 'The file you are linking or trying to attach doesn\'t have an extension. Kuro needs that thingy. pls fam')
		return
	}

	dest = dest + '.' + ext
	this.downloadImage(name, url, dest, ext)
}

exports.del = function(args){
	if(args[0] === undefined) return kuro.edit(_msg, 'No name provided.')
	
	if(args[0] in _stickers){
		kuro.db.table(_table).where('name', args[0]).del().then(function(){
			delete(_stickers[args[0]])
			return kuro.edit(_msg, 'The sticker was removed.', 1000)
		}).catch(function(e){ kuro.edit(_msg, 'Error: \n' + e, 0)})
	}else{
		return kuro.edit(_msg, 'There is no sticker by that name.')
	}
}

exports.ren = function(args){
	if(args[0] === undefined) return kuro.edit(_msg, 'No source sticker supplied.')
	if(args[1] === undefined) return kuro.edit(_msg, 'No destination sticker supplied.')
	
	if(args[0] in _stickers){
		
		kuro.db.table(_table).where('name', args[0]).update({
			name: args[1]
		}).then(function(){
			_stickers[args[1]] = _stickers[args[0]]
			delete(_stickers[args[0]])
			return kuro.edit(_msg, 'Sticker renamed.', 1000)
		}).catch(function(e){ kuro.edit(_msg, 'Error: \n' + e, 0)})

	}else{
		return kuro.edit(_msg, 'There is no sticker by that name.')
	}
}

exports.list = function(){
	if(kuro.config.server.enabled === true)
		this.startServer()
	else{
		let list = ''
		for (let sticker in _stickers)
			if ({}.hasOwnProperty.call(_stickers, sticker))
				list = list + sticker + ', '

		list = list.substr(0, list.length - 2)
		return kuro.edit(_msg, `**__Stickers list__**\n\`\`\`\n${list}\n\`\`\``, 10000)
	}
}

exports.downloadImage = function(name, url, dest, ext) {
	let saveFile = require('request')
		.get(url)
		.on('error', (err) => {
			kuro.log(err)
			_msg.edit('***Error:*** ' + err)
		})
		.pipe(fs.createWriteStream(dest))

	saveFile.on('finish', () => { 
		kuro.db.table(_table).insert({
			name: name,
			file: name + '.' + ext
		}).then(function(){
			_stickers[name] = name + '.' + ext
			kuro.edit(_msg, 'Sticker added', 1000)
		}).catch(function(e){ kuro.edit(_msg, 'Error: \n' + e, 0)})
	})
}

exports.migrate = function(){

	try{
		let oldfolder = './stickers'
		let newfolder = assets

		const fs = require('fs')

		if(!fs.existsSync(oldfolder)) return kuro.edit(_msg, 'There doesn\'t seem to be an old sticker folder')

		fs.readdir(oldfolder, (err, files) => {
			files.forEach(file => {
				
				// Seems we found some files. Let's asume they are stickers :araragi:
				let name = file.slice(0, -4)

				// Is the name of the sticker already used?
				if(!_stickers.hasOwnProperty(name)){

					copyFile(oldfolder + '/' + file, newfolder + '/' + file)

					kuro.db.table(_table).insert({
						name: name,
						file: file
					}).then(function(){
						_stickers[name] = file
						kuro.log('Migrated ' + file)
					}).catch((e) => kuro.error(e))	
				}

			})
		})

		_msg.edit('Migration finished. Check console for logs.')

	}catch(e){
		kuro.error(e)
	}
}

exports.stickerCount = function(){
	return Object.keys(_stickers).length
}

exports.startServer = function(){}

function copyFile(source, target) {
	var cbCalled = false

	var rd = fs.createReadStream(source)
	rd.on('error', function(err) {
		done(err)
	})
	var wr = fs.createWriteStream(target)
	wr.on('error', function(err) {
		done(err)
	})
	wr.on('close', function(ex) {
		done()
	})
	rd.pipe(wr)

	function done(err) {
		if (!cbCalled) {
			if(err) kuro.error(err)
			cbCalled = true
		}
	}
}

