import { findById } from './edit.js';

const get = (json, id) => {
  const n = findById(json, id);
  if (!n) throw new Error(`id não encontrado: ${id}`);
  return n;
};

export function applyCustomCss(json, id, css) { get(json, id).settings.custom_css = css; return json; }

export function applyMotion(json, id, { animation, delay } = {}) {
  const s = get(json, id).settings;
  if (animation) s._animation = animation;
  if (delay != null) s.animation_delay = delay;
  return json;
}

export function applySticky(json, id, { to = 'top', offset = 0 } = {}) {
  const s = get(json, id).settings;
  s.sticky = to; s.sticky_offset = offset;
  return json;
}

export function applyZindex(json, id, n) { get(json, id).settings._z_index = n; return json; }

export function applyResponsivePadding(json, id, { desktop, tablet, mobile } = {}) {
  const s = get(json, id).settings;
  if (desktop) s._padding = desktop;
  if (tablet) s._padding_tablet = tablet;
  if (mobile) s._padding_mobile = mobile;
  return json;
}
