let kuro
let config = require('.././files/lastfm.js')
const currentSong = {'name': '', 'artist': ''};
exports.init = function(bot) {
        if (config.enabled === true)
        {
                if (config.username != '' || config.username != null)
                {
                        if (config.apiKey != '' || config.apiKey != null)
                        {
                                kuro.log('Last.FM enabled and running!')
                                setInterval(updatePlaying, config.refresh);
                        } else {
                                kuro.log('Invalid Last.FM API key!')
                        }
                } else {
                        kuro.log('Invalid Last.FM Username!')
                }
        } else {
                kuro.log('Last.FM not enabled!')
        }
}

function updatePlaying() {
    let statement = `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${config.username}&api_key=${config.apiKey}&format=json&nowplaying=true`
    const child = require('child_process');
    child.exec(`curl -s "${statement}"`, (error, stdout, stderr) => {
        currentSong.name = JSON.parse(stdout).recenttracks.track[0].name;
        currentSong.artist = JSON.parse(stdout).recenttracks.track[0].artist['#text'];
        kuro.modules['playing'].save(`${currentSong.name} by ${currentSong.artist}`)
        kuro.user.setGame(`${currentSong.name} by ${currentSong.artist}`)
    });
}


exports.run = function(msg, args) {
        updatePlaying()
        msg.edit(`I am currently listening to "${currentSong.name}" by ${currentSong.artist}`);
}
