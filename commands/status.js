let kuro
let _table = 'status'

exports.init = function(bot) {
	kuro = bot

	// Create the table where we will be storing this module's data
	kuro.db.schema.createTableIfNotExists(_table, (table) => {
		table.increments()
		table.string('status')
	}).then(() => {
		kuro.db.table(_table).then((row) => {
			if (row.length > 0) {
				// Seems like data is stored. We should apply the status now
				kuro.log(`Setting offline status to: ${row[0].status}`)
				kuro.user.setStatus(row[0].status)
				return
			}

			// Populate it
			kuro.db.table(_table).insert({ status: 'online' }).then(function() {}) // eslint-disable-line
		})
	}).catch((error) => { kuro.error(error) })
}

exports.run = function(msg, args) {
	if (args.length === 0) return kuro.edit(msg, `Your offline status is: ${msg.client.status}`)

	if (args[0] !== 'idle' && args[0] !== 'online' && args[0] !== 'dnd' && args[0] !== 'invisible') {
		return kuro.edit(msg, 'Wrong option. You need to specify idle|online|dnd|invisible')
	}

	kuro.db.table(_table).where('id', 1)
		.update({ status: args[0] })
		.then(() => {
			kuro.user.setStatus(args[0])
			return kuro.edit(msg, `Next time you are offline your status will be set to: ${args[0]}`)
		})
		.catch((error) => { kuro.error(error) })
}
