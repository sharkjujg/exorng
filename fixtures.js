// ExoRNG fixtures for check.html: one row per case, [rule id, field overrides, expected match].
export const V = '2026-11-01';
export const base = { id: 'Test b', host: 'Test', year: 2012, method: 'Transit', facility: 'Kepler', period: 10, radius: 1.5, mass: 5, temp: 500, dist: 50,
  planets: 2, stars: 1, spec: 'K2 V' };

export const cases = [
  ['first-decade', { year: 2002 }, true], ['first-decade', { year: 2003 }, false], ['first-decade', { year: null }, false], ['first-decade', { year: 0 }, false],
  ['pioneer', { year: 2005 }, true], ['pioneer', { year: 2006 }, false],
  ['earth-sized', { radius: 0.8 }, true], ['earth-sized', { radius: 1.25 }, true], ['earth-sized', { radius: 0.79 }, false], ['earth-sized', { radius: 1.26 }, false],
  ['earth-sized', { radius: null }, false], ['earth-sized', { radius: 0 }, false],
  ['super-earth', { radius: 1.26 }, true], ['super-earth', { radius: 2 }, true], ['super-earth', { radius: 1.25 }, false], ['super-earth', { radius: 2.01 }, false],
  ['giant', { radius: 8 }, true], ['giant', { radius: 7.99 }, false], ['giant', { radius: null }, false],
  ['inflated-giant', { radius: 15 }, true], ['inflated-giant', { radius: 14.9 }, false],
  ['ultra-short-year', { period: 0.99 }, true], ['ultra-short-year', { period: 1 }, false], ['ultra-short-year', { period: null }, false], ['ultra-short-year', { period: 0 }, false],
  ['long-year', { period: 1000 }, true], ['long-year', { period: 999 }, false],
  ['very-long-year', { period: 10000 }, true], ['very-long-year', { period: 9999 }, false],
  ['hot-giant', { radius: 8, period: 9.9 }, true], ['hot-giant', { radius: 8, period: 10 }, false], ['hot-giant', { radius: 7.9, period: 5 }, false],
  ['hot-giant', { radius: null, period: 5 }, false], ['hot-giant', { radius: 9, period: null }, false],
  ['light-world', { mass: 0.99 }, true], ['light-world', { mass: 1 }, false], ['light-world', { mass: null }, false], ['light-world', { mass: 0 }, false],
  ['heavyweight', { mass: 3000 }, true], ['heavyweight', { mass: 2999 }, false],
  ['temperate', { temp: 200 }, true], ['temperate', { temp: 320 }, true], ['temperate', { temp: 199 }, false], ['temperate', { temp: 321 }, false], ['temperate', { temp: null }, false],
  ['scorched', { temp: 2000 }, true], ['scorched', { temp: 1999 }, false],
  ['nearby', { dist: 9.99 }, true], ['nearby', { dist: 10 }, false], ['nearby', { dist: null }, false],
  ['deep-field', { dist: 1000 }, true], ['deep-field', { dist: 999 }, false],
  ['crowded-system', { planets: 5 }, true], ['crowded-system', { planets: 4 }, false], ['crowded-system', { planets: null }, false],
  ['full-house', { planets: 7 }, true], ['full-house', { planets: 6 }, false],
  ['binary-host', { stars: 2 }, true], ['binary-host', { stars: 1 }, false], ['binary-host', { stars: null }, false],
  ['transit-find', { method: 'Transit' }, true], ['transit-find', { method: 'Radial Velocity' }, false], ['transit-find', { method: 'Transit Timing Variations' }, false],
  ['wobble-find', { method: 'Radial Velocity' }, true], ['wobble-find', { method: 'Transit' }, false],
  ['imaged', { method: 'Imaging' }, true], ['imaged', { method: 'Transit' }, false],
  ['lensed', { method: 'Microlensing' }, true], ['lensed', { method: undefined }, false],
  ['timed', { method: 'Pulsar Timing' }, true], ['timed', { method: 'Eclipse Timing Variations' }, true], ['timed', { method: 'Transit Timing Variations' }, true], ['timed', { method: 'Transit' }, false],
  ['pinpointed', { method: 'Astrometry' }, true], ['pinpointed', { method: 'Transit' }, false],
  ['sun-like-host', { spec: 'G2 V' }, true], ['sun-like-host', { spec: 'K2 V' }, false], ['sun-like-host', { spec: null }, false], ['sun-like-host', { spec: '  ' }, false],
  ['red-dwarf-host', { spec: 'M3 V' }, true], ['red-dwarf-host', { spec: 'G2 V' }, false],
  ['hot-host', { spec: 'A0 V' }, true], ['hot-host', { spec: 'B2' }, true], ['hot-host', { spec: 'O5' }, true], ['hot-host', { spec: 'F5' }, false],
];

export function poolChecks(raw, pool, ok) {
  const ms = raw.members;
  ok('planet names are unique', new Set(ms.map((m) => m.id)).size === pool.n);
  ok('every planet has a host, year, method and facility', ms.every((m) => m.host && m.method && m.facility && Number.isInteger(m.year) && m.year >= 1988 && m.year <= +raw.meta.capturedAt.slice(0, 4)));
  ok('measurements are positive or unknown', ms.every((m) => ['period', 'radius', 'mass', 'temp', 'dist'].every((k) => m[k] === null || (typeof m[k] === 'number' && m[k] > 0))));
  ok('no planet is dated after the capture date', ms.every((m) => m.year <= +raw.meta.capturedAt.slice(0, 4)));
  ok('the pool is large enough to be a game (>= 1000)', pool.n >= 1000);
}
