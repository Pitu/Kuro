exports.run = function(bot, msg, args, utils) {
	msg.delete()
	msg.channel.createMessage('Ping?')
	.then(message => {
		message.edit(`Pong! (took: ${message.timestamp - msg.timestamp}ms)`)
	})
}