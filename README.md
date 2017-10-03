![Kuro Bot](http://i.imgur.com/ohS1PwH.png)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://raw.githubusercontent.com/kanadeko/Kuro/master/LICENSE)
[![Chat / Support](https://img.shields.io/badge/Chat%20%2F%20Support-discord-7289DA.svg?style=flat-square)](https://discord.gg/5g6vgwn)

Kuro is an easy to use self bot that is shifting more and more into a framework while preserving its ease of use. It sits on top of [discord.js](https://github.com/hydrabolt/discord.js/).
NodeJS version 6+ is ***REQUIRED***. [Installing Node.js](https://nodejs.org/en/download/package-manager/)

[> Check this video to see how it works!](https://my.mixtape.moe/pwcrem.webm)

### v4.1.0 Important Notes:
This only applies if you are upgrading from a previous version.
In order to make the chat less jumpy and contribute with data caps and mobile users, sticker now behave differently than they did before. Stickers get uploaded to [safe.moe](https://safe.moe) now so they can be used inside an embed. By using embeds, kuro can now edit your message to display the sticker instead of deleting it and sending a new one. Even though that embeds are ugly this makes it so everyone can see your sticker faster by allowing caching of the URL on Discord's side.

So if you are upgrading to a new version, please run `!s migrate` to migrate your stickers to the new embed system.

## Installing:
1. Ensure you have node installed
2. Run `npm i -g kuro-cli`
3. Run `kuro-cli`
4. Follow the instructions on screen

[kuro-cli](https://github.com/Pitu/kuro-cli) is a utility that will install and manage your Kuro installation. Whenever there's a new version available you can run `kuro-cli` and it will download, upgrade, update dependencies and restart automatically. Some options are not covered on the cli just yet, so you can go ahead and open `config.json` to look and modify them if you want.

If you don't want to use `kuro-cli`, simply clone the repo, `npm install`, rename the `config.sample.json` to `config.json` and modify it's values with your data.

## Modules:
This new update brings every command in the form of separate modules. Inside each module you can make up the stuff you want, and you can execute it by calling the module name without the extension. There's a sample module ready for you to duplicate called `base.js`.

Example of a simple module with no dependencies that returns the server's member count on which you send the command:
```javascript
exports.run = function(msg, args) {
  msg.delete()
  msg.channel.send('', {
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

- `anime <name of the anime>`
  Shows the first occurence of the searched anime on kitsu.io and returns a summary of it

- `emote [emote]`
  Shows information about a custom emote.

- `eval [expression]`
  A module to eval expressions. Dangerous stuff, don't use unless pretty sure of what you're doing.

- `eyes`
  A module that edits a message to add the effect of animated eyes. You probably should update the emoji name if you're not on Pilar's server.

- `flip <this is amazing>`
  sllɐqǝzɐɯɐ sı sıɥʇ

- `getcommand [module]`
  Sends the specified module's source to the chat. Ex: `!getcommand base` would print `base.js` contents to chat.

- `gifspeed [url]`
  Removes delay between frames of the given gif url and uploads it.

- `google <some stupid question>`
  Creates a link to Google with your query when someone asks stupid questions

- `mal`
  Prints information about your MyAnimeList username.

- `manga <name of the manga>`
  Shows the first occurence of the searched manga on kitsu.io and returns a summary of it

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

- `user <@user>`
  Displays information about the tagged user
