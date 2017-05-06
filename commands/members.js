let kuro
exports.init = function(bot) { kuro = bot }

exports.run = function(msg) {
	msg.delete()
	msg.channel.send('', {
		embed: {
			title: msg.guild.name,
			description: `Member Count: ${msg.guild.memberCount}`,
			color: kuro.config.embedColor
		}
	})
}
