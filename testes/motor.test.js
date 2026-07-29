import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newIdFactory } from '../src/id.js';
import { u, box, boxAll, responsive, isHexColor } from '../src/units.js';
import { makeContainer, makeWidget } from '../src/node.js';
import '../src/widgets/heading.js';
import '../src/widgets/text.js';
import '../src/widgets/button.js';
import '../src/widgets/image.js';
import { getWidget } from '../src/widgets/index.js';
import { buildPage } from '../src/builder.js';
import { validate } from '../src/validate.js';
import { findById, setText, duplicateNode } from '../src/edit.js';
import { applyCustomCss, applyMotion, applyResponsivePadding } from '../src/advanced.js';

// --- id ---
test('id: 8 hex', () => assert.match(newIdFactory().id(), /^[0-9a-f]{8}$/));
test('subId: 7 hex', () => assert.match(newIdFactory().subId(), /^[0-9a-f]{7}$/));
test('ids únicos (1000)', () => {
  const f = newIdFactory(); const s = new Set();
  for (let i = 0; i < 1000; i++) s.add(f.id());
  assert.equal(s.size, 1000);
});

// --- units ---
test('u: objeto unidade', () => assert.deepEqual(u(18), { unit: 'px', size: 18, sizes: [] }));
test('box: 4 lados string', () => assert.deepEqual(box(14, 16, 14, 10),
  { unit: 'px', top: '14', right: '16', bottom: '14', left: '10', isLinked: false }));
test('boxAll linkado', () => assert.equal(boxAll(20).isLinked, true));
test('responsive sufixos', () => {
  const r = responsive('typography_font_size', { desktop: u(48), tablet: u(32), mobile: u(24) });
  assert.deepEqual(r.typography_font_size, u(48));
  assert.deepEqual(r.typography_font_size_mobile, u(24));
});
test('isHexColor', () => {
  assert.ok(isHexColor('#FFFFFF')); assert.ok(isHexColor('#FFFFFF1A'));
  assert.equal(isHexColor('white'), false);
});

// --- node ---
test('container forma', () => {
  const c = makeContainer(newIdFactory(), { isInner: false });
  assert.equal(c.elType, 'container'); assert.equal('widgetType' in c, false);
});
test('widget forma', () => {
  const w = makeWidget(newIdFactory(), 'heading', { settings: { title: 'Oi' } });
  assert.equal(w.widgetType, 'heading'); assert.deepEqual(w.elements, []);
});

// --- widgets ---
test('heading emit', () => {
  const n = getWidget('heading')(newIdFactory(), { title: 'Bem-vindo', tag: 'h1', color: '#111111' });
  assert.equal(n.settings.header_size, 'h1'); assert.equal(n.settings.title_color, '#111111');
});
test('button link objeto', () => {
  const n = getWidget('button')(newIdFactory(), { text: 'Comprar', link: { url: '#price' } });
  assert.equal(n.settings.link.url, '#price'); assert.equal(n.settings.link.is_external, '');
});

// --- builder ---
test('buildPage envelope', () => {
  const p = buildPage({ title: 'Home', sections: [] });
  assert.equal(p.version, '0.4'); assert.equal(p.type, 'page'); assert.ok(p.page_settings);
});
test('buildPage seção->container>widget', () => {
  const p = buildPage({ title: 'H', sections: [{ children: [{ type: 'heading', props: { title: 'Oi' } }] }] });
  assert.equal(p.content[0].elType, 'container');
  assert.equal(p.content[0].elements[0].widgetType, 'heading');
});
test('buildPage ids únicos', () => {
  const p = buildPage({ title: 'X', sections: [{ children: [{ type: 'heading', props: {} }, { type: 'heading', props: {} }] }] });
  const ids = []; const walk = (n) => { ids.push(n.id); (n.elements || []).forEach(walk); };
  p.content.forEach(walk);
  assert.equal(new Set(ids).size, ids.length);
});

// --- validate ---
const pg = () => buildPage({ title: 'X', sections: [{ children: [{ type: 'heading', props: { title: 'Oi' } }] }] });
test('página válida passa', () => { const r = validate(pg()); assert.equal(r.ok, true, r.errors.join('; ')); });
test('version errada falha', () => { const p = pg(); p.version = '0.3'; assert.equal(validate(p).ok, false); });
test('id duplicado falha', () => {
  const p = pg(); p.content[0].elements[0].id = p.content[0].id;
  assert.ok(validate(p).errors.some((e) => /duplicad/i.test(e)));
});
test('widgetType desconhecido falha', () => {
  const p = pg(); p.content[0].elements[0].widgetType = 'inexistente-xyz';
  assert.equal(validate(p).ok, false);
});

// --- edit ---
test('setText troca', () => {
  const p = pg(); const id = p.content[0].elements[0].id;
  setText(p, id, 'Novo'); assert.equal(findById(p, id).settings.title, 'Novo');
});
test('duplicateNode regenera ids + válido', () => {
  const p = pg(); const before = p.content[0].elements.length;
  duplicateNode(p, p.content[0].elements[0].id);
  assert.equal(p.content[0].elements.length, before + 1);
  assert.equal(validate(p).ok, true, validate(p).errors.join('; '));
});

// --- advanced ---
test('applyCustomCss', () => {
  const p = pg(); const id = p.content[0].elements[0].id;
  applyCustomCss(p, id, 'sel{opacity:.5}'); assert.match(findById(p, id).settings.custom_css, /opacity/);
});
test('applyMotion', () => {
  const p = pg(); const id = p.content[0].elements[0].id;
  applyMotion(p, id, { animation: 'fadeInUp', delay: 200 });
  assert.equal(findById(p, id).settings._animation, 'fadeInUp');
});
test('applyResponsivePadding mobile', () => {
  const p = pg(); const id = p.content[0].elements[0].id;
  applyResponsivePadding(p, id, { desktop: box(40, 40, 40, 40), mobile: box(16, 16, 16, 16) });
  assert.equal(findById(p, id).settings._padding_mobile.top, '16');
});
