// Gerador FIEL do site Xpice como template JSON do Elementor (containers + widgets nativos).
// Roda por FORA do Elementor: emite sites/xpice/xpice-nativo.json -> importar via Modelos > Importar.
// Fonte da verdade dos valores: /Volumes/PortableSSD/XPICE/xpice-site (globals.css + componentes).
// Regra: seções de texto/layout = nativo editável; mapa/carrossel/pillars/animações = widget HTML.
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
// mapa-múndi real (paths por país, coords arredondadas) — igual ao OriginMap oficial
const WORLD = JSON.parse(readFileSync(new URL('./worldpaths-min.json', import.meta.url), 'utf8'));

const V = 'https://xpice-site.vercel.app';
const WPUP = 'https://xpiceconnections.com/wp-content/uploads/2026/07'; // TODOS os assets hospedados na Media Library do WP (nada externo/Vercel)
// fonte Geist embutida como data-URI (fica dentro do WP, sem depender do Vercel)
const GEIST = readFileSync(new URL('./assets/geist.datauri.txt', import.meta.url), 'utf8').trim();
// fotos subiram com sufixo do WP (colisão de nome) — mapa slug->arquivo real
const WPPHOTO = { field: 'field-4', warehouse: 'warehouse-5', facility: 'facility-4', grading: 'grading-6', meeting: 'meeting-1', expo: 'expo-3' };
const photoUrl = (s) => `${WPUP}/${WPPHOTO[s] || s}.jpg`;

// ---- ids únicos 8-hex (determinístico por contador) ----
let _n = 0;
const id = () => {
  let h = 0x811c9dc5 ^ (_n++);
  h = Math.imul(h ^ (h >>> 15), 0x2545f491) >>> 0;
  return (h.toString(16) + '00000000').slice(0, 8);
};

// ---- helpers de settings ----
const U = (size, unit = 'px') => ({ unit, size, sizes: [] });
const bx = (t, r, b, l) => ({ unit: 'px', top: `${t}`, right: `${r}`, bottom: `${b}`, left: `${l}`, isLinked: false });
// border-radius é controle de DIMENSÕES (4 cantos), NÃO slider. Usar rad(), nunca U().
const rad = (v) => ({ unit: 'px', top: `${v}`, right: `${v}`, bottom: `${v}`, left: `${v}`, isLinked: true });
const W = (widgetType, settings) => ({ id: id(), elType: 'widget', widgetType, settings, elements: [], isInner: false });
const Cn = (isInner, settings, elements) => ({ id: id(), elType: 'container', isInner, settings, elements });
const HUG = 'selector{width:auto!important;max-width:none;flex:0 0 auto!important}';

const T = {
  ink: '#0b1631', gold: '#c4922e', royal: '#0a3ea8', white: '#ffffff',
  navy900: '#071232', paper: '#f5f7fc', line: '#e4e8f2', slate: '#5a6784',
};

// ---- i18n (pt/en/es) — fonte da verdade: xpice-site/lib/i18n.js ----
const I18N = {
  pt: { nav: ['Plataforma', 'Produtos', 'Presença global', 'Como funciona'], ctaShort: 'Fale conosco',
    eyebrow: 'Compras internacionais · Ingredientes alimentícios',
    title: ['Importação e exportação', 'de ingredientes alimentícios', 'com inteligência de mercado', 'e previsibilidade.'],
    sub: 'A Xpice conecta a sua indústria aos melhores fornecedores de insumos alimentícios, com uma plataforma única que acompanha cada contêiner, cada preço e cada fornecedor.',
    cta: 'Falar com um especialista', mlabel: 'Nossa missão',
    mtxt: 'Conectar a sua indústria aos melhores fornecedores do mundo, com dados, rastreabilidade e previsibilidade em cada compra.', mlink: 'Conhecer a plataforma',
    num: { label: 'Em números', tA: 'A operação, em', tB: 'dados concretos.', sub: 'Cada compra internacional apoiada em rede de fornecedores homologados, dados de preço atualizados e rastreamento fim a fim, do embarque à sua linha de produção.' },
    kpi: [{ v: '2', l: 'Escritórios', d: 'Brasil e Portugal, presença nos dois lados da operação, na origem e no destino.' }, { v: 'Semanal', l: 'Relatório de preços', d: 'Panorama dos principais produtos toda semana, com histórico e tendência para negociar com base em dado.' }, { v: '100%', l: 'Cargas rastreadas', d: 'Cada contêiner acompanhado da origem ao destino, com status e posição em tempo real.' }, { v: '6+', l: 'Categorias homologadas', d: 'Especiarias, ervas, vegetais desidratados, aditivos e naturais, com fornecedores avaliados por desempenho.' }],
    prob: { eyebrow: 'O problema', ta: 'Comprar commodities no mercado internacional exige', tb: 'mais do que cotação.',
      text: 'Preços de especiarias mudam toda semana. Contêineres cruzam oceanos sem visibilidade. Fornecedores variam em qualidade, prazo e confiabilidade, e cada erro custa caro na sua linha de produção.',
      cards: [{ k: '01', t: 'Pagar acima do mercado', d: 'Sem histórico e tendência de preço, a decisão vira aposta.' }, { k: '02', t: 'Receber fora do padrão', d: 'Fornecedor não avaliado entrega qualidade inconstante.' }, { k: '03', t: 'Descobrir o atraso tarde', d: 'Sem visibilidade da carga, o problema aparece na produção.' }] } },
  en: { nav: ['Platform', 'Products', 'Global presence', 'How it works'], ctaShort: 'Contact us',
    eyebrow: 'International sourcing · Food ingredients',
    title: ['Import and export of', 'food ingredients', 'with market intelligence', 'and predictability.'],
    sub: 'Xpice connects your industry to the best suppliers of food ingredients, with a single platform that tracks every container, every price and every supplier.',
    cta: 'Talk to a specialist', mlabel: 'Our mission',
    mtxt: 'Connect your industry to the best suppliers worldwide, with data, traceability and predictability in every purchase.', mlink: 'Explore the platform',
    num: { label: 'By the numbers', tA: 'The operation, in', tB: 'concrete data.', sub: 'Every international purchase backed by a network of approved suppliers, up-to-date price data and end-to-end tracking, from shipment to your production line.' },
    kpi: [{ v: '2', l: 'Offices', d: 'Brazil and Portugal, a presence on both sides of the trade, at origin and destination.' }, { v: 'Weekly', l: 'Price report', d: 'An overview of the main products every week, with history and trend to negotiate on data.' }, { v: '100%', l: 'Tracked cargo', d: 'Every container followed from origin to destination, with real-time status and position.' }, { v: '6+', l: 'Approved categories', d: 'Spices, herbs, dehydrated vegetables, additives and natural products, with suppliers rated on performance.' }],
    prob: { eyebrow: 'The problem', ta: 'Buying commodities on the international market', tb: 'takes more than a quote.',
      text: 'Spice prices change every week. Containers cross oceans with no visibility. Suppliers vary in quality, lead time and reliability, and every mistake is costly on your production line.',
      cards: [{ k: '01', t: 'Paying above market', d: 'With no price history or trend, the decision becomes a bet.' }, { k: '02', t: 'Receiving off-spec', d: 'An unscored supplier delivers inconsistent quality.' }, { k: '03', t: 'Finding out late', d: 'With no cargo visibility, the problem shows up in production.' }] } },
  es: { nav: ['Plataforma', 'Productos', 'Presencia global', 'Cómo funciona'], ctaShort: 'Contacto',
    eyebrow: 'Compra internacional · Ingredientes alimentarios',
    title: ['Importación y exportación de', 'ingredientes alimentarios', 'con inteligencia de mercado', 'y previsibilidad.'],
    sub: 'Xpice conecta su industria con los mejores proveedores de insumos alimentarios, con una plataforma única que sigue cada contenedor, cada precio y cada proveedor.',
    cta: 'Hablar con un especialista', mlabel: 'Nuestra misión',
    mtxt: 'Conectar su industria con los mejores proveedores del mundo, con datos, trazabilidad y previsibilidad en cada compra.', mlink: 'Conocer la plataforma',
    num: { label: 'En números', tA: 'La operación, en', tB: 'datos concretos.', sub: 'Cada compra internacional respaldada por una red de proveedores homologados, datos de precio actualizados y seguimiento de punta a punta, del embarque a su línea de producción.' },
    kpi: [{ v: '2', l: 'Oficinas', d: 'Brasil y Portugal, presencia en ambos lados de la operación, en origen y destino.' }, { v: 'Semanal', l: 'Informe de precios', d: 'Panorama de los principales productos cada semana, con histórico y tendencia para negociar con datos.' }, { v: '100%', l: 'Carga rastreada', d: 'Cada contenedor seguido del origen al destino, con estado y posición en tiempo real.' }, { v: '6+', l: 'Categorías homologadas', d: 'Especias, hierbas, vegetales deshidratados, aditivos y naturales, con proveedores evaluados por desempeño.' }],
    prob: { eyebrow: 'El problema', ta: 'Comprar commodities en el mercado internacional', tb: 'exige más que una cotización.',
      text: 'Los precios de las especias cambian cada semana. Los contenedores cruzan océanos sin visibilidad. Los proveedores varían en calidad, plazo y fiabilidad, y cada error cuesta caro en su línea de producción.',
      cards: [{ k: '01', t: 'Pagar por encima del mercado', d: 'Sin histórico ni tendencia de precio, la decisión es una apuesta.' }, { k: '02', t: 'Recibir fuera de estándar', d: 'Un proveedor sin evaluación entrega calidad inconstante.' }, { k: '03', t: 'Enterarse tarde del retraso', d: 'Sin visibilidad de la carga, el problema aparece en producción.' }] } },
};
const LANG_FLAG = { pt: `${WPUP}/flag-br.png`, en: `${WPUP}/flag-gb.png`, es: `${WPUP}/flag-es.png` };
const LANG_LABEL = { pt: 'PT', en: 'EN', es: 'ES' };
const LANG_NAME = { pt: 'Português', en: 'English', es: 'Español' };
// widget que recebe uma classe (para o i18n switch achar o elemento)
const WK = (widgetType, key, settings) => W(widgetType, { ...settings, _css_classes: key });

// ================= FONT LOADER (vai no page_settings.custom_css — NÃO como widget, senão cria faixa branca no topo) =================
const PAGE_CSS = `@font-face{font-family:'Geist';src:url('${GEIST}') format('woff2');font-weight:100 900;font-display:swap}` +
  `.xnav a,.xnav .elementor-button{text-decoration:none!important}.xnav .elementor-button{box-shadow:none}` +
  `html{overflow-x:clip}body{overflow-x:visible}` + // clip só no html (não body) — clip no body quebra position:sticky dos cards; hidden faria body virar scroller
  `.xscroll{position:absolute!important;width:0;height:0;overflow:hidden}` +
  // estado scrolled do header (globals.css:166,190-197)
  `.xnav{transition:background .4s cubic-bezier(.22,1,.36,1),border-color .4s,box-shadow .4s;border-bottom:1px solid transparent}` +
  `.xnav.scrolled{background:rgba(255,255,255,.82)!important;-webkit-backdrop-filter:saturate(180%) blur(16px);backdrop-filter:saturate(180%) blur(16px);border-bottom:1px solid #e4e8f2}` +
  `.xnav.scrolled .xlinks{background:rgba(255,255,255,.7)!important;border-color:#e4e8f2!important}` +
  `.xnav.scrolled .x-nav0 .elementor-button,.xnav.scrolled .x-nav1 .elementor-button,.xnav.scrolled .x-nav2 .elementor-button,.xnav.scrolled .x-nav3 .elementor-button{color:#5a6784!important}` +
  `.xnav.scrolled .x-nav0 .elementor-button:hover,.xnav.scrolled .x-nav1 .elementor-button:hover,.xnav.scrolled .x-nav2 .elementor-button:hover,.xnav.scrolled .x-nav3 .elementor-button:hover{color:#0b1631!important;background:#eef3ff!important}` +
  `.xnav.scrolled .x-navcta .elementor-button{background:linear-gradient(180deg,#1650c8,#0a3ea8)!important;color:#fff!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.28),0 8px 20px -8px rgba(10,62,168,.5)!important}` +
  `.xnav.scrolled .x-navcta .elementor-button-icon,.xnav.scrolled .x-navcta .elementor-button-icon i,.xnav.scrolled .x-navcta .elementor-button-icon svg{color:#fff!important}` +
  `.xnav.scrolled .xlbtn{background:#fff!important;border-color:#e4e8f2!important;color:#5a6784!important}` +
  // botão com ícone: centraliza verticalmente texto vs ícone (wrapper flex vinha align-items:normal → texto colava no topo)
  `.elementor-button-content-wrapper{align-items:center}` +
  // arrow uniforme em TODOS os botões: seta ↗ (rotate -45) + slide diagonal no hover (ref: "Falar com um especialista")
  `.elementor-button-icon i,.elementor-button-icon svg{transform:none!important;transition:transform .35s cubic-bezier(.22,1,.36,1)!important}` +
  `.elementor-button:hover .elementor-button-icon i,.elementor-button:hover .elementor-button-icon svg{transform:rotate(45deg)!important}` +
  // ---- smooth scroll + reveal-on-scroll (blur/fade/rise por elemento; hero entra linha a linha) ----
  `html{scroll-behavior:smooth}html.lenis,html.lenis body{height:auto}.lenis.lenis-smooth{scroll-behavior:auto!important}.lenis.lenis-smooth [data-lenis-prevent]{overscroll-behavior:contain}.lenis.lenis-stopped{overflow:hidden}` +
  `.xrl-on .xrl{opacity:0;filter:blur(12px);transform:translateY(26px);transition:opacity .85s cubic-bezier(.22,1,.36,1),filter .85s cubic-bezier(.22,1,.36,1),transform .85s cubic-bezier(.22,1,.36,1)}` +
  `.xrl-on .xrl.xin{opacity:1;filter:blur(0);transform:none}` +
  `@media(prefers-reduced-motion:reduce){.xrl-on .xrl{opacity:1!important;filter:none!important;transform:none!important;transition:none!important}html{scroll-behavior:auto}}` +
  // ---- nav responsivo: DESKTOP = pill+cta+lang inline (header original); ≤860 = burger+popup ----
  `.xnav .xburger{display:none}` +
  `@media(max-width:860px){.xnav .xlinks{display:none!important}.xnav .elementor-widget-button.x-navcta{display:none!important}.xnav .xlang{display:none!important}.xnav .xburger{display:inline-flex!important}}` +
  // widget do toggle (só script) nunca ocupa espaço no header
  `.xpopjs{position:absolute!important;width:0!important;height:0!important;min-height:0!important;overflow:hidden!important;pointer-events:none;flex:0 0 0!important;margin:0!important;padding:0!important}` +
  `@media(max-width:640px){.e-con.e-con-boxed{padding-left:20px!important;padding-right:20px!important}.prodx{gap:12px!important}.xhero{padding-left:0!important;padding-right:0!important}.xhero>.e-con-inner,.xhero .e-con-inner{padding-left:14px!important;padding-right:14px!important}.xlead{padding-left:0!important;padding-right:0!important;max-width:none!important}` +
    `.x-eyebrow p{white-space:nowrap!important;font-size:clamp(9px,3vw,11px)!important;padding-left:12px!important;padding-right:12px!important}` +
    `.x-title .elementor-heading-title{font-size:clamp(18px,5.5vw,22px)!important;letter-spacing:-.03em;line-height:1.14}.x-title .htl{white-space:nowrap;display:block}.x-title{margin-top:12px!important}` +
    `.x-sub{margin-top:16px!important}.x-sub .elementor-widget-container,.x-sub p{font-size:clamp(13px,3.4vw,14.5px)!important;line-height:1.5!important}}` +
  // ---- pass mobile por seção ----
  `@media(max-width:640px){` +
    // Produtos: 1 coluna + cards em pilha "sticky" (stack ao rolar) + info SEMPRE visível (sem hover no mobile)
    `.prodx{grid-template-columns:1fr!important;gap:18px!important}` +
    `.prodx-card{position:sticky!important;top:74px!important;aspect-ratio:4/5;box-shadow:0 22px 44px -26px rgba(4,10,30,.7)}` +
    `.prodx-go{display:none!important}` +
    `.prodx-cap{display:none!important}` +
    // overlay vira painel de rodapé estático: título (h) + badges dos itens sobre gradiente
    `.prodx-hover{position:absolute!important;inset:auto 0 0 0!important;opacity:1!important;background:linear-gradient(180deg,rgba(7,18,50,0) 0%,rgba(6,14,40,.5) 42%,rgba(4,7,18,.93) 100%)!important;padding:22px 18px 20px!important;gap:12px!important;justify-content:flex-end}` +
    `.prodx-hover-t,.prodx-hover-t .elementor-heading-title{font-size:clamp(20px,5.8vw,25px)!important;line-height:1.08!important}` +
    `.prodx-chips .elementor-widget-container>ul,.prodx-chips ul{gap:7px!important}` +
    `.prodx-chips li{font-size:12px!important;padding:5px 11px!important}` +
    // Parceiros brasileiros: logos cabem dentro do card
    `.brz-partners{gap:12px}.brz-card{padding:22px 14px!important}.brz-logo img{max-width:100%!important;max-height:40px!important}` +
    // A plataforma: pilares 1 coluna + sticky stack
    `.pillars{grid-template-columns:1fr!important}` +
    `.pillars .pillar{position:sticky!important;top:74px!important;box-shadow:0 22px 44px -26px rgba(4,10,30,.35)}` +
    // Parceiros brasileiros: cards em sticky stack
    `.brz-partners .brz-card{position:sticky!important;top:74px!important}` +
    // Sobre · timeline: selo "a confirmar" quebra pra baixo (não sobrepõe o título)
    // trajetória vira tabela compacta: some a coluna de marco, números encolhem
    `.about-tl-row{grid-template-columns:9px 34px 46px 52px 68px!important;gap:6px!important;padding:9px 0!important}` +
    `.about-tl-row.is-nota .about-tl-t{grid-column:3/-1!important}` +
    `.about-tl-mk{display:none!important}` +
    `.about-tl-n{font-size:11px!important}.about-tl-c{font-size:8px!important;letter-spacing:.06em!important}` +
    `.about-tl-y{font-size:10px!important}` +
    // Presença/mapa: card do país estático abaixo do mapa; some o conector solto
    `.wmap-card{position:static!important;width:100%!important;right:auto!important;top:auto!important;margin-top:16px;box-shadow:0 12px 30px -16px rgba(5,20,44,.25)}.wmap-panel{min-height:auto!important}.wmap-connector{display:none!important}` +
  `}`;

// widget invisível com o handler de scroll (toggle .scrolled + troca logo branca<->escura)
const scrollJS = `(function(){function I(){var n=document.querySelector('.xnav');if(!n||n.__sc)return;n.__sc=1;var im=n.querySelector('.elementor-widget-image img');var W='${WPUP}/xpice-logo-white.png',D='${WPUP}/xpice-logo.png';if(im){im.removeAttribute('srcset');im.removeAttribute('sizes');im.removeAttribute('data-src');im.removeAttribute('data-srcset');im.loading='eager';im.decoding='sync';var pl=new Image();pl.src=D;}function o(){var sc=(window.scrollY||document.documentElement.scrollTop||0)>20;n.classList.toggle('scrolled',sc);if(im)im.src=sc?D:W;}window.addEventListener('scroll',o,{passive:true});o();}if(document.readyState!=='loading')I();else document.addEventListener('DOMContentLoaded',I);})();`;
const scrollWidget = W('html', { _css_classes: 'xscroll',
  html: `<script>${scrollJS.replace(/<\/script>/g, "<\\/script>")}</script>` });

// ================= NAV =================
const logo = W('image', { image: { url: `${WPUP}/xpice-logo-white.png`, source: 'url' }, image_size: 'full', align: 'left',
  height: U(32), width: U(119), _css_classes: 'xlogo', custom_css: 'selector .elementor-widget-container{text-align:left}selector img{height:32px;width:auto;margin:0}' });

// nav-links a: hover color #fff + bg rgba(255,255,255,.14) (globals.css:180). key = classe p/ i18n switch
const navLink = (t, href, key) => WK('button', key, { text: t, link: { url: href, is_external: '', nofollow: '' },
  background_color: 'rgba(0,0,0,0)', button_text_color: 'rgba(255,255,255,.82)',
  hover_color: '#ffffff', button_background_hover_color: 'rgba(255,255,255,.14)', border_radius: rad(100),
  text_padding: bx(8, 16, 8, 16), typography_typography: 'custom', typography_font_family: 'Geist',
  typography_font_size: U(14.5), typography_font_weight: '400', typography_letter_spacing: U(-0.012, 'em'),
  typography_line_height: U(1.55, 'em'),
  custom_css: 'selector .elementor-button{transition:background .25s cubic-bezier(.22,1,.36,1),color .25s cubic-bezier(.22,1,.36,1)}' });

const linksPill = Cn(true, { content_width: 'full', flex_direction: 'row', flex_gap: U(4), flex_align_items: 'center',
  padding: bx(6, 6, 6, 6), border_border: 'solid', border_width: bx(1, 1, 1, 1), border_color: 'rgba(255,255,255,.22)',
  border_radius: rad(100), background_background: 'classic', background_color: 'rgba(255,255,255,.10)', css_classes: 'xlinks', custom_css: HUG },
  [navLink('Plataforma', '#plataforma', 'x-nav0'), navLink('Produtos', '#produtos', 'x-nav1'),
   navLink('Presença global', '#presenca', 'x-nav2'), navLink('Como funciona', '#como-funciona', 'x-nav3')]);

// Nav CTA (globals.css:172,183-185): pill branca, box-shadow, seta ↗ sem círculo; hover bg royal-50 + ícone rotate45
const navCta = WK('button', 'x-navcta', { text: 'Fale conosco', link: { url: '#contato', is_external: '', nofollow: '' },
  selected_icon: { value: 'fas fa-arrow-right', library: 'fa-solid' }, icon_align: 'right',
  background_color: T.white, button_text_color: T.ink, border_radius: rad(100), text_padding: bx(0, 24, 0, 24),
  typography_typography: 'custom', typography_font_family: 'Geist', typography_font_size: U(14), typography_font_weight: '600',
  typography_letter_spacing: U(-0.01, 'em'),
  custom_css: 'selector .elementor-button{display:inline-flex;align-items:center;gap:9px;min-height:52px;box-shadow:0 6px 16px -8px rgba(4,16,50,0.35);transition:background .25s cubic-bezier(.22,1,.36,1),box-shadow .25s,transform .25s}' +
    'selector .elementor-button:hover{background:#eef3ff}' +
    'selector .elementor-button-icon{margin:0;background:none;color:#0b1631;transition:transform .35s cubic-bezier(.22,1,.36,1)}' +
    'selector .elementor-button-icon i,selector .elementor-button-icon svg{font-size:13px;width:14px;transform:rotate(-45deg)}' +
    'selector .elementor-button:hover .elementor-button-icon i,selector .elementor-button:hover .elementor-button-icon svg{transform:rotate(-45deg) translate(3px,-3px)}' });

// lang dropdown FUNCIONAL (globals.css:181-207 + Nav.js): botão + menu 3 idiomas + JS que troca hero/nav in-place
const langMenuHTML = ['pt', 'en', 'es'].map((l) => `<a class="xlopt" data-l="${l}"${l === 'pt' ? ' data-active="true"' : ''}><img class="xlflag" src="${LANG_FLAG[l]}" alt=""><span>${LANG_NAME[l]}</span><svg class="xlcheck" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12l5 5L20 6" stroke-linecap="round" stroke-linejoin="round"/></svg></a>`).join('');
// i18n das seções 4–14 (pt/en/es) — consumido pelo apply() central + Steps/Origens (via window.__XS)
const SEC = {
  pt: {
    sol: { eyebrow: 'A solução', ta: 'Inteligência de compra', tb: 'em cada operação.', kicker: 'Sua equipe de compras decide com informação. Sua produção recebe com previsibilidade.', cta: 'Falar com um especialista', items: [{ t: 'Fornecedores qualificados', d: 'Rede homologada por desempenho real.' }, { t: 'Dados de mercado', d: 'Preço atualizado, com histórico e tendência.' }, { t: 'Acompanhamento completo', d: 'Da origem ao destino, sem pontos cegos.' }, { t: 'Melhor momento de compra', d: 'Indicadores e critérios de venda apontam a melhor data para comprar.' }] },
    how: { eyebrow: 'Como funciona', ta: 'Do primeiro contato', tb: 'ao contêiner entregue.', badge: 'Fluxo em validação', steps: [{ k: 'Etapa 1', t: 'Diagnóstico de compras', d: 'Entendemos o que sua empresa compra, em que volume e com quais critérios.' }, { k: 'Etapa 2', t: 'Cotação com dados', d: 'Apresentamos fornecedores homologados, com preços contextualizados pelo relatório de mercado.' }, { k: 'Etapa 3', t: 'Fechamento e embarque', d: 'Negociação, contrato e embarque com acompanhamento completo pela plataforma.' }, { k: 'Etapa 4', t: 'Entrega e acompanhamento', d: 'Sua equipe acompanha a carga até o destino e recebe relatórios semanais para as próximas compras.' }] },
    plat: { eyebrow: 'A plataforma', ta: 'Uma plataforma própria para', tb: 'acompanhar cada etapa da sua compra.', cta: 'Acessar a plataforma', pillars: [{ t: 'Rastreamento de contêineres', d: 'Acompanhe a posição e o status de cada carga em tempo real. Sua equipe sabe onde o produto está e quando chega, sem depender de e-mails e ligações.', metric: 'Cada evento do contêiner normalizado em marcos rastreáveis, atualizado em minutos.' }, { t: 'Relatório semanal de preços', d: 'Receba toda semana o panorama de preços dos principais produtos. Compare, planeje e negocie com base em dados de mercado, com histórico e tendência.', metric: 'Panorama semanal com histórico e tendência dos produtos que você compra.' }, { t: 'Scoring de fornecedores', d: 'Cada fornecedor é avaliado por desempenho: qualidade, prazo e consistência. Você compra de quem entrega, com critérios claros e mensuráveis.', metric: 'Qualidade, prazo e consistência em um índice claro e comparável.' }] },
    prod: { eyebrow: 'Produtos', ta: 'As linhas de', tb: 'produtos que trabalhamos.', text: 'Trabalhamos com uma alta variedade de ingredientes e produtos alimentícios do mercado internacional. Cada categoria conta com fornecedores homologados e dados de preço atualizados semanalmente.', cats: [{ t: 'Frutas secas', items: ['Ameixa', 'Semente de abóbora'] }, { t: 'Especiarias', items: ['Alho', 'Cebola', 'Canela', 'Orégano', 'Cominho', 'Mostarda', 'Sal rosa do Himalaia', 'Gengibre'] }, { t: 'Ervas', items: ['Salsa', 'Tomilho', 'Camomila', 'Erva-doce'] }, { t: 'Vegetais desidratados', items: ['Tomate', 'Cenoura', 'Pimentão', 'Beterraba'] }, { t: 'Aditivos', items: ['Goma guar', 'Glutamato monossódico'] }, { t: 'Naturais', items: ['Funghi', 'Açúcar de coco', 'Coco ralado', 'Farinha de coco', 'Leite de coco em pó'] }], bze: 'Produtos brasileiros', bza: 'Parceiros na', bzb: 'origem.', bzt: 'No Brasil, trabalhamos lado a lado com produtores de referência para levar o melhor da origem ao mercado internacional.', tags: ['Cacau', 'Pimenta-do-reino'] },
    orig: { eyebrow: 'Presença global', ta: 'Da origem à', tb: 'sua linha de produção.', text: 'Mais de 150 produtos em 15 países, com escritórios no Brasil e em Portugal. Selecione uma origem no mapa e veja as linhas e os produtos que trabalhamos em cada mercado.', status: '15 países · 150+ produtos', legendA: 'Origem ativa', legendO: 'Demais países', linesL: 'Linhas', itemsL: 'Produtos', note: 'Cobertura ilustrativa, origens em expansão.', countries: [{ c: 'Brasil', desc: 'Origem e relacionamento direto com produtores, do campo ao contêiner.', cats: ['Especiarias', 'Naturais', 'Frutas secas'], items: ['Pimenta-do-reino', 'Cacau', 'Açúcar de coco', 'Gengibre'] }, { c: 'Índia', desc: 'Especiarias e ervas de referência mundial, com escala e variedade.', cats: ['Especiarias', 'Ervas', 'Aditivos'], items: ['Cominho', 'Gengibre', 'Camomila', 'Goma guar', 'Erva-doce'] }, { c: 'China', desc: 'Maior polo de vegetais desidratados e aditivos, com escala e regularidade.', cats: ['Vegetais desidratados', 'Especiarias', 'Aditivos'], items: ['Alho', 'Cebola', 'Semente de abóbora', 'Glutamato monossódico'] }, { c: 'Vietnã', desc: 'Um dos maiores polos de especiarias do sudeste asiático.', cats: ['Especiarias', 'Naturais'], items: ['Pimenta-do-reino', 'Canela', 'Coco ralado'] }, { c: 'Indonésia', desc: 'Arquipélago de especiarias e produtos naturais de alto valor.', cats: ['Especiarias', 'Naturais'], items: ['Canela', 'Coco ralado', 'Leite de coco em pó', 'Farinha de coco'] }, { c: 'Sri Lanka', desc: 'Especiarias e ervas premium reconhecidas pela qualidade.', cats: ['Especiarias', 'Ervas'], items: ['Canela', 'Coco ralado', 'Erva-doce'] }, { c: 'Peru', desc: 'Produtos naturais e frutas secas dos Andes.', cats: ['Naturais', 'Frutas secas'], items: ['Gengibre', 'Semente de abóbora', 'Ameixa'] }, { c: 'Turquia', desc: 'Ponte entre Europa e Ásia para vegetais desidratados e especiarias.', cats: ['Vegetais desidratados', 'Especiarias', 'Frutas secas'], items: ['Tomate', 'Pimentão', 'Orégano', 'Cominho', 'Ameixa'] }, { c: 'Madagascar', desc: 'Produtos naturais de origem sustentável com qualidade e rastreabilidade.', cats: ['Especiarias', 'Naturais'], items: ['Canela', 'Gengibre', 'Coco ralado'] }, { c: 'Canadá', desc: 'Origem de referência em mostarda e grãos especiais do hemisfério norte.', cats: ['Especiarias'], items: ['Mostarda'] }] },
    glob: { eyebrow: 'Presença global', ta: 'Operação no Brasil', tb: 'e na Europa.', text: 'Com escritórios no Brasil e em Portugal, a Xpice Connections acompanha os principais mercados de origem e destino, e mantém relacionamento direto com fornecedores e compradores nos dois lados da operação.', offices: [{ city: 'Brasil', role: 'Mercado interno de pimenta e cacau' }, { city: 'Portugal', role: 'Mercado internacional de outros produtos alimentícios' }], stats: [{ v: '15 países', l: 'com atuação' }, { v: '200+ parceiros', l: 'comerciais ativos' }, { v: '4 continentes', l: 'Exportações para' }] },
    about: { eyebrow: 'Sobre a Xpice', ta: 'Trajetória, feiras', tb: 'e time.', badge: 'Time em atualização', histLbl: 'História', histTxt: 'Começamos em 2009 no mercado brasileiro. Em 2017 vieram as primeiras importações e, em novembro de 2018, o escritório em Portugal abriu a operação europeia. Para 2026, a meta é ultrapassar US$ 11 milhões.', mile: [{ t: 'Início no mercado brasileiro', b: '' }, { t: 'Primeiras importações', b: '' }, { t: 'Escritório em Portugal', b: 'nov' }, { t: 'Meta de mais de US$ 11 milhões', b: 'meta' }], fairsLbl: 'Feiras e eventos', fairsTxt: 'Presença nas principais feiras internacionais de alimentos e ingredientes: SIAL, Food Ingredients, Anuga e Fispal.', fairs: ['SIAL', 'Food Ingredients', 'Anuga', 'Fispal'], teamLbl: 'Equipe', teamTxt: 'Pessoas que conectam origem e destino, dos produtores à sua linha de produção.', members: [{ n: 'Nome · a confirmar', r: 'Cargo · a confirmar' }, { n: 'Nome · a confirmar', r: 'Cargo · a confirmar' }, { n: 'Nome · a confirmar', r: 'Cargo · a confirmar' }, { n: 'Nome · a confirmar', r: 'Cargo · a confirmar' }] },
    faq: { eyebrow: 'Perguntas frequentes', ta: 'Perguntas', tb: 'frequentes', sub: 'Respostas claras sobre a operação, a plataforma e os produtos.', items: [{ q: 'Quais produtos a Xpice negocia?', a: 'Trabalhamos com mais de 150 produtos em 15 países diferentes, nas linhas de especiarias, ervas, vegetais desidratados, aditivos e produtos naturais. Cada categoria conta com fornecedores homologados.' }, { q: 'Como funciona o rastreamento de contêineres?', a: 'Cada carga é acompanhada em tempo real na plataforma, com eventos normalizados em marcos rastreáveis. Sua equipe sabe onde o produto está e quando chega, sem depender de e-mails e ligações.' }, { q: 'Com que frequência recebo o relatório de preços?', a: 'O relatório é semanal e cobre os principais produtos, com histórico e tendência, para você comparar, planejar e negociar com base em dados.' }, { q: 'Como os fornecedores são avaliados?', a: 'Cada fornecedor recebe um score de desempenho por qualidade, prazo e consistência. Você compra de quem entrega, com critérios claros e mensuráveis.' }] },
    ins: { eyebrow: 'Conteúdo', ta: 'Da origem ao destino,', tb: 'por dentro da operação.', badge: 'Conteúdo em preparação', showAll: 'Ver todos', items: [{ tag: 'Origem', title: 'Como avaliamos uma safra ainda na origem' }, { tag: 'Qualidade', title: 'O que separa um lote homologado de um comum' }, { tag: 'Logística', title: 'O caminho do contêiner até a sua fábrica' }] },
    fcta: { title: 'Traga inteligência de mercado para a próxima compra da sua empresa.', text: 'Fale com um especialista da Xpice Connections e conheça a plataforma: rastreamento de contêineres, relatório semanal de preços e scoring de fornecedores, aplicados à realidade da sua operação.', cta: 'Agendar conversa', cta2: 'Receber o relatório semanal' },
    foot: { tagline: 'A camada de dados da compra internacional de especiarias.', contact: 'Contato', rights: 'Todos os direitos reservados.', menu: 'Menu', lang: 'Idioma', links: ['Plataforma', 'Produtos', 'Presença global', 'Como funciona', 'Marca'] } },
  en: {
    sol: { eyebrow: 'The solution', ta: 'Sourcing intelligence in', tb: 'every operation.', kicker: 'Your sourcing team decides with information. Your production receives with predictability.', cta: 'Talk to a specialist', items: [{ t: 'Qualified suppliers', d: 'A network approved by real performance.' }, { t: 'Market data', d: 'Up-to-date prices, with history and trend.' }, { t: 'Full tracking', d: 'Origin to destination, with no blind spots.' }, { t: 'Best time to buy', d: 'Sell criteria and indicators point to the best date to purchase.' }] },
    how: { eyebrow: 'How it works', ta: 'From first contact', tb: 'to delivered container.', badge: 'Flow under validation', steps: [{ k: 'Step 1', t: 'Sourcing diagnosis', d: 'We understand what your company buys, in what volume and with what criteria.' }, { k: 'Step 2', t: 'Data-backed quoting', d: 'We present approved suppliers, with prices contextualized by the market report.' }, { k: 'Step 3', t: 'Closing and shipping', d: 'Negotiation, contract and shipping, fully tracked on the platform.' }, { k: 'Step 4', t: 'Delivery and follow-up', d: 'Your team follows the cargo to destination and gets weekly reports for the next purchases.' }] },
    plat: { eyebrow: 'The platform', ta: 'A dedicated platform to', tb: 'follow every stage of your purchase.', cta: 'Access the platform', pillars: [{ t: 'Container tracking', d: 'Follow the position and status of every shipment in real time. Your team knows where the product is and when it arrives, no emails or phone calls needed.', metric: 'Every container event normalized into trackable milestones, updated in minutes.' }, { t: 'Weekly price report', d: 'Get the price overview of the main products every week. Compare, plan and negotiate based on market data, with history and trend.', metric: 'A weekly overview with history and trend for the products you buy.' }, { t: 'Supplier scoring', d: 'Every supplier is rated on performance: quality, lead time and consistency. You buy from those who deliver, with clear, measurable criteria.', metric: 'Quality, lead time and consistency in one clear, comparable index.' }] },
    prod: { eyebrow: 'Products', ta: 'The product lines', tb: 'we work with.', text: 'We work with a wide variety of food ingredients and products from the international market. Each category has approved suppliers and price data updated weekly.', cats: [{ t: 'Dried fruits', items: ['Prune', 'Pumpkin seed'] }, { t: 'Spices', items: ['Garlic', 'Onion', 'Cinnamon', 'Oregano', 'Cumin', 'Mustard', 'Himalayan pink salt', 'Ginger'] }, { t: 'Herbs', items: ['Parsley', 'Thyme', 'Chamomile', 'Fennel'] }, { t: 'Dehydrated vegetables', items: ['Tomato', 'Carrot', 'Bell pepper', 'Beetroot'] }, { t: 'Additives', items: ['Guar gum', 'Monosodium glutamate'] }, { t: 'Natural', items: ['Mushroom', 'Coconut sugar', 'Grated coconut', 'Coconut flour', 'Coconut milk powder'] }], bze: 'Brazilian products', bza: 'Partners at', bzb: 'the source.', bzt: 'In Brazil, we work side by side with leading producers to bring the best of the origin to the international market.', tags: ['Cocoa', 'Black pepper'] },
    orig: { eyebrow: 'Global presence', ta: 'From origin to', tb: 'your production line.', text: 'More than 150 products across 15 countries, with offices in Brazil and Portugal. Select an origin on the map and see the lines and products we source in each market.', status: '15 countries · 150+ products', legendA: 'Active origin', legendO: 'Other countries', linesL: 'Product lines', itemsL: 'Products', note: 'Illustrative coverage, origins expanding.', countries: [{ c: 'Brazil', desc: 'Origin and direct relationships with growers, from field to container.', cats: ['Spices', 'Natural', 'Dried fruits'], items: ['Black pepper', 'Cocoa', 'Coconut sugar', 'Ginger'] }, { c: 'India', desc: 'World-reference spices and herbs, with scale and variety.', cats: ['Spices', 'Herbs', 'Additives'], items: ['Cumin', 'Ginger', 'Chamomile', 'Guar gum', 'Fennel'] }, { c: 'China', desc: 'The largest hub for dehydrated vegetables and additives, with scale and consistency.', cats: ['Dehydrated vegetables', 'Spices', 'Additives'], items: ['Garlic', 'Onion', 'Pumpkin seed', 'Monosodium glutamate'] }, { c: 'Vietnam', desc: 'One of the largest spice hubs in Southeast Asia.', cats: ['Spices', 'Natural'], items: ['Black pepper', 'Cinnamon', 'Desiccated coconut'] }, { c: 'Indonesia', desc: 'An archipelago of spices and high-value natural products.', cats: ['Spices', 'Natural'], items: ['Cinnamon', 'Desiccated coconut', 'Coconut milk powder', 'Coconut flour'] }, { c: 'Sri Lanka', desc: 'Premium spices and herbs recognized for their quality.', cats: ['Spices', 'Herbs'], items: ['Cinnamon', 'Desiccated coconut', 'Fennel'] }, { c: 'Peru', desc: 'Natural products and dried fruits from the Andes.', cats: ['Natural', 'Dried fruits'], items: ['Ginger', 'Pumpkin seed', 'Prune'] }, { c: 'Turkey', desc: 'A bridge between Europe and Asia for dehydrated vegetables and spices.', cats: ['Dehydrated vegetables', 'Spices', 'Dried fruits'], items: ['Tomato', 'Bell pepper', 'Oregano', 'Cumin', 'Prune'] }, { c: 'Madagascar', desc: 'Sustainably sourced natural products with quality and traceability.', cats: ['Spices', 'Natural'], items: ['Cinnamon', 'Ginger', 'Desiccated coconut'] }, { c: 'Canada', desc: 'A reference origin for mustard and specialty grains from the northern hemisphere.', cats: ['Spices'], items: ['Mustard'] }] },
    glob: { eyebrow: 'Global presence', ta: 'Operating in Brazil', tb: 'and Europe.', text: 'With offices in Brazil and Portugal, Xpice Connections follows the main origin and destination markets, keeping direct relationships with suppliers and buyers on both sides of the operation.', offices: [{ city: 'Brazil', role: 'Domestic market for pepper and cocoa' }, { city: 'Portugal', role: 'International market for other food products' }], stats: [{ v: '15 countries', l: 'of operation' }, { v: '200+ partners', l: 'active commercial' }, { v: '4 continents', l: 'Exports to' }] },
    about: { eyebrow: 'About Xpice', ta: 'Journey, trade shows', tb: 'and team.', badge: 'Team being updated', histLbl: 'History', histTxt: 'We started in 2009 in the Brazilian market. In 2017 came the first imports and, in November 2018, the office in Portugal opened the European operation. For 2026, the goal is to pass US$ 11 million.', mile: [{ t: 'Start in the Brazilian market', b: '' }, { t: 'First imports', b: '' }, { t: 'Office in Portugal', b: 'nov' }, { t: 'Goal of over US$ 11 million', b: 'goal' }], fairsLbl: 'Trade shows', fairsTxt: 'Present at the main international food and ingredient trade shows: SIAL, Food Ingredients, Anuga and Fispal.', fairs: ['SIAL', 'Food Ingredients', 'Anuga', 'Fispal'], teamLbl: 'Team', teamTxt: 'People who connect origin and destination, from growers to your production line.', members: [{ n: 'Name · to confirm', r: 'Role · to confirm' }, { n: 'Name · to confirm', r: 'Role · to confirm' }, { n: 'Name · to confirm', r: 'Role · to confirm' }, { n: 'Name · to confirm', r: 'Role · to confirm' }] },
    faq: { eyebrow: 'Frequently asked questions', ta: 'Frequently asked', tb: 'questions', sub: 'Clear answers about the operation, the platform and the products.', items: [{ q: 'Which products does Xpice trade?', a: 'We work with more than 150 products across 15 countries, in the lines of spices, herbs, dehydrated vegetables, additives and natural products. Each category has approved suppliers.' }, { q: 'How does container tracking work?', a: 'Every shipment is followed in real time on the platform, with events normalized into trackable milestones. Your team knows where the product is and when it arrives, no emails or calls needed.' }, { q: 'How often do I get the price report?', a: 'The report is weekly and covers the main products, with history and trend, so you can compare, plan and negotiate based on data.' }, { q: 'How are suppliers scored?', a: 'Every supplier gets a performance score on quality, lead time and consistency. You buy from those who deliver, with clear, measurable criteria.' }] },
    ins: { eyebrow: 'Insights', ta: 'From origin to destination,', tb: 'inside the operation.', badge: 'Content in preparation', showAll: 'View all', items: [{ tag: 'Origin', title: 'How we assess a harvest at the source' }, { tag: 'Quality', title: 'What sets an approved lot apart from a common one' }, { tag: 'Logistics', title: "The container's path to your factory" }] },
    fcta: { title: "Bring market intelligence to your company's next purchase.", text: "Talk to an Xpice Connections specialist and see the platform: container tracking, weekly price report and supplier scoring, applied to your operation's reality.", cta: 'Schedule a call', cta2: 'Get the weekly report' },
    foot: { tagline: 'The data layer of international spice sourcing.', contact: 'Contact', rights: 'All rights reserved.', menu: 'Menu', lang: 'Language', links: ['Platform', 'Products', 'Global presence', 'How it works', 'Brand'] } },
  es: {
    sol: { eyebrow: 'La solución', ta: 'Inteligencia de compra', tb: 'en cada operación.', kicker: 'Su equipo de compras decide con información. Su producción recibe con previsibilidad.', cta: 'Hablar con un especialista', items: [{ t: 'Proveedores cualificados', d: 'Una red homologada por desempeño real.' }, { t: 'Datos de mercado', d: 'Precio actualizado, con histórico y tendencia.' }, { t: 'Seguimiento completo', d: 'Del origen al destino, sin puntos ciegos.' }, { t: 'Mejor momento de compra', d: 'Indicadores y criterios de venta señalan la mejor fecha para comprar.' }] },
    how: { eyebrow: 'Cómo funciona', ta: 'Del primer contacto', tb: 'al contenedor entregado.', badge: 'Flujo en validación', steps: [{ k: 'Etapa 1', t: 'Diagnóstico de compras', d: 'Entendemos qué compra su empresa, en qué volumen y con qué criterios.' }, { k: 'Etapa 2', t: 'Cotización con datos', d: 'Presentamos proveedores homologados, con precios contextualizados por el informe de mercado.' }, { k: 'Etapa 3', t: 'Cierre y embarque', d: 'Negociación, contrato y embarque con seguimiento completo en la plataforma.' }, { k: 'Etapa 4', t: 'Entrega y seguimiento', d: 'Su equipo sigue la carga hasta el destino y recibe informes semanales para las próximas compras.' }] },
    plat: { eyebrow: 'La plataforma', ta: 'Una plataforma propia para', tb: 'seguir cada etapa de su compra.', cta: 'Acceder a la plataforma', pillars: [{ t: 'Seguimiento de contenedores', d: 'Siga la posición y el estado de cada carga en tiempo real. Su equipo sabe dónde está el producto y cuándo llega, sin depender de correos ni llamadas.', metric: 'Cada evento del contenedor normalizado en hitos rastreables, actualizado en minutos.' }, { t: 'Informe semanal de precios', d: 'Reciba cada semana el panorama de precios de los principales productos. Compare, planifique y negocie con datos de mercado, con histórico y tendencia.', metric: 'Un panorama semanal con histórico y tendencia de los productos que compra.' }, { t: 'Scoring de proveedores', d: 'Cada proveedor se evalúa por desempeño: calidad, plazo y consistencia. Usted compra a quien entrega, con criterios claros y medibles.', metric: 'Calidad, plazo y consistencia en un índice claro y comparable.' }] },
    prod: { eyebrow: 'Productos', ta: 'Las líneas de productos', tb: 'con las que trabajamos.', text: 'Trabajamos con una gran variedad de ingredientes y productos alimentarios del mercado internacional. Cada categoría cuenta con proveedores homologados y datos de precio actualizados semanalmente.', cats: [{ t: 'Frutas secas', items: ['Ciruela', 'Semilla de calabaza'] }, { t: 'Especias', items: ['Ajo', 'Cebolla', 'Canela', 'Orégano', 'Comino', 'Mostaza', 'Sal rosa del Himalaya', 'Jengibre'] }, { t: 'Hierbas', items: ['Perejil', 'Tomillo', 'Manzanilla', 'Hinojo'] }, { t: 'Vegetales deshidratados', items: ['Tomate', 'Zanahoria', 'Pimentón', 'Remolacha'] }, { t: 'Aditivos', items: ['Goma guar', 'Glutamato monosódico'] }, { t: 'Naturales', items: ['Funghi', 'Azúcar de coco', 'Coco rallado', 'Harina de coco', 'Leche de coco en polvo'] }], bze: 'Productos brasileños', bza: 'Socios en', bzb: 'el origen.', bzt: 'En Brasil, trabajamos codo a codo con productores de referencia para llevar lo mejor del origen al mercado internacional.', tags: ['Cacao', 'Pimienta negra'] },
    orig: { eyebrow: 'Presencia global', ta: 'Del origen a su', tb: 'línea de producción.', text: 'Más de 150 productos en 15 países, con oficinas en Brasil y Portugal. Seleccione un origen en el mapa y vea las líneas y los productos que trabajamos en cada mercado.', status: '15 países · 150+ productos', legendA: 'Origen activo', legendO: 'Otros países', linesL: 'Líneas', itemsL: 'Productos', note: 'Cobertura ilustrativa, orígenes en expansión.', countries: [{ c: 'Brasil', desc: 'Origen y relación directa con productores, del campo al contenedor.', cats: ['Especias', 'Naturales', 'Frutas secas'], items: ['Pimienta negra', 'Cacao', 'Azúcar de coco', 'Jengibre'] }, { c: 'India', desc: 'Especias y hierbas de referencia mundial, con escala y variedad.', cats: ['Especias', 'Hierbas', 'Aditivos'], items: ['Comino', 'Jengibre', 'Manzanilla', 'Goma guar', 'Hinojo'] }, { c: 'China', desc: 'El mayor polo de vegetales deshidratados y aditivos, con escala y regularidad.', cats: ['Vegetales deshidratados', 'Especias', 'Aditivos'], items: ['Ajo', 'Cebolla', 'Semilla de calabaza', 'Glutamato monosódico'] }, { c: 'Vietnam', desc: 'Uno de los mayores polos de especias del sudeste asiático.', cats: ['Especias', 'Naturales'], items: ['Pimienta negra', 'Canela', 'Coco rallado'] }, { c: 'Indonesia', desc: 'Archipiélago de especias y productos naturales de alto valor.', cats: ['Especias', 'Naturales'], items: ['Canela', 'Coco rallado', 'Leche de coco en polvo', 'Harina de coco'] }, { c: 'Sri Lanka', desc: 'Especias y hierbas premium reconocidas por su calidad.', cats: ['Especias', 'Hierbas'], items: ['Canela', 'Coco rallado', 'Hinojo'] }, { c: 'Perú', desc: 'Productos naturales y frutas secas de los Andes.', cats: ['Naturales', 'Frutas secas'], items: ['Jengibre', 'Semilla de calabaza', 'Ciruela pasa'] }, { c: 'Turquía', desc: 'Puente entre Europa y Asia para vegetales deshidratados y especias.', cats: ['Vegetales deshidratados', 'Especias', 'Frutas secas'], items: ['Tomate', 'Pimiento', 'Orégano', 'Comino', 'Ciruela pasa'] }, { c: 'Madagascar', desc: 'Productos naturales de origen sostenible con calidad y trazabilidad.', cats: ['Especias', 'Naturales'], items: ['Canela', 'Jengibre', 'Coco rallado'] }, { c: 'Canadá', desc: 'Origen de referencia en mostaza y granos especiales del hemisferio norte.', cats: ['Especias'], items: ['Mostaza'] }] },
    glob: { eyebrow: 'Presencia global', ta: 'Operación en Brasil', tb: 'y Europa.', text: 'Con oficinas en Brasil y Portugal, Xpice Connections sigue los principales mercados de origen y destino, y mantiene relación directa con proveedores y compradores en ambos lados de la operación.', offices: [{ city: 'Brasil', role: 'Mercado interno de pimienta y cacao' }, { city: 'Portugal', role: 'Mercado internacional de otros productos alimentarios' }], stats: [{ v: '15 países', l: 'con actuación' }, { v: '200+ socios', l: 'comerciales activos' }, { v: '4 continentes', l: 'Exportaciones a' }] },
    about: { eyebrow: 'Sobre Xpice', ta: 'Trayectoria, ferias', tb: 'y equipo.', badge: 'Equipo en actualización', histLbl: 'Historia', histTxt: 'Empezamos en 2009 en el mercado brasileño. En 2017 llegaron las primeras importaciones y, en noviembre de 2018, la oficina en Portugal abrió la operación europea. Para 2026, la meta es superar los US$ 11 millones.', mile: [{ t: 'Inicio en el mercado brasileño', b: '' }, { t: 'Primeras importaciones', b: '' }, { t: 'Oficina en Portugal', b: 'nov' }, { t: 'Meta de más de US$ 11 millones', b: 'meta' }], fairsLbl: 'Ferias y eventos', fairsTxt: 'Presencia en las principales ferias internacionales de alimentos e ingredientes: SIAL, Food Ingredients, Anuga y Fispal.', fairs: ['SIAL', 'Food Ingredients', 'Anuga', 'Fispal'], teamLbl: 'Equipo', teamTxt: 'Personas que conectan origen y destino, de los productores a su línea de producción.', members: [{ n: 'Nombre · a confirmar', r: 'Cargo · a confirmar' }, { n: 'Nombre · a confirmar', r: 'Cargo · a confirmar' }, { n: 'Nombre · a confirmar', r: 'Cargo · a confirmar' }, { n: 'Nombre · a confirmar', r: 'Cargo · a confirmar' }] },
    faq: { eyebrow: 'Preguntas frecuentes', ta: 'Preguntas', tb: 'frecuentes', sub: 'Respuestas claras sobre la operación, la plataforma y los productos.', items: [{ q: '¿Qué productos negocia Xpice?', a: 'Trabajamos con más de 150 productos en 15 países diferentes, en las líneas de especias, hierbas, vegetales deshidratados, aditivos y productos naturales. Cada categoría cuenta con proveedores homologados.' }, { q: '¿Cómo funciona el seguimiento de contenedores?', a: 'Cada carga se sigue en tiempo real en la plataforma, con eventos normalizados en hitos rastreables. Su equipo sabe dónde está el producto y cuándo llega, sin depender de correos ni llamadas.' }, { q: '¿Con qué frecuencia recibo el informe de precios?', a: 'El informe es semanal y cubre los principales productos, con histórico y tendencia, para que compare, planifique y negocie con datos.' }, { q: '¿Cómo se evalúa a los proveedores?', a: 'Cada proveedor recibe un score de desempeño por calidad, plazo y consistencia. Usted compra a quien entrega, con criterios claros y medibles.' }] },
    ins: { eyebrow: 'Contenido', ta: 'Del origen al destino, por', tb: 'dentro de la operación.', badge: 'Contenido en preparación', showAll: 'Ver todos', items: [{ tag: 'Origen', title: 'Cómo evaluamos una cosecha en el origen' }, { tag: 'Calidad', title: 'Qué separa un lote homologado de uno común' }, { tag: 'Logística', title: 'El camino del contenedor hasta su fábrica' }] },
    fcta: { title: 'Lleve inteligencia de mercado a la próxima compra de su empresa.', text: 'Hable con un especialista de Xpice Connections y conozca la plataforma: seguimiento de contenedores, informe semanal de precios y scoring de proveedores, aplicados a la realidad de su operación.', cta: 'Agendar una charla', cta2: 'Recibir el informe semanal' },
    foot: { tagline: 'La capa de datos de la compra internacional de especias.', contact: 'Contacto', rights: 'Todos los derechos reservados.', menu: 'Menú', lang: 'Idioma', links: ['Plataforma', 'Productos', 'Presencia global', 'Cómo funciona', 'Marca'] } } };

// JS do switcher em base64 (roda via img onerror — sem colisão de aspas, funciona mesmo com innerHTML/sanitização de <script>)
const langJS = `function init(){if(window.__xlangInit)return;window.__xlangInit=1;if(document.body.classList.contains('elementor-editor-active'))return;var D=${JSON.stringify(I18N)};var S=${JSON.stringify(SEC)};var F=${JSON.stringify(LANG_FLAG)},L=${JSON.stringify(LANG_LABEL)};function txt(sel,v){document.querySelectorAll(sel).forEach(function(e){var t=e.querySelector(".elementor-button-text")||e.querySelector("p")||e;t.textContent=v;});}function apply(l){var d=D[l];if(!d)return;for(var i=0;i<4;i++)txt(".x-nav"+i,d.nav[i]);txt(".x-navcta",d.ctaShort);txt(".x-cta",d.cta);document.querySelectorAll(".x-eyebrow p").forEach(function(e){e.textContent=d.eyebrow;});document.querySelectorAll(".x-title .elementor-heading-title").forEach(function(e){e.innerHTML=d.title.map(function(x){return '<span class="htl">'+x+'</span>';}).join("");});document.querySelectorAll(".x-sub p").forEach(function(e){e.textContent=d.sub;});document.querySelectorAll(".x-mlabel p").forEach(function(e){e.innerHTML='<span class="dot"></span> '+d.mlabel;});document.querySelectorAll(".x-mtxt p").forEach(function(e){e.textContent=d.mtxt;});document.querySelectorAll(".x-mlink p").forEach(function(e){e.innerHTML=d.mlink+' <span class="ar">\\u2192</span>';});if(d.num){document.querySelectorAll(".x-num-eyebrow p").forEach(function(e){e.textContent=d.num.label;});document.querySelectorAll(".x-num-title .elementor-heading-title").forEach(function(e){e.innerHTML=d.num.tA+' <span class="muted">'+d.num.tB+'</span>';});document.querySelectorAll(".x-num-sub p").forEach(function(e){e.textContent=d.num.sub;});txt(".x-num-cta",d.cta);}if(d.kpi){var kc=document.querySelectorAll(".kpi-card");d.kpi.forEach(function(k,i){var c=kc[i];if(!c)return;var kv=c.querySelector(".kpi-v"),kl=c.querySelector(".kpi-l"),kd=c.querySelector(".kpi-d");if(kv)kv.textContent=k.v;if(kl)kl.textContent=k.l;if(kd)kd.textContent=k.d;});}if(d.prob){var pe=document.querySelector(".x-prob-eyebrow p");if(pe)pe.textContent=d.prob.eyebrow;document.querySelectorAll(".x-prob-title .elementor-heading-title").forEach(function(e){e.innerHTML=d.prob.ta+' <span class="muted">'+d.prob.tb+'</span>';});var px=document.querySelector(".x-prob-text p");if(px)px.textContent=d.prob.text;d.prob.cards.forEach(function(c,i){var t=document.querySelector(".x-prob-t"+i+" .elementor-heading-title");if(t)t.textContent=c.t;var dd=document.querySelector(".x-prob-d"+i+" p");if(dd)dd.textContent=c.d;});}var s2=S[l];if(s2){function Tx(sel,v){var e=document.querySelector(sel);if(e){var t=e.querySelector("p")||e;t.textContent=v;}}function Hx(sel,h){var e=document.querySelector(sel);if(e)e.innerHTML=h;}function Qx(sel,arr){var ns=document.querySelectorAll(sel);arr.forEach(function(v,i){if(ns[i])ns[i].textContent=v;});}function TT(sel,ta,tb){document.querySelectorAll(sel).forEach(function(e){e.innerHTML=ta+' <span class="muted">'+tb+'</span>';});}function LastT(sel,arr){document.querySelectorAll(sel).forEach(function(e,i){if(arr[i]==null)return;var n=e.childNodes[e.childNodes.length-1];if(n&&n.nodeType===3)n.textContent=arr[i];else e.appendChild(document.createTextNode(arr[i]));});}function FirstT(sel,arr){document.querySelectorAll(sel).forEach(function(e,i){if(arr[i]==null)return;var n=e.childNodes[0];if(n&&n.nodeType===3)n.textContent=arr[i];});}
var so=s2.sol;Tx(".x-sol-eyebrow",so.eyebrow);TT(".x-sol-title .elementor-heading-title",so.ta,so.tb);Tx(".x-sol-kicker",so.kicker);so.items.forEach(function(it,i){Tx(".x-sol-t"+i+" .elementor-heading-title",it.t);Tx(".x-sol-d"+i,it.d);});txt(".x-sol-cta",so.cta);
var ho=s2.how;Tx(".x-how-eyebrow",ho.eyebrow);TT(".x-how-title .elementor-heading-title",ho.ta,ho.tb);Tx(".x-how-badge",ho.badge);
var pl=s2.plat;Tx(".x-plat-eyebrow",pl.eyebrow);TT(".x-plat-title .elementor-heading-title",pl.ta,pl.tb);txt(".x-plat-cta",pl.cta);Qx(".pillar h3",pl.pillars.map(function(p){return p.t;}));Qx(".pillar p",pl.pillars.map(function(p){return p.d;}));Qx(".pillar-metric",pl.pillars.map(function(p){return p.metric;}));
var pr=s2.prod;Tx(".x-prod-eyebrow",pr.eyebrow);TT(".x-prod-title .elementor-heading-title",pr.ta,pr.tb);Tx(".x-prod-text",pr.text);Qx(".prodx-cap h3",pr.cats.map(function(c){return c.t;}));Qx(".prodx-hover-t",pr.cats.map(function(c){return c.t;}));document.querySelectorAll(".prodx-card").forEach(function(card,i){var lis=card.querySelectorAll(".prodx-hover li");(pr.cats[i]?pr.cats[i].items.concat(['Etc.']):[]).forEach(function(it,j){if(lis[j])lis[j].textContent=it;});});var bze=document.querySelector(".brz-eb");if(bze)bze.textContent=pr.bze;Hx(".brz-title",pr.bza+' <span class="muted">'+pr.bzb+'</span>');var bzl=document.querySelector(".brz-lede");if(bzl)bzl.textContent=pr.bzt;Qx(".brz-tag",pr.tags);
var og=s2.orig;Tx(".x-orig-eyebrow",og.eyebrow);TT(".x-orig-title .elementor-heading-title",og.ta,og.tb);Tx(".x-orig-text",og.text);
var gl=s2.glob;var gle=document.querySelector(".x-glob-eyebrow");if(gle)gle.textContent=gl.eyebrow;Hx(".x-glob-title",gl.ta+' <span class="muted">'+gl.tb+'</span>');var glt=document.querySelector(".x-glob-text");if(glt)glt.textContent=gl.text;Qx(".glob2-oname",gl.offices.map(function(o){return o.city;}));Qx(".glob2-orole",gl.offices.map(function(o){return o.role;}));Qx(".glob2-sv",gl.stats.map(function(o){return o.v;}));Qx(".glob2-sl",gl.stats.map(function(o){return o.l;}));
var ab=s2.about;var abe=document.querySelector(".x-about-eyebrow");if(abe)abe.textContent=ab.eyebrow;Hx(".x-about-title",ab.ta+' <span class="muted">'+ab.tb+'</span>');var abb=document.querySelector(".aboutw .badge");if(abb)abb.textContent=ab.badge;Qx(".about-lbl",[ab.histLbl,ab.fairsLbl,ab.teamLbl]);Qx(".about-card-txt",[ab.histTxt,ab.fairsTxt,ab.teamTxt]);Qx(".about-tl-t",ab.mile.map(function(m){return m.t;}));Qx(".about-tl-badge",ab.mile.filter(function(m){return m.b;}).map(function(m){return m.b;}));LastT(".about-fairchip",ab.fairs);Qx(".about-member-b h4",ab.members.map(function(m){return m.n;}));Qx(".about-member-b span",ab.members.map(function(m){return m.r;}));
var fq=s2.faq;var fqe=document.querySelector(".x-faq-eyebrow");if(fqe)fqe.textContent=fq.eyebrow;Hx(".x-faq-title",fq.ta+' <span class="muted">'+fq.tb+'</span>');var fqs=document.querySelector(".x-faq-sub");if(fqs)fqs.textContent=fq.sub;FirstT(".faq-q",fq.items.map(function(x){return x.q;}));Qx(".faq-a-inner",fq.items.map(function(x){return x.a;}));
var iz=s2.ins;Tx(".x-ins-eyebrow",iz.eyebrow);TT(".x-ins-title .elementor-heading-title",iz.ta,iz.tb);Tx(".x-ins-badge",iz.badge);Qx(".art-tag",iz.items.map(function(x){return x.tag;}));Qx(".art-body h3",iz.items.map(function(x){return x.title;}));FirstT(".art-more",iz.items.map(function(){return iz.showAll+' ';}));
var fc=s2.fcta;Tx(".x-fcta-title .elementor-heading-title",fc.title);Tx(".x-fcta-text",fc.text);txt(".x-fcta-cta",fc.cta);txt(".x-fcta-cta2",fc.cta2);
var ft=s2.foot;var fte=document.querySelector(".x-foot-tag");if(fte)fte.textContent=ft.tagline;var ftc=document.querySelector(".x-foot-contact");if(ftc)ftc.textContent=ft.contact;var ftr=document.querySelector(".x-foot-rights");if(ftr)ftr.textContent=ft.rights;var fh=document.querySelectorAll(".footer-top .footer-col h4");if(fh[0])fh[0].textContent=ft.menu;if(fh[2])fh[2].textContent=ft.lang;var fcol=document.querySelectorAll(".footer-top .footer-col")[0];if(fcol)fcol.querySelectorAll("a").forEach(function(a,i){if(ft.links[i])a.textContent=ft.links[i];});
window.__XS=S;window.__XL=l;document.dispatchEvent(new Event("xlang"));}var b=document.querySelector(".xlbtn");if(b){b.querySelector(".xlflag").src=F[l];b.querySelector(".xllbl").textContent=L[l];}document.querySelectorAll(".xlopt").forEach(function(o){o.setAttribute("data-active",o.dataset.l===l);});document.documentElement.setAttribute("lang",l);try{localStorage.setItem("xlang",l);}catch(e){}}var root=document.querySelector(".xlang");if(!root)return;var btn=root.querySelector(".xlbtn");btn.addEventListener("click",function(e){e.stopPropagation();var o=root.getAttribute("data-open")==="true";root.setAttribute("data-open",!o);btn.setAttribute("aria-expanded",!o);});root.addEventListener("mouseleave",function(){root.setAttribute("data-open","false");btn.setAttribute("aria-expanded","false");});root.querySelectorAll(".xlopt").forEach(function(o){o.addEventListener("click",function(e){e.preventDefault();apply(o.dataset.l);root.setAttribute("data-open","false");});});document.addEventListener("click",function(){root.setAttribute("data-open","false");});var saved;try{saved=localStorage.getItem("xlang");}catch(e){}if(saved&&saved!=="pt")apply(saved);}if(document.readyState!=="loading")init();else document.addEventListener("DOMContentLoaded",init);`;
const langB64 = Buffer.from(langJS, 'utf8').toString('base64');
const langWidget = W('html', { html:
  `<div class="xlang">` +
    `<button class="xlbtn" aria-haspopup="true" aria-expanded="false"><img class="xlflag" src="${LANG_FLAG.pt}" alt=""><span class="xllbl">PT</span><svg class="xlchev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>` +
    `<div class="xlmenu">${langMenuHTML}</div>` +
  `</div>` +
  `<style>` +
    `.xlang{position:relative;font-family:'Geist',sans-serif}` +
    `.xlbtn{display:inline-flex;align-items:center;gap:7px;height:52px;padding:0 16px;font-size:12.5px;letter-spacing:.08em;font-family:'Geist Mono',monospace;color:#fff;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.28);border-radius:100px;cursor:pointer;transition:all .3s cubic-bezier(.22,1,.36,1)}` +
    `.xlbtn:hover{border-color:rgba(255,255,255,.6)}` +
    `.xlflag{width:20px;height:14px;object-fit:cover;border-radius:3px;border:1px solid rgba(5,20,44,.08);box-shadow:0 1px 2px rgba(5,20,44,.16);flex:none}` +
    `.xlchev{transition:transform .25s cubic-bezier(.22,1,.36,1)}` +
    `.xlang[data-open="true"] .xlchev{transform:rotate(180deg)}` +
    `.xlmenu{position:absolute;right:0;top:calc(100% + 10px);background:#fff;border:1px solid #e4e8f2;border-radius:16px;padding:7px;min-width:210px;box-shadow:0 20px 48px -16px rgba(5,20,44,.28);transform-origin:top right;display:none}` +
    `.xlmenu::before{content:"";position:absolute;top:-12px;left:0;right:0;height:12px}` +

    `.xlang[data-open="true"] .xlmenu{display:block;animation:xlmin .18s cubic-bezier(.22,1,.36,1)}` +
    `@keyframes xlmin{from{opacity:0;transform:translateY(-6px) scale(.98)}to{opacity:1;transform:none}}` +
    `.xlopt{display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:11px;font-size:14px;color:#5a6784;cursor:pointer;text-decoration:none;transition:background .2s,color .2s}` +
    `.xlopt span{flex:1}.xlopt:hover{background:#eef3ff;color:#0b1631}` +
    `.xlopt[data-active="true"]{background:#eef3ff;color:#0a3ea8;font-weight:600}` +
    `.xlcheck{color:#0a3ea8;flex:none;opacity:0}.xlopt[data-active="true"] .xlcheck{opacity:1}` +
  `</style>` +
  `<script>${langJS.replace(/<\/script>/g, "<\\/script>")}</script>` });

// ---- NAV MENU nativo/EDITÁVEL: burger + popup (containers + button widgets; CSS na aba Avançado). Só o toggle é script. ----
// burger (button widget)
const iconNoSpin = 'selector .elementor-button-icon i,selector .elementor-button-icon svg{transform:none!important}selector .elementor-button:hover .elementor-button-icon i,selector .elementor-button:hover .elementor-button-icon svg{transform:none!important}';
const burger = WK('button', 'xburger', { text: '', selected_icon: { value: 'fas fa-bars', library: 'fa-solid' }, icon_align: 'left',
  link: { url: '#', is_external: '', nofollow: '' }, button_text_color: '#ffffff',
  border_border: 'solid', border_width: bx(1, 1, 1, 1), border_color: 'rgba(255,255,255,.28)', border_radius: rad(12),
  custom_css: 'selector .elementor-button{width:46px;height:46px;min-height:0;padding:0;display:flex;align-items:center;justify-content:center;background:transparent}' +
    'selector .elementor-button-icon{margin:0}selector .elementor-button-icon i,selector .elementor-button-icon svg{font-size:19px}' + iconNoSpin +
    '.xnav.scrolled .xburger .elementor-button{color:#0b1631;border-color:#e4e8f2;background:#fff}' });
// close (button só ícone)
const popClose = WK('button', 'xdclose', { text: '', selected_icon: { value: 'fas fa-times', library: 'fa-solid' }, icon_align: 'left',
  link: { url: '#', is_external: '', nofollow: '' }, button_text_color: '#0b1631',
  border_border: 'solid', border_width: bx(1, 1, 1, 1), border_color: '#e4e8f2', border_radius: rad(11),
  custom_css: 'selector .elementor-button{width:40px;height:40px;min-height:0;padding:0;display:flex;align-items:center;justify-content:center;background:#fff}selector .elementor-button-icon{margin:0}selector .elementor-button-icon i,selector .elementor-button-icon svg{font-size:16px}' + iconNoSpin });
const popLogo = W('image', { image: { url: `${WPUP}/xpice-logo.png`, source: 'url' }, image_size: 'full', height: U(26), custom_css: 'selector img{height:26px;width:auto}' });
const popHead = Cn(false, { content_width: 'full', flex_direction: 'row', flex_justify_content: 'space-between', flex_align_items: 'center',
  css_classes: 'xpop-head', custom_css: 'selector{margin-bottom:18px}' }, [popLogo, popClose]);
// links do menu (button; classe x-navN p/ i18n + xdl)
const popLink = (t, href, nav) => WK('button', 'x-nav' + nav + ' xdl', { text: t, link: { url: href, is_external: '', nofollow: '' },
  background_color: 'rgba(0,0,0,0)', button_text_color: '#0b1631', typography_typography: 'custom', typography_font_family: 'Geist',
  typography_font_size: U(20), typography_font_weight: '500', typography_letter_spacing: U(-0.02, 'em'),
  custom_css: 'selector .elementor-button{justify-content:flex-start;width:100%;padding:14px 0;min-height:0;border-bottom:1px solid #eef1f7;border-radius:0;transition:color .2s}selector .elementor-button:hover{color:#0a3ea8;background:transparent}' });
// CTA do popup
const popCta = WK('button', 'x-navcta xdcta', { text: 'Fale conosco', link: { url: '#contato', is_external: '', nofollow: '' },
  button_text_color: '#ffffff', typography_typography: 'custom', typography_font_family: 'Geist', typography_font_size: U(15), typography_font_weight: '600', border_radius: rad(100),
  custom_css: 'selector{margin-top:22px}selector .elementor-button{width:100%;justify-content:center;min-height:0;padding:15px;background:linear-gradient(180deg,#0a48c8,#0a3ea8);box-shadow:0 10px 26px -12px rgba(10,62,168,.6)}' });
// idiomas (button; data-l via custom_attributes → o toggle proxy-clica no .xlopt do engine)
const popLang = (l) => WK('button', 'xdlang', { text: LANG_LABEL[l], link: { url: '#', is_external: '', nofollow: '', custom_attributes: `data-l|${l}` },
  background_color: '#ffffff', button_text_color: '#5a6784', typography_typography: 'custom', typography_font_family: 'Geist Mono',
  typography_font_size: U(12.5), typography_letter_spacing: U(0.06, 'em'),
  border_border: 'solid', border_width: bx(1, 1, 1, 1), border_color: '#e4e8f2', border_radius: rad(100),
  custom_css: 'selector .elementor-button{min-height:0;padding:9px 16px}' });
const popLangs = Cn(false, { content_width: 'full', flex_direction: 'row', flex_gap: U(8), css_classes: 'xpop-langs', custom_css: 'selector{margin-top:20px}' },
  ['pt', 'en', 'es'].map(popLang));
// card + overlay (containers)
const popCard = Cn(false, { content_width: 'full', flex_direction: 'column', css_classes: 'xpop',
  custom_css: 'selector{width:100%;max-width:460px;max-height:calc(100dvh - 48px);overflow-y:auto;background:#fff;border-radius:26px;padding:26px;box-shadow:0 40px 90px -24px rgba(5,20,44,.5);transform:scale(.94) translateY(8px);opacity:0;transition:transform .34s cubic-bezier(.22,1,.36,1),opacity .34s cubic-bezier(.22,1,.36,1)}' },
  [popHead, popLink('Plataforma', '#plataforma', 0), popLink('Produtos', '#produtos', 1), popLink('Presença global', '#presenca', 2), popLink('Como funciona', '#como-funciona', 3), popCta, popLangs]);
const popOv = Cn(false, { content_width: 'full', flex_justify_content: 'center', flex_align_items: 'center', css_classes: 'xpop-ov',
  custom_css: 'selector{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(4,10,28,.45);-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);opacity:0;pointer-events:none;transition:opacity .3s cubic-bezier(.22,1,.36,1)}' +
    'selector[data-open="true"]{opacity:1;pointer-events:auto}selector[data-open="true"] .xpop{transform:none;opacity:1}' },
  [popCard]);
// toggle (único script; o conteúdo/estilo do menu é 100% widget nativo editável acima)
const popJS = `(function(){function I(){var b=document.querySelector('.xburger'),ov=document.querySelector('.xpop-ov');if(!b||!ov||b.__i)return;b.__i=1;var bl=b.querySelector('a,button')||b;function set(o){ov.setAttribute('data-open',o?'true':'false');document.body.style.overflow=o?'hidden':'';try{if(window.__lenis){if(o)window.__lenis.stop();else window.__lenis.start();}}catch(e){}}bl.addEventListener('click',function(e){e.preventDefault();set(ov.getAttribute('data-open')!=='true');});ov.addEventListener('click',function(e){if(e.target===ov)set(false);});ov.querySelectorAll('.xdl a,.xdl button').forEach(function(el){el.addEventListener('click',function(){set(false);});});ov.querySelectorAll('.xdclose a,.xdclose button').forEach(function(el){el.addEventListener('click',function(e){e.preventDefault();set(false);});});ov.querySelectorAll('.xdlang a,.xdlang button').forEach(function(el){el.addEventListener('click',function(e){e.preventDefault();var l=el.getAttribute('data-l');var o=l&&document.querySelector('.xlopt[data-l="'+l+'"]');if(o)o.click();set(false);});});document.addEventListener('keydown',function(e){if(e.key==='Escape')set(false);});}if(document.readyState!=='loading')I();else document.addEventListener('DOMContentLoaded',I);})();`;
const popScript = W('html', { _css_classes: 'xpopjs', html: `<script>${popJS.replace(/<\/script>/g, "<\\/script>")}</script>` });

// navRight: logo à esquerda · cta(desktop)+burger à direita (col "auto" do grid) · popup+engine idioma no DOM
const navRight = Cn(true, { content_width: 'full', flex_direction: 'row', flex_gap: U(12), flex_align_items: 'center',
  flex_justify_content: 'flex-end', css_classes: 'xnavright', custom_css: 'selector .elementor-widget-html{width:auto}' }, [navCta, langWidget, burger, popOv, popScript]);

// navInner: DESKTOP grid 1fr/auto/1fr (logo · pill · cta+lang) = header original; ≤860 vira 1fr/auto (logo · burger dir)
const navInner = Cn(true, { content_width: 'boxed', boxed_width: U(1220), min_height: U(78), padding: bx(0, 32, 0, 32),
  css_classes: 'xnavinner',
  custom_css: 'selector>.e-con-inner{display:grid;grid-template-columns:1fr auto 1fr;align-items:center}@media(max-width:860px){selector>.e-con-inner{grid-template-columns:1fr auto}}' },
  [logo, linksPill, navRight]);

const nav = Cn(false, { content_width: 'full', flex_direction: 'row', flex_justify_content: 'center',
  flex_align_items: 'center', min_height: U(79), css_classes: 'xnav',
  custom_css: 'selector{position:fixed;top:0;left:0;width:100%;z-index:120}' }, [navInner, scrollWidget]);

// ================= HERO =================
const badge = W('text-editor', { _css_classes: 'x-eyebrow', editor: '<p>Compras internacionais · Ingredientes alimentícios</p>', text_color: T.white,
  _element_width: 'initial', typography_typography: 'custom', typography_font_family: 'Geist', typography_font_size: U(13),
  typography_font_weight: '500', typography_letter_spacing: U(0.02, 'em'),
  custom_css: 'selector .elementor-widget-container{display:inline-flex}selector p{margin:0;display:inline-flex;align-items:center;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.30);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);padding:9px 17px;border-radius:100px}' });

// hero-title (globals.css:228-231): 4 linhas .htl nowrap + 0.06em; font clamp(24,3.05vw,41)
const htl = ['Importação e exportação', 'de ingredientes alimentícios', 'com inteligência de mercado', 'e previsibilidade.']
  .map((l) => `<span class="htl">${l}</span>`).join('');
const h1 = W('heading', { _css_classes: 'x-title', title: htl,
  header_size: 'h1', title_color: T.white, typography_typography: 'custom', typography_font_family: 'Geist',
  typography_font_size: U(41), typography_font_size_mobile: U(23), typography_font_weight: '600',
  typography_line_height: U(1.1, 'em'), typography_letter_spacing: U(-0.03, 'em'), _margin: bx(18, 0, 0, 0),
  custom_css: 'selector .elementor-heading-title{font-size:clamp(24px,3.05vw,41px)}' +
    'selector .htl{display:block;white-space:nowrap}selector .htl+.htl{margin-top:0.06em}' +
    '@media(max-width:700px){selector .htl{white-space:normal}}' });

const sub = W('text-editor', { _css_classes: 'x-sub', editor: '<p>A Xpice conecta a sua indústria aos melhores fornecedores de insumos alimentícios, com uma plataforma única que acompanha cada contêiner, cada preço e cada fornecedor.</p>',
  text_color: 'rgba(255,255,255,.9)', typography_typography: 'custom', typography_font_family: 'Geist', typography_font_size: U(17),
  typography_line_height: U(1.6, 'em'), _margin: bx(22, 0, 0, 0), _element_width: 'initial',
  custom_css: 'selector{max-width:48ch}selector .elementor-widget-container{font-size:clamp(15px,1.15vw,17px)}selector p{font-size:inherit}' });

const cta = WK('button', 'x-cta', { text: 'Falar com um especialista', link: { url: '#contato', is_external: '', nofollow: '' },
  selected_icon: { value: 'fas fa-arrow-right', library: 'fa-solid' }, icon_align: 'right',
  background_color: T.gold, button_text_color: T.ink, border_radius: rad(100), text_padding: bx(8, 8, 8, 24),
  typography_typography: 'custom', typography_font_family: 'Geist', typography_font_size: U(15), typography_font_weight: '600',
  typography_letter_spacing: U(-0.012, 'em'), _margin: bx(30, 0, 0, 0),
  // hero-cta (globals.css:234-238): hover translateY -2px + shadow maior + ícone svg rotate45
  custom_css: 'selector .elementor-button{display:inline-flex;align-items:center;gap:14px;min-height:54px;box-shadow:0 12px 30px -12px rgba(196,146,46,0.6);transition:transform .25s cubic-bezier(.22,1,.36,1),box-shadow .25s cubic-bezier(.22,1,.36,1)}' +
    'selector .elementor-button:hover{transform:translateY(-2px);box-shadow:0 16px 38px -12px rgba(196,146,46,0.72)}' +
    'selector .elementor-button-icon{width:38px;height:38px;border-radius:50%;background:#0b1631;color:#fff;display:grid;place-items:center;margin:0}' +
    'selector .elementor-button-icon i,selector .elementor-button-icon svg{font-size:16px;width:16px;transition:transform .35s cubic-bezier(.22,1,.36,1)}' +
    'selector .elementor-button:hover .elementor-button-icon i,selector .elementor-button:hover .elementor-button-icon svg{transform:rotate(45deg)}' });

const lead = Cn(true, { content_width: 'full', flex_direction: 'column', flex_gap: U(0), flex_align_items: 'flex-start',
  css_classes: 'xlead', custom_css: 'selector{max-width:660px}' }, [badge, h1, sub, cta]);

const mDot = W('text-editor', { _css_classes: 'x-mlabel', editor: '<p><span class="dot"></span> Nossa missão</p>', text_color: T.white,
  typography_typography: 'custom', typography_font_family: 'Geist', typography_font_size: U(15), typography_font_weight: '600',
  custom_css: 'selector p{margin:0;display:flex;align-items:center;gap:9px}selector .dot{width:7px;height:7px;border-radius:50%;background:#c4922e;display:inline-block}' });
const mTxt = W('text-editor', { _css_classes: 'x-mtxt', editor: '<p>Conectar a sua indústria aos melhores fornecedores do mundo, com dados, rastreabilidade e previsibilidade em cada compra.</p>',
  text_color: 'rgba(255,255,255,.82)', typography_typography: 'custom', typography_font_family: 'Geist', typography_font_size: U(13.5),
  typography_line_height: U(1.6, 'em'), _margin: bx(12, 0, 0, 0) });
// hero-mission-link (globals.css:243-244): hover gap 8->12
const mLink = W('text-editor', { _css_classes: 'x-mlink', editor: '<p>Conhecer a plataforma <span class="ar">→</span></p>', text_color: T.white, typography_typography: 'custom',
  typography_font_family: 'Geist', typography_font_size: U(13.5), typography_font_weight: '500', _margin: bx(16, 0, 0, 0),
  custom_css: 'selector p{margin:0;display:inline-flex;align-items:center;gap:8px;transition:gap .25s cubic-bezier(.22,1,.36,1)}' +
    'selector:hover p{gap:12px}' });

const mission = Cn(true, { content_width: 'full', flex_direction: 'column', padding: bx(24, 26, 24, 26),
  custom_css: 'selector{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.22);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border-radius:18px;max-width:358px;justify-self:end;align-self:end}' },
  [mDot, mTxt, mLink]);

// hero-inner (globals.css:220-225): GRID 1fr/0.86fr, align end, gap+padding clamp exatos
const heroInner = Cn(true, { content_width: 'boxed', boxed_width: U(1220),
  custom_css: 'selector>.e-con-inner{display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,0.86fr);align-items:end;gap:clamp(28px,5vw,64px);padding:clamp(120px,15vh,150px) 32px clamp(40px,6vh,66px)}' +
    '@media(max-width:900px){selector>.e-con-inner{grid-template-columns:1fr;gap:28px;align-items:start;padding:118px 20px 42px}}' }, [lead, mission]);

// hero-card (globals.css:212-219,249-252): min-height 100dvh · bg em ::after com zoom heroMediaIn · shade ::before 4 stops
const hero = Cn(false, { content_width: 'full', flex_direction: 'column', flex_justify_content: 'flex-end', min_height: U(100, 'vh'),
  css_classes: 'xhero',
  custom_css: 'selector{overflow:hidden;min-height:100dvh}' +
    `selector::after{content:"";position:absolute;inset:0;z-index:0;background:url('${WPUP}/hero-map-1.jpg') center 50%/cover no-repeat;animation:heroMediaIn 1.1s cubic-bezier(.22,1,.36,1) .05s both}` +
    'selector::before{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(180deg,rgba(7,18,50,0.44) 0%,rgba(7,18,50,0.12) 32%,rgba(7,18,50,0.10) 52%,rgba(4,10,28,0.82) 100%)}' +
    'selector>.e-con,selector>.e-con-inner{position:relative;z-index:2}' +
    '@keyframes heroMediaIn{from{opacity:0;transform:scale(1.045)}to{opacity:1;transform:scale(1.015)}}' }, [heroInner]);

// ================= SEÇÃO 2 — NÚMEROS (KPIs) =================
// globals.css:276-314 · page.js:68-85 · KpiCarousel.js. Intro nativo editável + carrossel = widget HTML.
// eyebrow (globals.css:71-76): mono 12px, letter-spacing .18em, uppercase, royal-500, losango dourado ::before
const eyebrowW = (text, key) => WK('text-editor', key, { editor: `<p>${text}</p>`, _element_width: 'initial',
  typography_typography: 'custom', typography_font_family: 'Geist Mono', typography_font_size: U(12),
  typography_letter_spacing: U(0.18, 'em'), typography_text_transform: 'uppercase', text_color: '#2e6bf0',
  custom_css: 'selector .elementor-widget-container{display:inline-flex}selector p{margin:0;display:inline-flex;align-items:center;gap:12px;font-weight:500}' +
    'selector p::before{content:"";width:7px;height:7px;background:#c4922e;transform:rotate(45deg);border-radius:1px;flex:none}' });

// h-section two-tone (globals.css:78): parte final em .muted (steel)
const numH2 = WK('heading', 'x-num-title', { title: 'A operação, em <span class="muted">dados concretos.</span>', header_size: 'h2',
  title_color: T.ink, typography_typography: 'custom', typography_font_family: 'Geist', typography_font_weight: '600',
  typography_letter_spacing: U(-0.04, 'em'), typography_line_height: U(1.04, 'em'), _margin: bx(16, 0, 0, 0),
  custom_css: 'selector .elementor-heading-title{font-size:clamp(26px,3.3vw,44px);max-width:15ch}selector .muted{color:#8492ac}' });

const numLede = WK('text-editor', 'x-num-sub', { editor: '<p>Cada compra internacional apoiada em rede de fornecedores homologados, dados de preço atualizados e rastreamento fim a fim, do embarque à sua linha de produção.</p>',
  text_color: '#5a6784', typography_typography: 'custom', typography_font_family: 'Geist', typography_line_height: U(1.6, 'em'),
  custom_css: 'selector{max-width:52ch}selector .elementor-widget-container{font-size:clamp(16px,1.25vw,19px)}selector p{margin:0;font-size:inherit}' });

// btn-dark (globals.css:129-151): pill escura, seta em círculo branco; hover levanta + seta desliza ↗
const numBtn = WK('button', 'x-num-cta', { text: 'Falar com um especialista', link: { url: '#contato', is_external: '', nofollow: '' },
  selected_icon: { value: 'fas fa-arrow-right', library: 'fa-solid' }, icon_align: 'right',
  background_color: T.ink, button_text_color: T.white, border_radius: rad(99), text_padding: bx(8, 8, 8, 24),
  typography_typography: 'custom', typography_font_family: 'Geist', typography_font_size: U(14.5), typography_font_weight: '500',
  typography_letter_spacing: U(-0.005, 'em'),
  custom_css: 'selector .elementor-button{display:inline-flex;align-items:center;gap:12px;min-height:0;transition:background .3s cubic-bezier(.22,1,.36,1),transform .3s cubic-bezier(.22,1,.36,1),box-shadow .3s cubic-bezier(.22,1,.36,1)}' +
    'selector .elementor-button:hover{background:#16264c;transform:translateY(-3px);box-shadow:0 14px 30px -14px rgba(4,16,50,0.4)}' +
    'selector .elementor-button-icon{width:34px;height:34px;border-radius:50%;background:#fff;color:#0b1631;display:grid;place-items:center;margin:0;transition:transform .35s cubic-bezier(.22,1,.36,1)}' +
    'selector .elementor-button-icon i,selector .elementor-button-icon svg{font-size:15px;width:15px;transform:rotate(-45deg)}' +
    'selector .elementor-button:hover .elementor-button-icon i,selector .elementor-button:hover .elementor-button-icon svg{transform:rotate(-45deg) translate(3px,-3px)}' });

const kpiHead = Cn(true, { content_width: 'full', flex_direction: 'column', flex_align_items: 'flex-start', custom_css: 'selector{align-self:end}' }, [eyebrowW('Em números', 'x-num-eyebrow'), numH2]);
const kpiSide = Cn(true, { content_width: 'full', flex_direction: 'column', flex_align_items: 'flex-start', custom_css: 'selector{align-self:end}' },
  [numLede, Cn(true, { content_width: 'full', custom_css: 'selector{margin-top:26px}' }, [numBtn])]);
const kpiIntro2 = Cn(true, { content_width: 'full',
  custom_css: 'selector>.e-con-inner,selector{display:grid;grid-template-columns:1.05fr 1fr;gap:clamp(32px,5vw,72px);align-items:end;margin-bottom:clamp(40px,5vw,64px)}' +
    '@media(max-width:860px){selector>.e-con-inner,selector{grid-template-columns:1fr;gap:20px;align-items:start}}' }, [kpiHead, kpiSide]);

// ---- KpiCarousel (widget HTML): scroll-driven + setas + dots (KpiCarousel.js + globals.css:289-314) ----
const KPI_S2 = [
  { v: '2', l: 'Escritórios', d: 'Brasil e Portugal, presença nos dois lados da operação, na origem e no destino.', photo: 'field' },
  { v: 'Semanal', l: 'Relatório de preços', d: 'Panorama dos principais produtos toda semana, com histórico e tendência para negociar com base em dado.', photo: 'warehouse' },
  { v: '100%', l: 'Cargas rastreadas', d: 'Cada contêiner acompanhado da origem ao destino, com status e posição em tempo real.', photo: 'facility' },
  { v: '6+', l: 'Categorias homologadas', d: 'Especiarias, ervas, vegetais desidratados, aditivos e naturais, com fornecedores avaliados por desempenho.', photo: 'grading' },
];
const kpiSlots = KPI_S2.map((s, i) => `<div class="kpi-slot"><div class="kpi-card" data-on="${i < 2}"><div class="kpi-photo"><img src="${photoUrl(s.photo)}" alt=""></div><div class="kpi-body"><span class="kpi-v">${s.v}</span><span class="kpi-l">${s.l}</span><p class="kpi-d">${s.d}</p></div></div></div>`).join('');
const kpiDots = KPI_S2.slice(0, KPI_S2.length - 1).map((_, i) => `<button class="${i === 0 ? 'on' : ''}"></button>`).join('');
const kpiCSS =
  ".kpi,.kpi *{font-family:'Geist','GeistSans',ui-sans-serif,system-ui,sans-serif}" +
  ".kpi-l{font-family:'Geist Mono',ui-monospace,monospace}" +
  '.kpi-nav{display:flex;justify-content:flex-end;gap:10px;margin-bottom:18px}' +
  '.kpi-arrow{width:46px;height:46px;border-radius:50%;border:1px solid #e4e8f2;background:#fff;color:#0b1631;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:background .25s cubic-bezier(.22,1,.36,1),color .25s,border-color .25s,opacity .25s,transform .25s}' +
  '.kpi-arrow:hover:not(:disabled){background:#0b1631;color:#fff;border-color:#0b1631;transform:translateY(-1px)}' +
  '.kpi-arrow:disabled{opacity:.3;cursor:default}' +
  '.kpi-viewport{overflow:hidden}' +
  '.kpi-track{display:flex;transition:transform .75s cubic-bezier(.22,1,.36,1);will-change:transform}' +
  '.kpi-slot{flex:0 0 50%;max-width:50%;padding-right:20px;box-sizing:border-box}' +
  '.kpi-card{display:flex;height:100%;min-height:300px;background:#eef1f8;border-radius:26px;overflow:hidden;transition:background .5s cubic-bezier(.22,1,.36,1),box-shadow .5s}' +
  '.kpi-card[data-on="true"]{background:#fff;box-shadow:0 12px 34px -16px rgba(11,22,49,.18)}' +
  '.kpi-photo{position:relative;flex:0 0 44%;overflow:hidden}' +
  '.kpi-photo img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:grayscale(1) contrast(1.06);transition:transform .9s cubic-bezier(.22,1,.36,1)}' +
  '.kpi-card:hover .kpi-photo img{transform:scale(1.05)}' +
  '.kpi-photo::after{content:"";position:absolute;inset:0;background:#0a3ea8;mix-blend-mode:color}' +
  '.kpi-body{flex:1;padding:clamp(24px,2.5vw,36px);display:flex;flex-direction:column}' +
  '.kpi-v{font-size:clamp(38px,4vw,54px);font-weight:600;letter-spacing:-.05em;line-height:.94;color:#0b1631;font-variant-numeric:tabular-nums}' +
  '.kpi-l{font-size:12px;font-family:\'Geist Mono\',monospace;letter-spacing:.12em;text-transform:uppercase;color:#5a6784;margin-top:14px}' +
  '.kpi-d{font-size:14.5px;color:#5a6784;line-height:1.55;margin-top:auto;padding-top:22px;max-width:34ch}' +
  '.kpi-foot{display:flex;align-items:center;gap:18px;margin-top:30px}' +
  '.kpi-idx{font-family:\'Geist Mono\',monospace;font-size:12px;letter-spacing:.08em;color:#8492ac}' +
  '.kpi-bar{flex:1;height:2px;background:#e4e8f2;border-radius:2px;overflow:hidden}' +
  '.kpi-bar>span{display:block;height:100%;background:linear-gradient(90deg,#0a3ea8,#2e6bf0);border-radius:2px;transition:width .6s cubic-bezier(.22,1,.36,1)}' +
  '.kpi-dots{display:flex;gap:8px;justify-content:center;margin-top:22px}' +
  '.kpi-dots button{width:26px;height:4px;padding:0;min-height:0;line-height:0;border-radius:4px;background:#e4e8f2;border:none;cursor:pointer;transition:background .35s,width .35s}' +
  '.kpi-dots button.on{background:#0a3ea8;width:40px}' +
  '@media(max-width:640px){.kpi-track{flex-direction:column;gap:16px;transform:none!important}.kpi-slot{flex:0 0 100%;max-width:100%;padding-right:0}.kpi-card{flex-direction:column;min-height:0}.kpi-photo{flex:0 0 190px;width:100%}.kpi-photo img{width:100%;height:100%}.kpi-body{padding:22px 22px 26px}.kpi-v{font-size:clamp(34px,11vw,46px)}.kpi-d{max-width:none}.kpi-dots,.kpi-nav{display:none}}';
const kpiJS = `function kinit(){var root=document.querySelector(".kpi");if(!root||root.__k)return;root.__k=1;var track=root.querySelector(".kpi-track"),cards=root.querySelectorAll(".kpi-card"),dots=root.querySelectorAll(".kpi-dots button"),prev=root.querySelector(".kpi-prev"),next=root.querySelector(".kpi-next"),cur=root.querySelector(".kpi-cur"),bar=root.querySelector(".kpi-bar>span"),n=cards.length,last=Math.max(0,n-2),active=0;function render(){track.style.transform="translate3d(-"+(active*50)+"%,0,0)";cards.forEach(function(c,i){c.setAttribute("data-on",i>=active&&i<active+2);});dots.forEach(function(d,i){d.className=i===active?"on":"";});if(cur)cur.textContent=("0"+(active+1)).slice(-2);if(bar)bar.style.width=(((active+2)/n)*100)+"%";if(prev)prev.disabled=active===0;if(next)next.disabled=active===last;}function go(d){active=Math.max(0,Math.min(last,active+d));render();}if(prev)prev.addEventListener("click",function(){go(-1);});if(next)next.addEventListener("click",function(){go(1);});dots.forEach(function(dt,i){dt.addEventListener("click",function(){active=i;render();});});var raf=0;function compute(){raf=0;var r=root.getBoundingClientRect();var vh=window.innerHeight||document.documentElement.clientHeight;var start=vh*0.82,end=vh*0.28;var p=(start-r.top)/(start-end);active=Math.max(0,Math.min(last,Math.round(p*last+0.0001)));render();}window.addEventListener("scroll",function(){if(!raf)raf=requestAnimationFrame(compute);},{passive:true});window.addEventListener("resize",function(){if(!raf)raf=requestAnimationFrame(compute);});render();}if(document.readyState!=="loading")kinit();else document.addEventListener("DOMContentLoaded",kinit);`;
const kpiWidget = W('html', { html:
  `<div class="kpi">` +
    `<div class="kpi-nav"><button class="kpi-arrow kpi-prev" disabled aria-label="Anterior"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button><button class="kpi-arrow kpi-next" aria-label="Próximo"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>` +
    `<div class="kpi-viewport"><div class="kpi-track">${kpiSlots}</div></div>` +
    `<div class="kpi-foot"><span class="kpi-idx kpi-cur">01</span><span class="kpi-bar"><span style="width:50%"></span></span><span class="kpi-idx">${String(KPI_S2.length).padStart(2, '0')}</span></div>` +
    `<div class="kpi-dots">${kpiDots}</div>` +
  `</div>` +
  `<style>${kpiCSS}</style>` +
  `<script>${kpiJS.replace(/<\/script>/g, "<\\/script>")}</script>` });

const numInner = Cn(true, { content_width: 'boxed', boxed_width: U(1220), padding: bx(0, 32, 0, 32) }, [kpiIntro2, kpiWidget]);
const numeros = Cn(false, { content_width: 'full', background_background: 'classic', background_color: T.paper,
  custom_css: 'selector{padding:clamp(56px,6vw,92px) 0}' }, [numInner]);

// ================= SEÇÃO 3 · PROBLEMA (ledger 2-col) — page.js:87 + globals.css:398 =================
const P = I18N.pt.prob;
// prob2-title two-tone (globals.css:399): parte final em .muted (steel)
const probTitle = WK('heading', 'x-prob-title', { title: `${P.ta} <span class="muted">${P.tb}</span>`, header_size: 'h2',
  title_color: T.ink, typography_typography: 'custom', typography_font_family: 'Geist', typography_font_weight: '600',
  typography_letter_spacing: U(-0.038, 'em'), typography_line_height: U(1.06, 'em'), _margin: bx(16, 0, 18, 0),
  custom_css: 'selector .elementor-heading-title{font-size:clamp(27px,3.3vw,44px);max-width:15ch}selector .muted{color:#8492ac}' });
const probLede = WK('text-editor', 'x-prob-text', { editor: `<p>${P.text}</p>`,
  text_color: '#5a6784', typography_typography: 'custom', typography_font_family: 'Geist', typography_line_height: U(1.6, 'em'),
  custom_css: 'selector{max-width:56ch}selector .elementor-widget-container{font-size:clamp(16px,1.25vw,19px)}selector p{margin:0;font-size:inherit}' });
const probHead = Cn(true, { content_width: 'full', flex_direction: 'column', flex_align_items: 'flex-start' },
  [eyebrowW('O problema', 'x-prob-eyebrow'), probTitle, probLede]);

const probRow = (c, i) => {
  const n = WK('text-editor', `x-prob-n${i}`, { editor: `<p>${c.k}</p>`, text_color: '#2e6bf0',
    typography_typography: 'custom', typography_font_family: 'Geist Mono', typography_font_size: U(14),
    custom_css: 'selector{align-self:start}selector .elementor-widget-container{padding-top:4px}selector p{margin:0}' });
  const h3 = WK('heading', `x-prob-t${i}`, { title: c.t, header_size: 'h3', title_color: T.ink,
    typography_typography: 'custom', typography_font_family: 'Geist', typography_font_weight: '600', typography_letter_spacing: U(-0.03, 'em'), _margin: bx(0, 0, 7, 0),
    custom_css: 'selector .elementor-heading-title{font-size:clamp(19px,1.8vw,24px)}' });
  const p = WK('text-editor', `x-prob-d${i}`, { editor: `<p>${c.d}</p>`, text_color: '#5a6784',
    typography_typography: 'custom', typography_font_family: 'Geist', typography_font_size: U(15),
    custom_css: 'selector{max-width:42ch}selector p{margin:0}' });
  const body = Cn(true, { content_width: 'full', flex_direction: 'column', flex_align_items: 'flex-start' }, [h3, p]);
  const xicon = W('html', { html: '<span class="pr-x"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' });
  return Cn(true, { content_width: 'full',
    custom_css: 'selector{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:clamp(16px,2.2vw,28px);padding:clamp(22px,2.6vw,30px) 0;border-top:1px solid #e4e8f2}' +
      (i === 0 ? 'selector{padding-top:0;border-top:none}' : '') +
      'selector .pr-x{width:44px;height:44px;border-radius:50%;background:#eef3ff;color:#0a3ea8;display:flex;align-items:center;justify-content:center;transition:background .35s cubic-bezier(.22,1,.36,1),color .35s cubic-bezier(.22,1,.36,1),transform .35s cubic-bezier(.22,1,.36,1)}' +
      'selector:hover .pr-x{background:#0b1631;color:#fff;transform:rotate(6deg)}' +
      'selector .elementor-widget-html{display:flex}' }, [n, body, xicon]);
};
const probList = Cn(true, { content_width: 'full', flex_direction: 'column' }, P.cards.map((c, i) => probRow(c, i)));
const prob2 = Cn(true, { content_width: 'full',
  custom_css: 'selector{display:grid;grid-template-columns:1fr 1.05fr;gap:clamp(36px,6vw,80px);align-items:center}' +
    '@media(max-width:860px){selector{grid-template-columns:1fr;gap:clamp(28px,5vw,44px)}}' }, [probHead, probList]);
const probInner = Cn(true, { content_width: 'boxed', boxed_width: U(1220), padding: bx(0, 32, 0, 32) }, [prob2]);
const problema = Cn(false, { content_width: 'full', background_background: 'classic', background_color: T.paper,
  custom_css: 'selector{padding:clamp(80px,9vw,140px) 0}' }, [probInner]);

// helper btn-dark (pill escura + seta em círculo branco, hover levanta + desliza) — globals.css:129
const btnDark = (text, key, href) => WK('button', key, { text, link: { url: href || '#contato', is_external: '', nofollow: '' },
  selected_icon: { value: 'fas fa-arrow-right', library: 'fa-solid' }, icon_align: 'right',
  background_color: T.ink, button_text_color: T.white, border_radius: rad(99), text_padding: bx(8, 8, 8, 24),
  typography_typography: 'custom', typography_font_family: 'Geist', typography_font_size: U(14.5), typography_font_weight: '500', typography_letter_spacing: U(-0.005, 'em'),
  custom_css: 'selector .elementor-button{display:inline-flex;align-items:center;gap:12px;min-height:0;transition:background .3s cubic-bezier(.22,1,.36,1),transform .3s cubic-bezier(.22,1,.36,1),box-shadow .3s cubic-bezier(.22,1,.36,1)}' +
    'selector .elementor-button:hover{background:#16264c;transform:translateY(-3px);box-shadow:0 14px 30px -14px rgba(4,16,50,0.4)}' +
    'selector .elementor-button-icon{width:34px;height:34px;border-radius:50%;background:#fff;color:#0b1631;display:grid;place-items:center;margin:0;transition:transform .35s cubic-bezier(.22,1,.36,1)}' +
    'selector .elementor-button-icon i,selector .elementor-button-icon svg{font-size:15px;width:15px;transform:rotate(-45deg)}' +
    'selector .elementor-button:hover .elementor-button-icon i,selector .elementor-button:hover .elementor-button-icon svg{transform:rotate(-45deg) translate(3px,-3px)}' });
// boxed_width 1156 = replica o `.wrap` oficial (max-width 1220 com padding lateral 32 = conteúdo 1156).
// No Elementor o padding fica FORA do inner max-width, então o inner precisa ser 1156, não 1220.
const boxed = (kids) => Cn(true, { content_width: 'boxed', boxed_width: U(1156), padding: bx(0, 32, 0, 32) }, kids);
const secPaper = (kids, cssExtra) => Cn(false, { content_width: 'full', background_background: 'classic', background_color: T.paper,
  custom_css: 'selector{padding:clamp(80px,9vw,140px) 0}' + (cssExtra || '') }, [boxed(kids)]);

// ================= SEÇÃO 4 · SOLUÇÃO (zig-zag foto) — page.js:112 + globals.css:411 =================
const SOL = { kicker: 'Sua equipe de compras decide com informação. Sua produção recebe com previsibilidade.',
  items: [{ t: 'Fornecedores qualificados', d: 'Rede homologada por desempenho real.' }, { t: 'Dados de mercado', d: 'Preço atualizado, com histórico e tendência.' }, { t: 'Acompanhamento completo', d: 'Da origem ao destino, sem pontos cegos.' }, { t: 'Melhor momento de compra', d: 'Indicadores e critérios de venda apontam a melhor data para comprar.' }] };
const SOL_IC = [
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.6 5.3 5.8.85-4.2 4.1 1 5.75L12 16.3 6.8 19l1-5.75-4.2-4.1 5.8-.85z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 3.5v17h17"/><path d="M7 15l3.5-4 3 2.5L20 7"/><circle cx="20" cy="7" r="1.3"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 6h6a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3H10a3 3 0 0 0-3 3v0a3 3 0 0 0 3 3h6"/></svg>'];
const solMedia = W('html', { html:
  `<div class="sol2-media"><img src="${photoUrl('warehouse')}" alt="Armazém de especiarias"><div class="sol2-tag"><span class="dot-live"></span><span class="x-sol-hint">Rastreamento ao vivo</span></div></div>` +
  '<style>.sol2-media{position:relative;border-radius:26px;overflow:hidden;aspect-ratio:4/5;box-shadow:0 30px 60px -30px rgba(11,22,49,.28)}' +
  '.sol2-media>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .8s cubic-bezier(.22,1,.36,1)}' +
  '.sol2-media:hover>img{transform:scale(1.05)}' +
  '.sol2-media::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 55%,rgba(7,18,50,.5))}' +
  '.sol2-tag{position:absolute;left:18px;bottom:18px;z-index:2;display:inline-flex;align-items:center;gap:9px;background:rgba(255,255,255,.92);backdrop-filter:blur(6px);color:#0b1631;font-size:12.5px;font-weight:500;padding:9px 14px;border-radius:100px;box-shadow:0 6px 16px -8px rgba(4,16,50,.2)}' +
  '.sol2-tag .dot-live{width:7px;height:7px;border-radius:50%;background:#22c07a;animation:solpulse 2.2s cubic-bezier(.22,1,.36,1) infinite}' +
  '@keyframes solpulse{0%,100%{box-shadow:0 0 0 3px rgba(34,192,122,.22)}50%{box-shadow:0 0 0 7px rgba(34,192,122,0)}}</style>' });
const solRow = (it, i) => {
  const icon = W('html', { html: `<span class="sol2-ic">${SOL_IC[i] || SOL_IC[0]}</span>` });
  const h3 = WK('heading', `x-sol-t${i}`, { title: it.t, header_size: 'h3', title_color: T.ink, typography_typography: 'custom', typography_font_family: 'Geist', typography_font_weight: '600', typography_letter_spacing: U(-0.025, 'em'), _margin: bx(0, 0, 5, 0), custom_css: 'selector .elementor-heading-title{font-size:18.5px}' });
  const p = WK('text-editor', `x-sol-d${i}`, { editor: `<p>${it.d}</p>`, text_color: T.slate, typography_typography: 'custom', typography_font_family: 'Geist', typography_font_size: U(15), typography_line_height: U(1.55, 'em'), custom_css: 'selector p{margin:0}' });
  const body = Cn(true, { content_width: 'full', flex_direction: 'column', flex_align_items: 'flex-start' }, [h3, p]);
  return Cn(true, { content_width: 'full', custom_css:
    'selector{display:grid;grid-template-columns:auto 1fr;gap:18px;align-items:start;padding:20px 0;border-top:1px solid #e4e8f2}' +
    (i === 0 ? 'selector{border-top:none}' : '') +
    'selector .sol2-ic{flex:none;width:48px;height:48px;border-radius:14px;background:#eef3ff;color:#0a3ea8;display:flex;align-items:center;justify-content:center;transition:transform .4s cubic-bezier(.22,1,.36,1)}' +
    'selector .sol2-ic svg{width:24px;height:24px}selector:hover .sol2-ic{transform:translateY(-3px)}' +
    'selector .elementor-widget-html{display:flex}' }, [icon, body]);
};
const solTitle = WK('heading', 'x-sol-title', { title: 'Inteligência de compra <span class="muted">em cada operação.</span>', header_size: 'h2',
  title_color: T.ink, typography_typography: 'custom', typography_font_family: 'Geist', typography_font_weight: '600',
  typography_letter_spacing: U(-0.04, 'em'), typography_line_height: U(1.04, 'em'), _margin: bx(18, 0, 14, 0),
  custom_css: 'selector .elementor-heading-title{font-size:clamp(26px,3.3vw,44px)}selector .muted{color:#8492ac}' });
const solKicker = WK('text-editor', 'x-sol-kicker', { editor: `<p>${SOL.kicker}</p>`, text_color: T.slate,
  typography_typography: 'custom', typography_font_family: 'Geist', typography_line_height: U(1.6, 'em'),
  custom_css: 'selector{max-width:52ch}selector .elementor-widget-container{font-size:clamp(16px,1.25vw,19px)}selector p{margin:0;font-size:inherit}' });
const solBody = Cn(true, { content_width: 'full', flex_direction: 'column', flex_align_items: 'flex-start' },
  [eyebrowW('A solução', 'x-sol-eyebrow'), solTitle, solKicker,
   Cn(true, { content_width: 'full', flex_direction: 'column', custom_css: 'selector{margin-top:26px}' }, SOL.items.map((it, i) => solRow(it, i))),
   Cn(true, { content_width: 'full', custom_css: 'selector{margin-top:30px}' }, [btnDark(I18N.pt.cta, 'x-sol-cta', '#contato')])]);
const sol2 = Cn(true, { content_width: 'full', custom_css:
  'selector{display:grid;grid-template-columns:1fr 1fr;gap:clamp(36px,5vw,72px);align-items:center}' +
  '@media(max-width:1000px){selector{grid-template-columns:1fr;gap:clamp(28px,5vw,44px)}}' }, [solMedia, solBody]);
const solucao = secPaper([sol2]);

// helper SectionIntro (eyebrow esq / headline two-tone dir + badge) — Bits.js:20 + globals.css:377
const sectionIntro = (eyebrow, ebKey, titleHTML, titleKey, badge, badgeKey) => {
  const eb = eyebrowW(eyebrow, ebKey);
  const h2 = WK('heading', titleKey, { title: titleHTML, header_size: 'h2', title_color: T.ink,
    typography_typography: 'custom', typography_font_family: 'Geist', typography_font_weight: '600',
    typography_letter_spacing: U(-0.04, 'em'), typography_line_height: U(1.04, 'em'),
    custom_css: 'selector{margin-left:auto}selector .elementor-heading-title{font-size:clamp(26px,3.3vw,44px);max-width:22ch;text-align:right;margin-left:auto}selector .muted{color:#8492ac}@media(max-width:760px){selector .elementor-heading-title{text-align:left}}' });
  const main = [h2];
  if (badge) main.push(WK('text-editor', badgeKey, { editor: `<p>${badge}</p>`,
    custom_css: 'selector{margin-top:24px;display:flex;justify-content:flex-end}@media(max-width:760px){selector{justify-content:flex-start}}selector p{margin:0;display:inline-flex;align-items:center;gap:8px;font-family:\'Geist Mono\';font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#5a6784;border:1px dashed #e4e8f2;border-radius:100px;padding:6px 12px}selector p::before{content:"";width:6px;height:6px;border-radius:50%;background:#2e6bf0}' }));
  const right = Cn(true, { content_width: 'full', flex_direction: 'column', custom_css: 'selector{align-items:flex-end}@media(max-width:760px){selector{align-items:flex-start}}' }, main);
  const left = Cn(true, { content_width: 'full', custom_css: 'selector{padding-top:10px}' }, [eb]);
  return Cn(true, { content_width: 'full', custom_css:
    'selector{display:grid;grid-template-columns:0.3fr 0.7fr;gap:clamp(22px,4vw,60px);align-items:start;margin-bottom:clamp(44px,5vw,68px)}' +
    '@media(max-width:760px){selector{grid-template-columns:1fr;gap:14px}}' }, [left, right]);
};

// ================= SEÇÃO 5 · COMO FUNCIONA (Steps) — page.js:142 + globals.css:317 =================
const HOW = [
  { k: 'Etapa 1', t: 'Diagnóstico de compras', d: 'Entendemos o que sua empresa compra, em que volume e com quais critérios.' },
  { k: 'Etapa 2', t: 'Cotação com dados', d: 'Apresentamos fornecedores homologados, com preços contextualizados pelo relatório de mercado.' },
  { k: 'Etapa 3', t: 'Fechamento e embarque', d: 'Negociação, contrato e embarque com acompanhamento completo pela plataforma.' },
  { k: 'Etapa 4', t: 'Entrega e acompanhamento', d: 'Sua equipe acompanha a carga até o destino e recebe relatórios semanais para as próximas compras.' }];
const STEP_IC = [
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.6 5.3 5.8.85-4.2 4.1 1 5.75L12 16.3 6.8 19l1-5.75-4.2-4.1 5.8-.85z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 3.5v17h17"/><path d="M7 15l3.5-4 3 2.5L20 7"/><circle cx="20" cy="7" r="1.3"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="7" width="19" height="10" rx="1.2"/><path d="M6 7v10M10 7v10M14 7v10M18 7v10"/><path d="M2.5 17.5v1.5M21.5 17.5v1.5"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 6h6a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3H10a3 3 0 0 0-3 3v0a3 3 0 0 0 3 3h6"/></svg>'];
const STEP_PH = ['meeting', 'grading', 'warehouse', 'expo'];
const stepsSectionCSS =
  'selector{padding:clamp(80px,9vw,140px) 0}' +
  'selector .steps2{display:grid!important;grid-template-columns:1fr 1.05fr;gap:clamp(32px,5vw,64px)!important;align-items:stretch;padding:0!important}' +
  'selector .steps-list{position:relative;display:flex;flex-direction:column;gap:0!important;padding:0 0 0 34px!important}' +
  'selector .steps-rail{position:absolute!important;left:4px;top:24px;bottom:24px;width:2px!important;min-width:0;height:auto;background:#e4e8f2;border-radius:2px;padding:0!important}' +
  'selector .steps-rail-fill{position:absolute!important;left:0;top:0;width:100%!important;min-width:0;height:25%;background:linear-gradient(180deg,#0a3ea8,#2e6bf0);border-radius:2px;transition:height .6s cubic-bezier(.22,1,.36,1);padding:0!important}' +
  'selector .step-item{position:relative;display:flex!important;flex-direction:row;align-items:center;gap:16px!important;width:100%;padding:clamp(20px,2.4vw,30px) 0!important;border-bottom:1px solid #e4e8f2;cursor:pointer}' +
  'selector .step-item:last-child{border-bottom:none}' +
  // dot do trilho = ::before do card (JS só alterna data-on)
  'selector .step-item::before{content:"";position:absolute;left:-34px;top:50%;width:11px;height:11px;border-radius:50%;background:#cdd6e6;transform:translateY(-50%);transition:all .35s cubic-bezier(.22,1,.36,1)}' +
  'selector .step-item[data-on="true"]::before{background:#0a3ea8;transform:translateY(-50%) scale(1.3);box-shadow:0 0 0 5px rgba(46,107,240,.15)}' +
  'selector .si-num{width:auto}selector .si-num,selector .si-num .elementor-heading-title{font-family:\'Geist Mono\',monospace;font-size:13px;color:#8492ac;transition:color .3s;margin:0}' +
  'selector .step-item[data-on="true"] .si-num,selector .step-item[data-on="true"] .si-num .elementor-heading-title{color:#0a3ea8}' +
  'selector .si-title{flex:1}selector .si-title,selector .si-title .elementor-heading-title{font-size:clamp(16px,1.5vw,19px);color:#5a6784;font-weight:500;transition:color .3s;margin:0}' +
  'selector .step-item:hover .si-title,selector .step-item[data-on="true"] .si-title,selector .step-item:hover .si-title .elementor-heading-title,selector .step-item[data-on="true"] .si-title .elementor-heading-title{color:#0b1631}' +
  'selector .si-go{width:auto;color:#0a3ea8;opacity:0;transform:translateX(-6px);transition:all .35s cubic-bezier(.22,1,.36,1);display:inline-flex;line-height:0}selector .si-go p{margin:0;line-height:0;display:inline-flex}' +
  'selector .step-item[data-on="true"] .si-go{opacity:1;transform:none}' +
  // card visual (HTML widget) — precisa esticar no grid
  'selector .sv-holder{height:100%}selector .sv-holder .elementor-widget-container{height:100%}' +
  'selector .steps-visual{position:relative;height:100%;border-radius:26px;padding:clamp(28px,3.5vw,46px);overflow:hidden;display:flex;flex-direction:column;justify-content:center;min-height:340px;background:radial-gradient(130% 120% at 88% 8%,#1650c8 0%,transparent 46%),linear-gradient(150deg,#0a3ea8 0%,#071c56 78%);box-shadow:0 34px 70px -30px rgba(10,40,120,.5)}' +
  'selector .sv-photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transform:scale(1.05);transition:opacity .9s cubic-bezier(.22,1,.36,1),transform 7s cubic-bezier(.22,1,.36,1);z-index:0}' +
  'selector .sv-photo.on{opacity:.55;transform:scale(1)}' +
  'selector .sv-shade{position:absolute;inset:0;z-index:1;background:linear-gradient(150deg,rgba(10,62,168,.58) 0%,rgba(7,24,74,.78) 72%)}' +
  'selector .sv-num{position:absolute;top:clamp(14px,2vw,26px);right:clamp(24px,3vw,40px);font-size:clamp(90px,12vw,168px);font-weight:600;letter-spacing:-.06em;line-height:.8;color:rgba(255,255,255,.16);z-index:2}' +
  'selector .sv-inner{position:relative;z-index:2;animation:svIn .5s cubic-bezier(.22,1,.36,1)}' +
  '@keyframes svIn{from{opacity:0;transform:translateY(16px);filter:blur(7px)}to{opacity:1;transform:none;filter:blur(0)}}' +
  'selector .sv-ic{width:56px;height:56px;border-radius:16px;background:rgba(255,255,255,.12);color:#fff;display:inline-flex;align-items:center;justify-content:center;margin-bottom:22px}selector .sv-ic svg{width:28px;height:28px}' +
  'selector .steps-visual h3{color:#fff;font-size:clamp(22px,2.5vw,30px);letter-spacing:-.03em;margin-bottom:12px}' +
  'selector .steps-visual p{color:#c6d6ff;font-size:15.5px;line-height:1.6;max-width:40ch}' +
  'selector .sv-meta{display:inline-block;margin-top:20px;font-family:\'Geist Mono\',monospace;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#9fc0ff}' +
  'selector .sv-dots{position:absolute;bottom:clamp(22px,3vw,34px);left:clamp(28px,3.5vw,46px);display:flex;gap:8px;z-index:3}' +
  'selector .sv-dots span{width:22px;height:4px;border-radius:4px;background:rgba(255,255,255,.25);cursor:pointer;transition:all .35s}selector .sv-dots span.on{background:#fff;width:36px}' +
  '@media(max-width:1000px){selector .steps2{grid-template-columns:1fr}}';
const stepsJS = `function sinit(){var root=document.querySelector('.steps2');if(!root||root.__s)return;root.__s=1;var PH=${JSON.stringify(STEP_PH)},IC=${JSON.stringify(STEP_IC)},V='${WPUP}';function curD(){var l=window.__XL||document.documentElement.getAttribute('lang')||'pt';return (window.__XS&&window.__XS[l]&&window.__XS[l].how&&window.__XS[l].how.steps)||${JSON.stringify(HOW)};}var D=curD();var n=D.length,active=0,paused=false,timer=0;var items=root.querySelectorAll('.step-item'),fill=root.querySelector('.steps-rail-fill'),photos=root.querySelectorAll('.sv-photo'),dots=root.querySelectorAll('.sv-dots span'),num=root.querySelector('.sv-num'),ic=root.querySelector('.sv-ic'),h3=root.querySelector('.steps-visual h3'),p=root.querySelector('.steps-visual p'),meta=root.querySelector('.sv-meta'),inner=root.querySelector('.sv-inner');function pad(x){return('0'+x).slice(-2);}function render(){items.forEach(function(it,i){it.setAttribute('data-on',i===active);var st=it.querySelector('.si-title');if(st&&D[i])st.textContent=D[i].t;});fill.style.height=(((active+1)/n)*100)+'%';photos.forEach(function(ph,i){ph.className='sv-photo'+(i===active?' on':'');});dots.forEach(function(d,i){d.className=i===active?'on':'';});num.textContent=pad(active+1);ic.innerHTML=IC[active];h3.textContent=D[active].t;p.textContent=D[active].d;meta.textContent=D[active].k;inner.style.animation='none';void inner.offsetWidth;inner.style.animation='svIn .5s cubic-bezier(.22,1,.36,1)';}items.forEach(function(it,i){it.addEventListener('click',function(){active=i;render();});});dots.forEach(function(d,i){d.addEventListener('click',function(){active=i;render();});});root.addEventListener('mouseenter',function(){paused=true;});root.addEventListener('mouseleave',function(){paused=false;});var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&!timer){timer=setInterval(function(){if(!paused){active=(active+1)%n;render();}},4200);}else if(!e.isIntersecting&&timer){clearInterval(timer);timer=0;}});},{threshold:.4});io.observe(root);document.addEventListener('xlang',function(){D=curD();render();});render();}if(document.readyState!=='loading')sinit();else document.addEventListener('DOMContentLoaded',sinit);`;
// lista de etapas NATIVA: cada step-item = container clicável (stepsJS liga o click via .step-item);
// dot = ::before do container; rail/fill = containers (JS seta fill.style.height)
const STEP_GO = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M9 7h8v8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const stepRow = (s, i) => Cn(false, { content_width: 'full', css_classes: 'step-item' }, [
  WK('heading', 'si-num', { title: String(i + 1).padStart(2, '0'), header_size: 'div' }),
  WK('heading', 'si-title', { title: s.t, header_size: 'div' }),
  WK('text-editor', 'si-go', { editor: STEP_GO })]);
const stepsRail = Cn(false, { content_width: 'full', css_classes: 'steps-rail' }, [
  Cn(false, { content_width: 'full', css_classes: 'steps-rail-fill' }, [])]);
const stepsList = Cn(false, { content_width: 'full', css_classes: 'steps-list' }, [stepsRail, ...HOW.map((s, i) => stepRow(s, i))]);
// card visual = HTML (crossfade de fotos + svIn + conteúdo trocado pelo stepsJS = elemento animado)
const stepsVisual = W('html', { _css_classes: 'sv-holder', html:
  '<div class="steps-visual">' +
  STEP_PH.map((ph, i) => `<img class="sv-photo${i === 0 ? ' on' : ''}" src="${photoUrl(ph)}" alt="">`).join('') +
  '<div class="sv-shade"></div><span class="sv-num">01</span>' +
  `<div class="sv-inner"><span class="sv-ic">${STEP_IC[0]}</span><h3>${HOW[0].t}</h3><p>${HOW[0].d}</p><span class="sv-meta">${HOW[0].k}</span></div>` +
  `<div class="sv-dots">${HOW.map((_, i) => `<span class="${i === 0 ? 'on' : ''}"></span>`).join('')}</div>` +
  '</div>' });
const steps2 = Cn(false, { content_width: 'full', css_classes: 'steps2' }, [stepsList, stepsVisual]);
const stepsScript = W('html', { html: `<script>${stepsJS.replace(/<\/script>/g, "<\\/script>")}</script>` });
const comoFunciona = Cn(false, { content_width: 'full', background_background: 'classic', background_color: T.paper,
  custom_css: stepsSectionCSS }, [boxed([
    sectionIntro('Como funciona', 'x-how-eyebrow', 'Do primeiro contato <span class="muted">ao contêiner entregue.</span>', 'x-how-title', 'Fluxo em validação', 'x-how-badge'),
    Cn(true, { content_width: 'full', custom_css: 'selector{margin-top:52px}' }, [steps2, stepsScript])])]);

// helper RowProgress "01 ---- 0N" — globals.css:387
const rowProgress = (total) => W('html', { html:
  `<div class="rowp"><span>01</span><span class="rowp-line"></span><span>${String(total).padStart(2, '0')}</span></div>` +
  '<style>.rowp{display:flex;align-items:center;gap:16px;margin-top:34px;font-family:\'Geist Mono\',monospace;font-size:12px;letter-spacing:.08em;color:#8492ac}.rowp-line{flex:1;height:1px;background:repeating-linear-gradient(90deg,rgba(90,103,132,.4) 0 7px,transparent 7px 13px)}</style>' });

// ================= SEÇÃO 6 · PLATAFORMA (Pillars) — page.js:150 + globals.css:444 =================
const PILL = [
  { icon: 'container', t: 'Rastreamento de contêineres', d: 'Acompanhe a posição e o status de cada carga em tempo real. Sua equipe sabe onde o produto está e quando chega, sem depender de e-mails e ligações.', metric: 'Cada evento do contêiner normalizado em marcos rastreáveis, atualizado em minutos.' },
  { icon: 'analytics', t: 'Relatório semanal de preços', d: 'Receba toda semana o panorama de preços dos principais produtos. Compare, planeje e negocie com base em dados de mercado, com histórico e tendência.', metric: 'Panorama semanal com histórico e tendência dos produtos que você compra.' },
  { icon: 'scoring', t: 'Scoring de fornecedores', d: 'Cada fornecedor é avaliado por desempenho: qualidade, prazo e consistência. Você compra de quem entrega, com critérios claros e mensuráveis.', metric: 'Qualidade, prazo e consistência em um índice claro e comparável.' }];
const PILL_IC = {
  container: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="7" width="19" height="10" rx="1.2"/><path d="M6 7v10M10 7v10M14 7v10M18 7v10"/><path d="M2.5 17.5v1.5M21.5 17.5v1.5"/></svg>',
  analytics: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 3.5v17h17"/><path d="M7 15l3.5-4 3 2.5L20 7"/><circle cx="20" cy="7" r="1.3"/></svg>',
  scoring: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.6 5.3 5.8.85-4.2 4.1 1 5.75L12 16.3 6.8 19l1-5.75-4.2-4.1 5.8-.85z"/></svg>' };
const pillSectionCSS =
  'selector{padding:clamp(80px,9vw,140px) 0}' +
  'selector .pillars{display:grid!important;grid-template-columns:repeat(3,1fr);gap:18px!important;padding:0!important}' +
  'selector .pillar{border-radius:26px;padding:30px!important;border:1px solid transparent;background:#eef1f8;display:flex!important;flex-direction:column;gap:0!important;min-height:460px;transition:transform .4s cubic-bezier(.22,1,.36,1),box-shadow .4s,background .4s;overflow:hidden}' +
  'selector .pillar:hover{transform:translateY(-6px);box-shadow:0 30px 60px -30px rgba(11,22,49,.28);background:#fff}' +
  'selector .pillar-top{display:flex!important;flex-direction:row;align-items:center;justify-content:space-between;gap:0!important;padding:0!important;width:100%}' +
  'selector .pillar-num,selector .pillar-num .elementor-heading-title{font-family:\'Geist Mono\',monospace;font-size:13px;color:#0a3ea8;letter-spacing:.04em;margin:0}selector .pillar-num i{color:#8492ac;font-style:normal}' +
  'selector .pillar-ic{width:46px;height:46px;border-radius:13px;background:#fff;color:#0a3ea8;display:flex!important;align-items:center;justify-content:center;box-shadow:0 6px 16px -8px rgba(4,16,50,.2);flex:0 0 auto;line-height:0;padding:0!important}selector .pillar-ic .elementor-widget-container{display:flex;align-items:center;justify-content:center;width:100%;height:100%;line-height:0}selector .pillar:hover .pillar-ic{background:#eef3ff}selector .pillar-ic svg{width:24px;height:24px;display:block}' +
  'selector .pillar-title{margin:22px 0 10px!important}selector .pillar h3{font-size:22px;letter-spacing:-.03em;color:#0b1631;margin:0}' +
  'selector .pillar-desc,selector .pillar p{color:#5a6784;font-size:14.5px;line-height:1.55;margin:0}' +
  'selector .pillar-metric{margin-top:16px!important}selector .pillar-metric,selector .pillar-metric .elementor-heading-title{font-size:12.5px;color:#0a3ea8;font-family:\'Geist Mono\',monospace;line-height:1.5;border-left:2px solid #d6e2ff;padding-left:12px;margin:0}' +
  'selector .pillar-viz{margin-top:auto!important;padding-top:26px}' +
  'selector .viz-map{position:relative;height:130px;border-radius:12px;background:#eef3ff;overflow:hidden}selector .viz-track{position:absolute;inset:0}' +
  'selector .viz-num{display:flex;align-items:baseline;gap:8px}selector .viz-num .v{font-size:40px;font-weight:600;letter-spacing:-.04em;color:#0b1631}' +
  'selector .pill-badge{font-family:\'Geist Mono\',monospace;font-size:12px;font-weight:500;padding:4px 9px;border-radius:100px;letter-spacing:.02em}selector .pill-up{background:#e4f6ec;color:#157a48}' +
  'selector .viz-bars{display:flex;align-items:flex-end;gap:6px;height:90px;margin-top:8px}selector .viz-bars i{flex:1;border-radius:5px 5px 2px 2px;background:#d6e2ff;height:8%;transition:height .8s cubic-bezier(.22,1,.36,1)}selector .viz-bars i.hot{background:linear-gradient(180deg,#2e6bf0,#0a3ea8)}' +
  'selector .score-row{display:flex;flex-direction:column;gap:12px}selector .score-item .sl{display:flex;justify-content:space-between;font-size:12.5px;color:#5a6784;margin-bottom:5px}' +
  'selector .score-bar{height:7px;border-radius:100px;background:#eef3ff;overflow:hidden}selector .score-bar span{display:block;height:100%;border-radius:100px;background:linear-gradient(90deg,#0a3ea8,#2e6bf0);width:0;transition:width 1s cubic-bezier(.22,1,.36,1)}' +
  '@media(max-width:1000px){selector .pillars{grid-template-columns:1fr}}';
const vizFor = (i) => {
  if (i === 0) return '<div class="viz-map"><svg class="viz-track" viewBox="0 0 320 130" preserveAspectRatio="xMidYMid slice"><g fill="rgba(10,62,168,0.1)">' +
    Array.from({ length: 7 }).map((_, r) => Array.from({ length: 16 }).map((_, c) => `<circle cx="${12 + c * 20}" cy="${12 + r * 18}" r="1.5"/>`).join('')).join('') +
    '</g><path class="viz-path" d="M30 100 C 110 40 200 120 290 44" fill="none" stroke="#2e6bf0" stroke-width="2.4" stroke-linecap="round" pathLength="1" style="stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset 1.4s ease"/><circle cx="30" cy="100" r="5" fill="#0a3ea8"/><circle cx="290" cy="44" r="6" fill="#2e6bf0" stroke="#fff" stroke-width="2"/></svg></div>';
  if (i === 1) return '<div class="viz-num"><span class="v" data-count="4820">0</span><span class="pill-badge pill-up">+2,4%</span></div><div class="viz-bars">' +
    [40, 62, 54, 74, 66, 90].map((h, k) => `<i class="${k === 5 ? 'hot' : ''}" data-h="${h}"></i>`).join('') + '</div>';
  return '<div class="score-row">' + [['Qualidade', 94], ['Prazo', 88], ['Consistência', 91]].map(([l, v]) => `<div class="score-item"><div class="sl"><span>${l}</span><span>${v}</span></div><div class="score-bar"><span data-w="${v}"></span></div></div>`).join('') + '</div>';
};
const pillJS = `function pinit(){if(document.body.classList.contains('elementor-editor-active'))return;var root=document.querySelector('.pillars');if(!root||root.__p)return;root.__p=1;function run(){root.querySelectorAll('.pillar').forEach(function(p){p.classList.add('xin');});root.querySelectorAll('.viz-path').forEach(function(p){p.style.strokeDashoffset='0';});root.querySelectorAll('.viz-bars i').forEach(function(b,k){setTimeout(function(){b.style.height=b.getAttribute('data-h')+'%';},k*60);});root.querySelectorAll('.score-bar span').forEach(function(s,k){setTimeout(function(){s.style.width=s.getAttribute('data-w')+'%';},k*120);});root.querySelectorAll('.v[data-count]').forEach(function(el){var end=+el.getAttribute('data-count'),t0=null;function step(ts){if(!t0)t0=ts;var p=Math.min((ts-t0)/1200,1);el.textContent=Math.round(end*p).toLocaleString('pt-BR');if(p<1)requestAnimationFrame(step);}requestAnimationFrame(step);});}var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){run();io.disconnect();}});},{threshold:0,rootMargin:'0px 0px -12% 0px'});io.observe(root);}if(document.readyState!=='loading')pinit();else document.addEventListener('DOMContentLoaded',pinit);`;
// card nativo: top(ícone+número) + título(h3) + desc + métrica + viz(HTML só o gráfico animado)
const pillCard = (p, i) => Cn(false, { content_width: 'full', css_classes: 'pillar' }, [
  Cn(false, { content_width: 'full', css_classes: 'pillar-top' }, [
    WK('text-editor', 'pillar-ic', { editor: PILL_IC[p.icon] }),
    WK('heading', 'pillar-num', { title: `${String(i + 1).padStart(2, '0')}<i>/ 0${PILL.length}</i>`, header_size: 'div' })]),
  WK('heading', 'pillar-title', { title: p.t, header_size: 'h3' }),
  WK('text-editor', 'pillar-desc', { editor: `<p>${p.d}</p>` }),
  WK('heading', 'pillar-metric', { title: p.metric, header_size: 'div' }),
  W('html', { html: vizFor(i), _css_classes: 'pillar-viz' })]);
const pillGrid = Cn(false, { content_width: 'full', css_classes: 'pillars' }, PILL.map((p, i) => pillCard(p, i)));
// 1 script observa .pillars e anima as vizzes (linha/barras/score/contador) dentro dos widgets HTML
const pillScript = W('html', { html: `<script>${pillJS.replace(/<\/script>/g, "<\\/script>")}</script>` });
const plataforma = Cn(false, { content_width: 'full', background_background: 'classic', background_color: T.paper,
  custom_css: pillSectionCSS }, [boxed([
    sectionIntro('A plataforma', 'x-plat-eyebrow', 'Uma plataforma própria para <span class="muted">acompanhar cada etapa da sua compra.</span>', 'x-plat-title', null, null),
    Cn(true, { content_width: 'full', custom_css: 'selector{margin-top:52px}' }, [pillGrid, pillScript]),
    rowProgress(PILL.length),
    Cn(true, { content_width: 'full', custom_css: 'selector{display:flex;justify-content:center;margin-top:clamp(32px,4vw,48px)}' }, [btnDark('Acessar a plataforma', 'x-plat-cta', 'https://painel.jrspice.com')])])]);

// ================= SEÇÃO 7 · PRODUTOS (grid editorial) — page.js:162 + globals.css:473 =================
const PROD = [
  { photo: 'frutas-secas', t: 'Frutas secas', items: ['Ameixa', 'Semente de abóbora'] },
  { photo: 'especiarias', t: 'Especiarias', items: ['Alho', 'Cebola', 'Canela', 'Orégano', 'Cominho', 'Mostarda', 'Sal rosa do Himalaia', 'Gengibre'] },
  { photo: 'ervas', t: 'Ervas', items: ['Salsa', 'Tomilho', 'Camomila', 'Erva-doce'] },
  { photo: 'vegetais-desidratados', t: 'Vegetais desidratados', items: ['Tomate', 'Cenoura', 'Pimentão', 'Beterraba'] },
  { photo: 'aditivos', t: 'Aditivos', items: ['Goma guar', 'Glutamato monossódico'] },
  { photo: 'naturais', t: 'Naturais', items: ['Funghi', 'Açúcar de coco', 'Coco ralado', 'Farinha de coco', 'Leite de coco em pó'] }];
const PARTNERS = [{ logo: `${WPUP}/brazilcoa-2.png`, name: 'Brazilcoa', tag: 'Cacau' }, { logo: `${WPUP}/sacconi-2.png`, name: 'Sacconi', tag: 'Pimenta-do-reino' }];
// CSS da seção (vai no custom_css do container-seção — "configurações avançadas"). Escopado em `selector`,
// ciente dos wrappers .elementor-* que o Elementor injeta em cada widget nativo.
const prodSectionCSS =
  'selector{padding:clamp(80px,9vw,140px) 0}' +
  // grid de cards
  'selector .prodx{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}' +
  'selector .prodx-card{position:relative;aspect-ratio:3/4;border-radius:26px;overflow:hidden;background:#0a3ea8;padding:0}' +
  'selector .prodx-img{position:absolute!important;inset:0;z-index:0;margin:0;width:100%;height:100%}' +
  'selector .prodx-img img{width:100%;height:100%;object-fit:cover;object-position:center 35%;filter:grayscale(.4) contrast(1.03) brightness(1.04);transition:transform .9s cubic-bezier(.22,1,.36,1);display:block;border-radius:0}' +
  'selector .prodx-card:hover .prodx-img img{transform:scale(1.07)}' +
  'selector .prodx-card::before{content:"";position:absolute;inset:0;z-index:1;background:#0a3ea8;mix-blend-mode:color;opacity:.42;pointer-events:none}' +
  'selector .prodx-card::after{content:"";position:absolute;inset:0;z-index:2;background:linear-gradient(180deg,rgba(7,18,50,.12) 30%,rgba(7,18,50,.4) 66%,rgba(4,7,18,.8) 100%);pointer-events:none}' +
  'selector .prodx-num{position:absolute!important;top:20px;right:22px;z-index:3;margin:0;width:auto}' +
  'selector .prodx-num .elementor-heading-title{font-family:\'Geist Mono\',monospace;font-size:12px;letter-spacing:.08em;color:rgba(255,255,255,.72)}' +
  'selector .prodx-cap{position:absolute!important;left:24px;right:68px;bottom:24px;z-index:3;width:auto;transition:transform .45s cubic-bezier(.22,1,.36,1)}' +
  'selector .prodx-card:hover .prodx-cap{transform:translateY(-4px);opacity:0}' +
  'selector .prodx-cap h3{color:#fff;font-size:clamp(20px,1.7vw,25px);font-weight:600;letter-spacing:-.025em;line-height:1.1;margin:0}' +
  'selector .prodx-go{position:absolute!important;right:20px;bottom:20px;z-index:4;width:40px;height:40px;border-radius:50%;background:#fff;color:#0b1631;display:flex;align-items:center;justify-content:center;opacity:0;transform:translateY(10px) scale(.85);transition:opacity .45s cubic-bezier(.22,1,.36,1),transform .45s cubic-bezier(.22,1,.36,1);margin:0}' +
  'selector .prodx-go .elementor-widget-container,selector .prodx-go .elementor-icon{display:flex;align-items:center;justify-content:center}' +
  'selector .prodx-go i{font-size:15px;transform:rotate(-45deg);color:#0b1631}' +
  'selector .prodx-card:hover .prodx-go{opacity:1;transform:none}' +
  'selector .prodx-hover{position:absolute!important;inset:0;z-index:4;display:flex;flex-direction:column;gap:14px;padding:24px;background:linear-gradient(180deg,rgba(7,18,50,.90),rgba(4,7,18,.97));opacity:0;transition:opacity .4s cubic-bezier(.22,1,.36,1);width:auto}' +
  'selector .prodx-card:hover .prodx-hover{opacity:1}' +
  'selector .prodx-hover-t,selector .prodx-hover-t .elementor-heading-title{color:#fff;font-size:clamp(18px,1.5vw,23px);font-weight:600;letter-spacing:-.025em;margin:0}' +
  'selector .prodx-hover-t{width:auto}' +
  'selector .prodx-chips .elementor-widget-container>ul,selector .prodx-chips ul{display:flex;flex-wrap:wrap;align-content:flex-start;gap:8px;margin:0;padding:0}' +
  'selector .prodx-chips li{list-style:none;font-size:12.5px;color:#eaf0ff;padding:5px 12px;border:1px solid rgba(255,255,255,.22);border-radius:100px;background:rgba(255,255,255,.07)}' +
  // bloco parceiros brasileiros
  'selector .brz{margin-top:clamp(48px,6vw,88px);display:grid;grid-template-columns:1fr 1.1fr;gap:clamp(28px,4vw,60px);align-items:center}' +
  'selector .brz-head{max-width:none}' +
  'selector .brz-eb,selector .brz-eb p{font-family:\'Geist Mono\',monospace;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#2e6bf0;display:inline-flex;align-items:center;gap:12px;font-weight:500;margin:0}selector .brz-eb::before{content:"";width:7px;height:7px;background:#c4922e;transform:rotate(45deg);border-radius:1px}' +
  'selector .brz-title,selector .brz-title .elementor-heading-title{font-size:clamp(26px,2.4vw,36px);margin:14px 0 12px;letter-spacing:-.03em;color:#0b1631;font-weight:600}selector .brz-title .muted{color:#8492ac}' +
  'selector .brz-lede,selector .brz-lede p{color:#5a6784;font-size:clamp(16px,1.25vw,19px);line-height:1.6;max-width:430px;margin:0}' +
  'selector .brz-partners{display:grid;grid-template-columns:1fr 1fr;gap:16px}' +
  'selector .brz-card{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:clamp(26px,3vw,40px);background:#fff;border:1px solid #e4e8f2;border-radius:26px;box-shadow:0 6px 16px -8px rgba(4,16,50,.15);transition:transform .3s cubic-bezier(.22,1,.36,1),box-shadow .3s}' +
  'selector .brz-card:hover{transform:translateY(-4px);box-shadow:0 30px 60px -30px rgba(11,22,49,.28)}' +
  'selector .brz-logo{width:auto;margin:0}selector .brz-logo img{max-width:180px;max-height:60px;width:auto;height:auto;object-fit:contain}' +
  'selector .brz-tag,selector .brz-tag p{font-family:\'Geist Mono\',monospace;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#0a3ea8;margin:0}selector .brz-tag{display:inline-flex;border:1px solid #d6e2ff;background:#eef3ff;padding:5px 12px;border-radius:100px;width:auto}' +
  '@media(max-width:860px){selector .prodx{grid-template-columns:repeat(2,1fr)}selector .brz{grid-template-columns:1fr}}';
// arrow reutiliza o mesmo motivo dos botões (fa-arrow-right rotacionado -45)
const PROD_ARROW = { value: 'fas fa-arrow-right', library: 'fa-solid' };
// card nativo: image + num + cap(h3) + go(icon) + hover(container: título + chips)
const prodCard = (c, i) => Cn(false, { content_width: 'full', css_classes: 'prodx-card' }, [
  W('image', { image: { url: `${WPUP}/${c.photo}-1.jpg`, id: '', alt: c.t, source: 'library', size: '' }, image_size: 'full', _css_classes: 'prodx-img' }),
  WK('heading', 'prodx-num', { title: String(i + 1).padStart(2, '0'), header_size: 'div' }),
  Cn(false, { content_width: 'full', css_classes: 'prodx-cap' }, [
    W('heading', { title: c.t, header_size: 'h3' })]),
  WK('icon', 'prodx-go', { selected_icon: PROD_ARROW }),
  Cn(false, { content_width: 'full', css_classes: 'prodx-hover' }, [
    WK('heading', 'prodx-hover-t', { title: c.t, header_size: 'div' }),
    WK('text-editor', 'prodx-chips', { editor: `<ul>${[...c.items, 'Etc.'].map((it) => `<li>${it}</li>`).join('')}</ul>` })])]);
const prodGrid = Cn(false, { content_width: 'full', css_classes: 'prodx' }, PROD.map((c, i) => prodCard(c, i)));
// bloco parceiros (brz) nativo
const brzHead = Cn(false, { content_width: 'full', css_classes: 'brz-head', flex_direction: 'column', flex_align_items: 'flex-start' }, [
  WK('text-editor', 'brz-eb', { editor: '<p>Produtos brasileiros</p>' }),
  WK('heading', 'brz-title', { title: 'Parceiros na <span class="muted">origem.</span>', header_size: 'h3' }),
  WK('text-editor', 'brz-lede', { editor: '<p>No Brasil, trabalhamos lado a lado com produtores de referência para levar o melhor da origem ao mercado internacional.</p>' })]);
const brzCards = Cn(false, { content_width: 'full', css_classes: 'brz-partners' }, PARTNERS.map((p) =>
  Cn(false, { content_width: 'full', css_classes: 'brz-card' }, [
    W('image', { image: { url: p.logo, id: '', alt: p.name, source: 'library', size: '' }, image_size: 'full', _css_classes: 'brz-logo' }),
    WK('text-editor', 'brz-tag', { editor: `<p>${p.tag}</p>` })])));
const prodBrz = Cn(false, { content_width: 'full', css_classes: 'brz' }, [brzHead, brzCards]);
const prodHead = Cn(true, { content_width: 'full', custom_css:
  'selector{display:grid!important;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);align-items:end;gap:clamp(28px,5vw,72px);margin-bottom:clamp(36px,4vw,56px)}@media(max-width:760px){selector{grid-template-columns:1fr;gap:18px}}' }, [
  Cn(true, { content_width: 'full', flex_direction: 'column', flex_align_items: 'flex-start', custom_css: 'selector{max-width:620px}' }, [
    eyebrowW('Produtos', 'x-prod-eyebrow'),
    WK('heading', 'x-prod-title', { title: 'As linhas de <span class="muted">produtos que trabalhamos.</span>', header_size: 'h2', title_color: T.ink, typography_typography: 'custom', typography_font_family: 'Geist', typography_font_weight: '600', typography_letter_spacing: U(-0.04, 'em'), typography_line_height: U(1.04, 'em'), _margin: bx(16, 0, 0, 0), custom_css: 'selector .elementor-heading-title{font-size:clamp(26px,3.3vw,44px)}selector .muted{color:#8492ac}' })]),
  WK('text-editor', 'x-prod-text', { editor: '<p>Trabalhamos com uma alta variedade de ingredientes e produtos alimentícios do mercado internacional. Cada categoria conta com fornecedores homologados e dados de preço atualizados semanalmente.</p>', text_color: T.slate, typography_typography: 'custom', typography_font_family: 'Geist', typography_line_height: U(1.6, 'em'), custom_css: 'selector{max-width:430px;padding-bottom:6px}selector .elementor-widget-container{font-size:clamp(16px,1.25vw,19px)}selector p{margin:0;font-size:inherit}' })]);
const produtos = Cn(false, { content_width: 'full', background_background: 'classic', background_color: T.paper, custom_css: prodSectionCSS },
  [boxed([prodHead, prodGrid, prodBrz, rowProgress(PROD.length)])]);

// ================= SEÇÃO 8 · ORIGENS (mapa) — page.js:208 + globals.css:576 =================
// Adaptação: mapa base (world-map.svg por URL) + marcadores de origem + card interativo (sem os 796KB de per-country paths)
// itens = produtos por país (mostrados ao clicar/hover no mapa) — CONFERIR com o cliente antes de publicar
const ORIG = [
  { c: 'Brasil', iso: 'br', x: 33, y: 70, desc: 'Origem e relacionamento direto com produtores, do campo ao contêiner.', cats: ['Especiarias', 'Naturais', 'Frutas secas'], items: ['Pimenta-do-reino', 'Cacau', 'Açúcar de coco', 'Gengibre'] },
  { c: 'Índia', iso: 'in', x: 69, y: 48, desc: 'Especiarias e ervas de referência mundial, com escala e variedade.', cats: ['Especiarias', 'Ervas', 'Aditivos'], items: ['Cominho', 'Gengibre', 'Camomila', 'Goma guar', 'Erva-doce'] },
  { c: 'China', iso: 'cn', x: 78, y: 43, desc: 'Maior polo de vegetais desidratados e aditivos, com escala e regularidade.', cats: ['Vegetais desidratados', 'Especiarias', 'Aditivos'], items: ['Alho', 'Cebola', 'Semente de abóbora', 'Glutamato monossódico'] },
  { c: 'Vietnã', iso: 'vn', x: 77, y: 52, desc: 'Um dos maiores polos de especiarias do sudeste asiático.', cats: ['Especiarias', 'Naturais'], items: ['Pimenta-do-reino', 'Canela', 'Coco ralado'] },
  { c: 'Indonésia', iso: 'id', x: 80, y: 63, desc: 'Arquipélago de especiarias e produtos naturais de alto valor.', cats: ['Especiarias', 'Naturais'], items: ['Canela', 'Coco ralado', 'Leite de coco em pó', 'Farinha de coco'] },
  { c: 'Sri Lanka', iso: 'lk', x: 70, y: 57, desc: 'Especiarias e ervas premium reconhecidas pela qualidade.', cats: ['Especiarias', 'Ervas'], items: ['Canela', 'Coco ralado', 'Erva-doce'] },
  { c: 'Peru', iso: 'pe', x: 27, y: 63, desc: 'Produtos naturais e frutas secas dos Andes.', cats: ['Naturais', 'Frutas secas'], items: ['Gengibre', 'Semente de abóbora', 'Ameixa'] },
  { c: 'Turquia', iso: 'tr', x: 58, y: 40, desc: 'Ponte entre Europa e Ásia para vegetais desidratados e especiarias.', cats: ['Vegetais desidratados', 'Especiarias', 'Frutas secas'], items: ['Tomate', 'Pimentão', 'Orégano', 'Cominho', 'Ameixa'] },
  { c: 'Madagascar', iso: 'mg', x: 59, y: 70, desc: 'Produtos naturais de origem sustentável com qualidade e rastreabilidade.', cats: ['Especiarias', 'Naturais'], items: ['Canela', 'Gengibre', 'Coco ralado'] },
  // CONFERIR com o cliente: origem citada no vídeo (28/jul) sem lista de itens — mostarda é o elo com o catálogo
  { c: 'Canadá', iso: 'ca', x: 22, y: 28, desc: 'Origem de referência em mostarda e grãos especiais do hemisfério norte.', cats: ['Especiarias'], items: ['Mostarda'] }];
// bandeira da China embutida (data-URI) — as demais vêm da Media do WP
const FLAG_INLINE = {
  cn: readFileSync(new URL('./assets/flag-cn.datauri.txt', import.meta.url), 'utf8').trim(),
  ca: readFileSync(new URL('./assets/flag-ca.datauri.txt', import.meta.url), 'utf8').trim(),
};
const flagUrl = (iso) => FLAG_INLINE[iso] || `${WPUP}/flag-${iso}.png`;
const origCSS =
  ".origw,.origw *{font-family:'Geist','GeistSans',ui-sans-serif,system-ui,sans-serif;box-sizing:border-box}" +
  '.origw{display:flex;flex-direction:column;align-items:center;text-align:center}' +
  '.orig-head2{max-width:720px}.orig-statrow{display:flex;align-items:center;justify-content:center;gap:20px;margin-top:22px}' +
  '.orig-stat-i{display:inline-flex;align-items:center;gap:9px;font-family:\'Geist Mono\',monospace;font-size:13px;letter-spacing:.06em;color:#0a3ea8}.orig-div{width:1px;height:20px;background:#e4e8f2}' +
  '.orig-chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;max-width:860px;margin:22px auto 32px}' +
  '.orig-chip{font-size:13.5px;padding:9px 15px;border-radius:100px;border:1px solid #e4e8f2;background:#fff;color:#5a6784;cursor:pointer;transition:all .25s cubic-bezier(.22,1,.36,1)}' +
  '.orig-chip[data-on="true"]{background:#0a3ea8;color:#fff;border-color:#0a3ea8}.orig-chip:hover:not([data-on="true"]){border-color:#2e6bf0;color:#0a3ea8}' +
  '.wmap-panel{position:relative;width:100%;background:#eef3f8;border-radius:26px;min-height:clamp(320px,40vw,560px);padding:clamp(20px,2.5vw,40px);overflow:hidden}' +
  '.wmap-panel::before{content:"";position:absolute;inset:0;opacity:.5;background-image:radial-gradient(rgb(183,197,210) 1px,transparent 1px);background-size:22px 22px;-webkit-mask-image:radial-gradient(circle,#000,transparent 72%);mask-image:radial-gradient(circle,#000,transparent 72%)}' +
  '.wmap{position:relative;z-index:1;width:100%;height:auto;display:block;filter:drop-shadow(rgba(16,35,61,.12) 0 14px 20px)}' +
  '.wc{fill:#d3ddea;stroke:#eef3f8;stroke-width:.6;stroke-linejoin:round;outline:none;transition:fill .2s cubic-bezier(.22,1,.36,1),filter .2s}' +
  '.wc:hover{fill:#c2cede}' +
  '.wc.served{fill:#2e6bf0;cursor:pointer}.wc.served:hover{fill:#4d84ff}' +
  '.wc.served[data-on="true"]{fill:#0a3ea8;filter:drop-shadow(rgba(8,32,90,.35) 0 6px 8px)}' +
  '.wmap-connector{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:visible}' +
  '.wmap-status{position:absolute;z-index:4;top:18px;left:18px;display:flex;align-items:center;gap:9px;padding:7px 13px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#0b1631;background:rgba(255,255,255,.9);backdrop-filter:blur(8px);border-radius:100px;box-shadow:rgba(16,35,61,.08) 0 7px 20px}.wmap-status>span{width:7px;height:7px;border-radius:50%;background:#0a3ea8;box-shadow:0 0 0 4px rgba(46,107,240,.16)}' +
  '.wmap-card{position:absolute;z-index:5;right:clamp(16px,2vw,30px);top:clamp(16px,2vw,30px);width:min(300px,82%);background:#fff;border:1px solid #e4e8f2;border-radius:16px;padding:20px;text-align:left;box-shadow:0 22px 54px -20px rgba(5,20,44,.32)}' +
  // o card foge do país selecionado: vai pra esquerda quando a origem está na metade direita do mapa
  '.wmap-card{transition:left .45s cubic-bezier(.22,1,.36,1),right .45s cubic-bezier(.22,1,.36,1)}' +
  '.wmap-card.is-left{right:auto;left:clamp(16px,2vw,30px)}' +
  '.wmap-card-head{display:flex;align-items:center;gap:12px}.wmap-flag{width:34px;height:24px;object-fit:cover;border-radius:5px;border:1px solid #e4e8f2;flex:none}' +
  '.wmap-card-c{font-size:19px;font-weight:700;color:#0b1631;letter-spacing:-.02em}.wmap-card-desc{margin-top:12px;font-size:13.5px;line-height:1.5;color:#5a6784}' +
  '.wmap-card-lines{margin-top:16px;padding-top:14px;border-top:1px dashed #e4e8f2}.wmap-card-lbl{font-family:\'Geist Mono\',monospace;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#8492ac;display:block;margin-bottom:8px}' +
  '.wmap-line-row{display:flex;align-items:center;gap:11px;padding:9px 6px;border-radius:9px;color:#0b1631;transition:background .2s;text-decoration:none}.wmap-line-row:hover{background:#eef3ff}' +
  '.wmap-line-ic{width:26px;height:26px;border-radius:7px;background:#eef3ff;color:#0a3ea8;display:grid;place-items:center;flex:none}.wmap-line-t{font-size:14px;font-weight:500;flex:1}.wmap-line-go{color:#8492ac;display:inline-flex}' +
  '.wmap-legend{position:absolute;z-index:2;bottom:16px;left:clamp(16px,2vw,30px);display:flex;gap:16px;font-size:12px;letter-spacing:.05em;text-transform:uppercase;color:#66778a}.wmap-legend span{display:flex;align-items:center;gap:7px}.wmap-legend i{width:11px;height:11px;border-radius:3px;background:#d3ddea}.wmap-legend i.lg-served{background:#0a3ea8}' +
  '.wmap-card-items{margin-top:14px;padding-top:14px;border-top:1px dashed #e4e8f2}' +
  '.wmap-items-wrap{display:flex;flex-wrap:wrap;gap:6px}' +
  '.wmap-item{font-size:12px;color:#0a3ea8;background:#eef3ff;border:1px solid #d6e2ff;border-radius:100px;padding:4px 10px;line-height:1.3}' +
  // CTA para o sistema (pedido no vídeo 28/jul: mostrar alguns itens + "veja mais itens no sistema")
  '.wmap-more{display:inline-flex;align-items:center;gap:6px;margin-top:12px;font-size:12.5px;font-weight:500;color:#0a3ea8;text-decoration:none;transition:gap .25s}' +
  '.wmap-more:hover{gap:10px;color:#0b1631}.wmap-more svg{width:13px;height:13px}' +
  '.orig-note{margin-top:18px;font-size:12px;color:#8492ac}' +
  '@media(max-width:860px){.wmap-card{position:static;width:100%;margin-top:16px;box-shadow:0 6px 16px -8px rgba(4,16,50,.15)}.wmap-legend{position:static;justify-content:center;margin-top:14px}}';
const origLeaf = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 9-9 3 0 6 1 7 2 0 8-4 14-9 14zM4 20c2-6 6-9 12-11"/></svg>';
const origChev = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const origJS = `function oinit(){var root=document.querySelector('.origw');if(!root||root.__o)return;root.__o=1;var V='${WPUP}',LEAF=${JSON.stringify(origLeaf)},CH=${JSON.stringify(origChev)};var base=${JSON.stringify(ORIG.map((o) => ({ c: o.c, iso: o.iso, flag: flagUrl(o.iso), desc: o.desc, cats: o.cats, items: o.items })))};function curD(){var l=window.__XL||document.documentElement.getAttribute('lang')||'pt';var s=window.__XS&&window.__XS[l]&&window.__XS[l].orig;return s?s.countries.map(function(c,i){return {c:c.c,iso:base[i].iso,flag:base[i].flag,desc:c.desc,cats:c.cats,items:c.items||base[i].items};}):base;}var D=curD();var sel=0;var chips=root.querySelectorAll('.orig-chip'),paths=root.querySelectorAll('.wc.served'),card=root.querySelector('.wmap-card'),svg=root.querySelector('.wmap'),panel=root.querySelector('.wmap-panel'),conn=root.querySelector('.wmap-connector');var isoIdx={};base.forEach(function(b,i){isoIdx[b.iso]=i;});function side(iso){if(!svg||!panel||!card)return;var p=svg.querySelector('[data-iso="'+iso+'"]');if(!p)return;var pr=panel.getBoundingClientRect(),b=p.getBoundingClientRect();if(!pr.width||!b.width)return;var cx=(b.left+b.width/2-pr.left)/pr.width;card.classList.toggle('is-left',cx>0.55);}
function drawConn(iso){if(!conn||!svg||!panel||!card)return;var p=svg.querySelector('[data-iso="'+iso+'"]');if(!p)return;var pr=panel.getBoundingClientRect();var b=p.getBoundingClientRect();var cr=card.getBoundingClientRect();if(!pr.width||!b.width){conn.innerHTML='';return;}var dx=b.left+b.width/2-pr.left,dy=b.top+b.height/2-pr.top;var cx=cr.left-pr.left,cy=cr.top+cr.height/2-pr.top;if(cx<dx)cx=cr.right-pr.left;var mx=(dx+cx)/2;conn.setAttribute('viewBox','0 0 '+pr.width+' '+pr.height);conn.setAttribute('width',pr.width);conn.setAttribute('height',pr.height);conn.innerHTML='<circle cx="'+dx+'" cy="'+dy+'" r="12" fill="#0a3ea8" opacity="0.16"/><path d="M '+dx+' '+dy+' C '+mx+' '+dy+', '+mx+' '+cy+', '+cx+' '+cy+'" fill="none" stroke="#0a3ea8" stroke-width="1.6" opacity="0.5" stroke-linecap="round"/><circle cx="'+dx+'" cy="'+dy+'" r="5" fill="#0a3ea8" stroke="#fff" stroke-width="2"/>';}function render(){var d=D[sel];chips.forEach(function(c,i){c.setAttribute('data-on',i===sel);if(D[i])c.textContent=D[i].c;});paths.forEach(function(p){p.setAttribute('data-on',p.getAttribute('data-iso')===d.iso?'true':'false');});card.querySelector('.wmap-flag').src=d.flag||(V+'/flag-'+d.iso+'.png');card.querySelector('.wmap-card-c').textContent=d.c;card.querySelector('.wmap-card-desc').textContent=d.desc;card.querySelector('.wmap-lines-wrap').innerHTML=d.cats.map(function(ct){return '<a class="wmap-line-row" href="#produtos"><span class="wmap-line-ic">'+LEAF+'</span><span class="wmap-line-t">'+ct+'</span><span class="wmap-line-go">'+CH+'</span></a>';}).join('');var iw=card.querySelector('.wmap-items-wrap');if(iw)iw.innerHTML=(d.items||[]).map(function(it){return '<span class="wmap-item">'+it+'</span>';}).join('');side(d.iso);drawConn(d.iso);}function statics(){var l=window.__XL||document.documentElement.getAttribute('lang')||'pt';var s=window.__XS&&window.__XS[l]&&window.__XS[l].orig;if(!s)return;var st=root.querySelector('.wmap-status');if(st){var n=st.childNodes[st.childNodes.length-1];if(n&&n.nodeType===3)n.textContent=s.status;}var lg=root.querySelectorAll('.wmap-legend span');[s.legendA,s.legendO].forEach(function(v,i){if(lg[i]){var n2=lg[i].childNodes[lg[i].childNodes.length-1];if(n2&&n2.nodeType===3)n2.textContent=v;}});var lb=root.querySelector('.wmap-card-lines .wmap-card-lbl');if(lb)lb.textContent=s.linesL;var lb2=root.querySelector('.wmap-items-lbl');if(lb2&&s.itemsL)lb2.textContent=s.itemsL;var no=root.querySelector('.orig-note');if(no)no.textContent=s.note;}chips.forEach(function(c,i){c.addEventListener('click',function(){sel=i;render();});});paths.forEach(function(p){var iso=p.getAttribute('data-iso');function pick(){if(isoIdx[iso]!=null){sel=isoIdx[iso];render();}}p.addEventListener('click',pick);p.addEventListener('mouseenter',pick);});window.addEventListener('resize',function(){drawConn(D[sel].iso);});document.addEventListener('xlang',function(){D=curD();statics();render();});statics();render();setTimeout(function(){drawConn(D[sel].iso);},140);}if(document.readyState!=='loading')oinit();else document.addEventListener('DOMContentLoaded',oinit);`;
const SERVED_ISO = ORIG.map((o) => o.iso); // br,in,vn,id,lk,pe,tr,mg (ordem = ORIG)
const mapPaths = WORLD.countries.map((c) => { const s = SERVED_ISO.indexOf(c.id) >= 0; return `<path d="${c.d}"${s ? ` class="wc served" data-iso="${c.id}"` : ' class="wc"'}/>`; }).join('');
const origWidget = W('html', { html:
  '<div class="origw">' +
  '<div class="orig-chips">' + ORIG.map((o, i) => `<button class="orig-chip" data-on="${i === 0}">${o.c}</button>`).join('') + '</div>' +
  '<div class="wmap-panel">' +
  `<svg class="wmap" viewBox="0 58 1010 505" role="img" aria-label="Mapa-múndi de origens">${mapPaths}</svg>` +
  '<div class="wmap-status"><span></span>15 países · 150+ produtos</div>' +
  '<svg class="wmap-connector" aria-hidden="true"></svg>' +
  `<div class="wmap-card"><div class="wmap-card-head"><img class="wmap-flag" src="${flagUrl(ORIG[0].iso)}" alt=""><span class="wmap-card-c">${ORIG[0].c}</span></div><p class="wmap-card-desc">${ORIG[0].desc}</p><div class="wmap-card-lines"><span class="wmap-card-lbl">Linhas</span><div class="wmap-lines-wrap">${ORIG[0].cats.map((ct) => `<a class="wmap-line-row" href="#produtos"><span class="wmap-line-ic">${origLeaf}</span><span class="wmap-line-t">${ct}</span><span class="wmap-line-go">${origChev}</span></a>`).join('')}</div></div><div class="wmap-card-items"><span class="wmap-card-lbl wmap-items-lbl">Produtos</span><div class="wmap-items-wrap">${ORIG[0].items.map((it) => `<span class="wmap-item">${it}</span>`).join('')}</div><a class="wmap-more" href="#plataforma">Veja mais itens no sistema ${origChev}</a></div></div>` +
  '<div class="wmap-legend"><span><i class="lg-served"></i>Origem ativa</span><span><i></i>Demais países</span></div>' +
  '</div>' +
  '<p class="orig-note">Cobertura ilustrativa, origens em expansão.</p>' +
  '</div>' + `<style>${origCSS}</style>` +
  `<script>${origJS.replace(/<\/script>/g, "<\\/script>")}</script>` });
const origHead = Cn(true, { content_width: 'full', flex_direction: 'column', custom_css: 'selector{align-items:center;text-align:center;max-width:720px;margin:0 auto}selector .x-orig-eyebrow .elementor-widget-container{display:flex;justify-content:center}' }, [
  eyebrowW('Presença global', 'x-orig-eyebrow'),
  WK('heading', 'x-orig-title', { title: 'Da origem à <span class="muted">sua linha de produção.</span>', header_size: 'h2', title_color: T.ink, typography_typography: 'custom', typography_font_family: 'Geist', typography_font_weight: '600', typography_letter_spacing: U(-0.04, 'em'), typography_line_height: U(1.04, 'em'), _margin: bx(16, 0, 14, 0), align: 'center', custom_css: 'selector .elementor-heading-title{font-size:clamp(26px,3.3vw,44px);text-align:center}selector .muted{color:#8492ac}' }),
  WK('text-editor', 'x-orig-text', { editor: '<p>Mais de 150 produtos em 15 países, com escritórios no Brasil e em Portugal. Selecione uma origem no mapa e veja as linhas e os produtos que trabalhamos em cada mercado.</p>', text_color: T.slate, typography_typography: 'custom', typography_font_family: 'Geist', typography_line_height: U(1.6, 'em'), align: 'center', custom_css: 'selector{max-width:56ch;margin:0 auto}selector .elementor-widget-container{font-size:clamp(16px,1.25vw,19px);text-align:center}selector p{margin:0;font-size:inherit}' })]);
// (a seção "Presença global" separada foi FUNDIDA aqui — PDF Website Revisado: mesclar textos e apagar a de baixo)
// offices + stats são montados abaixo (globOfficesRow/globStats) e entram nesta mesma seção.

// ================= SEÇÃO 9 · PRESENÇA GLOBAL (glob2) — page.js:211 + globals.css:659 =================
const OFFICE_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M15 21V9h3a1 1 0 0 1 1 1v11M8 8h2M8 12h2M8 16h2"/></svg>';
const STAT_IC = {
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"/></svg>',
  handshake: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M11 17l2 2a1.5 1.5 0 0 0 2-2M13 15l2.5 2.5a1.5 1.5 0 0 0 2-2L14 12M3 9l4-4 5 5M21 9l-4-4-3 3M3 9v5l4 4M21 9v5"/></svg>',
  box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8"/></svg>' };
const globSectionCSS =
  'selector{padding:clamp(80px,9vw,140px) 0}' +
  'selector .glob2{display:grid!important;grid-template-columns:1fr 1.12fr;gap:clamp(32px,5vw,64px)!important;align-items:center;padding:0!important}' +
  'selector .glob2-l{max-width:560px;gap:0!important;padding:0!important}' +
  'selector .x-glob-eyebrow,selector .x-glob-eyebrow p{font-family:\'Geist Mono\',monospace;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#2e6bf0;display:inline-flex;align-items:center;gap:12px;font-weight:500;margin:0}selector .x-glob-eyebrow::before{content:"";width:7px;height:7px;background:#c4922e;transform:rotate(45deg);border-radius:1px}' +
  'selector .glob2-h{margin:16px 0!important}selector .glob2-h .elementor-heading-title{font-size:clamp(26px,3.3vw,44px);letter-spacing:-.04em;line-height:1.04;margin:0;color:#0b1631;font-weight:600}selector .glob2-h .muted{color:#8492ac}' +
  'selector .glob2-lede{margin:0!important}selector .glob2-lede,selector .glob2-lede p{font-size:clamp(16px,1.25vw,19px);color:#5a6784;line-height:1.6;max-width:56ch;margin:0}' +
  'selector .glob2-offices{margin-top:clamp(26px,3.5vw,40px)!important;display:flex;flex-direction:column;gap:0!important;padding:0!important;width:100%}selector .glob2-office{display:flex;flex-direction:row;gap:16px!important;align-items:flex-start;padding:18px 0!important;width:100%}selector .glob2-office+.glob2-office{border-top:1px solid #e4e8f2}' +
  'selector .glob2-oic{width:46px;height:46px;border-radius:13px;background:#eef3ff;color:#0a3ea8;display:flex!important;align-items:center;justify-content:center;flex:0 0 auto;line-height:0;padding:0!important}selector .glob2-oic .elementor-widget-container{display:flex;align-items:center;justify-content:center;width:100%;height:100%;line-height:0}selector .glob2-oic svg{width:24px;height:24px;display:block}selector .glob2-oic p{margin:0;line-height:0;display:flex;align-items:center}' +
  'selector .glob2-otext{width:auto;display:flex;flex-direction:column;gap:3px!important;padding:0!important}' +
  'selector .glob2-oname,selector .glob2-oname .elementor-heading-title{font-size:18px;font-weight:700;color:#0b1631;letter-spacing:-.02em;display:block;margin:0}' +
  'selector .glob2-orole,selector .glob2-orole p{font-size:14px;color:#5a6784;line-height:1.45;max-width:320px;display:block;margin:0}' +
  'selector .glob2-r{border-radius:clamp(18px,2vw,28px);overflow:hidden;border:1px solid #e4e8f2;background:linear-gradient(160deg,#eef3ff,#fff);box-shadow:0 30px 60px -30px rgba(11,22,49,.28);padding:0!important}selector .glob2-r .elementor-widget-image,selector .glob2-r .elementor-widget-container{line-height:0}selector .glob2-r img{display:block;width:100%;height:auto;border-radius:0}' +
  'selector .glob2-stats{margin-top:clamp(34px,4.5vw,56px)!important;display:grid!important;grid-template-columns:repeat(3,1fr);gap:0!important;padding:0!important;background:#fff;border:1px solid #e4e8f2;border-radius:20px;box-shadow:0 6px 16px -8px rgba(4,16,50,.15);overflow:hidden}' +
  'selector .glob2-stat{display:flex;flex-direction:row;align-items:center;gap:16px!important;padding:clamp(20px,2.4vw,30px) clamp(22px,3vw,42px)!important}selector .glob2-stat+.glob2-stat{border-left:1px solid #e4e8f2}' +
  'selector .glob2-sic{width:48px;height:48px;border-radius:13px;background:#eef3ff;color:#0a3ea8;display:flex!important;align-items:center;justify-content:center;flex:0 0 auto;line-height:0;padding:0!important}selector .glob2-sic .elementor-widget-container{display:flex;align-items:center;justify-content:center;width:100%;height:100%;line-height:0}selector .glob2-sic svg{width:24px;height:24px;display:block}selector .glob2-sic p{margin:0;line-height:0;display:flex;align-items:center}' +
  'selector .glob2-stext{width:auto;display:flex;flex-direction:column;gap:0!important;padding:0!important}' +
  'selector .glob2-sv,selector .glob2-sv .elementor-heading-title{font-size:clamp(20px,2vw,26px);font-weight:700;color:#0b1631;letter-spacing:-.02em;line-height:1.12;display:block;margin:0}' +
  'selector .glob2-sl,selector .glob2-sl p{font-size:14px;color:#5a6784;display:block;margin:0}' +
  '@media(max-width:900px){selector .glob2{grid-template-columns:1fr}selector .glob2-l{max-width:none}selector .glob2-stats{grid-template-columns:1fr}selector .glob2-stat+.glob2-stat{border-left:0;border-top:1px solid #e4e8f2}}';
const OFFICES = [{ city: 'Brasil', role: 'Mercado interno de pimenta e cacau' }, { city: 'Portugal', role: 'Mercado internacional de outros produtos alimentícios' }];
const GSTATS = [{ icon: 'globe', v: '15 países', l: 'com atuação', r: false }, { icon: 'handshake', v: '200+ parceiros', l: 'comerciais ativos', r: false }, { icon: 'box', v: '4 continentes', l: 'Exportações para', r: true }];
// ícone inline (SVG cru dentro de text-editor nativo = editável + fiel ao stroke original)
const svgIconW = (svg, cls) => WK('text-editor', cls, { editor: svg });
const globOffice = (o) => Cn(false, { content_width: 'full', css_classes: 'glob2-office' }, [
  svgIconW(OFFICE_IC, 'glob2-oic'),
  Cn(false, { content_width: 'full', css_classes: 'glob2-otext', flex_direction: 'column', flex_align_items: 'flex-start' }, [
    WK('heading', 'glob2-oname', { title: o.city, header_size: 'div' }),
    WK('text-editor', 'glob2-orole', { editor: `<p>${o.role}</p>` })])]);
// escritórios (Brasil/Portugal) — texto de apoio já vive no cabeçalho fundido; aqui fica só a linha de escritórios + a arte
const globLeft = Cn(false, { content_width: 'full', css_classes: 'glob2-l', flex_direction: 'column', flex_align_items: 'flex-start' }, [
  WK('heading', 'x-glob-title glob2-h', { title: 'Operação no Brasil <span class="muted">e na Europa.</span>', header_size: 'h3' }),
  Cn(false, { content_width: 'full', css_classes: 'glob2-offices', flex_direction: 'column' }, OFFICES.map(globOffice))]);
const globRight = Cn(false, { content_width: 'full', css_classes: 'glob2-r' }, [
  W('image', { image: { url: `${WPUP}/presenca-global-2.png`, id: '', alt: 'Operação Xpice: Brasil e Portugal', source: 'library', size: '' }, image_size: 'full'})]);
const glob2 = Cn(false, { content_width: 'full', css_classes: 'glob2' }, [globLeft, globRight]);
const globStat = (s) => Cn(false, { content_width: 'full', css_classes: 'glob2-stat' }, [
  svgIconW(STAT_IC[s.icon], 'glob2-sic'),
  Cn(false, { content_width: 'full', css_classes: 'glob2-stext', flex_direction: 'column', flex_align_items: 'flex-start' },
    s.r ? [WK('text-editor', 'glob2-sl', { editor: `<p>${s.l}</p>` }), WK('heading', 'glob2-sv', { title: s.v, header_size: 'div' })]
        : [WK('heading', 'glob2-sv', { title: s.v, header_size: 'div' }), WK('text-editor', 'glob2-sl', { editor: `<p>${s.l}</p>` })])]);
const globStats = Cn(false, { content_width: 'full', css_classes: 'glob2-stats' }, GSTATS.map(globStat));
// SEÇÃO ÚNICA FUNDIDA (âncora #presenca): cabeçalho + mapa de origens + escritórios + números
const presenca = Cn(false, { content_width: 'full', _element_id: 'presenca', background_background: 'classic', background_color: T.paper,
  custom_css: 'selector{padding:clamp(80px,9vw,140px) 0}' + globSectionCSS +
    'selector .glob2{margin-top:clamp(40px,5vw,72px)!important;align-items:center}' +
    'selector .glob2-h{margin:0 0 8px!important}selector .glob2-h .elementor-heading-title{font-size:clamp(22px,2.4vw,32px)}' },
  [boxed([origHead, Cn(true, { content_width: 'full', custom_css: 'selector{margin-top:32px}' }, [origWidget]), glob2, globStats])]);

// ================= SEÇÃO 10 · SOBRE (About) — page.js:251 + globals.css:528 =================
const aboutSectionCSS =
  'selector{padding:clamp(80px,9vw,140px) 0}' +
  'selector .aboutw{gap:0!important;padding:0!important}' +
  'selector .x-about-eyebrow{width:auto}selector .x-about-eyebrow,selector .x-about-eyebrow p{font-family:\'Geist Mono\',monospace;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#2e6bf0;display:inline-flex;align-items:center;gap:12px;font-weight:500;margin:0}selector .x-about-eyebrow::before{content:"";width:7px;height:7px;background:#c4922e;transform:rotate(45deg);border-radius:1px}' +
  'selector .about-head{margin:0 0 clamp(28px,4vw,44px)!important;gap:0!important;padding:0!important}' +
  'selector .about-h{margin:16px 0!important;width:auto}selector .about-h,selector .about-h .elementor-heading-title{font-size:clamp(26px,3.3vw,44px);letter-spacing:-.04em;line-height:1.04;color:#0b1631;font-weight:600}selector .about-h .elementor-heading-title{margin:0}selector .about-h .muted{color:#8492ac}' +
  'selector .badge{width:auto;display:inline-flex;align-items:center;gap:8px;border:1px dashed #e4e8f2;border-radius:100px;padding:6px 12px!important}selector .badge,selector .badge p{font-family:\'Geist Mono\',monospace;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#8492ac;margin:0}selector .badge::before{content:"";width:6px;height:6px;border-radius:50%;background:#2e6bf0}' +
  'selector .about-cards{display:grid!important;grid-template-columns:1.28fr 1fr;gap:clamp(20px,2.5vw,28px)!important;align-items:stretch;padding:0!important}' +
  'selector .about-card{position:relative;overflow:hidden;background:#fff;border:1px solid #e4e8f2;border-radius:20px;padding:clamp(24px,3vw,34px)!important;box-shadow:0 6px 16px -8px rgba(4,16,50,.15);display:flex!important;flex-direction:column;gap:0!important}' +
  'selector .about-card-head{display:flex!important;flex-direction:row;gap:16px!important;align-items:flex-start;padding:0!important;width:100%;position:relative;z-index:1}' +
  'selector .about-card-ic{width:48px;height:48px;border-radius:13px;background:#eef3ff;color:#0a3ea8;display:flex!important;align-items:center;justify-content:center;flex:0 0 auto;box-shadow:inset 0 0 0 1px #d6e2ff;line-height:0;padding:0!important}selector .about-card-ic .elementor-widget-container{display:flex;align-items:center;justify-content:center;width:100%;height:100%;line-height:0}selector .about-card-ic p{margin:0;line-height:0;display:flex;align-items:center}' +
  'selector .about-card-body{width:auto;gap:0!important;padding:0!important;flex:1}' +
  'selector .about-lbl{margin:0 0 10px!important;width:auto}selector .about-lbl,selector .about-lbl .elementor-heading-title{font-family:\'Geist Mono\',monospace;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#0a3ea8;display:block;margin-bottom:0}selector .about-lbl{margin-bottom:10px!important}' +
  'selector .about-card-txt,selector .about-card-txt p{font-size:14.5px;line-height:1.55;color:#5a6784;max-width:44ch;margin:0}' +
  'selector .about-team-txt,selector .about-team-txt p{max-width:34ch}' +
  'selector .about-tlwrap p{margin:0}selector .about-timeline{margin-top:22px;position:relative}selector .about-timeline::before{content:"";position:absolute;left:5px;top:18px;bottom:18px;width:2px;background:#e4e8f2}' +
  // vira tabela: ponto · ano · contratos · toneladas · US$ (marcos ocupam as 3 colunas de dado)
  'selector .about-tl-row{display:grid;grid-template-columns:11px 44px minmax(0,1fr) 62px 66px 84px;align-items:center;gap:10px;padding:11px 0;position:relative}selector .about-tl-row+.about-tl-row{border-top:1px solid #e4e8f2}' +
  'selector .about-tl-row.is-nota .about-tl-t{grid-column:3/6}' +
  'selector .about-tl-mk{min-width:0}selector .about-tl-mk .about-tl-badge{max-width:100%}' +
  'selector .about-tl-head{padding-top:0;padding-bottom:8px}selector .about-tl-head+.about-tl-row{border-top:0}' +
  'selector .about-tl-c{font-family:\'Geist Mono\',monospace;font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:#8492ac;text-align:right}' +
  'selector .about-tl-n{font-family:\'Geist Mono\',monospace;font-size:12.5px;color:#0b1631;text-align:right;font-variant-numeric:tabular-nums}' +
  'selector .about-tl-v{color:#0a3ea8;font-weight:600}' +
  'selector .about-tl-row.is-nota .about-tl-badge{justify-self:end}' +
  'selector .about-tl-dot{width:11px;height:11px;border-radius:50%;background:#d6e2ff;border:2px solid #0a3ea8;flex:none;box-shadow:0 0 0 4px #fff;position:relative;z-index:1}selector .about-tl-row:last-child .about-tl-dot{background:#c4922e;border-color:#c4922e;box-shadow:0 0 0 4px #faf3e4}' +
  'selector .about-tl-y{font-family:\'Geist Mono\',monospace;font-size:12px;color:#8492ac;min-width:44px}selector .about-tl-t{font-size:15px;color:#0b1631;font-weight:500;flex:1}' +
  // Missão · Visão · Valores
  'selector .about-mvv{display:grid!important;grid-template-columns:repeat(3,1fr);gap:16px!important;margin-top:16px!important;padding:0!important}' +
  'selector .about-mvv-card{background:#fff;border:1px solid #e4e8f2;border-radius:22px;padding:26px 24px!important;gap:0!important;box-shadow:0 6px 16px -8px rgba(4,16,50,.12)}' +
  'selector .about-mvv-h,selector .about-mvv-h .elementor-heading-title{font-family:\'Geist Mono\',monospace;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#0a3ea8;margin:0 0 12px}' +
  'selector .about-mvv-p,selector .about-mvv-p p{font-size:14.5px;line-height:1.6;color:#5a6784;margin:0}' +
  '@media(max-width:860px){selector .about-mvv{grid-template-columns:1fr!important}}' +
  'selector .about-tl-badge{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#c4922e;background:#faf3e4;border:1px solid rgba(196,146,46,.28);padding:3px 9px;border-radius:100px;flex:none}' +
  'selector .about-fairwrap p{margin:0}selector .about-fairchips{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:22px}selector .about-fairchip{display:inline-flex;align-items:center;gap:9px;font-size:13.5px;padding:13px 16px;border-radius:12px;border:1px solid #e4e8f2;background:#f5f7fc;color:#5a6784}selector .about-fairchip svg{color:#0a3ea8;flex:none}' +
  'selector .about-globewrap{position:absolute!important;inset:0;margin:0;pointer-events:none;z-index:0}selector .about-globe{position:absolute;top:-30px;right:-34px;width:clamp(170px,22vw,240px);z-index:0;opacity:.7;pointer-events:none}' +
  'selector .about-fairwrap,selector .about-tlwrap{position:relative;z-index:1}' +
  'selector .about-team-card{position:relative;margin-top:clamp(20px,2.5vw,28px)!important;background:#fff;border:1px solid #e4e8f2;border-radius:20px;padding:clamp(24px,3vw,36px)!important;box-shadow:0 6px 16px -8px rgba(4,16,50,.15);gap:0!important}' +
  'selector .about-team-inner{display:grid!important;grid-template-columns:.85fr 2.4fr;gap:clamp(24px,3vw,44px)!important;align-items:center;padding:0!important;width:100%}' +
  'selector .about-teamwrap p{margin:0}selector .about-team-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}' +
  'selector .about-member{display:flex;flex-direction:column;align-items:flex-start;gap:12px;padding:18px;border:1px solid #e4e8f2;border-radius:14px;background:#f5f7fc;transition:border-color .25s,box-shadow .25s}selector .about-member:hover{border-color:#d6e2ff;box-shadow:0 6px 16px -8px rgba(4,16,50,.15)}' +
  'selector .about-ava{width:44px;height:44px;border-radius:50%;background:#fff;color:#0a3ea8;display:flex;align-items:center;justify-content:center;flex:none;border:1px solid #d6e2ff;box-shadow:0 0 0 3px #eef3ff}' +
  'selector .about-member-b h4{font-size:14px;font-weight:700;color:#0b1631;line-height:1.25;margin:0}selector .about-member-b span{font-size:12.5px;color:#8492ac}' +
  '@media(max-width:900px){selector .about-cards{grid-template-columns:1fr}selector .about-team-inner{grid-template-columns:1fr;gap:24px!important}selector .about-team-grid{grid-template-columns:repeat(2,1fr)}}';
// trajetória real (PDF Website Revisado)
// Trajetória com volume movimentado por ano (planilha do cliente, vídeo 28/jul).
// n = contratos · t = toneladas · v = US$ vendido. Linhas sem números = marco (texto ocupa a largura).
const A_MILE = [
  { y: '2009', nota: 'Início da atividade no mercado brasileiro' },
  { y: '2017', n: '2', t: '44', v: '81.360', b: '1ª importação' },
  { y: '2018', n: '18', t: '334', v: '362.620', b: 'escritório PT · nov' },
  { y: '2019', n: '53', t: '1.027', v: '1.594.640' },
  { y: '2020', n: '145', t: '4.715', v: '4.558.269' },
  { y: '2021', n: '123', t: '2.991', v: '5.880.360' },
  { y: '2022', n: '147', t: '4.056', v: '6.304.902' },
  { y: '2023', n: '179', t: '4.983', v: '7.861.585' },
  { y: '2024', n: '222', t: '6.220', v: '10.720.147' },
  { y: '2025', n: '192', t: '6.065', v: '8.822.135' },
  { y: '2026', nota: 'Meta: ultrapassar US$ 11 milhões', b: 'meta' }];
const A_FAIRS = ['SIAL', 'Food Ingredients', 'Anuga', 'Fispal'];
const A_TEAM = [{ n: 'Nome · a confirmar', r: 'Cargo · a confirmar' }, { n: 'Nome · a confirmar', r: 'Cargo · a confirmar' }, { n: 'Nome · a confirmar', r: 'Cargo · a confirmar' }, { n: 'Nome · a confirmar', r: 'Cargo · a confirmar' }];
const icBook = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16H6a2 2 0 0 1-2-2V5zM18 3l2 1v14M8 7h6M8 11h6"/></svg>';
const icCal = '<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M3 9h18M8 2.5v4M16 2.5v4M8 13h3M13 13h3M8 16.5h3"/></svg>';
const icCalSm = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/></svg>';
const icTeam = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5M16 5.2a3.2 3.2 0 0 1 0 6M18 20c0-2.4-1-4-2.5-4.6"/></svg>';
const icUser = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6"/></svg>';
const globeArt = '<svg class="about-globe" viewBox="0 0 200 200" fill="none" aria-hidden="true"><g stroke="#2e6bf0" stroke-width="0.8" opacity="0.4" fill="none"><circle cx="100" cy="100" r="72"/><ellipse cx="100" cy="100" rx="72" ry="28"/><ellipse cx="100" cy="100" rx="72" ry="52"/><ellipse cx="100" cy="100" rx="28" ry="72"/><ellipse cx="100" cy="100" rx="52" ry="72"/><path d="M28 100h144M100 28v144"/></g><g fill="#2e6bf0"><circle cx="152" cy="66" r="4"/><circle cx="128" cy="118" r="3.4"/><circle cx="74" cy="80" r="3"/></g></svg>';
// cabeçalho do card (ícone + label + texto) — reutilizado nos 3 cards
const aboutHead = (ic, lbl, txt, txtCls) => Cn(false, { content_width: 'full', css_classes: 'about-card-head' }, [
  svgIconW(ic, 'about-card-ic'),
  Cn(false, { content_width: 'full', css_classes: 'about-card-body', flex_direction: 'column', flex_align_items: 'flex-start' }, [
    WK('heading', 'about-lbl', { title: lbl, header_size: 'div' }),
    WK('text-editor', txtCls || 'about-card-txt', { editor: `<p>${txt}</p>` })])]);
const aboutTimelineHTML = '<ul class="about-timeline" style="margin:22px 0 0;padding:0;list-style:none">' +
  '<li class="about-tl-row about-tl-head"><span class="about-tl-dot" style="visibility:hidden"></span><span class="about-tl-y"></span><span class="about-tl-mk"></span>' +
  '<span class="about-tl-c">Contratos</span><span class="about-tl-c">Toneladas</span><span class="about-tl-c">US$ vendido</span></li>' +
  A_MILE.map((m) => `<li class="about-tl-row${m.nota ? ' is-nota' : ''}"><span class="about-tl-dot"></span><span class="about-tl-y">${m.y}</span>` +
    (m.nota
      ? `<span class="about-tl-t">${m.nota}</span>${m.b ? `<span class="about-tl-badge">${m.b}</span>` : ''}`
      : `<span class="about-tl-mk">${m.b ? `<span class="about-tl-badge">${m.b}</span>` : ''}</span>` +
        `<span class="about-tl-n">${m.n}</span><span class="about-tl-n">${m.t}</span><span class="about-tl-n about-tl-v">${m.v}</span>`) +
    '</li>').join('') + '</ul>';
const aboutFairsHTML = '<div class="about-fairchips">' + A_FAIRS.map((f) => `<span class="about-fairchip">${icCalSm}${f}</span>`).join('') + '</div>';
const aboutTeamHTML = '<div class="about-team-grid">' + A_TEAM.map((m) => `<div class="about-member"><span class="about-ava">${icUser}</span><div class="about-member-b"><h4>${m.n}</h4><span>${m.r}</span></div></div>`).join('') + '</div>';
const aboutRoot = Cn(false, { content_width: 'full', css_classes: 'aboutw', flex_direction: 'column' }, [
  Cn(false, { content_width: 'full', css_classes: 'about-head', flex_direction: 'column', flex_align_items: 'flex-start' }, [
    WK('text-editor', 'x-about-eyebrow', { editor: '<p>Sobre a Xpice</p>' }),
    WK('heading', 'x-about-title about-h', { title: 'Trajetória, feiras <span class="muted">e time.</span>', header_size: 'h2' }),
    WK('text-editor', 'badge', { editor: '<p>Time em atualização</p>' })]),
  Cn(false, { content_width: 'full', css_classes: 'about-cards' }, [
    Cn(false, { content_width: 'full', css_classes: 'about-card' }, [
      aboutHead(icBook, 'História', 'Broker internacional de representação de insumos alimentícios, com escritórios no Brasil e em Portugal. Intermediamos negócios de pimenta-do-reino e cacau em pó e importamos condimentos e especiarias de todo o mundo. Com a expertise de três gerações em comercialização de temperos, condimentos e especiarias, seguimos aprimorando qualidade e rastreabilidade para atender às novas exigências do mercado alimentício, como certificações e sustentabilidade.'),
      WK('text-editor', 'about-tlwrap', { editor: aboutTimelineHTML })]),
    Cn(false, { content_width: 'full', css_classes: 'about-card' }, [
      WK('text-editor', 'about-globewrap', { editor: globeArt }),
      aboutHead(icCal, 'Feiras e eventos', 'Presença nas principais feiras internacionais de alimentos e ingredientes: SIAL, Food Ingredients, Anuga e Fispal.'),
      WK('text-editor', 'about-fairwrap', { editor: aboutFairsHTML })])]),
  // Missão · Visão · Valores (texto institucional enviado pelo cliente, 28/jul)
  Cn(false, { content_width: 'full', css_classes: 'about-mvv' }, [
    ['Missão', 'Fortalecer conexões para o crescimento sustentável e mútuo, organizando informações e gerando soluções com agilidade.'],
    ['Visão', 'Ser referência mundial em inovação para negócios internacionais, com excelência no segmento alimentício, liderando o caminho para o futuro da indústria alimentar global.'],
    ['Valores', 'A verdade como a luz que guia nossas ações, a transparência como nossa linguagem, a confiança como a essência da parceria, o compromisso como caminho e a lealdade como o elo que fortalece a equipe.'],
  ].map(([h, p]) => Cn(false, { content_width: 'full', css_classes: 'about-mvv-card', flex_direction: 'column', flex_align_items: 'flex-start' }, [
    WK('heading', 'about-mvv-h', { title: h, header_size: 'h4' }),
    WK('text-editor', 'about-mvv-p', { editor: `<p>${p}</p>` })]))),
  Cn(false, { content_width: 'full', css_classes: 'about-team-card' }, [
    Cn(false, { content_width: 'full', css_classes: 'about-team-inner' }, [
      aboutHead(icTeam, 'Equipe', 'Pessoas que conectam origem e destino, dos produtores à sua linha de produção.', 'about-card-txt about-team-txt'),
      WK('text-editor', 'about-teamwrap', { editor: aboutTeamHTML })])])]);
const sobre = Cn(false, { content_width: 'full', background_background: 'classic', background_color: T.paper, custom_css: aboutSectionCSS }, [boxed([aboutRoot])]);

// ================= SEÇÃO 11 · FAQ (dark accordion) — page.js:254 + globals.css:693 =================
const FAQ = [
  { q: 'Quais produtos a Xpice negocia?', a: 'Trabalhamos com mais de 150 produtos em 15 países diferentes, nas linhas de especiarias, ervas, vegetais desidratados, aditivos e produtos naturais. Cada categoria conta com fornecedores homologados.' },
  { q: 'Como funciona o rastreamento de contêineres?', a: 'Cada carga é acompanhada em tempo real na plataforma, com eventos normalizados em marcos rastreáveis. Sua equipe sabe onde o produto está e quando chega, sem depender de e-mails e ligações.' },
  { q: 'Com que frequência recebo o relatório de preços?', a: 'O relatório é semanal e cobre os principais produtos, com histórico e tendência, para você comparar, planejar e negociar com base em dados.' },
  { q: 'Como os fornecedores são avaliados?', a: 'Cada fornecedor recebe um score de desempenho por qualidade, prazo e consistência. Você compra de quem entrega, com critérios claros e mensuráveis.' }];
const faqSectionCSS =
  'selector{padding:clamp(80px,9vw,140px) 0}' +
  'selector .faqw{gap:0!important;padding:0!important}' +
  'selector .x-faq-eyebrow{width:auto}selector .x-faq-eyebrow,selector .x-faq-eyebrow p{font-family:\'Geist Mono\',monospace;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#7aa5ff;display:inline-flex;align-items:center;gap:12px;font-weight:500;margin:0}selector .x-faq-eyebrow::before{content:"";width:7px;height:7px;background:#c4922e;transform:rotate(45deg);border-radius:1px}' +
  'selector .faq-grid{display:grid!important;grid-template-columns:.85fr 1.15fr;gap:clamp(32px,5vw,72px)!important;align-items:start;padding:0!important}' +
  'selector .faq-l{gap:0!important;padding:0!important}' +
  'selector .faq-h{margin:18px 0 16px!important;width:auto}selector .faq-h,selector .faq-h .elementor-heading-title{font-size:clamp(26px,3.3vw,44px);letter-spacing:-.04em;line-height:1.04;color:#fff;font-weight:600}selector .faq-h .elementor-heading-title{margin:0}selector .faq-h .muted{color:#63739e}' +
  'selector .x-faq-sub,selector .x-faq-sub p{font-size:clamp(16px,1.25vw,19px);color:#b9c4dd;line-height:1.6;max-width:44ch;margin:0}' +
  'selector .faq-list{display:flex!important;flex-direction:column;gap:0!important;padding:0!important}selector .faq-item{border-top:1px solid rgba(255,255,255,.12);gap:0!important;padding:0!important;width:100%}selector .faq-item:last-child{border-bottom:1px solid rgba(255,255,255,.12)}' +
  'selector .faq-qwrap{width:100%}selector .faq-qwrap .elementor-widget-container{width:100%}' +
  'selector .faq-q{width:100%;display:flex;align-items:center;justify-content:space-between;gap:20px;text-align:left;position:relative;padding:26px 44px 26px 0;font-size:clamp(16px,1.5vw,19px);font-weight:500;color:#fff;background:none;border:none;cursor:pointer;font-family:inherit;margin:0}' +
  'selector .faq-q::before,selector .faq-q::after{content:"";position:absolute;right:7px;top:50%;width:13px;height:2px;background:#7aa5ff;transform:translateY(-50%);transition:transform .35s cubic-bezier(.22,1,.36,1);border-radius:2px;pointer-events:none}selector .faq-q::after{transform:translateY(-50%) rotate(90deg)}' +
  'selector .faq-item[data-open="true"] .faq-q::after{transform:translateY(-50%) rotate(0deg)}' +
  'selector .faq-a{overflow:hidden;max-height:0;transition:max-height .45s cubic-bezier(.22,1,.36,1);width:100%}selector .faq-a .elementor-widget-container{width:100%}selector .faq-a-inner{padding:0 40px 26px 0;color:#b9c4dd;font-size:15px;line-height:1.65}' +
  '@media(max-width:1000px){selector .faq-grid{grid-template-columns:1fr}}';
const faqJS = `function finit(){var root=document.querySelector('.faqw');if(!root||root.__f)return;root.__f=1;var items=root.querySelectorAll('.faq-item');items.forEach(function(it,i){var q=it.querySelector('.faq-q'),a=it.querySelector('.faq-a'),inner=it.querySelector('.faq-a-inner');if(i===0){it.setAttribute('data-open','true');a.style.maxHeight=inner.scrollHeight+'px';}q.addEventListener('click',function(){var open=it.getAttribute('data-open')==='true';items.forEach(function(o){o.setAttribute('data-open','false');o.querySelector('.faq-a').style.maxHeight='0px';});if(!open){it.setAttribute('data-open','true');a.style.maxHeight=inner.scrollHeight+'px';}});});}if(document.readyState!=='loading')finit();else document.addEventListener('DOMContentLoaded',finit);`;
// itens do accordion NATIVOS: pergunta = text-editor com <p class="faq-q"> (classe no elemento INTERNO —
// faqJS clica nele e o FirstT do i18n exige primeiro filho text-node); resposta = text-editor cujo wrapper é o .faq-a
const faqItem = (f) => Cn(false, { content_width: 'full', css_classes: 'faq-item' }, [
  WK('text-editor', 'faq-qwrap', { editor: `<p class="faq-q">${f.q}</p>` }),
  WK('text-editor', 'faq-a', { editor: `<div class="faq-a-inner">${f.a}</div>` })]);
const faqListWidget = Cn(false, { content_width: 'full', css_classes: 'faq-list' }, FAQ.map(faqItem));
const faqScript = W('html', { html: `<script>${faqJS.replace(/<\/script>/g, "<\\/script>")}</script>` });
const faqRoot = Cn(false, { content_width: 'full', css_classes: 'faqw', flex_direction: 'column' }, [
  Cn(false, { content_width: 'full', css_classes: 'faq-grid' }, [
    Cn(false, { content_width: 'full', css_classes: 'faq-l', flex_direction: 'column', flex_align_items: 'flex-start' }, [
      WK('text-editor', 'x-faq-eyebrow', { editor: '<p>Perguntas frequentes</p>' }),
      WK('heading', 'x-faq-title faq-h', { title: 'Perguntas <span class="muted">frequentes</span>', header_size: 'h2' }),
      WK('text-editor', 'x-faq-sub', { editor: '<p>Respostas claras sobre a operação, a plataforma e os produtos.</p>' })]),
    faqListWidget]),
  faqScript]);
const faq = Cn(false, { content_width: 'full', background_background: 'classic', background_color: T.navy900, custom_css: faqSectionCSS }, [boxed([faqRoot])]);

// ================= SEÇÃO 12 · INSIGHTS (art-grid) — page.js:257 + globals.css:720 =================
const ART = [
  { img: 'field', tag: 'Origem', title: 'Como avaliamos uma safra ainda na origem' },
  { img: 'grading', tag: 'Qualidade', title: 'O que separa um lote homologado de um comum' },
  { img: 'facility', tag: 'Logística', title: 'O caminho do contêiner até a sua fábrica' }];
const artSectionCSS =
  'selector{padding:clamp(80px,9vw,140px) 0}' +
  'selector .art-grid{display:grid!important;grid-template-columns:repeat(3,1fr);gap:20px!important;margin-top:50px!important;padding:0!important}' +
  'selector .art-card{border-radius:20px;overflow:hidden;background:#fff;border:1px solid #e4e8f2;transition:transform .4s cubic-bezier(.22,1,.36,1),box-shadow .4s;display:flex!important;flex-direction:column;gap:0!important;padding:0!important}selector .art-card:hover{transform:translateY(-6px);box-shadow:0 30px 60px -30px rgba(11,22,49,.28)}' +
  'selector .art-media{position:relative;aspect-ratio:16/10;overflow:hidden;padding:0!important;width:100%}' +
  'selector .art-media .elementor-widget-image{position:absolute!important;inset:0;margin:0;width:100%;height:100%;z-index:0}' +
  'selector .art-media img{width:100%;height:100%;object-fit:cover;transition:transform .6s cubic-bezier(.22,1,.36,1);display:block;border-radius:0}selector .art-card:hover .art-media img{transform:scale(1.05)}' +
  'selector .art-tag{position:absolute!important;top:14px;left:14px;z-index:2;width:auto;margin:0;background:rgba(255,255,255,.92);padding:6px 11px!important;border-radius:100px}selector .art-tag,selector .art-tag .elementor-heading-title{font-family:\'Geist Mono\',monospace;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#0a3ea8;margin:0}' +
  'selector .art-body{padding:22px 22px 26px!important;display:flex!important;flex-direction:column;align-items:flex-start;gap:0!important}' +
  'selector .art-body h3{font-size:18.5px;letter-spacing:-.02em;line-height:1.25;color:#0b1631;margin:0}' +
  'selector .art-morewrap{margin-top:16px!important;width:auto}selector .art-morewrap p{margin:0}' +
  'selector .art-more{display:inline-flex;align-items:center;gap:7px;font-size:13.5px;color:#0a3ea8;font-weight:500}selector .art-more .ar{display:inline-block;transform:rotate(-45deg)}' +
  '@media(max-width:1000px){selector .art-grid{grid-template-columns:1fr 1fr}}@media(max-width:640px){selector .art-grid{grid-template-columns:1fr}}';
// card nativo: media(imagem + tag) + body(h3 + "Ver todos" — classe art-more no span INTERNO: FirstT do i18n exige text-node primeiro)
const artCard = (a) => Cn(false, { content_width: 'full', css_classes: 'art-card' }, [
  Cn(false, { content_width: 'full', css_classes: 'art-media' }, [
    W('image', { image: { url: photoUrl(a.img), id: '', alt: a.title, source: 'library', size: '' }, image_size: 'full' }),
    WK('heading', 'art-tag', { title: a.tag, header_size: 'div' })]),
  Cn(false, { content_width: 'full', css_classes: 'art-body' }, [
    W('heading', { title: a.title, header_size: 'h3' }),
    WK('text-editor', 'art-morewrap', { editor: '<span class="art-more">Ver todos <span class="ar">→</span></span>' })])]);
const artGrid = Cn(false, { content_width: 'full', css_classes: 'art-grid' }, ART.map(artCard));
const insights = Cn(false, { content_width: 'full', background_background: 'classic', background_color: T.paper, custom_css: artSectionCSS }, [boxed([
  sectionIntro('Conteúdo', 'x-ins-eyebrow', 'Da origem ao destino, <span class="muted">por dentro da operação.</span>', 'x-ins-title', 'Conteúdo em preparação', 'x-ins-badge'),
  Cn(true, { content_width: 'full' }, [artGrid])])]);

// ================= SEÇÃO 13 · CTA FINAL (cta-plain) — page.js:278 + globals.css:732 =================
const btnGhost = (text, key, href) => WK('button', key, { text, link: { url: href, is_external: '', nofollow: '' },
  selected_icon: { value: 'fas fa-arrow-right', library: 'fa-solid' }, icon_align: 'right',
  background_color: 'rgba(0,0,0,0)', button_text_color: T.ink, border_radius: rad(99), text_padding: bx(8, 8, 8, 24),
  typography_typography: 'custom', typography_font_family: 'Geist', typography_font_size: U(14.5), typography_font_weight: '500',
  custom_css: 'selector .elementor-button{display:inline-flex;align-items:center;gap:12px;min-height:50px;box-shadow:inset 0 0 0 1px #e4e8f2;transition:box-shadow .3s,color .3s,transform .3s}' +
    'selector .elementor-button:hover{box-shadow:inset 0 0 0 1px #5a8bff;color:#0a3ea8;transform:translateY(-3px)}' +
    'selector .elementor-button-icon{width:34px;height:34px;border-radius:50%;background:#eef3ff;color:#0a3ea8;display:grid;place-items:center;margin:0;transition:transform .35s cubic-bezier(.22,1,.36,1)}' +
    'selector .elementor-button-icon i,selector .elementor-button-icon svg{font-size:15px;width:15px;transform:rotate(-45deg)}' +
    'selector .elementor-button:hover .elementor-button-icon i,selector .elementor-button:hover .elementor-button-icon svg{transform:rotate(-45deg) translate(3px,-3px)}' });
const ctaTitle = WK('heading', 'x-fcta-title', { title: 'Traga inteligência de mercado para a próxima compra da sua empresa.', header_size: 'h2', title_color: T.ink, align: 'center',
  typography_typography: 'custom', typography_font_family: 'Geist', typography_font_weight: '600', typography_letter_spacing: U(-0.04, 'em'), typography_line_height: U(1.04, 'em'), _margin: bx(0, 0, 16, 0),
  custom_css: 'selector .elementor-heading-title{font-size:clamp(26px,3.3vw,44px);max-width:20ch;margin:0 auto;text-align:center}' });
const ctaLede = WK('text-editor', 'x-fcta-text', { editor: '<p>Fale com um especialista da Xpice Connections e conheça a plataforma: rastreamento de contêineres, relatório semanal de preços e scoring de fornecedores, aplicados à realidade da sua operação.</p>', text_color: T.slate, align: 'center',
  typography_typography: 'custom', typography_font_family: 'Geist', typography_line_height: U(1.6, 'em'), _margin: bx(0, 0, 32, 0),
  custom_css: 'selector{max-width:640px;margin:0 auto}selector .elementor-widget-container{font-size:clamp(16px,1.25vw,19px);text-align:center}selector p{margin:0;font-size:inherit}' });
const ctaBtns = Cn(true, { content_width: 'full', flex_direction: 'row', custom_css: 'selector{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}' },
  [btnDark('Agendar conversa', 'x-fcta-cta', 'mailto:contato@xpice.com'), btnGhost('Receber o relatório semanal', 'x-fcta-cta2', 'mailto:contato@xpice.com')]);
const ctaFinal = Cn(false, { content_width: 'full', background_background: 'classic', background_color: T.paper, custom_css: 'selector{padding:clamp(80px,9vw,140px) 0 clamp(80px,9vw,140px)}' },
  [Cn(true, { content_width: 'boxed', boxed_width: U(1220), padding: bx(0, 32, 0, 32), custom_css: 'selector{text-align:center}' },
    [Cn(true, { content_width: 'full', flex_direction: 'column', custom_css: 'selector{max-width:720px;margin:0 auto;align-items:center}' }, [ctaTitle, ctaLede, ctaBtns])])]);

// ================= SEÇÃO 14 · FOOTER — page.js:292 + globals.css:742 =================
const footSectionCSS =
  'selector{padding:76px 0 40px}' +
  'selector .footer-top{display:grid!important;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:40px!important;padding:0!important;width:100%}' +
  'selector .footer-logo{gap:0!important;padding:0!important}' +
  'selector .footer-logo .elementor-widget-image{margin:0 0 18px;width:auto}selector .footer-logo img{height:34px;width:auto}' +
  'selector .x-foot-tag,selector .x-foot-tag p{color:#b9c4dd;font-size:15px;max-width:32ch;margin:0}' +
  'selector .footer-col{gap:0!important;padding:0!important;display:block}' +
  'selector .footer-col h4{font-family:\'Geist Mono\',monospace;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#63739e;margin:0 0 16px;font-weight:500}' +
  'selector .footer-col a,selector .footer-col p{display:block;color:#b9c4dd;font-size:14.5px;margin:0 0 10px;transition:color .25s;text-decoration:none}selector .footer-col a:hover{color:#fff}' +
  'selector .footer-col h4 a,selector .footer-col h4 p{margin:0;display:inline;color:inherit;font-size:inherit}' +
  'selector .footer-bottom{display:flex!important;flex-direction:row;justify-content:space-between;align-items:center;margin-top:56px!important;padding:26px 0 0!important;border-top:1px solid rgba(255,255,255,.1);flex-wrap:wrap;gap:12px!important;width:100%}' +
  'selector .foot-copy,selector .foot-copy p{color:#63739e;font-size:13px;margin:0}selector .foot-copy{width:auto}' +
  'selector .foot-socialwrap{width:auto}selector .foot-socialwrap p{margin:0}' +
  'selector .footer-social{display:flex;gap:10px}selector .footer-social a{width:38px;height:38px;border-radius:50%;border:1px solid rgba(255,255,255,.14);display:flex;align-items:center;justify-content:center;color:#b9c4dd;margin:0;transition:border-color .25s,color .25s}selector .footer-social a:hover{border-color:#5a8bff;color:#fff}selector .footer-social svg{width:17px;height:17px}' +
  '@media(max-width:1000px){selector .footer-top{grid-template-columns:1fr 1fr;gap:32px!important}}@media(max-width:640px){selector .footer-top{grid-template-columns:1fr}}';
const FNAV = [['Plataforma', '#plataforma'], ['Produtos', '#produtos'], ['Presença global', '#presenca'], ['Como funciona', '#como-funciona']];
const FOOT_SOCIAL =
  '<div class="footer-social">' +
  '<a href="#" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5A2.5 2.5 0 1 0 5 8.5a2.5 2.5 0 0 0-.02-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C20.6 8.65 22 10.9 22 14.3V21h-4v-6c0-1.43-.03-3.27-2-3.27-2 0-2.3 1.56-2.3 3.17V21H9z"/></svg></a>' +
  '<a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></a>' +
  '<a href="mailto:contato@xpice.com" aria-label="E-mail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg></a>' +
  '</div>';
// footer NATIVO: grid de containers; h4/links/tagline = rich-text (DOM igual pro langJS:
// fh[0]=Menu fh[2]=Idioma via `.footer-top .footer-col h4`; 1ª col = links <a> em ordem)
const footerTop = Cn(false, { content_width: 'full', css_classes: 'footer-top' }, [
  Cn(false, { content_width: 'full', css_classes: 'footer-logo', flex_direction: 'column', flex_align_items: 'flex-start' }, [
    W('image', { image: { url: `${WPUP}/xpice-logo-white.png`, id: '', alt: 'Xpice Connections', source: 'library', size: '' }, image_size: 'full' }),
    WK('text-editor', 'x-foot-tag footer-tagline', { editor: '<p>A camada de dados da compra internacional de especiarias.</p>' })]),
  Cn(false, { content_width: 'full', css_classes: 'footer-col' }, [
    W('text-editor', { editor: '<h4>Menu</h4>' }),
    W('text-editor', { editor: FNAV.map(([l, h]) => `<a href="${h}">${l}</a>`).join('') + '<a href="/pt/marca">Marca</a>' })]),
  Cn(false, { content_width: 'full', css_classes: 'footer-col' }, [
    W('text-editor', { editor: '<h4 class="x-foot-contact">Contato</h4>' }),
    W('text-editor', { editor: '<a href="mailto:josimar@xpice.com">josimar@xpice.com</a><a href="https://wa.me/5511975702226" target="_blank" rel="noopener">WhatsApp +55 11 97570-2226</a><a href="mailto:contato@xpice.com">contato@xpice.com</a><p class="x-foot-offices">Brasil · Portugal</p>' })]),
  Cn(false, { content_width: 'full', css_classes: 'footer-col' }, [
    W('text-editor', { editor: '<h4>Idioma</h4>' }),
    W('text-editor', { editor: '<a href="/pt">Português</a><a href="/en">English</a><a href="/es">Español</a>' })])]);
const footerBottom = Cn(false, { content_width: 'full', css_classes: 'footer-bottom' }, [
  WK('text-editor', 'foot-copy', { editor: '<p>© 2026 Xpice Connections. <span class="x-foot-rights">Todos os direitos reservados.</span></p>' }),
  WK('text-editor', 'foot-socialwrap', { editor: FOOT_SOCIAL })]);
const footer = Cn(false, { content_width: 'full', background_background: 'classic', background_color: T.navy900, custom_css: footSectionCSS },
  [boxed([footerTop, footerBottom])]);

// ================= SMOOTH SCROLL + REVEAL (global) =================
// Lenis (mesmo do site oficial) via CDN + IntersectionObserver que revela cada elemento com blur/fade/subida,
// escalonado por seção; título do hero entra linha a linha. Degrada sem-JS e respeita prefers-reduced-motion.
const revealJS = `(function(){if(window.__xrl)return;window.__xrl=1;if(document.body.classList.contains('elementor-editor-active'))return;var RM=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;`
  + `if(!RM){var ls=document.createElement('script');ls.src='https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js';ls.onload=function(){try{if(!window.Lenis)return;var l=new Lenis({duration:1.1,smoothWheel:true,wheelMultiplier:1,touchMultiplier:1.5});window.__lenis=l;function raf(t){l.raf(t);requestAnimationFrame(raf);}requestAnimationFrame(raf);document.querySelectorAll('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){var id=a.getAttribute('href');if(id&&id.length>1){var t=document.querySelector(id);if(t){e.preventDefault();l.scrollTo(t,{offset:-84});}}});});}catch(e){}};document.head.appendChild(ls);}`
  + `function init(){if(RM)return;var TA='.prodx-card,.pillar,.art-card,.about-card,.about-team-card,.glob2-stat,.glob2-office,.faq-item,.step-item,.kpi-card,.brz-card,.glob2-r,.about-member';`
  + `var heroLines=[].slice.call(document.querySelectorAll('.x-title .htl'));`
  + `var heroBlocks=[].slice.call(document.querySelectorAll('.x-title .elementor-heading-title'));`
  + `var ta=[].slice.call(document.querySelectorAll(TA));`
  + `var TB='.elementor-widget-heading .elementor-heading-title,.elementor-widget-text-editor>.elementor-widget-container,.elementor-widget-button .elementor-button,.elementor-widget-image .elementor-widget-container';`
  + `var tb=[].slice.call(document.querySelectorAll(TB)).filter(function(el){return !el.closest(TA)&&!el.closest('.xnav')&&heroBlocks.indexOf(el)<0;});`
  + `var targets=heroLines.concat(tb).concat(ta);if(!targets.length)return;document.body.classList.add('xrl-on');`
  + `function sec(el){return el.closest('.e-con.e-parent, .elementor-top-section, section')||document.body;}`
  + `var groups=new Map();targets.forEach(function(el){el.classList.add('xrl');var s=sec(el);if(!groups.has(s))groups.set(s,[]);groups.get(s).push(el);});`
  + `groups.forEach(function(list,s){list.sort(function(a,b){return (a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING)?-1:1;});var hero=!!(s&&s.querySelector&&s.querySelector('.x-title'));var step=hero?150:70,cap=hero?1600:540;list.forEach(function(el,i){el.style.transitionDelay=Math.min(i*step,cap)+'ms';});});`
  + `var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('xin');io.unobserve(e.target);}});},{threshold:.12,rootMargin:'0px 0px -6% 0px'});`
  + `targets.forEach(function(el){io.observe(el);});`
  + `function bc(){if(window.innerHeight+(window.scrollY||document.documentElement.scrollTop)>=document.documentElement.scrollHeight-4){targets.forEach(function(el){el.classList.add('xin');});window.removeEventListener('scroll',bc);}}window.addEventListener('scroll',bc,{passive:true});}`
  + `if(document.readyState!=='loading')init();else document.addEventListener('DOMContentLoaded',init);})();`;
const revealSection = Cn(false, { content_width: 'full', custom_css: 'selector{padding:0;min-height:0}' }, [W('html', { html: `<script>${revealJS.replace(/<\/script>/g, "<\\/script>")}</script>` })]);

// ================= ENVELOPE =================
const content = [nav, hero, numeros, problema, solucao, comoFunciona, plataforma, produtos, presenca, sobre, faq, insights, ctaFinal, footer, revealSection];

const out = {
  content,
  page_settings: { background_color: T.paper, custom_css: PAGE_CSS },
  version: '0.4', title: 'Xpice — Nativo Fiel', type: 'page',
};

const dest = new URL('./sites/xpice/xpice-nativo.json', import.meta.url).pathname;
mkdirSync(dirname(dest), { recursive: true });
writeFileSync(dest, JSON.stringify(out, null, 1));

let nodes = 0; const ids = new Set(); let dup = 0;
(function walk(list) { for (const e of list) { nodes++; if (ids.has(e.id)) dup++; ids.add(e.id); if (e.elements) walk(e.elements); } })(content);
console.log(`OK -> ${dest}`);
console.log(`seções topo: ${content.length} · nós: ${nodes} · ids únicos: ${ids.size} · dups: ${dup}`);
