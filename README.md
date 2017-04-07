![Kuro Bot](http://i.imgur.com/ohS1PwH.png)   
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/kanadeko/Kuro/master/LICENSE)
[![Code Climate](https://codeclimate.com/github/kanadeko/Kuro/badges/gpa.svg)](https://codeclimate.com/github/kanadeko/Kuro)
[![Issue Count](https://codeclimate.com/github/kanadeko/Kuro/badges/issue_count.svg)](https://codeclimate.com/github/kanadeko/Kuro)

Kuro is an easy to use self bot that is shifting more and more into a framework while preserving its ease of use. It sits on top of [discord.js](https://github.com/hydrabolt/discord.js/). 
NodeJS version 6+ is ***REQUIRED***. [Installing Node.js](https://nodejs.org/en/download/package-manager/)

[> Check this video to see how it works!](https://my.mixtape.moe/pwcrem.webm)

## Installing:
1. Ensure you have node installed
2. Run `npm i -g kuro-cli`
3. Run `kuro-cli`
4. Follow the instructions on screen

[kuro-cli](https://github.com/Pitu/kuro-cli) is a utility that will install and manage your Kuro installation. Whenever there's a new version available you can run `kuro-cli` and it will download, upgrade, update dependencies and restart automatically. Some options are not covered on the cli just yet, so you can go ahead and open `config.json` to look and modify them if you want.

If you don't want to use `kuro-cli`, simply clone the repo, `npm install`, rename the `config.sample.json` to `config.json` and modify it's values with your data.

### What's new in v4.0.2:
1. New coding style and several improvements
2. Added a Telegram notifications plugin
3. Added `user` command. `Usage: !user @someone`
4. Added `google` command. `Usage: !google some really stupid question`
5. Added `flip` command. `sllɐqǝzɐɯɐ sı sıɥʇ`

Whenever you are running a selfbot, mobile push notifications don't work. This is caused by the bot being online, so Discord doesn't trigger a notification on your mobile device. This bothers me a lot, since I miss a lot of messages or pings whenever I'm away. If you use Telegram, you can create a bot token and put it here, this way whenever you get a notification it will send you a message through it.

## Modules:
This new update brings every command in the form of separate modules. Inside each module you can make up the stuff you want, and you can execute it by calling the module name without the extension. There's a sample module ready for you to duplicate called `base.js`.

Example of a simple module with no dependencies that returns the server's member count on which you send the command:
```javascript
exports.run = function(msg, args) {
  msg.delete()
  msg.channel.sendMessage('', {
    'embed': {
      'title': msg.guild.name,
      'description': `Member Count: ${msg.guild.memberCount}`,
      'color': 15473237
    }
  })
}
```

Pretty easy stuff.
If you want me to include a module you've made, send a PR with your stuff and I'll look at it.

## Bundled modules

Each module has detailed instructions inside their own files. Take a look at them for further details on how to use.

- `emote [emote]`  
  Shows information about a custom emote.

- `eval [expression]`  
  A module to eval expressions. Dangerous stuff, don't use unless pretty sure of what you're doing.
  
- `eyes`  
  A module that edits a message to add the effect of animated eyes. You probably should update the emoji name if you're not on Pilar's server.

- `getcommand [module]`  
  Sends the specified module's source to the chat. Ex: `!getcommand base` would print `base.js` contents to chat.

- `gifspeed [url]`  
  Removes delay between frames of the given gif url and uploads it.

- `mal`  
  Prints information about your MyAnimeList username.

- `members`  
  Shows the server's member count.

- `ping`  
  Simple tool to check delay between your bot and Discord.

- `playing [message]`  
  Change your `playing` status on Discord to the specified string. (Note you wont be able to see it due to a Discord limitation).

- `purge [number of messages]`  
  Grabs the supplied amount of messages from chat and deletes those that are yours.

- `reboot`  
  Reboots the Kuro. (Only works if using pm2|forever).

- `reload`  
  Reloads all the modules (Useful when developing).

- `react [message]`  
  React to the last message with regional characters. a-z 0-9, no spaces.

- `regional [message]`  
  Sends a message using regional character emojis.

- `s [name] | [add|del|ren]`  
  A module to manage stickers like Telegram does. Upload a sticker with a given name, and then make kuro paste it when you trigger the command.

- `smug`  
  Displays smug looking anime girls with patronizing looks on their faces.

- `stats`  
  Displays an embed with statistics.

- `status [online|idle|dnd|offline]`  
  The status you want to appear as whenever you're offline, since using Kuro will make discord think you're always online.

- `tag [name] | [add|del|ren]`  
  Saves the given text into a tag for later usage. For example `tag add kuro https://github.com/kanadeko/Kuro` would print `https://github.com/kanadeko/Kuro` every time I do `tag kuro`

- `tl`  
  Tries to translate the last message to english. 

- `uptime`  
  Displays how long the bot has been running.
