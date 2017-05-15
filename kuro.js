const fs = require('fs')
const path = require('path')

if (!fs.existsSync(path.join(__dirname, 'config.json'))) {
	console.log('config.json file not found, please run kuro-cli or create it on your own')
	process.exit()
}

const config = require('./config.json')
const Discord = require('discord.js')
const chalk = require('chalk')
const knex = require('knex')({
	client: 'sqlite3',
	connection: { filename: path.join(__dirname, 'db') },
	useNullAsDefault: true
})

let filesDirectory = path.join(__dirname, 'files')
fs.existsSync(filesDirectory) || fs.mkdirSync(filesDirectory)

// Initializing the ultimate tan
const kuro = new Discord.Client()

// When ready
kuro.on('ready', () => {
	// Create database if it doesn't exist
	fs.exists('db', (exists) => exists || fs.writeFile('db', ''))

	// Getting the database ready
	kuro.db = knex

	// Making config available on every module
	kuro.config = config
	kuro.loadCommands()
	kuro.user.setAFK(true)
	kuro.log('Kuro is ready!', 'green')
})

kuro.on('message', (msg) => {
	// Ignore if the message is not ours
	if (msg.author.id !== kuro.user.id) return

	// Ignore if the message doesn't start with our prefix
	if (!msg.content.startsWith(config.prefix)) return

	// Ignore if empty command
	if (msg.content.length === config.prefix.length) return

	// Get all the arguments
	let tmp = msg.content.substring(config.prefix.length, msg.length).split(' ')
	let args = []

	for (let i = 1; i < tmp.length; i++) {
		args.push(tmp[i])
	}

	// Store the command separately
	let cmd = tmp[0]

	if (kuro.modules.hasOwnProperty(cmd)) return kuro.modules[cmd].run(msg, args)
	if (config.commandError.sendToModule === true) {
		return kuro.modules[config.commandError.module][config.commandError.function](msg, cmd)
	}

	return msg.delete()
})

kuro.on('disconnect', () => {
	kuro.error('CLIENT: Disconnected!')
	process.exit()
})

kuro.on('reconnecting', () => { kuro.log('CLIENT: Reconnecting...', 'green') })

kuro.loadCommands = function() {
	kuro.modules = {}

	// Load up all the modules
	fs.readdirSync('./commands/').forEach((file) => {
		let name = file.slice(0, -3)

		delete require.cache[require.resolve(`./commands/${file}`)]

		try {
			kuro.modules[name] = require(`./commands/${file}`)
			if (kuro.modules[name].hasOwnProperty('init')) {
				kuro.modules[name].init(kuro)
			}

			kuro.log(`Module ${name} is ready`)
		} catch (e) {
			kuro.error(`Error in module ${name}:\n${e.stack}`)
		}
	})
}

kuro.edit = function(msg, content, timeout = 3000) {
	if (timeout === 0) return msg.edit(content).catch(console.error)

	return msg.edit(content).then(() => {
		setTimeout(() => msg.delete().catch(console.error), timeout)
	})
}

kuro.log = function(msg, color) {
	if (color === undefined) console.log(`[Kuro]: ${msg}`)
	else console.log(chalk[color](`[Kuro]: ${msg}`))
}

kuro.error = function(msg) {
	console.log(chalk.red(`[Kuro]: ${msg}`))
}

kuro.log('Starting...', 'green')
kuro.login(config.token)

process.on('unhandledRejection', err => {
	kuro.error(`Uncaught Promise Error:\n${err.stack}`)
})
