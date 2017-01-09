exports.run = function(msg, args) {
	msg.delete()
	msg.channel.sendMessage('👀').then(msg => {
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