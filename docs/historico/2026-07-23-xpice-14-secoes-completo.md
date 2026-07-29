# Xpice nativo: 14 seções completas via pipeline build→chunk→insert

## Resultado
Site Xpice inteiro (Next.js oficial) recriado como template Elementor editável no post 86 (`xpice-nativo-teste`): 14 seções + nav, 160 nós, 100% fiel e interativo. Gerador: `ferramentas/elementor-motor/build-xpice-nativo.mjs`.

## Pipeline que escalou (por seção, em ordem)
1. **Escrever no gerador** (nativo p/ texto/layout; widget HTML/CSS/JS p/ interativo).
2. `node build-xpice-nativo.mjs` → gzip do `content[idx]` → base64 → chunks de 1200 → **checksum por chunk** (`x=(x*31+cc)%1e9+7`).
3. **Push paralelo**: múltiplas `javascript_tool` numa resposta (funciona! chaves indexadas, sem corrida) → verificar todos os checksums de uma vez.
4. Se 1 chunk falhar o checksum (copy error acontece ~1 a cada 15) → re-push só ele.
5. **Insert sem tocar no resto**: `$e.run('document/elements/create',{container:elementor.getPreviewView().getContainer(),model:node,options:{at:elementor.elements.length}})` → append no fim. Dá pra inserir várias seções + 1 save.
6. `document/save/default` → purgar cache (`#wpadminbar` "Excluir cache") → verificar DOM + screenshot.

## Divisão nativo × widget (regra do dono)
- **Nativo** (heading/text-editor/button + custom_css, classes `x-*` p/ i18n): heros de texto, CTAs, section-intros.
- **Widget HTML/CSS/JS** (`<img onerror=eval(atob())>`): interativos/complexos — Steps (auto-rotate), Pillars (viz animada + IntersectionObserver), Produtos (grid hover-reveal), Origens (mapa base + marcadores), Sobre (cards), FAQ (accordion), Footer, Presença.
- Cada widget inlina o CSS EXATO do `globals.css` oficial. Animações via `IntersectionObserver`.

## Adaptações conscientes
- **Origens (v1, descartada)**: `worldPaths.js` oficial = 796KB — grande demais. Tentei `world-map.svg` + 8 marcadores (pins). **Dono reprovou**: "mapa continua completamente diferente" — pin sobre imagem ≠ país vetorial clicável do oficial.
- **Origens (v2, DEFORMADA — erro):** reduzi `worldPaths.js` arredondando cada **delta relativo** (`m 479.7,331.6 -0.1,0 -0.3,0.2...`) a inteiro. Deltas 0.1–0.9 viram **0** → shapes colapsam → mapa deformado (Brasil vira blob gigante fora de lugar). Dono: "o mapa ficou completamente deformado".
- **Origens (v3, AINDA quebrada):** minify que PRESERVA shape — parsear path, acumular delta→**absoluto**, arredondar o ABSOLUTO a inteiro, re-emitir delta entre absolutos arredondados. 256 países, 43KB gzip (521KB html). Verificado: coords absolutas do minificado batem EXATO com o oficial (Brasil ~316,458; Peru ~279,475; Índia ~738,444). Fonte da geometria = SEMPRE `xpice-site/lib/worldPaths.js` (viewBox `0 0 1010 666`; widget usa `0 58 1010 505`), NUNCA inventar/re-derivar. Widget: 256 `<path class="wc">`, servidos `wc served`+`data-iso`, ativo `data-on` + `<svg.wmap-connector>` bezier bbox→card. Fiel: polígonos reais, hover, clique país↔chip, i18n via `window.__XL`+`xlang`.
- **Transporte do widget ~520KB** (html com os paths): 55 chunks gzip-b64 de 1200. Raw-paste corrompe ~1/6 a ~1/2 (checksum pega); **fix = paste em base64** (`decodeURIComponent(escape(atob(b64)))`, sem IIFE — o parser do js_tool quebra em `(function(){})()`); chunk teimoso → **2 metades b64 de 600**, e se ainda erra → **4 quartos de 300** (paste longo de b64 erra 1 char válido no meio, invisível em samples de ponta). Verificar por bissecção de checksum. **Multi-browser:** se aparecer "multiple Chrome browsers", os chunks + login vivem no browser ORIGINAL (localStorage é per-profile) — `select_browser` por deviceId e cheque `localStorage.getItem('WM0')!==null && #wpadminbar` pra achar o certo; o progresso persiste no localStorage daquele profile.
- Two-tone (`Bits.js`): `cut=round(len*ratio)`; parte final em `.muted`.

## Produtos: imagens não preenchiam a card (só 2 de 6) — causa raiz
Sintoma: só cards retrato (Especiarias 1800×3600) enchiam; as 2:1 (1800×900) mostravam altura ~198px e sobrava azul. `.prodx-img` tinha `position:absolute;inset:0;width:100%;height:100%` — **correto na fonte**, mas no frontend `height` computava 198px (= largura×aspect), i.e. `height:auto` em efeito.
**Causa:** `.elementor img{height:auto}` (especificidade 0,0,1,1) **vence** `.prodx-img` (0,0,1,0). Teste que fechou o diagnóstico: `img.style.height='100%'` inline → 528px na hora ⇒ override é regra de stylesheet SEM `!important`.
**Fix:** subir especificidade **e** forçar: `.prodx-card .prodx-img{...width:100%!important;height:100%!important}`. Todas as 6 → 528px. Regra geral p/ img full-bleed em widget Elementor: **sempre `!important` no height** (o reset `.elementor img{height:auto}` derruba classe simples).

## Botões CTA desalinhados (fcta) — causa raiz
Ghost tinha **`border_border:'solid'` 1px nativo** (do widget antigo) → desalinhava vs o primário sem border. Fix: **remover o border nativo** (`border_border:''`, width 0) e desenhar a borda com **`box-shadow:inset 0 0 0 1px`** no `custom_css` (não afeta layout). Ambos ficam 50px, mesmo baseline. Não era o círculo (34px idêntico nos dois).

## i18n das 14 seções (feito)
Dado central `SEC` (pt/en/es) embutido no langWidget. `apply()` central traduz seções estáticas via DOM (classes `x-*` + seletores por classe/índice: `.pillar h3`, `.prodx-cap h3`, `.faq-a-inner`, `.glob2-sv`, etc.). Expõe `window.__XS` + `window.__XL` + dispara `document` event `xlang`. Widgets que **re-renderizam ao interagir** (Steps, Origens) leem `window.__XL` (NÃO `document.documentElement.lang`) e re-renderizam no `xlang`.

**Pegadinha crítica:** o `apply()` seta `document lang` DEPOIS de disparar `xlang` → widgets liam lang stale. Fix: ler `window.__XL` (setado antes do dispatch). Ou setar lang antes do dispatch.

Para traduzir texto de um `<span class="chip"><svg>+texto>` sem matar o ícone: setar só o último `childNodes` (nodeType 3), não `textContent`.

Transporte: patchar só os 3 widgets que mudaram (langWidget grande, Steps, Origens) — gzipar o TEXTO do JS (não o base64: comprime ~2×), reconstruir `btoa(unescape(encodeURIComponent(txt)))` no browser, `html.replace(/atob\('...'\)/,...)`. Verificado: pt/en/es em todas as 14 seções + re-render interativo (clicar passo/país re-renderiza no idioma atual).

## Mapa deformado (gaps/spikes) — causa raiz DEFINITIVA: notação científica
Depois de v1(pin)/v2(dec-0)/v3(dec-1) o mapa SEGUIA com buracos, spikes triangulares e países esparsos. Causa: o `worldPaths.js` oficial tem coords em **notação científica** (`10e-4`, `-10e-4` = ~0.001). Meu tokenizer `/[a-zA-Z]|-?\d*\.?\d+/` casava o **"e" como comando de path** → "10e-4" virava [10, cmd-e, -4], corrompendo TODO path que tinha sci-notation. (Confirmado: `d.match(/[a-zA-Z]/g)` retornava `m/z/e` — "e" com 434 ocorrências.)
**Fix do tokenizer:** número (com expoente) PRIMEIRO na alternância: `/-?(?:\d*\.?\d+)(?:[eE]-?\d+)?|[a-zA-Z]/g`. Com isso dec-0 já renderiza limpo (bate exato com o oficial via headless Chrome).
**Minify final (25 chunks vs 61):** tokenizer-fix + **Douglas-Peucker** (eps 0.5, reduz 95k→~6k pontos preservando shape) + **emit relativo-INTEIRO** (deltas ±1 comprimem ~3× melhor que absoluto). 66KB json → 20KB gzip → 25 chunks. DP com anchor no ponto mais distante de pts[0] (ring fechado). Rasterização de conferência: `Google Chrome --headless=new --screenshot --window-size=1010,505 file://map.svg` (não há rsvg/magick/sharp na máquina). **Regra:** ao reparsear SVG path, o tokenizer TEM que aceitar expoente — senão "e" vira comando e corrompe.

## Botão CTA: texto 10px alto — causa raiz
Não era o border (isso foi outro fix). O texto ficava 10px ACIMA do centro porque `.elementor-button-content-wrapper` (flex que segura texto+ícone) vinha `align-items:normal` → com o ícone de 34px e o texto de line-height curto, o texto encostava no TOPO do wrapper esticado. Os botões que "acertavam por acaso" tinham line-height 35px (centravam pela line-box). **Fix global:** `.elementor-button-content-wrapper{align-items:center}` no `page_settings.custom_css`. Medir com Range.getBoundingClientRect do text-node vs centro do botão (offset 0 = ok), não só a caixa `.elementor-button-text` (que já vinha 8/8).

## Arrow dos botões inconsistente — unificar animação
Cada widget de botão tinha custom_css próprio: uns arrow ↗ (rotate -45) + slide `translate(3px,-3px)` no hover, outros → (sem rotate) com hover `rotate(45deg)` (gira, diferente), e a `transition` às vezes no círculo (não no arrow → não anima). **Fix global** no `page_settings.custom_css` (1 regra `!important` vence todas): `.elementor-button-icon i,svg{transform:rotate(-45deg)!important;transition:transform .35s cubic-bezier(.22,1,.36,1)!important}` + `:hover ...{transform:rotate(-45deg) translate(3px,-3px)!important}`. Os 7 botões ficam iguais à ref. **Nota:** page_settings.custom_css vira arquivo `post-86.css` (não inline) — validar por `getComputedStyle` do arrow, não regex no HTML cru. "Conhecer a plataforma" é text-editor `.x-mlink` (seta "→" em `<span class="ar">`), NÃO botão — fora do escopo.

## Kaspersky/AV flagou o site como malware (HEUR:Trojan.Script.Generic) — causa raiz
O bootstrap `<img src="x" onerror="eval(decodeURIComponent(escape(atob('BIGB64'))))">` que eu usava nos 7 widgets é **assinatura clássica de malware ofuscado** (eval-of-base64). AV heurístico bloqueia no download da página.
**Fix:** trocar por `<script>JS legível</script>` — sem eval/atob/onerror/base64. O `<img onerror>` só era necessário pro **preview do editor** (Elementor injeta via innerHTML, que NÃO roda `<script>`); na **página publicada** o Elementor HTML-widget faz echo verbatim (admin com unfiltered_html) → o `<script>` roda no parse inicial. Verificado: 0 eval/atob/onerror no HTML publicado, e interatividade intacta (xlangInit=true, mapa/steps/kpi renderizam).
**Live sem re-transporte:** decodei o base64 já presente em cada widget de volta pra JS e envolvi em `<script>`, tudo no browser (`html.replace(/<img...onerror="eval\(...atob\('(B64)'\)...\)">/,'<script>'+decode(b64)+'</script>')`). Gerador corrigido: 7 `<img onerror>` → `<script>${js.replace(/<\/script>/g,'<\\/script>')}</script>`.

## Banner OG + SEO + título de uma página Elementor (Yoast instalado)
- **Yoast meta NÃO é REST-writable** (`_yoast_wpseo_title/metadesc` não têm show_in_rest) — POST com `meta:{...}` retorna 200 mas ignora. Mas os **fallbacks do Yoast SÃO REST-writable**: `POST /wp/v2/pages/86 {title, excerpt}` → Yoast usa `title` no template `%%title%% %%sep%% %%sitename%%` (vira og:title + `<title>`) e `excerpt` como meta description (→ og:description). `featured_media` → og:image. Tudo via REST com `X-WP-Nonce: wpApiSettings.nonce` (existe em páginas logadas do site; NÃO em .jpg/admin puro).
- **Banner 1200×630 sem rasterizador local:** montar SVG com o logo **inline** (paths do `xpice-logo-white.svg`, fill branco) + gradiente marca (#0B1631→#0A3EA8) + acento #C4922E. Preview via `Google Chrome --headless=new --screenshot --window-size=1200,630 file://banner.svg`. Upload: gzip(svg)→b64→chunks→browser→`DecompressionStream`→`Image(dataURI)`→canvas 1200×630→`toBlob('image/jpeg',.92)`→`POST /wp/v2/media` (FormData + nonce). Canvas com SVG-de-data-URI e logo inline NÃO tainta (toBlob ok). Cores da marca em `xpice-site/lib/brand.js`, copy em `lib/i18n.js`.
- Trocar o post title renomeia a página no wp-admin (slug fica); o conteúdo Elementor não usa `the_title()`, então só muda `<title>`/og:title/lista-admin.

Ver [[elementor-patch-in-browser]], [[home-xpice-import-estatico]].

## Save de seção nativa via save_builder (poda de defaults) + Presença global

2ª seção convertida (Presença global / glob2): SEM animação (imagem estática `presenca-global.png` + 2 escritórios + 3 KPIs). Ícones = **text-editor com SVG inline** (nativo + editável + fiel ao stroke original; FA solid não bate o traço fino). i18n hooks preservados: `.x-glob-eyebrow`, `.x-glob-title` (Hx innerHTML), `.glob2-oname/orole/sv/sl` (Qx textContent).

**Poda de defaults (chave pra caber no POST):** `elementorModel.toJSON()` infla o payload ~15× (5.87MB) preenchendo TODO default de controle → `save_builder` estoura `post_max_size` → 400 com corpo `"0"` (admin-ajax: POST descartado → `$_POST` vazio → sem action → wp_die(0)). Fix: podar settings iguais ao default ANTES do POST:
```
function ctrlsFor(n){return n.elType==='container'?elementor.config.elements.container.controls:(elementor.widgetsCache[n.widgetType]||{}).controls||{};}
// p/ cada setting: se JSON.stringify(val)===JSON.stringify(ctrl.default) → deleta
```
5.87MB → **308KB**. Elementor re-preenche os defaults no load, então podar é seguro. (`widgetsCache` tem controls dos widgets já usados na página; se um tipo não estiver lá, não poda aquele — checar `missing`.)

**save_builder direto (contorna Backbone travado / editor-tab):**
`POST admin-ajax.php` `action=elementor_ajax&_nonce=<elementorCommon.config.ajax.nonce>&editor_post_id=86&actions={save_builder:{action,data:{status:'publish',elements,settings}}}`. `settings` = `elementor.settings.page.model.toJSON()` (NÃO `container.settings` → 400). Postar da aba **admin-ajax.php** (não da wp-admin/post.php do editor — essa deu 400).

**Bridge entre abas p/ payload grande:** localStorage estoura em ~5MB → usar **IndexedDB** (`xb`/`kv`) pra 4MB+; ou podar antes (308KB cabe em localStorage). Limpar chaves-lixo de transporte antigo (`WM*/MP*/OM*/BN*/PQ*`) libera quota.

**Nonce/sessão:** `save_builder` 400 `"0"` também acontece se a **sessão WP deslogou** (checar `GET /wp-json/wp/v2/users/me` → 401). Nonce do Elementor é por-sessão; ao trocar de browser/perfil ou expirar, o nonce cacheado vira inválido (mesmo valor visível). Relogar → nonce novo (`elementorCommon.config.ajax.nonce` muda) → salva. Reload do editor depois de cada save externo evita clobber.

Ver [[elementor-patch-in-browser]].

## Fidelidade EXATA ao oficial: largura do container + gaps do Elementor

Ao converter HTML→nativo, a diagramação "quase igual" tem 2 causas mensuráveis (comparar `getComputedStyle` do oficial vs nativo — NÃO confiar no olho):

1. **Gaps/paddings default de container do Elementor espalham o conteúdo.** Cada `.e-con` ganha `gap` (~10px) e padding próprios → o rítmo vertical não bate. O oficial usa margens por-elemento (ex.: `.glob2-l` é `display:block`, título `margin:16px 0`, offices `margin-top:40px`, `gap:normal`). Fix: no `custom_css` da seção, zerar/definir gap e padding EXPLÍCITOS em CADA container (`selector .glob2-l{gap:0!important;padding:0!important}` etc.) e pôr a margem só no wrapper do widget (NÃO duplicar no `.elementor-heading-title` — margem dupla = espaço extra). Medir deltas de `getBoundingClientRect().top` entre eyebrow→título→lede→offices e casar com o oficial.

2. **`.wrap` oficial ≠ container boxed do Elementor.** Oficial: `.wrap{max-width:1220px;padding:0 32px}` → padding DENTRO do max-width → **conteúdo 1156px**. Elementor boxed: o `max-width` (boxed_width) fica no `.e-con-inner` e o padding no `.e-con-boxed` de FORA → conteúdo = boxed_width cheio (1220), o padding é absorvido pela margem. Resultado: seção 64px mais larga → col/imagem escala errado (imagem 610 vs 577). Fix: `boxed_width = 1156` (não 1220) replica o `.wrap` exato. Vale pra TODAS as seções (mantém alinhamento entre elas). Aplicar live: loop no model setando `boxed_width={unit:px,size:1156}` em todo container `content_width==='boxed'` + save_builder.

**Reload do editor bloqueado por beforeunload** (após save externo o model fica dirty): `location.reload()` e o navigate falham. Fix: `jQuery(window).off('beforeunload');window.onbeforeunload=null;elementor.documents.getCurrent().editor.isChanged=false;location.reload()`. Confirmar sync lendo `boxed_width` do model reloadado. Sync obrigatório senão salvar do editor clobbera o fix.

Fonte da verdade dos valores: `xpice-site/app/globals.css` (`.glob2` :659, `.wrap` :65, `--maxw` :37) + medição ao vivo do oficial.

Ver [[elementor-patch-in-browser]].

## Correção da animação do arrow: era o GIRO 45°, não o slide

Erro anterior: unifiquei os arrows dos botões pro slide (`rest rotate(-45)` ↗ + `hover translate(3px,-3px)`), baseado no `.btn .arrow` oficial. MAS o botão de referência do dono ("Falar com um especialista") no oficial é `.hero-cta` (globals.css:236-238): **rest sem transform (→) + hover `rotate(45deg)`** (giro leve, → vira ↘). O `.nav-cta-ic` (:174) é igual. O oficial tem 2 estilos (`.btn` desliza, `.hero-cta`/`.nav-cta` giram) — o dono quer o GIRO em TODOS.

Fix (regra global no `page_settings.custom_css`, com `!important` pra vencer os custom_css POR-BOTÃO que tinham rest `rotate(-45)` + hover slide):
```
.elementor-button-icon i,.elementor-button-icon svg{transform:none!important;transition:transform .35s cubic-bezier(.22,1,.36,1)!important}
.elementor-button:hover .elementor-button-icon i,.elementor-button:hover .elementor-button-icon svg{transform:rotate(45deg)!important}
```
`transform:none!important` no rest é ESSENCIAL: sem ele, o rest `rotate(-45)` por-botão (especificidade 0,0,4,0) vence e uns botões ficam ↗ e outros → (inconsistente). Com `none!important`, TODOS rest → uniforme; hover gira 45°. Verificar com `getComputedStyle(icon).transform==='none'` em TODOS + a regra de hover no stylesheet.

Aplicado só no custom_css do page_settings (regra global) — não precisa mexer nos 11 botões. prodx-go (cards) mantém ↗ (arrow nativo revelado no hover do card = oficial).

Lição: quando o dono aponta "esses 2 botões", confirmar QUAL classe/animação o oficial usa naquele botão (`.hero-cta` vs `.btn`) ANTES de unificar — medir o rest+hover do elemento exato, não assumir.

Ver [[elementor-patch-in-browser]].

## Ícones SVG-em-text-editor: centralização + um sumiço; Plataforma híbrida (nativo + HTML só no gráfico)

**Alinhamento dos ícones (glob2/pillar):** o ícone é um `text-editor` com `<svg>` inline dentro de um box (glob2-sic/pillar-ic). O `.elementor-widget-container` estica pra altura do box e o SVG (24px) fica no TOPO (não centraliza vertical). Fix: box `display:flex;align-items:center;justify-content:center` + `selector .X .elementor-widget-container{display:flex;align-items:center;justify-content:center;width:100%;height:100%;line-height:0}` + `svg{display:block}`. Verificar `svgOffTop==(boxH-24)/2` em TODOS.

**Um ícone sumiu (box/4 continentes):** o `editor` de UM text-editor-ícone ficou vazio (edLen 0) enquanto os outros mantiveram o SVG. Provável falha de transporte/prune num ciclo, não sanitização (unfiltered_html ativo → os outros SVGs sobrevivem os saves). Fix: `$e document/elements/settings {editor:SVG}` + save; confirmar que sobrevive à poda (`/M21 8l/.test(editor)`). Robustez futura: se re-sumir, migrar ícones pra `background-image` data-URI no CSS (não há conteúdo de widget pra sumir).

**Plataforma (pillars) híbrida:** cards = nativo (container `.pillar` > `.pillar-top`[ícone+número] + heading h3 + text-editor desc + heading métrica), e SÓ `.pillar-viz` (linha animada / 6 barras / 3 score bars) = **widget HTML** com o markup. **1 script** (`html` widget) roda o `pillJS`: `IntersectionObserver` no `.pillars` (agora container nativo) anima `.viz-path`(stroke-dashoffset), `.viz-bars i`(height), `.score-bar span`(width), `.v[data-count]`(contador). Como as vizzes ficam DENTRO do `.pillars` nativo, o querySelectorAll do script as acha — 1 script pra todas.

**Armadilha i18n:** `langJS` faz `Qx(".pillar p",...)` (só a descrição). Se número/métrica forem text-editor (têm `<p>`), viram `.pillar p` também → i18n quebra. Fix: número e métrica = **heading** (header_size:'div', sem `<p>`); só a descrição é text-editor. Título = heading header_size:'h3' → casa `.pillar h3`.

Ver [[elementor-patch-in-browser]].

## Como funciona (steps) → híbrido nativo com interatividade preservada

Seção interativa (lista de 4 etapas clicáveis + card com crossfade/auto-avanço) convertida SEM tocar no `stepsJS` — o segredo é preservar o CONTRATO DE CLASSES que o JS consulta:
- Lista esquerda = NATIVA: `.steps2` (container grid) > `.steps-list` > `.steps-rail`>`.steps-rail-fill` (containers vazios; JS seta `fill.style.height`) + 4× `.step-item` (containers; JS liga click e alterna `data-on`). Dot do trilho virou `::before` do `.step-item` (JS não toca nele, só o data-on).
- `.si-title` = heading nativo; o JS faz `st.textContent=...` no wrapper — apaga o `.elementor-heading-title` interno e vira texto puro; estilo tem que estar no WRAPPER (`selector .si-title{...}`) pra sobreviver.
- Card direito = HTML widget (`sv-holder`): fotos crossfade + `sv-num`/`sv-inner`/`sv-dots` — tudo que o JS reescreve + a animação svIn. `@keyframes` no custom_css passa literal (o Elementor só substitui a palavra `selector`).
- Grid stretch: o wrapper do widget HTML é o grid-item → `selector .sv-holder{height:100%}` + `.elementor-widget-container{height:100%}` + `.steps-visual{height:100%}`.
- Verificação FUNCIONAL, não só visual: `items[2].click()` → conferir `data-on`, h3, sv-num, sv-meta, fill 75%, photo.on idx, dot.on idx. Screenshot pegou o auto-avanço no meio da transição svIn = prova viva.

Container nativo VAZIO (rail-fill) renderiza `<div>` normal no frontend — ok como elemento decorativo manipulado por JS.

Ver [[elementor-patch-in-browser]].

## Sobre + FAQ + Conteúdo → nativos (batch de 3 numa passada; contratos FirstT/LastT do i18n)

3 seções convertidas num único ciclo (1 payload gzip {about,faq,art}, 1 splice triplo, 1 save_builder) — muito mais barato que 3 ciclos.

**Sobre (aboutw):** 100% nativo, ZERO widget HTML. Estrutura em containers (head/cards/team) + headings/text-editors. Listas compostas decorativas (timeline, fairchips, team-grid, globo svg) = **text-editor com HTML rico** — é widget NATIVO (editável como rich text), não widget HTML; satisfaz "tudo json elementor". Globo decorativo: wrapper `position:absolute;inset:0;pointer-events:none` + conteúdo com z-index atrás; irmãos com `position:relative;z-index:1`.

**FAQ (faqw):** esquerda (eyebrow/título/sub) nativa; accordion = HTML widget + faqJS (é o elemento animado E o `FirstT('.faq-q')` do i18n exige que o PRIMEIRO childNode de .faq-q seja text-node — botão nativo não daria). Toggle verificado por clique: item 1 fecha, item 2 abre com maxHeight animado.

**Conteúdo (art-grid):** 100% nativo. Imagem absoluta no `.art-media` (aspect 16/10) via `.elementor-widget-image{position:absolute;inset:0}`; tag = heading absoluto; h3 nativo casa `.art-body h3` (estilo + Qx do i18n). **Pegadinha FirstT:** `FirstT('.art-more')` também exige text-node primeiro → a classe `art-more` vai no **span INTERNO** do editor do text-editor (`<span class="art-more">Ver todos <span class="ar">→</span></span>`), NUNCA no wrapper do widget (senão o i18n APPENDA texto duplicado — LastT/FirstT fazem appendChild quando o node não é texto).

**Regra geral dos helpers i18n:** Tx/Qx (textContent no elemento) aceitam classe no wrapper do widget (estilo precisa estar no wrapper). Hx (innerHTML) idem. **FirstT/LastT (text-node posicional) NÃO** — a classe tem que estar num elemento cujo primeiro/último filho é texto → pôr a classe dentro do conteúdo do editor, ou manter o bloco como HTML widget.

Ver [[elementor-patch-in-browser]].

## FAQ itens + Footer → nativos (fim da conversão)

**FAQ itens nativos com faqJS intacto:** cada `.faq-item` = container; pergunta = text-editor com `<p class="faq-q">Q<span class="faq-ic"></span></p>` (classe no `<p>` INTERNO → faqJS clica nele E FirstT acha text-node primeiro); resposta = text-editor cujo WRAPPER leva `_css_classes:'faq-a'` (o JS seta `wrapper.style.maxHeight`; CSS `overflow:hidden;max-height:0;transition` no wrapper; `<div class="faq-a-inner">` no editor mede o scrollHeight). `data-open` inicial não precisa no markup — o init do faqJS seta. Verificado: clique abre/fecha animado, itens são `.e-con` editáveis.

**Footer 100% nativo:** grid `.footer-top` (containers) + colunas com `<h4>`/links como rich-text (text-editor) — DOM idêntico ao contrato do langJS (`fh=querySelectorAll('.footer-top .footer-col h4')` → fh[0]=Menu fh[2]=Idioma; `x-foot-contact` é CLASSE NO `<h4>` dentro do editor, nunca no wrapper — textContent no wrapper mataria o h4 e quebraria a ordem do fh[]). 1ª col = `<a>`s em ordem pro i18n. Logo = image widget; sociais = text-editor com `<a><svg>`. Footer também migrou pro `boxed()` 1156 (antes tinha Cn manual 1220 — bug herdado).

**Transporte — transcrição de chunk corrompe silenciosamente:** 2 colagens do mesmo chunk deram o MESMO checksum errado (erro sistemático de transcrição, não aleatório). Escalation que resolve: dividir o chunk em metades de 600 com checksums PRÓPRIOS calculados direto do arquivo, colar cada metade, verificar cada uma, concatenar. Nunca confiar em "re-colar o mesmo texto" — reler o arquivo e verificar por parte.

Página INTEIRA convertida: só restam como HTML os elementos com animação/interação própria (mapa Origens, card visual dos steps, gráficos da Plataforma, scripts). Todo o resto = JSON Elementor editável.

Ver [[elementor-patch-in-browser]].

---

## Smooth scroll + reveal-on-scroll (blur) no Elementor externo

**Pedido:** smooth scroll + entrada de cada frase com blur+fade+rise.

**Solução (1 seção HTML no fim + CSS no page_settings):**
- **Smooth scroll = Lenis** (`cdn.jsdelivr.net/npm/lenis@1.1.14`), `new Lenis({duration:1.1,smoothWheel:true})`, âncoras via `l.scrollTo(t,{offset:-84})`. Mesma lib do site oficial.
- **Reveal = IntersectionObserver + CSS**: `.xrl{opacity:0;filter:blur(12px);translateY(26px);transition .85s cubic-bezier(.22,1,.36,1)}` → `.xrl.xin{opacity:1;filter:blur(0);none}`. Body ganha `.xrl-on` só via JS (no-JS = tudo visível, graceful).
- **prefers-reduced-motion**: gate total (sem Lenis, sem blur, scroll-behavior auto).
- **Stagger por seção**: `transitionDelay=min(i*60,540)+"ms"` agrupando por `.e-con.e-parent`.
- **Alvos**: headings/text-editor/button/image widgets + linhas do hero (`.htl`) + cards nomeados; exclui nav e blocos já cobertos.

**Bug pego na verificação (systematic-debugging):** 2 elementos no rodapé absoluto ficavam presos ocultos — `rootMargin:"0px 0px -6%"` cria zona morta no fim da página onde o IO nunca dispara. **Fix:** fallback `bc()` — listener de scroll que, ao chegar a `scrollHeight-4`, força `.xin` em todos os alvos e se remove. Verificado live: `{total:118,revealed:118,stuck:0,atBottom:true}`.

**Transporte live:** node reveal (2916 chars) → gzip+base64 → 2 chunks com checksum `x=(x*31+c)%1e9+7` → push `window.__RC2` → verifica cks → `DecompressionStream('gzip')` no LIGHT tab → localStorage bridge (mesma origem) → editor lê, reid vs ids existentes, substitui top idx 15, prune defaults, `save_builder`. Async IIFE no js_tool serializa `{}` — sempre gravar resultado em `window.__x` e reler em call separado.

---

## Ajustes hero/produtos/FAQ + armadilha do modelo stale do editor

**3 fixes (gerador → save_builder por seção):**
1. **Hero entrada sequencial** (revealJS): ordenar cada grupo por ordem DOM (`compareDocumentPosition`) e passo maior no hero (`hero?150:70`, detectado por `sec.querySelector('.x-title')`). Antes: 60ms + ordem do array (título antes do badge) = "tudo junto". Depois: badge→linhas→sub→cta→mission, 150ms.
2. **Header two-column** (produtos): flex NÃO resolve — widget filho com width:100% quebra pra 2ª linha no flex-wrap. **Usar `display:grid!important;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr)`** garante 2 colunas sem wrap. (Elementor força `flex-direction:column` no container; `display:grid!important` no `.elementor-element-XX` vence `.e-con{display:flex}`.)
3. **Ícone FAQ +/− robusto**: NÃO usar `<span class="faq-ic"></span>` vazio dentro do text-editor — KSES/TinyMCE stripa spans vazios (aconteceu só no item aberto/editado). **Desenhar via pseudo-elementos absolutos em `.faq-q`**: `.faq-q{position:relative;padding-right:44px}` + `.faq-q::before/::after{position:absolute;right:7px;width:13px;height:2px}` + `::after{rotate(90)}` + `[data-open] .faq-q::after{rotate(0)}`. Pseudo-elemento é CSS, não pode ser stripado.

**ARMADILHA (regressão pega e corrigida): modelo stale do editor clobbera.**
`save_builder` lê `elementor.elements.toJSON()` do modelo Backbone EM MEMÓRIA do editor tab. Saves externos (via admin-ajax) escrevem no DB mas **NÃO atualizam esse modelo**. Sequência: save A (troca faq) → modelo do editor ainda tem faq ANTIGO → save B (troca produtos, lê modelo stale) → **re-escreve o faq antigo, clobberando o save A**. Sintoma: fix "sumiu" após um save seguinte de outra seção.
**Regra:** após CADA save_builder externo, **recarregar o editor tab** (`jQuery(window).off('beforeunload');elementor.saver.setFlagEditorChange(false);location.reload()`) ANTES do próximo save — OU aplicar todas as seções num único save. Verificação: reler `els[i]` do modelo recém-sincronizado e conferir a assinatura (ex.: `display:grid`, `hero?150`, ausência de `faq-ic`).

---

## Mobile: hambúrguer + drawer (a lacuna que faltava)

Diagnóstico (systematic-debugging): a 511px o NAV quebrava (pill de links empilhado, CTA/lang cortados) — o gerador não tinha tratamento mobile do nav. As demais seções JÁ colapsavam (art-grid, footer, faq, brz, plataforma têm `@media` no gerador). Fonte da verdade do mobile oficial: `xpice-site/app/globals.css` (@media 640/760/860/900/1000 + `.nav-burger` + "mobile drawer" §873).

**Solução — 1 widget HTML autocontido (`navMobile`) no `navRight`:**
- burger `.xburger` (display:none; `@media(max-width:860px){display:inline-flex}`) + drawer fullscreen `.xdrawer{position:fixed;inset:0;transform:translateX(100%)}` → `[data-open="true"]{transform:none}`.
- Drawer: logo+X, 4 links `.xdl` (com classes `x-nav0..3` p/ i18n), CTA azul, 3 botões de idioma.
- JS: toggle open/close, `body.style.overflow=hidden` + `window.__lenis.stop()` ao abrir, fecha ao clicar link, idiomas proxy-clicam nas `.xlopt` do dropdown desktop (que ainda estão no DOM, só `display:none`).
- Regras globais no `<style>` do widget: `@media(max-width:860px){.xnav .xlinks,.xnav .elementor-widget-button.x-navcta,.xnav .xlang{display:none!important}}` + `@media(max-width:640px){.e-con.e-con-boxed{padding:0 20px} .prodx{gap:12} .x-title heading{font-size:clamp(34px,9.5vw,44px)}}`.

**BUG pego: colisão de classe reusada.** Reusei `x-navcta` no CTA do drawer p/ i18n. Mas o drawer é descendente de `.xnav` no DOM, então `@media{.xnav .x-navcta{display:none}}` escondeu TAMBÉM o CTA do drawer. Fix: mirar só o widget desktop — `.xnav .elementor-widget-button.x-navcta` (o CTA do drawer é `a.xdcta`, não `.elementor-widget-button`). **Lição: ao reusar classe entre desktop e um clone mobile dentro do mesmo container, as regras de esconder mobile pegam os dois; qualifique pelo tipo de elemento.**

**Nota de ferramenta:** `getComputedStyle().transform` no js_tool do Chrome MCP retornou valor STALE (translateX(100%) mesmo com `data-open=true` aplicado e `matches()=true`, e ignorou inline `!important`) — falso alarme. O screenshot mostrou o drawer correto. **Ao debugar transform/layout via Chrome MCP, confirme com screenshot; não confie só no getComputedStyle.** Teste mobile trava em ~511px (largura mín. da janela do Chrome desktop) — regras ≤640/≤760 já disparam a 511, suficiente pra validar.

---

## Menu = popup flutuante (desktop+mobile) + burger à direita + H1 mobile menor

Pedido do dono: (1) H1 mobile muito menor/proporcional, (2) burger alinhado à direita no header mobile, (3) menu deve ser um **popup flutuante** (card centralizado com overlay) tanto no desktop quanto no mobile — "não é sobre cores/diagramação, só a natureza de popup".

**Mudanças no nav (gerador):**
- **Drawer→Popup**: trocado `.xdrawer{position:fixed;inset:0;transform:translateX(100%)}` (slide fullscreen) por overlay `.xpop-ov{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(4,10,28,.45);backdrop-filter:blur(5px)}` + card `.xpop{max-width:460px;border-radius:26px;transform:scale(.94);opacity:0}` → `[data-open] .xpop{transform:none;opacity:1}`. JS: fecha ao clicar no overlay (`e.target===ov`), Escape, ou link. Mesmo popup em desktop e mobile.
- **Burger sempre visível** (removido o `display:none` base + `@media` que mostrava). Menu inline (pill) removido do DOM do navInner — navegação agora só via popup.
- **Alinhamento direita**: navInner grid mudou de `1fr auto 1fr` (com pill no meio) para **`1fr auto`** (logo | navRight). Com o pill removido, navRight vira a coluna `auto` encostada à direita — resolve o burger que ficava no centro (a col3 `1fr` não esticava o navRight). CTA+lang inline ficam no desktop; `@media(max-width:860px)` esconde `.elementor-widget-button.x-navcta` e `.xlang` (vão pro popup).
- **H1 mobile**: `@media(max-width:640px){.x-title heading{font-size:clamp(23px,6vw,31px)!important}}` (antes era `clamp(34px,9.5vw,44px)` = grande demais). A 390px = 23,4px.

**Nota de teste:** `resize_window` do Chrome MCP às vezes não reduz abaixo da largura lógica da tela (travou em 994px numa sessão; 511px em outra). Quando não dá pra reduzir a janela, validar as media queries lendo as regras direto de `document.styleSheets` (recursão em `CSSMediaRule.cssRules`) e computar o clamp manualmente (`clamp(23,6vw,31)` @390 = 23.4px). Screenshot confirma o popup no tamanho disponível.

---

## Menu popup 100% Elementor nativo/editável (não bloco HTML)

Pedido: o menu deve ser JSON Elementor editável, não html/css/js.

**Reconstrução (widgets nativos + CSS na aba Avançado + 1 script só pro toggle):**
- **burger** = `button` widget (WK 'xburger') com `selected_icon:fa-bars`, `text:''`. CSS quadrado 46px na aba Avançado (`custom_css`).
- **close** = `button` widget (fa-times).
- **popup** = 2 containers: overlay `.xpop-ov` (custom_css `position:fixed;inset:0;display:flex;center;bg rgba+blur;opacity:0;pointer-events:none` + `selector[data-open="true"]{opacity:1;pointer-events:auto} selector[data-open="true"] .xpop{transform:none;opacity:1}`) e card `.xpop`.
- **links** = 4 `button` widgets, classe `x-navN xdl` (x-navN p/ i18n do langJS via `.elementor-button-text`).
- **CTA** = `button` widget (x-navcta xdcta).
- **idiomas** = 3 `button` widgets, `link.custom_attributes:'data-l|pt'` → renderiza `<a data-l="pt">`. O toggle lê `data-l` e proxy-clica no `.xlopt[data-l]` do engine de idioma (langWidget, que fica no DOM mas `.xnav .xlang{display:none}`).
- **estado [data-open]** no overlay via custom_css (aba Avançado) — editável no painel.
- Regras responsivas globais (esconde CTA ≤860, H1 ≤640, gutter) → **PAGE_CSS** (Config. da Página → CSS personalizado, editável).
- **Único JS** = 1 widget html com o `<script>` do toggle (abrir/fechar, Escape, click-fora, proxy de idioma). Padrão do projeto: conteúdo nativo + comportamento em script mínimo (igual FAQ/steps/reveal).

**Verificado live:** burger=button widget nativo, 4 links=button widgets, popup abre/fecha, troca de idioma PT↔EN funciona (hero "Importação..."↔"Import and export of", link "Plataforma"↔"Platform"). i18n via `data-l` custom_attributes proxy-clicando `.xlopt`.

**Chave:** widget `button` link aceita `custom_attributes` (`key|value`) → dá pra pôr `data-*` em elemento nativo sem HTML cru. Elementor button icon color = `button_text_color`. CSS por elemento = `custom_css` (aba Avançado, editável). Estado com atributo = `selector[attr="v"]` no custom_css do container.

---

## Mobile: header alinhado + H1 rediagramado (iteração)

Problemas reportados: no mobile o header desalinhava e o H1 estava grande/quebrando em 7 linhas.

**Causa header:** o widget HTML do toggle (`.xpopjs`, só `<script>`) renderizava VISÍVEL no header (width 22px, à direita do burger), empurrando o alinhamento. Fix: `.xpopjs{position:absolute!important;width:0!important;height:0!important;overflow:hidden;pointer-events:none;flex:0 0 0!important}` no PAGE_CSS (mesmo padrão do `.xscroll`). Todo widget-só-script no header precisa dessa regra senão ocupa espaço (só no frontend some sozinho? NÃO — precisa forçar).

**Causa H1 grande:** (1) `typography_font_size_mobile: U(34)` no heading competia com o clamp do PAGE_CSS; baixei pra 23. (2) padding lateral ACUMULADO confinava o H1 a 225px (hero 10 + heroInner 20 + lead 10 + defaults = ~60px cada lado). Fix: classes `xhero`/`xlead` + `@media(max-width:640px){.xhero{padding:0}.xhero .e-con-inner{padding:0 18px}.xlead{padding:0;max-width:none}}` → gutter 18px, H1 ganha ~340px. Fonte final `clamp(19px,5.2vw,24px)` → 19px@345.

**Ferramenta — medir mobile sem reduzir a janela:** a janela do Chrome MCP travou em ~1785px (não reduz). Usei o **modo mobile do editor Elementor**: `elementor.changeDeviceMode('mobile')` + medir dentro do iframe `elementor.$preview[0].contentWindow.document` (viewport real ~345px, dispara media queries). CUIDADO: o preview iframe NÃO recarrega o CSS após save via ajax (mostra valor velho) — validar o css definitivo lendo `document.styleSheets` no FRONTEND (recursão em CSSMediaRule) e computar o clamp. cwd do Bash reseta entre calls → sempre `cd` antes de `node build-xpice-nativo.mjs`.

---

## Editabilidade no Elementor: scripts devem se desativar no editor

**Sintoma:** "edito o texto no Elementor e nada muda." Causa raiz (systematic-debugging): o `langJS` (i18n) e o `revealJS` rodam no PREVIEW do editor — o langJS reescreve `innerHTML` de `.x-title/.x-eyebrow/.x-sub` e o reveal põe `opacity:0`. No editor isso reverte/esconde a edição do usuário → "nada muda". (No frontend PT o langJS já não roda: `if(saved&&saved!=="pt")apply(saved)` — só EN/ES; e não é cache: a URL limpa serve o texto novo.)

**Fix:** guard nos dois scripts logo no init — `if(document.body.classList.contains('elementor-editor-active'))return;`. No editor os scripts setam o flag mas não tocam o DOM. Verificado no preview do editor: `__XL` null (langJS inerte), `.htl` opacity 1 (reveal inerte) → texto plano, visível, editável. No frontend rodam normal.

Regra: **todo widget-script que manipula/esconde conteúdo editável precisa do guard `elementor-editor-active`** senão quebra a edição no canvas.

## Clobber do modelo stale — REINCIDENTE (2ª vez)

De novo: salvei nav/reveal lendo `elementor.elements.toJSON()` de um editor que NÃO tinha sido sincronizado após o save anterior da hero → o idx1 (hero) foi re-salvo com htl ANTIGO, revertendo as 4 linhas. **Regra dura: SEMPRE `location.reload()` no editor após CADA save externo, antes do próximo.** Não confiar que "reloadei um turno atrás". Detectar: comparar htlText do editor-preview vs frontend antes de salvar.
