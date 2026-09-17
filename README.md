# web.ai — Elementor Motor

> **EN:** Converts a static design/site into a **native, editable Elementor page** — deterministic DOM → Elementor JSON compilation (no AI in the layout path), 4 transport routes into WordPress, and fidelity verified by computed-style diff against the original. Two production sites, 90–94 % native widgets, ~US$0.01 per page. Docs are in Portuguese; `docs/03-ARMADILHAS.md` lists 19 Elementor pitfalls worth reading in any language. MIT.


Converte design/site estático em **página Elementor nativa e editável** — e mantém essa página por código.

O diferencial não é gerar bonito: é gerar **editável**. Quem paga é a agência, e ela precisa entregar um site que o cliente mexa sozinho.

---

## Estado

Dois sites reais em produção:

| Site | Seções | Nós | Widgets nativos |
|---|---|---|---|
| Xpice Connections | 15 | 412 | 90% |
| Ronaldo Barcelos | 9 | 240 | **94%** |

Fidelidade medida por diff de estilo computado contra o original publicado: **20 de 21** elementos idênticos.

👉 **Leia [`AUDITORIA.md`](AUDITORIA.md) primeiro** — diz honestamente o que funciona, o que está frágil e o que falta.

---

## Mapa

```
CLAUDE.md                 ⭐ estado, regras invioláveis, continuidade entre sessões
AUDITORIA.md              estado real, riscos, próximo passo
docs/
├── 01-PIPELINE.md        extração → compilação → transporte → verificação
├── 02-SCHEMA-ELEMENTOR.md vocabulário exato (extraído de exports reais)
├── 03-ARMADILHAS.md      ⭐ 19 comportamentos que quebram site portado
├── 04-TRANSPORTE.md      4 rotas para escrever na página + cache
├── 05-FIDELIDADE.md      como provar que ficou igual
├── 06-UI-UX.md           decisões de interface que mudaram entrega
├── 07-CHECKLIST.md       régua antes de entregar
├── 08-PESQUISA-MERCADO.md concorrentes, preços, onde todos falham
├── 09-DECISOES.md        ⭐ decisões de arquitetura com justificativa
└── historico/            registro cronológico das entregas
src/                      núcleo do compilador
skills/elementor-motor/   skill operacional
exemplos/                 2 geradores de sites reais (referência, não produto)
```

**Se você só vai ler um arquivo:** `docs/03-ARMADILHAS.md`. Metade dos bugs "misteriosos" do Elementor está lá.

---

## Como funciona

```
[1] EXTRAÇÃO          [2] COMPILAÇÃO         [3] TRANSPORTE        [4] VERIFICAÇÃO
navegador headless →  model → JSON      →   save_builder      →  diff de estilo
DOM + computed         Elementor nativo      ou REST               computado
```

**Nenhum estágio usa IA.** É tradução determinística: `rgb(10,62,168)` → `#0A3EA8`. Mesma URL = mesmo JSON, sempre.

IA entra só para *rotular* (nomes de classe, alt-text), nunca para decidir estrutura. Consequência: **~R$0,05 por página** e zero alucinação de layout.

---

## O fosso

Não é o código — é o conhecimento acumulado:

- `docs/02-SCHEMA-ELEMENTOR.md` — vocabulário real, extraído de exports, não de documentação
- `docs/03-ARMADILHAS.md` — cada item custou de 20 minutos a uma tarde para descobrir
- `docs/05-FIDELIDADE.md` — o método que pega o que ler CSS não pega

Copiar o compilador é fácil. Redescobrir que o lazy-load do Elementor mata `background-image` com `!important` em descendentes, dependendo da altura da janela, não é.

---

## Próximo passo

**Fase 0 — harness de fidelidade.** Antes do extrator.

Sem ele, o extrator é construído às cegas e não se sabe se melhorou. Com ele, cada commit tem nota objetiva — e é a única peça que não desperdiça em nenhum cenário comercial.

Teste de aceite: *o harness reproduz sozinho o resultado 20/21 do Xpice.*

Depois vem a Fase 1 (extrator genérico + loop de convergência + plugin ponte), com aceite de **0 divergências em 3 breakpoints**.

Nada mais (UI, billing) deve começar antes disso. Ver [`CLAUDE.md`](CLAUDE.md) para o estado completo e [`docs/09-DECISOES.md`](docs/09-DECISOES.md) para o porquê de cada escolha.

---

## Licença

[MIT](LICENSE)
