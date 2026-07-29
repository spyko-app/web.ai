# Decisões de arquitetura

Cada decisão com a justificativa e a evidência que a sustenta. Não reabra sem evidência nova.

Data da rodada de pesquisa que embasa este documento: **29/jul/2026**. Ver `docs/08-PESQUISA-MERCADO.md` para o levantamento completo.

---

## 1. Extração via CDP `DOMSnapshot.captureSnapshot`

**Decisão:** Playwright como orquestrador (contexto isolado, lifecycle, viewport), CDP cru por dentro para o snapshot.

**Por quê:**

| Método | Custo numa página grande |
|---|---|
| `getComputedStyle` por elemento | ~1–6ms cada → segundos |
| `CSS.getComputedStyleForNode` via CDP | 500–1500ms (batch de 500: 300–1000ms) |
| **`DOMSnapshot.captureSnapshot`** | **~60ms — árvore inteira, computed + layout, ~300kb** |

Fonte: [issue oficial do Lighthouse](https://github.com/GoogleChrome/lighthouse/issues/6386).

Resolve de graça três problemas: traz o **layout junto** (bounding boxes, que é o que o oráculo precisa), enxerga **shadow DOM achatado** inclusive `closed` (inacessível via JS), e inclui **iframes same-origin**. Aceita whitelist de propriedades — passe só as que o compilador consome.

**Ressalva:** os números do Lighthouse são de 2018. Ordem de grandeza confiável, valor absoluto não. Meça no corpus real antes de fechar.

Codificar contra CDP também torna barata qualquer migração de fornecedor de headless.

---

## 2. Oráculo de fidelidade próprio

**Decisão:** escrever o oráculo. Não existe biblioteca.

O único projeto próximo é o [RegreCSS](https://github.com/blech75/RegreCSS) — antigo e pequeno, serve de referência conceitual.

**O subproblema mais subestimado:** o DOM do Elementor **não é isomórfico** ao original (wrappers `.elementor-widget-container` extras). Correspondência de nós precisa ser por **âncora** — texto, `src` de imagem, ordem no fluxo — **nunca por caminho estrutural**. Planeje isso desde o começo.

**Protocolo obrigatório por breakpoint**, antes de qualquer captura:

1. `await page.evaluate(() => document.fonts.ready)` + validar `document.fonts.check()` por família — métrica de fonte errada gera falso-positivo em massa
2. `img[loading=lazy]` → `.loading = 'eager'`, depois `Promise.all([...imgs].map(i => i.decode()))`
3. **scroll completo até o fim e voltar** — dispara IntersectionObserver, resolve lazy-load e reveal-on-scroll
4. matar animação: `animations:'disabled'` + injetar `*{animation:none!important;transition:none!important}`
5. `waitForLoadState('networkidle')` → `captureSnapshot`

**Teste de determinismo mais barato que existe:** capture duas vezes o mesmo viewport e compare. Divergiu = página instável (carrossel, contador, A/B test) → marque aquelas subárvores como não-verificáveis em vez de falhar o build inteiro.

**Normalizações necessárias:**
- `font-family` é campo **normalizado, não comparado literalmente** — no Elementor a fonte pode vir do Google Fonts e no original do self-host: métrica idêntica, string diferente
- cor: `rgb()` vs `#hex` vs `hex8`
- sub-pixel: tolerância declarada, não zero absoluto

**Armadilha silenciosa:** `@container` muda com a largura do pai, não do viewport. Se o Elementor tiver wrapper de largura diferente, o diff acusa. Detecte e marque a página como alto risco.

---

## 3. Breakpoints: 390 / 768 / 1440

390px exige `devices['iPhone 14']` (`isMobile: true`, DSF 3, UA mobile), **não** só `setViewportSize` — muitos sites servem layout diferente por UA sniffing e por `pointer: coarse`.

Responsivo é o maior diferencial disponível: o concorrente que mais se promove **admite conversão desktop-only**.

---

## 4. Diff de pixel só como rede secundária

`odiff` ([link](https://github.com/dmtrKovalenko/odiff)) — nativo, ~6× mais rápido que pixelmatch, feito para imagens muito parecidas.

Screenshot diffing é o oráculo **errado** como primário: 1px de deslocamento pinta metade da página de vermelho, e diferença de renderização de fonte entre o Chrome capturador e o do WordPress produz ruído permanente.

Serve para pegar o que computed style não vê: imagem errada, `z-index`/empilhamento, `overflow` clipando conteúdo.

**Percy/Chromatic/Argos são ferramentas de review humano em PR, não oráculo.** Pule.

---

## 5. Transporte: plugin ponte próprio, obrigatório

**`_elementor_data` não é campo REST público.** A REST API só grava meta registrada com `show_in_rest`, e o Elementor não registra. Ver `docs/03-ARMADILHAS.md` §16.

Application Passwords + REST padrão **não funciona sozinho** — e ainda quebra por conta própria: exige HTTPS, muitos hosts/Apache removem o header `Authorization`, e Wordfence/iThemes desativam por padrão.

| Rota | Veredito |
|---|---|
| **Plugin próprio + token de pareamento** | ✅ caminho principal |
| Application Password + REST | ❌ não grava a meta; vira plugin de qualquer jeito |
| WP-CLI remoto | ❌ exige SSH ao servidor do cliente |
| Editor headless automatizado | ⚠️ só como suíte interna de teste de schema |

O plugin também resolve de graça: upload de mídia por `media_sideload_image()`, purge cirúrgico de cache no mesmo request, e feature detection da versão do Elementor.

**Distribuição:** ZIP desde o dia 1 (controle de versão e velocidade), WP.org em paralelo como canal de aquisição. Atenção — os dois canais precisam de **código de atualização diferente**: a Guideline 8 do WP.org proíbe código remoto executável, o que inclui o update server próprio (`pre_set_site_transient_update_plugins`) necessário na distribuição por ZIP.

Regras do WP.org que mordem: §6 permite SaaS · §7 exige consentimento explícito (nada de chamada externa na ativação) · §8 permite enviar **dados**, nunca **código** · §5 proíbe trialware (o plugin ponte sempre funciona; o pago é a geração no SaaS).

---

## 6. Alvo de schema: flexbox container

**O schema `_elementor_data` nunca foi declarado API pública.** Sem changelog, sem versionamento semântico, sem garantia de compatibilidade. Isso é risco de negócio, não detalhe técnico.

Agravante de 2026: o **Editor V4 / Atomic** (3.30–3.34) está em Alpha, com a própria Elementor dizendo que não é production-ready — e gerando revolta pública documentada em reviews 1 estrela no WordPress.org. A empresa demitiu 30% do quadro em junho/2026.

**Decisão:** gerar para **flexbox container**. Grid só quando confirmado. **V4 atômico fora enquanto for Alpha.**

O plugin reporta a cada request: `ELEMENTOR_VERSION`, `ELEMENTOR_PRO_VERSION`, status dos experimentos (`container`, `container_grid`, `e_atomic_elements`, `nested-elements`), widgets registrados e tema/kit ativo. O SaaS escolhe o gerador.

Três combinações comprovadamente quebradas estão em `docs/03-ARMADILHAS.md` §17.

---

## 7. IA: modelo pequeno, saída descartável

**Onde a IA entra:** nomear classes CSS, alt-text, e agrupar seções quando a heurística falha (~10% dos casos). Nada mais.

Custo por página (10k in + 1k out), preços de jul/2026:

| Modelo | Custo/página |
|---|---|
| **gpt-5-nano** | **$0,0009** |
| Gemini 2.5 Flash-Lite | $0,0014 |
| DeepSeek V4-Flash | $0,0017 |
| gpt-5-mini | $0,0045 |
| Claude Haiku 4.5 | $0,015 |
| Claude Sonnet 5 | $0,030 |

Haiku custa **~17×** um gpt-5-nano para tarefa cosmética. Não se justifica.

**Escolha:** `gpt-5-nano` para alt-text e nomeação de classe · `gpt-5-mini` para agrupamento de seções (a única com raciocínio real).

**Structured output não deve guiar a escolha de provedor** — os schemas aqui são triviais. A decisão que importa é de arquitetura: **trate toda saída de LLM como sugestão descartável.** Falhou, entrou em loop, truncou → default heurístico e segue.

O modo de falha real não é JSON inválido, é **loop infinito até `max_tokens`** ([vLLM#40080](https://github.com/vllm-project/vllm/issues/40080)): a gramática restringe o espaço de tokens e o modelo não emite EOS. Trate `finish_reason`/`stop_reason` como caminho de erro de primeira classe. E faça warm-up do schema no deploy — a compilação inicial leva de 10s a 1 minuto.

**Validade de schema ≠ correção de valor.** Saída conformante pode estar confiantemente errada.

**Gateway:** ir direto no provedor. Se precisar de abstração, ⚠️ o LiteLLM teve [ataque de supply chain no PyPI](https://news.ycombinator.com/item?id=47501426) (mar/2026) e [RCE + escalação de privilégio](https://www.obsidiansecurity.com/blog/litellm-privilege-escalation-rce) (jun/2026) — pine versões e mantenha mirror interno.

**Custo de LLM não é onde está seu custo.** O browser headless de verificação custa mais que todas as chamadas de modelo somadas. Otimize ali.

⚠️ Preços mudam rápido: Sonnet 5 sai de $2/$10 para $3/$15 em **01/09/2026**. Gemini 3.6 Flash ficou 5× mais caro que o 2.5. O off-peak da DeepSeek não existe mais.

---

## 8. Headless: gerenciado no início, container depois

Para milhares de páginas/mês o custo é ruído (5.000 páginas ≈ 125 browser-horas):

| Opção | Custo estimado/página |
|---|---|
| Cloudflare Browser Run | ~$0,0023 |
| Browserbase Developer ($20/mês) | ~$0,0025–0,003 |
| Container próprio (Hetzner) | ~€0,0003 |

⚠️ Browserbase cobra **proxy a $12/GB** — uma página de 5MB custa $0,05, **20× o browser**. Traga seu próprio proxy ou não use.

**Decisão:** começar gerenciado, código contra CDP puro, migrar para container acima de ~2.000h/mês (~80k páginas). Nesse volume, escolha por velocidade de desenvolvimento, não por preço.

**Descartados:** APIs de scraping (ScrapingBee/ZenRows/Bright Data) entregam HTML, não sessão CDP — resolvem anti-bot, não extração de estilo. AWS Lambda + chromium: cold start de Chrome com usuário esperando é o pior cenário.

---

## 9. Anti-bot: não entrar na corrida

Cloudflare/DataDome/PerimeterX detectam assinatura do próprio CDP, e os patches (`puppeteer-extra-plugin-stealth`, nodriver) quebram a cada Chrome.

**Decisão:** o caminho de **upload de HTML/ZIP** elimina a categoria inteira de problema.

Isso converge com o risco legal (§10) — as duas razões apontam para a mesma escolha.

---

## 10. Posicionamento: "seu design → Elementor", nunca "clone qualquer site"

Layout, código-fonte, texto e imagens são protegidos por copyright no momento da criação. Um produto que se vende como "clone qualquer URL" carrega risco de copyright, marca e concorrência desleal embutido.

| ❌ Não posicionar | ✅ Posicionar |
|---|---|
| "clone qualquer site" | **"seu HTML/design → Elementor nativo"** |

Na prática o produto é o mesmo. O ICP é a agência convertendo **o próprio** design.

---

## 11. Figma é fase 3, não fase 1

A API entrega geometria (`absoluteBoundingBox`), Auto Layout, constraints, fills. **Não entrega** semântica (um retângulo com texto não se identifica como `<button>`), responsivo real (constraints são do canvas, não breakpoints CSS), estados, intenção de reuso, nem métrica de texto compatível com o browser.

URL/HTML já vem com o DOM computado e o CSS resolvido pelo navegador — infinitamente mais fiel, e os dois compartilham ~95% do código.

Comparativos independentes testando Locofy, Builder.io e Anima nos mesmos designs: nenhum entrega a promessa; recomendam orçar **30–40% do tempo normal de dev**.

⚠️ **Rate limit que vai queimar o onboarding:** seats **View/Collab** do Figma têm Tier 1 de **6 requisições por MÊS**. Detecte o seat type no onboarding ou o usuário estoura no primeiro uso e a culpa é sua.

Se fizer: use `GET /v1/files/:key` com `depth` (árvore inteira em uma chamada), batch de `ids` na Images API, cache por `version`, e **OAuth por usuário** — nunca um PAT central, que seria gargalo único.

E exija disciplina do arquivo (Auto Layout em tudo, frames por breakpoint, componentes nomeados) **na cara do usuário**, em vez de prometer mágica.

---

## Roadmap decorrente

| Fase | Entrega | Aceite |
|---|---|---|
| **0** | Harness de fidelidade | reproduz sozinho o resultado 20/21 do Xpice |
| **1** | Extrator genérico URL→model + loop de convergência + plugin ponte | Xpice e RB com **0 divergências**, ≥90% nativo, publicando via plugin |
| **1.5** | Suíte de regressão: 1 teste por armadilha (19) × 3 versões do Elementor | CI verde |
| **2** | API, fila, worker, auth, billing, UI mínima | 1º cliente pagante |
| **3** | Entrada Figma | com disciplina de arquivo exigida |
