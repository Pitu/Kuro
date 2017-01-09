exports.run = function(msg, args) {
	msg.delete().then(() => process.exit(1))
}