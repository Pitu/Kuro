exports.run = function(bot, msg, args, utils) {
	msg.delete()
	bot.createMessage(msg.channel.id, '👀').then(msg => {
		setTimeout(() => {
			msg.edit('<:eyesFlipped:251594919364395028>').then(msg => {
				setTimeout(() => {
					msg.edit('👀').then(msg => {
						setTimeout(() => {
							msg.edit('<:eyesFlipped:251594919364395028>').then(msg => {
								setTimeout(() => {
									msg.edit('👀').then(msg => {
										setTimeout(() => {
											msg.edit('<:eyesFlipped:251594919364395028>').then(msg => {
												setTimeout(() => {
													msg.edit('👀').then(msg => {
														setTimeout(() => {
															msg.edit('<:eyesFlipped:251594919364395028>')
														}, 500)
													})
												}, 500)
											})
										}, 500)
									})
								}, 500)
							})
						}, 500)
					})
				}, 500)
			})
		}, 500)
	})
}