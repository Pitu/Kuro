exports.run = function(bot, msg, args, utils) {
	msg.edit('Rebooting!').then(() => {
		setTimeout(() => {
			msg.delete().then(() => process.exit(1))
		}, 500)
	})
}