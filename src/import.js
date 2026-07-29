// Importador DOM->Elementor: converte o modelo extraído do site real (xpice-dom.json)
// em JSON Elementor com estilos reais preservados.
import { newIdFactory } from './id.js';
import { makeContainer, makeWidget } from './node.js';

const px = (n) => ({ unit: 'px', size: n, sizes: [] });
const numeric = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
const spacingObj = (arr) => {
  const [t, r, b, l] = arr.map(numeric);
  return { unit: 'px', top: `${t}`, right: `${r}`, bottom: `${b}`, left: `${l}`, isLinked: t === r && r === b && b === l };
};
const rgbaToHex = (c) => {
  if (!c || c === 'rgba(0, 0, 0, 0)' || c === 'transparent') return null;
  const m = /rgba?\(([^)]+)\)/.exec(c);
  if (!m) return c.startsWith('#') ? c : null;
  const p = m[1].split(',').map((x) => x.trim());
  const [r, g, b] = p.slice(0, 3).map((x) => Math.round(parseFloat(x)));
  const a = p[3] != null ? Math.round(parseFloat(p[3]) * 255) : 255;
  const hx = (x) => x.toString(16).padStart(2, '0');
  return `#${hx(r)}${hx(g)}${hx(b)}${a < 255 ? hx(a) : ''}`.toUpperCase();
};

// objeto de css cru p/ o preview aplicar verbatim (fidelidade)
function cssForPreview(st, { asImageBox = false } = {}) {
  const s = {};
  if (st.display) s.display = st.display;
  if (st.display === 'flex') {
    if (st.flexDirection) s.flexDirection = st.flexDirection;
    if (st.justifyContent) s.justifyContent = st.justifyContent;
    if (st.alignItems) s.alignItems = st.alignItems;
    if (st.gap && st.gap !== 'normal') s.gap = st.gap;
    if (st.flexWrap && st.flexWrap !== 'nowrap') s.flexWrap = st.flexWrap;
  }
  if (st.padding) s.padding = st.padding.join(' ');
  if (st.margin) s.margin = st.margin.join(' ');
  const bg = rgbaToHex(st.bg);
  if (bg) s.background = bg;
  const bgi = st.bgSrc || st.bgImage;
  if (bgi) { s.backgroundImage = `url(${bgi})`; s.backgroundSize = 'cover'; s.backgroundPosition = 'center'; s.backgroundRepeat = 'no-repeat'; }
  if (st.minH) s.minHeight = `${st.minH}px`;
  else if (st.minHeight) s.minHeight = st.minHeight;
  if (st.color) s.color = st.color;
  if (st.fontFamily) s.fontFamily = st.fontFamily;
  if (st.fontSize) s.fontSize = st.fontSize;
  if (st.fontWeight && st.fontWeight !== '400') s.fontWeight = st.fontWeight;
  if (st.lineHeight && st.lineHeight !== 'normal') s.lineHeight = st.lineHeight;
  if (st.letterSpacing && st.letterSpacing !== 'normal') s.letterSpacing = st.letterSpacing;
  if (st.textTransform && st.textTransform !== 'none') s.textTransform = st.textTransform;
  if (st.textAlign && st.textAlign !== 'start') s.textAlign = st.textAlign;
  if (st.borderRadius && st.borderRadius !== '0px') s.borderRadius = st.borderRadius;
  if (st.border && st.border[0] !== '0px' && st.border[1] !== 'none') {
    const bc = rgbaToHex(st.border[2]);
    s.border = `${st.border[0]} ${st.border[1]} ${bc || '#000'}`;
  }
  if (st.boxShadow) s.boxShadow = st.boxShadow;
  if (st.maxWidth && st.maxWidth !== 'none') s.maxWidth = st.maxWidth;
  if (st.position === 'absolute' || st.position === 'fixed') s.position = st.position;
  return s;
}

// mapeia estilos -> settings nativos Elementor (editável) + _css (preview)
function nativeSettings(st, kind) {
  const s = {};
  const color = rgbaToHex(st.color);
  if (kind === 'container') {
    if (st.display === 'flex') {
      s.flex_direction = st.flexDirection || 'column';
      if (st.justifyContent) s.flex_justify_content = st.justifyContent;
      if (st.alignItems) s.flex_align_items = st.alignItems;
      if (st.gap && st.gap !== 'normal') { const g = numeric(st.gap); s.flex_gap = { column: `${g}`, row: `${g}`, unit: 'px', isLinked: true }; }
    }
    s.padding = spacingObj(st.padding);
    const bg = rgbaToHex(st.bg);
    if (bg) { s.background_background = 'classic'; s.background_color = bg; }
    if (st.bgImage) { s.background_background = 'classic'; s.background_image = { url: st.bgImage, id: 0 }; s.background_size = 'cover'; s.background_position = 'center center'; }
    if (st.borderRadius && st.borderRadius !== '0px') s.border_radius = px(numeric(st.borderRadius));
  } else {
    if (color) {
      if (kind === 'heading') s.title_color = color;
      else if (kind === 'button') s.button_text_color = color;
    }
    if (st.fontSize) { s.typography_typography = 'custom'; s.typography_font_size = px(numeric(st.fontSize)); }
    if (st.fontWeight && st.fontWeight !== '400') { s.typography_typography = 'custom'; s.typography_font_weight = st.fontWeight; }
    if (st.textAlign && st.textAlign !== 'start') s.align = st.textAlign;
  }
  return s;
}

function convertNode(ids, n) {
  const _css = cssForPreview(n.st);
  if (n.kind === 'image') {
    // largura real renderizada (cap 100%); object-fit preservado
    if (n.w) { _css.width = `${n.w}px`; _css.maxWidth = '100%'; }
    if (n.h) _css.height = `${n.h}px`;
    if (n.fit) _css.objectFit = n.fit;
    const imgNative = { image: { url: n.src, id: 0, alt: n.alt || '', source: 'library', size: '' }, image_size: 'full', _css };
    if (n.w) imgNative.width = { unit: 'px', size: n.w, sizes: [] };
    if (n.fit) imgNative['object-fit'] = n.fit;
    return makeWidget(ids, 'image', { settings: imgNative });
  }
  if (n.kind === 'svg') {
    return makeWidget(ids, 'html', { settings: { html: n.html, _css } });
  }
  if (n.kind === 'heading') {
    const tag = /^h[1-6]$/.test(n.tag) ? n.tag : 'h3';
    return makeWidget(ids, 'heading', { settings: { title: n.text, header_size: tag, ...nativeSettings(n.st, 'heading'), _css } });
  }
  if (n.kind === 'button') {
    const bg = rgbaToHex(n.st.bg);
    return makeWidget(ids, 'button', {
      settings: {
        text: n.text, link: { url: n.href || '', is_external: '', nofollow: '', custom_attributes: '' },
        ...(bg ? { background_color: bg } : {}), ...nativeSettings(n.st, 'button'), _css,
      },
    });
  }
  if (n.kind === 'text') {
    return makeWidget(ids, 'text-editor', { settings: { editor: `<p>${escapeHtml(n.text)}</p>`, _css } });
  }
  // container
  const elements = (n.children || []).map((c) => convertNode(ids, c));
  return makeContainer(ids, { settings: { content_width: 'full', ...nativeSettings(n.st, 'container'), _css }, elements, isInner: true });
}

function escapeHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// ---------- EMISSOR LEGADO (section/column/widget + settings NATIVOS) ----------
// Elementor V4/clássico não registra 'container'; e descarta settings desconhecidos (_css).
// Aqui mapeamos pra section/column/widget com chaves nativas (sobrevivem ao import).

function isRow(st) {
  return st && st.display === 'flex' && st.flexDirection === 'row' && !/wrap/.test(st.flexWrap || '');
}

function sectionStyle(st) {
  const s = { layout: 'full_width' };
  const bg = rgbaToHex(st.bg);
  const bgi = st.bgSrc || st.bgImage;
  if (bgi) {
    s.background_background = 'classic';
    s.background_image = { url: bgi, id: '', source: 'url' };
    s.background_size = 'cover'; s.background_position = 'center center'; s.background_repeat = 'no-repeat';
  } else if (bg) { s.background_background = 'classic'; s.background_color = bg; }
  if (st.padding) s.padding = spacingObj(st.padding);
  return s;
}

function widgetNativeSettings(n) {
  const st = n.st || {};
  const color = rgbaToHex(st.color);
  const fs = st.fontSize ? px(numeric(st.fontSize)) : null;
  if (n.kind === 'heading') {
    const s = { title: n.text || '', header_size: /^h[1-6]$/.test(n.tag) ? n.tag : 'h3' };
    if (color) s.title_color = color;
    if (fs) { s.typography_typography = 'custom'; s.typography_font_size = fs; }
    if (st.fontWeight && st.fontWeight !== '400') { s.typography_typography = 'custom'; s.typography_font_weight = st.fontWeight; }
    if (st.textAlign && st.textAlign !== 'start') s.align = st.textAlign;
    if (st.lineHeight && /px/.test(st.lineHeight)) { s.typography_typography = 'custom'; s.typography_line_height = px(numeric(st.lineHeight)); }
    return { type: 'heading', settings: s };
  }
  if (n.kind === 'text') {
    const s = { editor: `<p>${escapeHtml(n.text || '')}</p>` };
    if (color) s.text_color = color;
    if (fs) { s.typography_typography = 'custom'; s.typography_font_size = fs; }
    return { type: 'text-editor', settings: s };
  }
  if (n.kind === 'button') {
    const s = { text: n.text || '', link: { url: n.href || '', is_external: '', nofollow: '' } };
    if (color) s.button_text_color = color;
    const bg = rgbaToHex(st.bg); if (bg) s.background_color = bg;
    if (st.borderRadius && st.borderRadius !== '0px') s.border_radius = spacingObj([st.borderRadius, st.borderRadius, st.borderRadius, st.borderRadius]);
    return { type: 'button', settings: s };
  }
  if (n.kind === 'image') {
    const s = { image: { url: n.src, id: '', source: 'url' }, image_size: 'full' };
    if (n.w) s.width = { unit: 'px', size: n.w, sizes: [] };
    if (n.fit) s['object-fit'] = n.fit;
    return { type: 'image', settings: s };
  }
  if (n.kind === 'svg') return { type: 'html', settings: { html: n.html || '' } };
  return null;
}

export function importDomLegacy(model) {
  const ids = newIdFactory();
  const widget = (n) => {
    const w = widgetNativeSettings(n);
    if (!w) return null;
    return { id: ids.id(), elType: 'widget', widgetType: w.type, settings: w.settings, elements: [], isInner: false };
  };
  const column = (children, size = 100, style = {}) => ({
    id: ids.id(), elType: 'column',
    settings: { _column_size: size, _inline_size: null, ...style },
    elements: children.filter(Boolean), isInner: false,
  });
  // bloco que cabe numa coluna: widget OU inner-section
  const block = (n) => {
    if (n.kind !== 'container') return widget(n);
    const kids = n.children || [];
    if (!kids.length) {
      // container só-fundo (ex.: mapa) -> inner-section vazia com bg + min-altura
      const inner = { id: ids.id(), elType: 'section', isInner: true, settings: sectionStyle(n.st), elements: [column([])] };
      if (n.st?.minH) inner.settings.min_height = { unit: 'px', size: Math.min(n.st.minH, 600), sizes: [] };
      return inner;
    }
    if (isRow(n.st) && kids.length > 1) {
      const size = Math.max(8, Math.round(100 / kids.length));
      const cols = kids.map((c) => column([block(c)], size));
      return { id: ids.id(), elType: 'section', isInner: true, settings: sectionStyle(n.st), elements: cols };
    }
    // pilha -> inner-section com 1 coluna
    return { id: ids.id(), elType: 'section', isInner: true, settings: sectionStyle(n.st), elements: [column(kids.map(block), 100)] };
  };
  const rootSection = (root) => ({
    id: ids.id(), elType: 'section', isInner: false,
    settings: sectionStyle(root.st),
    elements: [column((root.children || []).map(block), 100)],
  });
  return {
    content: (model.roots || []).map(rootSection),
    page_settings: { background_color: '#FFFFFF' },
    version: '0.4', title: (model.title || 'Imported') + ' (motor)', type: 'page',
  };
}

export function importDom(model) {
  const ids = newIdFactory();
  const content = (model.roots || []).map((r) => {
    const node = convertNode(ids, r);
    node.isInner = false; // roots são seções de topo
    return node;
  });
  return {
    content,
    page_settings: {
      background_color: '#0E1712',
      custom_css: 'p{margin:0}\nhtml,body{margin:0;width:100%;overflow-x:hidden}',
    },
    version: '0.4',
    title: model.title || 'Imported',
    type: 'page',
  };
}
