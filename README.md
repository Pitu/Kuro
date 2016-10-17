![Kuro Bot](http://i.imgur.com/ohS1PwH.png)   
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/kanadeko/Kuro/master/LICENSE)

An easy to use self bot with different utilities built on top of [Eris](https://github.com/abalabahaha/eris/). NodeJS version 6+ is ***REQUIRED***

## Installing:
1. Clone the repo
2. Run `npm install`
3. Copy config.sample.json to config.json and fill the required data.
4. Run the bot with `node Kuro.js`

---

## Command list

Note that every command will edit/delete the message afterwards to provide a better experience while interacting with the bot.

- `/sticker name`  
  Kuro will replace this messahe with the sticker associated to the given `name`,
  
- `/sticker add name`  
  By running this command while attaching an image, Kuro will try to upload it and use the `name` you specified for future use.
  
- `/sticker add name url`  
  Kuro will upload the given image `url` and use the `name` you specified for future use.
  
- `/sticker del name`  
  Kuro will try and delete the sticker with the given `name`.
  
- `/sticker list`  
  Kuro will print a list of all your stickers
  
- `/purge number`  
  Kuro will fetch your latest 100 messages on the channel that triggered this command and delete the last `number` messages.
