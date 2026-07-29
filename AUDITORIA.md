# Auditoria do motor Elementor — estado real em 29/jul/2026

> Auditoria honesta do que existe, do que funciona, do que está frágil e do que falta.
> Base: dois sites reais entregues em produção (Xpice Connections e Ronaldo Barcelos).

---

## 1. O que foi provado

| Prova | Evidência |
|---|---|
| Design estático → Elementor **nativo e editável** | 2 sites no ar, 90% e 94% de widgets nativos |
| Fidelidade tipográfica e cromática | diff de estilo computado: **20 de 21** elementos idênticos ao original publicado |
| Escrita direta na página viva | `save_builder` via admin-ajax e `_elementor_data` via REST, ambos validados |
| Reprodutibilidade | mesmo gerador → mesmo JSON (ids determinísticos por FNV) |
| Manutenção incremental | dezenas de patches cirúrgicos aplicados sem reimportar a página |

**Números medidos**

| Site | Seções | Nós | Nativo | HTML |
|---|---|---|---|---|
| Xpice Connections | 15 | 412 | 90% | 10% (mapa, carrossel, animações) |
| Ronaldo Barcelos | 9 | 240 | **94%** | 6% (badge, marquee, scripts) |

O segundo site subiu a taxa de nativo **e** levou uma fração do tempo — o ganho veio do método destilado, não do código reaproveitado.

---

## 2. O que existe hoje (inventário)

```
src/                        núcleo (745 linhas)
├── import_faithful.js      compilador DOM→Elementor (193 l) ← o ativo mais valioso
├── import.js               importador genérico (243 l)
├── builder.js  node.js     construção de nós
├── validate.js             ids únicos, widgetType obrigatório
├── units.js  advanced.js   U(), bx(), rad(), settings avançados
├── id.js                   ids determinísticos (FNV-1a)
├── edit.js  cli.js         edição e linha de comando
└── widgets/                heading, text, image, button, html

exemplos/                   2 geradores completos de sites reais
docs/                       schema real + conhecimento destilado
```

### Veredito por componente

| Componente | Estado | Observação |
|---|---|---|
| `import_faithful.js` | 🟢 **sólido** | determinístico, sem IA, traduz DOM→widget nativo |
| `units/id/validate` | 🟢 sólido | pequenos, corretos, testados na prática |
| `ELEMENTOR-SCHEMA-REAL.md` | 🟢 **o fosso** | vocabulário extraído de exports reais, não de documentação |
| Geradores de site | 🟡 **manuais** | 197KB e 60KB escritos à mão — não são produto, são prova |
| **Extrator DOM→model** | 🔴 **não existe** | feito sob medida por site. É a Fase 0 |
| Testes | 🔴 quase nada | 1 arquivo; sem suíte por versão do Elementor |
| CLI/API | 🟡 embrionário | `cli.js` existe mas não cobre o fluxo real |

---

## 3. A lacuna crítica

O `import_faithful.js` compila uma árvore **já classificada** (`kind: heading|text|button|image|container`).
Quem produz essa árvore hoje? **Eu, à mão, por site.**

```
[ FALTA ]              [ EXISTE ]
URL/HTML  ──???──▶  model  ──▶  importDomFaithful()  ──▶  JSON Elementor
                     ▲
              extrator genérico
```

Sem o extrator, o "motor" é um **método documentado**, não um produto. Essa é a Fase 0 e o teste de aceite é objetivo:

> O compilador reproduz o site Xpice sem uma linha escrita à mão.

---

## 4. Riscos reais

| Risco | Gravidade | Situação |
|---|---|---|
| Elementor muda o schema entre versões | 🔴 alta | sem suíte de regressão por versão — **maior risco não mitigado** |
| Armadilhas do Elementor quebram silenciosamente | 🟡 média | 8 documentadas (docs/03), mas sem teste automático |
| Geradores manuais não escalam | 🔴 alta | resolvido só pela Fase 0 |
| Transporte de payload frágil | 🟢 baixa | 4 rotas mapeadas com fallback (docs/04) |
| Cache mascarando resultado | 🟢 baixa | causa-raiz e purge documentados (docs/04 §5) |

---

## 5. O que este repositório resolve

Ele separa **conhecimento** de **implementação**:

- O conhecimento (schema, armadilhas, pipeline, fidelidade, UI/UX) é o que se repete entre sites
- Os geradores viram **exemplos**, não produto
- Cada armadilha documentada é candidata a **teste de regressão**

---

## 6. Próximo passo único

**Fase 0 — extrair o núcleo genérico.** Escrever o extrator `URL → model` e provar reproduzindo o Xpice sem código à mão.

Tudo mais (UI, billing, plugin WP) depende disso e não deve começar antes.
