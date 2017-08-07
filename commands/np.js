const WebSocket = require('ws');

let kuro
let radioInfo
let ws

const Discord = require('discord.js')

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
		setTimeout(() => { this.connectWS(); }, 10000);
	});
	ws.on('error', err => {
		console.log(err)
	});
}

exports.run = function(msg) {
	const nowplaying = `${radioInfo.artist_name ? `${radioInfo.artist_name} - ` : ''}${radioInfo.song_name}`;
	const anime = radioInfo.anime_name ? `Anime: ${radioInfo.anime_name}` : '';
	const requestedBy = radioInfo.requested_by
		? /\s/g.test(radioInfo.requested_by)
		? `🎉 **${Discord.escapeMarkdown(radioInfo.requested_by)}** 🎉`
		: `Requested by: [${Discord.escapeMarkdown(radioInfo.requested_by)}](https://forum.listen.moe/u/${radioInfo.requested_by})`
		: ''; //the markdown for requested by needs to be escaped carefully to avoid escaping out the special event ** markdown
	const song = `${Discord.escapeMarkdown(nowplaying)}\n\n${Discord.escapeMarkdown(anime)}\n${requestedBy}`;

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
