---
name: elementor-motor
description: Use ao portar um design/site para o Elementor como JSON nativo e editável, ao editar uma página Elementor existente por código, ou ao auditar fidelidade de uma página Elementor. Triggers - "recria esse site no Elementor", "converte pra Elementor", "edita a página X do WP", "por que o ícone sumiu", "o gradiente não aparece", "o botão está torto", "salvei mas não mudou nada".
---

# Motor Elementor

Portar design → Elementor **nativo e editável** (≥90% widgets nativos), e manter páginas por código.

## Antes de agir

1. Leia `docs/03-ARMADILHAS.md` — 14 comportamentos do Elementor que quebram site portado de CSS estático. **Metade dos bugs "misteriosos" está lá.**
2. Confirme a versão: `<meta name="generator">` → o schema e as features (`e_font_icon_svg`) mudam.
3. **A fonte da verdade é o site publicado**, não a pasta local. Verifique antes de presumir.

## Fluxo

| Etapa | Onde |
|---|---|
| Entender o pipeline | `docs/01-PIPELINE.md` |
| Vocabulário exato do Elementor | `docs/02-SCHEMA-ELEMENTOR.md` |
| Escrever na página | `docs/04-TRANSPORTE.md` |
| Provar que ficou igual | `docs/05-FIDELIDADE.md` |
| Decisões de interface | `docs/06-UI-UX.md` |
| Antes de entregar | `docs/07-CHECKLIST.md` |

## Regras que não se negocia

- **Nativo por padrão.** HTML só para animação, SVG interativo e script. Abaixo de 90% nativo o cliente não edita e o produto perde sentido.
- **Classe certa:** `css_classes` em container, `_css_classes` em widget.
- **Guarda de editor** em todo script: `if(document.body.classList.contains('elementor-editor-active'))return;`
- **Recarregue o editor** depois de todo save externo.
- **Limpe o cache** depois de todo save via REST — senão o frontend serve o antigo e você caça um bug que não existe.
- **Não invente dado.** Número, país, produto: vem do cliente. O que for inferido, sinalize no relatório.
- **Audite por medição**, não por screenshot.

## Diagnóstico rápido

| Sintoma | Causa provável |
|---|---|
| Ícone invisível / círculo vazio | SVG com `fill` branco → armadilha 2 |
| Gradiente sumiu | lazy-load de background → armadilha 3 |
| Conteúdo colado no topo da seção | container é `column` → armadilha 4 |
| Texto do botão "descentralizado" | wrapper esticando → armadilha 5 |
| Imagem não preenche o container | cadeia de wrappers sem altura → armadilha 6 |
| Desalinho de 10–20px inexplicável | `gap` do container → armadilha 7 |
| "Salvei e não mudou" | cache do Elementor → armadilha 9 |
| Sticky não gruda | `overflow-x:clip` no body / falta `!important` → armadilhas 11 e 12 |
| Classe não aplica | `css_classes` × `_css_classes` → armadilha 1 |

## Comandos úteis

```bash
# proporção nativo vs html
node -e "const j=require('./saida.json');let n=0,h=0;(function w(a){a.forEach(e=>{if(e.elType==='widget')e.widgetType==='html'?h++:n++;w(e.elements||[])})})(j.content);console.log(Math.round(n/(n+h)*100)+'% nativo')"

# limpar cache depois de REST
curl -u user:app_pass -X DELETE https://SITE/wp-json/elementor/v1/cache
```
