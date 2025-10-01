import{Y as Fe,Z as _i,_ as We,$ as Pi,a0 as Mi,a1 as Ri,a2 as Ti,a3 as at,a4 as Ii,a5 as Oi,a6 as Ni,a7 as to,a8 as Di,a9 as ji,aa as ce}from"./vendor-C3FY1KRk.js";import{c as J,a as Ot}from"./radix-core-BA32w1ww.js";import{r as Lr,R as Fi,u as Li,o as Vi,s as $i,f as Bi,a as Ui,b as zi,h as Hi,l as qi}from"./react-dom-Cho0BGgy.js";function Wi(e,t){for(var r=0;r<t.length;r++){const n=t[r];if(typeof n!="string"&&!Array.isArray(n)){for(const o in n)if(o!=="default"&&!(o in e)){const a=Object.getOwnPropertyDescriptor(n,o);a&&Object.defineProperty(e,o,a.get?a:{enumerable:!0,get:()=>n[o]})}}}return Object.freeze(Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}))}var Vd=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function Ki(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}function $d(e){if(Object.prototype.hasOwnProperty.call(e,"__esModule"))return e;var t=e.default;if(typeof t=="function"){var r=function n(){var o=!1;try{o=this instanceof n}catch{}return o?Reflect.construct(t,arguments,this.constructor):t.apply(this,arguments)};r.prototype=t.prototype}else r={};return Object.defineProperty(r,"__esModule",{value:!0}),Object.keys(e).forEach(function(n){var o=Object.getOwnPropertyDescriptor(e,n);Object.defineProperty(r,n,o.get?o:{enumerable:!0,get:function(){return e[n]}})}),r}var or={exports:{}},pt={},ar={exports:{}},X={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var fn;function Gi(){if(fn)return X;fn=1;var e=Symbol.for("react.element"),t=Symbol.for("react.portal"),r=Symbol.for("react.fragment"),n=Symbol.for("react.strict_mode"),o=Symbol.for("react.profiler"),a=Symbol.for("react.provider"),i=Symbol.for("react.context"),s=Symbol.for("react.forward_ref"),l=Symbol.for("react.suspense"),d=Symbol.for("react.memo"),p=Symbol.for("react.lazy"),h=Symbol.iterator;function m(b){return b===null||typeof b!="object"?null:(b=h&&b[h]||b["@@iterator"],typeof b=="function"?b:null)}var C={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},E=Object.assign,f={};function u(b,P,Y){this.props=b,this.context=P,this.refs=f,this.updater=Y||C}u.prototype.isReactComponent={},u.prototype.setState=function(b,P){if(typeof b!="object"&&typeof b!="function"&&b!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,b,P,"setState")},u.prototype.forceUpdate=function(b){this.updater.enqueueForceUpdate(this,b,"forceUpdate")};function g(){}g.prototype=u.prototype;function v(b,P,Y){this.props=b,this.context=P,this.refs=f,this.updater=Y||C}var k=v.prototype=new g;k.constructor=v,E(k,u.prototype),k.isPureReactComponent=!0;var _=Array.isArray,R=Object.prototype.hasOwnProperty,V={current:null},I={key:!0,ref:!0,__self:!0,__source:!0};function $(b,P,Y){var te,re={},ie=null,N=null;if(P!=null)for(te in P.ref!==void 0&&(N=P.ref),P.key!==void 0&&(ie=""+P.key),P)R.call(P,te)&&!I.hasOwnProperty(te)&&(re[te]=P[te]);var U=arguments.length-2;if(U===1)re.children=Y;else if(1<U){for(var K=Array(U),G=0;G<U;G++)K[G]=arguments[G+2];re.children=K}if(b&&b.defaultProps)for(te in U=b.defaultProps,U)re[te]===void 0&&(re[te]=U[te]);return{$$typeof:e,type:b,key:ie,ref:N,props:re,_owner:V.current}}function Q(b,P){return{$$typeof:e,type:b.type,key:P,ref:b.ref,props:b.props,_owner:b._owner}}function ee(b){return typeof b=="object"&&b!==null&&b.$$typeof===e}function H(b){var P={"=":"=0",":":"=2"};return"$"+b.replace(/[=:]/g,function(Y){return P[Y]})}var j=/\/+/g;function F(b,P){return typeof b=="object"&&b!==null&&b.key!=null?H(""+b.key):P.toString(36)}function W(b,P,Y,te,re){var ie=typeof b;(ie==="undefined"||ie==="boolean")&&(b=null);var N=!1;if(b===null)N=!0;else switch(ie){case"string":case"number":N=!0;break;case"object":switch(b.$$typeof){case e:case t:N=!0}}if(N)return N=b,re=re(N),b=te===""?"."+F(N,0):te,_(re)?(Y="",b!=null&&(Y=b.replace(j,"$&/")+"/"),W(re,P,Y,"",function(G){return G})):re!=null&&(ee(re)&&(re=Q(re,Y+(!re.key||N&&N.key===re.key?"":(""+re.key).replace(j,"$&/")+"/")+b)),P.push(re)),1;if(N=0,te=te===""?".":te+":",_(b))for(var U=0;U<b.length;U++){ie=b[U];var K=te+F(ie,U);N+=W(ie,P,Y,K,re)}else if(K=m(b),typeof K=="function")for(b=K.call(b),U=0;!(ie=b.next()).done;)ie=ie.value,K=te+F(ie,U++),N+=W(ie,P,Y,K,re);else if(ie==="object")throw P=String(b),Error("Objects are not valid as a React child (found: "+(P==="[object Object]"?"object with keys {"+Object.keys(b).join(", ")+"}":P)+"). If you meant to render a collection of children, use an array instead.");return N}function Z(b,P,Y){if(b==null)return b;var te=[],re=0;return W(b,te,"","",function(ie){return P.call(Y,ie,re++)}),te}function z(b){if(b._status===-1){var P=b._result;P=P(),P.then(function(Y){(b._status===0||b._status===-1)&&(b._status=1,b._result=Y)},function(Y){(b._status===0||b._status===-1)&&(b._status=2,b._result=Y)}),b._status===-1&&(b._status=0,b._result=P)}if(b._status===1)return b._result.default;throw b._result}var B={current:null},ne={transition:null},pe={ReactCurrentDispatcher:B,ReactCurrentBatchConfig:ne,ReactCurrentOwner:V};function Ce(){throw Error("act(...) is not supported in production builds of React.")}return X.Children={map:Z,forEach:function(b,P,Y){Z(b,function(){P.apply(this,arguments)},Y)},count:function(b){var P=0;return Z(b,function(){P++}),P},toArray:function(b){return Z(b,function(P){return P})||[]},only:function(b){if(!ee(b))throw Error("React.Children.only expected to receive a single React element child.");return b}},X.Component=u,X.Fragment=r,X.Profiler=o,X.PureComponent=v,X.StrictMode=n,X.Suspense=l,X.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=pe,X.act=Ce,X.cloneElement=function(b,P,Y){if(b==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+b+".");var te=E({},b.props),re=b.key,ie=b.ref,N=b._owner;if(P!=null){if(P.ref!==void 0&&(ie=P.ref,N=V.current),P.key!==void 0&&(re=""+P.key),b.type&&b.type.defaultProps)var U=b.type.defaultProps;for(K in P)R.call(P,K)&&!I.hasOwnProperty(K)&&(te[K]=P[K]===void 0&&U!==void 0?U[K]:P[K])}var K=arguments.length-2;if(K===1)te.children=Y;else if(1<K){U=Array(K);for(var G=0;G<K;G++)U[G]=arguments[G+2];te.children=U}return{$$typeof:e,type:b.type,key:re,ref:ie,props:te,_owner:N}},X.createContext=function(b){return b={$$typeof:i,_currentValue:b,_currentValue2:b,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},b.Provider={$$typeof:a,_context:b},b.Consumer=b},X.createElement=$,X.createFactory=function(b){var P=$.bind(null,b);return P.type=b,P},X.createRef=function(){return{current:null}},X.forwardRef=function(b){return{$$typeof:s,render:b}},X.isValidElement=ee,X.lazy=function(b){return{$$typeof:p,_payload:{_status:-1,_result:b},_init:z}},X.memo=function(b,P){return{$$typeof:d,type:b,compare:P===void 0?null:P}},X.startTransition=function(b){var P=ne.transition;ne.transition={};try{b()}finally{ne.transition=P}},X.unstable_act=Ce,X.useCallback=function(b,P){return B.current.useCallback(b,P)},X.useContext=function(b){return B.current.useContext(b)},X.useDebugValue=function(){},X.useDeferredValue=function(b){return B.current.useDeferredValue(b)},X.useEffect=function(b,P){return B.current.useEffect(b,P)},X.useId=function(){return B.current.useId()},X.useImperativeHandle=function(b,P,Y){return B.current.useImperativeHandle(b,P,Y)},X.useInsertionEffect=function(b,P){return B.current.useInsertionEffect(b,P)},X.useLayoutEffect=function(b,P){return B.current.useLayoutEffect(b,P)},X.useMemo=function(b,P){return B.current.useMemo(b,P)},X.useReducer=function(b,P,Y){return B.current.useReducer(b,P,Y)},X.useRef=function(b){return B.current.useRef(b)},X.useState=function(b){return B.current.useState(b)},X.useSyncExternalStore=function(b,P,Y){return B.current.useSyncExternalStore(b,P,Y)},X.useTransition=function(){return B.current.useTransition()},X.version="18.3.1",X}var pn;function ro(){return pn||(pn=1,ar.exports=Gi()),ar.exports}/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var yn;function Zi(){if(yn)return pt;yn=1;var e=ro(),t=Symbol.for("react.element"),r=Symbol.for("react.fragment"),n=Object.prototype.hasOwnProperty,o=e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,a={key:!0,ref:!0,__self:!0,__source:!0};function i(s,l,d){var p,h={},m=null,C=null;d!==void 0&&(m=""+d),l.key!==void 0&&(m=""+l.key),l.ref!==void 0&&(C=l.ref);for(p in l)n.call(l,p)&&!a.hasOwnProperty(p)&&(h[p]=l[p]);if(s&&s.defaultProps)for(p in l=s.defaultProps,l)h[p]===void 0&&(h[p]=l[p]);return{$$typeof:t,type:s,key:m,ref:C,props:h,_owner:o.current}}return pt.Fragment=r,pt.jsx=i,pt.jsxs=i,pt}var hn;function Yi(){return hn||(hn=1,or.exports=Zi()),or.exports}var S=Yi(),c=ro();const ye=Ki(c),no=Wi({__proto__:null,default:ye},[c]);var Xi=e=>typeof e=="function",mr=(e,t)=>Xi(e)?e(t):e,Ji=(()=>{let e=0;return()=>(++e).toString()})(),Qi=(()=>{let e;return()=>{if(e===void 0&&typeof window<"u"){let t=matchMedia("(prefers-reduced-motion: reduce)");e=!t||t.matches}return e}})(),es=20,oo=(e,t)=>{switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,es)};case 1:return{...e,toasts:e.toasts.map(a=>a.id===t.toast.id?{...a,...t.toast}:a)};case 2:let{toast:r}=t;return oo(e,{type:e.toasts.find(a=>a.id===r.id)?1:0,toast:r});case 3:let{toastId:n}=t;return{...e,toasts:e.toasts.map(a=>a.id===n||n===void 0?{...a,dismissed:!0,visible:!1}:a)};case 4:return t.toastId===void 0?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(a=>a.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let o=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(a=>({...a,pauseDuration:a.pauseDuration+o}))}}},ts=[],ir={toasts:[],pausedAt:void 0},Vr=e=>{ir=oo(ir,e),ts.forEach(t=>{t(ir)})},rs=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(r==null?void 0:r.id)||Ji()}),kt=e=>(t,r)=>{let n=rs(t,e,r);return Vr({type:2,toast:n}),n.id},Ee=(e,t)=>kt("blank")(e,t);Ee.error=kt("error");Ee.success=kt("success");Ee.loading=kt("loading");Ee.custom=kt("custom");Ee.dismiss=e=>{Vr({type:3,toastId:e})};Ee.remove=e=>Vr({type:4,toastId:e});Ee.promise=(e,t,r)=>{let n=Ee.loading(t.loading,{...r,...r==null?void 0:r.loading});return typeof e=="function"&&(e=e()),e.then(o=>{let a=t.success?mr(t.success,o):void 0;return a?Ee.success(a,{id:n,...r,...r==null?void 0:r.success}):Ee.dismiss(n),o}).catch(o=>{let a=t.error?mr(t.error,o):void 0;a?Ee.error(a,{id:n,...r,...r==null?void 0:r.error}):Ee.dismiss(n)}),e};var ns=Fe`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,os=Fe`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,as=Fe`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,is=We("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${ns} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${os} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${as} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,ss=Fe`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,cs=We("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${ss} 1s linear infinite;
`,ls=Fe`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,us=Fe`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,ds=We("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${ls} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${us} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,fs=We("div")`
  position: absolute;
`,ps=We("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,ys=Fe`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,hs=We("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${ys} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,ms=({toast:e})=>{let{icon:t,type:r,iconTheme:n}=e;return t!==void 0?typeof t=="string"?c.createElement(hs,null,t):t:r==="blank"?null:c.createElement(ps,null,c.createElement(cs,{...n}),r!=="loading"&&c.createElement(fs,null,r==="error"?c.createElement(is,{...n}):c.createElement(ds,{...n})))},vs=e=>`
0% {transform: translate3d(0,${e*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,gs=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e*-150}%,-1px) scale(.6); opacity:0;}
`,bs="0%{opacity:0;} 100%{opacity:1;}",xs="0%{opacity:1;} 100%{opacity:0;}",Ss=We("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,ws=We("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,ks=(e,t)=>{let r=e.includes("top")?1:-1,[n,o]=Qi()?[bs,xs]:[vs(r),gs(r)];return{animation:t?`${Fe(n)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${Fe(o)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}};c.memo(({toast:e,position:t,style:r,children:n})=>{let o=e.height?ks(e.position||t||"top-center",e.visible):{opacity:0},a=c.createElement(ms,{toast:e}),i=c.createElement(ws,{...e.ariaProps},mr(e.message,e));return c.createElement(Ss,{className:e.className,style:{...o,...r,...e.style}},typeof n=="function"?n({icon:a,message:i}):c.createElement(c.Fragment,null,a,i))});Pi(c.createElement);_i`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;var Bd=Ee;/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var Cs={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const As=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase().trim(),w=(e,t)=>{const r=c.forwardRef(({color:n="currentColor",size:o=24,strokeWidth:a=2,absoluteStrokeWidth:i,className:s="",children:l,...d},p)=>c.createElement("svg",{ref:p,...Cs,width:o,height:o,stroke:n,strokeWidth:i?Number(a)*24/Number(o):a,className:["lucide",`lucide-${As(e)}`,s].join(" "),...d},[...t.map(([h,m])=>c.createElement(h,m)),...Array.isArray(l)?l:[l]]));return r.displayName=`${e}`,r};/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ud=w("Accessibility",[["circle",{cx:"16",cy:"4",r:"1",key:"1grugj"}],["path",{d:"m18 19 1-7-6 1",key:"r0i19z"}],["path",{d:"m5 8 3-3 5.5 3-2.36 3.5",key:"9ptxx2"}],["path",{d:"M4.24 14.5a5 5 0 0 0 6.88 6",key:"10kmtu"}],["path",{d:"M13.76 17.5a5 5 0 0 0-6.88-6",key:"2qq6rc"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const zd=w("Activity",[["path",{d:"M22 12h-4l-3 9L9 3l-3 9H2",key:"d5dnw9"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Hd=w("AlertCircle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qd=w("AlertTriangle",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z",key:"c3ski4"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Wd=w("AlignCenter",[["line",{x1:"21",x2:"3",y1:"6",y2:"6",key:"1fp77t"}],["line",{x1:"17",x2:"7",y1:"12",y2:"12",key:"rsh8ii"}],["line",{x1:"19",x2:"5",y1:"18",y2:"18",key:"1t0tuv"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Kd=w("AlignJustify",[["line",{x1:"3",x2:"21",y1:"6",y2:"6",key:"4m8b97"}],["line",{x1:"3",x2:"21",y1:"12",y2:"12",key:"10d38w"}],["line",{x1:"3",x2:"21",y1:"18",y2:"18",key:"kwyyxn"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Gd=w("AlignLeft",[["line",{x1:"21",x2:"3",y1:"6",y2:"6",key:"1fp77t"}],["line",{x1:"15",x2:"3",y1:"12",y2:"12",key:"v6grx8"}],["line",{x1:"17",x2:"3",y1:"18",y2:"18",key:"1awlsn"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Zd=w("AlignRight",[["line",{x1:"21",x2:"3",y1:"6",y2:"6",key:"1fp77t"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}],["line",{x1:"21",x2:"7",y1:"18",y2:"18",key:"1g9eri"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Yd=w("ArrowDown",[["path",{d:"M12 5v14",key:"s699le"}],["path",{d:"m19 12-7 7-7-7",key:"1idqje"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Xd=w("ArrowLeft",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Jd=w("ArrowRight",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Qd=w("ArrowUpDown",[["path",{d:"m21 16-4 4-4-4",key:"f6ql7i"}],["path",{d:"M17 20V4",key:"1ejh1v"}],["path",{d:"m3 8 4-4 4 4",key:"11wl7u"}],["path",{d:"M7 4v16",key:"1glfcx"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ef=w("ArrowUp",[["path",{d:"m5 12 7-7 7 7",key:"hav0vg"}],["path",{d:"M12 19V5",key:"x0mq9r"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const tf=w("Award",[["circle",{cx:"12",cy:"8",r:"6",key:"1vp47v"}],["path",{d:"M15.477 12.89 17 22l-5-3-5 3 1.523-9.11",key:"em7aur"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const rf=w("BarChart3",[["path",{d:"M3 3v18h18",key:"1s2lah"}],["path",{d:"M18 17V9",key:"2bz60n"}],["path",{d:"M13 17V5",key:"1frdt8"}],["path",{d:"M8 17v-3",key:"17ska0"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const nf=w("Battery",[["rect",{width:"16",height:"10",x:"2",y:"7",rx:"2",ry:"2",key:"1w10f2"}],["line",{x1:"22",x2:"22",y1:"11",y2:"13",key:"4dh1rd"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const of=w("Bell",[["path",{d:"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9",key:"1qo2s2"}],["path",{d:"M10.3 21a1.94 1.94 0 0 0 3.4 0",key:"qgo35s"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const af=w("BookOpen",[["path",{d:"M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z",key:"vv98re"}],["path",{d:"M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",key:"1cyq3y"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const sf=w("Book",[["path",{d:"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20",key:"t4utmx"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const cf=w("Bookmark",[["path",{d:"m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z",key:"1fy3hk"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const lf=w("Box",[["path",{d:"M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z",key:"hh9hay"}],["path",{d:"m3.3 7 8.7 5 8.7-5",key:"g66t2b"}],["path",{d:"M12 22V12",key:"d0xqtd"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const uf=w("Brain",[["path",{d:"M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z",key:"1mhkh5"}],["path",{d:"M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z",key:"1d6s00"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const df=w("Briefcase",[["rect",{width:"20",height:"14",x:"2",y:"7",rx:"2",ry:"2",key:"eto64e"}],["path",{d:"M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",key:"zwj3tp"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ff=w("Building2",[["path",{d:"M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z",key:"1b4qmf"}],["path",{d:"M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2",key:"i71pzd"}],["path",{d:"M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2",key:"10jefs"}],["path",{d:"M10 6h4",key:"1itunk"}],["path",{d:"M10 10h4",key:"tcdvrf"}],["path",{d:"M10 14h4",key:"kelpxr"}],["path",{d:"M10 18h4",key:"1ulq68"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pf=w("Building",[["rect",{width:"16",height:"20",x:"4",y:"2",rx:"2",ry:"2",key:"76otgf"}],["path",{d:"M9 22v-4h6v4",key:"r93iot"}],["path",{d:"M8 6h.01",key:"1dz90k"}],["path",{d:"M16 6h.01",key:"1x0f13"}],["path",{d:"M12 6h.01",key:"1vi96p"}],["path",{d:"M12 10h.01",key:"1nrarc"}],["path",{d:"M12 14h.01",key:"1etili"}],["path",{d:"M16 10h.01",key:"1m94wz"}],["path",{d:"M16 14h.01",key:"1gbofw"}],["path",{d:"M8 10h.01",key:"19clt8"}],["path",{d:"M8 14h.01",key:"6423bh"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const yf=w("Calculator",[["rect",{width:"16",height:"20",x:"4",y:"2",rx:"2",key:"1nb95v"}],["line",{x1:"8",x2:"16",y1:"6",y2:"6",key:"x4nwl0"}],["line",{x1:"16",x2:"16",y1:"14",y2:"18",key:"wjye3r"}],["path",{d:"M16 10h.01",key:"1m94wz"}],["path",{d:"M12 10h.01",key:"1nrarc"}],["path",{d:"M8 10h.01",key:"19clt8"}],["path",{d:"M12 14h.01",key:"1etili"}],["path",{d:"M8 14h.01",key:"6423bh"}],["path",{d:"M12 18h.01",key:"mhygvu"}],["path",{d:"M8 18h.01",key:"lrp35t"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const hf=w("Calendar",[["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",ry:"2",key:"eu3xkr"}],["line",{x1:"16",x2:"16",y1:"2",y2:"6",key:"m3sa8f"}],["line",{x1:"8",x2:"8",y1:"2",y2:"6",key:"18kwsl"}],["line",{x1:"3",x2:"21",y1:"10",y2:"10",key:"xt86sb"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const mf=w("Camera",[["path",{d:"M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",key:"1tc9qg"}],["circle",{cx:"12",cy:"13",r:"3",key:"1vg3eu"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const vf=w("CheckCircle2",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const gf=w("CheckCircle",[["path",{d:"M22 11.08V12a10 10 0 1 1-5.93-9.14",key:"g774vq"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const bf=w("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xf=w("ChevronDown",[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Sf=w("ChevronLeft",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const wf=w("ChevronRight",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const kf=w("ChevronUp",[["path",{d:"m18 15-6-6-6 6",key:"153udz"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Cf=w("Circle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Af=w("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ef=w("CloudOff",[["path",{d:"m2 2 20 20",key:"1ooewy"}],["path",{d:"M5.782 5.782A7 7 0 0 0 9 19h8.5a4.5 4.5 0 0 0 1.307-.193",key:"yfwify"}],["path",{d:"M21.532 16.5A4.5 4.5 0 0 0 17.5 10h-1.79A7.008 7.008 0 0 0 10 5.07",key:"jlfiyv"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _f=w("Code",[["polyline",{points:"16 18 22 12 16 6",key:"z7tu5w"}],["polyline",{points:"8 6 2 12 8 18",key:"1eg1df"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pf=w("Command",[["path",{d:"M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3",key:"11bfej"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Mf=w("Compass",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polygon",{points:"16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76",key:"m9r19z"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Rf=w("Copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Tf=w("Crown",[["path",{d:"m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14",key:"zkxr6b"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const If=w("Database",[["ellipse",{cx:"12",cy:"5",rx:"9",ry:"3",key:"msslwz"}],["path",{d:"M3 5V19A9 3 0 0 0 21 19V5",key:"1wlel7"}],["path",{d:"M3 12A9 3 0 0 0 21 12",key:"mv7ke4"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Of=w("DollarSign",[["line",{x1:"12",x2:"12",y1:"2",y2:"22",key:"7eqyqh"}],["path",{d:"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",key:"1b0p4s"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Nf=w("Download",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"7 10 12 15 17 10",key:"2ggqvy"}],["line",{x1:"12",x2:"12",y1:"15",y2:"3",key:"1vk2je"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Df=w("ExternalLink",[["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}],["polyline",{points:"15 3 21 3 21 9",key:"mznyad"}],["line",{x1:"10",x2:"21",y1:"14",y2:"3",key:"18c3s4"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const jf=w("EyeOff",[["path",{d:"M9.88 9.88a3 3 0 1 0 4.24 4.24",key:"1jxqfv"}],["path",{d:"M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68",key:"9wicm4"}],["path",{d:"M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61",key:"1jreej"}],["line",{x1:"2",x2:"22",y1:"2",y2:"22",key:"a6p6uj"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ff=w("Eye",[["path",{d:"M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z",key:"rwhkz3"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Lf=w("Factory",[["path",{d:"M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z",key:"159hny"}],["path",{d:"M17 18h1",key:"uldtlt"}],["path",{d:"M12 18h1",key:"s9uhes"}],["path",{d:"M7 18h1",key:"1neino"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Vf=w("FileJson",[["path",{d:"M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z",key:"1nnpy2"}],["polyline",{points:"14 2 14 8 20 8",key:"1ew0cm"}],["path",{d:"M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1",key:"1oajmo"}],["path",{d:"M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1",key:"mpwhp6"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $f=w("FileSpreadsheet",[["path",{d:"M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z",key:"1nnpy2"}],["polyline",{points:"14 2 14 8 20 8",key:"1ew0cm"}],["path",{d:"M8 13h2",key:"yr2amv"}],["path",{d:"M8 17h2",key:"2yhykz"}],["path",{d:"M14 13h2",key:"un5t4a"}],["path",{d:"M14 17h2",key:"10kma7"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Bf=w("FileText",[["path",{d:"M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z",key:"1nnpy2"}],["polyline",{points:"14 2 14 8 20 8",key:"1ew0cm"}],["line",{x1:"16",x2:"8",y1:"13",y2:"13",key:"14keom"}],["line",{x1:"16",x2:"8",y1:"17",y2:"17",key:"17nazh"}],["line",{x1:"10",x2:"8",y1:"9",y2:"9",key:"1a5vjj"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Uf=w("Filter",[["polygon",{points:"22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3",key:"1yg77f"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const zf=w("Flag",[["path",{d:"M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z",key:"i9b6wo"}],["line",{x1:"4",x2:"4",y1:"22",y2:"15",key:"1cm3nv"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Hf=w("GitBranch",[["line",{x1:"6",x2:"6",y1:"3",y2:"15",key:"17qcm7"}],["circle",{cx:"18",cy:"6",r:"3",key:"1h7g24"}],["circle",{cx:"6",cy:"18",r:"3",key:"fqmcym"}],["path",{d:"M18 9a9 9 0 0 1-9 9",key:"n2h4wq"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qf=w("GitMerge",[["circle",{cx:"18",cy:"18",r:"3",key:"1xkwt0"}],["circle",{cx:"6",cy:"6",r:"3",key:"1lh9wr"}],["path",{d:"M6 21V9a9 9 0 0 0 9 9",key:"7kw0sc"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Wf=w("Github",[["path",{d:"M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4",key:"tonef"}],["path",{d:"M9 18c-4.51 2-5-2-7-2",key:"9comsn"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Kf=w("Globe",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Gf=w("GraduationCap",[["path",{d:"M22 10v6M2 10l10-5 10 5-10 5z",key:"1ef52a"}],["path",{d:"M6 12v5c3 3 9 3 12 0v-5",key:"1f75yj"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Zf=w("Grid3x3",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M3 9h18",key:"1pudct"}],["path",{d:"M3 15h18",key:"5xshup"}],["path",{d:"M9 3v18",key:"fh3hqa"}],["path",{d:"M15 3v18",key:"14nvp0"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Yf=w("Grip",[["circle",{cx:"12",cy:"5",r:"1",key:"gxeob9"}],["circle",{cx:"19",cy:"5",r:"1",key:"w8mnmm"}],["circle",{cx:"5",cy:"5",r:"1",key:"lttvr7"}],["circle",{cx:"12",cy:"12",r:"1",key:"41hilf"}],["circle",{cx:"19",cy:"12",r:"1",key:"1wjl8i"}],["circle",{cx:"5",cy:"12",r:"1",key:"1pcz8c"}],["circle",{cx:"12",cy:"19",r:"1",key:"lyex9k"}],["circle",{cx:"19",cy:"19",r:"1",key:"shf9b7"}],["circle",{cx:"5",cy:"19",r:"1",key:"bfqh0e"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Xf=w("Heart",[["path",{d:"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",key:"c3ymky"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Jf=w("HelpCircle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",key:"1u773s"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Qf=w("Home",[["path",{d:"m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"y5dka4"}],["polyline",{points:"9 22 9 12 15 12 15 22",key:"e2us08"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const e1=w("Info",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const t1=w("KanbanSquare",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M8 7v7",key:"1x2jlm"}],["path",{d:"M12 7v4",key:"xawao1"}],["path",{d:"M16 7v9",key:"1hp2iy"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const r1=w("Keyboard",[["rect",{width:"20",height:"16",x:"2",y:"4",rx:"2",ry:"2",key:"15u882"}],["path",{d:"M6 8h.001",key:"1ej0i3"}],["path",{d:"M10 8h.001",key:"1x2st2"}],["path",{d:"M14 8h.001",key:"1vkmyp"}],["path",{d:"M18 8h.001",key:"kfsenl"}],["path",{d:"M8 12h.001",key:"1sjpby"}],["path",{d:"M12 12h.001",key:"al75ts"}],["path",{d:"M16 12h.001",key:"931bgk"}],["path",{d:"M7 16h10",key:"wp8him"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const n1=w("Layers",[["path",{d:"m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z",key:"8b97xw"}],["path",{d:"m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65",key:"dd6zsq"}],["path",{d:"m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65",key:"ep9fru"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const o1=w("Lightbulb",[["path",{d:"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",key:"1gvzjb"}],["path",{d:"M9 18h6",key:"x1upvd"}],["path",{d:"M10 22h4",key:"ceow96"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const a1=w("Link",[["path",{d:"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71",key:"1cjeqo"}],["path",{d:"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",key:"19qd67"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const i1=w("ListTodo",[["rect",{x:"3",y:"5",width:"6",height:"6",rx:"1",key:"1defrl"}],["path",{d:"m3 17 2 2 4-4",key:"1jhpwq"}],["path",{d:"M13 6h8",key:"15sg57"}],["path",{d:"M13 12h8",key:"h98zly"}],["path",{d:"M13 18h8",key:"oe0vm4"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const s1=w("List",[["line",{x1:"8",x2:"21",y1:"6",y2:"6",key:"7ey8pc"}],["line",{x1:"8",x2:"21",y1:"12",y2:"12",key:"rjfblc"}],["line",{x1:"8",x2:"21",y1:"18",y2:"18",key:"c3b1m8"}],["line",{x1:"3",x2:"3.01",y1:"6",y2:"6",key:"1g7gq3"}],["line",{x1:"3",x2:"3.01",y1:"12",y2:"12",key:"1pjlvk"}],["line",{x1:"3",x2:"3.01",y1:"18",y2:"18",key:"28t2mc"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c1=w("Loader2",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l1=w("Lock",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u1=w("LogIn",[["path",{d:"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4",key:"u53s6r"}],["polyline",{points:"10 17 15 12 10 7",key:"1ail0h"}],["line",{x1:"15",x2:"3",y1:"12",y2:"12",key:"v6grx8"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d1=w("LogOut",[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f1=w("Mail",[["rect",{width:"20",height:"16",x:"2",y:"4",rx:"2",key:"18n3k1"}],["path",{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",key:"1ocrg3"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p1=w("MapPin",[["path",{d:"M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z",key:"2oe9fu"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y1=w("Maximize2",[["polyline",{points:"15 3 21 3 21 9",key:"mznyad"}],["polyline",{points:"9 21 3 21 3 15",key:"1avn1i"}],["line",{x1:"21",x2:"14",y1:"3",y2:"10",key:"ota7mn"}],["line",{x1:"3",x2:"10",y1:"21",y2:"14",key:"1atl0r"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h1=w("Menu",[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m1=w("MessageCircle",[["path",{d:"M7.9 20A9 9 0 1 0 4 16.1L2 22Z",key:"vv11sd"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v1=w("MessageSquare",[["path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",key:"1lielz"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g1=w("Minimize2",[["polyline",{points:"4 14 10 14 10 20",key:"11kfnr"}],["polyline",{points:"20 10 14 10 14 4",key:"rlmsce"}],["line",{x1:"14",x2:"21",y1:"10",y2:"3",key:"o5lafz"}],["line",{x1:"3",x2:"10",y1:"21",y2:"14",key:"1atl0r"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b1=w("Minus",[["path",{d:"M5 12h14",key:"1ays0h"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x1=w("Moon",[["path",{d:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",key:"a7tn18"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S1=w("Move",[["polyline",{points:"5 9 2 12 5 15",key:"1r5uj5"}],["polyline",{points:"9 5 12 2 15 5",key:"5v383o"}],["polyline",{points:"15 19 12 22 9 19",key:"g7qi8m"}],["polyline",{points:"19 9 22 12 19 15",key:"tpp73q"}],["line",{x1:"2",x2:"22",y1:"12",y2:"12",key:"1dnqot"}],["line",{x1:"12",x2:"12",y1:"2",y2:"22",key:"7eqyqh"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w1=w("Network",[["rect",{x:"16",y:"16",width:"6",height:"6",rx:"1",key:"4q2zg0"}],["rect",{x:"2",y:"16",width:"6",height:"6",rx:"1",key:"8cvhb9"}],["rect",{x:"9",y:"2",width:"6",height:"6",rx:"1",key:"1egb70"}],["path",{d:"M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3",key:"1jsf9p"}],["path",{d:"M12 12V8",key:"2874zd"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k1=w("Package",[["path",{d:"m7.5 4.27 9 5.15",key:"1c824w"}],["path",{d:"M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z",key:"hh9hay"}],["path",{d:"m3.3 7 8.7 5 8.7-5",key:"g66t2b"}],["path",{d:"M12 22V12",key:"d0xqtd"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C1=w("Palette",[["circle",{cx:"13.5",cy:"6.5",r:".5",key:"1xcu5"}],["circle",{cx:"17.5",cy:"10.5",r:".5",key:"736e4u"}],["circle",{cx:"8.5",cy:"7.5",r:".5",key:"clrty"}],["circle",{cx:"6.5",cy:"12.5",r:".5",key:"1s4xz9"}],["path",{d:"M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z",key:"12rzf8"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A1=w("PanelLeftClose",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M9 3v18",key:"fh3hqa"}],["path",{d:"m16 15-3-3 3-3",key:"14y99z"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E1=w("PanelLeft",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M9 3v18",key:"fh3hqa"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _1=w("PanelsTopLeft",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M3 9h18",key:"1pudct"}],["path",{d:"M9 21V9",key:"1oto5p"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const P1=w("Pause",[["rect",{width:"4",height:"16",x:"6",y:"4",key:"iffhe4"}],["rect",{width:"4",height:"16",x:"14",y:"4",key:"sjin7j"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M1=w("PenLine",[["path",{d:"M12 20h9",key:"t2du7b"}],["path",{d:"M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z",key:"ymcmye"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const R1=w("PenSquare",[["path",{d:"M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1qinfi"}],["path",{d:"M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z",key:"w2jsv5"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const T1=w("PieChart",[["path",{d:"M21.21 15.89A10 10 0 1 1 8 2.83",key:"k2fpak"}],["path",{d:"M22 12A10 10 0 0 0 12 2v10z",key:"1rfc4y"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I1=w("PlayCircle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polygon",{points:"10 8 16 12 10 16 10 8",key:"1cimsy"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const O1=w("Play",[["polygon",{points:"5 3 19 12 5 21 5 3",key:"191637"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N1=w("Plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D1=w("Puzzle",[["path",{d:"M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z",key:"i0oyt7"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j1=w("Radar",[["path",{d:"M19.07 4.93A10 10 0 0 0 6.99 3.34",key:"z3du51"}],["path",{d:"M4 6h.01",key:"oypzma"}],["path",{d:"M2.29 9.62A10 10 0 1 0 21.31 8.35",key:"qzzz0"}],["path",{d:"M16.24 7.76A6 6 0 1 0 8.23 16.67",key:"1yjesh"}],["path",{d:"M12 18h.01",key:"mhygvu"}],["path",{d:"M17.99 11.66A6 6 0 0 1 15.77 16.67",key:"1u2y91"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}],["path",{d:"m13.41 10.59 5.66-5.66",key:"mhq4k0"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const F1=w("RefreshCw",[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L1=w("Reply",[["polyline",{points:"9 17 4 12 9 7",key:"hvgpf2"}],["path",{d:"M20 18v-2a4 4 0 0 0-4-4H4",key:"5vmcpk"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const V1=w("RotateCcw",[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $1=w("Save",[["path",{d:"M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z",key:"1owoqh"}],["polyline",{points:"17 21 17 13 7 13 7 21",key:"1md35c"}],["polyline",{points:"7 3 7 8 15 8",key:"8nz8an"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const B1=w("Scale",[["path",{d:"m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z",key:"7g6ntu"}],["path",{d:"m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z",key:"ijws7r"}],["path",{d:"M7 21h10",key:"1b0cd5"}],["path",{d:"M12 3v18",key:"108xh3"}],["path",{d:"M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2",key:"3gwbw2"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const U1=w("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z1=w("Send",[["path",{d:"m22 2-7 20-4-9-9-4Z",key:"1q3vgg"}],["path",{d:"M22 2 11 13",key:"nzbqef"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const H1=w("Settings",[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const q1=w("Share2",[["circle",{cx:"18",cy:"5",r:"3",key:"gq8acd"}],["circle",{cx:"6",cy:"12",r:"3",key:"w7nqdw"}],["circle",{cx:"18",cy:"19",r:"3",key:"1xt0gg"}],["line",{x1:"8.59",x2:"15.42",y1:"13.51",y2:"17.49",key:"47mynk"}],["line",{x1:"15.41",x2:"8.59",y1:"6.51",y2:"10.49",key:"1n3mei"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const W1=w("Share",[["path",{d:"M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8",key:"1b2hhj"}],["polyline",{points:"16 6 12 2 8 6",key:"m901s6"}],["line",{x1:"12",x2:"12",y1:"2",y2:"15",key:"1p0rca"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const K1=w("Shield",[["path",{d:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10",key:"1irkt0"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const G1=w("Shuffle",[["path",{d:"M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22",key:"1wmou1"}],["path",{d:"m18 2 4 4-4 4",key:"pucp1d"}],["path",{d:"M2 6h1.9c1.5 0 2.9.9 3.6 2.2",key:"10bdb2"}],["path",{d:"M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8",key:"vgxac0"}],["path",{d:"m18 14 4 4-4 4",key:"10pe0f"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Z1=w("Smartphone",[["rect",{width:"14",height:"20",x:"5",y:"2",rx:"2",ry:"2",key:"1yt0o3"}],["path",{d:"M12 18h.01",key:"mhygvu"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Y1=w("Sparkles",[["path",{d:"m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z",key:"17u4zn"}],["path",{d:"M5 3v4",key:"bklmnn"}],["path",{d:"M19 17v4",key:"iiml17"}],["path",{d:"M3 5h4",key:"nem4j1"}],["path",{d:"M17 19h4",key:"lbex7p"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const X1=w("Split",[["path",{d:"M16 3h5v5",key:"1806ms"}],["path",{d:"M8 3H3v5",key:"15dfkv"}],["path",{d:"M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3",key:"1qrqzj"}],["path",{d:"m15 9 6-6",key:"ko1vev"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const J1=w("Star",[["polygon",{points:"12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2",key:"8f66p6"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Q1=w("Sun",[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ep=w("Table",[["path",{d:"M12 3v18",key:"108xh3"}],["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M3 9h18",key:"1pudct"}],["path",{d:"M3 15h18",key:"5xshup"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const tp=w("Tag",[["path",{d:"M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z",key:"14b2ls"}],["path",{d:"M7 7h.01",key:"7u93v4"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const rp=w("Target",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"12",r:"6",key:"1vlfrh"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const np=w("ThumbsUp",[["path",{d:"M7 10v12",key:"1qc93n"}],["path",{d:"M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z",key:"y3tblf"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const op=w("ToggleLeft",[["rect",{width:"20",height:"12",x:"2",y:"6",rx:"6",ry:"6",key:"f2vt7d"}],["circle",{cx:"8",cy:"12",r:"2",key:"1nvbw3"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ap=w("ToggleRight",[["rect",{width:"20",height:"12",x:"2",y:"6",rx:"6",ry:"6",key:"f2vt7d"}],["circle",{cx:"16",cy:"12",r:"2",key:"4ma0v8"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ip=w("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const sp=w("TrendingDown",[["polyline",{points:"22 17 13.5 8.5 8.5 13.5 2 7",key:"1r2t7k"}],["polyline",{points:"16 17 22 17 22 11",key:"11uiuu"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const cp=w("TrendingUp",[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17",key:"126l90"}],["polyline",{points:"16 7 22 7 22 13",key:"kwv8wd"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const lp=w("Trophy",[["path",{d:"M6 9H4.5a2.5 2.5 0 0 1 0-5H6",key:"17hqa7"}],["path",{d:"M18 9h1.5a2.5 2.5 0 0 0 0-5H18",key:"lmptdp"}],["path",{d:"M4 22h16",key:"57wxv0"}],["path",{d:"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22",key:"1nw9bq"}],["path",{d:"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22",key:"1np0yb"}],["path",{d:"M18 2H6v7a6 6 0 0 0 12 0V2Z",key:"u46fv3"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const up=w("Type",[["polyline",{points:"4 7 4 4 20 4 20 7",key:"1nosan"}],["line",{x1:"9",x2:"15",y1:"20",y2:"20",key:"swin9y"}],["line",{x1:"12",x2:"12",y1:"4",y2:"20",key:"1tx1rr"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const dp=w("Upload",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"17 8 12 3 7 8",key:"t8dd8p"}],["line",{x1:"12",x2:"12",y1:"3",y2:"15",key:"widbto"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fp=w("UserCheck",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["polyline",{points:"16 11 18 13 22 9",key:"1pwet4"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pp=w("UserPlus",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["line",{x1:"19",x2:"19",y1:"8",y2:"14",key:"1bvyxn"}],["line",{x1:"22",x2:"16",y1:"11",y2:"11",key:"1shjgl"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const yp=w("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const hp=w("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const mp=w("Video",[["path",{d:"m22 8-6 4 6 4V8Z",key:"50v9me"}],["rect",{width:"14",height:"12",x:"2",y:"6",rx:"2",ry:"2",key:"1rqjg6"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const vp=w("WifiOff",[["line",{x1:"2",x2:"22",y1:"2",y2:"22",key:"a6p6uj"}],["path",{d:"M8.5 16.5a5 5 0 0 1 7 0",key:"sej527"}],["path",{d:"M2 8.82a15 15 0 0 1 4.17-2.65",key:"11utq1"}],["path",{d:"M10.66 5c4.01-.36 8.14.9 11.34 3.76",key:"hxefdu"}],["path",{d:"M16.85 11.25a10 10 0 0 1 2.22 1.68",key:"q734kn"}],["path",{d:"M5 13a10 10 0 0 1 5.24-2.76",key:"piq4yl"}],["line",{x1:"12",x2:"12.01",y1:"20",y2:"20",key:"of4bc4"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const gp=w("Wifi",[["path",{d:"M5 13a10 10 0 0 1 14 0",key:"6v8j51"}],["path",{d:"M8.5 16.5a5 5 0 0 1 7 0",key:"sej527"}],["path",{d:"M2 8.82a15 15 0 0 1 20 0",key:"dnpr2z"}],["line",{x1:"12",x2:"12.01",y1:"20",y2:"20",key:"of4bc4"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const bp=w("Workflow",[["rect",{width:"8",height:"8",x:"3",y:"3",rx:"2",key:"by2w9f"}],["path",{d:"M7 11v4a2 2 0 0 0 2 2h4",key:"xkn7yn"}],["rect",{width:"8",height:"8",x:"13",y:"13",rx:"2",key:"1cgmvn"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xp=w("Wrench",[["path",{d:"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",key:"cbrjhi"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Sp=w("XCircle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const wp=w("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const kp=w("Zap",[["polygon",{points:"13 2 3 14 12 14 11 22 21 10 12 10 13 2",key:"45s27k"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Cp=w("ZoomIn",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["line",{x1:"21",x2:"16.65",y1:"21",y2:"16.65",key:"13gj7c"}],["line",{x1:"11",x2:"11",y1:"8",y2:"14",key:"1vmskp"}],["line",{x1:"8",x2:"14",y1:"11",y2:"11",key:"durymu"}]]);/**
 * @license lucide-react v0.303.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ap=w("ZoomOut",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["line",{x1:"21",x2:"16.65",y1:"21",y2:"16.65",key:"13gj7c"}],["line",{x1:"8",x2:"14",y1:"11",y2:"11",key:"durymu"}]]);var Ct=e=>e.type==="checkbox",Je=e=>e instanceof Date,we=e=>e==null;const ao=e=>typeof e=="object";var he=e=>!we(e)&&!Array.isArray(e)&&ao(e)&&!Je(e),Es=e=>he(e)&&e.target?Ct(e.target)?e.target.checked:e.target.value:e,_s=e=>e.substring(0,e.search(/\.\d+(\.|$)/))||e,Ps=(e,t)=>e.has(_s(t)),Ms=e=>{const t=e.constructor&&e.constructor.prototype;return he(t)&&t.hasOwnProperty("isPrototypeOf")},$r=typeof window<"u"&&typeof window.HTMLElement<"u"&&typeof document<"u";function ge(e){let t;const r=Array.isArray(e),n=typeof FileList<"u"?e instanceof FileList:!1;if(e instanceof Date)t=new Date(e);else if(!($r&&(e instanceof Blob||n))&&(r||he(e)))if(t=r?[]:Object.create(Object.getPrototypeOf(e)),!r&&!Ms(e))t=e;else for(const o in e)e.hasOwnProperty(o)&&(t[o]=ge(e[o]));else return e;return t}var zt=e=>/^\w*$/.test(e),ve=e=>e===void 0,Br=e=>Array.isArray(e)?e.filter(Boolean):[],Ur=e=>Br(e.replace(/["|']|\]/g,"").split(/\.|\[/)),D=(e,t,r)=>{if(!t||!he(e))return r;const n=(zt(t)?[t]:Ur(t)).reduce((o,a)=>we(o)?o:o[a],e);return ve(n)||n===e?ve(e[t])?r:e[t]:n},Oe=e=>typeof e=="boolean",fe=(e,t,r)=>{let n=-1;const o=zt(t)?[t]:Ur(t),a=o.length,i=a-1;for(;++n<a;){const s=o[n];let l=r;if(n!==i){const d=e[s];l=he(d)||Array.isArray(d)?d:isNaN(+o[n+1])?{}:[]}if(s==="__proto__"||s==="constructor"||s==="prototype")return;e[s]=l,e=e[s]}};const mn={BLUR:"blur",FOCUS_OUT:"focusout"},Re={onBlur:"onBlur",onChange:"onChange",onSubmit:"onSubmit",onTouched:"onTouched",all:"all"},je={max:"max",min:"min",maxLength:"maxLength",minLength:"minLength",pattern:"pattern",required:"required",validate:"validate"},Rs=ye.createContext(null);Rs.displayName="HookFormContext";var Ts=(e,t,r,n=!0)=>{const o={defaultValues:t._defaultValues};for(const a in e)Object.defineProperty(o,a,{get:()=>{const i=a;return t._proxyFormState[i]!==Re.all&&(t._proxyFormState[i]=!n||Re.all),e[i]}});return o};const Is=typeof window<"u"?ye.useLayoutEffect:ye.useEffect;var Ne=e=>typeof e=="string",Os=(e,t,r,n,o)=>Ne(e)?(n&&t.watch.add(e),D(r,e,o)):Array.isArray(e)?e.map(a=>(n&&t.watch.add(a),D(r,a))):(n&&(t.watchAll=!0),r),vr=e=>we(e)||!ao(e);function Be(e,t,r=new WeakSet){if(vr(e)||vr(t))return e===t;if(Je(e)&&Je(t))return e.getTime()===t.getTime();const n=Object.keys(e),o=Object.keys(t);if(n.length!==o.length)return!1;if(r.has(e)||r.has(t))return!0;r.add(e),r.add(t);for(const a of n){const i=e[a];if(!o.includes(a))return!1;if(a!=="ref"){const s=t[a];if(Je(i)&&Je(s)||he(i)&&he(s)||Array.isArray(i)&&Array.isArray(s)?!Be(i,s,r):i!==s)return!1}}return!0}var Ns=(e,t,r,n,o)=>t?{...r[e],types:{...r[e]&&r[e].types?r[e].types:{},[n]:o||!0}}:{},gt=e=>Array.isArray(e)?e:[e],vn=()=>{let e=[];return{get observers(){return e},next:o=>{for(const a of e)a.next&&a.next(o)},subscribe:o=>(e.push(o),{unsubscribe:()=>{e=e.filter(a=>a!==o)}}),unsubscribe:()=>{e=[]}}},ke=e=>he(e)&&!Object.keys(e).length,zr=e=>e.type==="file",Te=e=>typeof e=="function",Nt=e=>{if(!$r)return!1;const t=e?e.ownerDocument:0;return e instanceof(t&&t.defaultView?t.defaultView.HTMLElement:HTMLElement)},io=e=>e.type==="select-multiple",Hr=e=>e.type==="radio",Ds=e=>Hr(e)||Ct(e),sr=e=>Nt(e)&&e.isConnected;function js(e,t){const r=t.slice(0,-1).length;let n=0;for(;n<r;)e=ve(e)?n++:e[t[n++]];return e}function Fs(e){for(const t in e)if(e.hasOwnProperty(t)&&!ve(e[t]))return!1;return!0}function me(e,t){const r=Array.isArray(t)?t:zt(t)?[t]:Ur(t),n=r.length===1?e:js(e,r),o=r.length-1,a=r[o];return n&&delete n[a],o!==0&&(he(n)&&ke(n)||Array.isArray(n)&&Fs(n))&&me(e,r.slice(0,-1)),e}var so=e=>{for(const t in e)if(Te(e[t]))return!0;return!1};function Dt(e,t={}){const r=Array.isArray(e);if(he(e)||r)for(const n in e)Array.isArray(e[n])||he(e[n])&&!so(e[n])?(t[n]=Array.isArray(e[n])?[]:{},Dt(e[n],t[n])):we(e[n])||(t[n]=!0);return t}function co(e,t,r){const n=Array.isArray(e);if(he(e)||n)for(const o in e)Array.isArray(e[o])||he(e[o])&&!so(e[o])?ve(t)||vr(r[o])?r[o]=Array.isArray(e[o])?Dt(e[o],[]):{...Dt(e[o])}:co(e[o],we(t)?{}:t[o],r[o]):r[o]=!Be(e[o],t[o]);return r}var yt=(e,t)=>co(e,t,Dt(t));const gn={value:!1,isValid:!1},bn={value:!0,isValid:!0};var lo=e=>{if(Array.isArray(e)){if(e.length>1){const t=e.filter(r=>r&&r.checked&&!r.disabled).map(r=>r.value);return{value:t,isValid:!!t.length}}return e[0].checked&&!e[0].disabled?e[0].attributes&&!ve(e[0].attributes.value)?ve(e[0].value)||e[0].value===""?bn:{value:e[0].value,isValid:!0}:bn:gn}return gn},uo=(e,{valueAsNumber:t,valueAsDate:r,setValueAs:n})=>ve(e)?e:t?e===""?NaN:e&&+e:r&&Ne(e)?new Date(e):n?n(e):e;const xn={isValid:!1,value:null};var fo=e=>Array.isArray(e)?e.reduce((t,r)=>r&&r.checked&&!r.disabled?{isValid:!0,value:r.value}:t,xn):xn;function Sn(e){const t=e.ref;return zr(t)?t.files:Hr(t)?fo(e.refs).value:io(t)?[...t.selectedOptions].map(({value:r})=>r):Ct(t)?lo(e.refs).value:uo(ve(t.value)?e.ref.value:t.value,e)}var Ls=(e,t,r,n)=>{const o={};for(const a of e){const i=D(t,a);i&&fe(o,a,i._f)}return{criteriaMode:r,names:[...e],fields:o,shouldUseNativeValidation:n}},jt=e=>e instanceof RegExp,ht=e=>ve(e)?e:jt(e)?e.source:he(e)?jt(e.value)?e.value.source:e.value:e,wn=e=>({isOnSubmit:!e||e===Re.onSubmit,isOnBlur:e===Re.onBlur,isOnChange:e===Re.onChange,isOnAll:e===Re.all,isOnTouch:e===Re.onTouched});const kn="AsyncFunction";var Vs=e=>!!e&&!!e.validate&&!!(Te(e.validate)&&e.validate.constructor.name===kn||he(e.validate)&&Object.values(e.validate).find(t=>t.constructor.name===kn)),$s=e=>e.mount&&(e.required||e.min||e.max||e.maxLength||e.minLength||e.pattern||e.validate),Cn=(e,t,r)=>!r&&(t.watchAll||t.watch.has(e)||[...t.watch].some(n=>e.startsWith(n)&&/^\.\w+/.test(e.slice(n.length))));const bt=(e,t,r,n)=>{for(const o of r||Object.keys(e)){const a=D(e,o);if(a){const{_f:i,...s}=a;if(i){if(i.refs&&i.refs[0]&&t(i.refs[0],o)&&!n)return!0;if(i.ref&&t(i.ref,i.name)&&!n)return!0;if(bt(s,t))break}else if(he(s)&&bt(s,t))break}}};function An(e,t,r){const n=D(e,r);if(n||zt(r))return{error:n,name:r};const o=r.split(".");for(;o.length;){const a=o.join("."),i=D(t,a),s=D(e,a);if(i&&!Array.isArray(i)&&r!==a)return{name:r};if(s&&s.type)return{name:a,error:s};if(s&&s.root&&s.root.type)return{name:`${a}.root`,error:s.root};o.pop()}return{name:r}}var Bs=(e,t,r,n)=>{r(e);const{name:o,...a}=e;return ke(a)||Object.keys(a).length>=Object.keys(t).length||Object.keys(a).find(i=>t[i]===(!n||Re.all))},Us=(e,t,r)=>!e||!t||e===t||gt(e).some(n=>n&&(r?n===t:n.startsWith(t)||t.startsWith(n))),zs=(e,t,r,n,o)=>o.isOnAll?!1:!r&&o.isOnTouch?!(t||e):(r?n.isOnBlur:o.isOnBlur)?!e:(r?n.isOnChange:o.isOnChange)?e:!0,Hs=(e,t)=>!Br(D(e,t)).length&&me(e,t),qs=(e,t,r)=>{const n=gt(D(e,r));return fe(n,"root",t[r]),fe(e,r,n),e},Rt=e=>Ne(e);function En(e,t,r="validate"){if(Rt(e)||Array.isArray(e)&&e.every(Rt)||Oe(e)&&!e)return{type:r,message:Rt(e)?e:"",ref:t}}var rt=e=>he(e)&&!jt(e)?e:{value:e,message:""},_n=async(e,t,r,n,o,a)=>{const{ref:i,refs:s,required:l,maxLength:d,minLength:p,min:h,max:m,pattern:C,validate:E,name:f,valueAsNumber:u,mount:g}=e._f,v=D(r,f);if(!g||t.has(f))return{};const k=s?s[0]:i,_=j=>{o&&k.reportValidity&&(k.setCustomValidity(Oe(j)?"":j||""),k.reportValidity())},R={},V=Hr(i),I=Ct(i),$=V||I,Q=(u||zr(i))&&ve(i.value)&&ve(v)||Nt(i)&&i.value===""||v===""||Array.isArray(v)&&!v.length,ee=Ns.bind(null,f,n,R),H=(j,F,W,Z=je.maxLength,z=je.minLength)=>{const B=j?F:W;R[f]={type:j?Z:z,message:B,ref:i,...ee(j?Z:z,B)}};if(a?!Array.isArray(v)||!v.length:l&&(!$&&(Q||we(v))||Oe(v)&&!v||I&&!lo(s).isValid||V&&!fo(s).isValid)){const{value:j,message:F}=Rt(l)?{value:!!l,message:l}:rt(l);if(j&&(R[f]={type:je.required,message:F,ref:k,...ee(je.required,F)},!n))return _(F),R}if(!Q&&(!we(h)||!we(m))){let j,F;const W=rt(m),Z=rt(h);if(!we(v)&&!isNaN(v)){const z=i.valueAsNumber||v&&+v;we(W.value)||(j=z>W.value),we(Z.value)||(F=z<Z.value)}else{const z=i.valueAsDate||new Date(v),B=Ce=>new Date(new Date().toDateString()+" "+Ce),ne=i.type=="time",pe=i.type=="week";Ne(W.value)&&v&&(j=ne?B(v)>B(W.value):pe?v>W.value:z>new Date(W.value)),Ne(Z.value)&&v&&(F=ne?B(v)<B(Z.value):pe?v<Z.value:z<new Date(Z.value))}if((j||F)&&(H(!!j,W.message,Z.message,je.max,je.min),!n))return _(R[f].message),R}if((d||p)&&!Q&&(Ne(v)||a&&Array.isArray(v))){const j=rt(d),F=rt(p),W=!we(j.value)&&v.length>+j.value,Z=!we(F.value)&&v.length<+F.value;if((W||Z)&&(H(W,j.message,F.message),!n))return _(R[f].message),R}if(C&&!Q&&Ne(v)){const{value:j,message:F}=rt(C);if(jt(j)&&!v.match(j)&&(R[f]={type:je.pattern,message:F,ref:i,...ee(je.pattern,F)},!n))return _(F),R}if(E){if(Te(E)){const j=await E(v,r),F=En(j,k);if(F&&(R[f]={...F,...ee(je.validate,F.message)},!n))return _(F.message),R}else if(he(E)){let j={};for(const F in E){if(!ke(j)&&!n)break;const W=En(await E[F](v,r),k,F);W&&(j={...W,...ee(F,W.message)},_(W.message),n&&(R[f]=j))}if(!ke(j)&&(R[f]={ref:k,...j},!n))return R}}return _(!0),R};const Ws={mode:Re.onSubmit,reValidateMode:Re.onChange,shouldFocusError:!0};function Ks(e={}){let t={...Ws,...e},r={submitCount:0,isDirty:!1,isReady:!1,isLoading:Te(t.defaultValues),isValidating:!1,isSubmitted:!1,isSubmitting:!1,isSubmitSuccessful:!1,isValid:!1,touchedFields:{},dirtyFields:{},validatingFields:{},errors:t.errors||{},disabled:t.disabled||!1},n={},o=he(t.defaultValues)||he(t.values)?ge(t.defaultValues||t.values)||{}:{},a=t.shouldUnregister?{}:ge(o),i={action:!1,mount:!1,watch:!1},s={mount:new Set,disabled:new Set,unMount:new Set,array:new Set,watch:new Set},l,d=0;const p={isDirty:!1,dirtyFields:!1,validatingFields:!1,touchedFields:!1,isValidating:!1,isValid:!1,errors:!1};let h={...p};const m={array:vn(),state:vn()},C=t.criteriaMode===Re.all,E=y=>x=>{clearTimeout(d),d=setTimeout(y,x)},f=async y=>{if(!t.disabled&&(p.isValid||h.isValid||y)){const x=t.resolver?ke((await I()).errors):await Q(n,!0);x!==r.isValid&&m.state.next({isValid:x})}},u=(y,x)=>{!t.disabled&&(p.isValidating||p.validatingFields||h.isValidating||h.validatingFields)&&((y||Array.from(s.mount)).forEach(A=>{A&&(x?fe(r.validatingFields,A,x):me(r.validatingFields,A))}),m.state.next({validatingFields:r.validatingFields,isValidating:!ke(r.validatingFields)}))},g=(y,x=[],A,O,T=!0,M=!0)=>{if(O&&A&&!t.disabled){if(i.action=!0,M&&Array.isArray(D(n,y))){const L=A(D(n,y),O.argA,O.argB);T&&fe(n,y,L)}if(M&&Array.isArray(D(r.errors,y))){const L=A(D(r.errors,y),O.argA,O.argB);T&&fe(r.errors,y,L),Hs(r.errors,y)}if((p.touchedFields||h.touchedFields)&&M&&Array.isArray(D(r.touchedFields,y))){const L=A(D(r.touchedFields,y),O.argA,O.argB);T&&fe(r.touchedFields,y,L)}(p.dirtyFields||h.dirtyFields)&&(r.dirtyFields=yt(o,a)),m.state.next({name:y,isDirty:H(y,x),dirtyFields:r.dirtyFields,errors:r.errors,isValid:r.isValid})}else fe(a,y,x)},v=(y,x)=>{fe(r.errors,y,x),m.state.next({errors:r.errors})},k=y=>{r.errors=y,m.state.next({errors:r.errors,isValid:!1})},_=(y,x,A,O)=>{const T=D(n,y);if(T){const M=D(a,y,ve(A)?D(o,y):A);ve(M)||O&&O.defaultChecked||x?fe(a,y,x?M:Sn(T._f)):W(y,M),i.mount&&f()}},R=(y,x,A,O,T)=>{let M=!1,L=!1;const ue={name:y};if(!t.disabled){if(!A||O){(p.isDirty||h.isDirty)&&(L=r.isDirty,r.isDirty=ue.isDirty=H(),M=L!==ue.isDirty);const de=Be(D(o,y),x);L=!!D(r.dirtyFields,y),de?me(r.dirtyFields,y):fe(r.dirtyFields,y,!0),ue.dirtyFields=r.dirtyFields,M=M||(p.dirtyFields||h.dirtyFields)&&L!==!de}if(A){const de=D(r.touchedFields,y);de||(fe(r.touchedFields,y,A),ue.touchedFields=r.touchedFields,M=M||(p.touchedFields||h.touchedFields)&&de!==A)}M&&T&&m.state.next(ue)}return M?ue:{}},V=(y,x,A,O)=>{const T=D(r.errors,y),M=(p.isValid||h.isValid)&&Oe(x)&&r.isValid!==x;if(t.delayError&&A?(l=E(()=>v(y,A)),l(t.delayError)):(clearTimeout(d),l=null,A?fe(r.errors,y,A):me(r.errors,y)),(A?!Be(T,A):T)||!ke(O)||M){const L={...O,...M&&Oe(x)?{isValid:x}:{},errors:r.errors,name:y};r={...r,...L},m.state.next(L)}},I=async y=>{u(y,!0);const x=await t.resolver(a,t.context,Ls(y||s.mount,n,t.criteriaMode,t.shouldUseNativeValidation));return u(y),x},$=async y=>{const{errors:x}=await I(y);if(y)for(const A of y){const O=D(x,A);O?fe(r.errors,A,O):me(r.errors,A)}else r.errors=x;return x},Q=async(y,x,A={valid:!0})=>{for(const O in y){const T=y[O];if(T){const{_f:M,...L}=T;if(M){const ue=s.array.has(M.name),de=T._f&&Vs(T._f);de&&p.validatingFields&&u([O],!0);const _e=await _n(T,s.disabled,a,C,t.shouldUseNativeValidation&&!x,ue);if(de&&p.validatingFields&&u([O]),_e[M.name]&&(A.valid=!1,x))break;!x&&(D(_e,M.name)?ue?qs(r.errors,_e,M.name):fe(r.errors,M.name,_e[M.name]):me(r.errors,M.name))}!ke(L)&&await Q(L,x,A)}}return A.valid},ee=()=>{for(const y of s.unMount){const x=D(n,y);x&&(x._f.refs?x._f.refs.every(A=>!sr(A)):!sr(x._f.ref))&&N(y)}s.unMount=new Set},H=(y,x)=>!t.disabled&&(y&&x&&fe(a,y,x),!Be(Ce(),o)),j=(y,x,A)=>Os(y,s,{...i.mount?a:ve(x)?o:Ne(y)?{[y]:x}:x},A,x),F=y=>Br(D(i.mount?a:o,y,t.shouldUnregister?D(o,y,[]):[])),W=(y,x,A={})=>{const O=D(n,y);let T=x;if(O){const M=O._f;M&&(!M.disabled&&fe(a,y,uo(x,M)),T=Nt(M.ref)&&we(x)?"":x,io(M.ref)?[...M.ref.options].forEach(L=>L.selected=T.includes(L.value)):M.refs?Ct(M.ref)?M.refs.forEach(L=>{(!L.defaultChecked||!L.disabled)&&(Array.isArray(T)?L.checked=!!T.find(ue=>ue===L.value):L.checked=T===L.value||!!T)}):M.refs.forEach(L=>L.checked=L.value===T):zr(M.ref)?M.ref.value="":(M.ref.value=T,M.ref.type||m.state.next({name:y,values:ge(a)})))}(A.shouldDirty||A.shouldTouch)&&R(y,T,A.shouldTouch,A.shouldDirty,!0),A.shouldValidate&&pe(y)},Z=(y,x,A)=>{for(const O in x){if(!x.hasOwnProperty(O))return;const T=x[O],M=y+"."+O,L=D(n,M);(s.array.has(y)||he(T)||L&&!L._f)&&!Je(T)?Z(M,T,A):W(M,T,A)}},z=(y,x,A={})=>{const O=D(n,y),T=s.array.has(y),M=ge(x);fe(a,y,M),T?(m.array.next({name:y,values:ge(a)}),(p.isDirty||p.dirtyFields||h.isDirty||h.dirtyFields)&&A.shouldDirty&&m.state.next({name:y,dirtyFields:yt(o,a),isDirty:H(y,M)})):O&&!O._f&&!we(M)?Z(y,M,A):W(y,M,A),Cn(y,s)&&m.state.next({...r,name:y}),m.state.next({name:i.mount?y:void 0,values:ge(a)})},B=async y=>{i.mount=!0;const x=y.target;let A=x.name,O=!0;const T=D(n,A),M=de=>{O=Number.isNaN(de)||Je(de)&&isNaN(de.getTime())||Be(de,D(a,A,de))},L=wn(t.mode),ue=wn(t.reValidateMode);if(T){let de,_e;const Et=x.type?Sn(T._f):Es(y),Ve=y.type===mn.BLUR||y.type===mn.FOCUS_OUT,Ci=!$s(T._f)&&!t.resolver&&!D(r.errors,A)&&!T._f.deps||zs(Ve,D(r.touchedFields,A),r.isSubmitted,ue,L),rr=Cn(A,s,Ve);fe(a,A,Et),Ve?(!x||!x.readOnly)&&(T._f.onBlur&&T._f.onBlur(y),l&&l(0)):T._f.onChange&&T._f.onChange(y);const nr=R(A,Et,Ve),Ai=!ke(nr)||rr;if(!Ve&&m.state.next({name:A,type:y.type,values:ge(a)}),Ci)return(p.isValid||h.isValid)&&(t.mode==="onBlur"?Ve&&f():Ve||f()),Ai&&m.state.next({name:A,...rr?{}:nr});if(!Ve&&rr&&m.state.next({...r}),t.resolver){const{errors:un}=await I([A]);if(M(Et),O){const Ei=An(r.errors,n,A),dn=An(un,n,Ei.name||A);de=dn.error,A=dn.name,_e=ke(un)}}else u([A],!0),de=(await _n(T,s.disabled,a,C,t.shouldUseNativeValidation))[A],u([A]),M(Et),O&&(de?_e=!1:(p.isValid||h.isValid)&&(_e=await Q(n,!0)));O&&(T._f.deps&&pe(T._f.deps),V(A,_e,de,nr))}},ne=(y,x)=>{if(D(r.errors,x)&&y.focus)return y.focus(),1},pe=async(y,x={})=>{let A,O;const T=gt(y);if(t.resolver){const M=await $(ve(y)?y:T);A=ke(M),O=y?!T.some(L=>D(M,L)):A}else y?(O=(await Promise.all(T.map(async M=>{const L=D(n,M);return await Q(L&&L._f?{[M]:L}:L)}))).every(Boolean),!(!O&&!r.isValid)&&f()):O=A=await Q(n);return m.state.next({...!Ne(y)||(p.isValid||h.isValid)&&A!==r.isValid?{}:{name:y},...t.resolver||!y?{isValid:A}:{},errors:r.errors}),x.shouldFocus&&!O&&bt(n,ne,y?T:s.mount),O},Ce=y=>{const x={...i.mount?a:o};return ve(y)?x:Ne(y)?D(x,y):y.map(A=>D(x,A))},b=(y,x)=>({invalid:!!D((x||r).errors,y),isDirty:!!D((x||r).dirtyFields,y),error:D((x||r).errors,y),isValidating:!!D(r.validatingFields,y),isTouched:!!D((x||r).touchedFields,y)}),P=y=>{y&&gt(y).forEach(x=>me(r.errors,x)),m.state.next({errors:y?r.errors:{}})},Y=(y,x,A)=>{const O=(D(n,y,{_f:{}})._f||{}).ref,T=D(r.errors,y)||{},{ref:M,message:L,type:ue,...de}=T;fe(r.errors,y,{...de,...x,ref:O}),m.state.next({name:y,errors:r.errors,isValid:!1}),A&&A.shouldFocus&&O&&O.focus&&O.focus()},te=(y,x)=>Te(y)?m.state.subscribe({next:A=>"values"in A&&y(j(void 0,x),A)}):j(y,x,!0),re=y=>m.state.subscribe({next:x=>{Us(y.name,x.name,y.exact)&&Bs(x,y.formState||p,Ye,y.reRenderRoot)&&y.callback({values:{...a},...r,...x,defaultValues:o})}}).unsubscribe,ie=y=>(i.mount=!0,h={...h,...y.formState},re({...y,formState:h})),N=(y,x={})=>{for(const A of y?gt(y):s.mount)s.mount.delete(A),s.array.delete(A),x.keepValue||(me(n,A),me(a,A)),!x.keepError&&me(r.errors,A),!x.keepDirty&&me(r.dirtyFields,A),!x.keepTouched&&me(r.touchedFields,A),!x.keepIsValidating&&me(r.validatingFields,A),!t.shouldUnregister&&!x.keepDefaultValue&&me(o,A);m.state.next({values:ge(a)}),m.state.next({...r,...x.keepDirty?{isDirty:H()}:{}}),!x.keepIsValid&&f()},U=({disabled:y,name:x})=>{(Oe(y)&&i.mount||y||s.disabled.has(x))&&(y?s.disabled.add(x):s.disabled.delete(x))},K=(y,x={})=>{let A=D(n,y);const O=Oe(x.disabled)||Oe(t.disabled);return fe(n,y,{...A||{},_f:{...A&&A._f?A._f:{ref:{name:y}},name:y,mount:!0,...x}}),s.mount.add(y),A?U({disabled:Oe(x.disabled)?x.disabled:t.disabled,name:y}):_(y,!0,x.value),{...O?{disabled:x.disabled||t.disabled}:{},...t.progressive?{required:!!x.required,min:ht(x.min),max:ht(x.max),minLength:ht(x.minLength),maxLength:ht(x.maxLength),pattern:ht(x.pattern)}:{},name:y,onChange:B,onBlur:B,ref:T=>{if(T){K(y,x),A=D(n,y);const M=ve(T.value)&&T.querySelectorAll&&T.querySelectorAll("input,select,textarea")[0]||T,L=Ds(M),ue=A._f.refs||[];if(L?ue.find(de=>de===M):M===A._f.ref)return;fe(n,y,{_f:{...A._f,...L?{refs:[...ue.filter(sr),M,...Array.isArray(D(o,y))?[{}]:[]],ref:{type:M.type,name:y}}:{ref:M}}}),_(y,!1,void 0,M)}else A=D(n,y,{}),A._f&&(A._f.mount=!1),(t.shouldUnregister||x.shouldUnregister)&&!(Ps(s.array,y)&&i.action)&&s.unMount.add(y)}}},G=()=>t.shouldFocusError&&bt(n,ne,s.mount),se=y=>{Oe(y)&&(m.state.next({disabled:y}),bt(n,(x,A)=>{const O=D(n,A);O&&(x.disabled=O._f.disabled||y,Array.isArray(O._f.refs)&&O._f.refs.forEach(T=>{T.disabled=O._f.disabled||y}))},0,!1))},ae=(y,x)=>async A=>{let O;A&&(A.preventDefault&&A.preventDefault(),A.persist&&A.persist());let T=ge(a);if(m.state.next({isSubmitting:!0}),t.resolver){const{errors:M,values:L}=await I();r.errors=M,T=ge(L)}else await Q(n);if(s.disabled.size)for(const M of s.disabled)me(T,M);if(me(r.errors,"root"),ke(r.errors)){m.state.next({errors:{}});try{await y(T,A)}catch(M){O=M}}else x&&await x({...r.errors},A),G(),setTimeout(G);if(m.state.next({isSubmitted:!0,isSubmitting:!1,isSubmitSuccessful:ke(r.errors)&&!O,submitCount:r.submitCount+1,errors:r.errors}),O)throw O},Se=(y,x={})=>{D(n,y)&&(ve(x.defaultValue)?z(y,ge(D(o,y))):(z(y,x.defaultValue),fe(o,y,ge(x.defaultValue))),x.keepTouched||me(r.touchedFields,y),x.keepDirty||(me(r.dirtyFields,y),r.isDirty=x.defaultValue?H(y,ge(D(o,y))):H()),x.keepError||(me(r.errors,y),p.isValid&&f()),m.state.next({...r}))},Ae=(y,x={})=>{const A=y?ge(y):o,O=ge(A),T=ke(y),M=T?o:O;if(x.keepDefaultValues||(o=A),!x.keepValues){if(x.keepDirtyValues){const L=new Set([...s.mount,...Object.keys(yt(o,a))]);for(const ue of Array.from(L))D(r.dirtyFields,ue)?fe(M,ue,D(a,ue)):z(ue,D(M,ue))}else{if($r&&ve(y))for(const L of s.mount){const ue=D(n,L);if(ue&&ue._f){const de=Array.isArray(ue._f.refs)?ue._f.refs[0]:ue._f.ref;if(Nt(de)){const _e=de.closest("form");if(_e){_e.reset();break}}}}if(x.keepFieldsRef)for(const L of s.mount)z(L,D(M,L));else n={}}a=t.shouldUnregister?x.keepDefaultValues?ge(o):{}:ge(M),m.array.next({values:{...M}}),m.state.next({values:{...M}})}s={mount:x.keepDirtyValues?s.mount:new Set,unMount:new Set,array:new Set,disabled:new Set,watch:new Set,watchAll:!1,focus:""},i.mount=!p.isValid||!!x.keepIsValid||!!x.keepDirtyValues,i.watch=!!t.shouldUnregister,m.state.next({submitCount:x.keepSubmitCount?r.submitCount:0,isDirty:T?!1:x.keepDirty?r.isDirty:!!(x.keepDefaultValues&&!Be(y,o)),isSubmitted:x.keepIsSubmitted?r.isSubmitted:!1,dirtyFields:T?{}:x.keepDirtyValues?x.keepDefaultValues&&a?yt(o,a):r.dirtyFields:x.keepDefaultValues&&y?yt(o,y):x.keepDirty?r.dirtyFields:{},touchedFields:x.keepTouched?r.touchedFields:{},errors:x.keepErrors?r.errors:{},isSubmitSuccessful:x.keepIsSubmitSuccessful?r.isSubmitSuccessful:!1,isSubmitting:!1,defaultValues:o})},Le=(y,x)=>Ae(Te(y)?y(a):y,x),Ze=(y,x={})=>{const A=D(n,y),O=A&&A._f;if(O){const T=O.refs?O.refs[0]:O.ref;T.focus&&(T.focus(),x.shouldSelect&&Te(T.select)&&T.select())}},Ye=y=>{r={...r,...y}},Xe={control:{register:K,unregister:N,getFieldState:b,handleSubmit:ae,setError:Y,_subscribe:re,_runSchema:I,_focusError:G,_getWatch:j,_getDirty:H,_setValid:f,_setFieldArray:g,_setDisabledField:U,_setErrors:k,_getFieldArray:F,_reset:Ae,_resetDefaultValues:()=>Te(t.defaultValues)&&t.defaultValues().then(y=>{Le(y,t.resetOptions),m.state.next({isLoading:!1})}),_removeUnmounted:ee,_disableForm:se,_subjects:m,_proxyFormState:p,get _fields(){return n},get _formValues(){return a},get _state(){return i},set _state(y){i=y},get _defaultValues(){return o},get _names(){return s},set _names(y){s=y},get _formState(){return r},get _options(){return t},set _options(y){t={...t,...y}}},subscribe:ie,trigger:pe,register:K,handleSubmit:ae,watch:te,setValue:z,getValues:Ce,reset:Le,resetField:Se,clearErrors:P,unregister:N,setError:Y,setFocus:Ze,getFieldState:b};return{...Xe,formControl:Xe}}function Ep(e={}){const t=ye.useRef(void 0),r=ye.useRef(void 0),[n,o]=ye.useState({isDirty:!1,isValidating:!1,isLoading:Te(e.defaultValues),isSubmitted:!1,isSubmitting:!1,isSubmitSuccessful:!1,isValid:!1,submitCount:0,dirtyFields:{},touchedFields:{},validatingFields:{},errors:e.errors||{},disabled:e.disabled||!1,isReady:!1,defaultValues:Te(e.defaultValues)?void 0:e.defaultValues});if(!t.current)if(e.formControl)t.current={...e.formControl,formState:n},e.defaultValues&&!Te(e.defaultValues)&&e.formControl.reset(e.defaultValues,e.resetOptions);else{const{formControl:i,...s}=Ks(e);t.current={...s,formState:n}}const a=t.current.control;return a._options=e,Is(()=>{const i=a._subscribe({formState:a._proxyFormState,callback:()=>o({...a._formState}),reRenderRoot:!0});return o(s=>({...s,isReady:!0})),a._formState.isReady=!0,i},[a]),ye.useEffect(()=>a._disableForm(e.disabled),[a,e.disabled]),ye.useEffect(()=>{e.mode&&(a._options.mode=e.mode),e.reValidateMode&&(a._options.reValidateMode=e.reValidateMode)},[a,e.mode,e.reValidateMode]),ye.useEffect(()=>{e.errors&&(a._setErrors(e.errors),a._focusError())},[a,e.errors]),ye.useEffect(()=>{e.shouldUnregister&&a._subjects.state.next({values:a._getWatch()})},[a,e.shouldUnregister]),ye.useEffect(()=>{if(a._proxyFormState.isDirty){const i=a._getDirty();i!==n.isDirty&&a._subjects.state.next({isDirty:i})}},[a,n.isDirty]),ye.useEffect(()=>{e.values&&!Be(e.values,r.current)?(a._reset(e.values,{keepFieldsRef:!0,...a._options.resetOptions}),r.current=e.values,o(i=>({...i}))):a._resetDefaultValues()},[a,e.values]),ye.useEffect(()=>{a._state.mount||(a._setValid(),a._state.mount=!0),a._state.watch&&(a._state.watch=!1,a._subjects.state.next({...a._formState})),a._removeUnmounted()}),t.current.formState=Ts(n,a),t.current}function Pn(e,t){if(typeof e=="function")return e(t);e!=null&&(e.current=t)}function po(...e){return t=>{let r=!1;const n=e.map(o=>{const a=Pn(o,t);return!r&&typeof a=="function"&&(r=!0),a});if(r)return()=>{for(let o=0;o<n.length;o++){const a=n[o];typeof a=="function"?a():Pn(e[o],null)}}}}function oe(...e){return c.useCallback(po(...e),e)}function ct(e){const t=Gs(e),r=c.forwardRef((n,o)=>{const{children:a,...i}=n,s=c.Children.toArray(a),l=s.find(Ys);if(l){const d=l.props.children,p=s.map(h=>h===l?c.Children.count(d)>1?c.Children.only(null):c.isValidElement(d)?d.props.children:null:h);return S.jsx(t,{...i,ref:o,children:c.isValidElement(d)?c.cloneElement(d,void 0,p):null})}return S.jsx(t,{...i,ref:o,children:a})});return r.displayName=`${e}.Slot`,r}var _p=ct("Slot");function Gs(e){const t=c.forwardRef((r,n)=>{const{children:o,...a}=r;if(c.isValidElement(o)){const i=Js(o),s=Xs(a,o.props);return o.type!==c.Fragment&&(s.ref=n?po(n,i):i),c.cloneElement(o,s)}return c.Children.count(o)>1?c.Children.only(null):null});return t.displayName=`${e}.SlotClone`,t}var Zs=Symbol("radix.slottable");function Ys(e){return c.isValidElement(e)&&typeof e.type=="function"&&"__radixId"in e.type&&e.type.__radixId===Zs}function Xs(e,t){const r={...t};for(const n in t){const o=e[n],a=t[n];/^on[A-Z]/.test(n)?o&&a?r[n]=(...s)=>{const l=a(...s);return o(...s),l}:o&&(r[n]=o):n==="style"?r[n]={...o,...a}:n==="className"&&(r[n]=[o,a].filter(Boolean).join(" "))}return{...e,...r}}function Js(e){var n,o;let t=(n=Object.getOwnPropertyDescriptor(e.props,"ref"))==null?void 0:n.get,r=t&&"isReactWarning"in t&&t.isReactWarning;return r?e.ref:(t=(o=Object.getOwnPropertyDescriptor(e,"ref"))==null?void 0:o.get,r=t&&"isReactWarning"in t&&t.isReactWarning,r?e.props.ref:e.props.ref||e.ref)}var Qs=["a","button","div","form","h2","h3","img","input","label","li","nav","ol","p","select","span","svg","ul"],q=Qs.reduce((e,t)=>{const r=ct(`Primitive.${t}`),n=c.forwardRef((o,a)=>{const{asChild:i,...s}=o,l=i?r:t;return typeof window<"u"&&(window[Symbol.for("radix-ui")]=!0),S.jsx(l,{...s,ref:a})});return n.displayName=`Primitive.${t}`,{...e,[t]:n}},{});function ec(e,t){e&&Lr.flushSync(()=>e.dispatchEvent(t))}var tc="Label",yo=c.forwardRef((e,t)=>S.jsx(q.label,{...e,ref:t,onMouseDown:r=>{var o;r.target.closest("button, input, select, textarea")||((o=e.onMouseDown)==null||o.call(e,r),!r.defaultPrevented&&r.detail>1&&r.preventDefault())}}));yo.displayName=tc;var Pp=yo;function rc(e,t){const r=c.createContext(t),n=a=>{const{children:i,...s}=a,l=c.useMemo(()=>s,Object.values(s));return S.jsx(r.Provider,{value:l,children:i})};n.displayName=e+"Provider";function o(a){const i=c.useContext(r);if(i)return i;if(t!==void 0)return t;throw new Error(`\`${a}\` must be used within \`${e}\``)}return[n,o]}function De(e,t=[]){let r=[];function n(a,i){const s=c.createContext(i),l=r.length;r=[...r,i];const d=h=>{var g;const{scope:m,children:C,...E}=h,f=((g=m==null?void 0:m[e])==null?void 0:g[l])||s,u=c.useMemo(()=>E,Object.values(E));return S.jsx(f.Provider,{value:u,children:C})};d.displayName=a+"Provider";function p(h,m){var f;const C=((f=m==null?void 0:m[e])==null?void 0:f[l])||s,E=c.useContext(C);if(E)return E;if(i!==void 0)return i;throw new Error(`\`${h}\` must be used within \`${a}\``)}return[d,p]}const o=()=>{const a=r.map(i=>c.createContext(i));return function(s){const l=(s==null?void 0:s[e])||a;return c.useMemo(()=>({[`__scope${e}`]:{...s,[e]:l}}),[s,l])}};return o.scopeName=e,[n,nc(o,...t)]}function nc(...e){const t=e[0];if(e.length===1)return t;const r=()=>{const n=e.map(o=>({useScope:o(),scopeName:o.scopeName}));return function(a){const i=n.reduce((s,{useScope:l,scopeName:d})=>{const h=l(a)[`__scope${d}`];return{...s,...h}},{});return c.useMemo(()=>({[`__scope${t.scopeName}`]:i}),[i])}};return r.scopeName=t.scopeName,r}function qr(e){const t=e+"CollectionProvider",[r,n]=De(t),[o,a]=r(t,{collectionRef:{current:null},itemMap:new Map}),i=f=>{const{scope:u,children:g}=f,v=ye.useRef(null),k=ye.useRef(new Map).current;return S.jsx(o,{scope:u,itemMap:k,collectionRef:v,children:g})};i.displayName=t;const s=e+"CollectionSlot",l=ct(s),d=ye.forwardRef((f,u)=>{const{scope:g,children:v}=f,k=a(s,g),_=oe(u,k.collectionRef);return S.jsx(l,{ref:_,children:v})});d.displayName=s;const p=e+"CollectionItemSlot",h="data-radix-collection-item",m=ct(p),C=ye.forwardRef((f,u)=>{const{scope:g,children:v,...k}=f,_=ye.useRef(null),R=oe(u,_),V=a(p,g);return ye.useEffect(()=>(V.itemMap.set(_,{ref:_,...k}),()=>void V.itemMap.delete(_))),S.jsx(m,{[h]:"",ref:R,children:v})});C.displayName=p;function E(f){const u=a(e+"CollectionConsumer",f);return ye.useCallback(()=>{const v=u.collectionRef.current;if(!v)return[];const k=Array.from(v.querySelectorAll(`[${h}]`));return Array.from(u.itemMap.values()).sort((V,I)=>k.indexOf(V.ref.current)-k.indexOf(I.ref.current))},[u.collectionRef,u.itemMap])}return[{Provider:i,Slot:d,ItemSlot:C},E,n]}var xe=globalThis!=null&&globalThis.document?c.useLayoutEffect:()=>{},oc=no[" useId ".trim().toString()]||(()=>{}),ac=0;function Ue(e){const[t,r]=c.useState(oc());return xe(()=>{r(n=>n??String(ac++))},[e]),e||(t?`radix-${t}`:"")}function He(e){const t=c.useRef(e);return c.useEffect(()=>{t.current=e}),c.useMemo(()=>(...r)=>{var n;return(n=t.current)==null?void 0:n.call(t,...r)},[])}var ic=no[" useInsertionEffect ".trim().toString()]||xe;function qe({prop:e,defaultProp:t,onChange:r=()=>{},caller:n}){const[o,a,i]=sc({defaultProp:t,onChange:r}),s=e!==void 0,l=s?e:o;{const p=c.useRef(e!==void 0);c.useEffect(()=>{const h=p.current;h!==s&&console.warn(`${n} is changing from ${h?"controlled":"uncontrolled"} to ${s?"controlled":"uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`),p.current=s},[s,n])}const d=c.useCallback(p=>{var h;if(s){const m=cc(p)?p(e):p;m!==e&&((h=i.current)==null||h.call(i,m))}else a(p)},[s,e,a,i]);return[l,d]}function sc({defaultProp:e,onChange:t}){const[r,n]=c.useState(e),o=c.useRef(r),a=c.useRef(t);return ic(()=>{a.current=t},[t]),c.useEffect(()=>{var i;o.current!==r&&((i=a.current)==null||i.call(a,r),o.current=r)},[r,o]),[r,n,a]}function cc(e){return typeof e=="function"}var lc=c.createContext(void 0);function Ht(e){const t=c.useContext(lc);return e||t||"ltr"}var cr="rovingFocusGroup.onEntryFocus",uc={bubbles:!1,cancelable:!0},At="RovingFocusGroup",[gr,ho,dc]=qr(At),[fc,mo]=De(At,[dc]),[pc,yc]=fc(At),vo=c.forwardRef((e,t)=>S.jsx(gr.Provider,{scope:e.__scopeRovingFocusGroup,children:S.jsx(gr.Slot,{scope:e.__scopeRovingFocusGroup,children:S.jsx(hc,{...e,ref:t})})}));vo.displayName=At;var hc=c.forwardRef((e,t)=>{const{__scopeRovingFocusGroup:r,orientation:n,loop:o=!1,dir:a,currentTabStopId:i,defaultCurrentTabStopId:s,onCurrentTabStopIdChange:l,onEntryFocus:d,preventScrollOnEntryFocus:p=!1,...h}=e,m=c.useRef(null),C=oe(t,m),E=Ht(a),[f,u]=qe({prop:i,defaultProp:s??null,onChange:l,caller:At}),[g,v]=c.useState(!1),k=He(d),_=ho(r),R=c.useRef(!1),[V,I]=c.useState(0);return c.useEffect(()=>{const $=m.current;if($)return $.addEventListener(cr,k),()=>$.removeEventListener(cr,k)},[k]),S.jsx(pc,{scope:r,orientation:n,dir:E,loop:o,currentTabStopId:f,onItemFocus:c.useCallback($=>u($),[u]),onItemShiftTab:c.useCallback(()=>v(!0),[]),onFocusableItemAdd:c.useCallback(()=>I($=>$+1),[]),onFocusableItemRemove:c.useCallback(()=>I($=>$-1),[]),children:S.jsx(q.div,{tabIndex:g||V===0?-1:0,"data-orientation":n,...h,ref:C,style:{outline:"none",...e.style},onMouseDown:J(e.onMouseDown,()=>{R.current=!0}),onFocus:J(e.onFocus,$=>{const Q=!R.current;if($.target===$.currentTarget&&Q&&!g){const ee=new CustomEvent(cr,uc);if($.currentTarget.dispatchEvent(ee),!ee.defaultPrevented){const H=_().filter(z=>z.focusable),j=H.find(z=>z.active),F=H.find(z=>z.id===f),Z=[j,F,...H].filter(Boolean).map(z=>z.ref.current);xo(Z,p)}}R.current=!1}),onBlur:J(e.onBlur,()=>v(!1))})})}),go="RovingFocusGroupItem",bo=c.forwardRef((e,t)=>{const{__scopeRovingFocusGroup:r,focusable:n=!0,active:o=!1,tabStopId:a,children:i,...s}=e,l=Ue(),d=a||l,p=yc(go,r),h=p.currentTabStopId===d,m=ho(r),{onFocusableItemAdd:C,onFocusableItemRemove:E,currentTabStopId:f}=p;return c.useEffect(()=>{if(n)return C(),()=>E()},[n,C,E]),S.jsx(gr.ItemSlot,{scope:r,id:d,focusable:n,active:o,children:S.jsx(q.span,{tabIndex:h?0:-1,"data-orientation":p.orientation,...s,ref:t,onMouseDown:J(e.onMouseDown,u=>{n?p.onItemFocus(d):u.preventDefault()}),onFocus:J(e.onFocus,()=>p.onItemFocus(d)),onKeyDown:J(e.onKeyDown,u=>{if(u.key==="Tab"&&u.shiftKey){p.onItemShiftTab();return}if(u.target!==u.currentTarget)return;const g=gc(u,p.orientation,p.dir);if(g!==void 0){if(u.metaKey||u.ctrlKey||u.altKey||u.shiftKey)return;u.preventDefault();let k=m().filter(_=>_.focusable).map(_=>_.ref.current);if(g==="last")k.reverse();else if(g==="prev"||g==="next"){g==="prev"&&k.reverse();const _=k.indexOf(u.currentTarget);k=p.loop?bc(k,_+1):k.slice(_+1)}setTimeout(()=>xo(k))}}),children:typeof i=="function"?i({isCurrentTabStop:h,hasTabStop:f!=null}):i})})});bo.displayName=go;var mc={ArrowLeft:"prev",ArrowUp:"prev",ArrowRight:"next",ArrowDown:"next",PageUp:"first",Home:"first",PageDown:"last",End:"last"};function vc(e,t){return t!=="rtl"?e:e==="ArrowLeft"?"ArrowRight":e==="ArrowRight"?"ArrowLeft":e}function gc(e,t,r){const n=vc(e.key,r);if(!(t==="vertical"&&["ArrowLeft","ArrowRight"].includes(n))&&!(t==="horizontal"&&["ArrowUp","ArrowDown"].includes(n)))return mc[n]}function xo(e,t=!1){const r=document.activeElement;for(const n of e)if(n===r||(n.focus({preventScroll:t}),document.activeElement!==r))return}function bc(e,t){return e.map((r,n)=>e[(t+n)%e.length])}var xc=vo,Sc=bo;function wc(e,t){return c.useReducer((r,n)=>t[r][n]??r,e)}var ut=e=>{const{present:t,children:r}=e,n=kc(t),o=typeof r=="function"?r({present:n.isPresent}):c.Children.only(r),a=oe(n.ref,Cc(o));return typeof r=="function"||n.isPresent?c.cloneElement(o,{ref:a}):null};ut.displayName="Presence";function kc(e){const[t,r]=c.useState(),n=c.useRef(null),o=c.useRef(e),a=c.useRef("none"),i=e?"mounted":"unmounted",[s,l]=wc(i,{mounted:{UNMOUNT:"unmounted",ANIMATION_OUT:"unmountSuspended"},unmountSuspended:{MOUNT:"mounted",ANIMATION_END:"unmounted"},unmounted:{MOUNT:"mounted"}});return c.useEffect(()=>{const d=_t(n.current);a.current=s==="mounted"?d:"none"},[s]),xe(()=>{const d=n.current,p=o.current;if(p!==e){const m=a.current,C=_t(d);e?l("MOUNT"):C==="none"||(d==null?void 0:d.display)==="none"?l("UNMOUNT"):l(p&&m!==C?"ANIMATION_OUT":"UNMOUNT"),o.current=e}},[e,l]),xe(()=>{if(t){let d;const p=t.ownerDocument.defaultView??window,h=C=>{const f=_t(n.current).includes(C.animationName);if(C.target===t&&f&&(l("ANIMATION_END"),!o.current)){const u=t.style.animationFillMode;t.style.animationFillMode="forwards",d=p.setTimeout(()=>{t.style.animationFillMode==="forwards"&&(t.style.animationFillMode=u)})}},m=C=>{C.target===t&&(a.current=_t(n.current))};return t.addEventListener("animationstart",m),t.addEventListener("animationcancel",h),t.addEventListener("animationend",h),()=>{p.clearTimeout(d),t.removeEventListener("animationstart",m),t.removeEventListener("animationcancel",h),t.removeEventListener("animationend",h)}}else l("ANIMATION_END")},[t,l]),{isPresent:["mounted","unmountSuspended"].includes(s),ref:c.useCallback(d=>{n.current=d?getComputedStyle(d):null,r(d)},[])}}function _t(e){return(e==null?void 0:e.animationName)||"none"}function Cc(e){var n,o;let t=(n=Object.getOwnPropertyDescriptor(e.props,"ref"))==null?void 0:n.get,r=t&&"isReactWarning"in t&&t.isReactWarning;return r?e.ref:(t=(o=Object.getOwnPropertyDescriptor(e,"ref"))==null?void 0:o.get,r=t&&"isReactWarning"in t&&t.isReactWarning,r?e.props.ref:e.props.ref||e.ref)}var qt="Tabs",[Ac,Mp]=De(qt,[mo]),So=mo(),[Ec,Wr]=Ac(qt),wo=c.forwardRef((e,t)=>{const{__scopeTabs:r,value:n,onValueChange:o,defaultValue:a,orientation:i="horizontal",dir:s,activationMode:l="automatic",...d}=e,p=Ht(s),[h,m]=qe({prop:n,onChange:o,defaultProp:a??"",caller:qt});return S.jsx(Ec,{scope:r,baseId:Ue(),value:h,onValueChange:m,orientation:i,dir:p,activationMode:l,children:S.jsx(q.div,{dir:p,"data-orientation":i,...d,ref:t})})});wo.displayName=qt;var ko="TabsList",Co=c.forwardRef((e,t)=>{const{__scopeTabs:r,loop:n=!0,...o}=e,a=Wr(ko,r),i=So(r);return S.jsx(xc,{asChild:!0,...i,orientation:a.orientation,dir:a.dir,loop:n,children:S.jsx(q.div,{role:"tablist","aria-orientation":a.orientation,...o,ref:t})})});Co.displayName=ko;var Ao="TabsTrigger",Eo=c.forwardRef((e,t)=>{const{__scopeTabs:r,value:n,disabled:o=!1,...a}=e,i=Wr(Ao,r),s=So(r),l=Mo(i.baseId,n),d=Ro(i.baseId,n),p=n===i.value;return S.jsx(Sc,{asChild:!0,...s,focusable:!o,active:p,children:S.jsx(q.button,{type:"button",role:"tab","aria-selected":p,"aria-controls":d,"data-state":p?"active":"inactive","data-disabled":o?"":void 0,disabled:o,id:l,...a,ref:t,onMouseDown:J(e.onMouseDown,h=>{!o&&h.button===0&&h.ctrlKey===!1?i.onValueChange(n):h.preventDefault()}),onKeyDown:J(e.onKeyDown,h=>{[" ","Enter"].includes(h.key)&&i.onValueChange(n)}),onFocus:J(e.onFocus,()=>{const h=i.activationMode!=="manual";!p&&!o&&h&&i.onValueChange(n)})})})});Eo.displayName=Ao;var _o="TabsContent",Po=c.forwardRef((e,t)=>{const{__scopeTabs:r,value:n,forceMount:o,children:a,...i}=e,s=Wr(_o,r),l=Mo(s.baseId,n),d=Ro(s.baseId,n),p=n===s.value,h=c.useRef(p);return c.useEffect(()=>{const m=requestAnimationFrame(()=>h.current=!1);return()=>cancelAnimationFrame(m)},[]),S.jsx(ut,{present:o||p,children:({present:m})=>S.jsx(q.div,{"data-state":p?"active":"inactive","data-orientation":s.orientation,role:"tabpanel","aria-labelledby":l,hidden:!m,id:d,tabIndex:0,...i,ref:t,style:{...e.style,animationDuration:h.current?"0s":void 0},children:m&&a})})});Po.displayName=_o;function Mo(e,t){return`${e}-trigger-${t}`}function Ro(e,t){return`${e}-content-${t}`}var Rp=wo,Tp=Co,Ip=Eo,Op=Po;function _c(e,t=globalThis==null?void 0:globalThis.document){const r=He(e);c.useEffect(()=>{const n=o=>{o.key==="Escape"&&r(o)};return t.addEventListener("keydown",n,{capture:!0}),()=>t.removeEventListener("keydown",n,{capture:!0})},[r,t])}var Pc="DismissableLayer",br="dismissableLayer.update",Mc="dismissableLayer.pointerDownOutside",Rc="dismissableLayer.focusOutside",Mn,To=c.createContext({layers:new Set,layersWithOutsidePointerEventsDisabled:new Set,branches:new Set}),Kr=c.forwardRef((e,t)=>{const{disableOutsidePointerEvents:r=!1,onEscapeKeyDown:n,onPointerDownOutside:o,onFocusOutside:a,onInteractOutside:i,onDismiss:s,...l}=e,d=c.useContext(To),[p,h]=c.useState(null),m=(p==null?void 0:p.ownerDocument)??(globalThis==null?void 0:globalThis.document),[,C]=c.useState({}),E=oe(t,I=>h(I)),f=Array.from(d.layers),[u]=[...d.layersWithOutsidePointerEventsDisabled].slice(-1),g=f.indexOf(u),v=p?f.indexOf(p):-1,k=d.layersWithOutsidePointerEventsDisabled.size>0,_=v>=g,R=Oc(I=>{const $=I.target,Q=[...d.branches].some(ee=>ee.contains($));!_||Q||(o==null||o(I),i==null||i(I),I.defaultPrevented||s==null||s())},m),V=Nc(I=>{const $=I.target;[...d.branches].some(ee=>ee.contains($))||(a==null||a(I),i==null||i(I),I.defaultPrevented||s==null||s())},m);return _c(I=>{v===d.layers.size-1&&(n==null||n(I),!I.defaultPrevented&&s&&(I.preventDefault(),s()))},m),c.useEffect(()=>{if(p)return r&&(d.layersWithOutsidePointerEventsDisabled.size===0&&(Mn=m.body.style.pointerEvents,m.body.style.pointerEvents="none"),d.layersWithOutsidePointerEventsDisabled.add(p)),d.layers.add(p),Rn(),()=>{r&&d.layersWithOutsidePointerEventsDisabled.size===1&&(m.body.style.pointerEvents=Mn)}},[p,m,r,d]),c.useEffect(()=>()=>{p&&(d.layers.delete(p),d.layersWithOutsidePointerEventsDisabled.delete(p),Rn())},[p,d]),c.useEffect(()=>{const I=()=>C({});return document.addEventListener(br,I),()=>document.removeEventListener(br,I)},[]),S.jsx(q.div,{...l,ref:E,style:{pointerEvents:k?_?"auto":"none":void 0,...e.style},onFocusCapture:J(e.onFocusCapture,V.onFocusCapture),onBlurCapture:J(e.onBlurCapture,V.onBlurCapture),onPointerDownCapture:J(e.onPointerDownCapture,R.onPointerDownCapture)})});Kr.displayName=Pc;var Tc="DismissableLayerBranch",Ic=c.forwardRef((e,t)=>{const r=c.useContext(To),n=c.useRef(null),o=oe(t,n);return c.useEffect(()=>{const a=n.current;if(a)return r.branches.add(a),()=>{r.branches.delete(a)}},[r.branches]),S.jsx(q.div,{...e,ref:o})});Ic.displayName=Tc;function Oc(e,t=globalThis==null?void 0:globalThis.document){const r=He(e),n=c.useRef(!1),o=c.useRef(()=>{});return c.useEffect(()=>{const a=s=>{if(s.target&&!n.current){let l=function(){Io(Mc,r,d,{discrete:!0})};const d={originalEvent:s};s.pointerType==="touch"?(t.removeEventListener("click",o.current),o.current=l,t.addEventListener("click",o.current,{once:!0})):l()}else t.removeEventListener("click",o.current);n.current=!1},i=window.setTimeout(()=>{t.addEventListener("pointerdown",a)},0);return()=>{window.clearTimeout(i),t.removeEventListener("pointerdown",a),t.removeEventListener("click",o.current)}},[t,r]),{onPointerDownCapture:()=>n.current=!0}}function Nc(e,t=globalThis==null?void 0:globalThis.document){const r=He(e),n=c.useRef(!1);return c.useEffect(()=>{const o=a=>{a.target&&!n.current&&Io(Rc,r,{originalEvent:a},{discrete:!1})};return t.addEventListener("focusin",o),()=>t.removeEventListener("focusin",o)},[t,r]),{onFocusCapture:()=>n.current=!0,onBlurCapture:()=>n.current=!1}}function Rn(){const e=new CustomEvent(br);document.dispatchEvent(e)}function Io(e,t,r,{discrete:n}){const o=r.originalEvent.target,a=new CustomEvent(e,{bubbles:!1,cancelable:!0,detail:r});t&&o.addEventListener(e,t,{once:!0}),n?ec(o,a):o.dispatchEvent(a)}var lr="focusScope.autoFocusOnMount",ur="focusScope.autoFocusOnUnmount",Tn={bubbles:!1,cancelable:!0},Dc="FocusScope",Gr=c.forwardRef((e,t)=>{const{loop:r=!1,trapped:n=!1,onMountAutoFocus:o,onUnmountAutoFocus:a,...i}=e,[s,l]=c.useState(null),d=He(o),p=He(a),h=c.useRef(null),m=oe(t,f=>l(f)),C=c.useRef({paused:!1,pause(){this.paused=!0},resume(){this.paused=!1}}).current;c.useEffect(()=>{if(n){let f=function(k){if(C.paused||!s)return;const _=k.target;s.contains(_)?h.current=_:$e(h.current,{select:!0})},u=function(k){if(C.paused||!s)return;const _=k.relatedTarget;_!==null&&(s.contains(_)||$e(h.current,{select:!0}))},g=function(k){if(document.activeElement===document.body)for(const R of k)R.removedNodes.length>0&&$e(s)};document.addEventListener("focusin",f),document.addEventListener("focusout",u);const v=new MutationObserver(g);return s&&v.observe(s,{childList:!0,subtree:!0}),()=>{document.removeEventListener("focusin",f),document.removeEventListener("focusout",u),v.disconnect()}}},[n,s,C.paused]),c.useEffect(()=>{if(s){On.add(C);const f=document.activeElement;if(!s.contains(f)){const g=new CustomEvent(lr,Tn);s.addEventListener(lr,d),s.dispatchEvent(g),g.defaultPrevented||(jc(Bc(Oo(s)),{select:!0}),document.activeElement===f&&$e(s))}return()=>{s.removeEventListener(lr,d),setTimeout(()=>{const g=new CustomEvent(ur,Tn);s.addEventListener(ur,p),s.dispatchEvent(g),g.defaultPrevented||$e(f??document.body,{select:!0}),s.removeEventListener(ur,p),On.remove(C)},0)}}},[s,d,p,C]);const E=c.useCallback(f=>{if(!r&&!n||C.paused)return;const u=f.key==="Tab"&&!f.altKey&&!f.ctrlKey&&!f.metaKey,g=document.activeElement;if(u&&g){const v=f.currentTarget,[k,_]=Fc(v);k&&_?!f.shiftKey&&g===_?(f.preventDefault(),r&&$e(k,{select:!0})):f.shiftKey&&g===k&&(f.preventDefault(),r&&$e(_,{select:!0})):g===v&&f.preventDefault()}},[r,n,C.paused]);return S.jsx(q.div,{tabIndex:-1,...i,ref:m,onKeyDown:E})});Gr.displayName=Dc;function jc(e,{select:t=!1}={}){const r=document.activeElement;for(const n of e)if($e(n,{select:t}),document.activeElement!==r)return}function Fc(e){const t=Oo(e),r=In(t,e),n=In(t.reverse(),e);return[r,n]}function Oo(e){const t=[],r=document.createTreeWalker(e,NodeFilter.SHOW_ELEMENT,{acceptNode:n=>{const o=n.tagName==="INPUT"&&n.type==="hidden";return n.disabled||n.hidden||o?NodeFilter.FILTER_SKIP:n.tabIndex>=0?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP}});for(;r.nextNode();)t.push(r.currentNode);return t}function In(e,t){for(const r of e)if(!Lc(r,{upTo:t}))return r}function Lc(e,{upTo:t}){if(getComputedStyle(e).visibility==="hidden")return!0;for(;e;){if(t!==void 0&&e===t)return!1;if(getComputedStyle(e).display==="none")return!0;e=e.parentElement}return!1}function Vc(e){return e instanceof HTMLInputElement&&"select"in e}function $e(e,{select:t=!1}={}){if(e&&e.focus){const r=document.activeElement;e.focus({preventScroll:!0}),e!==r&&Vc(e)&&t&&e.select()}}var On=$c();function $c(){let e=[];return{add(t){const r=e[0];t!==r&&(r==null||r.pause()),e=Nn(e,t),e.unshift(t)},remove(t){var r;e=Nn(e,t),(r=e[0])==null||r.resume()}}}function Nn(e,t){const r=[...e],n=r.indexOf(t);return n!==-1&&r.splice(n,1),r}function Bc(e){return e.filter(t=>t.tagName!=="A")}var Uc="Portal",Zr=c.forwardRef((e,t)=>{var s;const{container:r,...n}=e,[o,a]=c.useState(!1);xe(()=>a(!0),[]);const i=r||o&&((s=globalThis==null?void 0:globalThis.document)==null?void 0:s.body);return i?Fi.createPortal(S.jsx(q.div,{...n,ref:t}),i):null});Zr.displayName=Uc;var dr=0;function No(){c.useEffect(()=>{const e=document.querySelectorAll("[data-radix-focus-guard]");return document.body.insertAdjacentElement("afterbegin",e[0]??Dn()),document.body.insertAdjacentElement("beforeend",e[1]??Dn()),dr++,()=>{dr===1&&document.querySelectorAll("[data-radix-focus-guard]").forEach(t=>t.remove()),dr--}},[])}function Dn(){const e=document.createElement("span");return e.setAttribute("data-radix-focus-guard",""),e.tabIndex=0,e.style.outline="none",e.style.opacity="0",e.style.position="fixed",e.style.pointerEvents="none",e}var Tt="right-scroll-bar-position",It="width-before-scroll-bar",zc="with-scroll-bars-hidden",Hc="--removed-body-scroll-bar-size",Do=Mi(),fr=function(){},Wt=c.forwardRef(function(e,t){var r=c.useRef(null),n=c.useState({onScrollCapture:fr,onWheelCapture:fr,onTouchMoveCapture:fr}),o=n[0],a=n[1],i=e.forwardProps,s=e.children,l=e.className,d=e.removeScrollBar,p=e.enabled,h=e.shards,m=e.sideCar,C=e.noRelative,E=e.noIsolation,f=e.inert,u=e.allowPinchZoom,g=e.as,v=g===void 0?"div":g,k=e.gapMode,_=Ri(e,["forwardProps","children","className","removeScrollBar","enabled","shards","sideCar","noRelative","noIsolation","inert","allowPinchZoom","as","gapMode"]),R=m,V=Ti([r,t]),I=at(at({},_),o);return c.createElement(c.Fragment,null,p&&c.createElement(R,{sideCar:Do,removeScrollBar:d,shards:h,noRelative:C,noIsolation:E,inert:f,setCallbacks:a,allowPinchZoom:!!u,lockRef:r,gapMode:k}),i?c.cloneElement(c.Children.only(s),at(at({},I),{ref:V})):c.createElement(v,at({},I,{className:l,ref:V}),s))});Wt.defaultProps={enabled:!0,removeScrollBar:!0,inert:!1};Wt.classNames={fullWidth:It,zeroRight:Tt};function qc(){if(!document)return null;var e=document.createElement("style");e.type="text/css";var t=Ii();return t&&e.setAttribute("nonce",t),e}function Wc(e,t){e.styleSheet?e.styleSheet.cssText=t:e.appendChild(document.createTextNode(t))}function Kc(e){var t=document.head||document.getElementsByTagName("head")[0];t.appendChild(e)}var Gc=function(){var e=0,t=null;return{add:function(r){e==0&&(t=qc())&&(Wc(t,r),Kc(t)),e++},remove:function(){e--,!e&&t&&(t.parentNode&&t.parentNode.removeChild(t),t=null)}}},Zc=function(){var e=Gc();return function(t,r){c.useEffect(function(){return e.add(t),function(){e.remove()}},[t&&r])}},jo=function(){var e=Zc(),t=function(r){var n=r.styles,o=r.dynamic;return e(n,o),null};return t},Yc={left:0,top:0,right:0,gap:0},pr=function(e){return parseInt(e||"",10)||0},Xc=function(e){var t=window.getComputedStyle(document.body),r=t[e==="padding"?"paddingLeft":"marginLeft"],n=t[e==="padding"?"paddingTop":"marginTop"],o=t[e==="padding"?"paddingRight":"marginRight"];return[pr(r),pr(n),pr(o)]},Jc=function(e){if(e===void 0&&(e="margin"),typeof window>"u")return Yc;var t=Xc(e),r=document.documentElement.clientWidth,n=window.innerWidth;return{left:t[0],top:t[1],right:t[2],gap:Math.max(0,n-r+t[2]-t[0])}},Qc=jo(),st="data-scroll-locked",el=function(e,t,r,n){var o=e.left,a=e.top,i=e.right,s=e.gap;return r===void 0&&(r="margin"),`
  .`.concat(zc,` {
   overflow: hidden `).concat(n,`;
   padding-right: `).concat(s,"px ").concat(n,`;
  }
  body[`).concat(st,`] {
    overflow: hidden `).concat(n,`;
    overscroll-behavior: contain;
    `).concat([t&&"position: relative ".concat(n,";"),r==="margin"&&`
    padding-left: `.concat(o,`px;
    padding-top: `).concat(a,`px;
    padding-right: `).concat(i,`px;
    margin-left:0;
    margin-top:0;
    margin-right: `).concat(s,"px ").concat(n,`;
    `),r==="padding"&&"padding-right: ".concat(s,"px ").concat(n,";")].filter(Boolean).join(""),`
  }
  
  .`).concat(Tt,` {
    right: `).concat(s,"px ").concat(n,`;
  }
  
  .`).concat(It,` {
    margin-right: `).concat(s,"px ").concat(n,`;
  }
  
  .`).concat(Tt," .").concat(Tt,` {
    right: 0 `).concat(n,`;
  }
  
  .`).concat(It," .").concat(It,` {
    margin-right: 0 `).concat(n,`;
  }
  
  body[`).concat(st,`] {
    `).concat(Hc,": ").concat(s,`px;
  }
`)},jn=function(){var e=parseInt(document.body.getAttribute(st)||"0",10);return isFinite(e)?e:0},tl=function(){c.useEffect(function(){return document.body.setAttribute(st,(jn()+1).toString()),function(){var e=jn()-1;e<=0?document.body.removeAttribute(st):document.body.setAttribute(st,e.toString())}},[])},rl=function(e){var t=e.noRelative,r=e.noImportant,n=e.gapMode,o=n===void 0?"margin":n;tl();var a=c.useMemo(function(){return Jc(o)},[o]);return c.createElement(Qc,{styles:el(a,!t,o,r?"":"!important")})},xr=!1;if(typeof window<"u")try{var Pt=Object.defineProperty({},"passive",{get:function(){return xr=!0,!0}});window.addEventListener("test",Pt,Pt),window.removeEventListener("test",Pt,Pt)}catch{xr=!1}var nt=xr?{passive:!1}:!1,nl=function(e){return e.tagName==="TEXTAREA"},Fo=function(e,t){if(!(e instanceof Element))return!1;var r=window.getComputedStyle(e);return r[t]!=="hidden"&&!(r.overflowY===r.overflowX&&!nl(e)&&r[t]==="visible")},ol=function(e){return Fo(e,"overflowY")},al=function(e){return Fo(e,"overflowX")},Fn=function(e,t){var r=t.ownerDocument,n=t;do{typeof ShadowRoot<"u"&&n instanceof ShadowRoot&&(n=n.host);var o=Lo(e,n);if(o){var a=Vo(e,n),i=a[1],s=a[2];if(i>s)return!0}n=n.parentNode}while(n&&n!==r.body);return!1},il=function(e){var t=e.scrollTop,r=e.scrollHeight,n=e.clientHeight;return[t,r,n]},sl=function(e){var t=e.scrollLeft,r=e.scrollWidth,n=e.clientWidth;return[t,r,n]},Lo=function(e,t){return e==="v"?ol(t):al(t)},Vo=function(e,t){return e==="v"?il(t):sl(t)},cl=function(e,t){return e==="h"&&t==="rtl"?-1:1},ll=function(e,t,r,n,o){var a=cl(e,window.getComputedStyle(t).direction),i=a*n,s=r.target,l=t.contains(s),d=!1,p=i>0,h=0,m=0;do{if(!s)break;var C=Vo(e,s),E=C[0],f=C[1],u=C[2],g=f-u-a*E;(E||g)&&Lo(e,s)&&(h+=g,m+=E);var v=s.parentNode;s=v&&v.nodeType===Node.DOCUMENT_FRAGMENT_NODE?v.host:v}while(!l&&s!==document.body||l&&(t.contains(s)||t===s));return(p&&Math.abs(h)<1||!p&&Math.abs(m)<1)&&(d=!0),d},Mt=function(e){return"changedTouches"in e?[e.changedTouches[0].clientX,e.changedTouches[0].clientY]:[0,0]},Ln=function(e){return[e.deltaX,e.deltaY]},Vn=function(e){return e&&"current"in e?e.current:e},ul=function(e,t){return e[0]===t[0]&&e[1]===t[1]},dl=function(e){return`
  .block-interactivity-`.concat(e,` {pointer-events: none;}
  .allow-interactivity-`).concat(e,` {pointer-events: all;}
`)},fl=0,ot=[];function pl(e){var t=c.useRef([]),r=c.useRef([0,0]),n=c.useRef(),o=c.useState(fl++)[0],a=c.useState(jo)[0],i=c.useRef(e);c.useEffect(function(){i.current=e},[e]),c.useEffect(function(){if(e.inert){document.body.classList.add("block-interactivity-".concat(o));var f=Oi([e.lockRef.current],(e.shards||[]).map(Vn),!0).filter(Boolean);return f.forEach(function(u){return u.classList.add("allow-interactivity-".concat(o))}),function(){document.body.classList.remove("block-interactivity-".concat(o)),f.forEach(function(u){return u.classList.remove("allow-interactivity-".concat(o))})}}},[e.inert,e.lockRef.current,e.shards]);var s=c.useCallback(function(f,u){if("touches"in f&&f.touches.length===2||f.type==="wheel"&&f.ctrlKey)return!i.current.allowPinchZoom;var g=Mt(f),v=r.current,k="deltaX"in f?f.deltaX:v[0]-g[0],_="deltaY"in f?f.deltaY:v[1]-g[1],R,V=f.target,I=Math.abs(k)>Math.abs(_)?"h":"v";if("touches"in f&&I==="h"&&V.type==="range")return!1;var $=Fn(I,V);if(!$)return!0;if($?R=I:(R=I==="v"?"h":"v",$=Fn(I,V)),!$)return!1;if(!n.current&&"changedTouches"in f&&(k||_)&&(n.current=R),!R)return!0;var Q=n.current||R;return ll(Q,u,f,Q==="h"?k:_)},[]),l=c.useCallback(function(f){var u=f;if(!(!ot.length||ot[ot.length-1]!==a)){var g="deltaY"in u?Ln(u):Mt(u),v=t.current.filter(function(R){return R.name===u.type&&(R.target===u.target||u.target===R.shadowParent)&&ul(R.delta,g)})[0];if(v&&v.should){u.cancelable&&u.preventDefault();return}if(!v){var k=(i.current.shards||[]).map(Vn).filter(Boolean).filter(function(R){return R.contains(u.target)}),_=k.length>0?s(u,k[0]):!i.current.noIsolation;_&&u.cancelable&&u.preventDefault()}}},[]),d=c.useCallback(function(f,u,g,v){var k={name:f,delta:u,target:g,should:v,shadowParent:yl(g)};t.current.push(k),setTimeout(function(){t.current=t.current.filter(function(_){return _!==k})},1)},[]),p=c.useCallback(function(f){r.current=Mt(f),n.current=void 0},[]),h=c.useCallback(function(f){d(f.type,Ln(f),f.target,s(f,e.lockRef.current))},[]),m=c.useCallback(function(f){d(f.type,Mt(f),f.target,s(f,e.lockRef.current))},[]);c.useEffect(function(){return ot.push(a),e.setCallbacks({onScrollCapture:h,onWheelCapture:h,onTouchMoveCapture:m}),document.addEventListener("wheel",l,nt),document.addEventListener("touchmove",l,nt),document.addEventListener("touchstart",p,nt),function(){ot=ot.filter(function(f){return f!==a}),document.removeEventListener("wheel",l,nt),document.removeEventListener("touchmove",l,nt),document.removeEventListener("touchstart",p,nt)}},[]);var C=e.removeScrollBar,E=e.inert;return c.createElement(c.Fragment,null,E?c.createElement(a,{styles:dl(o)}):null,C?c.createElement(rl,{noRelative:e.noRelative,gapMode:e.gapMode}):null)}function yl(e){for(var t=null;e!==null;)e instanceof ShadowRoot&&(t=e.host,e=e.host),e=e.parentNode;return t}const hl=Ni(Do,pl);var Yr=c.forwardRef(function(e,t){return c.createElement(Wt,at({},e,{ref:t,sideCar:hl}))});Yr.classNames=Wt.classNames;var Kt="Dialog",[$o,Np]=De(Kt),[ml,Ie]=$o(Kt),Bo=e=>{const{__scopeDialog:t,children:r,open:n,defaultOpen:o,onOpenChange:a,modal:i=!0}=e,s=c.useRef(null),l=c.useRef(null),[d,p]=qe({prop:n,defaultProp:o??!1,onChange:a,caller:Kt});return S.jsx(ml,{scope:t,triggerRef:s,contentRef:l,contentId:Ue(),titleId:Ue(),descriptionId:Ue(),open:d,onOpenChange:p,onOpenToggle:c.useCallback(()=>p(h=>!h),[p]),modal:i,children:r})};Bo.displayName=Kt;var Uo="DialogTrigger",zo=c.forwardRef((e,t)=>{const{__scopeDialog:r,...n}=e,o=Ie(Uo,r),a=oe(t,o.triggerRef);return S.jsx(q.button,{type:"button","aria-haspopup":"dialog","aria-expanded":o.open,"aria-controls":o.contentId,"data-state":Qr(o.open),...n,ref:a,onClick:J(e.onClick,o.onOpenToggle)})});zo.displayName=Uo;var Xr="DialogPortal",[vl,Ho]=$o(Xr,{forceMount:void 0}),qo=e=>{const{__scopeDialog:t,forceMount:r,children:n,container:o}=e,a=Ie(Xr,t);return S.jsx(vl,{scope:t,forceMount:r,children:c.Children.map(n,i=>S.jsx(ut,{present:r||a.open,children:S.jsx(Zr,{asChild:!0,container:o,children:i})}))})};qo.displayName=Xr;var Ft="DialogOverlay",Wo=c.forwardRef((e,t)=>{const r=Ho(Ft,e.__scopeDialog),{forceMount:n=r.forceMount,...o}=e,a=Ie(Ft,e.__scopeDialog);return a.modal?S.jsx(ut,{present:n||a.open,children:S.jsx(bl,{...o,ref:t})}):null});Wo.displayName=Ft;var gl=ct("DialogOverlay.RemoveScroll"),bl=c.forwardRef((e,t)=>{const{__scopeDialog:r,...n}=e,o=Ie(Ft,r);return S.jsx(Yr,{as:gl,allowPinchZoom:!0,shards:[o.contentRef],children:S.jsx(q.div,{"data-state":Qr(o.open),...n,ref:t,style:{pointerEvents:"auto",...n.style}})})}),Qe="DialogContent",Ko=c.forwardRef((e,t)=>{const r=Ho(Qe,e.__scopeDialog),{forceMount:n=r.forceMount,...o}=e,a=Ie(Qe,e.__scopeDialog);return S.jsx(ut,{present:n||a.open,children:a.modal?S.jsx(xl,{...o,ref:t}):S.jsx(Sl,{...o,ref:t})})});Ko.displayName=Qe;var xl=c.forwardRef((e,t)=>{const r=Ie(Qe,e.__scopeDialog),n=c.useRef(null),o=oe(t,r.contentRef,n);return c.useEffect(()=>{const a=n.current;if(a)return to(a)},[]),S.jsx(Go,{...e,ref:o,trapFocus:r.open,disableOutsidePointerEvents:!0,onCloseAutoFocus:J(e.onCloseAutoFocus,a=>{var i;a.preventDefault(),(i=r.triggerRef.current)==null||i.focus()}),onPointerDownOutside:J(e.onPointerDownOutside,a=>{const i=a.detail.originalEvent,s=i.button===0&&i.ctrlKey===!0;(i.button===2||s)&&a.preventDefault()}),onFocusOutside:J(e.onFocusOutside,a=>a.preventDefault())})}),Sl=c.forwardRef((e,t)=>{const r=Ie(Qe,e.__scopeDialog),n=c.useRef(!1),o=c.useRef(!1);return S.jsx(Go,{...e,ref:t,trapFocus:!1,disableOutsidePointerEvents:!1,onCloseAutoFocus:a=>{var i,s;(i=e.onCloseAutoFocus)==null||i.call(e,a),a.defaultPrevented||(n.current||(s=r.triggerRef.current)==null||s.focus(),a.preventDefault()),n.current=!1,o.current=!1},onInteractOutside:a=>{var l,d;(l=e.onInteractOutside)==null||l.call(e,a),a.defaultPrevented||(n.current=!0,a.detail.originalEvent.type==="pointerdown"&&(o.current=!0));const i=a.target;((d=r.triggerRef.current)==null?void 0:d.contains(i))&&a.preventDefault(),a.detail.originalEvent.type==="focusin"&&o.current&&a.preventDefault()}})}),Go=c.forwardRef((e,t)=>{const{__scopeDialog:r,trapFocus:n,onOpenAutoFocus:o,onCloseAutoFocus:a,...i}=e,s=Ie(Qe,r),l=c.useRef(null),d=oe(t,l);return No(),S.jsxs(S.Fragment,{children:[S.jsx(Gr,{asChild:!0,loop:!0,trapped:n,onMountAutoFocus:o,onUnmountAutoFocus:a,children:S.jsx(Kr,{role:"dialog",id:s.contentId,"aria-describedby":s.descriptionId,"aria-labelledby":s.titleId,"data-state":Qr(s.open),...i,ref:d,onDismiss:()=>s.onOpenChange(!1)})}),S.jsxs(S.Fragment,{children:[S.jsx(wl,{titleId:s.titleId}),S.jsx(Cl,{contentRef:l,descriptionId:s.descriptionId})]})]})}),Jr="DialogTitle",Zo=c.forwardRef((e,t)=>{const{__scopeDialog:r,...n}=e,o=Ie(Jr,r);return S.jsx(q.h2,{id:o.titleId,...n,ref:t})});Zo.displayName=Jr;var Yo="DialogDescription",Xo=c.forwardRef((e,t)=>{const{__scopeDialog:r,...n}=e,o=Ie(Yo,r);return S.jsx(q.p,{id:o.descriptionId,...n,ref:t})});Xo.displayName=Yo;var Jo="DialogClose",Qo=c.forwardRef((e,t)=>{const{__scopeDialog:r,...n}=e,o=Ie(Jo,r);return S.jsx(q.button,{type:"button",...n,ref:t,onClick:J(e.onClick,()=>o.onOpenChange(!1))})});Qo.displayName=Jo;function Qr(e){return e?"open":"closed"}var ea="DialogTitleWarning",[Dp,ta]=rc(ea,{contentName:Qe,titleName:Jr,docsSlug:"dialog"}),wl=({titleId:e})=>{const t=ta(ea),r=`\`${t.contentName}\` requires a \`${t.titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${t.titleName}\`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/${t.docsSlug}`;return c.useEffect(()=>{e&&(document.getElementById(e)||console.error(r))},[r,e]),null},kl="DialogDescriptionWarning",Cl=({contentRef:e,descriptionId:t})=>{const n=`Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${ta(kl).contentName}}.`;return c.useEffect(()=>{var a;const o=(a=e.current)==null?void 0:a.getAttribute("aria-describedby");t&&o&&(document.getElementById(t)||console.warn(n))},[n,e,t]),null},jp=Bo,Fp=zo,Lp=qo,Vp=Wo,$p=Ko,Bp=Zo,Up=Xo,zp=Qo;function Gt(e){const t=c.useRef({value:e,previous:e});return c.useMemo(()=>(t.current.value!==e&&(t.current.previous=t.current.value,t.current.value=e),t.current.previous),[e])}function Zt(e){const[t,r]=c.useState(void 0);return xe(()=>{if(e){r({width:e.offsetWidth,height:e.offsetHeight});const n=new ResizeObserver(o=>{if(!Array.isArray(o)||!o.length)return;const a=o[0];let i,s;if("borderBoxSize"in a){const l=a.borderBoxSize,d=Array.isArray(l)?l[0]:l;i=d.inlineSize,s=d.blockSize}else i=e.offsetWidth,s=e.offsetHeight;r({width:i,height:s})});return n.observe(e,{box:"border-box"}),()=>n.unobserve(e)}else r(void 0)},[e]),t}var Yt="Switch",[Al,Hp]=De(Yt),[El,_l]=Al(Yt),ra=c.forwardRef((e,t)=>{const{__scopeSwitch:r,name:n,checked:o,defaultChecked:a,required:i,disabled:s,value:l="on",onCheckedChange:d,form:p,...h}=e,[m,C]=c.useState(null),E=oe(t,k=>C(k)),f=c.useRef(!1),u=m?p||!!m.closest("form"):!0,[g,v]=qe({prop:o,defaultProp:a??!1,onChange:d,caller:Yt});return S.jsxs(El,{scope:r,checked:g,disabled:s,children:[S.jsx(q.button,{type:"button",role:"switch","aria-checked":g,"aria-required":i,"data-state":ia(g),"data-disabled":s?"":void 0,disabled:s,value:l,...h,ref:E,onClick:J(e.onClick,k=>{v(_=>!_),u&&(f.current=k.isPropagationStopped(),f.current||k.stopPropagation())})}),u&&S.jsx(aa,{control:m,bubbles:!f.current,name:n,value:l,checked:g,required:i,disabled:s,form:p,style:{transform:"translateX(-100%)"}})]})});ra.displayName=Yt;var na="SwitchThumb",oa=c.forwardRef((e,t)=>{const{__scopeSwitch:r,...n}=e,o=_l(na,r);return S.jsx(q.span,{"data-state":ia(o.checked),"data-disabled":o.disabled?"":void 0,...n,ref:t})});oa.displayName=na;var Pl="SwitchBubbleInput",aa=c.forwardRef(({__scopeSwitch:e,control:t,checked:r,bubbles:n=!0,...o},a)=>{const i=c.useRef(null),s=oe(i,a),l=Gt(r),d=Zt(t);return c.useEffect(()=>{const p=i.current;if(!p)return;const h=window.HTMLInputElement.prototype,C=Object.getOwnPropertyDescriptor(h,"checked").set;if(l!==r&&C){const E=new Event("click",{bubbles:n});C.call(p,r),p.dispatchEvent(E)}},[l,r,n]),S.jsx("input",{type:"checkbox","aria-hidden":!0,defaultChecked:r,...o,tabIndex:-1,ref:s,style:{...o.style,...d,position:"absolute",pointerEvents:"none",opacity:0,margin:0}})});aa.displayName=Pl;function ia(e){return e?"checked":"unchecked"}var qp=ra,Wp=oa,en="Progress",tn=100,[Ml,Kp]=De(en),[Rl,Tl]=Ml(en),sa=c.forwardRef((e,t)=>{const{__scopeProgress:r,value:n=null,max:o,getValueLabel:a=Il,...i}=e;(o||o===0)&&!$n(o)&&console.error(Ol(`${o}`,"Progress"));const s=$n(o)?o:tn;n!==null&&!Bn(n,s)&&console.error(Nl(`${n}`,"Progress"));const l=Bn(n,s)?n:null,d=Lt(l)?a(l,s):void 0;return S.jsx(Rl,{scope:r,value:l,max:s,children:S.jsx(q.div,{"aria-valuemax":s,"aria-valuemin":0,"aria-valuenow":Lt(l)?l:void 0,"aria-valuetext":d,role:"progressbar","data-state":ua(l,s),"data-value":l??void 0,"data-max":s,...i,ref:t})})});sa.displayName=en;var ca="ProgressIndicator",la=c.forwardRef((e,t)=>{const{__scopeProgress:r,...n}=e,o=Tl(ca,r);return S.jsx(q.div,{"data-state":ua(o.value,o.max),"data-value":o.value??void 0,"data-max":o.max,...n,ref:t})});la.displayName=ca;function Il(e,t){return`${Math.round(e/t*100)}%`}function ua(e,t){return e==null?"indeterminate":e===t?"complete":"loading"}function Lt(e){return typeof e=="number"}function $n(e){return Lt(e)&&!isNaN(e)&&e>0}function Bn(e,t){return Lt(e)&&!isNaN(e)&&e<=t&&e>=0}function Ol(e,t){return`Invalid prop \`max\` of value \`${e}\` supplied to \`${t}\`. Only numbers greater than 0 are valid max values. Defaulting to \`${tn}\`.`}function Nl(e,t){return`Invalid prop \`value\` of value \`${e}\` supplied to \`${t}\`. The \`value\` prop must be:
  - a positive number
  - less than the value passed to \`max\` (or ${tn} if no \`max\` prop is set)
  - \`null\` or \`undefined\` if the progress is indeterminate.

Defaulting to \`null\`.`}var Gp=sa,Zp=la,Dl="Arrow",da=c.forwardRef((e,t)=>{const{children:r,width:n=10,height:o=5,...a}=e;return S.jsx(q.svg,{...a,ref:t,width:n,height:o,viewBox:"0 0 30 10",preserveAspectRatio:"none",children:e.asChild?r:S.jsx("polygon",{points:"0,0 30,0 15,10"})})});da.displayName=Dl;var jl=da,rn="Popper",[fa,pa]=De(rn),[Fl,ya]=fa(rn),ha=e=>{const{__scopePopper:t,children:r}=e,[n,o]=c.useState(null);return S.jsx(Fl,{scope:t,anchor:n,onAnchorChange:o,children:r})};ha.displayName=rn;var ma="PopperAnchor",va=c.forwardRef((e,t)=>{const{__scopePopper:r,virtualRef:n,...o}=e,a=ya(ma,r),i=c.useRef(null),s=oe(t,i);return c.useEffect(()=>{a.onAnchorChange((n==null?void 0:n.current)||i.current)}),n?null:S.jsx(q.div,{...o,ref:s})});va.displayName=ma;var nn="PopperContent",[Ll,Vl]=fa(nn),ga=c.forwardRef((e,t)=>{var N,U,K,G,se,ae;const{__scopePopper:r,side:n="bottom",sideOffset:o=0,align:a="center",alignOffset:i=0,arrowPadding:s=0,avoidCollisions:l=!0,collisionBoundary:d=[],collisionPadding:p=0,sticky:h="partial",hideWhenDetached:m=!1,updatePositionStrategy:C="optimized",onPlaced:E,...f}=e,u=ya(nn,r),[g,v]=c.useState(null),k=oe(t,Se=>v(Se)),[_,R]=c.useState(null),V=Zt(_),I=(V==null?void 0:V.width)??0,$=(V==null?void 0:V.height)??0,Q=n+(a!=="center"?"-"+a:""),ee=typeof p=="number"?p:{top:0,right:0,bottom:0,left:0,...p},H=Array.isArray(d)?d:[d],j=H.length>0,F={padding:ee,boundary:H.filter(Bl),altBoundary:j},{refs:W,floatingStyles:Z,placement:z,isPositioned:B,middlewareData:ne}=Li({strategy:"fixed",placement:Q,whileElementsMounted:(...Se)=>Di(...Se,{animationFrame:C==="always"}),elements:{reference:u.anchor},middleware:[Vi({mainAxis:o+$,alignmentAxis:i}),l&&$i({mainAxis:!0,crossAxis:!1,limiter:h==="partial"?qi():void 0,...F}),l&&Bi({...F}),Ui({...F,apply:({elements:Se,rects:Ae,availableWidth:Le,availableHeight:Ze})=>{const{width:Ye,height:ln}=Ae.reference,Xe=Se.floating.style;Xe.setProperty("--radix-popper-available-width",`${Le}px`),Xe.setProperty("--radix-popper-available-height",`${Ze}px`),Xe.setProperty("--radix-popper-anchor-width",`${Ye}px`),Xe.setProperty("--radix-popper-anchor-height",`${ln}px`)}}),_&&zi({element:_,padding:s}),Ul({arrowWidth:I,arrowHeight:$}),m&&Hi({strategy:"referenceHidden",...F})]}),[pe,Ce]=Sa(z),b=He(E);xe(()=>{B&&(b==null||b())},[B,b]);const P=(N=ne.arrow)==null?void 0:N.x,Y=(U=ne.arrow)==null?void 0:U.y,te=((K=ne.arrow)==null?void 0:K.centerOffset)!==0,[re,ie]=c.useState();return xe(()=>{g&&ie(window.getComputedStyle(g).zIndex)},[g]),S.jsx("div",{ref:W.setFloating,"data-radix-popper-content-wrapper":"",style:{...Z,transform:B?Z.transform:"translate(0, -200%)",minWidth:"max-content",zIndex:re,"--radix-popper-transform-origin":[(G=ne.transformOrigin)==null?void 0:G.x,(se=ne.transformOrigin)==null?void 0:se.y].join(" "),...((ae=ne.hide)==null?void 0:ae.referenceHidden)&&{visibility:"hidden",pointerEvents:"none"}},dir:e.dir,children:S.jsx(Ll,{scope:r,placedSide:pe,onArrowChange:R,arrowX:P,arrowY:Y,shouldHideArrow:te,children:S.jsx(q.div,{"data-side":pe,"data-align":Ce,...f,ref:k,style:{...f.style,animation:B?void 0:"none"}})})})});ga.displayName=nn;var ba="PopperArrow",$l={top:"bottom",right:"left",bottom:"top",left:"right"},xa=c.forwardRef(function(t,r){const{__scopePopper:n,...o}=t,a=Vl(ba,n),i=$l[a.placedSide];return S.jsx("span",{ref:a.onArrowChange,style:{position:"absolute",left:a.arrowX,top:a.arrowY,[i]:0,transformOrigin:{top:"",right:"0 0",bottom:"center 0",left:"100% 0"}[a.placedSide],transform:{top:"translateY(100%)",right:"translateY(50%) rotate(90deg) translateX(-50%)",bottom:"rotate(180deg)",left:"translateY(50%) rotate(-90deg) translateX(50%)"}[a.placedSide],visibility:a.shouldHideArrow?"hidden":void 0},children:S.jsx(jl,{...o,ref:r,style:{...o.style,display:"block"}})})});xa.displayName=ba;function Bl(e){return e!==null}var Ul=e=>({name:"transformOrigin",options:e,fn(t){var u,g,v;const{placement:r,rects:n,middlewareData:o}=t,i=((u=o.arrow)==null?void 0:u.centerOffset)!==0,s=i?0:e.arrowWidth,l=i?0:e.arrowHeight,[d,p]=Sa(r),h={start:"0%",center:"50%",end:"100%"}[p],m=(((g=o.arrow)==null?void 0:g.x)??0)+s/2,C=(((v=o.arrow)==null?void 0:v.y)??0)+l/2;let E="",f="";return d==="bottom"?(E=i?h:`${m}px`,f=`${-l}px`):d==="top"?(E=i?h:`${m}px`,f=`${n.floating.height+l}px`):d==="right"?(E=`${-l}px`,f=i?h:`${C}px`):d==="left"&&(E=`${n.floating.width+l}px`,f=i?h:`${C}px`),{data:{x:E,y:f}}}});function Sa(e){const[t,r="center"]=e.split("-");return[t,r]}var zl=ha,Hl=va,ql=ga,Wl=xa,wa=Object.freeze({position:"absolute",border:0,width:1,height:1,padding:0,margin:-1,overflow:"hidden",clip:"rect(0, 0, 0, 0)",whiteSpace:"nowrap",wordWrap:"normal"}),Kl="VisuallyHidden",Gl=c.forwardRef((e,t)=>S.jsx(q.span,{...e,ref:t,style:{...wa,...e.style}}));Gl.displayName=Kl;var Zl=[" ","Enter","ArrowUp","ArrowDown"],Yl=[" ","Enter"],et="Select",[Xt,Jt,Xl]=qr(et),[dt,Yp]=De(et,[Xl,pa]),Qt=pa(),[Jl,Ke]=dt(et),[Ql,eu]=dt(et),ka=e=>{const{__scopeSelect:t,children:r,open:n,defaultOpen:o,onOpenChange:a,value:i,defaultValue:s,onValueChange:l,dir:d,name:p,autoComplete:h,disabled:m,required:C,form:E}=e,f=Qt(t),[u,g]=c.useState(null),[v,k]=c.useState(null),[_,R]=c.useState(!1),V=Ht(d),[I,$]=qe({prop:n,defaultProp:o??!1,onChange:a,caller:et}),[Q,ee]=qe({prop:i,defaultProp:s,onChange:l,caller:et}),H=c.useRef(null),j=u?E||!!u.closest("form"):!0,[F,W]=c.useState(new Set),Z=Array.from(F).map(z=>z.props.value).join(";");return S.jsx(zl,{...f,children:S.jsxs(Jl,{required:C,scope:t,trigger:u,onTriggerChange:g,valueNode:v,onValueNodeChange:k,valueNodeHasChildren:_,onValueNodeHasChildrenChange:R,contentId:Ue(),value:Q,onValueChange:ee,open:I,onOpenChange:$,dir:V,triggerPointerDownPosRef:H,disabled:m,children:[S.jsx(Xt.Provider,{scope:t,children:S.jsx(Ql,{scope:e.__scopeSelect,onNativeOptionAdd:c.useCallback(z=>{W(B=>new Set(B).add(z))},[]),onNativeOptionRemove:c.useCallback(z=>{W(B=>{const ne=new Set(B);return ne.delete(z),ne})},[]),children:r})}),j?S.jsxs(Ka,{"aria-hidden":!0,required:C,tabIndex:-1,name:p,autoComplete:h,value:Q,onChange:z=>ee(z.target.value),disabled:m,form:E,children:[Q===void 0?S.jsx("option",{value:""}):null,Array.from(F)]},Z):null]})})};ka.displayName=et;var Ca="SelectTrigger",Aa=c.forwardRef((e,t)=>{const{__scopeSelect:r,disabled:n=!1,...o}=e,a=Qt(r),i=Ke(Ca,r),s=i.disabled||n,l=oe(t,i.onTriggerChange),d=Jt(r),p=c.useRef("touch"),[h,m,C]=Za(f=>{const u=d().filter(k=>!k.disabled),g=u.find(k=>k.value===i.value),v=Ya(u,f,g);v!==void 0&&i.onValueChange(v.value)}),E=f=>{s||(i.onOpenChange(!0),C()),f&&(i.triggerPointerDownPosRef.current={x:Math.round(f.pageX),y:Math.round(f.pageY)})};return S.jsx(Hl,{asChild:!0,...a,children:S.jsx(q.button,{type:"button",role:"combobox","aria-controls":i.contentId,"aria-expanded":i.open,"aria-required":i.required,"aria-autocomplete":"none",dir:i.dir,"data-state":i.open?"open":"closed",disabled:s,"data-disabled":s?"":void 0,"data-placeholder":Ga(i.value)?"":void 0,...o,ref:l,onClick:J(o.onClick,f=>{f.currentTarget.focus(),p.current!=="mouse"&&E(f)}),onPointerDown:J(o.onPointerDown,f=>{p.current=f.pointerType;const u=f.target;u.hasPointerCapture(f.pointerId)&&u.releasePointerCapture(f.pointerId),f.button===0&&f.ctrlKey===!1&&f.pointerType==="mouse"&&(E(f),f.preventDefault())}),onKeyDown:J(o.onKeyDown,f=>{const u=h.current!=="";!(f.ctrlKey||f.altKey||f.metaKey)&&f.key.length===1&&m(f.key),!(u&&f.key===" ")&&Zl.includes(f.key)&&(E(),f.preventDefault())})})})});Aa.displayName=Ca;var Ea="SelectValue",_a=c.forwardRef((e,t)=>{const{__scopeSelect:r,className:n,style:o,children:a,placeholder:i="",...s}=e,l=Ke(Ea,r),{onValueNodeHasChildrenChange:d}=l,p=a!==void 0,h=oe(t,l.onValueNodeChange);return xe(()=>{d(p)},[d,p]),S.jsx(q.span,{...s,ref:h,style:{pointerEvents:"none"},children:Ga(l.value)?S.jsx(S.Fragment,{children:i}):a})});_a.displayName=Ea;var tu="SelectIcon",Pa=c.forwardRef((e,t)=>{const{__scopeSelect:r,children:n,...o}=e;return S.jsx(q.span,{"aria-hidden":!0,...o,ref:t,children:n||"▼"})});Pa.displayName=tu;var ru="SelectPortal",Ma=e=>S.jsx(Zr,{asChild:!0,...e});Ma.displayName=ru;var tt="SelectContent",Ra=c.forwardRef((e,t)=>{const r=Ke(tt,e.__scopeSelect),[n,o]=c.useState();if(xe(()=>{o(new DocumentFragment)},[]),!r.open){const a=n;return a?Lr.createPortal(S.jsx(Ta,{scope:e.__scopeSelect,children:S.jsx(Xt.Slot,{scope:e.__scopeSelect,children:S.jsx("div",{children:e.children})})}),a):null}return S.jsx(Ia,{...e,ref:t})});Ra.displayName=tt;var Me=10,[Ta,Ge]=dt(tt),nu="SelectContentImpl",ou=ct("SelectContent.RemoveScroll"),Ia=c.forwardRef((e,t)=>{const{__scopeSelect:r,position:n="item-aligned",onCloseAutoFocus:o,onEscapeKeyDown:a,onPointerDownOutside:i,side:s,sideOffset:l,align:d,alignOffset:p,arrowPadding:h,collisionBoundary:m,collisionPadding:C,sticky:E,hideWhenDetached:f,avoidCollisions:u,...g}=e,v=Ke(tt,r),[k,_]=c.useState(null),[R,V]=c.useState(null),I=oe(t,N=>_(N)),[$,Q]=c.useState(null),[ee,H]=c.useState(null),j=Jt(r),[F,W]=c.useState(!1),Z=c.useRef(!1);c.useEffect(()=>{if(k)return to(k)},[k]),No();const z=c.useCallback(N=>{const[U,...K]=j().map(ae=>ae.ref.current),[G]=K.slice(-1),se=document.activeElement;for(const ae of N)if(ae===se||(ae==null||ae.scrollIntoView({block:"nearest"}),ae===U&&R&&(R.scrollTop=0),ae===G&&R&&(R.scrollTop=R.scrollHeight),ae==null||ae.focus(),document.activeElement!==se))return},[j,R]),B=c.useCallback(()=>z([$,k]),[z,$,k]);c.useEffect(()=>{F&&B()},[F,B]);const{onOpenChange:ne,triggerPointerDownPosRef:pe}=v;c.useEffect(()=>{if(k){let N={x:0,y:0};const U=G=>{var se,ae;N={x:Math.abs(Math.round(G.pageX)-(((se=pe.current)==null?void 0:se.x)??0)),y:Math.abs(Math.round(G.pageY)-(((ae=pe.current)==null?void 0:ae.y)??0))}},K=G=>{N.x<=10&&N.y<=10?G.preventDefault():k.contains(G.target)||ne(!1),document.removeEventListener("pointermove",U),pe.current=null};return pe.current!==null&&(document.addEventListener("pointermove",U),document.addEventListener("pointerup",K,{capture:!0,once:!0})),()=>{document.removeEventListener("pointermove",U),document.removeEventListener("pointerup",K,{capture:!0})}}},[k,ne,pe]),c.useEffect(()=>{const N=()=>ne(!1);return window.addEventListener("blur",N),window.addEventListener("resize",N),()=>{window.removeEventListener("blur",N),window.removeEventListener("resize",N)}},[ne]);const[Ce,b]=Za(N=>{const U=j().filter(se=>!se.disabled),K=U.find(se=>se.ref.current===document.activeElement),G=Ya(U,N,K);G&&setTimeout(()=>G.ref.current.focus())}),P=c.useCallback((N,U,K)=>{const G=!Z.current&&!K;(v.value!==void 0&&v.value===U||G)&&(Q(N),G&&(Z.current=!0))},[v.value]),Y=c.useCallback(()=>k==null?void 0:k.focus(),[k]),te=c.useCallback((N,U,K)=>{const G=!Z.current&&!K;(v.value!==void 0&&v.value===U||G)&&H(N)},[v.value]),re=n==="popper"?Sr:Oa,ie=re===Sr?{side:s,sideOffset:l,align:d,alignOffset:p,arrowPadding:h,collisionBoundary:m,collisionPadding:C,sticky:E,hideWhenDetached:f,avoidCollisions:u}:{};return S.jsx(Ta,{scope:r,content:k,viewport:R,onViewportChange:V,itemRefCallback:P,selectedItem:$,onItemLeave:Y,itemTextRefCallback:te,focusSelectedItem:B,selectedItemText:ee,position:n,isPositioned:F,searchRef:Ce,children:S.jsx(Yr,{as:ou,allowPinchZoom:!0,children:S.jsx(Gr,{asChild:!0,trapped:v.open,onMountAutoFocus:N=>{N.preventDefault()},onUnmountAutoFocus:J(o,N=>{var U;(U=v.trigger)==null||U.focus({preventScroll:!0}),N.preventDefault()}),children:S.jsx(Kr,{asChild:!0,disableOutsidePointerEvents:!0,onEscapeKeyDown:a,onPointerDownOutside:i,onFocusOutside:N=>N.preventDefault(),onDismiss:()=>v.onOpenChange(!1),children:S.jsx(re,{role:"listbox",id:v.contentId,"data-state":v.open?"open":"closed",dir:v.dir,onContextMenu:N=>N.preventDefault(),...g,...ie,onPlaced:()=>W(!0),ref:I,style:{display:"flex",flexDirection:"column",outline:"none",...g.style},onKeyDown:J(g.onKeyDown,N=>{const U=N.ctrlKey||N.altKey||N.metaKey;if(N.key==="Tab"&&N.preventDefault(),!U&&N.key.length===1&&b(N.key),["ArrowUp","ArrowDown","Home","End"].includes(N.key)){let G=j().filter(se=>!se.disabled).map(se=>se.ref.current);if(["ArrowUp","End"].includes(N.key)&&(G=G.slice().reverse()),["ArrowUp","ArrowDown"].includes(N.key)){const se=N.target,ae=G.indexOf(se);G=G.slice(ae+1)}setTimeout(()=>z(G)),N.preventDefault()}})})})})})})});Ia.displayName=nu;var au="SelectItemAlignedPosition",Oa=c.forwardRef((e,t)=>{const{__scopeSelect:r,onPlaced:n,...o}=e,a=Ke(tt,r),i=Ge(tt,r),[s,l]=c.useState(null),[d,p]=c.useState(null),h=oe(t,I=>p(I)),m=Jt(r),C=c.useRef(!1),E=c.useRef(!0),{viewport:f,selectedItem:u,selectedItemText:g,focusSelectedItem:v}=i,k=c.useCallback(()=>{if(a.trigger&&a.valueNode&&s&&d&&f&&u&&g){const I=a.trigger.getBoundingClientRect(),$=d.getBoundingClientRect(),Q=a.valueNode.getBoundingClientRect(),ee=g.getBoundingClientRect();if(a.dir!=="rtl"){const se=ee.left-$.left,ae=Q.left-se,Se=I.left-ae,Ae=I.width+Se,Le=Math.max(Ae,$.width),Ze=window.innerWidth-Me,Ye=Ot(ae,[Me,Math.max(Me,Ze-Le)]);s.style.minWidth=Ae+"px",s.style.left=Ye+"px"}else{const se=$.right-ee.right,ae=window.innerWidth-Q.right-se,Se=window.innerWidth-I.right-ae,Ae=I.width+Se,Le=Math.max(Ae,$.width),Ze=window.innerWidth-Me,Ye=Ot(ae,[Me,Math.max(Me,Ze-Le)]);s.style.minWidth=Ae+"px",s.style.right=Ye+"px"}const H=m(),j=window.innerHeight-Me*2,F=f.scrollHeight,W=window.getComputedStyle(d),Z=parseInt(W.borderTopWidth,10),z=parseInt(W.paddingTop,10),B=parseInt(W.borderBottomWidth,10),ne=parseInt(W.paddingBottom,10),pe=Z+z+F+ne+B,Ce=Math.min(u.offsetHeight*5,pe),b=window.getComputedStyle(f),P=parseInt(b.paddingTop,10),Y=parseInt(b.paddingBottom,10),te=I.top+I.height/2-Me,re=j-te,ie=u.offsetHeight/2,N=u.offsetTop+ie,U=Z+z+N,K=pe-U;if(U<=te){const se=H.length>0&&u===H[H.length-1].ref.current;s.style.bottom="0px";const ae=d.clientHeight-f.offsetTop-f.offsetHeight,Se=Math.max(re,ie+(se?Y:0)+ae+B),Ae=U+Se;s.style.height=Ae+"px"}else{const se=H.length>0&&u===H[0].ref.current;s.style.top="0px";const Se=Math.max(te,Z+f.offsetTop+(se?P:0)+ie)+K;s.style.height=Se+"px",f.scrollTop=U-te+f.offsetTop}s.style.margin=`${Me}px 0`,s.style.minHeight=Ce+"px",s.style.maxHeight=j+"px",n==null||n(),requestAnimationFrame(()=>C.current=!0)}},[m,a.trigger,a.valueNode,s,d,f,u,g,a.dir,n]);xe(()=>k(),[k]);const[_,R]=c.useState();xe(()=>{d&&R(window.getComputedStyle(d).zIndex)},[d]);const V=c.useCallback(I=>{I&&E.current===!0&&(k(),v==null||v(),E.current=!1)},[k,v]);return S.jsx(su,{scope:r,contentWrapper:s,shouldExpandOnScrollRef:C,onScrollButtonChange:V,children:S.jsx("div",{ref:l,style:{display:"flex",flexDirection:"column",position:"fixed",zIndex:_},children:S.jsx(q.div,{...o,ref:h,style:{boxSizing:"border-box",maxHeight:"100%",...o.style}})})})});Oa.displayName=au;var iu="SelectPopperPosition",Sr=c.forwardRef((e,t)=>{const{__scopeSelect:r,align:n="start",collisionPadding:o=Me,...a}=e,i=Qt(r);return S.jsx(ql,{...i,...a,ref:t,align:n,collisionPadding:o,style:{boxSizing:"border-box",...a.style,"--radix-select-content-transform-origin":"var(--radix-popper-transform-origin)","--radix-select-content-available-width":"var(--radix-popper-available-width)","--radix-select-content-available-height":"var(--radix-popper-available-height)","--radix-select-trigger-width":"var(--radix-popper-anchor-width)","--radix-select-trigger-height":"var(--radix-popper-anchor-height)"}})});Sr.displayName=iu;var[su,on]=dt(tt,{}),wr="SelectViewport",Na=c.forwardRef((e,t)=>{const{__scopeSelect:r,nonce:n,...o}=e,a=Ge(wr,r),i=on(wr,r),s=oe(t,a.onViewportChange),l=c.useRef(0);return S.jsxs(S.Fragment,{children:[S.jsx("style",{dangerouslySetInnerHTML:{__html:"[data-radix-select-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-select-viewport]::-webkit-scrollbar{display:none}"},nonce:n}),S.jsx(Xt.Slot,{scope:r,children:S.jsx(q.div,{"data-radix-select-viewport":"",role:"presentation",...o,ref:s,style:{position:"relative",flex:1,overflow:"hidden auto",...o.style},onScroll:J(o.onScroll,d=>{const p=d.currentTarget,{contentWrapper:h,shouldExpandOnScrollRef:m}=i;if(m!=null&&m.current&&h){const C=Math.abs(l.current-p.scrollTop);if(C>0){const E=window.innerHeight-Me*2,f=parseFloat(h.style.minHeight),u=parseFloat(h.style.height),g=Math.max(f,u);if(g<E){const v=g+C,k=Math.min(E,v),_=v-k;h.style.height=k+"px",h.style.bottom==="0px"&&(p.scrollTop=_>0?_:0,h.style.justifyContent="flex-end")}}}l.current=p.scrollTop})})})]})});Na.displayName=wr;var Da="SelectGroup",[cu,lu]=dt(Da),uu=c.forwardRef((e,t)=>{const{__scopeSelect:r,...n}=e,o=Ue();return S.jsx(cu,{scope:r,id:o,children:S.jsx(q.div,{role:"group","aria-labelledby":o,...n,ref:t})})});uu.displayName=Da;var ja="SelectLabel",Fa=c.forwardRef((e,t)=>{const{__scopeSelect:r,...n}=e,o=lu(ja,r);return S.jsx(q.div,{id:o.id,...n,ref:t})});Fa.displayName=ja;var Vt="SelectItem",[du,La]=dt(Vt),Va=c.forwardRef((e,t)=>{const{__scopeSelect:r,value:n,disabled:o=!1,textValue:a,...i}=e,s=Ke(Vt,r),l=Ge(Vt,r),d=s.value===n,[p,h]=c.useState(a??""),[m,C]=c.useState(!1),E=oe(t,v=>{var k;return(k=l.itemRefCallback)==null?void 0:k.call(l,v,n,o)}),f=Ue(),u=c.useRef("touch"),g=()=>{o||(s.onValueChange(n),s.onOpenChange(!1))};if(n==="")throw new Error("A <Select.Item /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.");return S.jsx(du,{scope:r,value:n,disabled:o,textId:f,isSelected:d,onItemTextChange:c.useCallback(v=>{h(k=>k||((v==null?void 0:v.textContent)??"").trim())},[]),children:S.jsx(Xt.ItemSlot,{scope:r,value:n,disabled:o,textValue:p,children:S.jsx(q.div,{role:"option","aria-labelledby":f,"data-highlighted":m?"":void 0,"aria-selected":d&&m,"data-state":d?"checked":"unchecked","aria-disabled":o||void 0,"data-disabled":o?"":void 0,tabIndex:o?void 0:-1,...i,ref:E,onFocus:J(i.onFocus,()=>C(!0)),onBlur:J(i.onBlur,()=>C(!1)),onClick:J(i.onClick,()=>{u.current!=="mouse"&&g()}),onPointerUp:J(i.onPointerUp,()=>{u.current==="mouse"&&g()}),onPointerDown:J(i.onPointerDown,v=>{u.current=v.pointerType}),onPointerMove:J(i.onPointerMove,v=>{var k;u.current=v.pointerType,o?(k=l.onItemLeave)==null||k.call(l):u.current==="mouse"&&v.currentTarget.focus({preventScroll:!0})}),onPointerLeave:J(i.onPointerLeave,v=>{var k;v.currentTarget===document.activeElement&&((k=l.onItemLeave)==null||k.call(l))}),onKeyDown:J(i.onKeyDown,v=>{var _;((_=l.searchRef)==null?void 0:_.current)!==""&&v.key===" "||(Yl.includes(v.key)&&g(),v.key===" "&&v.preventDefault())})})})})});Va.displayName=Vt;var mt="SelectItemText",$a=c.forwardRef((e,t)=>{const{__scopeSelect:r,className:n,style:o,...a}=e,i=Ke(mt,r),s=Ge(mt,r),l=La(mt,r),d=eu(mt,r),[p,h]=c.useState(null),m=oe(t,g=>h(g),l.onItemTextChange,g=>{var v;return(v=s.itemTextRefCallback)==null?void 0:v.call(s,g,l.value,l.disabled)}),C=p==null?void 0:p.textContent,E=c.useMemo(()=>S.jsx("option",{value:l.value,disabled:l.disabled,children:C},l.value),[l.disabled,l.value,C]),{onNativeOptionAdd:f,onNativeOptionRemove:u}=d;return xe(()=>(f(E),()=>u(E)),[f,u,E]),S.jsxs(S.Fragment,{children:[S.jsx(q.span,{id:l.textId,...a,ref:m}),l.isSelected&&i.valueNode&&!i.valueNodeHasChildren?Lr.createPortal(a.children,i.valueNode):null]})});$a.displayName=mt;var Ba="SelectItemIndicator",Ua=c.forwardRef((e,t)=>{const{__scopeSelect:r,...n}=e;return La(Ba,r).isSelected?S.jsx(q.span,{"aria-hidden":!0,...n,ref:t}):null});Ua.displayName=Ba;var kr="SelectScrollUpButton",za=c.forwardRef((e,t)=>{const r=Ge(kr,e.__scopeSelect),n=on(kr,e.__scopeSelect),[o,a]=c.useState(!1),i=oe(t,n.onScrollButtonChange);return xe(()=>{if(r.viewport&&r.isPositioned){let s=function(){const d=l.scrollTop>0;a(d)};const l=r.viewport;return s(),l.addEventListener("scroll",s),()=>l.removeEventListener("scroll",s)}},[r.viewport,r.isPositioned]),o?S.jsx(qa,{...e,ref:i,onAutoScroll:()=>{const{viewport:s,selectedItem:l}=r;s&&l&&(s.scrollTop=s.scrollTop-l.offsetHeight)}}):null});za.displayName=kr;var Cr="SelectScrollDownButton",Ha=c.forwardRef((e,t)=>{const r=Ge(Cr,e.__scopeSelect),n=on(Cr,e.__scopeSelect),[o,a]=c.useState(!1),i=oe(t,n.onScrollButtonChange);return xe(()=>{if(r.viewport&&r.isPositioned){let s=function(){const d=l.scrollHeight-l.clientHeight,p=Math.ceil(l.scrollTop)<d;a(p)};const l=r.viewport;return s(),l.addEventListener("scroll",s),()=>l.removeEventListener("scroll",s)}},[r.viewport,r.isPositioned]),o?S.jsx(qa,{...e,ref:i,onAutoScroll:()=>{const{viewport:s,selectedItem:l}=r;s&&l&&(s.scrollTop=s.scrollTop+l.offsetHeight)}}):null});Ha.displayName=Cr;var qa=c.forwardRef((e,t)=>{const{__scopeSelect:r,onAutoScroll:n,...o}=e,a=Ge("SelectScrollButton",r),i=c.useRef(null),s=Jt(r),l=c.useCallback(()=>{i.current!==null&&(window.clearInterval(i.current),i.current=null)},[]);return c.useEffect(()=>()=>l(),[l]),xe(()=>{var p;const d=s().find(h=>h.ref.current===document.activeElement);(p=d==null?void 0:d.ref.current)==null||p.scrollIntoView({block:"nearest"})},[s]),S.jsx(q.div,{"aria-hidden":!0,...o,ref:t,style:{flexShrink:0,...o.style},onPointerDown:J(o.onPointerDown,()=>{i.current===null&&(i.current=window.setInterval(n,50))}),onPointerMove:J(o.onPointerMove,()=>{var d;(d=a.onItemLeave)==null||d.call(a),i.current===null&&(i.current=window.setInterval(n,50))}),onPointerLeave:J(o.onPointerLeave,()=>{l()})})}),fu="SelectSeparator",Wa=c.forwardRef((e,t)=>{const{__scopeSelect:r,...n}=e;return S.jsx(q.div,{"aria-hidden":!0,...n,ref:t})});Wa.displayName=fu;var Ar="SelectArrow",pu=c.forwardRef((e,t)=>{const{__scopeSelect:r,...n}=e,o=Qt(r),a=Ke(Ar,r),i=Ge(Ar,r);return a.open&&i.position==="popper"?S.jsx(Wl,{...o,...n,ref:t}):null});pu.displayName=Ar;var yu="SelectBubbleInput",Ka=c.forwardRef(({__scopeSelect:e,value:t,...r},n)=>{const o=c.useRef(null),a=oe(n,o),i=Gt(t);return c.useEffect(()=>{const s=o.current;if(!s)return;const l=window.HTMLSelectElement.prototype,p=Object.getOwnPropertyDescriptor(l,"value").set;if(i!==t&&p){const h=new Event("change",{bubbles:!0});p.call(s,t),s.dispatchEvent(h)}},[i,t]),S.jsx(q.select,{...r,style:{...wa,...r.style},ref:a,defaultValue:t})});Ka.displayName=yu;function Ga(e){return e===""||e===void 0}function Za(e){const t=He(e),r=c.useRef(""),n=c.useRef(0),o=c.useCallback(i=>{const s=r.current+i;t(s),function l(d){r.current=d,window.clearTimeout(n.current),d!==""&&(n.current=window.setTimeout(()=>l(""),1e3))}(s)},[t]),a=c.useCallback(()=>{r.current="",window.clearTimeout(n.current)},[]);return c.useEffect(()=>()=>window.clearTimeout(n.current),[]),[r,o,a]}function Ya(e,t,r){const o=t.length>1&&Array.from(t).every(d=>d===t[0])?t[0]:t,a=r?e.indexOf(r):-1;let i=hu(e,Math.max(a,0));o.length===1&&(i=i.filter(d=>d!==r));const l=i.find(d=>d.textValue.toLowerCase().startsWith(o.toLowerCase()));return l!==r?l:void 0}function hu(e,t){return e.map((r,n)=>e[(t+n)%e.length])}var Xp=ka,Jp=Aa,Qp=_a,ey=Pa,ty=Ma,ry=Ra,ny=Na,oy=Fa,ay=Va,iy=$a,sy=Ua,cy=za,ly=Ha,uy=Wa,yr={exports:{}},le={};/**
 * @license React
 * react-is.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Un;function mu(){if(Un)return le;Un=1;var e=Symbol.for("react.element"),t=Symbol.for("react.portal"),r=Symbol.for("react.fragment"),n=Symbol.for("react.strict_mode"),o=Symbol.for("react.profiler"),a=Symbol.for("react.provider"),i=Symbol.for("react.context"),s=Symbol.for("react.server_context"),l=Symbol.for("react.forward_ref"),d=Symbol.for("react.suspense"),p=Symbol.for("react.suspense_list"),h=Symbol.for("react.memo"),m=Symbol.for("react.lazy"),C=Symbol.for("react.offscreen"),E;E=Symbol.for("react.module.reference");function f(u){if(typeof u=="object"&&u!==null){var g=u.$$typeof;switch(g){case e:switch(u=u.type,u){case r:case o:case n:case d:case p:return u;default:switch(u=u&&u.$$typeof,u){case s:case i:case l:case m:case h:case a:return u;default:return g}}case t:return g}}}return le.ContextConsumer=i,le.ContextProvider=a,le.Element=e,le.ForwardRef=l,le.Fragment=r,le.Lazy=m,le.Memo=h,le.Portal=t,le.Profiler=o,le.StrictMode=n,le.Suspense=d,le.SuspenseList=p,le.isAsyncMode=function(){return!1},le.isConcurrentMode=function(){return!1},le.isContextConsumer=function(u){return f(u)===i},le.isContextProvider=function(u){return f(u)===a},le.isElement=function(u){return typeof u=="object"&&u!==null&&u.$$typeof===e},le.isForwardRef=function(u){return f(u)===l},le.isFragment=function(u){return f(u)===r},le.isLazy=function(u){return f(u)===m},le.isMemo=function(u){return f(u)===h},le.isPortal=function(u){return f(u)===t},le.isProfiler=function(u){return f(u)===o},le.isStrictMode=function(u){return f(u)===n},le.isSuspense=function(u){return f(u)===d},le.isSuspenseList=function(u){return f(u)===p},le.isValidElementType=function(u){return typeof u=="string"||typeof u=="function"||u===r||u===o||u===n||u===d||u===p||u===C||typeof u=="object"&&u!==null&&(u.$$typeof===m||u.$$typeof===h||u.$$typeof===a||u.$$typeof===i||u.$$typeof===l||u.$$typeof===E||u.getModuleId!==void 0)},le.typeOf=f,le}var zn;function vu(){return zn||(zn=1,yr.exports=mu()),yr.exports}var dy=vu();function gu(e){typeof requestAnimationFrame<"u"&&requestAnimationFrame(e)}function Hn(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:0,r=-1,n=function o(a){r<0&&(r=a),a-r>t?(e(a),r=-1):gu(o)};requestAnimationFrame(n)}function Er(e){"@babel/helpers - typeof";return Er=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},Er(e)}function bu(e){return ku(e)||wu(e)||Su(e)||xu()}function xu(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Su(e,t){if(e){if(typeof e=="string")return qn(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);if(r==="Object"&&e.constructor&&(r=e.constructor.name),r==="Map"||r==="Set")return Array.from(e);if(r==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return qn(e,t)}}function qn(e,t){(t==null||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}function wu(e){if(typeof Symbol<"u"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function ku(e){if(Array.isArray(e))return e}function Cu(){var e={},t=function(){return null},r=!1,n=function o(a){if(!r){if(Array.isArray(a)){if(!a.length)return;var i=a,s=bu(i),l=s[0],d=s.slice(1);if(typeof l=="number"){Hn(o.bind(null,d),l);return}o(l),Hn(o.bind(null,d));return}Er(a)==="object"&&(e=a,t(e)),typeof a=="function"&&a()}};return{stop:function(){r=!0},start:function(a){r=!1,n(a)},subscribe:function(a){return t=a,function(){t=function(){return null}}}}}function St(e){"@babel/helpers - typeof";return St=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},St(e)}function Wn(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter(function(o){return Object.getOwnPropertyDescriptor(e,o).enumerable})),r.push.apply(r,n)}return r}function Kn(e){for(var t=1;t<arguments.length;t++){var r=arguments[t]!=null?arguments[t]:{};t%2?Wn(Object(r),!0).forEach(function(n){Xa(e,n,r[n])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):Wn(Object(r)).forEach(function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(r,n))})}return e}function Xa(e,t,r){return t=Au(t),t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function Au(e){var t=Eu(e,"string");return St(t)==="symbol"?t:String(t)}function Eu(e,t){if(St(e)!=="object"||e===null)return e;var r=e[Symbol.toPrimitive];if(r!==void 0){var n=r.call(e,t);if(St(n)!=="object")return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}var _u=function(t,r){return[Object.keys(t),Object.keys(r)].reduce(function(n,o){return n.filter(function(a){return o.includes(a)})})},Pu=function(t){return t},Mu=function(t){return t.replace(/([A-Z])/g,function(r){return"-".concat(r.toLowerCase())})},xt=function(t,r){return Object.keys(r).reduce(function(n,o){return Kn(Kn({},n),{},Xa({},o,t(o,r[o])))},{})},Gn=function(t,r,n){return t.map(function(o){return"".concat(Mu(o)," ").concat(r,"ms ").concat(n)}).join(",")};function Ru(e,t){return Ou(e)||Iu(e,t)||Ja(e,t)||Tu()}function Tu(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Iu(e,t){var r=e==null?null:typeof Symbol<"u"&&e[Symbol.iterator]||e["@@iterator"];if(r!=null){var n,o,a,i,s=[],l=!0,d=!1;try{if(a=(r=r.call(e)).next,t!==0)for(;!(l=(n=a.call(r)).done)&&(s.push(n.value),s.length!==t);l=!0);}catch(p){d=!0,o=p}finally{try{if(!l&&r.return!=null&&(i=r.return(),Object(i)!==i))return}finally{if(d)throw o}}return s}}function Ou(e){if(Array.isArray(e))return e}function Nu(e){return Fu(e)||ju(e)||Ja(e)||Du()}function Du(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Ja(e,t){if(e){if(typeof e=="string")return _r(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);if(r==="Object"&&e.constructor&&(r=e.constructor.name),r==="Map"||r==="Set")return Array.from(e);if(r==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return _r(e,t)}}function ju(e){if(typeof Symbol<"u"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function Fu(e){if(Array.isArray(e))return _r(e)}function _r(e,t){(t==null||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}var $t=1e-4,Qa=function(t,r){return[0,3*t,3*r-6*t,3*t-3*r+1]},ei=function(t,r){return t.map(function(n,o){return n*Math.pow(r,o)}).reduce(function(n,o){return n+o})},Zn=function(t,r){return function(n){var o=Qa(t,r);return ei(o,n)}},Lu=function(t,r){return function(n){var o=Qa(t,r),a=[].concat(Nu(o.map(function(i,s){return i*s}).slice(1)),[0]);return ei(a,n)}},Yn=function(){for(var t=arguments.length,r=new Array(t),n=0;n<t;n++)r[n]=arguments[n];var o=r[0],a=r[1],i=r[2],s=r[3];if(r.length===1)switch(r[0]){case"linear":o=0,a=0,i=1,s=1;break;case"ease":o=.25,a=.1,i=.25,s=1;break;case"ease-in":o=.42,a=0,i=1,s=1;break;case"ease-out":o=.42,a=0,i=.58,s=1;break;case"ease-in-out":o=0,a=0,i=.58,s=1;break;default:{var l=r[0].split("(");if(l[0]==="cubic-bezier"&&l[1].split(")")[0].split(",").length===4){var d=l[1].split(")")[0].split(",").map(function(u){return parseFloat(u)}),p=Ru(d,4);o=p[0],a=p[1],i=p[2],s=p[3]}}}var h=Zn(o,i),m=Zn(a,s),C=Lu(o,i),E=function(g){return g>1?1:g<0?0:g},f=function(g){for(var v=g>1?1:g,k=v,_=0;_<8;++_){var R=h(k)-v,V=C(k);if(Math.abs(R-v)<$t||V<$t)return m(k);k=E(k-R/V)}return m(k)};return f.isStepper=!1,f},Vu=function(){var t=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{},r=t.stiff,n=r===void 0?100:r,o=t.damping,a=o===void 0?8:o,i=t.dt,s=i===void 0?17:i,l=function(p,h,m){var C=-(p-h)*n,E=m*a,f=m+(C-E)*s/1e3,u=m*s/1e3+p;return Math.abs(u-h)<$t&&Math.abs(f)<$t?[h,0]:[u,f]};return l.isStepper=!0,l.dt=s,l},$u=function(){for(var t=arguments.length,r=new Array(t),n=0;n<t;n++)r[n]=arguments[n];var o=r[0];if(typeof o=="string")switch(o){case"ease":case"ease-in-out":case"ease-out":case"ease-in":case"linear":return Yn(o);case"spring":return Vu();default:if(o.split("(")[0]==="cubic-bezier")return Yn(o)}return typeof o=="function"?o:null};function wt(e){"@babel/helpers - typeof";return wt=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},wt(e)}function Xn(e){return zu(e)||Uu(e)||ti(e)||Bu()}function Bu(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Uu(e){if(typeof Symbol<"u"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function zu(e){if(Array.isArray(e))return Mr(e)}function Jn(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter(function(o){return Object.getOwnPropertyDescriptor(e,o).enumerable})),r.push.apply(r,n)}return r}function be(e){for(var t=1;t<arguments.length;t++){var r=arguments[t]!=null?arguments[t]:{};t%2?Jn(Object(r),!0).forEach(function(n){Pr(e,n,r[n])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):Jn(Object(r)).forEach(function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(r,n))})}return e}function Pr(e,t,r){return t=Hu(t),t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function Hu(e){var t=qu(e,"string");return wt(t)==="symbol"?t:String(t)}function qu(e,t){if(wt(e)!=="object"||e===null)return e;var r=e[Symbol.toPrimitive];if(r!==void 0){var n=r.call(e,t);if(wt(n)!=="object")return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}function Wu(e,t){return Zu(e)||Gu(e,t)||ti(e,t)||Ku()}function Ku(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function ti(e,t){if(e){if(typeof e=="string")return Mr(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);if(r==="Object"&&e.constructor&&(r=e.constructor.name),r==="Map"||r==="Set")return Array.from(e);if(r==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return Mr(e,t)}}function Mr(e,t){(t==null||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}function Gu(e,t){var r=e==null?null:typeof Symbol<"u"&&e[Symbol.iterator]||e["@@iterator"];if(r!=null){var n,o,a,i,s=[],l=!0,d=!1;try{if(a=(r=r.call(e)).next,t!==0)for(;!(l=(n=a.call(r)).done)&&(s.push(n.value),s.length!==t);l=!0);}catch(p){d=!0,o=p}finally{try{if(!l&&r.return!=null&&(i=r.return(),Object(i)!==i))return}finally{if(d)throw o}}return s}}function Zu(e){if(Array.isArray(e))return e}var Bt=function(t,r,n){return t+(r-t)*n},Rr=function(t){var r=t.from,n=t.to;return r!==n},Yu=function e(t,r,n){var o=xt(function(a,i){if(Rr(i)){var s=t(i.from,i.to,i.velocity),l=Wu(s,2),d=l[0],p=l[1];return be(be({},i),{},{from:d,velocity:p})}return i},r);return n<1?xt(function(a,i){return Rr(i)?be(be({},i),{},{velocity:Bt(i.velocity,o[a].velocity,n),from:Bt(i.from,o[a].from,n)}):i},r):e(t,o,n-1)};const Xu=function(e,t,r,n,o){var a=_u(e,t),i=a.reduce(function(u,g){return be(be({},u),{},Pr({},g,[e[g],t[g]]))},{}),s=a.reduce(function(u,g){return be(be({},u),{},Pr({},g,{from:e[g],velocity:0,to:t[g]}))},{}),l=-1,d,p,h=function(){return null},m=function(){return xt(function(g,v){return v.from},s)},C=function(){return!Object.values(s).filter(Rr).length},E=function(g){d||(d=g);var v=g-d,k=v/r.dt;s=Yu(r,s,k),o(be(be(be({},e),t),m())),d=g,C()||(l=requestAnimationFrame(h))},f=function(g){p||(p=g);var v=(g-p)/n,k=xt(function(R,V){return Bt.apply(void 0,Xn(V).concat([r(v)]))},i);if(o(be(be(be({},e),t),k)),v<1)l=requestAnimationFrame(h);else{var _=xt(function(R,V){return Bt.apply(void 0,Xn(V).concat([r(1)]))},i);o(be(be(be({},e),t),_))}};return h=r.isStepper?E:f,function(){return requestAnimationFrame(h),function(){cancelAnimationFrame(l)}}};function lt(e){"@babel/helpers - typeof";return lt=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},lt(e)}var Ju=["children","begin","duration","attributeName","easing","isActive","steps","from","to","canBegin","onAnimationEnd","shouldReAnimate","onAnimationReStart"];function Qu(e,t){if(e==null)return{};var r=ed(e,t),n,o;if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(o=0;o<a.length;o++)n=a[o],!(t.indexOf(n)>=0)&&Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}function ed(e,t){if(e==null)return{};var r={},n=Object.keys(e),o,a;for(a=0;a<n.length;a++)o=n[a],!(t.indexOf(o)>=0)&&(r[o]=e[o]);return r}function hr(e){return od(e)||nd(e)||rd(e)||td()}function td(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function rd(e,t){if(e){if(typeof e=="string")return Tr(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);if(r==="Object"&&e.constructor&&(r=e.constructor.name),r==="Map"||r==="Set")return Array.from(e);if(r==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return Tr(e,t)}}function nd(e){if(typeof Symbol<"u"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function od(e){if(Array.isArray(e))return Tr(e)}function Tr(e,t){(t==null||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}function Qn(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter(function(o){return Object.getOwnPropertyDescriptor(e,o).enumerable})),r.push.apply(r,n)}return r}function Pe(e){for(var t=1;t<arguments.length;t++){var r=arguments[t]!=null?arguments[t]:{};t%2?Qn(Object(r),!0).forEach(function(n){vt(e,n,r[n])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):Qn(Object(r)).forEach(function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(r,n))})}return e}function vt(e,t,r){return t=ri(t),t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function ad(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function id(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,ri(n.key),n)}}function sd(e,t,r){return t&&id(e.prototype,t),Object.defineProperty(e,"prototype",{writable:!1}),e}function ri(e){var t=cd(e,"string");return lt(t)==="symbol"?t:String(t)}function cd(e,t){if(lt(e)!=="object"||e===null)return e;var r=e[Symbol.toPrimitive];if(r!==void 0){var n=r.call(e,t);if(lt(n)!=="object")return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(e)}function ld(e,t){if(typeof t!="function"&&t!==null)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),Object.defineProperty(e,"prototype",{writable:!1}),t&&Ir(e,t)}function Ir(e,t){return Ir=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(n,o){return n.__proto__=o,n},Ir(e,t)}function ud(e){var t=dd();return function(){var n=Ut(e),o;if(t){var a=Ut(this).constructor;o=Reflect.construct(n,arguments,a)}else o=n.apply(this,arguments);return Or(this,o)}}function Or(e,t){if(t&&(lt(t)==="object"||typeof t=="function"))return t;if(t!==void 0)throw new TypeError("Derived constructors may only return object or undefined");return Nr(e)}function Nr(e){if(e===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function dd(){if(typeof Reflect>"u"||!Reflect.construct||Reflect.construct.sham)return!1;if(typeof Proxy=="function")return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch{return!1}}function Ut(e){return Ut=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(r){return r.__proto__||Object.getPrototypeOf(r)},Ut(e)}var an=function(e){ld(r,e);var t=ud(r);function r(n,o){var a;ad(this,r),a=t.call(this,n,o);var i=a.props,s=i.isActive,l=i.attributeName,d=i.from,p=i.to,h=i.steps,m=i.children,C=i.duration;if(a.handleStyleChange=a.handleStyleChange.bind(Nr(a)),a.changeStyle=a.changeStyle.bind(Nr(a)),!s||C<=0)return a.state={style:{}},typeof m=="function"&&(a.state={style:p}),Or(a);if(h&&h.length)a.state={style:h[0].style};else if(d){if(typeof m=="function")return a.state={style:d},Or(a);a.state={style:l?vt({},l,d):d}}else a.state={style:{}};return a}return sd(r,[{key:"componentDidMount",value:function(){var o=this.props,a=o.isActive,i=o.canBegin;this.mounted=!0,!(!a||!i)&&this.runAnimation(this.props)}},{key:"componentDidUpdate",value:function(o){var a=this.props,i=a.isActive,s=a.canBegin,l=a.attributeName,d=a.shouldReAnimate,p=a.to,h=a.from,m=this.state.style;if(s){if(!i){var C={style:l?vt({},l,p):p};this.state&&m&&(l&&m[l]!==p||!l&&m!==p)&&this.setState(C);return}if(!(ji(o.to,p)&&o.canBegin&&o.isActive)){var E=!o.canBegin||!o.isActive;this.manager&&this.manager.stop(),this.stopJSAnimation&&this.stopJSAnimation();var f=E||d?h:o.to;if(this.state&&m){var u={style:l?vt({},l,f):f};(l&&m[l]!==f||!l&&m!==f)&&this.setState(u)}this.runAnimation(Pe(Pe({},this.props),{},{from:f,begin:0}))}}}},{key:"componentWillUnmount",value:function(){this.mounted=!1;var o=this.props.onAnimationEnd;this.unSubscribe&&this.unSubscribe(),this.manager&&(this.manager.stop(),this.manager=null),this.stopJSAnimation&&this.stopJSAnimation(),o&&o()}},{key:"handleStyleChange",value:function(o){this.changeStyle(o)}},{key:"changeStyle",value:function(o){this.mounted&&this.setState({style:o})}},{key:"runJSAnimation",value:function(o){var a=this,i=o.from,s=o.to,l=o.duration,d=o.easing,p=o.begin,h=o.onAnimationEnd,m=o.onAnimationStart,C=Xu(i,s,$u(d),l,this.changeStyle),E=function(){a.stopJSAnimation=C()};this.manager.start([m,p,E,l,h])}},{key:"runStepAnimation",value:function(o){var a=this,i=o.steps,s=o.begin,l=o.onAnimationStart,d=i[0],p=d.style,h=d.duration,m=h===void 0?0:h,C=function(f,u,g){if(g===0)return f;var v=u.duration,k=u.easing,_=k===void 0?"ease":k,R=u.style,V=u.properties,I=u.onAnimationEnd,$=g>0?i[g-1]:u,Q=V||Object.keys(R);if(typeof _=="function"||_==="spring")return[].concat(hr(f),[a.runJSAnimation.bind(a,{from:$.style,to:R,duration:v,easing:_}),v]);var ee=Gn(Q,v,_),H=Pe(Pe(Pe({},$.style),R),{},{transition:ee});return[].concat(hr(f),[H,v,I]).filter(Pu)};return this.manager.start([l].concat(hr(i.reduce(C,[p,Math.max(m,s)])),[o.onAnimationEnd]))}},{key:"runAnimation",value:function(o){this.manager||(this.manager=Cu());var a=o.begin,i=o.duration,s=o.attributeName,l=o.to,d=o.easing,p=o.onAnimationStart,h=o.onAnimationEnd,m=o.steps,C=o.children,E=this.manager;if(this.unSubscribe=E.subscribe(this.handleStyleChange),typeof d=="function"||typeof C=="function"||d==="spring"){this.runJSAnimation(o);return}if(m.length>1){this.runStepAnimation(o);return}var f=s?vt({},s,l):l,u=Gn(Object.keys(f),i,d);E.start([p,a,Pe(Pe({},f),{},{transition:u}),i,h])}},{key:"render",value:function(){var o=this.props,a=o.children;o.begin;var i=o.duration;o.attributeName,o.easing;var s=o.isActive;o.steps,o.from,o.to,o.canBegin,o.onAnimationEnd,o.shouldReAnimate,o.onAnimationReStart;var l=Qu(o,Ju),d=c.Children.count(a),p=this.state.style;if(typeof a=="function")return a(p);if(!s||d===0||i<=0)return a;var h=function(C){var E=C.props,f=E.style,u=f===void 0?{}:f,g=E.className,v=c.cloneElement(C,Pe(Pe({},l),{},{style:Pe(Pe({},u),p),className:g}));return v};return d===1?h(c.Children.only(a)):ye.createElement("div",null,c.Children.map(a,function(m){return h(m)}))}}]),r}(c.PureComponent);an.displayName="Animate";an.defaultProps={begin:0,duration:1e3,from:"",to:"",attributeName:"",easing:"ease",isActive:!0,canBegin:!0,steps:[],onAnimationEnd:function(){},onAnimationStart:function(){}};an.propTypes={from:ce.oneOfType([ce.object,ce.string]),to:ce.oneOfType([ce.object,ce.string]),attributeName:ce.string,duration:ce.number,begin:ce.number,easing:ce.oneOfType([ce.string,ce.func]),steps:ce.arrayOf(ce.shape({duration:ce.number.isRequired,style:ce.object.isRequired,easing:ce.oneOfType([ce.oneOf(["ease","ease-in","ease-out","ease-in-out","linear"]),ce.func]),properties:ce.arrayOf("string"),onAnimationEnd:ce.func})),children:ce.oneOfType([ce.node,ce.func]),isActive:ce.bool,canBegin:ce.bool,onAnimationEnd:ce.func,shouldReAnimate:ce.bool,onAnimationStart:ce.func,onAnimationReStart:ce.func};var fd="Separator",eo="horizontal",pd=["horizontal","vertical"],ni=c.forwardRef((e,t)=>{const{decorative:r,orientation:n=eo,...o}=e,a=yd(n)?n:eo,s=r?{role:"none"}:{"aria-orientation":a==="vertical"?a:void 0,role:"separator"};return S.jsx(q.div,{"data-orientation":a,...s,...o,ref:t})});ni.displayName=fd;function yd(e){return pd.includes(e)}var fy=ni;function it(e,t,{checkForDefaultPrevented:r=!0}={}){return function(o){if(e==null||e(o),r===!1||!o.defaultPrevented)return t==null?void 0:t(o)}}var oi=["PageUp","PageDown"],ai=["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"],ii={"from-left":["Home","PageDown","ArrowDown","ArrowLeft"],"from-right":["Home","PageDown","ArrowDown","ArrowRight"],"from-bottom":["Home","PageDown","ArrowDown","ArrowLeft"],"from-top":["Home","PageDown","ArrowUp","ArrowLeft"]},ft="Slider",[Dr,hd,md]=qr(ft),[si,py]=De(ft,[md]),[vd,er]=si(ft),ci=c.forwardRef((e,t)=>{const{name:r,min:n=0,max:o=100,step:a=1,orientation:i="horizontal",disabled:s=!1,minStepsBetweenThumbs:l=0,defaultValue:d=[n],value:p,onValueChange:h=()=>{},onValueCommit:m=()=>{},inverted:C=!1,form:E,...f}=e,u=c.useRef(new Set),g=c.useRef(0),k=i==="horizontal"?gd:bd,[_=[],R]=qe({prop:p,defaultProp:d,onChange:H=>{var F;(F=[...u.current][g.current])==null||F.focus(),h(H)}}),V=c.useRef(_);function I(H){const j=Cd(_,H);ee(H,j)}function $(H){ee(H,g.current)}function Q(){const H=V.current[g.current];_[g.current]!==H&&m(_)}function ee(H,j,{commit:F}={commit:!1}){const W=Pd(a),Z=Md(Math.round((H-n)/a)*a+n,W),z=Ot(Z,[n,o]);R((B=[])=>{const ne=wd(B,z,j);if(_d(ne,l*a)){g.current=ne.indexOf(z);const pe=String(ne)!==String(B);return pe&&F&&m(ne),pe?ne:B}else return B})}return S.jsx(vd,{scope:e.__scopeSlider,name:r,disabled:s,min:n,max:o,valueIndexToChangeRef:g,thumbs:u.current,values:_,orientation:i,form:E,children:S.jsx(Dr.Provider,{scope:e.__scopeSlider,children:S.jsx(Dr.Slot,{scope:e.__scopeSlider,children:S.jsx(k,{"aria-disabled":s,"data-disabled":s?"":void 0,...f,ref:t,onPointerDown:it(f.onPointerDown,()=>{s||(V.current=_)}),min:n,max:o,inverted:C,onSlideStart:s?void 0:I,onSlideMove:s?void 0:$,onSlideEnd:s?void 0:Q,onHomeKeyDown:()=>!s&&ee(n,0,{commit:!0}),onEndKeyDown:()=>!s&&ee(o,_.length-1,{commit:!0}),onStepKeyDown:({event:H,direction:j})=>{if(!s){const Z=oi.includes(H.key)||H.shiftKey&&ai.includes(H.key)?10:1,z=g.current,B=_[z],ne=a*Z*j;ee(B+ne,z,{commit:!0})}}})})})})});ci.displayName=ft;var[li,ui]=si(ft,{startEdge:"left",endEdge:"right",size:"width",direction:1}),gd=c.forwardRef((e,t)=>{const{min:r,max:n,dir:o,inverted:a,onSlideStart:i,onSlideMove:s,onSlideEnd:l,onStepKeyDown:d,...p}=e,[h,m]=c.useState(null),C=oe(t,k=>m(k)),E=c.useRef(void 0),f=Ht(o),u=f==="ltr",g=u&&!a||!u&&a;function v(k){const _=E.current||h.getBoundingClientRect(),R=[0,_.width],I=sn(R,g?[r,n]:[n,r]);return E.current=_,I(k-_.left)}return S.jsx(li,{scope:e.__scopeSlider,startEdge:g?"left":"right",endEdge:g?"right":"left",direction:g?1:-1,size:"width",children:S.jsx(di,{dir:f,"data-orientation":"horizontal",...p,ref:C,style:{...p.style,"--radix-slider-thumb-transform":"translateX(-50%)"},onSlideStart:k=>{const _=v(k.clientX);i==null||i(_)},onSlideMove:k=>{const _=v(k.clientX);s==null||s(_)},onSlideEnd:()=>{E.current=void 0,l==null||l()},onStepKeyDown:k=>{const R=ii[g?"from-left":"from-right"].includes(k.key);d==null||d({event:k,direction:R?-1:1})}})})}),bd=c.forwardRef((e,t)=>{const{min:r,max:n,inverted:o,onSlideStart:a,onSlideMove:i,onSlideEnd:s,onStepKeyDown:l,...d}=e,p=c.useRef(null),h=oe(t,p),m=c.useRef(void 0),C=!o;function E(f){const u=m.current||p.current.getBoundingClientRect(),g=[0,u.height],k=sn(g,C?[n,r]:[r,n]);return m.current=u,k(f-u.top)}return S.jsx(li,{scope:e.__scopeSlider,startEdge:C?"bottom":"top",endEdge:C?"top":"bottom",size:"height",direction:C?1:-1,children:S.jsx(di,{"data-orientation":"vertical",...d,ref:h,style:{...d.style,"--radix-slider-thumb-transform":"translateY(50%)"},onSlideStart:f=>{const u=E(f.clientY);a==null||a(u)},onSlideMove:f=>{const u=E(f.clientY);i==null||i(u)},onSlideEnd:()=>{m.current=void 0,s==null||s()},onStepKeyDown:f=>{const g=ii[C?"from-bottom":"from-top"].includes(f.key);l==null||l({event:f,direction:g?-1:1})}})})}),di=c.forwardRef((e,t)=>{const{__scopeSlider:r,onSlideStart:n,onSlideMove:o,onSlideEnd:a,onHomeKeyDown:i,onEndKeyDown:s,onStepKeyDown:l,...d}=e,p=er(ft,r);return S.jsx(q.span,{...d,ref:t,onKeyDown:it(e.onKeyDown,h=>{h.key==="Home"?(i(h),h.preventDefault()):h.key==="End"?(s(h),h.preventDefault()):oi.concat(ai).includes(h.key)&&(l(h),h.preventDefault())}),onPointerDown:it(e.onPointerDown,h=>{const m=h.target;m.setPointerCapture(h.pointerId),h.preventDefault(),p.thumbs.has(m)?m.focus():n(h)}),onPointerMove:it(e.onPointerMove,h=>{h.target.hasPointerCapture(h.pointerId)&&o(h)}),onPointerUp:it(e.onPointerUp,h=>{const m=h.target;m.hasPointerCapture(h.pointerId)&&(m.releasePointerCapture(h.pointerId),a(h))})})}),fi="SliderTrack",pi=c.forwardRef((e,t)=>{const{__scopeSlider:r,...n}=e,o=er(fi,r);return S.jsx(q.span,{"data-disabled":o.disabled?"":void 0,"data-orientation":o.orientation,...n,ref:t})});pi.displayName=fi;var jr="SliderRange",yi=c.forwardRef((e,t)=>{const{__scopeSlider:r,...n}=e,o=er(jr,r),a=ui(jr,r),i=c.useRef(null),s=oe(t,i),l=o.values.length,d=o.values.map(m=>vi(m,o.min,o.max)),p=l>1?Math.min(...d):0,h=100-Math.max(...d);return S.jsx(q.span,{"data-orientation":o.orientation,"data-disabled":o.disabled?"":void 0,...n,ref:s,style:{...e.style,[a.startEdge]:p+"%",[a.endEdge]:h+"%"}})});yi.displayName=jr;var Fr="SliderThumb",hi=c.forwardRef((e,t)=>{const r=hd(e.__scopeSlider),[n,o]=c.useState(null),a=oe(t,s=>o(s)),i=c.useMemo(()=>n?r().findIndex(s=>s.ref.current===n):-1,[r,n]);return S.jsx(xd,{...e,ref:a,index:i})}),xd=c.forwardRef((e,t)=>{const{__scopeSlider:r,index:n,name:o,...a}=e,i=er(Fr,r),s=ui(Fr,r),[l,d]=c.useState(null),p=oe(t,v=>d(v)),h=l?i.form||!!l.closest("form"):!0,m=Zt(l),C=i.values[n],E=C===void 0?0:vi(C,i.min,i.max),f=kd(n,i.values.length),u=m==null?void 0:m[s.size],g=u?Ad(u,E,s.direction):0;return c.useEffect(()=>{if(l)return i.thumbs.add(l),()=>{i.thumbs.delete(l)}},[l,i.thumbs]),S.jsxs("span",{style:{transform:"var(--radix-slider-thumb-transform)",position:"absolute",[s.startEdge]:`calc(${E}% + ${g}px)`},children:[S.jsx(Dr.ItemSlot,{scope:e.__scopeSlider,children:S.jsx(q.span,{role:"slider","aria-label":e["aria-label"]||f,"aria-valuemin":i.min,"aria-valuenow":C,"aria-valuemax":i.max,"aria-orientation":i.orientation,"data-orientation":i.orientation,"data-disabled":i.disabled?"":void 0,tabIndex:i.disabled?void 0:0,...a,ref:p,style:C===void 0?{display:"none"}:e.style,onFocus:it(e.onFocus,()=>{i.valueIndexToChangeRef.current=n})})}),h&&S.jsx(mi,{name:o??(i.name?i.name+(i.values.length>1?"[]":""):void 0),form:i.form,value:C},n)]})});hi.displayName=Fr;var Sd="RadioBubbleInput",mi=c.forwardRef(({__scopeSlider:e,value:t,...r},n)=>{const o=c.useRef(null),a=oe(o,n),i=Gt(t);return c.useEffect(()=>{const s=o.current;if(!s)return;const l=window.HTMLInputElement.prototype,p=Object.getOwnPropertyDescriptor(l,"value").set;if(i!==t&&p){const h=new Event("input",{bubbles:!0});p.call(s,t),s.dispatchEvent(h)}},[i,t]),S.jsx(q.input,{style:{display:"none"},...r,ref:a,defaultValue:t})});mi.displayName=Sd;function wd(e=[],t,r){const n=[...e];return n[r]=t,n.sort((o,a)=>o-a)}function vi(e,t,r){const a=100/(r-t)*(e-t);return Ot(a,[0,100])}function kd(e,t){return t>2?`Value ${e+1} of ${t}`:t===2?["Minimum","Maximum"][e]:void 0}function Cd(e,t){if(e.length===1)return 0;const r=e.map(o=>Math.abs(o-t)),n=Math.min(...r);return r.indexOf(n)}function Ad(e,t,r){const n=e/2,a=sn([0,50],[0,n]);return(n-a(t)*r)*r}function Ed(e){return e.slice(0,-1).map((t,r)=>e[r+1]-t)}function _d(e,t){if(t>0){const r=Ed(e);return Math.min(...r)>=t}return!0}function sn(e,t){return r=>{if(e[0]===e[1]||t[0]===t[1])return t[0];const n=(t[1]-t[0])/(e[1]-e[0]);return t[0]+n*(r-e[0])}}function Pd(e){return(String(e).split(".")[1]||"").length}function Md(e,t){const r=Math.pow(10,t);return Math.round(e*r)/r}var yy=ci,hy=pi,my=yi,vy=hi,tr="Checkbox",[Rd,gy]=De(tr),[Td,cn]=Rd(tr);function Id(e){const{__scopeCheckbox:t,checked:r,children:n,defaultChecked:o,disabled:a,form:i,name:s,onCheckedChange:l,required:d,value:p="on",internal_do_not_use_render:h}=e,[m,C]=qe({prop:r,defaultProp:o??!1,onChange:l,caller:tr}),[E,f]=c.useState(null),[u,g]=c.useState(null),v=c.useRef(!1),k=E?!!i||!!E.closest("form"):!0,_={checked:m,disabled:a,setChecked:C,control:E,setControl:f,name:s,form:i,value:p,hasConsumerStoppedPropagationRef:v,required:d,defaultChecked:ze(o)?!1:o,isFormControl:k,bubbleInput:u,setBubbleInput:g};return S.jsx(Td,{scope:t,..._,children:Dd(h)?h(_):n})}var gi="CheckboxTrigger",bi=c.forwardRef(({__scopeCheckbox:e,onKeyDown:t,onClick:r,...n},o)=>{const{control:a,value:i,disabled:s,checked:l,required:d,setControl:p,setChecked:h,hasConsumerStoppedPropagationRef:m,isFormControl:C,bubbleInput:E}=cn(gi,e),f=oe(o,p),u=c.useRef(l);return c.useEffect(()=>{const g=a==null?void 0:a.form;if(g){const v=()=>h(u.current);return g.addEventListener("reset",v),()=>g.removeEventListener("reset",v)}},[a,h]),S.jsx(q.button,{type:"button",role:"checkbox","aria-checked":ze(l)?"mixed":l,"aria-required":d,"data-state":ki(l),"data-disabled":s?"":void 0,disabled:s,value:i,...n,ref:f,onKeyDown:J(t,g=>{g.key==="Enter"&&g.preventDefault()}),onClick:J(r,g=>{h(v=>ze(v)?!0:!v),E&&C&&(m.current=g.isPropagationStopped(),m.current||g.stopPropagation())})})});bi.displayName=gi;var Od=c.forwardRef((e,t)=>{const{__scopeCheckbox:r,name:n,checked:o,defaultChecked:a,required:i,disabled:s,value:l,onCheckedChange:d,form:p,...h}=e;return S.jsx(Id,{__scopeCheckbox:r,checked:o,defaultChecked:a,disabled:s,required:i,onCheckedChange:d,name:n,form:p,value:l,internal_do_not_use_render:({isFormControl:m})=>S.jsxs(S.Fragment,{children:[S.jsx(bi,{...h,ref:t,__scopeCheckbox:r}),m&&S.jsx(wi,{__scopeCheckbox:r})]})})});Od.displayName=tr;var xi="CheckboxIndicator",Nd=c.forwardRef((e,t)=>{const{__scopeCheckbox:r,forceMount:n,...o}=e,a=cn(xi,r);return S.jsx(ut,{present:n||ze(a.checked)||a.checked===!0,children:S.jsx(q.span,{"data-state":ki(a.checked),"data-disabled":a.disabled?"":void 0,...o,ref:t,style:{pointerEvents:"none",...e.style}})})});Nd.displayName=xi;var Si="CheckboxBubbleInput",wi=c.forwardRef(({__scopeCheckbox:e,...t},r)=>{const{control:n,hasConsumerStoppedPropagationRef:o,checked:a,defaultChecked:i,required:s,disabled:l,name:d,value:p,form:h,bubbleInput:m,setBubbleInput:C}=cn(Si,e),E=oe(r,C),f=Gt(a),u=Zt(n);c.useEffect(()=>{const v=m;if(!v)return;const k=window.HTMLInputElement.prototype,R=Object.getOwnPropertyDescriptor(k,"checked").set,V=!o.current;if(f!==a&&R){const I=new Event("click",{bubbles:V});v.indeterminate=ze(a),R.call(v,ze(a)?!1:a),v.dispatchEvent(I)}},[m,f,a,o]);const g=c.useRef(ze(a)?!1:a);return S.jsx(q.input,{type:"checkbox","aria-hidden":!0,defaultChecked:i??g.current,required:s,disabled:l,name:d,value:p,form:h,...t,tabIndex:-1,ref:E,style:{...t.style,...u,position:"absolute",pointerEvents:"none",opacity:0,margin:0,transform:"translateX(-100%)"}})});wi.displayName=Si;function Dd(e){return typeof e=="function"}function ze(e){return e==="indeterminate"}function ki(e){return ze(e)?"indeterminate":e?"checked":"unchecked"}export{rf as $,an as A,of as B,Ef as C,Nf as D,af as E,Bf as F,Zf as G,Qf as H,uf as I,Gf as J,K1 as K,c1 as L,x1 as M,w1 as N,ff as O,C1 as P,hp as Q,no as R,U1 as S,cp as T,yp as U,Bd as V,gp as W,wp as X,rp as Y,kp as Z,Hf as _,ro as a,Mf as a$,Xf as a0,qf as a1,cf as a2,If as a3,Of as a4,zd as a5,i1 as a6,t1 as a7,Tf as a8,op as a9,tp as aA,sf as aB,bp as aC,Qd as aD,vf as aE,tf as aF,Sf as aG,Xd as aH,lp as aI,gf as aJ,Hd as aK,P1 as aL,s1 as aM,zf as aN,z1 as aO,Sp as aP,v1 as aQ,q1 as aR,ip as aS,L1 as aT,kf as aU,Kf as aV,l1 as aW,Vf as aX,$f as aY,e1 as aZ,fp as a_,wf as aa,d1 as ab,u1 as ac,pp as ad,h1 as ae,E1 as af,A1 as ag,J1 as ah,xf as ai,Wf as aj,Df as ak,hf as al,yf as am,r1 as an,Ff as ao,M1 as ap,jf as aq,Yf as ar,N1 as as,bf as at,up as au,_1 as av,qd as aw,O1 as ax,g1 as ay,y1 as az,dy as b,my as b$,Jf as b0,k1 as b1,df as b2,_f as b3,a1 as b4,ap as b5,Uf as b6,Cp as b7,Ap as b8,o1 as b9,_p as bA,Pp as bB,Rp as bC,Tp as bD,Ip as bE,Op as bF,qp as bG,Wp as bH,Gp as bI,Zp as bJ,Xp as bK,Qp as bL,Jp as bM,ey as bN,ty as bO,ry as bP,ny as bQ,ay as bR,sy as bS,iy as bT,cy as bU,ly as bV,oy as bW,uy as bX,fy as bY,yy as bZ,hy as b_,pf as ba,p1 as bb,mp as bc,Ep as bd,f1 as be,mf as bf,jp as bg,Fp as bh,Lp as bi,$p as bj,zp as bk,Bp as bl,Up as bm,Vp as bn,Z1 as bo,W1 as bp,nf as bq,ep as br,j1 as bs,D1 as bt,Lf as bu,Yd as bv,ef as bw,B1 as bx,T1 as by,I1 as bz,ye as c,vy as c0,Gd as c1,G1 as c2,b1 as c3,R1 as c4,Cf as c5,m1 as c6,Od as c7,Nd as c8,Rf as c9,S1 as ca,sp as cb,X1 as cc,np as cd,Kd as ce,Wd as cf,Zd as cg,Ns as d,$d as e,D as f,Ki as g,Vd as h,F1 as i,S as j,vp as k,Pf as l,Af as m,xp as n,Jd as o,H1 as p,$1 as q,c as r,fe as s,Ud as t,Q1 as u,dp as v,V1 as w,lf as x,n1 as y,Y1 as z};
