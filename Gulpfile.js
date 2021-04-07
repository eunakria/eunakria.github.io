const fs           = require('fs')

const { src, dest, parallel }
				   = require('gulp')
const rename       = require('gulp-rename')
const del          = require('del')

const pageTools    = require('./build/compile-page.js')
const { Feed }     = require('feed')
const glob         = require('glob')

const { rollup }   = require('rollup')
const { terser }   = require('rollup-plugin-terser')

const sass         = require('gulp-dart-sass')
const postcss      = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const cssnano      = require('cssnano')

// Pass CSS through Sass and then PostCSS.
function buildCSS(cb) {
	return src(`src/css/main.scss`)
		.pipe(sass().on('error', sass.logError))
		.pipe(postcss([
			autoprefixer(),
			cssnano()
		]))
		.pipe(dest('out/'))
}

async function buildJS(cb) {
	const bundle = await rollup({
		input: 'src/js/index.js',
		plugins: [
			terser(),
		],
	})

	return bundle.write({
		file: `out/bundle.js`,
		format: 'iife',
	})
}

function buildRes(cb) {
	return src('src/res/**/{*,.*}')
		.pipe(rename(path => {
			if (path.basename.startsWith('..')) {
				path.basename = path.basename.substr(2)
			} else {
				path.dirname = 'res/'
			}
		}))
		.pipe(dest('out/'))
}

function buildPages(cb) {
	let eachI18n = []

	for (let lang of fs.readdirSync('src/i18n')) {
		// Wrapper object to name the function so that Gulp will say which
		// language it's working on.
		//     [10:02:48] Starting 'en'...
		//     [10:02:48] Starting 'es'...

		
		let wrapper = {
		[lang](cb_) {
			let base = `src/i18n/${lang}/`
			let outDir = `out${pageTools.getBase(lang)}/`

			let eunaURL = 'https://eunakria.github.io'
			let eunaAuthor = {
				name: 'Linus Parker',
				link: `${eunaURL}/`,
			}
			let feed = new Feed({
				title: 'Eunakria',
				id: `${eunaURL}/`,
				link: `${eunaURL}/`,
				language: lang,
				image: `${eunaURL}/favicon.svg`,
				favicon: `${eunaURL}/favicon.ico`,
				feedLinks: {
					atom: `${eunaURL}/atom.xml`,
				},
				author: eunaAuthor,
			})

			let postData = []
	
			for (let postSource of glob.sync(
				`${base}/posts/**/*.@(md|html)`
			)) {
				// Translate the input path
				let outPath = toDir(postSource
					.replace(base, '')
					.replace(/^(?:.*?\/)?(\d+)-\d+-\d+-(.*)$/, (_, p1, p2) => (
						`${p1}/${p2}`
					))
				)

				insertSorted(postData, pageTools.compilePage(postSource, lang,
					`${outDir}/${outPath}`, {
						linkPath: outPath,
						useMarkdown: postSource.match(/\.md$/),
					})
				)
			}

			for (let pageSource of glob.sync(
				`${base}/**/*.@(md|html)`,
				{ ignore: `${base}/posts/**/*` },
			)) {
				// Translate the input path
				let outPath = toDir(pageSource.replace(base, ''))

				pageTools.compilePage(pageSource, lang,
					`${outDir}/${outPath}`, {
						linkPath: outPath,
						useMarkdown: pageSource.match(/\.md$/),
						passData: {
							posts: postData,
						},
					})
			}

			let langBase = pageTools.getBase(lang)
			for (let datum of postData) {
				feed.addItem({
					title: datum.title,
					id: datum.url,
					link: `${eunaURL}${langBase}${datum.path}`,
					description: datum.excerpt,
					author: [ eunaAuthor ],
					date: datum.date,
				})
			}
			fs.writeFileSync(`out${langBase}/feed.xml`, feed.atom1())

			cb_()
		} }

		eachI18n.push( ...Object.values(wrapper) )
	}

	return parallel( ...eachI18n, function buildPages(cb_) {
		for (let pageSource of glob.sync(`src/pages/**/*`)) {
			let outPath = toDir(pageSource.replace(/^src\/pages\//, ''))

			pageTools.compilePage(pageSource, 'en', 'out/' + outPath, {
				linkPath: outPath,
				useMarkdown: pageSource.match(/\.md$/),
			})
		}

		cb_()
	} )

	function toDir(str) {
		return str.replace(/(index)?\.(md|html)$/, '/index.html')
	}

	function insertSorted(array, el) {
		if (array.length === 0) {
			array.push(el)
			return
		}



		// if (array.length > 1)
		if (array[0].date < el.date) {
			array.unshift(el)
			return
		}
		for (let idx = 0; idx < array.length - 1; idx++) {
			if (array[idx].date > el.date && array[idx+1].date < el.date) {
				array.splice(idx+1, 0, el)
				return
			}
		}
		// else
		array.push(el)
	}
}

async function clean(cb) {
	await del('out/')
}

let buildPagesC = buildPages()

exports.default = parallel( buildPagesC, buildCSS, buildJS, buildRes )
exports.clean = clean

exports.pages = buildPagesC
exports.css = buildCSS
exports.js = buildJS
exports.res = buildRes
