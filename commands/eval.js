let kuro
exports.init = function(bot) { kuro = bot }

exports.run = function(msg, args) {
	var code = args.join(' ')

	try {
		var evaled = eval(code)
		if (typeof evaled !== 'string') {
			evaled = require('util').inspect(evaled, { depth: 0 })
		}
		msg.edit(msg.content + '\n```js\n' + clean(evaled) + '\n```')
	} catch (err) {
		msg.edit(msg.content + '\n```css\nERROR:\n' + clean(err) + '\n```')
		kuro.error(clean(err))
	}
}

function clean(text) {
	if (typeof (text) === 'string') {
		return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203))
	} else {
		return text
	}
}
