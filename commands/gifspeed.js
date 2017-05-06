exports.run = function(msg, args) {
	if (!args[0]) return msg.channel.send('You need to provide a URL to a gif.')
	msg.delete()

	let speed = args[1] || 2

	require('request').get({
		url: `https://pilar.moe/aws/api/v1/gif?url=${args[0]}&speed=${speed}`,
		encoding: null
	}, (err, res, body) => { // eslint-disable-line
		try {
			let error = JSON.parse(body)
			return msg.channel.send(`**Error speeding up gif:**\n${JSON.stringify(error)}`)
		} catch (er) {
			return msg.channel.sendFile(body, 'x.gif')
		}
	})
}
