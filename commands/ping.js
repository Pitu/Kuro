exports.run = function(msg) {
	msg.delete()
	msg.channel.sendMessage('Ping?')
	.then(message => {
		message.edit(`Pong! (took: ${message.createdTimestamp - msg.createdTimestamp}ms)`)
	})
}
