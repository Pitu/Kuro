exports.run = function(bot, msg, args, utils) {
	bot.getMessages(msg.channel.id, 2)
		.then((messages) => {

			require('google-translate-api')(messages[1].content, {to: 'en'}).then(res => {
				msg.edit(`Translated from \`${res.from.language.iso}\` | ${res.text}`)
			}).catch(err => {
				console.log(err)
				msg.delete()
			})
		})
}