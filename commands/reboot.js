exports.run = function(msg) {
	msg.delete().then(() => process.exit(1))
}
