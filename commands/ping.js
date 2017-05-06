exports.run = function(msg) {
	msg.delete()
	msg.channel.send('Ping?')
	.then(message => {
		message.edit(`Pong! (took: ${message.createdTimestamp - msg.createdTimestamp}ms)`)
	})
}
