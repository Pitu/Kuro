let kuro
exports.init = function(bot) { kuro = bot }

exports.run = function(msg, args) {
	if (args.length === 0) return kuro.edit(msg, 'You need to provide a file', 1000)

	try {
		require('fs').readFile(`./commands/${args}.js`, 'utf-8', (err, data) => {
			if (err) return kuro.error(err)
			return msg.edit(`**__Overview of ${args}.js__**\n\`\`\`javascript\n${data}\n\`\`\``)
		})
	} catch (err) {
		kuro.error(err)
		return kuro.edit(msg, `Error \n${err}`)
	}
}
