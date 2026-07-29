import { makeWidget } from '../node.js';
import { registerWidget } from './index.js';

export function emitImage(ids, { url = '', id = 0, alt = '', extra = {} } = {}) {
  return makeWidget(ids, 'image', {
    settings: { image: { url, id, alt, source: 'library', size: '' }, image_size: 'full', ...extra },
  });
}
registerWidget('image', emitImage);
