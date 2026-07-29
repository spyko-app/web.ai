# Checklist — antes de entregar

Régua checável. Nada de adjetivo: cada item tem um teste.

---

## Build (antes de subir)

- [ ] `ids únicos == total de nós` (o gerador aborta se duplicar)
- [ ] todo widget tem `widgetType`
- [ ] **≥90% widgets nativos** — meça, não estime
- [ ] zero referência externa (Vercel, CDN de terceiro): `grep -c "vercel.app\|cdn\." saida.json` → 0
- [ ] toda imagem aponta para a Media do próprio WP
- [ ] scripts têm guarda `elementor-editor-active`
- [ ] i18n: **todas as listas com o mesmo comprimento** do array base (índice desalinhado quebra silenciosamente)

## Estrutura no ar

- [ ] âncoras existem: `grep -o 'id="secao"'`
- [ ] contagens batem (cards, linhas, logos)
- [ ] `imgs quebradas = 0` → `[...document.images].filter(i=>i.complete&&i.naturalWidth===0).length`
- [ ] nenhum texto placeholder ("a confirmar", "lorem") sobrou

## Armadilhas do Elementor (docs/03)

- [ ] ícones **não** estão brancos → `[...document.querySelectorAll('.elementor-button-icon svg')].map(s=>getComputedStyle(s).fill)`
- [ ] gradientes visíveis (`background-image !== 'none'`) → senão falta `e-no-lazyload`
- [ ] texto dos botões centrado → `folgaTopo == folgaBase` em **todos**
- [ ] imagem preenche container de altura fixa
- [ ] nav fixa livre da barra do admin

## Fidelidade (docs/05)

- [ ] diff de estilo computado contra o original **publicado** — alvo: 0 divergências
- [ ] alinhamento óptico: folga topo == folga base, desvio de centro 0

## Responsivo

- [ ] 390px: `scrollWidth === clientWidth` (sem scroll horizontal)
- [ ] todos os grids em 1 coluna
- [ ] menu mobile abre e fecha
- [ ] nada de "só no hover" — conteúdo essencial visível ao toque
- [ ] nenhum absoluto transbordando para a seção seguinte

## Depois de salvar

- [ ] **cache limpo** (Elementor + página) se salvou via REST
- [ ] editor recarregado, se ficou aberto
- [ ] frontend confere com o banco (senão é cache, não bug)
- [ ] Application Password revogada (`401` ao testar)
- [ ] arquivos temporários da Media apagados

## Conteúdo

- [ ] números conferem com a fonte enviada pelo cliente
- [ ] nenhum dado inventado — o que foi inferido está **sinalizado** no relatório
- [ ] nome da marca correto em todo texto

---

## Script único de verificação

```js
(function(){
  const out=[];
  const svg=[...document.querySelectorAll('.elementor-button-icon svg')].map(s=>getComputedStyle(s).fill);
  out.push('icones brancos: '+svg.filter(f=>f==='rgb(255, 255, 255)').length+'/'+svg.length);
  out.push('imgs quebradas: '+[...document.images].filter(i=>i.complete&&i.naturalWidth===0).length);
  out.push('scroll-x: '+(document.documentElement.scrollWidth>document.documentElement.clientWidth));
  const bad=[...document.querySelectorAll('.elementor-button')].filter(b=>{
    const t=b.querySelector('.elementor-button-text'); if(!t)return false;
    const br=b.getBoundingClientRect(), tr=t.getBoundingClientRect();
    return Math.abs((tr.top-br.top)-(br.bottom-tr.bottom))>2;});
  out.push('botoes desalinhados: '+bad.length);
  out.push('placeholders: '+(document.body.innerText.match(/a confirmar|lorem/gi)||[]).length);
  return out.join('\n');
})()
```

Tudo zero (exceto contagens esperadas) = pode entregar.
