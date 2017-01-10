let kuro
exports.init = function(bot){ kuro = bot }
exports.run = function(msg, args) {
    msg.delete()
	kuro.loadCommands()
}