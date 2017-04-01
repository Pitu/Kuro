let kuro
let _table = 'playing'

exports.init = function(bot) {
	kuro = bot

	// Create the table where we will be storing this module's data
	kuro.db.schema.createTableIfNotExists(_table, (table) => {
		table.increments()
		table.string('game')
	}).then(() => {
		kuro.db.table(_table).then((row) => {
			if (row.length > 0) {
				// Seems like data is stored. We should apply the status now
				kuro.log(`Setting game status to: ${row[0].game}`)
				if (row[0].game === '') return kuro.user.setGame(null)
				return kuro.user.setGame(row[0].game)
			}

			// Populate it
			kuro.db.table(_table)
				.insert({ game: '' })
				.then(function() {}) // eslint-disable-line
		})
	}).catch((error) => { kuro.error(error) })
}

exports.run = function(msg, args) {
	if (args.length === 0) {
		kuro.user.setGame(null)
		this.save('', msg)
		return
	}

	let text = args.join(' ')
	kuro.user.setGame(text)
	this.save(text, msg)
}

exports.save = function(value, msg) {
	kuro.db.table(_table).where('id', 1)
		.update({ game: value })
		.then(() => {
			if (value === '') return kuro.edit(msg, 'You succesfully removed your playing status.')
			return kuro.edit(msg, 'Succesfully changed your playing status.')
		})
		.catch((error) => { kuro.error(error) })
}
