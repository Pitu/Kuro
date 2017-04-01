let kuro
exports.init = function(bot) { kuro = bot }

exports.run = function(msg) {
	let pjson = require('../package.json')

	let version = `v${pjson.version.toString()}`
	let uptime = secondsToString(process.uptime()).toString()
	let modules = Object.keys(kuro.modules).length.toString()
	let memory = `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`

	// Showing the amount of stickers to demonstrate accessing other module's information
	let stickers = kuro.modules.s.stickerCount().toString()
	let tags = kuro.modules.tag.tagsCount().toString()

	msg.edit('', {
		embed: {
			type: 'rich',
			description: '[Kurobot Stats](https://github.com/kanadeko/Kuro)',
			color: kuro.config.embedColor,
			fields: [
				{ name: '❯ Version', value: version, inline: true },
				{ name: '❯ Ram usage', value: memory, inline: true },
				{ name: '❯ Modules', value: modules, inline: true },
				{ name: '❯ Stickers', value: stickers, inline: true },
				{ name: '❯ Tags', value: tags, inline: true }
			],
			thumbnail: { url: 'https://i.imgur.com/sVVcwJd.png' },
			footer: { text: `Uptime: ${uptime}` }
		}
	})
}

function secondsToString(seconds) {
	seconds = Math.trunc(seconds)
	let numdays = Math.floor((seconds % 31536000) / 86400)
	let numhours = Math.floor(((seconds % 31536000) % 86400) / 3600)
	let numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60)
	let numseconds = (((seconds % 31536000) % 86400) % 3600) % 60
	return `${numdays} days ${numhours} hours ${numminutes} minutes ${numseconds} seconds`
}
