# Pesquisa de mercado — 29/jul/2026

Consolidado de 10 relatórios de pesquisa. Serve para não refazer trabalho e para não repetir conclusões erradas.

## ⚠️ Confiabilidade desta pesquisa — leia primeiro

**Reddit ficou bloqueado (403) em todas as rodadas.** Trustpilot idem. G2/Capterra sem volume. **Nenhuma citação direta de r/Wordpress, r/elementor ou r/webdev.**

Pior: uma parte grande do que o Google devolve neste nicho é **conteúdo SEO publicado pelos próprios concorrentes**. O caso mais grave é o Figmentor, que produz dezenas de posts atacando concorrentes — e é justamente o produto com as piores reclamações verificadas. Um agente encontrou até post no fórum oficial do Figma "recomendando" o Figmentor com link, padrão de astroturfing.

**Hierarquia de confiança do que está aqui:**

| Nível | Fonte |
|---|---|
| 🟢 Sólido | Docs oficiais de preço · **issues do GitHub do Elementor** · WordPress.org · verificação de DNS/redirect feita na hora |
| 🟢 Sólido | **Limitações que os próprios concorrentes admitem nos próprios sites** — é confissão, não opinião |
| 🟡 Indício | Product Hunt, Chrome Web Store, fórum do Figma |
| 🔴 Descartar | Blog comparativo de concorrente |

**Não use reclamação de concorrente em pitch sem verificar direto.**

---

## O achado central

> **A categoria existe, tem 6+ produtos com tração, e nenhum verifica o próprio resultado.**

Nenhum concorrente renderiza a página gerada e compara com o original. Todos entregam e passam a validação para o usuário.

E a categoria admite o fracasso em público. Citação de um **site concorrente**:

> *"não existe conversor HTML-para-Elementor totalmente automático que produza resultado de qualidade de produção"* — [aitoelementor.com](https://aitoelementor.com/best-html-to-elementor-tools/)

---

## Concorrentes diretos (URL/HTML → Elementor)

| Produto | O que faz | Preço |
|---|---|---|
| [Web2Elementor](https://web2elementor.com/) | URL, imagem, HTML, extensão Chrome → JSON Elementor. **Escopo idêntico ao nosso** | $19,90–49,90/mês · avulso ~$1–2/página |
| [ClonewebX](https://softlite.io/clonewebx/) | clona site ao vivo → Elementor, Bricks, Divi, Gutenberg, Webflow | $10/mês · $120/ano · **LTD $300** · 50k usuários declarados |
| [AI to Elementor](https://wordpress.org/plugins/aitoel-html-importer/) | HTML → widgets nativos. Exige HTML, **não faz scraping de URL** | $47–247/ano · 400 instalações, 2 reviews |
| Novamira | Elementor via Claude Code + MCP | €49/ano |
| [aitoelementor.com](https://aitoelementor.com/) | mesmo produto acima, site próprio | — |

### Onde eles falham (confissão própria)

**AI to Elementor**, no próprio site:
- **conversão desktop-only — responsivo exige ajuste manual** ← maior diferencial disponível
- "95,5% de pixel match" (≈5% de CSS manual)
- "elimina ~90% do trabalho manual" (10% sobra)
- divs aninhadas em 5+ níveis derrubam a acurácia

**ClonewebX**, Product Hunt (3,3★ em 4 reviews):
> a saída no Elementor vira *"mostly HTML elements rather than properly formatted builder components"*

Mais: cobrança recorrente sem aviso, dificuldade de cancelar, PayPal/cartão com erro.

---

## Elementor AI oficial — é concorrente, não complementar

**Recria página a partir de URL:** [doc oficial](https://elementor.com/help/use-ai-to-create-containers-based-on-an-existing-page/). Converte a URL em HTML e depois em elementos Elementor.

**Não recria** (admitido): elementos aninhados, carrosséis/sliders, elementos repetidores (icon list, share buttons), animações complexas, vídeo.

**Não gera JSON exportável** — opera dentro do editor. Esse gap continua nosso.

**Preço:** Elementor One $19/mês ($228/ano, 1 site) · Agency $45/mês. **Pro puro ($59–399/ano) não inclui IA.**

**Modelo de crédito é frágil e é argumento de venda contra:** 10–400 créditos por ação sem tabela pública, expiram todo mês sem rollover, **não dá para comprar avulso** — só upgrade.

---

## 🚨 Risco de plataforma — maior que o risco de concorrência

**A Elementor demitiu ~100 pessoas, 30% do quadro, em junho/2026**, citando explicitamente a mudança na forma como sites são construídos por causa de IA. ([Calcalist](https://www.calcalistech.com/ctechnews/article/sycgn6yxze) · [Globes](https://en.globes.co.il/en/article-ai-pushes-elementor-to-lay-off-100-1001547303) · [The Repository](https://www.therepository.email/elementor-cuts-30-of-its-workforce-frames-layoffs-as-ai-driven-reset))

E o **V4/Atomic** está gerando revolta pública. Reviews 1 estrela recentes no [repositório oficial](https://wordpress.org/support/plugin/elementor/reviews/?filter=1):

> "Elementor v4 is a DISASTER" · "V4 feels like an alpha build, not a production-ready editor" · "The most horrible update in Elementor's history" · "Constantly Breaking Customer Websites"

Base instalada ainda é ~25M de sites / ~13% da web — enorme, mas não crescente.

**Leitura:** o motor constrói sobre chão que se move, mantido por empresa em contração, na transição mais mal recebida da história do produto.

---

## Figma → Elementor: o nicho é um cemitério

| Produto | Estado verificado |
|---|---|
| **Fignel** | 💀 domínio morto — `dig fignel.com` retorna vazio |
| **Yotako** | ⚠️ pivotou para "WPMaven, Coming Soon", sem preço público |
| **Figmentor** | 🚩 plugin parado há 1 ano (300 instalações) enquanto o site anuncia v7 |
| **UiChemy** | ✅ vivo, mantido, 9k instalações |
| **FigWP** (Essential Addons) | ✅ vivo, respaldo da WPDeveloper |

**Figmentor** — WordPress.org 3,8/5, padrão escancarado (bloco de 5★ em "9-10 meses atrás", depois 1★ recentes): *"Scam. This plugin should not be allowed to wordpress"* · *"Scamming their paid users"* · *"Can't cancel account"*. Trustpilot relata cobrança após confirmação de cancelamento.

**UiChemy**, o melhor da categoria, exige **tagging manual de camadas no Figma** para virar widget de verdade. Sem tagging, sai container + heading + imagem genéricos. Não converte máscaras, blur, gradiente em texto, blend modes. **SVG vira PNG.**

> **A Elementor nunca fez importador Figma nativo.** [Pedido no GitHub oficial em junho/2024](https://github.com/orgs/elementor/discussions/27659) — nunca respondido.

Dois anos de demanda sem resposta, nicho cheio de produtos mortos, e um golpista liderando o Google.

---

## Design-to-code genérico — não são concorrentes

**Anima, Locofy e Builder.io Visual Copilot não exportam para WordPress/Elementor.** Todos param em React/HTML/Vue.

Vale a crítica técnica da Anima, aplicável ao nosso domínio: **cada elemento recebe `position: absolute` ou semi-absoluto**, HTML plano, sem hierarquia. Um teste de agência em 2026 concluiu que **refatorar a saída leva mais tempo que construir do zero**.

O resumo mais honesto do gênero, do HN sobre o Builder.io:
> *"you still have to know front end dev to do anything useful with it, but it can be a decent accelerator"*

---

## Open source

**[dudaster/html2elementor](https://github.com/dudaster/html2elementor)** — MIT, Python, HTML+CSS → `_elementor_data`. Resolve cascata incluindo `var()`, extrai kit global, tem verificação. Declara "95% visual match". 12 stars, 90 commits.

**Limitações declaradas:** não processa JS, **não extrai `@media` queries**, não lida com animação/transform/pseudo-elemento, grid só `repeat(N, 1fr)`.

Ou seja: faz a parte fácil e para exatamente onde nosso diferencial começa. **Vale ler antes de escrever o nosso.**

Nenhuma biblioteca madura existe para o formato Elementor — todo mundo construiu o parser do zero. É fosso e custo ao mesmo tempo.

---

## 💰 Preço — a tesoura

| Piso (software) | Teto (humano) |
|---|---|
| ClonewebX $10/mês por 30 sites | Freelancer.com: **$120 por 7 páginas = ~$17/página** — com **176 propostas** |
| AI to Elementor $47/ano | Fiverr: $80–220/landing |
| UiChemy $9/mês · Figmentor $9/mês | Agência ocidental: $229–499/página |

⚠️ **A âncora de "$450/página" que circula é marketing de concorrente** (veio de blog do Figmentor). Não use.

**176 propostas por um job de $120** é o sinal mais forte do levantamento, em duas direções: a dor é real e recorrente, e a oferta de mão de obra é infinita.

**Leitura:** competir na faixa de $10–50/mês é briga de margem baixa contra quem tem 50k usuários. O produto sozinho não sustenta preço premium.

Modelo de crédito é dor explorável: **preço fixo por página é mais fácil de vender para agência do que crédito.**

---

## Caminhos comerciais (decisão pendente)

1. **Ferramenta na faixa de mercado ($20–50/mês)** — compete de frente ganhando por qualidade. Realista, margem baixa.
2. **Ferramenta interna, vendendo serviço** — o motor vira vantagem de custo, não SKU. Não precisa de plugin, UI, auth nem billing: metade do escopo.
3. **Vertical estreito e caro** — migração de portfólio de agência, white-label para host, ou volume com SLA de 0 divergências.

---

## Jogada de entrada barata

**A prova social do segmento é rasa:** AI to Elementor tem 400 instalações e 2 avaliações. ClonewebX tem 4 reviews. Web2Elementor não tem **nenhuma** review independente.

**Ninguém consolidou. Quem publicar benchmark reprodutível ganha credibilidade instantânea** — JSON de saída, contagem de widgets nativos vs. HTML fallback, diff responsivo em 3 breakpoints. Para o nosso produto **e para os concorrentes**, com método aberto.

Temos o instrumento de medição. Eles não têm nem como responder.

---

## O que a pesquisa sustenta como único ângulo defensável

> **Fidelidade verificada com prova pública reproduzível.**

Todos falham nos mesmos quatro pontos, por confissão própria:

| Falha | Quem admite |
|---|---|
| **Responsivo** | AI to Elementor: "desktop-only" |
| **JS e animação** | ClonewebX · html2elementor |
| **Cai para bloco HTML** | ClonewebX no Product Hunt |
| **Ninguém verifica** | nenhum dos 6+ produtos tem oráculo |

---

## Lacunas não fechadas

- Threads reais de Reddit (bloqueio em todas as rodadas)
- Preços oficiais de Anima e Locofy (páginas JS não renderizaram)
- Tempo atual de fila de revisão do WordPress.org
- Nomes exatos dos elTypes atômicos do Editor V4 (não documentados publicamente — só lendo o módulo `atomic-widgets`)
- Definição de "unidade" da Browserless · tarifa/hora da Steel.dev
- Fidelidade real dos concorrentes: **ninguém mediu. Vale medir nós mesmos** antes de fechar posicionamento.
