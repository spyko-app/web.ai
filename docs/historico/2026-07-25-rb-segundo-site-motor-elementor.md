# Segundo site pelo motor Elementor (Ronaldo Barcelos) — o que o Xpice ensinou e o que era novo

**Data:** 2026-07-25 · **Alvo:** ronaldobarcelos.com.br página 346 (Elementor 4.2.0) · **Fonte:** `/Volumes/PortableSSD/ARQUIVOS/Landing Page RB/site` (HTML/CSS/JS estático)

## Resultado
9 seções, 240 nós, **94% widgets nativos** (133 nativos / 9 HTML) — melhor que o Xpice (90%). Tempo muito menor porque o método já estava destilado.

## O que se provou reusável (o "motor" de verdade)
As convenções do `build-xpice-nativo.mjs` foram copiadas quase sem alteração e funcionaram de primeira:
`id()` FNV · `U()/bx()` · `W/Cn/WK/boxed` · seção = container topo com `custom_css` escopado em `selector` · classes por `css_classes` (container) e `_css_classes` (widget) · scripts em widget HTML invisível com guarda `elementor-editor-active` · save via `admin-ajax` `save_builder`.

**Conclusão para o produto (Web.ai):** o que se repete não é o código do site, é o **vocabulário + o pipeline de escrita**. É exatamente o núcleo que a Fase 0 deve extrair.

## Novidades desta rodada

### 1. Assets já estavam na Media — sempre checar antes de subir
`GET /wp-json/wp/v2/media?per_page=100&_fields=id,slug,source_url` com o nonce do navegador logado (`wpApiSettings.nonce`) listou as 9 imagens já lá. **Zero upload, zero Application Password.** Checar a Media antes de qualquer pipeline de upload.
Bônus: este site aceita SVG (logo-merz.svg, logo-btl.svg estavam na Media) — a política de mime varia por instalação, não assumir.

### 2. Payload pequeno cabe colado — mas corrompe
17.8KB base64 coube numa chamada de `javascript_tool`, mas **um bloco no meio chegou corrompido** (comprimento igual, CRC do gzip quebrado: "incorrect data check").
Diagnóstico barato que resolveu: checksum de **16 blocos** nos dois lados → só o bloco 15 divergia → reenviei ~1.1KB e o checksum global bateu. Não reenviar o payload inteiro.

### 3. `DecompressionStream` + `new Response(stream)` falha neste navegador
`new Response(blob.stream().pipeThrough(ds)).arrayBuffer()` → `TypeError: Failed to fetch` no painel nativo (funcionava no claude-in-chrome). Alternativa que funciona em ambos:
```js
var ds=new DecompressionStream('gzip');
var w=ds.writable.getWriter(); w.write(bin); w.close();
var rd=ds.readable.getReader(), parts=[], len=0, res;
while(!(res=await rd.read()).done){parts.push(res.value);len+=res.value.length;}
```

### 4. `scroll-behavior:smooth` engana toda medição de scroll
`h.scrollTop=1200` seguido de leitura imediata devolvia o valor antigo → parecia que a página não rolava (quase virou caça a um bug de `overflow` inexistente). Antes de investigar scroll travado: `document.documentElement.style.scrollBehavior='auto'`.

### 5. Screenshot em branco ≠ página em branco
Com o painel oculto, `computer{screenshot}` devolve imagem em branco/desatualizada. Auditar por medição é mais confiável e mais barato:
`elementFromPoint(x,y)` + `getBoundingClientRect()` + contagem de nós (`.rbplan`=6, `.rbfloor`=5, imagens quebradas=0).

### 6. Reveal precisa de varredura inicial
IO com `rootMargin:'0px 0px -10% 0px'` não dispara para o que já está na tela no load → ribbon do hero nascia com `opacity:0`. Correção: no init, marcar `.in` direto em quem tem `rect.top < innerHeight*0.95` e só observar o resto.

### 7. Contador: derivar do texto, não de `data-*`
Emiti `.cnum` sem `data-count` e o contador zerou tudo ("0"). Em vez de injetar data-attributes (que o widget nativo de heading não expõe bem), o script passou a **ler o próprio texto**:
`raw.match(/^([^0-9]*)([0-9.,]+)(.*)$/)`, converte pt-BR (`2.500`→2500), anima e **no fim restaura `raw`**.
Ganho duplo: zero drift e o número continua **editável no Elementor** como texto normal.

## As 2 armadilhas do Elementor que quebraram o layout (valem para TODO site do motor)

### A) `e_font_icon_svg` — ícone de botão sai BRANCO/invisível
Elementor 4.x (feature `e_font_icon_svg`, ver `<meta name="generator">`) não usa fonte de ícone: injeta **SVG inline** e pinta por `fill`. CSS que define `color` no botão não pinta nada — o SVG fica com o `fill` padrão (branco). Sobre fundo claro = ícone sumido, círculo vazio.
```css
.rb .elementor-button-icon svg{fill:currentColor!important;width:1em;height:1em}
```
Diagnóstico rápido: `[...document.querySelectorAll('.elementor-button-icon svg')].map(s=>getComputedStyle(s).fill)` — se vier `rgb(255,255,255)`, é isto.

### B) Lazy-load de background zera TODO `background-image` (inclusive gradiente CSS)
Elementor emite:
```css
...:nth-of-type(n+4):not(.e-lazyloaded):not(.e-no-lazyload) *{background-image:none!important}
/* e variantes @media(max-height:1024px) → n+3 · (max-height:640px) → n+2 */
```
Ou seja: **nem `!important` na minha regra vence** — some o gradiente do hero (`radial-gradient`) e do card destaque (`linear-gradient`). Só afeta `background-image`; `background-color` e pseudo-elementos (`::before`) passam ilesos, o que faz o bug parecer aleatório.
**Correção:** classe `e-no-lazyload` na seção de topo. Como o motor entrega imagem em widget `<img>` (nunca background CSS), desligar é grátis — aplico em todas as seções por padrão no build.

### C) Imagem não preenche container de altura fixa
`height:100%` no `<img>` não resolve porque a cadeia `.elementor-widget-image › .elementor-widget-container` tem altura `auto`. Resultado: container 1429px, imagem 781px → 648px do fundo do container aparecendo.
```css
.rbfill,.rbfill>.elementor-widget-image,.rbfill .elementor-widget-container,.rbfill .elementor-widget-image a{height:100%!important;width:100%;line-height:0}
.rbfill img{width:100%!important;height:100%!important}
```
Padrão: sempre que o container tiver altura definida (absoluto/`aspect-ratio`/`height`), marcar com a classe utilitária.

### D) Nav fixa × barra do admin
`position:fixed;top:0` fica **sob** a `#wpadminbar` (32px / 46px ≤782px) e corta o logo — só para quem está logado, então passa despercebido.
```css
body.admin-bar .rbnav{top:32px}@media(max-width:782px){body.admin-bar .rbnav{top:46px}}
```

### F) Container do Elementor é `column` — `align-items:center` não centraliza na vertical
CSS de site estático assume `display:flex` **row** (padrão do HTML). O container do Elementor já vem `flex-direction:column`, então copiar `align-items:center` centraliza no eixo ERRADO: o conteúdo cola no topo da seção. No hero isso jogou a H1 por baixo da nav fixa (H1 em t=48, nav ocupando 32..106).
**Regra:** ao portar `display:flex;align-items:center` de um site estático, escrever `flex-direction:row!important` junto — ou trocar para `justify-content:center`.

### G) Texto do botão estica e a letra cola no topo
`.elementor-button-content-wrapper` é flex com `align-items:normal` (=stretch). Com um ícone de 34px ao lado, a caixa do texto vira 34px de altura enquanto o `line-height` é 15px → a letra renderiza no topo da caixa. O padding do botão é simétrico, mas **parece** ter mais espaço embaixo.
```css
.rb .elementor-button-content-wrapper{align-items:center}
```
Diagnóstico: comparar `textRect.top - btnRect.top` com `btnRect.bottom - textRect.bottom`; se divergirem, é isto. (Estava no gerador do Xpice; esqueci no RB e o dono viu na hora.)

### H) `height:100%` na classe utilitária mata o próprio posicionamento
Ao criar a utilitária `.rbfill` para forçar a cadeia de wrappers a 100%, incluí o **próprio** `.rbfill` na lista — e ele é quem define a altura via `top/bottom` absolutos. Resultado: a foto do hero virou 100% da seção e transbordou 96px.
**Regra:** a utilitária aplica 100% só nos DESCENDENTES (`.rbfill > *`), nunca no elemento que ancora a altura.

### E) Elemento absoluto no mobile precisa de `position` explícito
A regra mobile só trocou `flex-direction` e o ribbon perdeu o `position:absolute` do escopo da seção → transbordou 32px para a seção seguinte. Ao sobrescrever posicionamento em media query, **repetir `position`**.

## O teste de fidelidade que vale mais que ler CSS: diff de estilo COMPUTADO contra o original publicado

Reproduzir a partir do `styles.css` **não basta** — o navegador pode resolver a cascata diferente do que o arquivo sugere. Caso real:

```css
.hero__name span{font-weight:600;font-size:15px;color:var(--paper)}   /* linha 121 */
.hero__ribbon span{font-size:10.5px;letter-spacing:.08em;
                   text-transform:uppercase;color:var(--muted)}        /* linha 126 */
```
As duas têm especificidade (0,2,0) e o nome está **dentro** do ribbon → a segunda vence. No site publicado o nome renderiza **10,5px, caixa alta, apagado** — não 15px escuro como o arquivo faz parecer. Eu tinha portado o que o CSS "dizia", não o que ele *fazia*.

**Procedimento:** abrir o original publicado, capturar `getComputedStyle` de ~20 elementos-chave (fontSize/weight/textTransform/color/letterSpacing), rodar o mesmo script na versão Elementor e comparar. Resultado aqui: **1 divergência em 21** — invisível a olho nu e impossível de achar lendo o fonte.

Bônus: confirmou que 20 dos 21 estavam pixel-idênticos, o que dá confiança pra parar de procurar.

## Régua de verificação que usei (sem screenshot)
- 7 âncoras presentes (`id="top|quem|metodo|ecossistema|why|redes|cta"`)
- 9 seções com altura > 0 e texto correto
- 6 planos · 5 floors · 14 logos no marquee · 3 contadores
- `imgs_broken=0` (`naturalWidth===0` em imagens completas)
- mobile 390px: `scrollWidth===clientWidth` (sem scroll horizontal), burger `flex`, links `none`, todos os grids em 1 coluna
- popup mobile abre (classe `on` + overlay + 5 links)
