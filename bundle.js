!function(){"use strict";const e=e=>document.querySelector(e),t=e=>document.querySelectorAll(e);let l=e(".charge .large");null===l&&document.body.classList.add("show-subtitle"),window.addEventListener("scroll",(e=>{window.scrollY<=0?document.body.classList.remove("scrolled"):document.body.classList.add("scrolled"),null!==l&&(l.getBoundingClientRect().top>0?document.body.classList.remove("show-subtitle"):document.body.classList.add("show-subtitle"))}));let o=function(){},a=document.body.classList;null===localStorage.getItem("prefTheme")&&(window.matchMedia("(prefers-color-scheme: dark)").matches?localStorage.setItem("prefTheme","dark"):localStorage.setItem("prefTheme","light")),"dark"===localStorage.getItem("prefTheme")?a.add("dark"):a.add("light");let r=e("#theme-toggle");function s(e){let t,l=e.querySelector("use");t=a.contains("light")?"moon":"sun",l.setAttribute("href",l.href.baseVal.replace(/#.*/,`#${t}`))}if(s(r),r.addEventListener("click",(e=>{a.contains("dark")?(a.remove("dark"),a.add("light"),o("github-light"),localStorage.setItem("prefTheme","light")):(a.remove("light"),a.add("dark"),o("github-dark"),localStorage.setItem("prefTheme","dark")),s(r)})),window.addEventListener("message",(t=>{if(console.log(t),"https://utteranc.es"!==t.origin)return;let l=e(".utterances-frame");null!==l&&(o=function(e){console.log(e),l.contentWindow.postMessage({type:"set-theme",theme:e},"https://utteranc.es")},"dark"===localStorage.getItem("prefTheme")?(a.add("dark"),o("github-dark")):(a.add("light"),o("github-light")))})),e("#lang-select").addEventListener("change",(e=>{const t=["es"];let l=window.location.pathname,o=l;for(let e of t)l.startsWith(`/${e}`)&&(o=l.substr(e.length+1));"en"!==e.target.value&&(o="/"+e.target.value+o),window.location.pathname=o})),void 0!==e(".archive-year-list")){let e=Array.from(t(".archive-year-head")),l=Array.from(t(".archive-year-list li"));function o(){let t=function(e,t){for(let l=e.length-1;l>-1;l--)if(t(e[l]))return l;return-1}(e.map((e=>e.getBoundingClientRect().top)),(e=>e<=72));-1===t&&(t=0);for(let[e,o]of l.entries())console.log(e,t),e===t?o.classList.add("selected"):o.classList.remove("selected")}window.addEventListener("scroll",(()=>o())),o()}}();
