(self.webpackChunkchatUi=self.webpackChunkchatUi||[]).push([[8592],{8225:function(t,e,n){"use strict";n.d(e,{c:function(){return s}});var r=n(3150),i=n(2954),o=n(9461);const s=(t,e)=>{let n,s;const c=(t,r,i)=>{if("undefined"==typeof document)return;const o=document.elementFromPoint(t,r);o&&e(o)?o!==n&&(l(),a(o,i)):l()},a=(t,e)=>{n=t,s||(s=n);const i=n;(0,r.c)(()=>i.classList.add("ion-activated")),e()},l=(t=!1)=>{if(!n)return;const e=n;(0,r.c)(()=>e.classList.remove("ion-activated")),t&&s!==n&&n.click(),n=void 0};return(0,o.createGesture)({el:t,gestureName:"buttonActiveDrag",threshold:0,onStart:t=>c(t.currentX,t.currentY,i.a),onMove:t=>c(t.currentX,t.currentY,i.b),onEnd:()=>{l(!0),(0,i.h)(),s=void 0}})}},7330:function(t,e,n){"use strict";n.d(e,{a:function(){return i},d:function(){return o}});var r=n(2377);const i=async(t,e,n,i,o)=>{if(t)return t.attachViewToDom(e,n,o,i);if("string"!=typeof n&&!(n instanceof HTMLElement))throw new Error("framework delegate is missing");const s="string"==typeof n?e.ownerDocument&&e.ownerDocument.createElement(n):n;return i&&i.forEach(t=>s.classList.add(t)),o&&Object.assign(s,o),e.appendChild(s),await new Promise(t=>(0,r.c)(s,t)),s},o=(t,e)=>{if(e){if(t)return t.removeViewFromDom(e.parentElement,e);e.remove()}return Promise.resolve()}},2954:function(t,e,n){"use strict";n.d(e,{a:function(){return o},b:function(){return s},c:function(){return i},d:function(){return a},h:function(){return c}});const r={getEngine(){const t=window;return t.TapticEngine||t.Capacitor&&t.Capacitor.isPluginAvailable("Haptics")&&t.Capacitor.Plugins.Haptics},available(){return!!this.getEngine()},isCordova:()=>!!window.TapticEngine,isCapacitor:()=>!!window.Capacitor,impact(t){const e=this.getEngine();if(!e)return;const n=this.isCapacitor()?t.style.toUpperCase():t.style;e.impact({style:n})},notification(t){const e=this.getEngine();if(!e)return;const n=this.isCapacitor()?t.style.toUpperCase():t.style;e.notification({style:n})},selection(){this.impact({style:"light"})},selectionStart(){const t=this.getEngine();t&&(this.isCapacitor()?t.selectionStart():t.gestureSelectionStart())},selectionChanged(){const t=this.getEngine();t&&(this.isCapacitor()?t.selectionChanged():t.gestureSelectionChanged())},selectionEnd(){const t=this.getEngine();t&&(this.isCapacitor()?t.selectionEnd():t.gestureSelectionEnd())}},i=()=>{r.selection()},o=()=>{r.selectionStart()},s=()=>{r.selectionChanged()},c=()=>{r.selectionEnd()},a=t=>{r.impact(t)}},6575:function(t,e,n){"use strict";n.d(e,{s:function(){return r}});const r=t=>{try{if(t instanceof class{constructor(t){this.value=t}})return t.value;if(!s()||"string"!=typeof t||""===t)return t;const e=document.createDocumentFragment(),n=document.createElement("div");e.appendChild(n),n.innerHTML=t,a.forEach(t=>{const n=e.querySelectorAll(t);for(let r=n.length-1;r>=0;r--){const t=n[r];t.parentNode?t.parentNode.removeChild(t):e.removeChild(t);const s=o(t);for(let e=0;e<s.length;e++)i(s[e])}});const r=o(e);for(let t=0;t<r.length;t++)i(r[t]);const c=document.createElement("div");c.appendChild(e);const l=c.querySelector("div");return null!==l?l.innerHTML:c.innerHTML}catch(e){return console.error(e),""}},i=t=>{if(t.nodeType&&1!==t.nodeType)return;for(let n=t.attributes.length-1;n>=0;n--){const e=t.attributes.item(n),r=e.name;if(!c.includes(r.toLowerCase())){t.removeAttribute(r);continue}const i=e.value;null!=i&&i.toLowerCase().includes("javascript:")&&t.removeAttribute(r)}const e=o(t);for(let n=0;n<e.length;n++)i(e[n])},o=t=>null!=t.children?t.children:t.childNodes,s=()=>{const t=window,e=t&&t.Ionic&&t.Ionic.config;return!e||(e.get?e.get("sanitizerEnabled",!0):!0===e.sanitizerEnabled||void 0===e.sanitizerEnabled)},c=["class","id","href","src","name","slot"],a=["script","style","iframe","meta","link","object","embed"]},408:function(t,e,n){"use strict";n.d(e,{S:function(){return r}});const r={bubbles:{dur:1e3,circles:9,fn:(t,e,n)=>{const r=t*e/n-t+"ms",i=2*Math.PI*e/n;return{r:5,style:{top:9*Math.sin(i)+"px",left:9*Math.cos(i)+"px","animation-delay":r}}}},circles:{dur:1e3,circles:8,fn:(t,e,n)=>{const r=e/n,i=t*r-t+"ms",o=2*Math.PI*r;return{r:5,style:{top:9*Math.sin(o)+"px",left:9*Math.cos(o)+"px","animation-delay":i}}}},circular:{dur:1400,elmDuration:!0,circles:1,fn:()=>({r:20,cx:48,cy:48,fill:"none",viewBox:"24 24 48 48",transform:"translate(0,0)",style:{}})},crescent:{dur:750,circles:1,fn:()=>({r:26,style:{}})},dots:{dur:750,circles:3,fn:(t,e)=>({r:6,style:{left:9-9*e+"px","animation-delay":-110*e+"ms"}})},lines:{dur:1e3,lines:12,fn:(t,e,n)=>({y1:17,y2:29,style:{transform:`rotate(${30*e+(e<6?180:-180)}deg)`,"animation-delay":t*e/n-t+"ms"}})},"lines-small":{dur:1e3,lines:12,fn:(t,e,n)=>({y1:12,y2:20,style:{transform:`rotate(${30*e+(e<6?180:-180)}deg)`,"animation-delay":t*e/n-t+"ms"}})}}},1269:function(t,e,n){"use strict";n.d(e,{c:function(){return i},g:function(){return o},h:function(){return r},o:function(){return c}});const r=(t,e)=>null!==e.closest(t),i=(t,e)=>"string"==typeof t&&t.length>0?Object.assign({"ion-color":!0,[`ion-color-${t}`]:!0},e):e,o=t=>{const e={};return(t=>void 0!==t?(Array.isArray(t)?t:t.split(" ")).filter(t=>null!=t).map(t=>t.trim()).filter(t=>""!==t):[])(t).forEach(t=>e[t]=!0),e},s=/^[a-z][a-z0-9+\-.]*:/,c=async(t,e,n,r)=>{if(null!=t&&"#"!==t[0]&&!s.test(t)){const i=document.querySelector("ion-router");if(i)return null!=e&&e.preventDefault(),i.push(t,n,r)}return!1}}}]);