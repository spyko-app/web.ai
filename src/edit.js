import { newIdFactory } from './id.js';

export function findById(json, id, withParent = false) {
  let found = null;
  const walk = (n, parent) => {
    if (n.id === id) { found = withParent ? { node: n, parent } : n; return true; }
    return (n.elements || []).some((c) => walk(c, n));
  };
  (json.content || []).some((n) => walk(n, null));
  return found;
}

export function setText(json, id, text) {
  const n = findById(json, id);
  if (!n) throw new Error(`id não encontrado: ${id}`);
  if ('title' in n.settings) n.settings.title = text;
  else if ('text' in n.settings) n.settings.text = text;
  else if ('editor' in n.settings) n.settings.editor = text;
  else throw new Error(`nó ${id} não tem campo de texto`);
  return json;
}

export function setColor(json, id, key, hex) {
  const n = findById(json, id);
  if (!n) throw new Error(`id não encontrado: ${id}`);
  n.settings[key] = hex;
  return json;
}

function collectIds(json, set = new Set()) {
  const walk = (n) => { set.add(n.id); (n.elements || []).forEach(walk); };
  (json.content || []).forEach(walk);
  return set;
}

export function duplicateNode(json, id) {
  const res = findById(json, id, true);
  if (!res || !res.parent) throw new Error(`não dá pra duplicar topo/ausente: ${id}`);
  const used = collectIds(json);
  const ids = newIdFactory();
  const fresh = () => { let v; do { v = ids.id(); } while (used.has(v)); used.add(v); return v; };
  const copy = JSON.parse(JSON.stringify(res.node));
  const walk = (n) => { n.id = fresh(); (n.elements || []).forEach(walk); };
  walk(copy);
  const arr = res.parent.elements;
  arr.splice(arr.indexOf(res.node) + 1, 0, copy);
  return json;
}

export function removeNode(json, id) {
  const res = findById(json, id, true);
  if (!res) return json;
  const arr = res.parent ? res.parent.elements : json.content;
  arr.splice(arr.indexOf(res.node), 1);
  return json;
}
