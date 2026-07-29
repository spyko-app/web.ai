import { makeWidget } from '../node.js';
import { registerWidget } from './index.js';

const link = (l = {}) => ({
  url: l.url || '', is_external: l.is_external || '',
  nofollow: l.nofollow || '', custom_attributes: l.custom_attributes || '',
});

export function emitButton(ids, { text = '', link: l, color, bg, extra = {} } = {}) {
  const settings = { text, link: link(l) };
  if (color) settings.button_text_color = color;
  if (bg) settings.background_color = bg;
  Object.assign(settings, extra);
  return makeWidget(ids, 'button', { settings });
}
registerWidget('button', emitButton);
