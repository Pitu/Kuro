let kuro
exports.init = function(bot){ kuro = bot }

exports.run = function(msg, args) {
	let messagecount = parseInt(args, 10)
	msg.channel.fetchMessages({limit: 100})
		.then(messages => {
			let msg_array = messages.array()
			msg_array = msg_array.filter(m => m.author.id === kuro.user.id)
			msg_array.length = messagecount + 1
			msg_array.map(m => m.delete().catch(console.error))
		}
	)
}