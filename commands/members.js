let kuro
exports.init = function(bot){ kuro = bot }

exports.run = function(msg, args) {
	msg.delete()
	msg.channel.sendMessage('', {
		'embed': {
			'title': msg.guild.name,
			'description': `Member Count: ${msg.guild.memberCount}`,
			'color': kuro.config.embedColor
		}
	})
}
