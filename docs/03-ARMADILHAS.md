# Armadilhas do Elementor — o fosso do motor

> Cada item aqui custou de 20 minutos a uma tarde para descobrir, e **nenhum está na documentação oficial**.
> Todos foram encontrados em produção, em dois sites reais. Cada um é candidato a teste de regressão.

Ordem = frequência com que quebram um site portado de CSS estático.

---

## 1. `css_classes` ≠ `_css_classes`

| Tipo de nó | Chave |
|---|---|
| container | `css_classes` |
| widget | `_css_classes` |

Errar isso faz a classe **sumir silenciosamente** — sem erro, sem aviso. O CSS simplesmente não pega.

---

## 2. Ícone sai BRANCO/invisível (`e_font_icon_svg`)

O Elementor 4.x não usa fonte de ícone: injeta **SVG inline** e pinta por `fill`. CSS que define `color` no botão não pinta nada — o SVG fica com o `fill` padrão (branco). Sobre fundo claro: círculo vazio.

```css
.meu-escopo .elementor-button-icon svg{fill:currentColor!important;width:1em;height:1em}
```

**Diagnóstico em 1 linha:**
```js
[...document.querySelectorAll('.elementor-button-icon svg')].map(s=>getComputedStyle(s).fill)
// veio rgb(255,255,255)? é isto.
```

Confirme antes pelo `<meta name="generator">`: `features: e_font_icon_svg`.

---

## 3. Lazy-load de background zera TODO `background-image`

O Elementor emite:

```css
...:nth-of-type(n+4):not(.e-lazyloaded):not(.e-no-lazyload) *{background-image:none!important}
/* variantes: @media(max-height:1024px) → n+3 · (max-height:640px) → n+2 */
```

**Nem `!important` na sua regra vence.** Some o gradiente do hero (`radial-gradient`) e de cards (`linear-gradient`).

Traiçoeiro porque:
- só afeta `background-image` — `background-color` passa ileso
- não afeta pseudo-elementos (`::before`) — o bug parece aleatório
- depende da **altura da janela** (media queries) — reproduz numa tela e não noutra

**Correção:** classe `e-no-lazyload` na seção de topo. Se o site entrega imagem em widget `<img>` (nunca background CSS), desligar é grátis — aplique em todas as seções por padrão.

---

## 4. Container é `column` — `align-items:center` centraliza no eixo errado

CSS de site estático assume `display:flex` **row** (padrão do HTML). O container do Elementor já vem `flex-direction:column`.

Copiar `align-items:center` centraliza na **horizontal** e o conteúdo cola no topo da seção. No hero isso joga a H1 por baixo da nav fixa.

**Regra:** ao portar `display:flex;align-items:center`, escreva `flex-direction:row!important` junto — ou troque para `justify-content:center`.

---

## 5. Texto do botão estica e a letra cola no topo

`.elementor-button-content-wrapper` é flex com `align-items:normal` (=stretch). Com um ícone de 34px ao lado, a caixa do texto vira 34px de altura enquanto o `line-height` é 15px → a letra renderiza no topo.

O padding do botão é simétrico, mas **parece** ter mais espaço embaixo — e o cliente enxerga na hora.

```css
.meu-escopo .elementor-button-content-wrapper{align-items:center}
```

**Diagnóstico:** compare `textRect.top - btnRect.top` com `btnRect.bottom - textRect.bottom`.

---

## 6. `height:100%` não desce pela cadeia de wrappers

`.rbfill > .elementor-widget-image > .elementor-widget-container > img`

O `height:100%` no `<img>` não resolve: os wrappers têm altura `auto`. Container de 1429px exibindo imagem de 781px → 648px do fundo aparecendo.

```css
.fill > .elementor-widget-image,
.fill .elementor-widget-container,
.fill .elementor-widget-image a{height:100%!important;width:100%;line-height:0}
.fill img{width:100%!important;height:100%!important}
```

⚠️ **Nunca inclua o `.fill` na lista** — é ele que ancora a altura (via `top/bottom` absolutos). Incluí-lo faz a imagem virar 100% da seção e transbordar.

---

## 7. `gap` do container rouba altura

O container vem com `gap:20px`. Widgets "invisíveis" (script, badge absoluto) **contam como filhos flex** e consomem o gap — desalinhando blocos que deveriam bater com uma imagem.

Sintoma: 10–20px de desalinho que não se explica pelo CSS. `gap:0` na seção resolve.

---

## 8. Modelo velho do editor sobrescreve o save externo

Se o editor estiver aberto com o modelo antigo e você salvar por fora (REST/ajax), o próximo save do editor **desfaz tudo**.

**Regra:** `location.reload()` no editor depois de todo save externo, antes do próximo.

---

## 9. Cache do Elementor esconde alteração via REST

Mudança pelo **editor** aparece na hora. Mudança via **REST em `_elementor_data`** não aparece — o Elementor mantém cache de elemento.

```bash
curl -u user:app_pass -X DELETE https://SITE/wp-json/elementor/v1/cache
# e o cache de página, se houver:
curl -u user:app_pass -X POST https://SITE/wp-json/wp-super-cache/v1/cache -d '{}'
```

**Sintoma que confunde:** o banco tem o dado novo (confirmado por REST), o frontend serve o antigo. Não é bug do seu patch.

---

## 10. Posicionamento em media query precisa repetir `position`

Sobrescrever só `flex-direction` numa media query faz o elemento perder o `position:absolute` que vinha do escopo da seção — e ele transborda para a seção seguinte.

**Regra:** ao redefinir layout de um absoluto no mobile, repita `position`.

---

## 11. `overflow-x:clip` no `body` mata `position:sticky`

Sticky dos descendentes para de funcionar. Use `html{overflow-x:clip}` + `body{overflow-x:visible}`.

**Bônus:** `scroll-behavior:smooth` faz `scrollTop` retornar o valor **antigo** na leitura imediata — parece que a página não rola. Antes de investigar scroll travado: `document.documentElement.style.scrollBehavior='auto'`.

---

## 12. Especificidade da seção vence override global

`selector .card{position:relative}` (0,4,0) vence `.card{position:sticky}` (0,1,0). Overrides mobile de layout precisam de `!important`.

---

## 13. Mime bloqueado no upload

WP REST rejeita **SVG** e **woff2** (`rest_upload_sideload_error`), mas aceita `.txt`. A política varia por instalação — **cheque a Media antes de assumir**.

- SVG → rasterize com `sharp` (`density:300`), nunca `qlmanage` (fundo branco opaco)
- woff2 → data-URI no `@font-face`
- payload grande → `.txt` na Media, o navegador busca da mesma origem

---

## 14. KSES remove span vazio

`<span class="icone"></span>` sem conteúdo é removido pelo sanitizador do WP. Use pseudo-elemento (`::before`) para ícones decorativos.

---

## 15. `wp_slash` ausente corrompe todo acento

⭐ **Quebra 100% do conteúdo em português.** O Elementor salva com `wp_slash( wp_json_encode( $data ) )`. Sem o `wp_slash`, o `wp_unslash` interno do WP come uma camada de backslash e `ç` vira `u00e7`.

```php
// ERRADO — corrompe todo caractere não-ASCII
update_post_meta( $id, '_elementor_data', wp_json_encode( $data ) );

// CERTO
update_post_meta( $id, '_elementor_data', wp_slash( wp_json_encode( $data ) ) );
```

Casos documentados: [respira-press#18](https://github.com/respira-press/Respira.press-Documentation-and-Community/issues/18), [elementor#12507](https://github.com/elementor/elementor/issues/12507).

---

## 16. `_elementor_data` não é campo REST público

A REST API padrão só grava meta registrada via `register_post_meta` com `show_in_rest`. O Elementor **não registra**. Resultado: você recebe `200 OK` e nada muda.

Consequência de arquitetura: **não existe caminho self-service sem plugin próprio.** Application Password + REST padrão não resolve. Ver `docs/09-DECISOES.md` §3.

---

## 17. Três combinações que quebram o layout — nunca gerar

| Nunca gerar | Sintoma | Issue |
|---|---|---|
| grid dentro de nested element (accordion/tabs) | **trava o editor** ao reabrir | [#33376](https://github.com/elementor/elementor/issues/33376) · [#25040](https://github.com/elementor/elementor/issues/25040) |
| shape divider em grid container | vira grid item e destrói o layout | [#36241](https://github.com/elementor/elementor/issues/36241) |
| link dentro de container clicável | `<a>` aninhado, HTML inválido | [#35968](https://github.com/elementor/elementor/issues/35968) |

---

## 18. Purge global de cache é caro — use o cirúrgico

`Plugin::instance()->files_manager->clear_cache()` roda glob em todo o diretório de uploads. Num site com 500 páginas, chamar a cada geração é hostil.

```php
delete_post_meta( $id, '_elementor_css' );
delete_post_meta( $id, '_elementor_element_cache' );
wp_cache_delete( $id, 'post_meta' );            // essencial com Redis/object cache
\Elementor\Core\Files\CSS\Post::create( $id )->update();
// clear_cache() global SÓ ao mexer no kit / global settings
```

Sem o `wp_cache_delete`, com object cache persistente o Elementor lê a meta antiga e regenera CSS do conteúdo velho.

E purgue a camada de page cache, defensivamente — é onde mora a maioria dos "mudei e não aparece":

```php
if ( function_exists('rocket_clean_post') ) rocket_clean_post( $id );
if ( class_exists('LiteSpeed_Cache_API') ) LiteSpeed_Cache_API::purge_post( $id );
if ( function_exists('w3tc_flush_post') ) w3tc_flush_post( $id );
```

---

## 19. Mídia primeiro, IDs depois

O Elementor guarda imagem como `{url, id}` e **ambos precisam estar corretos e consistentes**:

- `id` apontando para attachment inexistente → imagem quebrada no editor
- `url` de outro domínio → hotlink, perde srcset e lazy

Ordem obrigatória: sobe todas as mídias → coleta os IDs → **só então** monta o `_elementor_data`.

Dentro do plugin use `media_sideload_image()` com a URL do CDN: POST leve com lista de URLs, o WP baixa sozinho. Evita multipart grande atravessando WAF e permite dedupe por hash.

**Nunca habilite upload de SVG** — vetor de XSS com [CVE registrado](https://advisories.gitlab.com/pkg/composer/mwdelaney/wp-enable-svg/). Rasterize para PNG/WebP, ou inline num widget HTML.

---

## Checagem rápida (cole no console do site pronto)

```js
(function(){
  const r=[];
  const svg=[...document.querySelectorAll('.elementor-button-icon svg')].map(s=>getComputedStyle(s).fill);
  r.push('icones brancos: '+svg.filter(f=>f==='rgb(255, 255, 255)').length+'/'+svg.length);
  r.push('imgs quebradas: '+[...document.images].filter(i=>i.complete&&i.naturalWidth===0).length);
  r.push('scroll-x: '+(document.documentElement.scrollWidth>document.documentElement.clientWidth));
  const bad=[...document.querySelectorAll('.elementor-button')].filter(b=>{
    const t=b.querySelector('.elementor-button-text'); if(!t)return false;
    const br=b.getBoundingClientRect(),tr=t.getBoundingClientRect();
    return Math.abs((tr.top-br.top)-(br.bottom-tr.bottom))>2;});
  r.push('botoes desalinhados: '+bad.length);
  return r.join('\n');
})()
```
