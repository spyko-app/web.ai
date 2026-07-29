import { newIdFactory } from './id.js';
import { makeContainer } from './node.js';
import { getWidget } from './widgets/index.js';

function buildChild(ids, child) {
  if (child.children) {
    return makeContainer(ids, {
      settings: child.settings || {},
      elements: child.children.map((c) => buildChild(ids, c)),
      isInner: true,
    });
  }
  return getWidget(child.type)(ids, child.props || {});
}

export function buildPage({ title = 'Page', sections = [], page_settings } = {}) {
  const ids = newIdFactory();
  const content = sections.map((sec) =>
    makeContainer(ids, {
      settings: sec.settings || { content_width: 'full' },
      elements: (sec.children || []).map((c) => buildChild(ids, c)),
      isInner: false,
    }),
  );
  return {
    content,
    page_settings: page_settings || {
      background_color: '#FFFFFF',
      custom_css: 'p{margin:0px;}\nhtml, body{width:100%;overflow-x:hidden;}',
    },
    version: '0.4',
    title,
    type: 'page',
  };
}
