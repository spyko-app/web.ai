import { makeWidget } from '../node.js';
import { registerWidget } from './index.js';

export function emitHtml(ids, { html = '', extra = {} } = {}) {
  return makeWidget(ids, 'html', { settings: { html, ...extra } });
}
registerWidget('html', emitHtml);
