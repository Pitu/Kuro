module.exports = {

	// This is your Discord personal token
	token: '',

	// Prefix on which the bot will be hooked to
	prefix: '!',

	// Your MyAnimeList username, if any
	MALusername: '',

	// Unrecognized commands
	commandError: {
		// Should we attempt to redirect every unrecognized command to a module?
		sendToModule: true,
		// Which module?
		module: 's',
		// Which function?
		function: 'run'
		/*
			In this case, any unrecognized command will be redirected to the
			stickers module to see if it exists as a sticker and if it does, send it.
		*/
	},

	// Border color for embeds, defaults to Kuro one
	embedColor: 15473237,
	
	// Still in development, don't touch
	server: {
		enabled: false,
		islocal: false,
		port: 8080,
		duration: 1
	},
	
	// The following values shouldn't be touched
	database: {
		client: 'sqlite3',
		connection: {
			filename: './db'
		},
		useNullAsDefault: true
	}
	
}