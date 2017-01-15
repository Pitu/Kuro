let kuro
exports.init = function(bot){ kuro = bot }

function updatePlaying() {
    if (kuro.config.lastfm.apiKey || kuro.config.lastfm.username === '') {
        let statement = `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${kuro.config.lastfm.username}&api_key=${kuro.config.lastfm.apiKey}&format=json&nowplaying=true`
        const child = require('child_process');
        child.exec(`curl -s "${statement}"`, (error, stdout, stderr) => {
            let name = JSON.parse(stdout).recenttracks.track[0].name;
            let artist = JSON.parse(stdout).recenttracks.track[0].artist['#text'];
            kuro.modules['playing'].save(`${name} by ${artist}`)
            kuro.user.setGame(`${name} by ${artist}`)
            kuro.log(`Now listening to: ${name} by ${artist}`)
        });
    }
}

exports.run = function(msg, args) {
        if (kuro.config.lastfm.enabled === true){
                kuro.log("Last.FM enabled");
                setInterval(updatePlaying, 30000);
        } else {
                kuro.log('Last.FM disabled')
        }
}
