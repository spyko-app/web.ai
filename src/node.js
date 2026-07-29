export function makeContainer(ids, { settings = {}, elements = [], isInner = false } = {}) {
  return { id: ids.id(), elType: 'container', settings, elements, isInner };
}

export function makeWidget(ids, widgetType, { settings = {} } = {}) {
  return { id: ids.id(), elType: 'widget', settings, elements: [], isInner: false, widgetType };
}
