import{d as m,ac as f,i as a,t as I,v as d,F as v,_ as x}from"./BBGF_Gy9.js";import{u as _,r as S}from"./Cs9xGx_W.js";const y=m({__name:"IconCSS",props:{name:{type:String,required:!0},size:{type:String,default:""}},setup(u){f(e=>({"4f3bb672":p.value}));const t=_(),s=u,l=a(()=>{var e,n;return(n=(e=t.nuxtIcon)==null?void 0:e.aliases)!=null&&n[s.name]?t.nuxtIcon.aliases[s.name]:s.name}),c=a(()=>S(l.value)),p=a(()=>{var o,r;const e=(r=(o=t.nuxtIcon)==null?void 0:o.iconifyApiOptions)==null?void 0:r.url;if(e)try{new URL(e)}catch{console.warn("Nuxt IconCSS: Invalid custom Iconify API URL");return}return`url('${e||"https://api.iconify.design"}/${c.value.prefix}/${c.value.name}.svg')`}),i=a(()=>{var n,o,r;if(!s.size&&typeof((n=t.nuxtIcon)==null?void 0:n.size)=="boolean"&&!((o=t.nuxtIcon)!=null&&o.size))return;const e=s.size||((r=t.nuxtIcon)==null?void 0:r.size)||"1em";return String(Number(e))===e?`${e}px`:e});return(e,n)=>(I(),d("span",{style:v({width:i.value,height:i.value})},null,4))}}),C=x(y,[["__scopeId","data-v-b123bc08"]]);export{C as default};