let kuro
exports.init = function(bot){ kuro = bot }

exports.run = function(msg, args) {
	let response = "";

	var code = args.join(' ')

	try {
		var evaled = eval(code)
		if (typeof evaled !== 'string')
			evaled = require('util').inspect(evaled)
		response = censor(clean(evaled));
		kuro.log(clean(evaled));
	}catch(err) {
		response = clean(err);
		kuro.error(clean(err))
	}

	msg.channel.sendMessage('xl', response);
}

function clean(text) {
	if (typeof(text) === 'string') {
		return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203))
	}
	else {
		return text
	}
}

function censor(text) {
	let re = new RegExp(kuro.config.token, "gm");

	if (!(text instanceof String)) {
		return;
	} else {
		text = text.replace(re, '[REMOVED TOKEN]');
		text = text.replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d{1,5})?/gm, '[REMOVED IP]');
		return text;
	}
}