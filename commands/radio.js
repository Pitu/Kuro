let kuro
let _msg
let _table = 'radio'
let _token

exports.init = function(bot){ 
	kuro = bot

	// Create the table where we will be storing this module's data
	bot.db.schema.createTableIfNotExists(_table, function (table) {
		table.increments()
		table.string('token')
	}).then(function () {
		bot.db.table(_table).then(function(row){
			if(row.length > 0){
				_token = row[0].token
				return
			}

			// Populate it
			bot.db.table(_table).insert({
				token: ''
			}).then(function(){

			})
		})
	}).catch(function(error) { kuro.error(error) })

}

exports.run = function(msg, args) {
	
	_msg = msg

	let newargs  = []
	for(let i = 1; i < args.length; i++)
		newargs.push(args[i])

	if(args[0] === 'token') return this.token(newargs)
	if(args[0] === 'search') return this.search(newargs)
	if(args[0] === 'request') return this.request(newargs)
}

exports.token = function(args) {
	if(args === undefined || args === '') return kuro.edit(_msg, 'You need to provide a token.')
	kuro.db.table(_table).where('id', 1).update({
		token: args[0]
	}).then(function(){
		_token = args[0]
		return kuro.edit(_msg, 'Token saved.')
	}).catch(function(error) { kuro.error(error) })
}

exports.search = function(args) {

	kuro.db.table(_table).where('id', 1).then(function(row){
		if(row[0].token === '') return kuro.edit(_msg, 'Invalid token')
		
		require('axios')({
			method: 'post',
			url: 'https://listen.moe/api/songs/search',
			data: {
				query: args[0]
			},
			headers: {'authorization': kuro.config.radiotoken}
		}).then((response) => {
			if(response.data === undefined) return kuro.edit(_msg, '**Error:**')
			if(response.data.success === false) return kuro.edit(_msg, '**Error:**\n' + response.data.message)

			let message = ''
			let count = 0
			for(let song of response.data.songs){
				if(count < 10){
					count++

					if(song.id.toString().length < 4){
						for(let i = song.id.toString().length; i < 4; i++){
							song.id = song.id + ' '
						}
					}

					message = message + `${song.id} | ${song.artist} - ${song.title}` + '\n'
				}
			}

			kuro.edit(_msg, '\`\`\`' + message + '\`\`\`', 10000)

		})
		.catch(function (error) {
			kuro.error(error)
			_msg.edit('**Error:**\n' + error)
		})

	})

}

exports.request = function(args) {

	require('axios')({
		method: 'post',
		url: 'https://listen.moe/api/songs/request',
		data: { song: args[0] },
		headers: {'authorization': kuro.config.radiotoken}
	}).then((response) => {
		if(response.data === undefined) return kuro.edit(_msg, '**Error:**')
		if(response.data.success === false) return kuro.edit(_msg, '**Error:**\n' + response.data.message)

		kuro.edit(_msg, 'Request placed successfully.')
	}).catch(function (error) {
		kuro.error(error)
		_msg.edit('**Error:**\n' + error)
	})
	
}