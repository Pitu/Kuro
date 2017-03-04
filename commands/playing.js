let kuro
let _table = 'playing'
let _msg

exports.init = function(bot){
	kuro = bot

	// Create the table where we will be storing this module's data
	kuro.db.schema.createTableIfNotExists(_table, function (table) {
		table.increments()
		table.string('game')
	}).then(function () {
		kuro.db.table(_table).then(function(row){
			if(row.length > 0){
				// Seems like data is stored. We should apply the status now
				kuro.log('Setting game status to: ' + row[0].game)
				if(row[0].game === '')
					return kuro.user.setGame(null)
				return kuro.user.setGame(row[0].game)
			}

			// Populate it
			kuro.db.table(_table).insert({
				game: ''
			}).then(function() {})
		})
	}).catch(function(error) { kuro.error(error) })
}

exports.run = function(msg, args) {

	_msg = msg

	if(args.length === 0){
		kuro.user.setGame(null)
		this.save('')
		return
	}

	let text = args.join(' ')
	kuro.user.setGame(text)
	this.save(text)
}

exports.save = function(value){
	kuro.db.table(_table).where('id', 1).update({
		game: value
	}).then(function(){
		if(value === '') return kuro.edit(_msg, 'You succesfully removed your playing status.')
		return kuro.edit(_msg, 'Succesfully changed your playing status.')
	}).catch(function(error) { kuro.error(error) })
}
