# ExoRNG

A daily exoplanet discovery game: roll once per UTC day, draw one confirmed planet from the NASA Exoplanet Archive, and see which badges make it unusual. A sibling of CinemaRNG and BrickRNG, built on the same engine from the RNGdle-style plans.

**This is a prototype with real data.** The planets and their measurements are a snapshot of the [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu) composite planetary table (`data/pool-v1.json`, rebuilt by `tools/build_pool.py`). A value the archive lacks is unknown and never earns a badge. There is no backend, so results live in the player's browser. Unofficial fan project, not affiliated with NASA, Caltech or IPAC.

*This research has made use of the NASA Exoplanet Archive, which is operated by the California Institute of Technology, under contract with the National Aeronautics and Space Administration under the Exoplanet Exploration Program.*

## What is built

| Area | Status |
| --- | --- |
| Daily roll, unbiased secure draw, one per UTC day, retry-safe | Done, browser-local (the day comes from the host's `Date` header, not the device clock) |
| 28 badge rules, families, RP = 100 / p, overall rarity tiers, tie rules | Done, tested in `rules.js` |
| Animated reveal (name reel, count-up, rarity pulse and burst), skippable, reduced-motion aware | Done |
| Hundreds to thousands of achievements derived from your rolls, with goals scaled to the pool size | Done (`achievements.js`) |
| Badge catalog, badge pages, levels, history, export, delete, pool page | Done |
| Sign-in, ranked limit, leaderboards, friends, hearts, poems, Discord, moderation | Needs a server |

## Run it

No build step.

```
python -m http.server 8765
```

Open <http://localhost:8765>. Open `/check.html` for the self-check; its title becomes `PASS` or `FAIL n`.

## Layout

- `engine.js` and `achievements.js` generic scoring, tiers, sampling, day helpers and achievements (shared with sibling RNG games)
- `rules.js` this game's badge rules; `site.js` its names, copy, art and shelves; `fixtures.js` rule fixtures for `check.html`
- `app.js`, `index.html`, `style.css` the site (hash routes, so it works on any static host)
- `data/pool-v1.json` the published pool; `tools/build_pool.py` rebuilds it from NASA

## Publishing

GitHub Pages serves the repository root from `main`. Push to `main` to update the site.
