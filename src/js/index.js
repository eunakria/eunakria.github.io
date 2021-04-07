const $ = x => document.querySelector(x)
const $$ = x => document.querySelectorAll(x)

let chargeText = $('.charge .large')
if (chargeText === null) {
	document.body.classList.add('show-subtitle')
}

window.addEventListener('scroll', evt => {
	if (window.scrollY <= 0) {
		document.body.classList.remove('scrolled')
	} else {
		document.body.classList.add('scrolled')
	}

	if (chargeText !== null) {
		if (chargeText.getBoundingClientRect().top > 0) {
			document.body.classList.remove('show-subtitle')
		} else {
			document.body.classList.add('show-subtitle')
		}
	}
})

let cl = document.body.classList
if (localStorage.getItem('prefTheme') === null) {
	if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
		localStorage.setItem('prefTheme', 'dark')
	} else {
		localStorage.setItem('prefTheme', 'light')
	}
}
if (localStorage.getItem('prefTheme') === 'dark') {
	cl.add('dark')
} else {
	cl.add('light')
}

let themeToggle = $('#theme-toggle')
setIcon(themeToggle)

themeToggle.addEventListener('click', evt => {
	if (cl.contains('dark')) {
		cl.remove('dark')
		cl.add('light')
		localStorage.setItem('prefTheme', 'light')
	} else {
		cl.remove('light')
		cl.add('dark')
		localStorage.setItem('prefTheme', 'dark')
	}
	setIcon(themeToggle)
})

function setIcon(el) {
	let use = el.querySelector('use')
	let iconName
	if (cl.contains('light')) {
		iconName = 'moon'
	} else {
		iconName = 'sun'
	}
	use.setAttribute('href', use.href.baseVal.replace(/#.*/, `#${iconName}`))
}

$('#lang-select').addEventListener('change', evt => {
	const langs = [ 'es' ]
	const defaultLang = 'en'

	let oldP = window.location.pathname
	let newP = oldP

	for (let lname of langs) {
		if (oldP.startsWith(`/${lname}`)) {
			newP = oldP.substr(lname.length + 1)
		}
	}
	if (evt.target.value !== defaultLang) {
		newP = '/' + evt.target.value + newP
	}

	window.location.pathname = newP
})

let archiveYearList = $('.archive-year-list')
if (archiveYearList !== undefined) {
	let heads = Array.from($$('.archive-year-head'))
	let listEls = Array.from($$('.archive-year-list li'))

	window.addEventListener('scroll', () => updateListHighlight())
	updateListHighlight() // Once when the page initializes

	function updateListHighlight() {
		let tops = heads.map(el => el.getBoundingClientRect().top)

		let headIdx = findLastIndex(tops, i => i <= 64+8)
		if (headIdx === -1) {
			headIdx = 0
		}

		for (let [liIdx, el] of listEls.entries()) {
			console.log(liIdx, headIdx)
			if (liIdx === headIdx) {
				el.classList.add('selected')
			} else {
				el.classList.remove('selected')
			}
		}
	}
}

function findLastIndex(arr, cond) {
	for (let idx = arr.length - 1; idx > -1; idx--) {
		if (cond(arr[idx])) {
			return idx
		}
	}

	return -1
}
