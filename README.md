![Kuro Bot](http://i.imgur.com/ohS1PwH.png)   
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/kanadeko/Kuro/master/LICENSE)

An easy to use self bot with different utilities built on top of [Eris](https://github.com/abalabahaha/eris/). NodeJS version 6+ is ***REQUIRED***

[> Check this video to see how it works!](https://my.mixtape.moe/pwcrem.webm)

## Installing:
0. If coming from a previous version update your `config.json` file and `npm install` before starting the bot!
1. Clone the repo with `git clone https://github.com/kanadeko/Kuro`
2. Run `npm install`
3. Copy config.sample.json to config.json and fill the required data.
4. Run the bot with `node Kuro.js`

---

## What's new:
1. Awesome new way to see your sticker list!
2. Kind of
3. Fixed some issues, refactored some code

---

## Overview of the config.sample.json file:
```json
{
    "token": "YOUR-ACCOUNT-TOKEN",
    "owner": "YOUR-USERNAME",
    "userID" : "YOUR-USER-ID",
    "server":{
        "enabled": false,
        "islocal": false,
        "port": 8080,
        "duration": 1
    }
}
```

---

## Important note about the server section on the config.json:
We're rolling out an experimental feature to enable the user to see all of their stickers in action by creating a local server and sending back the public ip to browse them.
Due to the nature of how this works, it means that the public IP of the server you're hosting the bot in will be publicly printed in chat, so use this feature with caution.
If this feature is enabled by setting `"enabled": true` we recommend only running `/sticker list` on a private channel and not a public one.

If `"islocal"` is set to `true`, the bot will believe it's running on the same computer you're using discord so instead of printing your public ip it will print `http://127.0.0.1:PORT`

`"duration"` sets in minutes the amount of time the url will work. With the default config, 1 minute after typing `/sticker list` the url will stop working until you issue the command again.

---

## Getting the data for the config.json file:
1. To get the token, bring up the Developer Tools on the discord website and type `localStorage.token`. That should print your personal token to use with this bot
2. The owner should be your own username, in the format `kanadeko#1234`
3. To get your userID, enable `Developer Mode` on discord under Settings > Appearance and then right click your name on the user list and `Copy ID`

---

## Command list

Note that every command will edit/delete the message afterwards to provide a better experience while interacting with the bot.

- `/sticker name`  
  Kuro will replace this message with the sticker associated to the given `name`,

- `/sticker add name`  
  By running this command while attaching an image, Kuro will try to upload it and use the `name` you specified for future use.

- `/sticker add name url`  
  Kuro will upload the given image `url` and use the `name` you specified for future use.

- `/sticker del name`  
  Kuro will try and delete the sticker with the given `name`.

- `/sticker list`  
  Kuro will print a list of all your stickers

- `/status online|idle|dnd|offline`  
  The status you want to appear as whenever you're offline, since using Kuro will make discord think you're always online.

- `/playing string`  
  This will change the 'Playing' status below your username to the string entered above. Note that you won't be able to see the status but everyone else will, this is a limitation with discord itself and not the bot.

- `/purge number`  
  Kuro will fetch your latest 100 messages on the channel that triggered this command and delete the last `number` messages.

## TODO list

- If the added sticker is a gifv, instead of saving it just store the link to it so discord shows the preview, since if you attach it it could go over the 8mb limit and there is no preview available.  

- Make that the `del` command also deletes the file associated with the sticker.  

- Make the `/sticker list` website less cancer.  

## Known Bugs

- If you open an attachment from discord in a browser window and use that link as the source for `/sticker add` it fails. No idea why.
