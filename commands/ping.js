exports.run = function(msg, args) {
	msg.delete()
	msg.channel.sendMessage('Ping?')
	.then(message => {
		message.edit(`Pong! (took: ${message.timestamp - msg.timestamp}ms)`)
	})
}