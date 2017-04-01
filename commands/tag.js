let kuro
let _msg
let _table = 'tags'
let _tags = {}

exports.init = function(bot) {
	kuro = bot

	// Create the table where we will be storing this module's data
	bot.db.schema.createTableIfNotExists(_table, (table) => {
		table.increments()
		table.string('name')
		table.string('content')
	}).then(() => {
		// Lets load up the existing tags
		bot.db.table(_table).then((rows) => {
			for (let row of rows) {
				_tags[row.name] = row.content
			}
		})
	})
	.catch((error) => { kuro.error(error) })
}

exports.run = function(msg, args) {
	_msg = msg

	let newargs = []
	for (let i = 1; i < args.length; i++) {
		newargs.push(args[i])
	}

	// Subcommand?
	if (args[0] === 'add') return this.add(newargs)
	if (args[0] === 'del') return this.del(newargs)
	if (args[0] === 'ren') return this.ren(newargs)
	if (args[0] === 'list') return this.list()

	// Not a subcommand, let's see if it's a tag and send it
	if (_tags.hasOwnProperty(args[0])) return _msg.edit(_tags[args[0]])

	// Not a subcommand, not a tag, let's return the whole list
	return this.list()
}

exports.add = function(args) {
	if (args[0] === undefined) {
		kuro.edit(_msg, 'No name provided.')
		return
	}

	if (args[1] === undefined) {
		kuro.edit(_msg, 'No content provided.')
		return
	}

	let name = args[0]
	let content = args.slice(1).join(' ')

	// Is the name of the sticker already used?
	if (_tags.hasOwnProperty(name)) {
		kuro.edit(_msg, 'Name already in use.')
		return
	}

	kuro.db.table(_table).insert({
		name: name,
		content: content
	}).then(() => {
		_tags[name] = content
		kuro.edit(_msg, 'Tag added', 1000)
	})
	.catch((error) => { kuro.error(error) })
}

exports.del = function(args) {
	if (args[0] === undefined) return kuro.edit(_msg, 'No name provided.')

	if (args[0] in _tags) {
		kuro.db.table(_table)
			.where('name', args[0])
			.del()
			.then(() => {
				delete (_tags[args[0]])
				return kuro.edit(_msg, 'The tag was removed.', 1000)
			})
			.catch((e) => { return kuro.edit(_msg, `Error: \n${e}`, 0) })
	} else {
		return kuro.edit(_msg, 'There is no tag by that name.')
	}
}

exports.ren = function(args) {
	if (args[0] === undefined) return kuro.edit(_msg, 'No source tag supplied.')
	if (args[1] === undefined) return kuro.edit(_msg, 'No destination tag supplied.')

	if (args[0] in _tags) {
		kuro.db.table(_table).where('name', args[0])
			.update({ name: args[1] })
			.then(() => {
				_tags[args[1]] = _tags[args[0]]
				delete (_tags[args[0]])
				return kuro.edit(_msg, 'Tag renamed.', 1000)
			})
			.catch((e) => { kuro.edit(_msg, `Error: \n${e}`, 0) })
	} else {
		return kuro.edit(_msg, 'There is no tag by that name.')
	}
}

exports.list = function() {
	let list = ''
	for (let tag in _tags) {
		if ({}.hasOwnProperty.call(_tags, tag)) {
			list = `${list} ${tag}, `
		}
	}

	list = list.substr(0, list.length - 2)
	_msg.edit(`**__Tags list__**\n\`\`\`\n${list}\n\`\`\``)
}

exports.tagsCount = function() {
	return Object.keys(_tags).length
}
