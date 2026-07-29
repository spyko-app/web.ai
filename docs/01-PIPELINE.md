# Pipeline — do design ao Elementor editável

## Visão em uma tela

```
[1] EXTRAÇÃO          [2] COMPILAÇÃO         [3] TRANSPORTE        [4] VERIFICAÇÃO
navegador headless →  model → JSON      →   save_builder      →  diff de estilo
DOM + estilos          Elementor nativo      ou REST               computado
computados                                   + purge de cache
```

**Nenhum estágio usa IA.** É tradução determinística: `rgb(10,62,168)` → `#0A3EA8`. Não há o que alucinar.

---

## Estágio 1 — Extração

Chrome headless abre a URL e lê o DOM com os **estilos computados** (não o CSS bruto — ver `docs/05-FIDELIDADE.md` para entender por que isso importa).

Saída: árvore de nós classificados por `kind`.

```js
{ kind:'container', st:{...}, children:[
  { kind:'heading', level:1, text:'...', st:{...} },
  { kind:'text',    html:'...',          st:{...} },
  { kind:'button',  text:'...', href:'', st:{...} },
  { kind:'image',   src:'...', alt:'',   st:{...} }
]}
```

> ⚠️ **Este estágio ainda não é genérico** — hoje é feito sob medida por site. É a Fase 0. Ver `AUDITORIA.md §3`.

---

## Estágio 2 — Compilação

`src/import_faithful.js` traduz cada nó para widget nativo:

| Nó | Widget | Função |
|---|---|---|
| `h1`–`h6` | `heading` | `widgetSettings()` |
| `p`, texto | `text-editor` | idem |
| `a`, `button` | `button` | idem |
| `img` | `image` | idem |
| `div` flex | `container` | `containerStyle()` |

E converte estilo para o vocabulário exato (ver `docs/02-SCHEMA-ELEMENTOR.md`):

- `rgba()` → hex8 (`#RRGGBBAA`)
- `24px` → `{unit:'px', size:24, sizes:[]}`
- flexbox → `flex_direction` / `justify_content` / `align_items`
- tipografia → bloco `typography_*` com sufixo `_mobile`

### Regra de ouro: nativo vs HTML

| Vai como | Quando |
|---|---|
| **widget nativo** | todo texto, título, botão, imagem, layout — **o cliente precisa editar** |
| **widget HTML** | animação (marquee, badge girando), SVG interativo (mapa), scripts |

Meta prática: **≥90% nativo**. Abaixo disso o cliente não consegue mexer e o produto perde o diferencial.

### Scripts precisam de guarda de editor

Sem isto, o script roda dentro do editor e o texto não fica editável:

```js
if(document.body.classList.contains('elementor-editor-active')) return;
```

---

## Estágio 3 — Transporte

Ver `docs/04-TRANSPORTE.md`. Resumo das 4 rotas, em ordem de preferência.

---

## Estágio 4 — Verificação

Ver `docs/05-FIDELIDADE.md` e `docs/07-CHECKLIST.md`.

**Nunca confie em screenshot** para auditar: com o painel oculto ele retorna imagem em branco ou desatualizada, e lazy-load engana. Audite por **medição** (`getBoundingClientRect`, `getComputedStyle`, `elementFromPoint`, contagem de nós).

---

## Onde a IA entra — e onde NÃO deve

| Camada | IA? | Por quê |
|---|---|---|
| Extração DOM | ❌ | leitura de navegador |
| Mapa nó→widget | ❌ | `h1` é heading. Regra determinística ganha sempre |
| Conversão de estilo | ❌ | matemática. IA aqui só introduz erro |
| Agrupar seções | ⚠️ opcional | heurística resolve ~90%; IA ajuda no resto |
| Nomear classes / alt-text | ✅ | semântica |
| Gerar copy/layout do zero | ✅ | só no modo "criar do prompt" |

> **IA nunca decide estrutura. IA só rotula o que o compilador já resolveu.**

Isso dá três coisas que quem joga a página inteira num LLM não tem: **reprodutibilidade** (mesma URL = mesmo JSON), **fidelidade** (não inventa espaçamento) e **custo ~zero**.

### Custo por página

| Item | Custo |
|---|---|
| Chrome headless (~10s CPU) | R$ 0,01–0,05 |
| Compilação (JS puro) | ~0 |
| **Total determinístico** | **≈ R$ 0,05** |
| Camada de IA opcional (árvore resumida: 5–15k tokens in) | centavos |

Manda-se a **árvore**, não o HTML. Um HTML de landing tem 200–500k tokens; a árvore resumida tem ~10k. É 30× mais barato — e essa compressão só é possível *porque* o compilador é determinístico.
