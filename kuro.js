let config     = require('./config.json')
let Eris        = require('eris')
let utils       = require('./utils/utils')

utils.log('Starting...')
utils.init(config)

// Declaring Kuro
let kuro = new Eris.CommandClient(config.token, { userAccount: true }, {
	description: 'Best selfbot',
	owner: config.owner,
	prefix: '',
	ignoreSelf: false,
	defaultHelpCommand: false,
	defaultCommandOptions: {
		requirements: {
			'userIDs': [config.userID]
		}
	}
})

// When ready
kuro.on('ready', () => {
	if(config.offlinestatus !== ''){
		utils.log('Setting offline status to: ' + config.offlinestatus)
		kuro.editStatus(config.offlinestatus)
	}

	if(config.playingstatus !== ''){
		utils.log('Setting game status to: ' + config.playingstatus)
		kuro.editStatus({name: config.playingstatus})
	}

	utils.log('Kuro is ready!')
})

kuro.on('messageCreate', function(msg){

	// Ignore if the message is not ours
	if (msg.author.id !== config.userID) return

	// Ignore if the message doesn't start with our prefix
	if (!msg.content.startsWith(config.prefix)) return

	// Ignore if empty command
	if (msg.content.length === config.prefix.length) return

	utils.log(`Message > ${msg.content}`)

	// Get all the arguments
	let tmp = msg.content.substring(config.prefix.length, msg.length).split(' ')
	let args = []

	for(let i = 1; i < tmp.length; i++)
		args.push(tmp[i])

	// Store the command separately
	let cmd = tmp[0]

	try {

		delete require.cache[require.resolve('./commands/' + cmd)]
		let cmdFile = require('./commands/' + cmd)
		cmdFile.run(kuro, msg, args, utils)

	} catch(e) {
		msg.edit(msg.author + `Error while executing command\n${e}`).then(setTimeout(msg.delete.bind(msg), 5000))
	}

})

kuro.connect()