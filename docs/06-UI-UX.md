# UI/UX aplicado ao motor

> Regras que **mudaram decisões reais** nos dois sites. Não é teoria de design system — é o que quebrou ou salvou entrega.

---

## 1. Editabilidade é requisito de UX, não de engenharia

O comprador é a **agência**. Ela precisa entregar um site que o cliente mexa sozinho, senão vira suporte eterno.

Por isso a meta de **≥90% widgets nativos** não é vaidade técnica: é o diferencial do produto. Um site "bonito porém HTML" já perdeu.

**Consequência prática:** quando um número precisa animar (contador), não injete `data-count`. Faça o script **ler o próprio texto**:

```js
const raw = el.textContent.trim();
const m = raw.match(/^([^0-9]*)([0-9.,]+)(.*)$/);
const to = parseFloat(m[2].replace(/\./g,'').replace(',','.'));  // pt-BR
// … anima … e no fim restaura `raw`
```

Ganho duplo: zero drift no valor final **e** o número continua editável como texto normal no Elementor.

---

## 2. Animação de entrada precisa de varredura inicial

`IntersectionObserver` com `rootMargin:'0px 0px -10% 0px'` **não dispara** para o que já está na tela no load. Resultado: o bloco do hero nasce com `opacity:0`.

```js
document.querySelectorAll('.reveal').forEach(el=>{
  const r = el.getBoundingClientRect();
  if (r.top < innerHeight*0.95) el.classList.add('in');   // já visível: mostra
  else io.observe(el);                                     // resto: observa
});
```

Sempre respeite `prefers-reduced-motion`.

---

## 3. Sticky stack: 2 pré-condições

Para cards empilharem ao rolar:

1. `position:sticky` precisa de `!important` — a regra da seção (`selector .card{position:relative}`, especificidade 0,4,0) vence o override
2. `overflow-x:clip` no **body** mata sticky → use `html{overflow-x:clip}` + `body{overflow-x:visible}`

**Onde aplicar:** grupos homogêneos (cards de produto, pilares, parceiros). **Onde não:** carrossel e mapa interativo — o sticky briga com o gesto.

---

## 4. Mobile: hover não existe

Conteúdo que só aparece no hover **some** no celular. No card de produto:

- desktop: overlay no hover
- mobile: painel fixo no rodapé do card, com título + badges **sempre visíveis**

```css
@media(max-width:640px){
  .card-hover{position:absolute!important;inset:auto 0 0 0!important;opacity:1!important;
    background:linear-gradient(180deg,transparent,rgba(4,7,18,.93));justify-content:flex-end}
  .card-hover-only{display:none!important}   /* seta, título duplicado */
}
```

---

## 5. Elemento flutuante não pode cobrir o alvo

Card de informação fixo num canto **cobre** o país que o usuário acabou de clicar.

Solução: o card foge para o lado oposto do alvo.

```js
const cx = (alvo.left + alvo.width/2 - painel.left) / painel.width;
card.classList.toggle('is-left', cx > 0.55);
```
```css
.card{transition:left .45s cubic-bezier(.22,1,.36,1), right .45s cubic-bezier(.22,1,.36,1)}
.card.is-left{right:auto; left:clamp(16px,2vw,30px)}
```

---

## 6. Excesso de informação: mostre alguns + rota para o resto

Pedido do cliente: *"queria que aparecessem todos os nomes, mas não dá — impossível."*

Padrão: **alguns itens em chips + um link "Veja mais itens no sistema"** apontando para a plataforma. Resolve densidade sem esconder que existe mais.

---

## 7. Dado tabular quer tabela, não lista

Timeline com contratos/toneladas/valor por ano vira **grid com cabeçalho**, não texto corrido:

```css
.linha{display:grid;grid-template-columns:11px 44px minmax(0,1fr) 62px 66px 84px;align-items:center;gap:10px}
.num{font-variant-numeric:tabular-nums;text-align:right;font-family:monospace}
```

`tabular-nums` alinha os dígitos entre linhas — sem isso a coluna "dança".

Linhas de marco (sem números) usam `grid-column:3/6` para o texto ocupar as colunas de dado.

---

## 8. Nav fixa × barra do admin

```css
body.admin-bar .nav-fixa{top:32px}
@media(max-width:782px){ body.admin-bar .nav-fixa{top:46px} }
```

Só quebra para quem está logado — por isso passa despercebido até o cliente reclamar.

---

## 9. Acessibilidade que não pode faltar

- contraste ≥ 4.5:1 (texto normal), ≥ 3:1 (texto grande)
- alvo de toque ≥ 44×44px
- `aria-label` em botão só-ícone
- `prefers-reduced-motion` desliga reveal, marquee e badge girando
- não comunicar por cor sozinha

---

## 10. Fidelidade de marca

Use o **arquivo oficial**, não uma aproximação. Desenhar "um B parecido" no lugar do monograma real é erro visível na hora.

Se o original usa o SVG como **máscara CSS** (`-webkit-mask`), a cor vem do `background` — replique inline convertendo todos os `fill` para `currentColor`, e a silhueta fica idêntica com hover funcionando.
