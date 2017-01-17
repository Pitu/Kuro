let kuro
let _config = require('.././files/lastfm.js')
let request = require('request');
const currentSong = {'name': '', 'artist': ''};
exports.init = function(bot) {
        if (_config.enabled === true)
        {
                if (_config.username != '' || _config.username != null)
                {
                        if (_config.apiKey != '' || _config.apiKey != null)
                        {
                                kuro.log('Last.FM enabled and running!')
                                setInterval(updatePlaying, _config.refresh);
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

function updatePlaying(_msg) {
        let statement = `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${_config.username}&api_key=${_config.apiKey}&format=json&nowplaying=true`
        request(statement, function(error, response, body) {
                if (!error && response.statusCode === 200)
                {
                        currentSong.name == JSON.parse(response).recenttracks.track[0].name;
                        currentSong.artist == KSON.parse(response).recenttracks.track[0].artist['#test'];
                        if (currentSong.name)
                        {
                                if (currentSong.artist)
                                {
                                        kuro.modules['playing'].save(`${currentSong.name} by ${currentSong.artist}`)
                                } else {
                                        _msg.edit(`Unble to get artist`)
                                        kuro.log(`Unable to get artist`)
                                }
                        } else {
                                _msg.edit(`Unable to get song name`)
                                kuro.log(`Unable to get song name`)
                        }
                } else {
                        _msg.edit(`ERROR: Response Code ${response.statusCode}`);
                        kuro.log(`Last.FM Respone code ${response.statusCode}`)
                        kuro.log(error)
                }
        });
}



exports.run = function(msg, args) {
        updatePlaying(msg)
        msg.edit(`I am currently listening to "${currentSong.name}" by ${currentSong.artist}`);
}
