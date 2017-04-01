exports.run = function(msg, args) {
	if (args.length === 0) return msg.delete()

	let text = args.join(' ').toLowerCase().split('')

	let message = ''
	for (let i = 0; i < text.length; i++) {
		if (text[i] === ' ') message += text[i]
		else message = `${message} :regional_indicator_${text[i]}:`
	}

	msg.edit(message)
}
