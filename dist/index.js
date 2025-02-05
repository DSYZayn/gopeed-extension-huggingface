(()=>{"use strict";function e(e){return function(e){if(Array.isArray(e))return t(e)}(e)||function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}(e)||r(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function r(e,r){if(e){if("string"==typeof e)return t(e,r);var n={}.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?t(e,r):void 0}}function t(e,r){(null==r||r>e.length)&&(r=e.length);for(var t=0,n=Array(r);t<r;t++)n[t]=e[t];return n}gopeed.events.onResolve((async function(t){try{var n=new URL(t.req.url),a=n.host,o="www.modelscope.cn"===a?"master":"main",l=n.protocol,c=n.port||("https:"===l?443:80),i=n.pathname.substring(1).split("/");if(i.includes("resolve")||i.includes("spaces"))return;""===i[i.length-1]&&i.pop(),"models"!=i[0]&&"datasets"!=i[0]&&"spaces"!=i[0]&&(i=["models"].concat(e(i)));var u=(f=i.slice(1,3),m=2,function(e){if(Array.isArray(e))return e}(f)||function(e,r){var t=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=t){var n,a,o,l,c=[],i=!0,u=!1;try{if(o=(t=t.call(e)).next,0===r){if(Object(t)!==t)return;i=!1}else for(;!(i=(n=o.call(t)).done)&&(c.push(n.value),c.length!==r);i=!0);}catch(e){u=!0,a=e}finally{try{if(!i&&null!=t.return&&(l=t.return(),Object(l)!==l))return}finally{if(u)throw a}}return c}}(f,m)||r(f,m)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()),s=u[0],p=u[1];3===i.length&&(i=[].concat(e(i),["tree","main"])),gopeed.logger.debug("user:",s,"repo:",p);var d=i.join("/");d=d.replace("master","main"),gopeed.logger.debug(d),gopeed.logger.debug(i);var g=await async function e(r){var t="https://hf-mirror.com/api/".concat(r);gopeed.logger.debug("apiPath:",t);var n=await fetch(t,{headers:{Accept:"application/json"}});if(!n.ok)throw new Error("Failed to fetch ".concat(t));var a=await n.json();return(await Promise.all(a.map((async function(t){return"directory"===t.type?await e("".concat(r,"/").concat(t.path)):t})))).flat(1/0)}(d);t.res={name:s,files:function(e,r,t,n,a,o,l){return null==e?(gopeed.logger.debug("walkFiles: data is undefined or null"),[]):(gopeed.logger.debug("walkFiles: data is not undefined or null"),e.map((function(e){gopeed.logger.debug("item.path:",e.path);var c=t.replace("tree","resolve").replace("main","".concat(r));"main"==r&&t.includes("models")&&(c=c.replace("models/",""));var i=e.path,u="";return i.includes("/")&&(u="/"+(i=e.path.split("/")).slice(0,-1),i=i[i.length-1]),c=c.replace(new RegExp("".concat(u,"(?!.*").concat(u,")")),""),gopeed.logger.debug("a_path:",c),gopeed.logger.debug("name:",i),gopeed.logger.debug("b_path:",u),{name:i,path:"".concat(l).concat(u),size:e.size,req:{url:"".concat(n,"//").concat(a,":").concat(o,"/").concat(c).concat(u,"/").concat(i)}}})))}(g,o,d,l,a,c,p)}}catch(e){gopeed.logger.error("[HF Parser]",e),t.res={name:"Error",files:[]}}var f,m}))})();