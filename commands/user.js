let kuro
exports.init = function(bot){ kuro = bot }

exports.run = function(msg, args) {

	if(!args[0]) return kuro.edit()
	let user = args[0]

}