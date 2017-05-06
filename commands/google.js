let kuro
exports.init = function(bot) { kuro = bot }

exports.run = function(msg, args) {
	msg.delete()
	msg.channel.send('', {
		embed: {
			type: 'rich',
			title: 'Google Search',
			description: '[' + args.toString().replace(/,/g, ' ') + '](https://www.google.com/search?hl=en_US&q=' + args.toString().replace(/,/g, '+') + ')',
			color: kuro.config.embedColor
		}
	})
}
