import { makeWidget } from '../node.js';
import { registerWidget } from './index.js';

export function emitHeading(ids, { title = '', tag = 'h2', color, align, extra = {} } = {}) {
  const settings = { title, header_size: tag };
  if (color) settings.title_color = color;
  if (align) settings.align = align;
  Object.assign(settings, extra);
  return makeWidget(ids, 'heading', { settings });
}
registerWidget('heading', emitHeading);
