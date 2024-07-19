!function(){function e(e,n){var r="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!r){if(Array.isArray(e)||(r=function(e,n){if(!e)return;if("string"==typeof e)return t(e,n);var r=Object.prototype.toString.call(e).slice(8,-1);"Object"===r&&e.constructor&&(r=e.constructor.name);if("Map"===r||"Set"===r)return Array.from(e);if("Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return t(e,n)}(e))||n&&e&&"number"==typeof e.length){r&&(e=r);var i=0,o=function(){};return{s:o,n:function(){return i>=e.length?{done:!0}:{done:!1,value:e[i++]}},e:function(e){throw e},f:o}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var s,a=!0,u=!1;return{s:function(){r=r.call(e)},n:function(){var e=r.next();return a=e.done,e},e:function(e){u=!0,s=e},f:function(){try{a||null==r.return||r.return()}finally{if(u)throw s}}}}function t(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}function n(e,t,n,r,i,o,s){try{var a=e[o](s),u=a.value}catch(c){return void n(c)}a.done?t(u):Promise.resolve(u).then(r,i)}function r(e){return function(){var t=this,r=arguments;return new Promise(function(i,o){var s=e.apply(t,r);function a(e){n(s,i,o,a,u,"next",e)}function u(e){n(s,i,o,a,u,"throw",e)}a(void 0)})}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function s(e,t,n){return t&&o(e.prototype,t),n&&o(e,n),e}(self.webpackChunkchatUi=self.webpackChunkchatUi||[]).push([[8708],{8708:function(t,n,o){"use strict";o.r(n),o.d(n,{ion_nav:function(){return p},ion_nav_link:function(){return g}});var a=o(3150),u=o(7585),c=o(7807),l=o(2377),v=o(4001),h=o(7330),f=function(){function e(t,n){i(this,e),this.component=t,this.params=n,this.state=1}var t;return s(e,[{key:"init",value:(t=r(regeneratorRuntime.mark(function e(t){var n;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(this.state=2,this.element){e.next=5;break}return n=this.component,e.next=4,(0,h.a)(this.delegate,t,n,["ion-page","ion-page-invisible"],this.params);case 4:this.element=e.sent;case 5:case"end":return e.stop()}},e,this)})),function(e){return t.apply(this,arguments)})},{key:"_destroy",value:function(){(0,l.l)(3!==this.state,"view state must be ATTACHED");var e=this.element;e&&(this.delegate?this.delegate.removeViewFromDom(e.parentElement,e):e.remove()),this.nav=void 0,this.state=3}}]),e}(),d=function(e,t,n){if(!e)return!1;if(e.component!==t)return!1;var r=e.params;if(r===n)return!0;if(!r&&!n)return!0;if(!r||!n)return!1;var i=Object.keys(r),o=Object.keys(n);if(i.length!==o.length)return!1;for(var s=0,a=i;s<a.length;s++){var u=a[s];if(r[u]!==n[u])return!1}return!0},m=function(e,t){return e?e instanceof f?e:new f(e,t):null},p=function(){function t(e){i(this,t),(0,a.r)(this,e),this.ionNavWillLoad=(0,a.e)(this,"ionNavWillLoad",7),this.ionNavWillChange=(0,a.e)(this,"ionNavWillChange",3),this.ionNavDidChange=(0,a.e)(this,"ionNavDidChange",3),this.transInstr=[],this.animationEnabled=!0,this.useRouter=!1,this.isTransitioning=!1,this.destroyed=!1,this.views=[],this.animated=!0}var n,h,p,g,y;return s(t,[{key:"swipeGestureChanged",value:function(){this.gesture&&this.gesture.enable(!0===this.swipeGesture)}},{key:"rootChanged",value:function(){void 0!==this.root&&(this.useRouter||this.setRoot(this.root,this.rootParams))}},{key:"componentWillLoad",value:function(){if(this.useRouter=!!document.querySelector("ion-router")&&!this.el.closest("[no-router]"),void 0===this.swipeGesture){var e=(0,u.b)(this);this.swipeGesture=u.c.getBoolean("swipeBackEnabled","ios"===e)}this.ionNavWillLoad.emit()}},{key:"componentDidLoad",value:(y=r(regeneratorRuntime.mark(function e(){return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return this.rootChanged(),e.next=3,o.e(3272).then(o.bind(o,3272));case 3:this.gesture=e.sent.createSwipeBackGesture(this.el,this.canStart.bind(this),this.onStart.bind(this),this.onMove.bind(this),this.onEnd.bind(this)),this.swipeGestureChanged();case 5:case"end":return e.stop()}},e,this)})),function(){return y.apply(this,arguments)})},{key:"disconnectedCallback",value:function(){var t,n=e(this.views);try{for(n.s();!(t=n.n()).done;){var r=t.value;(0,v.l)(r.element,v.d),r._destroy()}}catch(i){n.e(i)}finally{n.f()}this.gesture&&(this.gesture.destroy(),this.gesture=void 0),this.transInstr.length=this.views.length=0,this.destroyed=!0}},{key:"push",value:function(e,t,n,r){return this.queueTrns({insertStart:-1,insertViews:[{component:e,componentProps:t}],opts:n},r)}},{key:"insert",value:function(e,t,n,r,i){return this.queueTrns({insertStart:e,insertViews:[{component:t,componentProps:n}],opts:r},i)}},{key:"insertPages",value:function(e,t,n,r){return this.queueTrns({insertStart:e,insertViews:t,opts:n},r)}},{key:"pop",value:function(e,t){return this.queueTrns({removeStart:-1,removeCount:1,opts:e},t)}},{key:"popTo",value:function(e,t,n){var r={removeStart:-1,removeCount:-1,opts:t};return"object"==typeof e&&e.component?(r.removeView=e,r.removeStart=1):"number"==typeof e&&(r.removeStart=e+1),this.queueTrns(r,n)}},{key:"popToRoot",value:function(e,t){return this.queueTrns({removeStart:1,removeCount:-1,opts:e},t)}},{key:"removeIndex",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1,n=arguments.length>2?arguments[2]:void 0,r=arguments.length>3?arguments[3]:void 0;return this.queueTrns({removeStart:e,removeCount:t,opts:n},r)}},{key:"setRoot",value:function(e,t,n,r){return this.setPages([{component:e,componentProps:t}],n,r)}},{key:"setPages",value:function(e,t,n){return null==t&&(t={}),!0!==t.animated&&(t.animated=!1),this.queueTrns({insertStart:0,insertViews:e,removeStart:0,removeCount:-1,opts:t},n)}},{key:"setRouteId",value:function(e,t,n,i){var o,s=this.getActiveSync();if(d(s,e,t))return Promise.resolve({changed:!1,element:s.element});var a,u=new Promise(function(e){return o=e}),c={updateURL:!1,viewIsReady:function(e){var t,n,i=new Promise(function(e){return t=e});return o({changed:!0,element:e,markVisible:(n=r(regeneratorRuntime.mark(function e(){return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return t(),e.next=3,a;case 3:case"end":return e.stop()}},e)})),function(){return n.apply(this,arguments)})}),i}};if("root"===n)a=this.setRoot(e,t,c);else{var l=this.views.find(function(n){return d(n,e,t)});l?a=this.popTo(l,Object.assign(Object.assign({},c),{direction:"back",animationBuilder:i})):"forward"===n?a=this.push(e,t,Object.assign(Object.assign({},c),{animationBuilder:i})):"back"===n&&(a=this.setRoot(e,t,Object.assign(Object.assign({},c),{direction:"back",animated:!0,animationBuilder:i})))}return u}},{key:"getRouteId",value:(g=r(regeneratorRuntime.mark(function e(){var t;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return t=this.getActiveSync(),e.abrupt("return",t?{id:t.element.tagName,params:t.params,element:t.element}:void 0);case 2:case"end":return e.stop()}},e,this)})),function(){return g.apply(this,arguments)})},{key:"getActive",value:function(){return Promise.resolve(this.getActiveSync())}},{key:"getByIndex",value:function(e){return Promise.resolve(this.views[e])}},{key:"canGoBack",value:function(e){return Promise.resolve(this.canGoBackSync(e))}},{key:"getPrevious",value:function(e){return Promise.resolve(this.getPreviousSync(e))}},{key:"getLength",value:function(){return this.views.length}},{key:"getActiveSync",value:function(){return this.views[this.views.length-1]}},{key:"canGoBackSync",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.getActiveSync();return!(!e||!this.getPreviousSync(e))}},{key:"getPreviousSync",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.getActiveSync();if(e){var t=this.views,n=t.indexOf(e);return n>0?t[n-1]:void 0}}},{key:"queueTrns",value:(p=r(regeneratorRuntime.mark(function e(t,n){var r,i,o;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(!this.isTransitioning||null==t.opts||!t.opts.skipIfBusy){e.next=2;break}return e.abrupt("return",Promise.resolve(!1));case 2:if(r=new Promise(function(e,n){t.resolve=e,t.reject=n}),t.done=n,!t.opts||!1===t.opts.updateURL||!this.useRouter){e.next=13;break}if(!(i=document.querySelector("ion-router"))){e.next=13;break}return e.next=8,i.canTransition();case 8:if(!1!==(o=e.sent)){e.next=11;break}return e.abrupt("return",Promise.resolve(!1));case 11:if("string"!=typeof o){e.next=13;break}return e.abrupt("return",(i.push(o,t.opts.direction||"back"),Promise.resolve(!1)));case 13:return e.abrupt("return",(t.insertViews&&0===t.insertViews.length&&(t.insertViews=void 0),this.transInstr.push(t),this.nextTrns(),r));case 14:case"end":return e.stop()}},e,this)})),function(e,t){return p.apply(this,arguments)})},{key:"success",value:function(e,t){if(this.destroyed)this.fireError("nav controller was destroyed",t);else if(t.done&&t.done(e.hasCompleted,e.requiresTransition,e.enteringView,e.leavingView,e.direction),t.resolve(e.hasCompleted),!1!==t.opts.updateURL&&this.useRouter){var n=document.querySelector("ion-router");n&&n.navChanged("back"===e.direction?"back":"forward")}}},{key:"failed",value:function(e,t){this.destroyed?this.fireError("nav controller was destroyed",t):(this.transInstr.length=0,this.fireError(e,t))}},{key:"fireError",value:function(e,t){t.done&&t.done(!1,!1,e),t.reject&&!this.destroyed?t.reject(e):t.resolve(!1)}},{key:"nextTrns",value:function(){if(this.isTransitioning)return!1;var e=this.transInstr.shift();return!!e&&(this.runTransition(e),!0)}},{key:"runTransition",value:(h=r(regeneratorRuntime.mark(function e(t){var n,r,i,o;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(e.prev=0,this.ionNavWillChange.emit(),this.isTransitioning=!0,this.prepareTI(t),n=this.getActiveSync(),r=this.getEnteringView(t,n),n||r){e.next=5;break}throw new Error("no views in the stack to be removed");case 5:if(e.t0=r&&1===r.state,!e.t0){e.next=9;break}return e.next=9,r.init(this.el);case 9:if(this.postViewInit(r,n,t),(i=(t.enteringRequiresTransition||t.leavingRequiresTransition)&&r!==n)&&t.opts&&n&&("back"===t.opts.direction&&(t.opts.animationBuilder=t.opts.animationBuilder||r&&r.animationBuilder),n.animationBuilder=t.opts.animationBuilder),!i){e.next=18;break}return e.next=15,this.transition(r,n,t);case 15:e.t1=e.sent,e.next=19;break;case 18:e.t1={hasCompleted:!0,requiresTransition:!1};case 19:o=e.t1,this.success(o,t),this.ionNavDidChange.emit(),e.next=26;break;case 23:e.prev=23,e.t2=e.catch(0),this.failed(e.t2,t);case 26:this.isTransitioning=!1,this.nextTrns();case 27:case"end":return e.stop()}},e,this,[[0,23]])})),function(e){return h.apply(this,arguments)})},{key:"prepareTI",value:function(t){var n=this.views.length;if(t.opts=t.opts||{},void 0===t.opts.delegate&&(t.opts.delegate=this.delegate),void 0!==t.removeView){(0,l.l)(void 0!==t.removeStart,"removeView needs removeStart"),(0,l.l)(void 0!==t.removeCount,"removeView needs removeCount");var r=this.views.indexOf(t.removeView);if(r<0)throw new Error("removeView was not found");t.removeStart+=r}void 0!==t.removeStart&&(t.removeStart<0&&(t.removeStart=n-1),t.removeCount<0&&(t.removeCount=n-t.removeStart),t.leavingRequiresTransition=t.removeCount>0&&t.removeStart+t.removeCount===n),t.insertViews&&((t.insertStart<0||t.insertStart>n)&&(t.insertStart=n),t.enteringRequiresTransition=t.insertStart===n);var i=t.insertViews;if(i){(0,l.l)(i.length>0,"length can not be zero");var o=i.map(function(e){return e instanceof f?e:"component"in e?m(e.component,null===e.componentProps?void 0:e.componentProps):m(e,void 0)}).filter(function(e){return null!==e});if(0===o.length)throw new Error("invalid views to insert");var s,a=e(o);try{for(a.s();!(s=a.n()).done;){var u=s.value;u.delegate=t.opts.delegate;var c=u.nav;if(c&&c!==this)throw new Error("inserted view was already inserted");if(3===u.state)throw new Error("inserted view was already destroyed")}}catch(v){a.e(v)}finally{a.f()}t.insertViews=o}}},{key:"getEnteringView",value:function(e,t){var n=e.insertViews;if(void 0!==n)return n[n.length-1];var r=e.removeStart;if(void 0!==r)for(var i=this.views,o=r+e.removeCount,s=i.length-1;s>=0;s--){var a=i[s];if((s<r||s>=o)&&a!==t)return a}}},{key:"postViewInit",value:function(t,n,r){(0,l.l)(n||t,"Both leavingView and enteringView are null"),(0,l.l)(r.resolve,"resolve must be valid"),(0,l.l)(r.reject,"reject must be valid");var i,o=r.opts,s=r.insertViews,a=r.removeStart,u=r.removeCount;if(void 0!==a&&void 0!==u){(0,l.l)(a>=0,"removeStart can not be negative"),(0,l.l)(u>=0,"removeCount can not be negative"),i=[];for(var c=0;c<u;c++){var h=this.views[c+a];h&&h!==t&&h!==n&&i.push(h)}o.direction=o.direction||"back"}var f=this.views.length+(void 0!==s?s.length:0)-(void 0!==u?u:0);if((0,l.l)(f>=0,"final balance can not be negative"),0===f)throw console.warn("You can't remove all the pages in the navigation stack. nav.pop() is probably called too many times.",this,this.el),new Error("navigation stack needs at least one root page");if(s){var d,m=r.insertStart,p=e(s);try{for(p.s();!(d=p.n()).done;){var g=d.value;this.insertViewAt(g,m),m++}}catch(T){p.e(T)}finally{p.f()}r.enteringRequiresTransition&&(o.direction=o.direction||"forward")}if(i&&i.length>0){var y,w=e(i);try{for(w.s();!(y=w.n()).done;){var k=y.value;(0,v.l)(k.element,v.b),(0,v.l)(k.element,v.c),(0,v.l)(k.element,v.d)}}catch(T){w.e(T)}finally{w.f()}var b,S=e(i);try{for(S.s();!(b=S.n()).done;){var C=b.value;this.destroyView(C)}}catch(T){S.e(T)}finally{S.f()}}}},{key:"transition",value:(n=r(regeneratorRuntime.mark(function e(t,n,r){var i,o,s,a,c,l,h,f,d=this;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return i=r.opts,o=i.progressAnimation?function(e){return d.sbAni=e}:void 0,s=(0,u.b)(this),a=t.element,c=n&&n.element,l=Object.assign(Object.assign({mode:s,showGoBack:this.canGoBackSync(t),baseEl:this.el,progressCallback:o,animated:this.animated&&u.c.getBoolean("animated",!0),enteringEl:a,leavingEl:c},i),{animationBuilder:i.animationBuilder||this.animation||u.c.get("navAnimation")}),e.next=8,(0,v.t)(l);case 8:return h=e.sent,f=h.hasCompleted,e.abrupt("return",this.transitionFinish(f,t,n,i));case 11:case"end":return e.stop()}},e,this)})),function(e,t,r){return n.apply(this,arguments)})},{key:"transitionFinish",value:function(e,t,n,r){var i=e?t:n;return i&&this.cleanup(i),{hasCompleted:e,requiresTransition:!0,enteringView:t,leavingView:n,direction:r.direction}}},{key:"insertViewAt",value:function(e,t){var n=this.views,r=n.indexOf(e);r>-1?((0,l.l)(e.nav===this,"view is not part of the nav"),n.splice(t,0,n.splice(r,1)[0])):((0,l.l)(!e.nav,"nav is used"),e.nav=this,n.splice(t,0,e))}},{key:"removeView",value:function(e){(0,l.l)(2===e.state||3===e.state,"view state should be loaded or destroyed");var t=this.views,n=t.indexOf(e);(0,l.l)(n>-1,"view must be part of the stack"),n>=0&&t.splice(n,1)}},{key:"destroyView",value:function(e){e._destroy(),this.removeView(e)}},{key:"cleanup",value:function(e){if(!this.destroyed)for(var t=this.views,n=t.indexOf(e),r=t.length-1;r>=0;r--){var i=t[r],o=i.element;o&&(r>n?((0,v.l)(o,v.d),this.destroyView(i)):r<n&&(0,v.s)(o,!0))}}},{key:"canStart",value:function(){return!!this.swipeGesture&&!this.isTransitioning&&0===this.transInstr.length&&this.animationEnabled&&this.canGoBackSync()}},{key:"onStart",value:function(){this.queueTrns({removeStart:-1,removeCount:1,opts:{direction:"back",progressAnimation:!0}},void 0)}},{key:"onMove",value:function(e){this.sbAni&&this.sbAni.progressStep(e)}},{key:"onEnd",value:function(e,t,n){var r=this;if(this.sbAni){this.animationEnabled=!1,this.sbAni.onFinish(function(){r.animationEnabled=!0},{oneTimeCallback:!0});var i=e?-.001:.001;e?i+=(0,c.g)([0,0],[.32,.72],[0,1],[1,1],t)[0]:(this.sbAni.easing("cubic-bezier(1, 0, 0.68, 0.28)"),i+=(0,c.g)([0,0],[1,0],[.68,.28],[1,1],t)[0]),this.sbAni.progressEnd(e?1:0,i,n)}}},{key:"render",value:function(){return(0,a.h)("slot",null)}},{key:"el",get:function(){return(0,a.i)(this)}}],[{key:"watchers",get:function(){return{swipeGesture:["swipeGestureChanged"],root:["rootChanged"]}}}]),t}();p.style=":host{left:0;right:0;top:0;bottom:0;position:absolute;contain:layout size style;overflow:hidden;z-index:0}";var g=function(){function e(t){var n=this;i(this,e),(0,a.r)(this,t),this.routerDirection="forward",this.onClick=function(){return function(e,t,r,i,o){var s=n.el.closest("ion-nav");if(s)if("forward"===t){if(void 0!==r)return s.push(r,i,{skipIfBusy:!0,animationBuilder:o})}else if("root"===t){if(void 0!==r)return s.setRoot(r,i,{skipIfBusy:!0,animationBuilder:o})}else if("back"===t)return s.pop({skipIfBusy:!0,animationBuilder:o});return Promise.resolve(!1)}(0,n.routerDirection,n.component,n.componentProps,n.routerAnimation)}}return s(e,[{key:"render",value:function(){return(0,a.h)(a.H,{onClick:this.onClick})}},{key:"el",get:function(){return(0,a.i)(this)}}]),e}()}}])}();