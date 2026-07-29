# Edições revertem: dois editores Elementor na MESMA conta = clobber silencioso

## Sintoma
Usuário editava o post 86 no Elementor, publicava, e as mudanças "voltavam como tavam antes". Aconteceu ~3x.

## Root cause
Eu (agente, via Chrome MCP) e o usuário estávamos **logados na mesma conta WP** (`nexyocontato@gmail.com`, author 3), **ambos com o editor Elementor aberto no mesmo post** ao mesmo tempo. Porque é a **mesma conta**, o WordPress **não mostra o lock** "outro usuário editando" (`elementor.config.locked_user = null`). Minha aba de editor segurava um **snapshot em memória** de quando carregou; cada save meu (`document/save/default`) reescrevia o `_elementor_data` inteiro com esse snapshot → **sobrescrevia o que o usuário tinha acabado de publicar**.

Evidência: `/wp-json/wp/v2/pages/86/revisions` mostrou burst de 6 revisões em 14s, todas author 3 (indistinguíveis — mesma conta). `last_edited` alternava entre nossos saves.

## Fix
**Sair do editor** (navegar a aba pra fora, ex.: lista de páginas). Um editor só por post. Confirmado: após sair, `modified` parou de mudar e a edição do usuário persistiu.

## Regra pra não repetir
- **Nunca manter um editor Elementor aberto no post enquanto o usuário edita** (mesma conta = sem aviso de lock).
- Antes de aplicar/salvar programaticamente: garantir que o usuário NÃO está no editor, ou coordenar.
- **Tensão com o fluxo "build no código":** o JSON em disco (`build-xpice-nativo.mjs`) é a fonte da verdade pra rebuild. Se o usuário edita direto no Elementor, reaplicar o disco **clobbera as edições manuais** — mesma reversão, outra causa. Guardrail: antes de reaplicar, **puxar o estado do editor de volta pro código** (sincronizar na direção do usuário).

Ver [[elementor-patch-in-browser]] (editor stale: 33 vs 34 nós) e a nota de transporte irmã.
