exports.run = function(bot, msg, args, utils) {
	if(args.length === 0) return utils.edit(msg, 'You need to provide a file', 1000)

	try{
		require('fs').readFile(`./commands/${args}.js`, 'utf-8', function read(err, data) {
			if (err) console.error(err)
			msg.edit(`**__Overview of ${args}.js__**\n\`\`\`javascript\n${data}\n\`\`\``)
		})
	}catch(e){
		return utils.edit(msg, 'Error \n' + e)
	}

}