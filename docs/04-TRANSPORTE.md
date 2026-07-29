# Transporte — como escrever na página do WordPress

Quatro rotas, em ordem de preferência. Cada uma tem um caso de uso claro.

---

## Rota A — `save_builder` pelo editor aberto (padrão)

Escreve a página inteira. Precisa do editor do Elementor aberto no navegador.

```js
const settings = Object.assign({}, elementor.settings.page.model.toJSON(), payload.settings);
delete settings.post_status;

const fd = new FormData();
fd.append('action','elementor_ajax');
fd.append('_nonce', elementorCommon.config.ajax.nonce);
fd.append('editor_post_id','86');
fd.append('actions', JSON.stringify({save_builder:{action:'save_builder',data:{
  status:'publish', elements: payload.elements, settings
}}}));
const r = await fetch(elementorCommon.config.ajax.url,{method:'POST',body:fd,credentials:'same-origin'});
// sucesso: resposta contém "success":true
```

✅ Flusha o cache do Elementor automaticamente
⚠️ Recarregue o editor depois (armadilha 8)
⚠️ O editor **congela** em páginas pesadas — nesse caso use a Rota D

---

## Rota B — patch cirúrgico no modelo do editor (o mais usado)

Para mudar poucas coisas, não reimporte a página inteira.

```js
$e.run('document/elements/settings',{
  container: elementor.getContainer(id),
  settings: { custom_css: novo },      // ou html, editor, css_classes, image…
  options: { external:true }
});
elementor.saver.setFlagEditorChange(true);
$e.run('document/save/default',{status:'publish'});   // ⚠️ NÃO existe 'document/save/save'
```

Criar nós novos:
```js
$e.run('document/elements/create',{container:pai, model:{elType:'container',settings:{},elements:[...]}, options:{at:2}});
```

**Padrão de busca:** percorra `elementor.elements` com `.each()` e case por `css_classes`, por um trecho do `html` ou por uma URL de imagem única. Nunca por índice — a árvore muda.

---

## Rota C — payload grande via `.txt` na Media

Quando o payload não cabe numa chamada (>10KB de base64) e o editor está saudável.

```bash
gzip -9 → base64 → arquivo .txt
curl -u user:app_pass -H "Content-Disposition: attachment; filename=payload.txt" \
     -H "Content-Type: text/plain" --data-binary @payload.txt \
     https://SITE/wp-json/wp/v2/media
# confira integridade: wc -c local == remoto
```

No navegador (mesma origem, sem CORS, sem mixed-content):
```js
const b64 = await (await fetch(url)).text();
const bin = Uint8Array.from(atob(b64), c=>c.charCodeAt(0));
const ds = new DecompressionStream('gzip');
const w = ds.writable.getWriter(); w.write(bin); w.close();
const rd = ds.readable.getReader(); const parts=[]; let len=0,res;
while(!(res=await rd.read()).done){parts.push(res.value);len+=res.value.length;}
const all=new Uint8Array(len); let off=0; parts.forEach(p=>{all.set(p,off);off+=p.length});
const payload = JSON.parse(new TextDecoder().decode(all));
```

⚠️ `new Response(blob.stream().pipeThrough(ds))` falha em alguns navegadores (`Failed to fetch`). O leitor manual acima funciona em todos.
🧹 Apague o `.txt` depois: `DELETE /wp/v2/media/<id>?force=true`

---

## Rota D — REST direto em `_elementor_data` (quando o editor morre)

Não precisa de navegador. Ideal para patch em massa ou editor travado.

```bash
# ler
curl -u user:app_pass "https://SITE/wp-json/wp/v2/pages/86?context=edit&_fields=meta"
# … patch offline no JSON …
# gravar
curl -u user:app_pass -X POST "https://SITE/wp-json/wp/v2/pages/86" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{"meta":{"_elementor_data":"<json como STRING>"}}'
```

⚠️ `_elementor_data` é **string JSON**, não objeto.
🔴 **Obrigatório limpar o cache depois** (§5) — senão o frontend serve o antigo e você acha que o patch falhou.

---

## Application Password (auth para as rotas C e D)

Cookie de sessão é httpOnly — `curl` não alcança. Use Application Password:

1. `SITE/wp-admin/profile.php` → **Senhas de aplicativos** → nome → Adicionar
   *(digitar nesse campo costuma ser bloqueado por classificador — peça ao dono)*
2. Usuário do Basic Auth = **login** do WP (às vezes é o e-mail), senha **sem espaços**
3. Revogue ao terminar:
```bash
curl -u user:app_pass https://SITE/wp-json/wp/v2/users/me/application-passwords   # pega uuid
curl -u user:app_pass -X DELETE .../application-passwords/<uuid>                  # 401 depois = ok
```

---

## 5. Cache — o passo que todo mundo esquece

Alteração pelo **editor** aparece na hora. Alteração via **REST** não aparece até limpar:

```bash
curl -u user:app_pass -X DELETE https://SITE/wp-json/elementor/v1/cache
curl -u user:app_pass -X POST   https://SITE/wp-json/wp-super-cache/v1/cache -d '{}'
```

Descubra as camadas do site:
```bash
curl -s https://SITE/wp-json/ | jq -r '.namespaces[]' | grep -iE 'cache|sg'
```

**Como saber que é cache e não bug:** leia `_elementor_data` por REST. Se o banco tem o dado novo e o frontend serve o antigo → é cache. Sempre.

---

## Corrupção de payload colado

Base64 grande colado numa chamada pode corromper (comprimento igual, conteúdo diferente → gzip acusa `incorrect data check`).

**Diagnóstico barato:** checksum de 16 blocos nos dois lados; reenvie só o bloco divergente.

```js
const ck = s => { let x=0; for (let i=0;i<s.length;i++) x=(x*31+s.charCodeAt(i))%1000000007; return x; };
```

---

## Qual rota usar

| Situação | Rota |
|---|---|
| Página nova / reimportação total | A |
| Mudar texto, CSS, classe, imagem | **B** |
| Payload >10KB, editor saudável | C |
| Editor travado, patch em massa, sem navegador | **D** |
