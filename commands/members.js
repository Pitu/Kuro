exports.run = function(bot, msg, args, utils) {
	bot.createMessage(msg.channel.id, {
		'embed': {
			'title': msg.guild.name,
			'description': `Member Count: ${msg.guild.memberCount}`,
			'color': 15473237
		}
	})
	msg.delete()
}