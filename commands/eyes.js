exports.run = function(msg) {
	msg.delete()
	msg.channel.send('👀').then(msg => {
		setTimeout(() => {
			msg.edit('<:eyes2:248874616142036992>').then(msg => {
				setTimeout(() => {
					msg.edit('👀').then(msg => {
						setTimeout(() => {
							msg.edit('<:eyes2:248874616142036992>').then(msg => {
								setTimeout(() => {
									msg.edit('👀').then(msg => {
										setTimeout(() => {
											msg.edit('<:eyes2:248874616142036992>').then(msg => {
												setTimeout(() => {
													msg.edit('👀').then(msg => {
														setTimeout(() => {
															msg.edit('<:eyes2:248874616142036992>')
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
