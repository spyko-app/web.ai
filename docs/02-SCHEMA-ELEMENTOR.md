# ELEMENTOR-SCHEMA-REAL — vocabulário EXATO extraído dos exports reais

> Destilado de **25 JSONs reais** de páginas Elementor Pro (Nexyo) em `/tmp/xpice_elementor_ref/Json | Nexyo/`.
> Corpus: **1219 containers · 2647 widgets** (heading 1154, image 462, icon-list 252, text-editor 176,
> divider 146, button 139, image-box 112, icon-box 89, html 12, spacer 2).
> Objetivo: um importador DOM→Elementor emitir JSON **fiel**. Todas as chaves/valores abaixo são REAIS (não inventados).
> `version: "0.4"`, `type: "page"`. Todo valor com unidade é objeto `{unit,size,sizes:[]}`.

## Shape do arquivo e do nó

```json
{ "content": [ <container> ], "page_settings": {"background_color":"#...","custom_css":"..."},
  "version": "0.4", "title": "...", "type": "page" }
```

Nó **container**: `{ "id":"1a2b3c4d", "settings":{...}, "elements":[...], "isInner":false, "elType":"container" }`
Nó **widget**: `{ "id":"182fb554", "settings":{...}, "elements":[], "widgetType":"heading", "elType":"widget" }`

- **`id`** = hex de 8 dígitos, único por nó (gerar novo em cada importação; NUNCA reusar do ref).
- **`isInner`** é chave **de topo do nó**, NÃO fica em `settings` (`settings._isInner` não existe no corpus).
  `false` = seção (filho direto de `content`); `true` = container aninhado (coluna/card).
- `elements` sempre presente (vazio `[]` em widgets).

---

## A) CONTAINER — chaves reais

### Container SEÇÃO (`isInner:false`) — o "topo"
Chaves por frequência (outer): `flex_direction(258)` `padding(226)` `background_background(191)`
`flex_align_items(160)` `flex_justify_content(160)` `background_color(122)` `background_image(112)`
`boxed_width(109)` `background_position(103)` `flex_gap(101)` `min_height(97)` `background_size(92)`
`background_repeat(89)` `margin(39)` `flex_wrap(38)` `content_width(36)`.

```json
{ "content_width":"full",
  "flex_direction":"row", "flex_justify_content":"space-between",
  "flex_align_items":"center", "flex_wrap":"wrap",
  "flex_gap":{"column":"80","row":"020","isLinked":false,"unit":"px","size":80},
  "min_height":{"unit":"px","size":788,"sizes":[]},
  "boxed_width":{"unit":"px","size":1160,"sizes":[]},
  "padding":{"unit":"px","top":"0","right":"100","bottom":"100","left":"100","isLinked":false},
  "margin":{"unit":"px","top":"-130","right":"-0","bottom":"0","left":"0","isLinked":false},
  "background_background":"classic", "background_color":"#FF61C1" }
```

### Container INTERNO (`isInner:true`) — coluna / card
Difere do outer: usa `content_width(909)` `width(545)` e o pacote **borda+radius+shadow** (cards).
Chaves por freq (inner): `content_width(909)` `padding(787)` `width(545)` `flex_direction(523)`
`flex_align_items(397)` `flex_justify_content(388)` `flex_gap(334)` `background_background(289)`
`width_tablet(272)` `background_color(251)` `border_border(225)` `border_color(217)`
`border_width(214)` `border_radius(208)` `flex_wrap(197)`. Só em inner: `box_shadow_box_shadow(_type)`,
`_flex_align_self_*`, `_flex_order(_mobile)`, `width_laptop/widescreen`, `sticky`.

```json
{ "content_width":"full",
  "width":{"unit":"%","size":58},
  "flex_direction":"column", "flex_align_items":"center", "flex_gap":{"column":"33","row":"33","isLinked":true,"unit":"px","size":33},
  "padding":{"unit":"px","top":"0","right":"0","bottom":"0","left":"0","isLinked":false},
  "background_background":"classic", "background_color":"#F5F5F5",
  "border_border":"solid", "border_color":"#303030",
  "border_width":{"unit":"px","top":"02","right":"02","bottom":"02","left":"02","isLinked":true},
  "border_radius":{"unit":"px","top":"30","right":"30","bottom":"30","left":"30","isLinked":true},
  "box_shadow_box_shadow_type":"yes",
  "box_shadow_box_shadow":{"horizontal":18,"vertical":18,"blur":0,"spread":0,"color":"#424242"},
  "_flex_align_self":"center" }
```

### Layout (valores reais observados)
- `content_width`: `"full"` (estica) | `"boxed"` (usa `boxed_width`).
- `flex_direction`: `"row"` | `"column"`.
- `flex_justify_content`: `flex-start` | `center` | `flex-end` | `space-between`.
- `flex_align_items`: `flex-start` | `center` | `flex-end`.
- `flex_align_content`: `center` (raro).
- `flex_wrap`: `"wrap"` | `"nowrap"`.
- `flex_gap`: objeto híbrido `{"column":"80","row":"020","isLinked":false,"unit":"px","size":80}` — traz `column`+`row` E `size` legado. Emitir os dois.
- `boxed_width` / `width` / `min_height` / `height`: `{unit,size,sizes:[]}` (`px` ou `%`).

### Espaçamento
`padding`/`margin` (e advanced `_padding`/`_margin`): `{"unit":"px","top","right","bottom","left","isLinked":false}`.
Valores são **strings** ("100", "-130", "0"; aceita negativo e "02").

### Fundo
- Cor sólida: `"background_background":"classic"`, `"background_color":"#FF61C1"`.
- Imagem: `"background_background":"classic"`, `"background_image":{"url":"...","id":9595,"size":"","alt":"","source":"library"}`,
  `"background_size":"cover"`, `"background_position":"top center"`, `"background_repeat":"no-repeat"`.
- Gradiente: `"background_background":"gradient"`, `"background_color":"#5C0188"`, `"background_color_b":"#F1FCFF"`,
  `"background_gradient_angle":{"unit":"deg","size":90,"sizes":[]}`, `background_color_stop`/`background_color_b_stop` = `{unit:"%",size,...}`.
- **Overlay** (separado do fundo): `background_overlay_background:"classic"|"gradient"`, `background_overlay_color:"#081628"`,
  `background_overlay_opacity:{"unit":"px","size":1,"sizes":[]}`, `background_overlay_image`, `background_overlay_color_b`, `overlay_blend_mode`.

### Borda / sombra
- `border_border`: `"solid"` | `"none"`. `border_color:"#000000"`. `border_width:{unit,top,right,bottom,left,isLinked}`.
- `border_radius:{unit,top,right,bottom,left,isLinked}`.
- `box_shadow_box_shadow_type:"yes"` + `box_shadow_box_shadow:{"horizontal":18,"vertical":18,"blur":0,"spread":0,"color":"#424242"}`.

### Prefixo `_` (advanced, comum em WIDGETS dentro do flex)
`_element_width:"initial"|"inherit"`, `_element_custom_width:{unit,size,sizes}`, `_flex_align_self:"center"`,
`_flex_size:"none"|"grow"|"shrink"`, `_flex_order(_mobile):"start"|"end"`, `_padding`/`_margin`, `_z_index`,
`_animation:"fadeInUp"` (+`_animation_delay`), `_background_background`/`_background_color`, `_border_*`, `_element_id`, `_css_classes`.

---

## B) WIDGETS — chaves reais (1 exemplo cada)

### heading (título E parágrafo — a Nexyo usa `header_size:"p"` p/ parágrafo)
```json
{ "title":"Domine a ferramenta que ...",   // aceita HTML inline (<span>, <img>, <br>)
  "header_size":"p",                        // omitido = h2; "p" p/ parágrafo
  "align":"left",                            // + align_mobile:"center", align_tablet
  "title_color":"#303030",
  "typography_typography":"custom",
  "typography_font_family":"Anton", "typography_font_weight":"400",
  "typography_font_size":{"unit":"px","size":64,"sizes":[]},
  "typography_line_height":{"unit":"custom","size":"110%","sizes":[]},
  "typography_letter_spacing":{"unit":"px","size":2.3,"sizes":[]},
  "typography_text_transform":"uppercase", "typography_font_style":"italic",
  "typography_font_size_mobile":{"unit":"px","size":14,"sizes":[]},
  "typography_font_size_tablet":{"unit":"px","size":43,"sizes":[]} }
```

### text-editor
```json
{ "editor":"<p>texto com <strong>HTML</strong></p>",
  "text_color":"#FFEEEF", "align":"left",
  "typography_typography":"custom", "typography_font_family":"Helvetica",
  "typography_font_weight":"400", "typography_font_size":{"unit":"px","size":20,"sizes":[]},
  "typography_line_height":{"unit":"em","size":1.6,"sizes":[]} }
```
> Nota: **cor no text-editor é `text_color`** (não `title_color`).

### button
```json
{ "text":"QUERO APRENDER",
  "link":{"url":"#price","is_external":"","nofollow":"","custom_attributes":""},
  "button_text_color":"#FFFFFF", "hover_color":"#FFFFFF", "button_background_hover_color":"#A2E000",
  "background_background":"gradient", "background_color":"#FF470A", "background_color_b":"#EF6EB3",
  "background_gradient_angle":{"unit":"deg","size":120,"sizes":[]},
  "typography_typography":"custom","typography_font_family":"Helvetica","typography_font_weight":"700",
  "typography_font_size":{"unit":"px","size":20,"sizes":[]}, "typography_text_transform":"uppercase",
  "text_padding":{"unit":"px","top":"24","right":"24","bottom":"24","left":"24","isLinked":false},
  "border_border":"none","border_color":"#FF8500","border_width":{"unit":"px","top":"7","right":"7","bottom":"7","left":"7","isLinked":true},
  "border_radius":{"unit":"px","top":"10","right":"10","bottom":"10","left":"10","isLinked":true},
  "hover_animation":"pulse-grow", "align":"justify", "size":"xl",
  "selected_icon":{"value":{"url":"https://.../svg","id":9561},"library":"svg"},
  "icon_align":"row-reverse","icon_indent":{"unit":"px","size":10,"sizes":[]},
  "button_box_shadow_box_shadow_type":"yes",
  "button_box_shadow_box_shadow":{"horizontal":6,"vertical":6,"blur":0,"spread":0,"color":"#FFFFFF"} }
```
> Cor de fundo do botão = `background_color`/`background_background` (não `button_background_color`).
> Cor do texto = **`button_text_color`**. Padding = **`text_padding`**. Fonte-icon = `selected_icon` (mesmo formato do icon-list).

### image
```json
{ "image":{"id":9555,"url":"https://.../ruama.png","alt":"","source":"library","size":""},
  "image_size":"full",                       // string ("full"), NÃO objeto
  "width":{"unit":"%","size":100,"sizes":[]}, // largura via width; + width_tablet/width_mobile
  "align":"left",                             // + align_mobile:"center"
  "image_border_radius":{"unit":"px","top":"20","right":"0","bottom":"0","left":"20","isLinked":false},
  "image_border_border":"solid","image_border_color":"#36281F","image_border_width":{...},
  "image_box_shadow_box_shadow_type":"yes",
  "image_box_shadow_box_shadow":{"horizontal":14,"vertical":14,"blur":0,"spread":0,"color":"#AD46FF"},
  "link_to":"custom","link":{"url":"https://...","is_external":"","nofollow":"","custom_attributes":""} }
```
> A imagem NÃO tem `object-fit` no corpus; usa `width`/`_element_custom_width` + `align`. Borda/shadow prefixadas com **`image_`**.

### icon-list (repeater `icon_list`)
```json
{ "icon_list":[ {"text":"Acesso de 1 ano;",
       "selected_icon":{"value":{"url":"https://.../ICO_Xispoint.svg","id":5323},"library":"svg"},
       "_id":"6dd9f9e"} ],
  "view":"inline", "divider":"yes", "divider_color":"#36281F55",
  "space_between":{"unit":"px","size":32,"sizes":[]}, "text_indent":{"unit":"px","size":10,"sizes":[]},
  "icon_color":"#461D9000", "icon_size":{"unit":"px","size":19,"sizes":[]}, "text_color":"#424242",
  "icon_typography_typography":"custom","icon_typography_font_family":"Helvetica",
  "icon_typography_font_weight":"400","icon_typography_font_size":{"unit":"px","size":18,"sizes":[]} }
```
> Tipografia prefixada **`icon_typography_*`**. Cada item tem `_id` próprio (hex 7 dígitos).

### icon-box
```json
{ "selected_icon":{"value":{"url":"https://.../icon-1.svg","id":85},"library":"svg"},
  "title_text":"Guia especializado", "description_text":"Guias experientes ...",
  "title_color":"#081628","description_color":"#081628CC","hover_title_color":"#081628","primary_color":"#A4D9D500",
  "position":"inline-start","text_align":"start","content_vertical_alignment":"middle",
  "icon_size":{"unit":"px","size":50,"sizes":[]}, "icon_space":{"unit":"px","size":20,"sizes":[]},
  "title_bottom_space":{"unit":"px","size":5,"sizes":[]},
  "title_typography_typography":"custom","title_typography_font_family":"Recoleta Alt","title_typography_font_weight":"400",
  "title_typography_font_size":{"unit":"px","size":25,"sizes":[]},
  "description_typography_typography":"custom","description_typography_font_family":"Visby CF",
  "description_typography_font_weight":"500","description_typography_font_size":{"unit":"px","size":16,"sizes":[]} }
```
> Dois blocos de tipografia: **`title_typography_*`** e **`description_typography_*`**.

### image-box
```json
{ "image":{"id":9550,"url":"https://.../bf25-1.svg","alt":"","source":"library","size":""},
  "title_text":"<span style=\"text-transform: uppercase\">...</span>", "description_text":"O método exato ...",
  "title_color":"#FFFFFF","description_color":"#FFFFFF","hover_title_color":"#FFFFFF66",
  "text_align":"left","position":"left","content_vertical_alignment":"middle","title_size":"h1",
  "image_size":{"unit":"%","size":41,"sizes":[]},  // aqui image_size É objeto (%), diferente do widget image!
  "image_space":{"unit":"px","size":0,"sizes":[]}, "title_bottom_space":{"unit":"px","size":20,"sizes":[]},
  "title_typography_*":"...(Anton/38px/600)", "description_typography_*":"...(Helvetica/18px/300)" }
```

### html
```json
{ "html":"<div class=\"glowbox\">...</div>", "custom_css":".glowbox{...}", "_element_width":"inherit" }
```

### divider
```json
{ "text":"Divisor", "color":"#FFFFFF", "style":"dashed", "align":"center", "weight":{"unit":"px","size":2,"sizes":[]},
  "gap":{"unit":"px","size":2,"sizes":[]}, "width":{"unit":"px","size":419,"sizes":[]},
  "width_tablet":{...}, "width_mobile":{...} }
```

### spacer
```json
{ "space":{"unit":"px","size":0,"sizes":[]} }
```

---

## C) TIPOGRAFIA — bloco `typography_*` completo

Ativa SEMPRE com `"<prefixo>typography_typography":"custom"`. Sem isso, os outros campos são ignorados.

| Chave | Tipo/valor real |
|---|---|
| `typography_typography` | `"custom"` (gatilho obrigatório) |
| `typography_font_family` | `"Anton"` \| `"Inter"` \| `"Helvetica"` \| `"Visby CF"` \| `"Recoleta Alt"` (nome puro) |
| `typography_font_size` | `{"unit":"px","size":64,"sizes":[]}` (px \| rem \| em) |
| `typography_font_weight` | `"400"` \| `"500"` \| `"700"` (string) |
| `typography_line_height` | `{"unit":"custom","size":"110%","sizes":[]}` **ou** `{"unit":"em","size":1.6,"sizes":[]}` |
| `typography_letter_spacing` | `{"unit":"px","size":2.3,"sizes":[]}` |
| `typography_word_spacing` | `{"unit":"em","size":11,"sizes":[]}` |
| `typography_text_transform` | `"uppercase"` \| `"none"` \| `"capitalize"` |
| `typography_font_style` | `"italic"` \| `"normal"` |
| `typography_text_decoration` | `"line-through"` |

**Prefixos alternativos** (o prefixo do widget substitui `typography_`):
- heading/text-editor/button → `typography_*`
- icon-list → `icon_typography_*`
- icon-box/image-box → `title_typography_*` **e** `description_typography_*`

`line_height` com `unit:"custom"` guarda a % como **string** em `size` (`"110%"`). Emitir `sizes:[]` sempre.

---

## D) RESPONSIVO — sufixos e cobertura

Ordem (mesma chave + sufixo): `_widescreen` › **desktop (sem sufixo)** › `_laptop` › `_tablet_extra` › `_tablet` › `_mobile_extra` › `_mobile`.

Contagem real no corpus: `_mobile(5321)` · `_tablet(3234)` · `_laptop(517)` · `_widescreen(451)` · `_mobile_extra(165)`.
`_tablet_extra` existe no schema mas é raríssimo no corpus. **`_mobile` e `_tablet` são os que mais importam.**

Chaves que costumam ter versão responsiva (exemplos reais):
- `typography_font_size_mobile` `{"unit":"px","size":14}`, `typography_font_size_tablet` `{"unit":"px","size":43}`, `typography_line_height_mobile`.
- `padding_mobile` / `padding_tablet`, `margin_mobile`, `_padding_mobile`, `_margin_tablet`.
- `flex_direction_mobile:"column"`, `flex_justify_content_mobile`, `flex_gap_mobile`, `flex_wrap_tablet`, `flex_align_items_tablet`.
- `width_mobile` `{"unit":"%","size":100}`, `width_tablet` `{"unit":"%","size":54}`, `boxed_width_mobile/tablet`, `min_height_mobile/tablet/laptop`.
- `align_mobile:"center"`, `align_tablet`, `_element_custom_width_mobile/tablet/laptop`, `_flex_align_self_mobile`, `_flex_order_mobile`.
- `background_image_mobile`, `background_position_mobile`, `background_size_tablet`, `icon_size_mobile`, `title_typography_font_size_mobile`.

Regra do importador: **para todo campo que muda entre breakpoints, emitir a chave-base + as variantes `_tablet`/`_mobile`** (mínimo). Deixar responsivo vazio = herda desktop.

---

## E) CORES / TOKENS

- Hex de **6 dígitos** `#FF61C1` (opaco) — 3025 ocorrências.
- Hex de **8 dígitos** com alpha `#461D9000` (`00`=transparente), `#08162833`, `#FFBEC6A3`, `#36281F55` — 1418 ocorrências (~32%).
  O alpha vem nos 2 últimos dígitos hex; Elementor usa esse formato, **não** `rgba()` (exceto raras sombras `"rgba(0,0,0,0.5)"`).
- **Importador PRECISA emitir alpha como `#RRGGBBAA`** quando a cor tem opacidade — converter `rgba()` do DOM para hex8.

---

## F) CHECKLIST — o que QUEBRA fidelidade (importador ingênuo esquece)

- [ ] **`isInner` no topo do nó**, não em settings. Seção=false, coluna/card=true.
- [ ] **`min_height`** nas seções de topo (97 usos) — sem isso a hero colapsa.
- [ ] **`content_width:"full"` vs `boxed_width`** — inner quase sempre `full`+`width%`; seção com `boxed_width`.
- [ ] **`width` em %** nos containers internos (`{"unit":"%","size":58}`) — colunas flex.
- [ ] **`flex_gap` objeto híbrido** com `column`+`row`+`size`+`isLinked` (não só `size`).
- [ ] **`_flex_align_self` / `_flex_size` / `_flex_order`** nos widgets dentro do flex — controlam alinhamento individual.
- [ ] **`background_overlay_*`** — camada separada do fundo (cor+opacity+gradient+blend_mode).
- [ ] **`box_shadow_box_shadow` + `_type:"yes"`** em cards; no image/button/icon usa prefixo (`image_box_shadow_*`, `button_box_shadow_*`).
- [ ] **`border_radius` em cards** (inner: 208 usos) — objeto por-canto `{top,right,bottom,left,isLinked}`.
- [ ] **`border_border:"solid"` + `border_color` + `border_width`** juntos (os 3, senão a borda não aparece).
- [ ] **Tipografia COMPLETA**: `typography_typography:"custom"` (gatilho) + `font_family` + `font_weight`(string) + `font_size`(obj) + `line_height` + `letter_spacing`. Omitir o gatilho = tipografia ignorada.
- [ ] **Prefixo de tipografia certo por widget**: `typography_`(heading/text/button), `icon_typography_`(icon-list), `title_typography_`+`description_typography_`(icon-box/image-box).
- [ ] **Cor por widget certa**: heading=`title_color`, text-editor=`text_color`, button=`button_text_color`+`background_color`.
- [ ] **`image_size` polimórfico**: no widget **image** é string `"full"`; no **image-box** é objeto `{unit:"%",size}`.
- [ ] **Objetos de mídia**: `image`/`background_image` = `{"url","id","alt":"","source":"library","size":""}`; ícone = `selected_icon:{"value":{"url","id"},"library":"svg"}`.
- [ ] **`link` objeto** (não string): `{"url","is_external":"","nofollow":"","custom_attributes":""}`; image usa `link_to:"custom"`+`link`.
- [ ] **Alpha em hex8** (`#RRGGBBAA`), ~32% das cores têm alpha — converter `rgba()`→hex8.
- [ ] **Responsivo `_tablet`/`_mobile`** em font_size, padding, width, flex_direction, align — mínimo obrigatório.
- [ ] **`id` hex-8 único** por nó + **`_id` hex-7** em itens de repeater (icon_list).
- [ ] **`sizes:[]`** presente em todo objeto de unidade, mesmo vazio.
- [ ] **valores de padding/margin/border como STRING** ("100","-130","02"), não número.
