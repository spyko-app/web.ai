# Fidelidade — como provar que ficou igual

## A lição central

> **Reproduzir a partir do arquivo CSS não basta.** O navegador resolve a cascata de um jeito que o arquivo não revela.

Caso real (Ronaldo Barcelos, `styles.css`):

```css
.hero__name span   {font-weight:600; font-size:15px;   color:var(--paper)}    /* linha 121 */
.hero__ribbon span {font-size:10.5px; letter-spacing:.08em;
                    text-transform:uppercase; color:var(--muted)}              /* linha 126 */
```

As duas têm especificidade **(0,2,0)** e o nome está **dentro** do ribbon → a segunda vence.
No site publicado o nome renderiza **10,5px, caixa alta, apagado** — não 15px escuro como o arquivo faz parecer.

Eu tinha portado o que o CSS *dizia*, não o que ele *fazia*.

---

## O teste que pega isso: diff de estilo computado

1. Abra o **original publicado** (não o arquivo local — podem divergir)
2. Capture `getComputedStyle` de ~20 elementos-chave
3. Rode o mesmo script na versão Elementor
4. Compare

```js
(function(){
  const T=(sel,label)=>{const e=document.querySelector(sel);if(!e)return label+':AUSENTE';
    const c=getComputedStyle(e);
    return label+'|'+Math.round(parseFloat(c.fontSize))+'px w'+c.fontWeight+' '+
           c.textTransform+' '+c.color+' ls'+c.letterSpacing;};
  return JSON.stringify([
    T('.hero__h','H1'), T('.hero__p','HERO-P'), T('.who__name','WHO-NOME'),
    T('.plan__name','PLAN-NOME'), T('.cta__h','CTA-H'), /* … */
  ],null,1);
})()
```

**Resultado no RB:** 1 divergência em 21. Invisível a olho nu e impossível de achar lendo o fonte.

O valor não é só achar o erro — é **confirmar que os outros 20 estão idênticos** e poder parar de procurar.

---

## Verificar sem screenshot

Screenshot mente: painel oculto devolve imagem em branco, lazy-load ainda não trocou a foto, animação de reveal a meio caminho. **Meça.**

```js
// a imagem preenche o container?
const c=document.querySelector('.foto'), i=c.querySelector('img');
Math.abs(c.getBoundingClientRect().height - i.getBoundingClientRect().height) < 3

// o que está de fato nesta posição da tela?
document.elementFromPoint(700, 300)

// contagem estrutural
document.querySelectorAll('.card').length      // esperado: 6
[...document.images].filter(i=>i.complete && i.naturalWidth===0).length   // esperado: 0

// scroll horizontal
document.documentElement.scrollWidth > document.documentElement.clientWidth  // esperado: false
```

**Antes de medir scroll:** `document.documentElement.style.scrollBehavior='auto'` (senão a leitura vem do valor antigo) e destrua o Lenis se houver (`window.lenis?.destroy()`).

---

## Alinhamento óptico

Pedido típico: *"esse bloco precisa estar alinhado com a foto, folga igual em cima e embaixo."*

Não centralize no container — **replique o inset da referência**:

```css
/* foto: position:absolute; top:96px; bottom:104px */
.bloco-texto{ flex:1 1 auto; min-height:0; padding-block:96px 104px; align-items:center }
```

Prova:
```js
const p=document.querySelector('.foto').getBoundingClientRect();
const t=document.querySelector('.texto').getBoundingClientRect();
({folgaTopo:Math.round(t.top-p.top), folgaBase:Math.round(p.bottom-t.bottom),
  desvioCentro:Math.abs((p.top+p.bottom)/2-(t.top+t.bottom)/2)})
// alvo: folgas iguais, desvio 0
```

Se sobrar 10–20px inexplicáveis: é o `gap` do container (armadilha 7).

---

## Fonte da verdade: o publicado, não a pasta

No RB a pasta local e o deploy eram byte-idênticos — mas **isso precisou ser verificado**, não presumido.

```bash
diff <(curl -s $URL/styles.css) local/styles.css
```

Quando divergirem, **o publicado vence** — é o que o cliente vê e aprova.
