const fs           = require('fs')

const lucide       = require('lucide')
const builder      = require('xmlbuilder')


const desiredIcons = [
	'briefcase',
	'calendar',
	'clock',
	'lightbulb',
	'message-square',
	'moon',
	'pen-tool',
	'rss',
	'sun',
	'twitter',
	'user',
]

async function build() {
	let root = builder.create('svg')
	root.att('xmlns', 'http://www.w3.org/2000/svg')
	let defs = root.ele('defs')

	for (let name of desiredIcons) {
		let pascalCase = name
			.replace(/(^|-)\w/g, mat => mat[mat.length - 1].toUpperCase())
		let [_1, _2, children] = lucide[pascalCase]

		let symbol = defs.ele('symbol')
		symbol.att('id', name)
		symbol.att('viewBox', '0 0 24 24')

		for (let [tag, attrs, _] of children) {
			let sub = symbol.ele(tag)
			for (let name in attrs) {
				sub.att(name, attrs[name])
			}
		}
	}

	let svgEl = root.end()
	fs.writeFileSync('out/feather-sprite.svg', svgEl, 'utf8')
}

module.exports = {
	build,
}
