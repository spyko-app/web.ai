// Gerador FIEL da Landing Page Ronaldo Barcelos como template JSON do Elementor (containers + widgets nativos).
// Fonte da verdade: /Volumes/PortableSSD/ARQUIVOS/Landing Page RB/site (index.html + styles.css + script.js).
// Regra (igual Xpice): texto/layout = nativo editável; animação/marquee/badge = widget HTML.
// Alvo: ronaldobarcelos.com.br página 346 (Elementor 4.2.0).
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

// TODOS os assets já vivem na Media do WP (nada externo)
const M = 'https://ronaldobarcelos.com.br/wp-content/uploads/2026/07';
const IMG = {
  hero: `${M}/ronaldo-hero.jpg`,
  social: `${M}/social.jpg`,
  merz: `${M}/logo-merz.svg`,
  btl: `${M}/logo-btl.svg`,
  contourline: `${M}/logo-contourline.png`,
  evo: `${M}/logo-evo.png`,
  lmg: `${M}/logo-lmg.png`,
  farma: `${M}/logo-farma.png`,
  genomics: `${M}/logo-genomics.svg`,
};

// ---- ids determinísticos ----
let _n = 1;
const id = () => {
  let h = 0x811c9dc5 ^ (_n++);
  h = Math.imul(h ^ (h >>> 15), 0x2545f491) >>> 0;
  return (h.toString(16) + '00000000').slice(0, 8);
};
// ---- helpers de settings (vocabulário real do Elementor) ----
const U = (size, unit = 'px') => ({ unit, size, sizes: [] });
const bx = (t, r, b, l) => ({ unit: 'px', top: `${t}`, right: `${r}`, bottom: `${b}`, left: `${l}`, isLinked: false });
const W = (widgetType, settings) => ({ id: id(), elType: 'widget', widgetType, settings, elements: [], isInner: false });
const Cn = (isInner, settings, elements) => ({ id: id(), elType: 'container', isInner, settings, elements });
const WK = (widgetType, key, settings) => W(widgetType, { ...settings, _css_classes: key });
const boxed = (kids) => Cn(true, { content_width: 'boxed', boxed_width: U(1280), padding: bx(0, 32, 0, 32) }, kids);
const html = (h, key) => WK('html', key, { html: h });

// ---- tokens (styles.css :root) ----
const T = {
  bg: '#ECE3D7', bg2: '#E4D9CB', surface: '#F6F0E6', surface2: '#EFE6D8',
  gold: '#A85B41', gold2: '#C28C72', goldD: '#8B4630', rust: '#C9531F',
  paper: '#2B2521', muted: '#8A7868', beige: '#6F574A', ink: '#241D18',
  line: 'rgba(67,43,30,.14)', line2: 'rgba(67,43,30,.24)',
  ff: "'DM Sans',system-ui,sans-serif", serif: "'Instrument Serif',Georgia,serif",
};

// ================= CSS GLOBAL DA PÁGINA (page_settings.custom_css) =================
const PAGE_CSS =
  `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..800;1,9..40,400..600&family=Instrument+Serif:ital@0;1&display=swap');` +
  `body,.elementor-heading-title,.elementor-widget-text-editor,.elementor-button-text{font-family:${T.ff}}` +
  `p{margin:0}html{overflow-x:clip}body{overflow-x:visible;background:${T.bg};color:${T.paper};line-height:1.55;-webkit-font-smoothing:antialiased}` +
  `.rb a,.rb .elementor-button{text-decoration:none!important}.rb .elementor-button{box-shadow:none}` +
  `em{font-style:normal}` +
  // Elementor 4.x (e_font_icon_svg) renderiza ícone como SVG inline e pinta por `fill` — sem isto o ícone sai BRANCO/invisível
  `.rb .elementor-button-icon svg,.rbpop .elementor-button-icon svg{fill:currentColor!important;width:1em;height:1em}` +
  // barra do admin não pode cobrir a nav fixa
  `body.admin-bar .rbnav{top:32px}@media(max-width:782px){body.admin-bar .rbnav{top:46px}}` +
  // texto do botão: sem isto a caixa do texto ESTICA na altura do ícone e a letra cola no topo (parece padding assimétrico)
  `.rb .elementor-button-content-wrapper,.rbpop .elementor-button-content-wrapper{align-items:center}` +
  // imagem dentro de container de altura fixa: só os WRAPPERS herdam 100% — nunca o .rbfill (é ele que define a altura)
  `.rbfill>.elementor-widget-image,.rbfill .elementor-widget-container,.rbfill .elementor-widget-image a{height:100%!important;width:100%;line-height:0}` +
  `.rbfill img{width:100%!important;height:100%!important;display:block}` +
  // serifa itálica de acento (usada em .big em, hero em, etc.)
  `.ser{font-family:${T.serif};font-style:italic;font-weight:400;color:${T.gold}}` +
  // ---- botões ----
  `.rbtn .elementor-button{display:inline-flex;align-items:center;gap:.8em;font-size:14px;font-weight:600;letter-spacing:.02em;padding:11px 13px 11px 24px;border-radius:999px;border:1px solid ${T.line2};color:${T.gold};background:transparent;transition:.45s cubic-bezier(.22,.61,.36,1);white-space:nowrap}` +
  `.rbtn .elementor-button:hover{background:${T.gold};color:#FBF4EA;border-color:${T.gold};transform:translateY(-2px);box-shadow:0 16px 38px rgba(168,90,64,.28)}` +
  `.rbtn .elementor-button-icon{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;flex:none;border:1px solid currentColor;font-size:13px;line-height:1;transition:.45s cubic-bezier(.22,.61,.36,1)}` +
  `.rbtn .elementor-button:hover .elementor-button-icon{background:#FBF4EA;color:${T.gold};border-color:#FBF4EA;transform:rotate(-45deg)}` +
  `.rbtn-lg .elementor-button{padding:13px 15px 13px 30px;font-size:15px}.rbtn-lg .elementor-button-icon{width:34px;height:34px;font-size:14px}` +
  `.rbtn-solid .elementor-button{background:${T.gold};border-color:${T.gold};color:#FBF4EA;padding:11px 22px;gap:0}` +
  `.rbtn-solid .elementor-button:hover{background:${T.goldD};border-color:${T.goldD};box-shadow:0 12px 30px rgba(139,70,48,.28)}` +
  `.rbtn-text .elementor-button{padding:16px 34px;gap:0}` +
  // ---- nav ----
  `.rbnav{position:fixed!important;inset:0 0 auto 0;z-index:60;padding-block:18px!important;transition:.4s cubic-bezier(.22,.61,.36,1)}` +
  `.rbnav.stuck{padding-block:11px!important;background:rgba(237,227,215,.82);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);box-shadow:0 1px 0 ${T.line}}` +
  `.rbnav-inner{display:flex!important;flex-direction:row;align-items:center;gap:24px!important;padding:0!important}` +
  `.rbnav-brand{width:auto!important;flex:0 0 auto!important;padding:0!important}` +
  `.rbnav-brand svg{width:32px;height:30px;display:block;fill:${T.paper};transition:.3s}.rbnav-brand:hover svg{fill:${T.gold}}` +
  `.rbnav-links{display:flex!important;flex-direction:row;gap:4px!important;margin-left:auto!important;width:auto!important;flex:0 0 auto!important;padding:0!important}` +
  `.rbnav-links .elementor-button{font-size:13.5px;font-weight:500;color:rgba(43,37,33,.64);padding:9px 16px;border-radius:999px;background:none;border:0;transition:.25s}` +
  `.rbnav-links .elementor-button:hover{color:${T.gold};background:none;transform:none;box-shadow:none}` +
  `.rbnav-cta{width:auto!important;flex:0 0 auto!important;margin-left:6px;padding:0!important}` +
  `.rbnav-burger{display:none!important;width:auto!important;flex:0 0 auto!important;margin-left:auto!important;padding:0!important}` +
  `.rbnav-burger .elementor-button{background:none;border:0;padding:8px;color:${T.paper};box-shadow:none}` +
  `.rbnav-burger .elementor-button:hover{background:none;transform:none;box-shadow:none}` +
  `@media(max-width:680px){.rbnav-links,.rbnav-cta{display:none!important}.rbnav-burger{display:flex!important}}` +
  // popup mobile
  `.rbpop-ov{position:fixed;inset:0;z-index:98;background:rgba(36,29,24,.5);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);opacity:0;pointer-events:none;transition:opacity .3s}` +
  `.rbpop-ov.on{opacity:1;pointer-events:auto}` +
  `.rbpop{position:fixed!important;z-index:99;top:74px;left:16px;right:16px;background:${T.surface};border:1px solid ${T.line};border-radius:18px;padding:18px!important;box-shadow:0 30px 60px -20px rgba(36,29,24,.35);opacity:0;transform:translateY(-10px);pointer-events:none;transition:opacity .3s,transform .3s;gap:2px!important}` +
  `.rbpop.on{opacity:1;transform:none;pointer-events:auto}` +
  `.rbpop .elementor-button{justify-content:flex-start;width:100%;background:none;border:0;color:${T.paper};font-size:16px;padding:12px 10px;box-shadow:none}` +
  `.rbpop .elementor-button:hover{background:rgba(168,90,64,.08);color:${T.gold};transform:none;box-shadow:none}` +
  `.rbpop .rbpop-cta .elementor-button{background:${T.gold};color:#FBF4EA;justify-content:center;margin-top:8px;border-radius:999px}` +
  `.rbjs{position:absolute!important;width:0!important;height:0!important;min-height:0!important;overflow:hidden!important;pointer-events:none;flex:0 0 0!important;margin:0!important;padding:0!important}` +
  // ---- reveal ----
  `.rb-on .rvl{opacity:0;transform:translateY(32px);filter:blur(6px);transition:opacity .9s cubic-bezier(.22,.61,.36,1),transform .9s cubic-bezier(.22,.61,.36,1),filter .9s cubic-bezier(.22,.61,.36,1)}` +
  `.rb-on .rvl.in{opacity:1;transform:none;filter:blur(0)}` +
  `.rvl[data-d="1"]{transition-delay:.1s}.rvl[data-d="2"]{transition-delay:.2s}.rvl[data-d="3"]{transition-delay:.3s}` +
  `@media(prefers-reduced-motion:reduce){.rb-on .rvl{opacity:1!important;transform:none!important;filter:none!important}}` +
  // barra de progresso
  `.rbprog{position:fixed;top:0;left:0;height:2px;width:0;z-index:80;background:linear-gradient(90deg,${T.gold},${T.rust});box-shadow:0 0 12px rgba(168,90,64,.4);transition:width .1s linear}` +
  // ---- mobile geral ----
  `@media(max-width:980px){` +
    `.rbhero-photo{width:min(44%,360px)!important;opacity:.92}` +
    `.rbwho-top,.rbwho-cols,.rbproof-stats,.rbplans,.rbredes,.rbfloors-layout,.rbfoot-grid,.rbwork-head{grid-template-columns:1fr!important}` +
    `.rbfloors-foot{grid-template-columns:1fr!important}.rbfoot-r{text-align:left!important}` +
  `}` +
  `@media(max-width:680px){` +
    `.rbhero-photo{top:72px!important;width:min(70%,300px)!important;aspect-ratio:1/1}` +
    `.rbhero-left{padding-bottom:260px!important}` +
    // ribbon empilhado é mais alto no mobile: vira estático no fim da hero (não transborda pra próxima seção)
    // position:absolute explícito no mobile — sem isso o ribbon empilhado saía do hero e invadia a próxima seção
    `.rbribbon{position:absolute!important;flex-direction:column!important;align-items:flex-start!important;padding:16px 20px!important;gap:12px!important}` +
    `.rbribbon-stats{margin-left:0!important}` +
    `.rbbadge{display:none!important}` +
    `.e-con.e-con-boxed{padding-left:20px!important;padding-right:20px!important}` +
  `}`;

// ================= SCRIPTS (widgets HTML invisíveis) =================
const guard = `if(document.body.classList.contains('elementor-editor-active'))return;`;
// reveal + nav stuck + barra de progresso + contadores
const coreJS = `(function(){function I(){${guard}
var d=document.documentElement;d.classList.add('rb-on');
var nav=document.querySelector('.rbnav'),prog=document.querySelector('.rbprog');
function onScroll(){var y=window.scrollY||d.scrollTop||0;
 if(nav)nav.classList.toggle('stuck',y>10);
 if(prog){var h=d.scrollHeight-window.innerHeight;prog.style.width=(h>0?(y/h)*100:0)+'%';}}
window.addEventListener('scroll',onScroll,{passive:true});onScroll();
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:0,rootMargin:'0px 0px -10% 0px'});
document.querySelectorAll('.rvl').forEach(function(el){var r=el.getBoundingClientRect();if(r.top<window.innerHeight*0.95){el.classList.add('in');}else{io.observe(el);}});
var fmt=function(n){return n.toLocaleString('pt-BR');};
function count(el){if(el.__c)return;el.__c=1;var raw=(el.textContent||'').trim();var m=raw.match(/^([^0-9]*)([0-9.,]+)(.*)$/);if(!m)return;var pre=m[1],suf=m[3];var to=parseFloat(m[2].replace(/\\./g,'').replace(',','.'));if(!isFinite(to))return;var t0=null,dur=1400;
 function step(t){if(!t0)t0=t;var p=Math.min((t-t0)/dur,1);var e=1-Math.pow(1-p,3);el.textContent=p<1?pre+fmt(Math.round(to*e))+suf:raw;if(p<1)requestAnimationFrame(step);}requestAnimationFrame(step);}
var sio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){count(e.target);sio.unobserve(e.target);}});},{threshold:.5});
document.querySelectorAll('.cnum').forEach(function(el){sio.observe(el);});
}if(document.readyState!=='loading')I();else document.addEventListener('DOMContentLoaded',I);})();`;
// menu mobile
const popJS = `(function(){function I(){${guard}
var b=document.querySelector('.rbnav-burger .elementor-button'),p=document.querySelector('.rbpop'),o=document.querySelector('.rbpop-ov');
if(!b||!p||!o||b.__rb)return;b.__rb=1;
function set(v){p.classList.toggle('on',v);o.classList.toggle('on',v);document.body.style.overflow=v?'hidden':'';}
b.addEventListener('click',function(e){e.preventDefault();set(!p.classList.contains('on'));});
o.addEventListener('click',function(){set(false);});
p.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){set(false);});});
}if(document.readyState!=='loading')I();else document.addEventListener('DOMContentLoaded',I);})();`;
const scriptW = (js, key) => html(`<script>${js.replace(/<\/script>/g, '<\\/script>')}</script>`, `rbjs ${key}`);

// ================= 1 · NAV =================
const RB_ICON = "<svg viewBox=\"0 0 412 390\" fill=\"currentColor\" xmlns=\"http://www.w3.org/2000/svg\"> <path d=\"M89.5778 0.669677L215.87 0.52263C266.03 0.508377 320.81 -6.63262 359.54 32.3214C377.712 50.5959 387.304 71.7248 387.327 97.7839C387.552 121.517 378.095 144.316 361.145 160.922C354.987 167.068 348.072 172.394 340.565 176.771C337.715 178.431 322.415 185.374 322.085 185.953L324.17 186.789C326.87 188.657 328.37 188.77 331.52 189.408C329.105 193.027 311.285 223.097 310.557 223.59C307.557 224.075 306.117 224.116 303.162 224.162C290.082 223.947 276.432 223.935 263.547 226.676C255.68 228.343 233.915 233.572 227.247 236.74C217.212 222.341 209.952 214.47 195.2 204.413C205.895 200.379 217.332 198.134 228.304 194.515C195.987 170.664 148.7 159.244 109.37 160.116C102.02 160.279 92.5125 159.387 85.5105 160.315C85.6635 141.4 85.6133 122.484 85.3605 103.569C104.338 104.139 120.955 103.87 140.07 105.585C194.397 110.46 245.9 130.567 287.81 165.834C316.835 150.96 331.819 134.096 333.034 99.8642C334.017 72.3197 317.907 49.5479 290.592 43.9725C273.507 40.4849 251.697 41.7467 233.967 41.7467L148.697 41.6852C116.817 41.8697 84.9368 41.8772 53.0573 41.7099C53.073 67.667 53.7668 97.0607 52.9305 122.736C51.0668 125.772 51.9173 139.262 51.9893 143.468L51.6855 141.592C49.8848 139.983 50.8215 140.349 48.2355 140.375C45.4763 131.08 39.2213 122.327 36.5963 114.01C31.908 99.1522 29.9235 83.2993 22.1603 69.2199C17.049 59.9499 9.20777 52.1195 3.40052 43.5194C1.23977 40.3198 2.76076 29.4925 0.414761 25.1632C-0.361489 22.3177 0.198038 4.55636 0.302288 0.567639C29.1405 0.566139 61.0973 -0.222291 89.5778 0.669677Z\" fill=\"currentColor\"/> <path d=\"M0.302288 0.567697C29.1405 0.566196 61.0973 -0.222233 89.5778 0.669734C85.9778 3.23536 53.9543 0.531688 49.2435 2.95403C48.1268 7.22707 54.2415 35.2899 55.8465 40.6507C70.7753 39.3927 89.1443 40.9096 104.571 40.8458C110.729 40.8203 144.584 40.7265 148.697 41.6853C116.817 41.8698 84.9368 41.8773 53.0573 41.71C53.073 67.6671 53.7668 97.0607 52.9305 122.737C51.0668 125.773 51.9173 139.262 51.9893 143.468L51.6855 141.592C49.8848 139.983 50.8215 140.349 48.2355 140.375C45.4763 131.08 39.2213 122.327 36.5963 114.01C31.908 99.1523 29.9235 83.2994 22.1603 69.22C17.049 59.9499 9.20777 52.1195 3.40052 43.5194C1.23977 40.3199 2.76076 29.4925 0.414761 25.1632C-0.361489 22.3178 0.198038 4.55642 0.302288 0.567697Z\" fill=\"currentColor\"/> <path d=\"M228.304 194.515C244.287 205.476 250.909 212.226 263.547 226.676C255.679 228.343 233.914 233.571 227.247 236.74C217.212 222.34 209.952 214.47 195.199 204.413C205.894 200.379 217.332 198.134 228.304 194.515Z\" fill=\"currentColor\"/> <path d=\"M0.415718 25.1631C2.76172 29.4924 1.24073 40.3198 3.40148 43.5193C9.20873 52.1194 17.05 59.9498 22.1612 69.2198C29.9245 83.2993 31.909 99.1522 36.5972 114.01C39.2222 122.327 45.4773 131.08 48.2365 140.375C50.8225 140.349 49.8857 139.983 51.6865 141.592L51.9903 143.468C51.9183 139.261 51.0677 125.772 52.9315 122.736C53.1265 151.372 53.1745 180.008 53.0755 208.644C53.0702 234.289 53.425 261 52.9622 286.561C55.5415 284.12 59.2802 280.294 62.2105 278.57C68.9777 270.459 107.919 245.475 119.026 239.253C117.496 242.348 117.142 241.888 118.307 245.359C122.171 256.865 132.808 270.441 136.834 280.605L139.496 282.354C129.731 289.471 121.088 296.019 111.723 303.771C106.262 308.292 99.673 314.891 94.492 318.953C90.8005 323.595 82.1357 331.344 77.5765 336.39C62.8262 352.68 49.6765 370.35 38.3102 389.159C25.6615 389.051 13.0127 389.054 0.363991 389.165L0.357994 149.297L0.290474 78.2888C0.177974 61.3407 -0.369532 41.8764 0.415718 25.1631Z\" fill=\"currentColor\"/> <path d=\"M62.209 278.57C68.9762 270.459 107.918 245.474 119.025 239.252C117.495 242.348 117.14 241.888 118.306 245.359C122.17 256.865 132.807 270.441 136.833 280.605L139.495 282.353C129.729 289.471 121.087 296.019 111.722 303.771C106.261 308.292 99.6715 314.89 94.4905 318.953C94.4357 318.854 94.3803 318.754 94.3255 318.654C93.0828 310.53 72.0955 280.542 66.649 276.525L63.6662 278.976L62.209 278.57Z\" fill=\"currentColor\"/> <path d=\"M324.17 186.789C349.445 189.768 375.627 204.492 391.175 224.36C425.532 268.261 414.14 330.704 371.105 364.262C332.225 394.574 291.95 389.482 246.005 389.294L163.463 389.112C163.519 375.403 163.504 361.695 163.42 347.986L250.4 347.903C271.07 347.912 290.675 349.125 311.03 345.257C358.475 336.242 374.952 273.762 341.442 240.811C330.89 230.508 317.562 226.742 303.162 224.162C306.117 224.116 307.557 224.075 310.557 223.59C311.285 223.097 329.105 193.027 331.52 189.407C328.37 188.77 326.87 188.657 324.17 186.789Z\" fill=\"currentColor\"/> <path d=\"M119.025 239.253C143.135 225.018 168.665 213.341 195.199 204.413C209.952 214.47 217.212 222.34 227.247 236.74C193.624 248.96 169.125 261.703 139.495 282.354L136.833 280.605C132.807 270.441 122.17 256.865 118.306 245.359C117.141 241.888 117.495 242.348 119.025 239.253Z\" fill=\"currentColor\"/> </svg>"; // monograma RB real (assets/img/rb-icon.svg) — original usa como máscara sólida
const navLink = (label, href) => WK('button', 'rbnav-link', { text: label, link: { url: href, is_external: '', nofollow: '' }, _element_width: 'initial' });
const NAVITEMS = [['Quem é', '#quem'], ['Método', '#metodo'], ['Ecossistema', '#ecossistema'], ['Por que ele', '#why']];
const navBrand = Cn(false, { content_width: 'full', css_classes: 'rbnav-brand' }, [
  html(`<a href="#top" aria-label="Ronaldo Barcelos">${RB_ICON}</a>`, 'rbnav-icon')]);
const navLinks = Cn(false, { content_width: 'full', css_classes: 'rbnav-links', flex_direction: 'row' }, NAVITEMS.map(([l, h]) => navLink(l, h)));
const navCta = Cn(false, { content_width: 'full', css_classes: 'rbnav-cta' }, [
  WK('button', 'rbtn rbtn-solid', { text: 'Comece por aqui', link: { url: '#cta', is_external: '', nofollow: '' } })]);
const navBurger = Cn(false, { content_width: 'full', css_classes: 'rbnav-burger' }, [
  WK('button', '', { text: '', selected_icon: { value: 'fas fa-bars', library: 'fa-solid' }, link: { url: '#', is_external: '', nofollow: '' } })]);
const nav = Cn(false, { content_width: 'full', css_classes: 'rb rbnav' },
  [Cn(true, { content_width: 'boxed', boxed_width: U(1280), padding: bx(0, 32, 0, 32), css_classes: 'rbnav-inner', flex_direction: 'row' },
    [navBrand, navLinks, navCta, navBurger])]);
// popup mobile (nativo, editável)
const popNav = Cn(false, { content_width: 'full', css_classes: 'rbpop', flex_direction: 'column' }, [
  ...NAVITEMS.map(([l, h]) => WK('button', 'rbpop-link', { text: l, link: { url: h, is_external: '', nofollow: '' } })),
  WK('button', 'rbpop-cta', { text: 'Comece por aqui', link: { url: '#cta', is_external: '', nofollow: '' } })]);
const popOverlay = html('<div class="rbpop-ov"></div>', 'rbpop-ovw');

// ================= 2 · HERO =================
const heroCSS =
  // gap:0 — o container do Elementor vem com gap 20px e o widget (vazio) do badge conta como filho,
  // roubando 20px da altura do inner e desalinhando o texto em relação à foto
  `selector{position:relative;min-height:100svh;overflow:hidden;background:radial-gradient(82% 78% at 24% 28%,#F4ECE0,${T.bg} 70%);padding:0!important;gap:0!important}` +
  `selector .rbhero-photo{position:absolute!important;top:96px;right:clamp(24px,4vw,72px);bottom:104px;width:min(40%,520px);z-index:1;overflow:hidden;border-radius:4px;background:#BBBCC0;margin:0;padding:0!important}` +
  `selector .rbhero-photo img{width:100%;height:100%;object-fit:cover;object-position:top center;filter:contrast(1.03);border-radius:0}` +
  // container do Elementor é column por padrão: sem flex-direction:row o `align-items:center` centraliza
  // na HORIZONTAL e o conteúdo cola no topo do hero (H1 fica embaixo da nav fixa)
  // desktop: o inner ocupa a hero inteira com o MESMO inset da foto (96/104) e centraliza —
  // assim o bloco de texto fica opticamente alinhado à foto, com folga igual em cima e embaixo
  `selector .rbhero-inner{position:relative;z-index:3;flex:1 1 auto;min-height:0;display:flex!important;flex-direction:row!important;align-items:center!important;padding-block:96px 104px!important}` +
  `@media(max-width:680px){selector .rbhero-inner{flex:0 1 auto;min-height:70svh;padding-block:0!important}}` +
  `selector .rbhero-left{max-width:660px;padding-block:16px!important;width:auto!important;align-items:flex-start}` +
  `selector .rbhero-h .elementor-heading-title{font-size:clamp(2.1rem,4.9vw,4.1rem);font-weight:500;letter-spacing:-.01em;line-height:1.06;color:${T.paper}}` +
  `selector .rbhero-h .l{display:block;white-space:nowrap}` +
  `@media(max-width:560px){selector .rbhero-h .l{white-space:normal}}` +
  `selector .rbhero-p,selector .rbhero-p p{color:${T.beige};font-size:clamp(1.02rem,1.5vw,1.2rem);line-height:1.6;max-width:46ch;margin:0}` +
  `selector .rbhero-cta{display:flex!important;flex-direction:row;align-items:center;gap:20px!important;flex-wrap:wrap;width:auto!important;padding:0!important}` +
  `selector .rbhero-play .elementor-button{display:inline-flex;align-items:center;gap:10px;background:none;border:0;font-size:13.5px;font-weight:600;letter-spacing:.03em;color:${T.paper};padding:0;box-shadow:none}` +
  `selector .rbhero-play .elementor-button:hover{color:${T.gold};background:none;transform:none;box-shadow:none}` +
  `selector .rbhero-play .elementor-button-icon{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;border:1px solid ${T.line2};font-size:10px;color:${T.gold}}` +
  // ribbon
  `selector .rbribbon{position:absolute!important;left:0;right:0;bottom:0;z-index:4;padding:22px max(clamp(20px,5vw,72px),(100% - 1280px)/2)!important;display:flex!important;flex-direction:row;align-items:center;gap:clamp(20px,4vw,60px)!important;border-top:1px solid ${T.line};background:${T.bg}}` +
  `selector .rbribbon-name{width:auto!important;flex:0 0 auto!important;gap:0!important;padding:0!important}` +
  // no site original a regra `.hero__ribbon span` (mesma especificidade, vem depois) vence a `.hero__name span`:
  // o nome renderiza pequeno, caixa alta e apagado. Replicado aqui para bater com o publicado.
  `selector .rbribbon-name .n,selector .rbribbon-name .n .elementor-heading-title{font-weight:600;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:${T.muted};line-height:1.25;margin:0}` +
  `selector .rbribbon-name .r,selector .rbribbon-name .r p{font-size:11px;letter-spacing:.03em;color:${T.muted};margin:0}` +
  `selector .rbribbon-stats{display:flex!important;flex-direction:row;gap:clamp(18px,3vw,46px)!important;margin-left:auto!important;flex-wrap:wrap;width:auto!important;padding:0!important}` +
  `selector .rbstat{width:auto!important;flex:0 0 auto!important;gap:0!important;padding:0!important}` +
  `selector .rbstat .v,selector .rbstat .v .elementor-heading-title{font-size:clamp(1.2rem,2vw,1.7rem);font-weight:600;letter-spacing:-.02em;color:${T.gold};line-height:1;margin:0}` +
  `selector .rbstat .l,selector .rbstat .l p{font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:${T.muted};margin-top:5px}` +
  // badge giratório
  `selector .rbbadge{position:absolute!important;right:clamp(20px,5vw,72px);bottom:128px;z-index:5;width:96px;height:96px;display:grid;place-items:center;color:${T.gold}}` +
  `selector .rbbadge svg{position:absolute;inset:0;width:100%;height:100%;animation:rbspin 18s linear infinite;fill:${T.gold};font-size:9.2px;font-weight:600;letter-spacing:.12em;text-transform:uppercase}` +
  `selector .rbbadge .ar{font-size:18px;color:${T.paper}}` +
  `@keyframes rbspin{to{transform:rotate(360deg)}}`;
const HERO_LINES = ['A clínica que cresce não', 'é a que trabalha mais.', 'É a que trabalha <span class="ser">certo.</span>'];
const heroPhoto = Cn(false, { content_width: 'full', css_classes: 'rbhero-photo rbfill' }, [
  W('image', { image: { url: IMG.hero, id: '', alt: 'Ronaldo Barcelos', source: 'library', size: '' }, image_size: 'full' })]);
const heroLeft = Cn(false, { content_width: 'full', css_classes: 'rbhero-left', flex_direction: 'column', flex_align_items: 'flex-start' }, [
  WK('heading', 'rbhero-h rvl', { title: HERO_LINES.map((l) => `<span class="l">${l}</span>`).join(''), header_size: 'h1', _margin: bx(0, 0, 26, 0) }),
  WK('text-editor', 'rbhero-p rvl', { editor: '<p>Gestão, marca e posicionamento para clínicas de alto padrão. Método, clareza e direção para sair da operação no automático e crescer com estrutura.</p>', _margin: bx(0, 0, 34, 0) }),
  Cn(false, { content_width: 'full', css_classes: 'rbhero-cta rvl', flex_direction: 'row' }, [
    WK('button', 'rbtn rbtn-lg', { text: 'Comece por aqui', link: { url: '#cta', is_external: '', nofollow: '' }, selected_icon: { value: 'fas fa-arrow-right', library: 'fa-solid' }, icon_align: 'right' }),
    WK('button', 'rbhero-play', { text: 'Vídeo de apresentação', link: { url: '#top', is_external: '', nofollow: '' }, selected_icon: { value: 'fas fa-play', library: 'fa-solid' } })])]);
const RIBBON = [['+35', 'anos de mercado'], ['+600', 'médicos formados'], ['+11', 'anos de CD Clínica'], ['+2.500', 'pacientes · Melasma']];
const heroRibbon = Cn(false, { content_width: 'full', css_classes: 'rbribbon rvl', flex_direction: 'row' }, [
  Cn(false, { content_width: 'full', css_classes: 'rbribbon-name', flex_direction: 'column', flex_align_items: 'flex-start' }, [
    WK('heading', 'n', { title: 'Ronaldo Barcelos', header_size: 'div' }),
    WK('text-editor', 'r', { editor: '<p>CEO · CD Clínica &amp; Changeover Education</p>' })]),
  Cn(false, { content_width: 'full', css_classes: 'rbribbon-stats', flex_direction: 'row' }, RIBBON.map(([v, l]) =>
    Cn(false, { content_width: 'full', css_classes: 'rbstat', flex_direction: 'column', flex_align_items: 'flex-start' }, [
      WK('heading', 'v', { title: v, header_size: 'div' }),
      WK('text-editor', 'l', { editor: `<p>${l}</p>` })])))]);
const heroBadge = html(
  '<a class="rbbadge" href="#quem" aria-label="Role para descobrir">' +
  '<svg viewBox="0 0 100 100"><defs><path id="rbcirc" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0"/></defs><text><textPath href="#rbcirc">CHANGEOVER · EDUCATION · COMECE POR AQUI · </textPath></text></svg>' +
  '<span class="ar">↓</span></a>', 'rbbadge-w');
const hero = Cn(false, { content_width: 'full', _element_id: 'top', css_classes: 'rb rbhero', custom_css: heroCSS }, [
  heroPhoto,
  Cn(true, { content_width: 'boxed', boxed_width: U(1280), padding: bx(0, 32, 0, 32), css_classes: 'rbhero-inner' }, [heroLeft]),
  heroRibbon, heroBadge]);

// ================= 3 · QUEM É =================
const whoCSS =
  `selector{background:${T.bg2};padding-block:clamp(80px,11vw,150px)!important}` +
  `selector .rbwho-top{display:grid!important;grid-template-columns:1fr 1fr;gap:clamp(40px,6vw,90px)!important;align-items:start;margin-bottom:clamp(56px,8vw,110px)!important;padding:0!important}` +
  `selector .rbwho-id{width:auto!important;gap:0!important;padding:0!important;align-items:flex-start}` +
  `selector .rbwho-kick,selector .rbwho-kick p{display:inline-flex;align-items:center;gap:10px;font-size:11.5px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:${T.gold};margin:0}` +
  `selector .rbwho-kick::before{content:"";width:7px;height:7px;border-radius:50%;background:${T.gold};box-shadow:0 0 0 4px rgba(168,90,64,.16)}` +
  `selector .rbwho-name{margin-top:28px!important}selector .rbwho-name .elementor-heading-title{font-size:clamp(2.6rem,5.4vw,4.6rem);font-weight:500;letter-spacing:-.035em;line-height:.98;color:${T.paper}}` +
  `selector .rbwho-name i{font-style:normal;color:${T.gold}}` +
  `selector .rbwho-role,selector .rbwho-role p{display:flex;align-items:center;gap:16px;font-size:14px;font-weight:600;color:${T.beige};margin:0}` +
  `selector .rbwho-role{margin-top:30px!important}selector .rbwho-role::before{content:"";width:40px;height:1px;background:${T.gold};flex:none}` +
  `selector .rbwho-bio,selector .rbwho-bio p{font-size:clamp(1.15rem,1.7vw,1.5rem);line-height:1.5;color:rgba(43,37,33,.74);margin:0}` +
  `selector .rbwho-bio b{color:${T.paper};font-weight:600}` +
  `selector .rbwho-cols{display:grid!important;grid-template-columns:1fr 1fr;gap:clamp(40px,6vw,90px)!important;padding:0!important}` +
  `selector .rbwho-col{width:auto!important;gap:0!important;padding:0!important}` +
  `selector .rbwho-lbl,selector .rbwho-lbl .elementor-heading-title{font-size:11.5px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:${T.gold};margin:0}` +
  `selector .rbwho-lbl{padding-bottom:20px!important;border-bottom:1px solid ${T.line}}` +
  `selector .rbwho-item{display:grid!important;grid-template-columns:54px 1fr;align-items:center;gap:16px!important;padding:24px 0!important;border-bottom:1px solid ${T.line};transition:.35s cubic-bezier(.22,.61,.36,1)}` +
  `selector .rbwho-item:hover{padding-left:8px!important}` +
  `selector .rbwho-n,selector .rbwho-n .elementor-heading-title{font-family:${T.serif};font-style:italic;font-size:1.3rem;color:${T.gold};opacity:.9;margin:0}` +
  `selector .rbwho-t,selector .rbwho-t p{font-size:clamp(1.02rem,1.4vw,1.22rem);color:${T.paper};line-height:1.35;margin:0}`;
const whoItem = (n, t) => Cn(false, { content_width: 'full', css_classes: 'rbwho-item' }, [
  WK('heading', 'rbwho-n', { title: n, header_size: 'div' }),
  WK('text-editor', 'rbwho-t', { editor: `<p>${t}</p>` })]);
const whoCol = (lbl, items, d) => Cn(false, { content_width: 'full', css_classes: `rbwho-col rvl`, flex_direction: 'column' }, [
  WK('heading', 'rbwho-lbl', { title: lbl, header_size: 'h4' }),
  ...items.map(([n, t]) => whoItem(n, t))]);
const who = Cn(false, { content_width: 'full', _element_id: 'quem', css_classes: 'rb rbwho', custom_css: whoCSS }, [boxed([
  Cn(true, { content_width: 'full', css_classes: 'rbwho-top' }, [
    Cn(false, { content_width: 'full', css_classes: 'rbwho-id rvl', flex_direction: 'column', flex_align_items: 'flex-start' }, [
      WK('text-editor', 'rbwho-kick', { editor: '<p>Quem é</p>' }),
      WK('heading', 'rbwho-name', { title: 'Ronaldo Barcelos<i>.</i>', header_size: 'h2' }),
      WK('text-editor', 'rbwho-role', { editor: '<p>CEO · CD Clínica &amp; Changeover Education</p>' })]),
    WK('text-editor', 'rbwho-bio rvl', { editor: '<p>Empresário, publicitário e mentor. Leva mais de <b>35 anos</b> de Administração, Comunicação e Marketing para <span class="ser">dentro da medicina</span>, à frente da CD Clínica e do ecossistema Changeover Education.</p>' })]),
  Cn(true, { content_width: 'full', css_classes: 'rbwho-cols' }, [
    whoCol('Áreas de atuação', [['01', 'Gestão e direção para clínicas de alto padrão'], ['02', 'Marca, posicionamento e autoridade médica'], ['03', 'Novos negócios e expansão sustentável']]),
    whoCol('Trajetória &amp; reconhecimento', [['04', 'Founder &amp; ex-CEO · +35 anos de mercado'], ['05', 'Protocolo Regenerativo do Melasma'], ['06', 'CD Clínica · referência no Leblon']])])])]);

// ================= 4 · MÉTODO (prova + marquee) =================
const LOGOS = [IMG.merz, IMG.btl, IMG.contourline, IMG.evo, IMG.lmg, IMG.farma, IMG.genomics];
const proofCSS =
  `selector{background:${T.bg};overflow:hidden;padding-block:clamp(80px,11vw,150px) clamp(36px,4vw,56px)!important}` +
  `selector .rbproof-h .elementor-heading-title{font-size:clamp(2rem,4.5vw,3.8rem);font-weight:500;letter-spacing:-.03em;line-height:1.07;color:${T.paper};max-width:24ch}` +
  `selector .rbproof-h{margin-bottom:clamp(48px,6vw,82px)!important}` +
  `selector .rbproof-stats{display:grid!important;grid-template-columns:repeat(3,1fr);gap:clamp(24px,4vw,54px)!important;padding:0!important}` +
  `selector .rbpstat{border-top:1px solid ${T.line};padding-top:26px!important;gap:0!important;width:auto!important}` +
  `selector .cnum,selector .cnum .elementor-heading-title{font-size:clamp(2.8rem,5.2vw,4.4rem);font-weight:500;letter-spacing:-.035em;color:${T.gold};line-height:1;margin:0}` +
  `selector .rbpstat .d,selector .rbpstat .d p{color:${T.muted};font-size:.95rem;max-width:24ch;margin:14px 0 0}` +
  `selector .rbapoio{margin-top:clamp(80px,10vw,140px)!important;border-top:1px solid ${T.line};padding-top:38px!important;gap:0!important}` +
  `selector .rbapoio-l,selector .rbapoio-l p{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:${T.muted};margin:0}` +
  `selector .rbmarquee{overflow:hidden;margin-top:26px;-webkit-mask-image:linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent);mask-image:linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent)}` +
  `selector .rbmq-track{display:flex;align-items:center;gap:clamp(34px,4vw,58px);width:max-content;animation:rbmq 38s linear infinite}` +
  `selector .rbmq-track img{height:26px;width:auto;display:block;opacity:.55;filter:brightness(0) saturate(0);transition:opacity .3s}` +
  `selector .rbmarquee:hover img{opacity:.85}selector .rbmarquee:hover .rbmq-track{animation-play-state:paused}` +
  `@keyframes rbmq{to{transform:translateX(-50%)}}` +
  `@media(prefers-reduced-motion:reduce){selector .rbmq-track{animation:none}}`;
const pstat = (num, count, prefix, suffix, desc) => Cn(false, { content_width: 'full', css_classes: 'rbpstat rvl', flex_direction: 'column', flex_align_items: 'flex-start' }, [
  WK('heading', 'cnum', { title: num, header_size: 'div', _element_id: '', custom_css: '' }),
  WK('text-editor', 'd', { editor: `<p>${desc}</p>` })]);
const marqueeHTML = '<div class="rbmarquee"><div class="rbmq-track">' +
  [...LOGOS, ...LOGOS].map((l) => `<img src="${l}" alt="" loading="lazy">`).join('') + '</div></div>';
const proof = Cn(false, { content_width: 'full', _element_id: 'metodo', css_classes: 'rb rbproof', custom_css: proofCSS }, [boxed([
  WK('heading', 'rbproof-h rvl', { title: 'Não é <span class="ser">teoria.</span> É um método que já formou centenas de médicos.', header_size: 'h2' }),
  Cn(true, { content_width: 'full', css_classes: 'rbproof-stats' }, [
    pstat('+600', 600, '+', '', 'médicos formados pelos treinamentos Changeover'),
    pstat('+11 anos', 11, '+', ' anos', 'de CD Clínica como referência no Leblon'),
    pstat('+2.500', 2500, '+', '', 'pacientes tratados pelo Protocolo Melasma')]),
  Cn(true, { content_width: 'full', css_classes: 'rbapoio', flex_direction: 'column', flex_align_items: 'flex-start' }, [
    WK('text-editor', 'rbapoio-l', { editor: '<p>Apoio científico de quem lidera o mercado</p>' }),
    html(marqueeHTML, 'rbmq-w')])])]);

// ================= 5 · ECOSSISTEMA =================
const PLANS = [
  { n: '01', name: 'Workshop Business', tag: 'Online', badge: 'Comece por aqui', feat: true, items: ['Marketing e autoridade', 'Posicionar sua clínica', 'Atrair os pacientes certos', 'Sem precisar virar influencer'] },
  { n: '02', name: 'Business Presencial', tag: 'Imersão de 1 dia', badge: 'novo', soft: true, items: ['Gestão, marketing e novos negócios', 'Do automático à estrutura', 'Divisor de águas da carreira'] },
  { n: '03', name: 'Experience', tag: 'Evento · 2 dias', items: ['Ciência aplicada e protocolos exclusivos', 'Regenerativo do Melasma', 'Estética regenerativa e longevidade'] },
  { n: '04', name: 'Immersion', tag: 'Hands-on · 1 dia', items: ['Bioestimuladores, PDRN e exossomos', 'Protocolo Regenerativo do Melasma', 'Aplicável no dia seguinte'] },
  { n: '05', name: 'Fellow Digital', tag: 'Comunidade', items: ['Dois encontros mensais ao vivo', 'Prática clínica com Cyro e Denise', 'Gestão e posicionamento com Ronaldo'] },
  { n: '06', name: 'Shadow', tag: 'Individual · 1 a 5 dias', items: ['Imersão dentro da CD Clínica', 'Acompanhe atendimentos reais', 'Cultura de excelência'] }];
const workCSS =
  `selector{background:${T.bg2};position:relative;overflow:hidden;padding-block:clamp(80px,11vw,150px)!important}` +
  `selector .rbwork-head{display:grid!important;grid-template-columns:1.5fr 1fr;gap:40px!important;align-items:end;margin-bottom:clamp(44px,5vw,68px)!important;padding:0!important}` +
  `selector .rbwork-h .elementor-heading-title{font-size:clamp(2rem,4.5vw,3.8rem);font-weight:500;letter-spacing:-.03em;line-height:1.07;color:${T.paper}}` +
  `selector .rbwork-note,selector .rbwork-note p{color:${T.muted};font-size:1.04rem;max-width:38ch;margin:0}` +
  `selector .rbplans{display:grid!important;grid-template-columns:repeat(3,1fr);gap:0!important;border:1px solid ${T.line};padding:0!important}` +
  `selector .rbplan{background:${T.surface};border-right:1px solid ${T.line};border-bottom:1px solid ${T.line};padding:30px 30px 26px!important;display:flex!important;flex-direction:column;gap:0!important;transition:.35s cubic-bezier(.22,.61,.36,1)}` +
  `selector .rbplan:nth-child(3n){border-right:0}selector .rbplan:nth-child(n+4){border-bottom:0}` +
  `selector .rbplan:hover{background:${T.surface2}}` +
  `selector .rbplan-head{display:flex!important;flex-direction:row;align-items:center;justify-content:space-between;gap:10px!important;margin-bottom:20px!important;padding:0!important;width:100%!important}` +
  `selector .rbplan-num,selector .rbplan-num .elementor-heading-title{font-family:${T.serif};font-style:italic;font-size:1.4rem;color:${T.gold};opacity:.9;margin:0}` +
  `selector .rbplan-badge,selector .rbplan-badge p{font-size:9.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;background:${T.gold};color:#FBF4EA;border-radius:999px;padding:5px 11px;white-space:nowrap;margin:0}` +
  `selector .rbplan-badge{width:auto!important}` +
  `selector .rbplan-badge.soft p{background:transparent;border:1px solid ${T.line2};color:${T.beige}}` +
  `selector .rbplan-name,selector .rbplan-name .elementor-heading-title{font-size:1.34rem;font-weight:600;letter-spacing:-.02em;color:${T.paper};margin:0 0 6px}` +
  `selector .rbplan-tag,selector .rbplan-tag p{font-size:11.5px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:${T.gold2};margin:0 0 22px}` +
  `selector .rbplan-list ul{list-style:none;display:flex;flex-direction:column;gap:13px;margin:0 0 24px;padding:0}` +
  `selector .rbplan-list li{position:relative;padding-left:24px;font-size:.95rem;color:rgba(43,37,33,.74);line-height:1.4}` +
  `selector .rbplan-list li::before{content:"";position:absolute;left:2px;top:8px;width:6px;height:6px;border-radius:50%;background:${T.gold}}` +
  `selector .rbplan-link{margin-top:auto!important;padding-top:20px!important;border-top:1px solid ${T.line};width:100%!important}` +
  `selector .rbplan-link .elementor-button{padding:0;background:none;border:0;color:${T.gold};font-weight:600;font-size:14px;gap:.5em;box-shadow:none}` +
  `selector .rbplan-link .elementor-button:hover{color:${T.goldD};background:none;transform:none;box-shadow:none}` +
  `selector .rbplan-feat{background-image:linear-gradient(165deg,#F8F0E3,${T.surface} 70%)!important;background-color:${T.surface}!important;box-shadow:inset 0 0 0 1px ${T.gold}}` +
  `selector .rbwork-arrow{position:absolute;top:7%;right:-1%;width:min(30vw,320px);color:rgba(120,80,55,.08);z-index:1;pointer-events:none}` +
  `selector .rbwork-arrow svg{width:100%;height:auto;display:block}`;
const planCard = (p) => Cn(false, { content_width: 'full', css_classes: `rbplan rvl${p.feat ? ' rbplan-feat' : ''}`, flex_direction: 'column' }, [
  Cn(false, { content_width: 'full', css_classes: 'rbplan-head', flex_direction: 'row' }, [
    WK('heading', 'rbplan-num', { title: p.n, header_size: 'div' }),
    ...(p.badge ? [WK('text-editor', `rbplan-badge${p.soft ? ' soft' : ''}`, { editor: `<p>${p.badge}</p>` })] : [])]),
  WK('heading', 'rbplan-name', { title: p.name, header_size: 'h3' }),
  WK('text-editor', 'rbplan-tag', { editor: `<p>${p.tag}</p>` }),
  WK('text-editor', 'rbplan-list', { editor: `<ul>${p.items.map((i) => `<li>${i}</li>`).join('')}</ul>` }),
  Cn(false, { content_width: 'full', css_classes: 'rbplan-link' }, [
    WK('button', '', { text: 'Saiba mais', link: { url: '#cta', is_external: '', nofollow: '' }, selected_icon: { value: 'fas fa-arrow-right', library: 'fa-solid' }, icon_align: 'right' })])]);
// e-no-lazyload: sem isso o lazy-load de background do Elementor zera o gradiente do card destaque
// (regra `...:not(.e-lazyloaded):not(.e-no-lazyload) *{background-image:none!important}`)
const work = Cn(false, { content_width: 'full', _element_id: 'ecossistema', css_classes: 'rb rbwork e-no-lazyload', custom_css: workCSS }, [
  html('<div class="rbwork-arrow"><svg viewBox="0 0 100 100" aria-hidden="true"><path d="M20 80 L80 20 M45 20 L80 20 L80 55" stroke="currentColor" stroke-width="6" fill="none"/></svg></div>', 'rbwork-arrow-w'),
  boxed([
    Cn(true, { content_width: 'full', css_classes: 'rbwork-head' }, [
      WK('heading', 'rbwork-h rvl', { title: 'O <span class="ser">ecossistema</span> Changeover', header_size: 'h2' }),
      WK('text-editor', 'rbwork-note rvl', { editor: '<p>Mais do que cursos, uma jornada completa, do primeiro contato ao acompanhamento estratégico da sua carreira. Formatos de imersão para cada estágio.</p>' })]),
    Cn(true, { content_width: 'full', css_classes: 'rbplans' }, PLANS.map(planCard))])]);

// ================= 6 · TRAJETÓRIA (floors) =================
const icChart = '<svg viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 7-7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 8h4v4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const icCap = '<svg viewBox="0 0 24 24"><path d="M2 8l10-4 10 4-10 4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M6 10.5V16c0 1.2 2.7 2.6 6 2.6s6-1.4 6-2.6v-5.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const icDrop = '<svg viewBox="0 0 24 24"><path d="M12 3s6 6 6 10a6 6 0 1 1-12 0c0-4 6-10 6-10z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';
const icStar = '<svg viewBox="0 0 24 24"><path d="M12 3l2.5 5 5.5.8-4 3.9 1 5.5-5-2.6-5 2.6 1-5.5-4-3.9 5.5-.8z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg><svg viewBox="0 0 24 24"><path d="M5 12h12M13 7l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const icBuild = '<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="1" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
const FLOORS = [
  { n: '35<i>+</i>', t: 'Gestão &amp; Marketing', s: 'Administração · Comunicação · Marketing', ic: icChart },
  { n: '600<i>+</i>', t: 'Médicos formados', s: 'Treinamentos Changeover', ic: icCap },
  { n: '2.5<small>K</small><i>+</i>', t: 'Pacientes tratados', s: 'Protocolo Regenerativo do Melasma', ic: icDrop },
  { n: 'CEO', t: 'Founder &amp; ex-CEO', s: 'Operações na medicina', ic: icStar, hl: true },
  { n: '11', t: 'CD Clínica', s: 'Anos de referência no Leblon', ic: icBuild }];
const whyCSS =
  `selector{background:${T.bg};padding-block:clamp(80px,11vw,150px)!important}` +
  `selector .rbfloors-h .elementor-heading-title{font-weight:300;font-size:clamp(2.4rem,6vw,4.6rem);letter-spacing:.01em;color:${T.paper};line-height:1}` +
  `selector .rbfloors-rule{height:1px;background:${T.line};margin-top:24px}` +
  `selector .rbfloors-layout{display:grid!important;grid-template-columns:300px 1fr;gap:clamp(30px,5vw,70px)!important;margin-top:clamp(36px,5vw,60px)!important;padding:0!important}` +
  `selector .rbfloors-aside{display:flex!important;flex-direction:column;justify-content:space-between;gap:40px!important;padding:0!important;width:auto!important}` +
  `selector .rbfloors-label,selector .rbfloors-label .elementor-heading-title{font-weight:400;font-size:clamp(1.5rem,2.6vw,2.1rem);letter-spacing:-.01em;color:${T.paper};margin:0}` +
  `selector .rbfloors-label span{color:${T.gold};font-weight:300}` +
  `selector .rbconcept{gap:0!important;padding:0!important;width:auto!important}` +
  `selector .rbconcept-h,selector .rbconcept-h .elementor-heading-title{color:${T.gold};font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;margin:0 0 12px}` +
  `selector .rbconcept-p,selector .rbconcept-p p{color:${T.muted};font-size:.92rem;line-height:1.6;max-width:34ch;margin:0}` +
  `selector .rbfloor{display:grid!important;grid-template-columns:130px 1fr auto;align-items:center;gap:clamp(16px,3vw,36px)!important;padding:clamp(22px,2.8vw,32px) 0!important;border-bottom:1px solid rgba(67,43,30,.1);transition:.35s cubic-bezier(.22,.61,.36,1)}` +
  `selector .rbfloor:last-child{border-bottom:0}selector .rbfloor:hover{padding-left:10px!important}` +
  `selector .rbfloor-n,selector .rbfloor-n .elementor-heading-title{font-size:clamp(2.4rem,4.4vw,3.6rem);font-weight:300;color:${T.paper};line-height:.9;letter-spacing:-.03em;white-space:nowrap;margin:0}` +
  `selector .rbfloor-n i{font-style:normal;font-size:.42em;vertical-align:super;color:${T.gold};font-weight:400;margin-left:.04em}` +
  `selector .rbfloor-n small{font-size:.62em;font-weight:300}` +
  `selector .rbfloor-b{gap:0!important;padding:0!important;width:auto!important}` +
  `selector .rbfloor-t,selector .rbfloor-t .elementor-heading-title{font-size:clamp(1.05rem,1.7vw,1.3rem);font-weight:500;color:${T.paper};letter-spacing:.01em;margin:0}` +
  `selector .rbfloor-s,selector .rbfloor-s p{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:${T.muted};margin-top:7px}` +
  `selector .rbfloor-ic{display:flex!important;flex-direction:row;gap:14px!important;color:rgba(43,37,33,.55);width:auto!important;padding:0!important}` +
  `selector .rbfloor-ic svg{width:22px;height:22px;display:block}` +
  `selector .rbfloor-hl .rbfloor-n .elementor-heading-title,selector .rbfloor-hl .rbfloor-t .elementor-heading-title{color:${T.gold}}` +
  `selector .rbfloor-hl .rbfloor-s p{color:${T.gold2}}selector .rbfloor-hl .rbfloor-ic{color:${T.gold}}` +
  `selector .rbfloors-foot{display:grid!important;grid-template-columns:repeat(3,1fr);gap:30px!important;margin-top:clamp(44px,6vw,72px)!important;padding-top:34px!important;border-top:1px solid ${T.line}}` +
  `selector .rbfoot-i{gap:0!important;padding:0!important;width:auto!important}` +
  `selector .rbfoot-h,selector .rbfoot-h .elementor-heading-title{color:${T.gold};font-size:12px;font-weight:600;letter-spacing:.06em;margin:0 0 9px;text-transform:uppercase}` +
  `selector .rbfoot-p,selector .rbfoot-p p{color:${T.muted};font-size:.86rem;line-height:1.55;max-width:34ch;margin:0}` +
  `selector .rbfoot-r{text-align:right;justify-self:end}selector .rbfoot-r .rbfoot-p p{margin-left:auto}`;
const floorRow = (f) => Cn(false, { content_width: 'full', css_classes: `rbfloor rvl${f.hl ? ' rbfloor-hl' : ''}` }, [
  WK('heading', 'rbfloor-n', { title: f.n, header_size: 'div' }),
  Cn(false, { content_width: 'full', css_classes: 'rbfloor-b', flex_direction: 'column', flex_align_items: 'flex-start' }, [
    WK('heading', 'rbfloor-t', { title: f.t, header_size: 'h3' }),
    WK('text-editor', 'rbfloor-s', { editor: `<p>${f.s}</p>` })]),
  WK('text-editor', 'rbfloor-ic', { editor: f.ic })]);
const footItem = (h, p, cls) => Cn(false, { content_width: 'full', css_classes: `rbfoot-i rvl ${cls || ''}`, flex_direction: 'column', flex_align_items: 'flex-start' }, [
  WK('heading', 'rbfoot-h', { title: h, header_size: 'h5' }),
  WK('text-editor', 'rbfoot-p', { editor: `<p>${p}</p>` })]);
const why = Cn(false, { content_width: 'full', _element_id: 'why', css_classes: 'rb rbwhy', custom_css: whyCSS }, [boxed([
  WK('heading', 'rbfloors-h rvl', { title: 'Trajetória', header_size: 'h2' }),
  html('<div class="rbfloors-rule"></div>', 'rbfloors-rule-w'),
  Cn(true, { content_width: 'full', css_classes: 'rbfloors-layout' }, [
    Cn(false, { content_width: 'full', css_classes: 'rbfloors-aside', flex_direction: 'column', flex_align_items: 'flex-start' }, [
      WK('heading', 'rbfloors-label rvl', { title: 'Por que o Ronaldo <span>›</span>', header_size: 'div' }),
      Cn(false, { content_width: 'full', css_classes: 'rbconcept rvl', flex_direction: 'column', flex_align_items: 'flex-start' }, [
        WK('heading', 'rbconcept-h', { title: 'A filosofia', header_size: 'h4' }),
        WK('text-editor', 'rbconcept-p', { editor: '<p>“Crescer não é trabalhar mais, é trabalhar com gestão, clareza e direção.” Método, marca e posicionamento para clínicas de alto padrão.</p>' })])]),
    Cn(false, { content_width: 'full', css_classes: 'rbfloors', flex_direction: 'column' }, FLOORS.map(floorRow))]),
  Cn(true, { content_width: 'full', css_classes: 'rbfloors-foot' }, [
    footItem('O método', 'Gestão, marca e direção, do jeito que sustenta clínicas de alto padrão.'),
    footItem('Onde', 'CD Clínica · Leblon, Rio de Janeiro. Atendimento referência no país.'),
    footItem('Changeover Education', 'Educação aplicada para médicos que querem crescer com estrutura.', 'rbfoot-r')])])]);

// ================= 7 · REDES =================
const redesCSS =
  `selector{background:${T.bg2};padding:0!important}` +
  `selector .rbredes{display:grid!important;grid-template-columns:minmax(0,38%) 1fr;align-items:center;padding:0!important;gap:0!important}` +
  `selector .rbredes-media{position:relative;overflow:hidden;align-self:center;height:clamp(420px,58vh,600px);margin:48px 0 48px 48px;border-radius:4px;padding:0!important}` +
  `selector .rbredes-media img{width:100%;height:100%;object-fit:cover;object-position:center 18%;filter:grayscale(.3) contrast(1.02) sepia(.08);transition:transform 1.4s cubic-bezier(.22,.61,.36,1),filter .6s;border-radius:0}` +
  `selector .rbredes-media:hover img{filter:grayscale(0) contrast(1.02);transform:scale(1.04)}` +
  `selector .rbredes-text{align-self:center;padding:clamp(64px,9vw,140px) clamp(40px,6vw,96px)!important;gap:0!important}` +
  `selector .rbredes-h .elementor-heading-title{font-size:clamp(2rem,4.5vw,3.8rem);font-weight:500;letter-spacing:-.03em;line-height:1.07;color:${T.paper};margin-bottom:22px}` +
  `selector .rbredes-p,selector .rbredes-p p{color:${T.muted};font-size:1.08rem;max-width:42ch;margin:0 0 32px}` +
  `selector .rbredes-cta{display:flex!important;flex-direction:row;align-items:center;gap:14px!important;flex-wrap:wrap;width:auto!important;padding:0!important}` +
  `selector .rbicon-btn .elementor-button{display:grid;place-items:center;width:58px;height:58px;padding:0;border-radius:50%;border:1px solid ${T.line2};color:${T.gold};background:transparent}` +
  `selector .rbicon-btn .elementor-button:hover{background:${T.gold};color:#FBF4EA;border-color:${T.gold};transform:translateY(-2px) rotate(8deg)}` +
  `selector .rbicon-btn .elementor-button-icon{width:auto;height:auto;border:0;font-size:22px}` +
  `@media(max-width:980px){selector .rbredes-media{height:56vh;min-height:360px;margin:0}selector .rbredes-text{padding:48px clamp(20px,5vw,72px) 64px!important}}`;
const IG = 'https://instagram.com/ronaldo_barcelos_';
const redes = Cn(false, { content_width: 'full', _element_id: 'redes', css_classes: 'rb rbredes-s', custom_css: redesCSS }, [
  Cn(false, { content_width: 'full', css_classes: 'rbredes' }, [
    Cn(false, { content_width: 'full', css_classes: 'rbredes-media rbfill rvl' }, [
      W('image', { image: { url: IMG.social, id: '', alt: 'Ronaldo Barcelos nos bastidores', source: 'library', size: '' }, image_size: 'full' })]),
    Cn(false, { content_width: 'full', css_classes: 'rbredes-text rvl', flex_direction: 'column', flex_align_items: 'flex-start' }, [
      WK('heading', 'rbredes-h', { title: 'Os bastidores de quem <span class="ser">pensa</span> o negócio', header_size: 'h2' }),
      WK('text-editor', 'rbredes-p', { editor: '<p>Gestão, marca e os bastidores de uma clínica-referência, com os insights que o Ronaldo compartilha entre um projeto e outro.</p>' }),
      Cn(false, { content_width: 'full', css_classes: 'rbredes-cta', flex_direction: 'row' }, [
        WK('button', 'rbtn rbtn-lg rbtn-text', { text: 'Seguir @ronaldo_barcelos_', link: { url: IG, is_external: 'on', nofollow: '' } }),
        WK('button', 'rbicon-btn', { text: '', link: { url: IG, is_external: 'on', nofollow: '' }, selected_icon: { value: 'fab fa-instagram', library: 'fa-brands' } })])])])]);

// ================= 8 · CTA =================
const ctaCSS =
  `selector{background:${T.bg};position:relative;overflow:hidden;text-align:center;padding-block:clamp(80px,11vw,150px)!important}` +
  `selector::before{content:"";position:absolute;inset:0;z-index:1;background:radial-gradient(60% 70% at 50% 30%,rgba(168,90,64,.12),transparent 62%);pointer-events:none}` +
  `selector .rbcta-center{position:relative;z-index:2;display:flex!important;flex-direction:column;align-items:center;max-width:880px;margin:0 auto;gap:0!important}` +
  `selector .rbcta-kick,selector .rbcta-kick p{display:inline-flex;align-items:center;gap:11px;font-size:11.5px;font-weight:600;letter-spacing:.24em;text-transform:uppercase;color:${T.gold};margin:0}` +
  `selector .rbcta-kick::before,selector .rbcta-kick::after{content:"";width:28px;height:1px;background:${T.line2}}` +
  `selector .rbcta-kick{margin-bottom:34px!important;width:auto!important}` +
  `selector .rbcta-h .elementor-heading-title{font-size:clamp(2.4rem,5.8vw,4.8rem);font-weight:500;letter-spacing:-.035em;line-height:1.03;color:${T.paper};text-wrap:balance;max-width:15ch;margin:0 auto}` +
  `selector .rbcta-p,selector .rbcta-p p{color:rgba(43,37,33,.62);font-size:clamp(1rem,1.35vw,1.13rem);line-height:1.65;max-width:42ch;margin:30px auto 48px}` +
  `selector .rbcta-a{width:auto!important}`;
const cta = Cn(false, { content_width: 'full', _element_id: 'cta', css_classes: 'rb rbcta', custom_css: ctaCSS }, [boxed([
  Cn(true, { content_width: 'full', css_classes: 'rbcta-center', flex_direction: 'column' }, [
    WK('text-editor', 'rbcta-kick rvl', { editor: '<p>Comece agora</p>' }),
    WK('heading', 'rbcta-h rvl', { title: 'Construa o próximo nível da sua <span class="ser">clínica.</span>', header_size: 'h2' }),
    WK('text-editor', 'rbcta-p rvl', { editor: '<p>Com método, marca e gestão, do jeito que sustenta clínicas de alto padrão. O Changeover é o seu ponto de partida.</p>' }),
    Cn(false, { content_width: 'full', css_classes: 'rbcta-a rvl' }, [
      WK('button', 'rbtn rbtn-lg', { text: 'Comece por aqui', link: { url: 'https://wa.me/', is_external: 'on', nofollow: '' }, selected_icon: { value: 'fas fa-arrow-right', library: 'fa-solid' }, icon_align: 'right' })])])])]);

// ================= 9 · FOOTER =================
const footCSS =
  `selector{background:${T.ink};color:rgba(242,236,228,.6);padding-block:64px 30px!important;border-top:1px solid ${T.line}}` +
  `selector .rbfoot-grid{display:grid!important;grid-template-columns:1.5fr 1fr 1fr;gap:40px!important;padding-bottom:40px!important;border-bottom:1px solid rgba(242,236,228,.12)}` +
  `selector .rbfoot-c{gap:0!important;padding:0!important;width:auto!important}` +
  `selector .rblogo,selector .rblogo .elementor-heading-title{display:inline-flex;flex-direction:column;line-height:.82;font-weight:700;letter-spacing:-.03em;font-size:23px;color:#F4ECE0;margin:0 0 16px}` +
  `selector .rblogo b{padding-left:1.7em;color:${T.gold2};font-weight:700}` +
  `selector .rbfoot-c p{font-size:.93rem;line-height:1.6;color:rgba(242,236,228,.6);margin:0}` +
  `selector .rbfoot-ch,selector .rbfoot-ch .elementor-heading-title{font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:${T.gold2};margin:0 0 15px;font-weight:600}` +
  `selector .rbfoot-links a,selector .rbfoot-links p{display:block;font-size:.93rem;color:rgba(242,236,228,.62);margin-bottom:9px;transition:.25s}` +
  `selector .rbfoot-links a:hover{color:${T.gold2}}` +
  `selector .rbfoot-bottom{display:flex!important;flex-direction:row;justify-content:space-between;align-items:center;padding-top:24px!important;flex-wrap:wrap;gap:12px!important}` +
  `selector .rbfoot-bottom p{font-size:.84rem;color:rgba(242,236,228,.5);margin:0}` +
  `selector .rbfoot-bottom a:hover{color:${T.gold2}}` +
  `@media(max-width:980px){selector .rbfoot-grid{grid-template-columns:1fr!important;gap:28px!important}}`;
const footer = Cn(false, { content_width: 'full', css_classes: 'rb rbfooter', custom_css: footCSS }, [boxed([
  Cn(true, { content_width: 'full', css_classes: 'rbfoot-grid' }, [
    Cn(false, { content_width: 'full', css_classes: 'rbfoot-c', flex_direction: 'column', flex_align_items: 'flex-start' }, [
      WK('heading', 'rblogo', { title: 'Ronaldo<b>Barcelos</b>', header_size: 'div' }),
      WK('text-editor', '', { editor: '<p>Changeover Education<br>by CD Clínica Dermatológica · Leblon, Rio de Janeiro</p>' })]),
    Cn(false, { content_width: 'full', css_classes: 'rbfoot-c', flex_direction: 'column', flex_align_items: 'flex-start' }, [
      WK('heading', 'rbfoot-ch', { title: 'Contato', header_size: 'h4' }),
      WK('text-editor', 'rbfoot-links', { editor: `<a href="${IG}" target="_blank" rel="noopener">Instagram @ronaldo_barcelos_</a><a href="https://wa.me/">WhatsApp</a><a href="https://changeover.com.br" target="_blank" rel="noopener">changeover.com.br</a>` })]),
    Cn(false, { content_width: 'full', css_classes: 'rbfoot-c', flex_direction: 'column', flex_align_items: 'flex-start' }, [
      WK('heading', 'rbfoot-ch', { title: 'Créditos', header_size: 'h4' }),
      WK('text-editor', 'rbfoot-links', { editor: '<p>Realização: Changeover Education · CD Clínica</p><p>Produção: RJR · Syslater</p>' })])]),
  Cn(true, { content_width: 'full', css_classes: 'rbfoot-bottom', flex_direction: 'row' }, [
    WK('text-editor', '', { editor: '<p>© 2026 Changeover Education</p>' }),
    WK('text-editor', '', { editor: '<p><a href="#">Termos de uso</a> · <a href="#">Política de privacidade</a></p>' })])])]);

// ================= MONTAGEM =================
const scripts = Cn(false, { content_width: 'full', custom_css: 'selector{padding:0!important;min-height:0!important}' }, [
  html('<div class="rbprog"></div>', 'rbprog-w'),
  popOverlay, scriptW(coreJS, 'rbcore'), scriptW(popJS, 'rbpop-js')]);
const content = [nav, popNav, hero, who, proof, work, why, redes, cta, footer, scripts];
// Elementor lazy-carrega background e zera `background-image` com !important até a seção virar `.e-lazyloaded`
// (mata os gradientes CSS do hero e do card destaque). Todas as imagens aqui são <img>, então o opt-out é grátis.
content.forEach((s) => {
  const c = s.settings.css_classes || '';
  if (!c.includes('e-no-lazyload')) s.settings.css_classes = (c + ' e-no-lazyload').trim();
});

const doc = {
  content,
  page_settings: { background_color: T.bg, custom_css: PAGE_CSS },
  version: '0.4', title: 'Ronaldo Barcelos — Nativo', type: 'page',
};

// ---- validação (ids únicos, widget com widgetType) ----
let nodes = 0; const seen = new Set();
(function walk(a) {
  a.forEach((e) => {
    nodes++;
    if (seen.has(e.id)) throw new Error(`id duplicado: ${e.id}`);
    seen.add(e.id);
    if (e.elType === 'widget' && !e.widgetType) throw new Error('widget sem widgetType');
    walk(e.elements || []);
  });
})(content);
const out = new URL('./sites/rb/rb-nativo.json', import.meta.url).pathname;
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(doc));
let nat = 0, htm = 0;
(function w2(a) { a.forEach((e) => { if (e.elType === 'widget') { e.widgetType === 'html' ? htm++ : nat++; } w2(e.elements || []); }); })(content);
console.log(`OK -> ${out}`);
console.log(`seções topo: ${content.length} · nós: ${nodes} · ids únicos: ${seen.size} · nativo: ${Math.round(nat / (nat + htm) * 100)}% (${nat} nativos / ${htm} html)`);
