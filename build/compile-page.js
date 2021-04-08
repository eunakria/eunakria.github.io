const fs        = require('fs')
const pathTools = require('path')

const cldrData       = require('cldr-data')
const ejs            = require('ejs')
const { JSDOM }      = require('jsdom')
const Globalize      = require('globalize')
const { minify }     = require('html-minifier')
const MarkdownIt     = require('markdown-it')
const yaml           = require('js-yaml')

const md = new MarkdownIt('commonmark')

const baseInfo = {
	site: {
		defaultLang: 'en',
		allLangs: [
			['en', 'English'],
			['es', 'español'],
		],
	},
}

let addedLangs = []

Globalize.load(cldrData.entireSupplemental())
Globalize.load(cldrData.entireMainFor(
	...baseInfo.site.allLangs.map(i => i[0])
))
Globalize.loadTimeZone(require('iana-tz-data'))

function compilePage(inFile, lang, outFile, options={}) {
	options = {
		useMarkdown: true,
		...options,
	}
	let cleanPath =
		'/' + (options.linkPath || '').replace(/\/index\.html$/, '')

	// Read the input data and separate it.
	let inputData = fs.readFileSync(inFile, 'utf-8')

	let f = extractFrontMatter(inputData)
	let { body, frontMatter } = f
	frontMatter.lang = lang
	frontMatter = {
		...frontMatter,
		...(options.passData || {}),
	}

	// Compile the input data from Markdown into a HTML fragment if desired
	let htmlFragment
	if (options.useMarkdown) {
		htmlFragment = md.render(body)
	} else {
		htmlFragment = body
	}

	// Extract an excerpt of 2 paragraphs
	let excerpt = ''
	let shortExcerpt = ''
	let dom = JSDOM.fragment(htmlFragment)
	let parsExtracted = 0
	for (let child of dom.children) {
		if (child.tagName.toLowerCase() !== 'p') {
			continue
		}
		parsExtracted++
		if (parsExtracted > 2) {
			break
		}
		excerpt += ' ' + child.innerHTML
		if (parsExtracted > 1) {
			continue
		}
		shortExcerpt += ' ' + child.innerHTML
	}

	// Set up some classes, then feed the JSDOM instance back
	for (let el of dom.querySelectorAll('img')) {
		el.classList.add('body-img')
	}
	htmlFragment = Array.from(dom.children).map(i => i.outerHTML).join('')

	// Set up i18n
	if (addedLangs.indexOf(lang) === -1) {
		let fileData = fs.readFileSync(`src/i18n/${lang}/${lang}.yml`, 'utf-8')
		let thisEntry = yaml.load(fileData)
		Globalize.loadMessages({
			[lang]: yaml.load(fileData)
		})
		addedLangs.push(lang)
	}
	let gl = Globalize(lang)

	// Prepare the object to pass to EJS as parameters.
	let keyInfo = {
		...baseInfo,
		page: frontMatter,
		content: htmlFragment,
		baseURL: getBase(lang),
		linkPath: cleanPath,
		excerpt: shortExcerpt,

		gl: gl,
		t: (...args) => gl.formatMessage(...args),
	}

	// Fetch the inner-level EJS template.
	let layout = frontMatter.layout || 'default'
	f = extractFrontMatter(
		fs.readFileSync(`src/layouts/${layout}.ejs`, 'utf-8')
	)
	let template = f.body
	let subFM = f.frontMatter

	// Prepare an appropriate EJS renderer. Fetch the outer-level template
	// if there is one.
	let render
	if (subFM.layout === undefined) {
		render = data => ejs.render(template, data)
	} else {
		f = extractFrontMatter(
			fs.readFileSync(`src/layouts/${subFM.layout}.ejs`, 'utf-8')
		)
		let subTemplate = f.body

		render = data => ejs.render(subTemplate, {
			...data,
			content: ejs.render(template, data),
		})
	}

	// Render the HTML fragment into a full page with EJS.
	let ejsData = render(keyInfo)

	// Minify the HTML document.
	let result = minify(ejsData, {
		collapseWhitespace: true,
		decodeEntities: true,
		removeAttributeQuotes: true,
		removeComments: true,
		sortClassName: true,
	})

	// Send it all back.
	let trueOut = frontMatter.out === undefined
		? outFile
		: `out/${frontMatter.out}`
	fs.mkdirSync(pathTools.dirname(trueOut), {
		recursive: true,
	})
	fs.writeFileSync(trueOut, result)

	return {
		title: frontMatter.title,
		excerpt,
		date: frontMatter.date,
		path: cleanPath,
	}
}

function getBase(lang) {
	return lang === baseInfo.site.defaultLang ? '' : `/${lang}`
}

function extractFrontMatter(str) {
	let frontMatter = {}
	let body = str

	let lines = str.split('\n')
	if (lines[0] === '---') {
		let endPos = lines.indexOf('---', 1)
		frontMatter = yaml.load(
			lines.slice(1, endPos).join('\n')
		)
		body = lines.slice(endPos + 1).join('\n')
	}

	return { frontMatter, body }
}

module.exports = {
	compilePage,
	getBase,
}
