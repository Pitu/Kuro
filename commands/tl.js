let kuro
exports.init = function(bot) { kuro = bot }

exports.run = function(msg) {
	msg.channel.fetchMessages({ limit: 2 })
		.then((messages) => {
			messages = messages.array()
			require('google-translate-api')(messages[1].content, { to: 'en' }).then(res => {
				msg.edit(`Translated from \`${res.from.language.iso}\` | ${res.text}`)
			}).catch(err => {
				kuro.log(err)
				msg.delete()
			})
		})
		.catch(e => kuro.error(e))
}
