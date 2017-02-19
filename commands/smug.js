exports.run = function(msg, args) {
	msg.delete()

	require('request').get('http://smugs.safe.moe/api/v1/i/r', function (error, response, body) {
		if (!error && response.statusCode === 200) {
			try {
				JSON.parse(body)
			} catch (e) {
				msg.channel.sendMessage('**API Error**')
				return
			}
			let response = JSON.parse(body)
			msg.channel.sendFile('https://smugs.safe.moe/'+response.url, 'smug.jpg')
		}
	})
}
