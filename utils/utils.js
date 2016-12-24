let config

exports.init = function(conf){
	config = conf
}

exports.conf = function(){
	return config
}

exports.log = function(msg){
	console.log('[Kuro]: ' + msg)
}

exports.edit = function(msg, content, timeout = 3000){
	if(timeout === 0) return msg.edit(content)

	msg.edit(content).then(() => {
		setTimeout(() => msg.delete(), timeout)
	})
}

exports.save = function(key, val){
	config[key] = val
	let json = JSON.stringify(config, null, '\t')
	require('fs').writeFile('./config.json', json, 'utf8')
}