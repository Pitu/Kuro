let kuro
exports.init = function(bot){ kuro = bot }

exports.run = function(msg, args) {
	
	let pjson = require('../package.json')
	
	let version = pjson.version.toString()
	let uptime = secondsToString(process.uptime()).toString()
	let modules = Object.keys(kuro.modules).length.toString() //0 // kuro.utils.moduleCount.toString()
	
	// Showing the amount of stickers to demonstrate accessing other module's information
	let stickers = kuro.modules.s.stickerCount().toString()
	let tags = kuro.modules.tags.tagsCount().toString()

	msg.edit('', {
		'embed': {
			'type': 'rich',
			'title': 'Kuro Bot',
			'url': 'https://github.com/kanadeko/Kuro',
			'description': 'Kuro is an easy to use, modular and super easy to extend self-bot for people to tinker with.\nIt\'s main purpose is to provide an interface to manage Telegram-like stickers and tags. ',
			'color': 15473237,
			'fields': [
				{ 'name': 'Version', 'value': version, 'inline': true },
				{ 'name': 'Modules', 'value': modules, 'inline': true },
				{ 'name': 'Stickers', 'value': stickers, 'inline': true },
				{ 'name': 'Tags', 'value': tags, 'inline': true }
			],
			'thumbnail': {
				'url': 'https://i.imgur.com/sVVcwJd.png'
			},
			'author':{
				'name': 'kanadeko',
				'url': 'https://github.com/kanadeko',
				'icon_url': 'https://avatars2.githubusercontent.com/u/22165145?v=3&s=40'
			},
			'footer':{
				'text': 'Uptime: ' + uptime
			}
		}
	})

}

function secondsToString(seconds){
	seconds = Math.trunc(seconds)
	let numdays = Math.floor((seconds % 31536000) / 86400)
	let numhours = Math.floor(((seconds % 31536000) % 86400) / 3600)
	let numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60)
	let numseconds = (((seconds % 31536000) % 86400) % 3600) % 60
	return numdays + ' days ' + numhours + ' hours ' + numminutes + ' minutes ' + numseconds + ' seconds'
}