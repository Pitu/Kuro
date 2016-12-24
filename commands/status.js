exports.run = function(bot, msg, args, utils) {
	if(args.length === 0) return utils.edit(msg, 'Your offline status is: ' + msg.member.status)

	if(args[0] !== 'idle' && args[0] !== 'online' && args[0] !== 'dnd' && args[0] !== 'invisible')
		return utils.edit(msg, 'Wrong option. You need to specify idle|online|dnd|invisible')

	utils.save('offlinestatus', args[0])
	bot.editStatus(args[0])
	
	return utils.edit(msg, 'Next time you are offline your status will be set to: ' + args[0])
}