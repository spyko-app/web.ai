const REGISTRY = new Map();
export function registerWidget(type, emitFn) { REGISTRY.set(type, emitFn); }
export function getWidget(type) {
  const fn = REGISTRY.get(type);
  if (!fn) throw new Error(`widget não registrado: ${type}`);
  return fn;
}
export function knownWidgets() { return [...REGISTRY.keys()]; }
