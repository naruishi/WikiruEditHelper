"use strict";function c(e,r,o){return e.split(`
`).filter(t=>/^\*{1,3}.*\[#\w+\]/.test(t)).map(t=>{let i=t.match(/^(\*{1,3})(.*)\[#(\w+)\]/);if(!i)return t;let s=i[1].replace(/\*/g,"-"),u=i[2].trim(),l=i[3];if(o==1){if(s=="---"||s=="--")return""}else if(o==2&&s=="---")return"";return`${s}[[${u}>${r}#${l}]]`}).join(`
`).split(`
`).filter(t=>t.trim()!=="").join(`
`)}function n(e){let r=document.getElementById(e);if(!r)throw new Error(`element with ID '${e}' not found.`);return r}var g=n("input"),a=n("output"),p=n("indent"),m=n("pageName");document.addEventListener("DOMContentLoaded",()=>{let e=document.getElementById("execute");e&&e.addEventListener("click",x)});function x(){let e=parseInt(p.value,10);a.value=c(g.value,m.value,e)}
//# sourceMappingURL=createContentsLink.js.map