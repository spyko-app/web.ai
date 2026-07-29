import { makeWidget } from '../node.js';
import { registerWidget } from './index.js';

export function emitText(ids, { html = '', extra = {} } = {}) {
  return makeWidget(ids, 'text-editor', { settings: { editor: html, ...extra } });
}
registerWidget('text-editor', emitText);
