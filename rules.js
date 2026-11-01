// ExoRNG badge rules. Each rule is a deterministic predicate over known fields: a value the archive does not have never matches.
// test(m, poolDate) and evidence(m, poolDate) read the prepared member from prep().

export const norm = (s) => s.normalize('NFKC').toLowerCase();

const pos = (x) => (typeof x === 'number' && Number.isFinite(x) && x > 0 ? x : null); // zero or absent is unknown, never a real value
const int = (x) => (Number.isInteger(x) && x > 0 ? x : null);
const f = (n) => Number(n.toPrecision(4)).toLocaleString('en');

export function prep(raw) {
  return {
    ...raw,
    year: Number.isInteger(raw.year) && raw.year >= 1988 ? raw.year : null,
    period: pos(raw.period), radius: pos(raw.radius), mass: pos(raw.mass), temp: pos(raw.temp), dist: pos(raw.dist),
    planets: int(raw.planets), stars: int(raw.stars),
    how: typeof raw.method === 'string' ? norm(raw.method) : null, // discovery method, normalized
    cls: typeof raw.spec === 'string' && raw.spec.trim() ? norm(raw.spec.trim())[0] : null, // spectral class letter
  };
}

const yr = (m) => `${m.id} was found in ${m.year}`;
const rad = (m) => `${m.id} has a radius of ${f(m.radius)} Earth radii`;
const per = (m) => `${m.id} orbits in ${f(m.period)} days`;
const sys = (m) => `${m.id} has ${m.planets} known planets in its system`;
const via = (m) => `${m.id} was found by ${m.method} at ${m.facility}`;
const host = (m) => `${m.id} orbits ${m.host}, spectral type ${m.spec}`;

export const RULES = [
  { id: 'first-decade', name: 'First Decade', family: 'Discovery era', rule: 'Discovered in 2002 or earlier (the first confirmed planets date from 1992)',
    test: (m) => m.year !== null && m.year <= 2002, evidence: yr },
  { id: 'pioneer', name: 'Pioneer', family: 'Discovery era', rule: 'Discovered in 2005 or earlier',
    test: (m) => m.year !== null && m.year <= 2005, evidence: yr },
  { id: 'earth-sized', name: 'Earth-Sized', family: 'Size', rule: 'Radius from 0.8 to 1.25 Earth radii',
    test: (m) => m.radius !== null && m.radius >= 0.8 && m.radius <= 1.25, evidence: rad },
  { id: 'super-earth', name: 'Super-Earth', family: 'Size', rule: 'Radius above 1.25 and up to 2 Earth radii',
    test: (m) => m.radius !== null && m.radius > 1.25 && m.radius <= 2, evidence: rad },
  { id: 'giant', name: 'Giant', family: 'Size', rule: 'Radius of 8 Earth radii or more (about 0.7 Jupiter)',
    test: (m) => m.radius !== null && m.radius >= 8, evidence: rad },
  { id: 'inflated-giant', name: 'Inflated Giant', family: 'Size', rule: 'Radius of 15 Earth radii or more (about 1.3 Jupiter)',
    test: (m) => m.radius !== null && m.radius >= 15, evidence: rad },
  { id: 'ultra-short-year', name: 'Ultra-Short Year', family: 'Orbit', rule: 'Orbital period under 1 day',
    test: (m) => m.period !== null && m.period < 1, evidence: per },
  { id: 'long-year', name: 'Long Year', family: 'Orbit', rule: 'Orbital period of 1,000 days or more',
    test: (m) => m.period !== null && m.period >= 1000, evidence: per },
  { id: 'very-long-year', name: 'Very Long Year', family: 'Orbit', rule: 'Orbital period of 10,000 days or more (about 27 Earth years)',
    test: (m) => m.period !== null && m.period >= 10000, evidence: per },
  { id: 'hot-giant', name: 'Hot Giant', family: 'Hot giant', rule: 'Radius of 8 Earth radii or more and an orbital period under 10 days',
    test: (m) => m.radius !== null && m.period !== null && m.radius >= 8 && m.period < 10, evidence: (m) => `${m.id} is ${f(m.radius)} Earth radii and orbits in ${f(m.period)} days` },
  { id: 'light-world', name: 'Light World', family: 'Mass', rule: 'Measured mass under 1 Earth mass',
    test: (m) => m.mass !== null && m.mass < 1, evidence: (m) => `${m.id} has a mass of ${f(m.mass)} Earth masses` },
  { id: 'heavyweight', name: 'Heavyweight', family: 'Mass', rule: 'Measured mass of 3,000 Earth masses or more (about 9.4 Jupiter)',
    test: (m) => m.mass !== null && m.mass >= 3000, evidence: (m) => `${m.id} has a mass of ${f(m.mass)} Earth masses` },
  { id: 'temperate', name: 'Temperate', family: 'Climate', rule: 'Equilibrium temperature from 200 to 320 K (a model value, not a claim about habitability)',
    test: (m) => m.temp !== null && m.temp >= 200 && m.temp <= 320, evidence: (m) => `${m.id} has an equilibrium temperature of ${f(m.temp)} K` },
  { id: 'scorched', name: 'Scorched', family: 'Climate', rule: 'Equilibrium temperature of 2,000 K or more',
    test: (m) => m.temp !== null && m.temp >= 2000, evidence: (m) => `${m.id} has an equilibrium temperature of ${f(m.temp)} K` },
  { id: 'nearby', name: 'Nearby', family: 'Distance', rule: 'Host star within 10 parsecs (32.6 light-years)',
    test: (m) => m.dist !== null && m.dist < 10, evidence: (m) => `${m.host} is ${f(m.dist)} parsecs away` },
  { id: 'deep-field', name: 'Deep Field', family: 'Distance', rule: 'Host star 1,000 parsecs or more away (3,260 light-years)',
    test: (m) => m.dist !== null && m.dist >= 1000, evidence: (m) => `${m.host} is ${f(m.dist)} parsecs away` },
  { id: 'crowded-system', name: 'Crowded System', family: 'System', rule: 'Five or more known planets in the system',
    test: (m) => m.planets !== null && m.planets >= 5, evidence: sys },
  { id: 'full-house', name: 'Full House', family: 'System', rule: 'Seven or more known planets in the system',
    test: (m) => m.planets !== null && m.planets >= 7, evidence: sys },
  { id: 'binary-host', name: 'Binary Host', family: 'Stars', rule: 'The system has two or more stars',
    test: (m) => m.stars !== null && m.stars >= 2, evidence: (m) => `${m.id} is in a system with ${m.stars} stars` },
  { id: 'transit-find', name: 'Transit Find', family: 'Method', rule: 'Discovered by the transit method',
    test: (m) => m.how === 'transit', evidence: via },
  { id: 'wobble-find', name: 'Wobble Find', family: 'Method', rule: 'Discovered by the radial velocity method',
    test: (m) => m.how === 'radial velocity', evidence: via },
  { id: 'imaged', name: 'Imaged', family: 'Method', rule: 'Discovered by direct imaging',
    test: (m) => m.how === 'imaging', evidence: via },
  { id: 'lensed', name: 'Lensed', family: 'Method', rule: 'Discovered by gravitational microlensing',
    test: (m) => m.how === 'microlensing', evidence: via },
  { id: 'timed', name: 'Timed', family: 'Method', rule: 'Discovered from timing variations (pulsar, eclipse, transit or pulsation timing)',
    test: (m) => m.how !== null && m.how.includes('timing'), evidence: via },
  { id: 'pinpointed', name: 'Pinpointed', family: 'Method', rule: 'Discovered by astrometry',
    test: (m) => m.how === 'astrometry', evidence: via },
  { id: 'sun-like-host', name: 'Sun-Like Host', family: 'Host star', rule: 'Host star spectral class G',
    test: (m) => m.cls === 'g', evidence: host },
  { id: 'red-dwarf-host', name: 'Red Dwarf Host', family: 'Host star', rule: 'Host star spectral class M',
    test: (m) => m.cls === 'm', evidence: host },
  { id: 'hot-host', name: 'Hot Host', family: 'Host star', rule: 'Host star spectral class O, B or A',
    test: (m) => m.cls === 'o' || m.cls === 'b' || m.cls === 'a', evidence: host },
];
