exports.run = function(msg, args) {
	msg.delete()
	msg.channel.sendMessage('', {
		'embed': {
			'title': msg.guild.name,
			'description': `Member Count: ${msg.guild.memberCount}`,
			'color': 15473237
		}
	})
}