exports.bot
exports.msg
exports.utils
exports.stickers

exports.run = function(bot, msg, args, utils) {
	
	// Create stickers.json if it doesn't exist
	require('fs').exists('./stickers.json', function(exists) { 
		if (!exists) require('fs').writeFile('./stickers.json', '{}')
	})

	//.writeFile('./stickers.json', '{}', { flag: 'wx' })
	
	this.stickers = require('../stickers.json')
	this.utils = utils
	this.msg = msg
	this.bot = bot

	let newargs  = []
	for(let i = 1; i < args.length; i++)
		newargs.push(args[i])

	if(args[0] === 'add') return this.add(newargs)
	if(args[0] === 'del') return this.del(newargs)
	if(args[0] === 'ren') return this.ren(newargs)
	if(args[0] === 'list') return this.list()
	
	if(this.stickers.hasOwnProperty(args[0])) return this.sendSticker(args[0])
	msg.delete()
}

exports.sendSticker = function(name){
	let img = require('fs').readFileSync('./stickers/' + this.stickers[name])
	this.bot.createMessage(this.msg.channel.id, '', {file: img, name: this.stickers[name]})
	this.msg.delete()
}

exports.add = function(args){
	if(args[0] === undefined){
		this.utils.edit(this.msg, 'You forgot the sticker name, dumdum')
		return
	}

	let name = args[0]

	// Is the name of the sticker already used?
	if(this.stickers.hasOwnProperty(name)){
		this.utils.edit(this.msg, 'You already used that name.')
		return
	}

	// Prepare the destination container
	let dest = './stickers/' + name
	let url = ''

	// Stupid discord renaming stuff, breaks everything
	let discordFilename = ''

	if(args[1] !== undefined)
		url = args[1]
	else
		if(this.msg.attachments.length > 0)
			if('proxy_url' in this.msg.attachments[0]){
				url = this.msg.attachments[0].proxy_url
				discordFilename = this.msg.attachments[0].filename
			}

	if(url === ''){
		// Welp, couldn't figure out a url
		this.utils.edit(this.msg, 'You didnt supply either a url nor attachment, or there was an error with the attachment.')
		return
	}

	// Try and gather the extension of the file
	let re = /(?:\.([^.]+))?$/
	let ext = re.exec(url)[1]

	if(discordFilename !== '')
		ext = re.exec(discordFilename)[1]

	if(ext === undefined){
		this.utils.edit(this.msg, 'The file you are linking or trying to attach doesn\'t have an extension. Kuro needs that thingy. pls fam')
		return
	}

	dest = dest + '.' + ext
	this.downloadImage(name, url, dest, ext)
}

exports.del = function(args){
	if(args[0] === undefined) return this.utils.edit(this.msg, 'You forgot the sticker name.')
	
	if(args[0] in this.stickers){
		delete(this.stickers[args[0]])
		let json = JSON.stringify(this.stickers, null, '\t')
		require('fs').writeFile('./stickers.json', json, 'utf8', () => {
			return this.utils.edit(this.msg, 'The sticker was removed.')
		})
	}else{
		return this.utils.edit(this.msg, 'There is no sticker by that name.')
	}
}

exports.ren = function(args){
	if(args[0] === undefined) return this.utils.edit(this.msg, 'No source sticker supplied.')
	if(args[1] === undefined) return this.utils.edit(this.msg, 'No destination sticker supplied.')
	
	if(args[0] in this.stickers){
		this.stickers[args[1]] = this.stickers[args[0]]
		delete(this.stickers[args[0]])
		let json = JSON.stringify(this.stickers, null, '\t')
		require('fs').writeFile('./stickers.json', json, 'utf8', () => {
			return this.utils.edit(this.msg, 'Sticker renamed.')
		})
	}else{
		return this.utils.edit(this.msg, 'There is no sticker by that name.')
	}
}

exports.list = function(){
	if(this.utils.conf().server.enabled === true)
		this.startServer()
	else{
		let list = ''
		for (let sticker in this.stickers)
			if ({}.hasOwnProperty.call(this.stickers, sticker))
				list = list + ' ' + sticker + '\n'

		return this.utils.edit(this.msg, '```' + list + '```', 0)
	}
}

exports.downloadImage = function(name, url, dest, ext) {
	let saveFile = require('request')
		.get(url)
		.on('error', (err) => {
			console.log(err)
			this.msg.edit(this.msg, '***Error:*** ' + err)
		})
		.pipe(require('fs').createWriteStream(dest))

	saveFile.on('finish', () => { 
		this.stickers[name] = name + '.' + ext
		let json = JSON.stringify(this.stickers, null, '\t')
		require('fs').writeFile('./stickers.json', json, 'utf8', () => {
			this.utils.edit(this.msg, 'Sticker added succesfully fam \o/')
		})

	})
}

exports.startServer = function(){}
