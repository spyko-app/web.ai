# Gerar JSON Elementor FIEL por código (site real → template importável)

Data: 2026-07-22 · Contexto: recriar o site xpice-site (Next.js/Vercel) como template Elementor nativo, editável e importável, na página `xpiceconnections.com/xpice-nativo-teste/` (page 86). Home atual (`page 72`) = import estático do Vercel (ver [[home-xpice-import-estatico]]).

## Formato do JSON (V3 clássico) — regras que quebram fidelidade se erradas

- Envelope: `{content:[...], page_settings:{}, version:"0.4", type:"page"}`. Nó: `{id(8hex único), elType:"container"|"widget", settings:{}, elements:[], isInner:bool, widgetType?}`.
- **`border_radius` é controle de DIMENSÕES, não slider.** Usar `{unit:'px',top,right,bottom,left,isLinked}` — NUNCA `{unit,size,sizes}`. Se errar, Elementor ignora e o botão cai no default `border-radius:3px` do `frontend.min.css`. (Bug real que deixou botões sem pill.)
- Slider (font-size, gap, min_height, width, boxed_width, blur): `{unit,size,sizes:[]}`.
- Dimensões (padding, margin, border_width, border_radius): `{unit,top,right,bottom,left,isLinked}`.
- Cor: string hex ou `rgba()`. Tipografia: `typography_typography:'custom'` + `typography_font_family` + `typography_font_size`(slider) + `typography_font_weight`(string).
- Overlay de imagem de fundo = **nativo**: `background_overlay_background:'gradient'` + `_color`/`_color_b` + `_color_stop`/`_color_b_stop` + `_gradient_type` + `_gradient_angle`. Renderiza via `::before` ATRÁS do conteúdo (não usar `:after` custom com z-index — cobre o texto).
- Container flex-item que deve "hug content" (não esticar): `custom_css:'selector{width:auto!important;flex:0 0 auto!important}'`. Elementor container default cresce/full.
- **Grid num container BOXED: aplicar SÓ no `>.e-con-inner`, NUNCA no `selector` junto.** Boxed = `<div.e-con><div.e-con-inner>filhos</div></div>`; os filhos vivem no `.e-con-inner`. Se o custom_css faz `selector>.e-con-inner,selector{display:grid...}` os DOIS viram grid (aninhado duplo) e a coluna comprime (~438px em vez de ~620px → H1 quebra em 7 linhas). Fix: `selector>.e-con-inner{display:grid;...}` só. Medir com `getBoundingClientRect().width` da coluna do lead pra confirmar (~622px = certo, 4 linhas na H1 como o oficial).

## custom_css vs classes

- `custom_css` por elemento = feature do **Elementor Pro / PRO Elements** (server-side). Sem Pro ativo, é IGNORADO (glass/backdrop-blur/círculo do ícone somem). Ativar **PRO Elements** (Pro 3.7.7 velho quebra com `softDeprecated`).
- `custom_css` VIAJA no JSON e SOBREVIVE à importação (é setting, não classe global). Serve pra glass (`backdrop-filter`), círculo do ícone do botão, badge pill.
- Fonte Geist (Next) precisa `@font-face` na página nativa — injetar via 1 widget HTML com `<style>@font-face{font-family:'Geist';src:url('<vercel>/_next/static/media/Geist_Variable-s...woff2')...}`.

## Workflow correto (pedido do dono)

- **NÃO editar dentro do editor Elementor.** Gerar o JSON **externamente em código** (`ferramentas/elementor-motor/build-xpice-nativo.mjs` → `sites/xpice/xpice-nativo.json`), DEPOIS importar (Modelos > Importar) pra teste de fidelidade. Iterar numa URL separada, nunca na home.
- Regra da casa: produz 1 seção, dono valida, aí escala.

## Aplicar/testar por AJAX (bypassa editor)

- Salvar sem o editor: `POST admin-ajax.php action=elementor_ajax`, `_nonce=elementorCommon.config.ajax.nonce`, `editor_post_id=<id>`, `actions={save_builder:{action:'save_builder',data:{status:'publish',elements:[...],settings:{template:'elementor_canvas'}}}}`.
- Kit global (post 6): mesmo save com `data.settings.custom_css` (sem `elements`) — não apaga cores globais (defaults regeneram iguais). Elementor DELETA o `post-6.css` no save e regenera no próximo page-view (fetch imediato dá 404 — é normal).
- CSS custom_css/global cai em `post-<id>.css` gerado; carrega DEPOIS do tema Hello.

## Pink hover global (#c36) — não era o navegador

- Tema **Hello Elementor `reset.css`**: `button:hover{background-color:#c36}` + `button{border:1px solid #c36;color:#c36}`. Todo `<button>` sem hover próprio fica magenta no hover.
- Passei batido: `#c36` é hex 3-díg (grep de 6-díg não pega) e evento sintético NÃO dispara `:hover` CSS. **Lição: quando "está no navegador" mas o dono insiste, pedir o Inspect do DevTools.**
- Fix: override no custom_css do Kit → `[type=button],button{border-color:transparent}` + `...:hover,...:focus{background-color:transparent;color:inherit}`.

## Mobile do import estático

- H1 gigante: `.hero-title-line{white-space:nowrap}` (só vira `normal` em ≤640) estoura horizontal → viewport alarga → H1 usa regra tablet (~60px). Fix: forçar `white-space:normal` no override do Kit.
- Borda branca: `.hero{padding:8px}` + `border-radius` do hero-card no mobile (inset intencional). Full-bleed = forçar `padding:0`.

## Fidelidade 100% = portar TODO o CSS, não só valores estáticos

Auditar o `globals.css` do site oficial linha a linha e mapear CADA regra pro JSON. O que se perde se não olhar:
- **hovers** → Elementor button tem `hover_color` + `button_background_hover_color` (nativos); resto via `custom_css` `selector:hover`/`selector .elementor-button:hover`.
- **transições** → `transition` no `custom_css` (Elementor não gera sozinho). Copiar o `cubic-bezier` exato (`--ease: cubic-bezier(.22,1,.36,1)`).
- **animação de entrada** (bg zoom `heroMediaIn` scale 1.045→1.015) → bg vai num `selector::after` com `animation` + `@keyframes` no custom_css (Elementor bg-image não anima). Shade fica no `::before`, conteúdo `>.e-con-inner{z-index:2}`.
- **quebras de linha exatas do H1** → o oficial usa `<span class="hero-title-line">` por linha com `white-space:nowrap`. Replicar com heading widget cujo `title` contém os `<span>` (Elementor heading aceita HTML no title) + custom_css `display:block;white-space:nowrap` e `+.htl{margin-top:.06em}`. NÃO confiar na quebra natural do grid.
- **clamp** (font, padding, gap) → Elementor field só aceita fixo; pôr `clamp(...)` no custom_css. `min-height:100dvh` idem (unidade dvh não existe no field).
- **max-width em `ch`** (`48ch`) → custom_css.
- Ícone do botão: default vs hover rotate. `hero-cta` seta reta 16px, hover `rotate(45deg)`. `nav-cta` seta ↗ (`rotate(-45)`), hover `rotate(0)`.
- Valores exatos SEMPRE do DOM computado OU do `globals.css` (fonte da verdade em `/Volumes/PortableSSD/XPICE/xpice-site/`), nunca chutado.

## Transporte do JSON pro live (save_builder) — frágil, ter plano B

O relay do base64 grande via `javascript_tool` (paste acumulando em `window.__xb`) sofre com: (1) classificador do browser fica **temporariamente indisponível** e bloqueia CADA call de escrita (read-only passa); (2) a aba do editor Elementor **reseta `window`** enquanto ainda carrega (perde a var). Mitigações: chunks de 4600 (não corromper), guard por `window.__xb.length` antes de cada `+=` (idempotente em retry), marcador `window.__mark` pra detectar reset. **Plano B confiável = entregar o `.json` e importar pela biblioteca LOCAL** (Modelos > Importar) — não depende do classificador. Usar o save_builder AJAX só quando o classificador estiver estável.

## Ferramentas do harness

- Extensão Chrome cai/reconecta muito; `resize_window` NÃO muda o innerWidth (não emula mobile de verdade). Classificador do `javascript_tool` fica intermitente — reV.
- Editor Elementor "abre infinito" = era o widget HTML de **850KB** da home pesando o preview; em página nativa leve abre normal.
