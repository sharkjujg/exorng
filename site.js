// Everything specific to ExoRNG: names, copy, card art, and which facts the result card shows. app.js is generic.
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fmt = (n) => n.toLocaleString('en');
const sig = (n) => fmt(Number(n.toPrecision(4)));
const hash = (s) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
const unknown = 'not in the archive';
const STAR = { o: '#9bb7ff', b: '#aabfff', a: '#e8eeff', f: '#fff6e0', g: '#ffe27a', k: '#ffb15c', m: '#ff7a5c' };
const band = (x, cuts) => cuts.find(([max]) => x < max)[1];

export default {
  key: 'exorng',
  name: 'ExoRNG',
  pageTitle: 'ExoRNG: a daily exoplanet discovery game',
  noun: 'planet', nouns: 'planets', thing: 'Planet',
  worldNote: 'every planet in the galaxy',
  repo: 'https://github.com/sharkjujg/exorng',
  headline: 'Discover a world. Once a day.',
  intro: (n) => `Roll once to draw one confirmed exoplanet from a pool of <b>${fmt(n)}</b>. Every planet has the same 1-in-${fmt(n)} chance, famous or obscure. Badges explain what is unusual about it, and rarer badges earn more rarity points (RP). The daily limit resets at 00:00 UTC.`,
  notice: 'Prototype: the planets and measurements are real (NASA Exoplanet Archive), but there are no accounts yet and your results are saved only in this browser. <a href="#/about">What that means</a>',
  header: (m) => ({ title: m.id, sub: `Orbits ${m.host} · discovered ${m.year}` }),
  label: (m) => `${m.id} (${m.year})`,
  shelves: (m) => [
    ['Discovery year', String(m.year)], ['Decade', `${Math.floor(m.year / 10) * 10}s`], ['Method', m.method], ['Facility', m.facility],
    ...(m.radius ? [['Size', band(m.radius, [[0.8, 'Smaller than Earth'], [1.25, 'Earth-sized'], [2, 'Super-Earth'], [6, 'Neptune-like'], [15, 'Giant'], [Infinity, 'Inflated giant']])]] : []),
    ...(m.period ? [['Orbit', band(m.period, [[1, 'Under 1 day'], [10, '1 to 10 days'], [100, '10 to 100 days'], [1000, '100 to 1,000 days'], [Infinity, 'Over 1,000 days']])]] : []),
    ...(m.dist ? [['Distance', band(m.dist, [[10, 'Within 10 parsecs'], [100, '10 to 100 parsecs'], [500, '100 to 500 parsecs'], [1000, '500 to 1,000 parsecs'], [Infinity, 'Over 1,000 parsecs']])]] : []),
    ...(m.spec ? [['Host star class', `Class ${m.spec.trim()[0].toUpperCase()}`]] : []),
    ...(m.planets ? [['Planets in system', m.planets >= 5 ? '5 or more' : m.planets >= 3 ? '3 or 4' : String(m.planets)]] : []),
    ...(m.planets >= 3 ? [['Star system', m.host]] : []),
  ],
  facts: (m) => [
    ['Host star', `${m.host}${m.spec ? ` (spectral type ${m.spec})` : ''}`],
    ['Discovered', `${m.year}, by ${m.method.toLowerCase()} (${m.facility})`],
    ['Orbital period', m.period ? `${sig(m.period)} days` : unknown],
    ['Radius', m.radius ? `${sig(m.radius)} Earth radii (${sig(m.radius / 11.209)} Jupiter)` : unknown],
    ['Mass', m.mass ? `${sig(m.mass)} Earth masses (${sig(m.mass / 317.8)} Jupiter)` : unknown],
    ['Equilibrium temperature', m.temp ? `${sig(m.temp)} K (a model value)` : unknown],
    ['Distance', m.dist ? `${sig(m.dist * 3.2616)} light-years (${sig(m.dist)} parsecs)` : unknown],
    ['System', m.planets ? `${m.planets} known planet${m.planets === 1 ? '' : 's'}, ${m.stars ?? '?'} star${m.stars === 1 ? '' : 's'}` : unknown],
    ['Source', 'NASA Exoplanet Archive', `https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(m.id)}`],
  ],
  art(m) { // original orbit diagram: the star's color follows its spectral class, the orbit's size follows the period; it never affects scoring
    const h = hash(m.id), cls = m.spec ? m.spec.trim()[0].toLowerCase() : '', star = STAR[cls] || '#d8d8e8';
    const orbit = 16 + 30 * Math.min(1, Math.max(0, (Math.log10(m.period || 10) + 1) / 5));
    const ang = ((h % 360) * Math.PI) / 180, pr = 2.2 + Math.min(5, m.radius ? Math.log2(1 + m.radius) * 1.3 : 2);
    const warm = m.temp ? Math.max(0, Math.min(1, (m.temp - 200) / 1800)) : 0.4;
    const dots = Array.from({ length: 22 }, (_, i) => { const k = hash(m.id + i); return `<circle cx="${k % 100}" cy="${(k >>> 8) % 100}" r="${0.35 + ((k >>> 16) % 4) / 10}"/>`; }).join('');
    return `<svg class="avatar" viewBox="0 0 100 100" role="img" aria-label="Generated orbit diagram for the planet. Not a picture of the planet.">
      <rect width="100" height="100" rx="8" fill="#0b1026"/><g fill="#ffffff" opacity=".7">${dots}</g>
      <circle cx="50" cy="50" r="${orbit}" fill="none" stroke="#6f7bb5" stroke-width=".8" stroke-dasharray="2 2"/>
      <circle cx="50" cy="50" r="7" fill="${star}"/><circle cx="50" cy="50" r="11" fill="${star}" opacity=".18"/>
      <circle cx="${50 + orbit * Math.cos(ang)}" cy="${50 + orbit * Math.sin(ang)}" r="${pr}" fill="hsl(${210 - warm * 190} 70% 62%)"/>
      <text x="50" y="94" text-anchor="middle" font-family="system-ui,sans-serif" font-size="6" letter-spacing=".6" fill="#9aa5d6">ORBIT DIAGRAM</text></svg>`;
  },
  poolNotice: 'Every planet and measurement comes from the <a href="https://exoplanetarchive.ipac.caltech.edu">NASA Exoplanet Archive</a> (public NASA data), as a snapshot. A measurement the archive does not have is shown as unknown and never earns a badge. Odds describe this pool of known planets: discovery methods favor certain kinds of worlds, so it says nothing about the galaxy at large.',
  poolExtra(pool) {
    const tally = (get) => { const c = new Map(); for (const m of pool.members) for (const v of get(m)) c.set(v, (c.get(v) || 0) + 1); return [...c]; };
    const table = (title, rows) => `<table><thead><tr><th>${title}</th><th class="n">Planets</th></tr></thead><tbody>${rows.map(([k, v]) => `<tr><td>${esc(k)}</td><td class="n">${fmt(v)}</td></tr>`).join('')}</tbody></table>`;
    const top = (rows, k) => rows.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, k);
    return `<h2>What is in the pool</h2><p class="small muted">Disclosed because a badge is only rare relative to this mix.</p>
      ${table('Discovery method', top(tally((m) => [m.method]), 12))}${table('Discovery decade', tally((m) => [`${Math.floor(m.year / 10) * 10}s`]).sort((a, b) => a[0].localeCompare(b[0])))}${table('Top discovery facilities', top(tally((m) => [m.facility]), 8))}`;
  },
  aboutData: `<h2>Where the data comes from</h2>
    <p>Orbital period, radius, mass, equilibrium temperature, distance, system size, discovery year, method, facility and host spectral type come from the NASA Exoplanet Archive's composite planetary table, fetched once as a snapshot. This research has made use of the NASA Exoplanet Archive, which is operated by the California Institute of Technology, under contract with the National Aeronautics and Space Administration under the Exoplanet Exploration Program. A value the archive lacks is treated as unknown, never as zero. The "temperate" badge uses a modelled equilibrium temperature and says nothing about whether a planet could support life. The artwork is a generated diagram, not an image of the planet.</p>`,
  terms: 'It is not affiliated with, sponsored or endorsed by NASA, Caltech or IPAC. The facts are the archive\'s; any errors in the snapshot or in the badges are this prototype\'s. Badges describe catalog measurements, not scientific importance.',
};
