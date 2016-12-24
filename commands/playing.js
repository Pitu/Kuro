exports.run = function(bot, msg, args, utils) {
	if(args.length === 0){
		bot.editStatus({})
		utils.save('playingstatus', '')
		utils.edit(msg, 'You succesfully removed your playing status.')
		return
	}

	let text = args.join(' ')
	bot.editStatus({name: text})
	utils.save('playingstatus', text)
	utils.edit(msg, 'Succesfully changed your playing status.')
}