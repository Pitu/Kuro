const WebSocket = require('ws');

let kuro
let radioInfo
let ws

exports.init = function(bot) {
	kuro = bot
	this.connectWS()
}

exports.connectWS = function() {
	if (ws) ws.removeAllListeners();
	ws = new WebSocket('wss://listen.moe/api/v2/socket');
	ws.on('message', data => {
		try {
			if (data) radioInfo = JSON.parse(data);
		} catch (err) {
			console.error(err)
		}
	})
	ws.on('close', () => {
		setTimeout(() => { this.connectWS(); }, 3000);
	});
}

exports.run = function(msg) {
	const nowplaying = `${radioInfo.artist_name ? `${radioInfo.artist_name} - ` : ''}${radioInfo.song_name}`;
	const anime = radioInfo.anime_name ? `Anime: ${radioInfo.anime_name}` : '';
	const requestedBy = radioInfo.requested_by
		? /\s/g.test(radioInfo.requested_by)
		? `🎉 **${radioInfo.requested_by}** 🎉`
		: `Requested by: [${radioInfo.requested_by}](https://forum.listen.moe/u/${radioInfo.requested_by})`
		: '';
	const song = `${nowplaying}\n\n${anime}\n${requestedBy}`;

	msg.edit('', {
		embed: {
			type: 'rich',
			color: kuro.config.embedColor,
			fields: [
				{ name: 'Now playing', value: song }
			]
		}
	})
}
