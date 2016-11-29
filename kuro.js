// Modules
let Eris        = require('eris');
let fs          = require('fs');
let express     = require('express');
let request     = require('request');
let parseString = require('xml2js').parseString;

// Config
let _config     = require('./config.json');

// Stickers
let _stickers   = require('./stickers.json');

// Stuff
let stickerServer;
let commands = {};

// Declaring Kuro
let kuro = new Eris.CommandClient(_config.token, { userAccount: true }, {
    description: 'Best selfbot',
    owner: _config.owner,
    prefix: '',
    ignoreSelf: false,
    defaultHelpCommand: false,
    defaultCommandOptions: {
        requirements: {
            'userIDs': [_config.userID]
        }
    }
});

// When ready
kuro.on('ready', () => {

    if(_config.offlinestatus !== ''){
        log('Setting offline status to: ' + _config.offlinestatus);
        kuro.editStatus(_config.offlinestatus);
    }

    if(_config.playingstatus !== ''){
        log('Setting game status to: ' + _config.playingstatus);
        kuro.editStatus({name: _config.playingstatus});
    }

    log('Ready!');
});

kuro.on('messageCreate', function(msg){

    // Ignore if the message is not ours
    if (msg.author.id !== _config.userID) return;

    // Ignore if the message doesn't start with our prefix
    if (!msg.content.startsWith(_config.prefix)) return;

    // Ignore if empty command
    if (msg.content.length === _config.prefix.length) return;

    // Get all the arguments
    let tmp = msg.content.substring(_config.prefix.length, msg.length).split(' ');
    let args = [];

    for(let i = 1; i < tmp.length; i++)
        args.push(tmp[i]);

    // Store the command separately
    let cmd = tmp[0];

    // Does the cmd exist as a function?
    if(commands.hasOwnProperty(cmd)){
        commands[cmd](msg, args);
    }else{
        // If it doesnt, is it a sticker?
        if(_stickers.hasOwnProperty(cmd))
            sendSticker(msg, cmd);
        else
            if(_config.stickererror === true)
                kuro.return('edit', 'That sticker doesnt exist. rip', msg);
    }

});

// Manage Kuro's response
kuro.return = function(type, message, msg, timeout){
    if(type === undefined) return;

    if(type === 'edit')
        kuro.editMessage(msg.channel.id, msg.id, message).then(() => delMessage(msg, timeout));
    else if(type === 'create')
        kuro.createMessage(msg.channel.id, message).then((newmsg) => delMessage(newmsg, timeout));
};

/*
    Usage: !add _name_ attachment|_url_
    Kuro will try to upload a new sticker to stickers.json. She will either try
    to parse the url from a given string and if there is none try to get the
    public link of an attached file.
*/
commands.add = function(msg, args){

    // Treat this as the name of the new sticker. Return error if name wasnt provided
    if(args[0] === undefined){
        kuro.return('edit', 'You forgot the sticker name, dumdum', msg);
        return;
    }

    let name = args[0];

    // Is the name of the sticker already used?
    if(_stickers.hasOwnProperty(name)){
        kuro.return('edit', 'You already used that name.', msg);
        return;
    }

    // Prepare the destination container
    let dest = './stickers/' + name;
    let url = '';

    // Stupid discord renaming stuff, breaks everything
    let discordFilename = '';

    if(args[1] !== undefined)
        url = args[1];
    else
        if(msg.attachments.length > 0)
            if('proxy_url' in msg.attachments[0]){
                url = msg.attachments[0].proxy_url;
                discordFilename = msg.attachments[0].filename;
            }

    if(url === ''){
        // Welp, couldn't figure out a url
        kuro.return('edit', 'You didnt supply either a url nor attachment, or there was an error with the attachment.', msg);
        return;
    }

    // Try and gather the extension of the file
    let re = /(?:\.([^.]+))?$/;
    let ext;

    if(discordFilename !== '')
        ext = re.exec(discordFilename)[1];
    else
        ext = re.exec(url)[1];

    if(ext === undefined){
        kuro.return('edit', 'The file you are linking or trying to attach doesn\'t have an extension. Kuro needs that thingy. pls fam', msg);
        return;
    }

    dest = dest + '.' + ext;
    downloadImage(name, url, dest, ext, msg);
};

/*
    Usage: !del _name_
    Kuro will try to delete a sticker by that name on stickers.json
*/
commands.del = function(msg, args){
    if(args[0] !== undefined)
        delSticker(args[0], msg);
};

/*
    Usage: /sticker list
    Kuro will list all the stickers in stickers.json
*/
commands.list = function(msg, args){

    /*
        Depending on the configuration specified, we either return a list
        of all the stickers or launch a http server trying to grab the
        external ip of the computer the script is running on.
    */

    if(_config.server.enabled === true)
        startServer(msg);
    else{
        let list = '';

        for (let sticker in _stickers)
            if ({}.hasOwnProperty.call(_stickers, sticker))
                list = list + ' ' + sticker + '\n';

        //for(let sticker in _stickers)
            //list = list + ' ' + sticker + '\n';

        kuro.return('edit', '```' + list + '```', msg, 5000);
    }
};

/*
    Usage: !purge _number_
    Kuro will get the last _number_ messages from the channel where the command
    was triggered.
*/
commands.purge = function(msg, args){
    let msgCount = parseInt(args, 10);
    kuro.getMessages(msg.channel.id, 100)
        .then((messages) => {
            let filtered = messages.filter(m => m.author.id === kuro.user.id);
            filtered.length = msgCount + 1;
            filtered.map((msg) => delMessage(msg, 0));
        });
};

/*
    Usage: !status online|idle|dnd|offline
    Since this is a self bot, even if you close Discord you remain connected through
    Kuro. This command will enable you to set the status of your account whenever
    you're not on the app. So if you want to appear as 'Busy' whenever you're offline
    you can just /status dnd
*/
commands.status = function(msg, args){

    if(args.length === 0){
        kuro.return('edit', 'Your offline status is: ' + msg.member.status, msg);
        return;
    }

    if(args[0] !== 'idle' && args[0] !== 'online' && args[0] !== 'dnd' && args[0] !== 'invisible'){
        kuro.return('edit', 'Wrong option. You need to specify idle|online|dnd|invisible', msg);
        return;
    }

    kuro.editStatus(args[0]);
    saveConfig('offlinestatus', args[0]);
    kuro.return('edit', 'Next time you are offline your status will be set to: ' + args[0], msg);

};

/*
    Usage: !playing string
    It will change the 'Playing' status below the users name to the string
    entered above. Note that you won't be able to see the status but everyone
    else will, this is a limitation with discord itself and not the bot.
*/
commands.playing = function(msg, args){
    if(args.length === 0){
        kuro.editStatus({});
        saveConfig('playingstatus', '');
        kuro.return('edit', 'You succesfully removed your playing status', msg);
        return;
    }

    let text = args.join(' ');
    kuro.editStatus({name: text});
    saveConfig('playingstatus', text);
    kuro.return('edit', 'Succesfully changed your playing status o7', msg);
};

/*
    Usage: !regional string
    Kuro will try to spell your string using regional indicators, just
    for the sake of being annoying.
*/
commands.regional = function(msg, args){
    if(args.length === 0){
        kuro.editStatus({});
        kuro.return('edit', 'You gotta write a message honey', msg);
        return;
    }

    let text = args.join(' ').toLowerCase().split('');
    let message = getRegionalIndicators(text);
    kuro.editMessage(msg.channel.id, msg.id, message);
};

/*
    Usage: !react string
    Kuro will try to react to the last post with regional indicators for the
    sake of being super annoying.
*/
commands.react = function(msg, args){

    kuro.getMessages(msg.channel.id, 2).then((msgArray) => {
        delMessage(msg, 0);
        let unicode = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯', '🇰', '🇱', '🇲', '🇳', '🇴', '🇵', '🇶', '🇷', '🇸', '🇹', '🇺', '🇻', '🇼', '🇽', '🇾', '🇿', '0⃣', '1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣'];
        let alpha = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

        let chars = args.join('').toLowerCase().split('');
        let int = 0;
        (function loop() {
            msgArray[1].addReaction(unicode[alpha.indexOf(chars[int])]).then(() => {
                int++;
                if (chars.length !== int) {
                    loop();
                }
            });
        }());
    });

};

/*
    Usage: !reactions
    This is super fucking annoying, don't use please.
    Gets a list of all the server emotes, scrambles them and picks 20 to react
    to the last message on the chat.
*/
commands.reactions = function(msg, args){
    kuro.getMessages(msg.channel.id, 2).then((msgArray) => {

        delMessage(msg, 0);
        msg.guild.getEmojis().then((emojis) => {
            emojis.shuffle();
            for( let i = 0; i < emojis.length; i++ )
                if(i < 19)
                    msgArray[1].addReaction(emojis[i].name + ':' + emojis[i].id);
        });

    });
};

commands.eyes = function(msg, args){
    delMessage(msg, 0);
    kuro.createMessage(msg.channel.id, '👀').then(msg => {
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
                                                            msg.edit('<:eyesFlipped:251594919364395028>');
                                                        }, 500);
                                                    });
                                                }, 500);
                                            });
                                        }, 500);
                                    });
                                }, 500);
                            });
                        }, 500);
                    });
                }, 500);
            });
        }, 500);
    });
};

commands.mal = function(msg, args){
    
    kuro.editMessage(msg.channel.id, msg.id, 'Loading...');

    let username = _config.MALusername;
    if(args.length !== 0) username = args[0]

    request(`https://myanimelist.net/malappinfo.php?&status=all&type=anime&u=${username}`, (err, res, body) => {
        if(!err){
            parseString(body, function (err, result) {

                if(!err){
                    
                    try{

                        let id = result.myanimelist.myinfo[0].user_id[0];
                        let img = `https://myanimelist.cdn-dena.com/images/userimages/${id}.jpg`

                        kuro.editMessage(msg.channel.id, msg.id, {
                            "embed": {
                                "type": "rich",
                                "title": username + '\'s MyAnimeList Summary',
                                "url": 'https://myanimelist.net/animelist/' + username,
                                "description": "This user has spent " + result.myanimelist.myinfo[0].user_days_spent_watching[0] + " days watching anime, SUGOI!",
                                "color": 3035554,
                                "fields": [
                                    { "name": 'Watching', "value": result.myanimelist.myinfo[0].user_watching[0], "inline": true },
                                    { "name": 'Completed', "value": result.myanimelist.myinfo[0].user_completed[0], "inline": true },
                                    { "name": 'On Hold', "value": result.myanimelist.myinfo[0].user_onhold[0], "inline": true },
                                    { "name": 'Dropped', "value": result.myanimelist.myinfo[0].user_dropped[0], "inline": true },
                                    { "name": 'Plan to Watch', "value": result.myanimelist.myinfo[0].user_plantowatch[0], "inline": true }
                                ],
                                "thumbnail": {
                                    "url": img
                                }
                            }
                        });

                    }catch(e){
                        delMessage(msg, 0);
                    }
                }
            });
        }
    });
}

let sendSticker = function(msg, name){
    let img = fs.readFileSync('stickers/' + _stickers[name]);
    kuro.editMessage(msg.channel.id, msg.id, 'Loading...');
    kuro.createMessage(msg.channel.id, '', {file: img, name: _stickers[name]}).then(() => delMessage(msg, 0));
};


/* HELPER FUNCTIONS */
let startServer = function(msg){

    // Can we get an external IP?
    getExternalIP((err, body) => {
        if (!err) {

            // This is such a bad approach. DELET DIS
            fs.writeFileSync('./public/stickers.json', fs.readFileSync('./stickers.json'));

            let openMessage = 'To view your sticker list go to http://' + body + ':' + _config.server.port + ' for the next ' + _config.server.duration + ' minutes.';

            if(stickerServer !== undefined){
                kuro.return('edit', openMessage, msg, 5000);
                return;
            }

            let server = express();
            server.use(express.static('public'));
            server.use(express.static('stickers'));
            stickerServer = server.listen(_config.server.port);

            setTimeout( () => { stickerServer.close(); stickerServer = undefined; }, (_config.server.duration * 60 * 1000));
            kuro.return('edit', openMessage, msg, 5000);
        } else {
            kuro.return('edit', 'Unfortunately we couldnt get your external IP.', msg);
        }
    });

};

let delMessage = function(msg, delay){
    if (typeof delay === 'undefined' || delay === null)
        delay = 3000;
    setTimeout( () => msg.delete(), delay);
};

let addNewSticker = function(name, ext, msg){
    _stickers[name] = name + '.' + ext;
    let json = JSON.stringify(_stickers, null, '\t');
    fs.writeFile('stickers.json', json, 'utf8', function(){
        delMessage(msg, 0);
        kuro.return('create', 'Sticker added succesfully fam \o/', msg);
    });
};

let delSticker = function(name, msg){
    if(name in _stickers){
        delete(_stickers[name]);
        let json = JSON.stringify(_stickers, null, '\t');
        fs.writeFile('stickers.json', json, 'utf8', function(){
            kuro.return('edit', 'The sticker was removed o7', msg);
        });
    }else{
        kuro.return('edit', 'There is no sticker by that name, you wonderful person.', msg);
    }
};

let downloadImage = function(name, url, dest, ext, msg) {

    let saveFile = request
        .get(url)
        .on('error', function(err) {
            console.log(err);
            kuro.return('edit', '***Error:*** ' + err, msg);
        })
        .pipe(fs.createWriteStream(dest));

    saveFile.on('finish', () => { addNewSticker(name, ext, msg); });

};

function getRegionalIndicators(text){
    let message = '';
    for(let i = 0; i < text.length; i++)
        if(text[i] === ' ')
            message = message + text[i];
        else
            message = message + ':regional_indicator_' + text[i] + ':';

    return message;
}

function getExternalIP (callback) {
    if(_config.server.islocal === false){
        request('http://wtfismyip.com/text', (err, res, body) => {
            if(err) return callback('error');

            body = body.toString().trim();
            if(/^(?:(?:2[0-4]\d|25[0-5]|1\d{2}|[1-9]?\d)\.){3}(?:2[0-4]\d|25[0-5]|1\d{2}|[1-9]?\d)$/.test(body))
                return callback(null, body);
        });
    }else{
        return callback(null, '127.0.0.1');
    }
}

function saveConfig(param, value){
    _config[param] = value;
    let json = JSON.stringify(_config, null, '\t');
    fs.writeFile('config.json', json, 'utf8');
}

Array.prototype.shuffle = function() {
    let i = this.length, j, temp;
    if ( i === 0 ) return this;
    while ( --i ) {
        j = Math.floor( Math.random() * ( i + 1 ) );
        temp = this[i];
        this[i] = this[j];
        this[j] = temp;
    }
    return this;
};

function log(msg){
    console.log('[Kuro]: ' + msg);
}

log('Starting...');
kuro.connect();
