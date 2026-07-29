# web.ai — Motor Elementor

> **Leia este arquivo inteiro antes de qualquer ação.** Ele é o mecanismo de continuidade entre sessões: todo chat novo começa aqui e sai sabendo o que os anteriores decidiram, descobriram e deixaram pendente.

---

## O que é

Converte design/site estático em **página Elementor nativa e editável**, com **fidelidade visual verificada por medição**.

Duas restrições, nesta ordem de prioridade:

1. **Fidelidade é restrição dura** — o layout precisa ficar idêntico ao original, sempre.
2. **Editabilidade é a segunda** — o cliente da agência precisa conseguir mexer sozinho.

Onde as duas colidem, fidelidade vence e a editabilidade cede **localmente e de forma auditada** (o nó rebaixa para widget HTML e isso vai declarado no relatório).

---

## Estado real (29/jul/2026)

| Peça | Estado |
|---|---|
| Compilador árvore→Elementor (`src/import_faithful.js`) | 🟢 funciona — 2 sites em produção |
| Conhecimento destilado (`docs/`) | 🟢 **o fosso real do projeto** |
| Harness de fidelidade automatizado | 🔴 não existe — hoje é script manual de ~20 elementos |
| Extrator genérico URL→model | 🔴 não existe — feito à mão por site |
| Plugin WordPress | 🔴 não existe |
| UI, auth, billing | 🔴 não existe |

Sites entregues: Xpice Connections (15 seções, 412 nós, 90% nativo) e Ronaldo Barcelos (9 seções, 240 nós, 94% nativo). Melhor fidelidade medida: **20 de 21** elementos idênticos — ou seja, **1 divergência ainda em aberto**.

---

## Regras invioláveis

Estas saíram de erro real ou de pesquisa verificada. Não reabra sem evidência nova.

1. **Nenhum estágio determinístico usa IA.** `h1` é heading, sempre. Conversão de cor e medida é matemática. IA só rotula (nome de classe, alt-text) e agrupa seções quando a heurística falha.
2. **Toda saída de LLM é sugestão descartável.** JSON inválido, loop até `max_tokens`, truncamento → cai no default heurístico e segue. Isso elimina structured output como risco de produto.
3. **Nunca audite por screenshot.** Screenshot mente: painel oculto devolve branco, lazy-load engana, animação fica a meio caminho. **Meça** — `getComputedStyle`, `getBoundingClientRect`, `elementFromPoint`, contagem de nós.
4. **A fonte da verdade é o publicado, não a pasta.** Quando divergirem, o publicado vence — é o que o cliente vê e aprova.
5. **Porte o que o CSS *faz*, não o que ele *diz*.** O navegador resolve a cascata de um jeito que o arquivo não revela. Ver `docs/05-FIDELIDADE.md`.
6. **`wp_slash` sempre** ao gravar `_elementor_data`. Sem ele, todo acento em português corrompe. Ver `docs/03-ARMADILHAS.md` §15.
7. **Meta de ≥90% widgets nativos** — meça, não estime. Abaixo disso o cliente não edita e o produto perde o diferencial.
8. **Alvo de schema: flexbox container.** Feature-detect por request. **Editor V4/Atomic fora enquanto for Alpha.**

---

## Mapa do repositório

```
CLAUDE.md                 ← você está aqui: estado, regras, continuidade
AUDITORIA.md              estado honesto: o que funciona, o que é frágil, o que falta
README.md                 apresentação do projeto

docs/
├── 01-PIPELINE.md        extração → compilação → transporte → verificação
├── 02-SCHEMA-ELEMENTOR.md vocabulário exato, extraído de exports reais
├── 03-ARMADILHAS.md      ⭐ 19 comportamentos que quebram site portado
├── 04-TRANSPORTE.md      4 rotas para escrever na página + cache
├── 05-FIDELIDADE.md      como provar que ficou igual
├── 06-UI-UX.md           decisões de interface que mudaram entrega
├── 07-CHECKLIST.md       régua antes de entregar
├── 08-PESQUISA-MERCADO.md ⭐ concorrentes, preços, onde todos falham
├── 09-DECISOES.md        ⭐ decisões de arquitetura com justificativa
└── historico/            registro cronológico das entregas

src/                      núcleo do compilador (745 linhas)
skills/elementor-motor/   skill operacional
exemplos/                 2 geradores de sites reais (referência, não produto)
```

**Se você só vai ler um arquivo além deste:** `docs/03-ARMADILHAS.md`. Metade dos bugs "misteriosos" do Elementor está lá.

---

## Próximo passo único

**Fase 0 — harness de fidelidade.** Antes do extrator, antes de tudo.

Motivo: sem ele você constrói o extrator às cegas e não sabe se melhorou. Com ele, cada commit tem nota objetiva. E é a única peça que não desperdiça em nenhum cenário comercial.

Escopo:
- captura via CDP `DOMSnapshot.captureSnapshot` (não `getComputedStyle` nó a nó — ver `docs/09-DECISOES.md` §1)
- computed style + bounding box de todos os nós
- 3 breakpoints: 390 (mobile, DSF 3, UA mobile) / 768 / 1440
- matching por **âncora** (texto, `src`, ordem no fluxo), nunca por caminho estrutural
- dupla captura do mesmo viewport para detectar página instável

Aceite: reproduz sozinho o resultado 20/21 do Xpice.

**Nada mais (extrator, plugin, UI, billing) deve começar antes disso.**

---

## Decisões comerciais PENDENTES

Não assuma nenhuma delas. São do dono do projeto e ainda não foram tomadas:

1. **Caminho comercial** — produto de prateleira ($20–50/mês), ferramenta interna vendendo serviço, ou vertical estreito com SLA?
2. **Continuar no Elementor** apesar do V4 instável, ou avaliar Bricks/Gutenberg como alvo alternativo?
3. **Iniciar a Fase 0** independente das duas acima?

O harness (Fase 0) é seguro em qualquer cenário — pode começar sem travar nas outras duas.

---

## Como trabalhar neste repo

- **pt-BR** em toda comunicação e documentação.
- **Investigue antes de afirmar.** Não responda de memória sobre o código — leia o arquivo.
- **Toda armadilha nova descoberta vira item em `docs/03-ARMADILHAS.md`** e candidata a teste de regressão.
- **Toda decisão de arquitetura vira entrada em `docs/09-DECISOES.md`** com a justificativa e a evidência.
- **Toda entrega vira registro em `docs/historico/`.**
- Ao terminar trabalho relevante, **atualize a seção "Estado real" deste arquivo.** É assim que o próximo chat fica atualizado.

### Grafo de conhecimento

O repo usa graphify. Se `graphify-out/graph.json` existir, trate perguntas sobre o código como consulta ao grafo primeiro:

```bash
graphify query "<sua pergunta>"
```

Reconstruir após mudanças grandes:

```bash
graphify . --update
```

`graphify-out/` é ignorado pelo git — cada máquina constrói o seu.
