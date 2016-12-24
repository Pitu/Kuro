exports.run = function(bot, msg, args, utils) {
	let msgCount = parseInt(args, 10)
	bot.getMessages(msg.channel.id, 100)
		.then((messages) => {
			let filtered = messages.filter(m => m.author.id === bot.user.id)
			filtered.length = msgCount + 1
			filtered.map((mesg) => mesg.delete())
		})
}