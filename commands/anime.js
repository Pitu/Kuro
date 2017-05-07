const Kitsu = require('kitsu.js')
const kitsu = new Kitsu()
let kuro

exports.init = function(bot) { kuro = bot }

exports.run = function(msg, args) {
	let search = args.toString().replace(/,/g, ' ')
	kitsu.searchAnime(search)
		.then(result => {
			if (result.length === 0) {
				return msg.edit(`No results found for: **${search}**`)
			}
			return prepareEmbed(msg, result[0])
		})
		.catch(err => {
			console.error(err)
			return msg.edit('There was an error processing the search, please check the console')
		});
}

function prepareEmbed(msg, item) {
	const { slug, synopsis, titles, averageRating, posterImage, episodeCount, showType } = item
	const url = `https://kitsu.io/anime/${slug}`

	msg.edit('', {
		embed: {
			type: 'rich',
			title: titles.romaji,
			url,
			description: `**Synopsis:**\n${synopsis.substring(0, 450)}...`,
			color: kuro.config.embedColor,
			fields: [
				{
					name: '❯ Type',
					value: fixCase(showType),
					inline: true
				},
				{
					name: '❯ Episodes',
					value: episodeCount,
					inline: true
				},
				{
					name: '❯ Rating',
					value: averageRating,
					inline: true
				}
			],
			author: {
				name: 'kitsu.io',
				url: 'https://kitsu.io'
			},
			thumbnail: { url: posterImage.small }
		}
	})
}

function fixCase(str) {
	return str.toLowerCase().replace(/(^| )(\w)/g, s => s.toUpperCase())
}
