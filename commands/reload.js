let kuro
exports.init = function(bot) { kuro = bot }
exports.run = function(msg) {
	msg.delete()
	kuro.loadCommands()
}
