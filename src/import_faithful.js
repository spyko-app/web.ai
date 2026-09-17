import { newIdFactory } from './id.js';

const FONT = 'Geist';

const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
const U = (size, unit = 'px') => ({ unit, size, sizes: [] });
const box = (arr, unit = 'px') => {
  const [t, r, b, l] = arr.map(num);
  return { unit, top: `${t}`, right: `${r}`, bottom: `${b}`, left: `${l}`, isLinked: t === r && r === b && b === l };
};
const hex = (c) => {
  if (!c || c === 'transparent' || c === 'rgba(0, 0, 0, 0)') return null;
  if (c.startsWith('#')) return c.toUpperCase();
  const m = /rgba?\(([^)]+)\)/.exec(c);
  if (!m) return null;
  const p = m[1].split(',').map((x) => x.trim());
  const [r, g, b] = p.slice(0, 3).map((x) => Math.round(parseFloat(x)));
  const a = p[3] != null ? Math.round(parseFloat(p[3]) * 255) : 255;
  const h = (x) => x.toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}${a < 255 ? h(a) : ''}`.toUpperCase();
};

function typo(st, pre = 'typography_', { mobileScale = true } = {}) {
  const s = {};
  const fs = st.fontSize ? num(st.fontSize) : null;
  if (fs == null && !st.fontWeight && !st.letterSpacing) return s;
  s[`${pre}typography`] = 'custom';
  s[`${pre}font_family`] = FONT;
  if (st.fontWeight && st.fontWeight !== '400') s[`${pre}font_weight`] = String(st.fontWeight);
  if (fs != null) s[`${pre}font_size`] = U(fs);
  if (st.lineHeight && /px/.test(st.lineHeight)) s[`${pre}line_height`] = U(num(st.lineHeight));
  else if (st.lineHeight && st.lineHeight !== 'normal' && !isNaN(parseFloat(st.lineHeight))) s[`${pre}line_height`] = U(parseFloat(st.lineHeight), 'em');
  if (st.letterSpacing && st.letterSpacing !== 'normal') s[`${pre}letter_spacing`] = U(num(st.letterSpacing));
  if (st.textTransform && st.textTransform !== 'none') s[`${pre}text_transform`] = st.textTransform;
  if (mobileScale && fs != null && fs >= 30) s[`${pre}font_size_mobile`] = U(Math.round(fs * 0.62));
  else if (mobileScale && fs != null && fs >= 20) s[`${pre}font_size_mobile`] = U(Math.round(fs * 0.8));
  return s;
}

function bgSettings(st) {
  const s = {};
  const bgi = st.bgSrc || st.bgImage;
  const col = hex(st.bg);
  if (bgi) {
    s.background_background = 'classic';
    s.background_image = { url: bgi, id: '', alt: '', source: 'library', size: '' };
    s.background_size = 'cover'; s.background_position = 'center center'; s.background_repeat = 'no-repeat';
    if (col) { s.background_overlay_background = 'classic'; s.background_overlay_color = col; }
  } else if (col) {
    s.background_background = 'classic'; s.background_color = col;
  }
  return s;
}
function borderShadow(st) {
  const s = {};
  if (st.border && st.border[0] && st.border[0] !== '0px' && st.border[1] && st.border[1] !== 'none') {
    s.border_border = 'solid';
    const bc = hex(st.border[2]); if (bc) s.border_color = bc;
    s.border_width = box([st.border[0], st.border[0], st.border[0], st.border[0]]);
  }
  if (st.borderRadius && st.borderRadius !== '0px') {
    const r = num(st.borderRadius); s.border_radius = box([r, r, r, r]);
  }
  if (st.boxShadow && st.boxShadow !== 'none') {
    const m = /rgba?\([^)]+\)|#[0-9a-f]+/i.exec(st.boxShadow);
    const nums = st.boxShadow.replace(/rgba?\([^)]+\)/g, '').match(/-?\d+\.?\d*/g) || [];
    s.box_shadow_box_shadow_type = 'yes';
    s.box_shadow_box_shadow = {
      horizontal: Math.round(num(nums[0] || 0)), vertical: Math.round(num(nums[1] || 0)),
      blur: Math.round(num(nums[2] || 0)), spread: Math.round(num(nums[3] || 0)),
      color: hex(m ? m[0] : 'rgba(0,0,0,0.15)') || '#00000026',
    };
  }
  return s;
}
const isRow = (st) => st && st.display === 'flex' && st.flexDirection === 'row';
function flexSettings(st, { mobile = true } = {}) {
  const s = {};
  if (st.display === 'flex') {
    s.flex_direction = st.flexDirection || 'column';
    if (st.justifyContent && st.justifyContent !== 'normal') s.flex_justify_content = st.justifyContent;
    if (st.alignItems && st.alignItems !== 'normal') s.flex_align_items = st.alignItems;
    if (st.flexWrap && st.flexWrap !== 'nowrap') s.flex_wrap = st.flexWrap;
    if (st.gap && st.gap !== 'normal') {
      const g = num(st.gap);
      s.flex_gap = { column: `${g}`, row: `${g}`, isLinked: true, unit: 'px', size: g };
    }
    if (mobile && st.flexDirection === 'row') s.flex_direction_mobile = 'column';
  }
  return s;
}
function containerStyle(st, { isInner }) {
  const s = { content_width: 'full' };
  Object.assign(s, flexSettings(st));
  if (st.padding) {
    s.padding = box(st.padding);
    const p = st.padding.map(num);
    if (p[1] > 40 || p[3] > 40) s.padding_mobile = box([Math.min(p[0], 48), 20, Math.min(p[2], 48), 20]);
  }
  Object.assign(s, bgSettings(st));
  Object.assign(s, borderShadow(st));
  const minH = st.minH || (st.minHeight && /px/.test(st.minHeight) ? num(st.minHeight) : 0);
  if (!isInner && minH && minH > 200) s.min_height = U(Math.min(minH, 900));
  if (st.maxWidth && /px/.test(st.maxWidth)) { s.content_width = 'boxed'; s.boxed_width = U(num(st.maxWidth)); }
  return s;
}

function escapeHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function widgetSettings(n) {
  const st = n.st || {};
  if (n.kind === 'heading') {
    const s = { title: n.text || '', header_size: /^h[1-6]$/.test(n.tag) ? n.tag : 'h2' };
    const c = hex(st.color); if (c) s.title_color = c;
    if (st.textAlign && st.textAlign !== 'start') s.align = st.textAlign;
    Object.assign(s, typo(st));
    return { type: 'heading', settings: s };
  }
  if (n.kind === 'text') {
    const s = { editor: `<p>${escapeHtml(n.text || '')}</p>` };
    const c = hex(st.color); if (c) s.text_color = c;
    if (st.textAlign && st.textAlign !== 'start') s.align = st.textAlign;
    Object.assign(s, typo(st, 'typography_', { mobileScale: false }));
    return { type: 'text-editor', settings: s };
  }
  if (n.kind === 'button') {
    const s = { text: n.text || '', link: { url: n.href || '', is_external: '', nofollow: '', custom_attributes: '' } };
    const c = hex(st.color); if (c) s.button_text_color = c;
    const bg = hex(st.bg); if (bg) { s.background_background = 'classic'; s.background_color = bg; }
    if (st.padding) s.text_padding = box(st.padding);
    if (st.borderRadius && st.borderRadius !== '0px') { const r = num(st.borderRadius); s.border_radius = box([r, r, r, r]); }
    Object.assign(s, typo(st, 'typography_', { mobileScale: false }));
    return { type: 'button', settings: s };
  }
  if (n.kind === 'image') {
    const s = { image: { url: n.src, id: '', alt: n.alt || '', source: 'library', size: '' }, image_size: 'full' };
    if (n.w) s.width = U(n.w);
    return { type: 'image', settings: s };
  }
  if (n.kind === 'svg') return { type: 'html', settings: { html: n.html || '' } };
  return null;
}

export function importDomFaithful(model) {
  const ids = newIdFactory();

  const widget = (n) => {
    const w = widgetSettings(n); if (!w) return null;
    return { id: ids.id(), elType: 'widget', widgetType: w.type, settings: w.settings, elements: [], isInner: false };
  };
  const convert = (n, isInner) => {
    if (n.kind !== 'container') return widget(n);
    return {
      id: ids.id(), elType: 'container', isInner,
      settings: containerStyle(n.st || {}, { isInner }),
      elements: (n.children || []).map((c) => convert(c, true)).filter(Boolean),
    };
  };
  const section = (n) => {
    const node = convert(n, false);
    return node;
  };

  const roots = model.roots || [];
  const tops = [];
  for (const r of roots) {
    const tag = r.tag || '';
    if (tag === 'main' && r.children && r.children.length > 3) {
      for (const sec of r.children) tops.push(section(sec));
    } else {
      tops.push(section(r));
    }
  }

  return {
    content: tops.filter(Boolean),
    page_settings: {
      background_color: '#FFFFFF',
      custom_css: `@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap');\np{margin:0}\nhtml,body{margin:0;width:100%;overflow-x:hidden}\nbody,.elementor-heading-title,.elementor-widget-text-editor,.elementor-button-text{font-family:'Geist',system-ui,sans-serif}`,
    },
    version: '0.4', title: (model.title || 'Xpice') + ' (motor fiel)', type: 'page',
  };
}
