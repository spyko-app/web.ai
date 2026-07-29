export const u = (size, unit = 'px') => ({ unit, size, sizes: [] });

export const box = (top, right, bottom, left, unit = 'px') => ({
  unit, top: String(top), right: String(right),
  bottom: String(bottom), left: String(left), isLinked: false,
});

export const boxAll = (v, unit = 'px') => ({
  unit, top: String(v), right: String(v), bottom: String(v), left: String(v), isLinked: true,
});

const SUFFIX = {
  widescreen: '_widescreen', desktop: '', laptop: '_laptop',
  tablet_extra: '_tablet_extra', tablet: '_tablet',
  mobile_extra: '_mobile_extra', mobile: '_mobile',
};

export function responsive(key, values) {
  const out = {};
  for (const [bp, val] of Object.entries(values)) {
    if (!(bp in SUFFIX)) throw new Error(`breakpoint inválido: ${bp}`);
    out[key + SUFFIX[bp]] = val;
  }
  return out;
}

export const isHexColor = (s) => typeof s === 'string' && /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(s);
