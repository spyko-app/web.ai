// gerador determinístico de ids hex únicos por factory
function hashHex(n, len) {
  let h = 0x811c9dc5;
  const s = String(n) + ':elementor';
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0').slice(0, len);
}

export function newIdFactory() {
  let n = 0;
  const seen = new Set();
  const make = (len) => {
    let v;
    do { v = hashHex(n++, len); } while (seen.has(v));
    seen.add(v);
    return v;
  };
  return { id: () => make(8), subId: () => make(7) };
}
