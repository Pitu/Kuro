exports.run = function(msg) {
	msg.edit('*Loading...*')
	require('request').get('http://smugs.safe.moe/api/v1/i/r', (error, response, body) => {
		if (!error && response.statusCode === 200) {
			try {
				JSON.parse(body)
			} catch (e) {
				return msg.reply('***API ERROR***')
			}
			const resp = JSON.parse(body)
			msg.edit({
				embed: {
					image: { url: `https://smugs.safe.moe/${resp.url}` }
				}
			});
		}
	})
}
