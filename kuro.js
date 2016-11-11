let Eris        = require('eris');
let reload      = require('require-reload')(require);
let http        = require('http');
let https       = require('https');
let fs          = require('fs');
let _config     = require('./config.json');
let express     = require('express');
let request     = require('request');

let _stickers;
let stickerServer;

try {
    _stickers = reload('./stickers.json');
} catch (e) {
    _stickers = {};
    let json = JSON.stringify(_stickers);
    fs.writeFile('stickers.json', json, 'utf8', function(){
        reloadStickers();
    });
}

let kuro = new Eris.CommandClient(_config.token, { userAccount: true }, {
    description: 'A nice selfbot built in eris',
    owner: _config.owner,
    prefix: '/',
    ignoreSelf: false,
    defaultHelpCommand: false,
    defaultCommandOptions: {
        requirements: {
            'userIDs': [_config.userID]
        }
    }
});

kuro.on('ready', () => {
    console.log('[Kuro]: Ready!');
});

/*
    Usage: /sticker add _name_ attachment|_url_
    Kuro will try to upload a new sticker to stickers.json. She will either try
    to parse the url from a given string and if there is none try to get the
    public link of an attached file.

    Usage: /sticker del _name_
    Kuro will try to delete a sticker by that name on stickers.json

    Usage: /sticker list
    Kuro will list all the stickers in stickers.json

    Usage: /sticker _name_
    Kuro will try to map _file_ to an existing image through stickers.json and
    then upload said image. After it's done, she will delete the message that
    triggered the command.
*/

kuro.registerCommand('sticker', (msg, args) => {

    if(args.length === 0)
        return;

    let command = args[0];
    if (command.toString().trim() === 'add'){

        // Treat this as the name of the new sticker. Return error if name wasnt provided
        if(args[1] === undefined){
            kuro.editMessage(msg.channel.id, msg.id, 'You forgot the sticker name, dumdum').then(() => delMessage(msg));
            return;
        }

        let name = args[1];

        // Is the name of the sticker already used?
        if(name in _stickers){
            kuro.editMessage(msg.channel.id, msg.id, 'You already used that name.').then(() => delMessage(msg));
            return;
        }

        // Prepare the destination container
        let dest = './stickers/' + name;
        let url = '';

        // Stupid discord renaming stuff, breaks everything
        let discordFilename = '';

        if(args[2] !== undefined)
            url = args[2];
        else
            if(msg.attachments.length > 0)
                if('proxy_url' in msg.attachments[0]){
                    url = msg.attachments[0].proxy_url;
                    discordFilename = msg.attachments[0].filename;
                }

        if(url === ''){
            // Welp, couldn't figure out a url
            kuro.editMessage(msg.channel.id, msg.id, 'You didnt supply either a url nor attachment, or there was an error with the attachment.').then(() => delMessage(msg));
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
            kuro.editMessage(msg.channel.id, msg.id, "The file you are linking or trying to attach doesn't have an extension. Kuro needs that thingy").then(() => delMessage(msg));
            return;
        }

        dest = dest + '.' + ext;
        downloadImage(name, url, dest, ext, msg);

    }else if (command.toString().trim() === 'del'){
        if(args[1] !== undefined){
            delSticker(args[1], msg);
        }
    }else if (command.toString().trim() === 'list'){

        /*Depending on the configuration specified, we either return a list
        of all the stickers or launch a http server trying to grab the
        external ip of the computer the script is running on.*/

        if(_config.server.enabled === true)
            startServer(msg);
        else{
            let list = '';
            for(let sticker in _stickers)
                list = list + ' ' + sticker + '\n';

            kuro.editMessage(msg.channel.id, msg.id, '```' + list + '```').then(() => delMessage(msg, 5000));
        }

    }else if (command.toString().trim() === 'show'){
        // Soon

    }else{

        let name = command;

        if(_stickers[name] === undefined){
            kuro.editMessage(msg.channel.id, msg.id, 'That sticker doesnt exist. rip').then(() => delMessage(msg));
            return;
        }

        let img = fs.readFileSync('stickers/' + _stickers[name]);
        kuro.editMessage(msg.channel.id, msg.id, 'Loading...');
        kuro.createMessage(msg.channel.id, '', {file: img, name: _stickers[name]}).then(() => delMessage(msg, 0));

    }

});

/*
    Usage: /purge _number_
    Kuro will get the last _number_ messages from the channel where the command
    was triggered.
*/

kuro.registerCommand('purge', (msg, args) => {
    let msgCount = parseInt(args);
    kuro.getMessages(msg.channel.id, 100)
        .then((messages) => {
            let filtered = messages.filter(m => m.author.id === kuro.user.id);
            filtered.length = msgCount + 1;
            filtered.map((msg) => delMessage(msg, 0));
        });
});

/*
    Usage: /status online|idle|dnd|offline
    Since this is a self bot, even if you close Discord you remain connected through
    Kuro. This command will enable you to set the status of your account whenever
    you're not on the app. So if you want to appear as 'Busy' whenever you're offline
    you can just /status dnd
*/

kuro.registerCommand('status', (msg, args) => {

    if(args.length === 0){
        kuro.editMessage(msg.channel.id, msg.id, 'Your offline status is: ' + msg.member.status).then(() => delMessage(msg));
        return;
    }

    switch(args[0]){
        case 'idle':
        case 'online':
        case 'dnd':
        case 'invisible':
            kuro.editStatus(args[0]);
            kuro.editMessage(msg.channel.id, msg.id, 'Next time you are offline your status will be set to: ' + args[0]).then(() => delMessage(msg));
            break;
        default:
            kuro.editMessage(msg.channel.id, msg.id, 'Wrong option. You need to specify away|busy|online|invisible').then(() => delMessage(msg));
            break;
    }

});

/*
    Usage: /playing string
    It will change the 'Playing' status below the users name to the string
    entered above. Note that you won't be able to see the status but everyone
    else will, this is a limitation with discord itself and not the bot.
*/

kuro.registerCommand('playing', (msg, args) => {
    if(args.length === 0){
        kuro.editStatus({});
        kuro.editMessage(msg.channel.id, msg.id, 'You succesfully removed your playing status').then(() => delMessage(msg));
        return;
    }

    let text = args.join(' ');
    kuro.editStatus({name: text});
    kuro.editMessage(msg.channel.id, msg.id, 'Succesfully changed your playing status o7').then(() => delMessage(msg));
});

/*
    Usage: /regional string
    Kuro will try to spell your string using regional indicators, just
    for the sake of being annoying.
*/

kuro.registerCommand('regional', (msg, args) => {
    if(args.length === 0){
        kuro.editStatus({});
        kuro.editMessage(msg.channel.id, msg.id, 'You gotta write a message bub').then(() => delMessage(msg));
        return;
    }

    let text = args.join(' ').toLowerCase().split('');
    let message = getRegionalIndicators(text);

    kuro.editMessage(msg.channel.id, msg.id, message);
});

/*
    Usage: /reaction string
    Kuro will try to react to the last post with regional indicators for the
    sake of being super annoying.
*/

kuro.registerCommand('reaction', (msg, args) => {
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
});

/*
    Usage: /reactions
    This is super fucking annoying, don't use please.
    Gets a list of all the server emotes, scrambles them and picks 20 to react
    to the last message on the chat.
*/

kuro.registerCommand('reactions', (msg) => {
    kuro.getMessages(msg.channel.id, 2).then((msgArray) => {

        delMessage(msg, 0);
        msg.guild.getEmojis().then((emojis) => {
            emojis.shuffle();
            for( let i = 0; i < emojis.length; i++ )
                if(i < 19)
                    msgArray[1].addReaction(emojis[i].name + ':' + emojis[i].id);
        });

    });
});

/* HELPER FUNCTIONS */
let startServer = function(msg){

    // Can we get an external IP?
    getExternalIP((err, body) => {
        if (!err) {

            // This is such a bad approach
            // DELET THIS
            fs.writeFileSync('./public/stickers.json', fs.readFileSync('./stickers.json'));

            if(stickerServer !== undefined){
                kuro.editMessage(msg.channel.id, msg.id, 'To view your sticker list go to http://' + body + ':' + _config.server.port + ' for the next ' + _config.server.duration + ' minutes.').then(() => delMessage(msg, 5000));
                delMessage(msg);
                return;
            }

            stickerServer = express();
            stickerServer.use(express.static('public'));
            stickerServer.use(express.static('stickers'));
            stickerServer.listen(_config.server.port);

            setTimeout( () => stickerServer.close(), (_config.server.duration * 60 * 1000));
            kuro.editMessage(msg.channel.id, msg.id, 'To view your sticker list go to http://' + body + ':' + _config.server.port + ' for the next ' + _config.server.duration + ' minutes.').then(() => delMessage(msg, 5000));
        } else {
            kuro.editMessage(msg.channel.id, msg.id, 'Unfortunately we couldnt get your external IP.').then(() => delMessage(msg));
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
    let json = JSON.stringify(_stickers);
    fs.writeFile('stickers.json', json, 'utf8', function(){
        reloadStickers();
        delMessage(msg, 0);
        kuro.createMessage(msg.channel.id, 'Sticker added succesfully fam \o/').then(function(newmsg){
            delMessage(newmsg, 3000);
        });
    });
};

let delSticker = function(name, msg){
    if(name in _stickers){
        delete(_stickers[name]);
        let json = JSON.stringify(_stickers);
        fs.writeFile('stickers.json', json, 'utf8', function(){
            reloadStickers();
            kuro.editMessage(msg.channel.id, msg.id, 'The sticker was removed o7').then(() => setTimeout( () => kuro.deleteMessage(msg.channel.id, msg.id), 3000));
        });
    }else{
        kuro.editMessage(msg.channel.id, msg.id, 'There is no sticker by that name, you wonderful person.').then(() => setTimeout( () => kuro.deleteMessage(msg.channel.id, msg.id), 3000));
    }
};

let reloadStickers = function(){
    _stickers = reload('./stickers.json');
};

let downloadImage = function(name, url, dest, ext, msg) {
    let file = fs.createWriteStream(dest);

    let protocol = https;
    if (url.indexOf('http://') === 0)
        protocol = http;

    protocol.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
            file.close(addNewSticker(name, ext, msg));  // close() is async, call cb after close completes.
        });
    }).on('error', function(err) { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        kuro.editMessage(msg.channel.id, msg.id, '***Error:*** ' + err.message);
    });
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
            body = body.toString().trim();
            if(/^(?:(?:2[0-4]\d|25[0-5]|1\d{2}|[1-9]?\d)\.){3}(?:2[0-4]\d|25[0-5]|1\d{2}|[1-9]?\d)$/.test(body))
                return callback(null, body);
            else{
                //console.log(body);
                return callback('error');
            }
        });
    }else{
        return callback(null, '127.0.0.1');
    }
}

Array.prototype.shuffle = function() {
    let i = this.length, j, temp;
    if ( i == 0 ) return this;
    while ( --i ) {
        j = Math.floor( Math.random() * ( i + 1 ) );
        temp = this[i];
        this[i] = this[j];
        this[j] = temp;
    }
    return this;
};

kuro.connect();
