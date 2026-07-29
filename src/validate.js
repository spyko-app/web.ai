import { knownWidgets } from './widgets/index.js';

export function validate(json) {
  const errors = [];
  const known = new Set(knownWidgets());
  const seen = new Set();

  if (json?.version !== '0.4') errors.push(`version deve ser "0.4", veio "${json?.version}"`);
  if (json?.type == null) errors.push('type ausente');
  if (json?.page_settings == null) errors.push('page_settings ausente');
  if (!Array.isArray(json?.content)) errors.push('content deve ser array');

  const walk = (n, path) => {
    if (!/^[0-9a-f]{8}$/.test(n.id || '')) errors.push(`${path}: id inválido "${n.id}"`);
    else if (seen.has(n.id)) errors.push(`${path}: id duplicado "${n.id}"`);
    else seen.add(n.id);

    if (n.elType === 'widget') {
      if (!known.has(n.widgetType)) errors.push(`${path}: widgetType desconhecido "${n.widgetType}"`);
      if ((n.elements || []).length) errors.push(`${path}: widget não pode ter elements`);
    } else if (n.elType === 'container' || n.elType === 'section' || n.elType === 'column') {
      if (n.widgetType) errors.push(`${path}: ${n.elType} não pode ter widgetType`);
      (n.elements || []).forEach((c, i) => walk(c, `${path}>${i}`));
    } else {
      errors.push(`${path}: elType inválido "${n.elType}"`);
    }
  };
  (json?.content || []).forEach((n, i) => walk(n, `content[${i}]`));

  return { ok: errors.length === 0, errors };
}
