exports.run = function(msg, args) {
	msg.delete()
	msg.channel.sendMessage("```css\n>" + args.toString().replace(/,/g, ' ') + "```")
}