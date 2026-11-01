#!/usr/bin/env python3
"""Build data/pool-v1.json from the NASA Exoplanet Archive: a snapshot of every confirmed planet.

Source: the archive's composite-parameters table (pscomppars, one row per confirmed planet) via its public TAP service.
Kept: every planet with a known name, host star, discovery year, discovery method and facility. Measurements that the
archive does not have (radius, mass, temperature...) stay unknown (null) and never satisfy a badge. A rerun gives a newer snapshot.

Usage: python tools/build_pool.py   (network; one request)
"""
import csv
import datetime as dt
import io
import json
import pathlib
import urllib.parse
import urllib.request

UA = "ExoRNG-fan-prototype/0.1 (https://github.com/sharkjujg/exorng)"
COLS = "pl_name,hostname,disc_year,discoverymethod,disc_facility,pl_orbper,pl_rade,pl_bmasse,pl_eqt,sy_dist,sy_pnum,sy_snum,st_spectype"
URL = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?" + urllib.parse.urlencode({"query": f"select {COLS} from pscomppars", "format": "csv"})

req = urllib.request.Request(URL, headers={"User-Agent": UA})
with urllib.request.urlopen(req, timeout=120) as r:
    rows = list(csv.DictReader(io.StringIO(r.read().decode("utf-8"))))
print(len(rows), "rows from the archive")


def num(x, digits=4):
    try:
        v = float(x)
    except (TypeError, ValueError):
        return None
    return round(v, digits) if v == v else None


members, dropped = [], 0
for row in rows:
    year = num(row["disc_year"], 0)
    if not (row["pl_name"] and row["hostname"] and year and row["discoverymethod"] and row["disc_facility"]):
        dropped += 1
        continue
    members.append({"id": row["pl_name"], "host": row["hostname"], "year": int(year), "method": row["discoverymethod"],
                    "facility": row["disc_facility"], "period": num(row["pl_orbper"]), "radius": num(row["pl_rade"]),
                    "mass": num(row["pl_bmasse"]), "temp": num(row["pl_eqt"], 1), "dist": num(row["sy_dist"]),
                    "planets": int(num(row["sy_pnum"], 0) or 0) or None, "stars": int(num(row["sy_snum"], 0) or 0) or None,
                    "spec": row["st_spectype"].strip() or None})
members.sort(key=lambda m: (m["year"], m["id"]))
n = len(members)
today = dt.datetime.now(dt.timezone.utc).date().isoformat()


def coverage(field):
    return f"known for {sum(m[field] is not None for m in members):,} of {n:,}; unknown values never satisfy a badge"


meta = {"version": "v1", "publishedAt": today, "capturedAt": today,
        "source": "NASA Exoplanet Archive (https://exoplanetarchive.ipac.caltech.edu), table pscomppars",
        "provenance": f"Snapshot taken {today} by tools/build_pool.py. This research has made use of the NASA Exoplanet Archive, which is operated by the California Institute of Technology, under contract with the National Aeronautics and Space Administration under the Exoplanet Exploration Program.",
        "selection": f"Every confirmed planet in the archive's composite table with a known name, host star, discovery year, method and facility ({dropped} rows lacked one).",
        "fieldStatus": {"id": "known", "host": "known", "year": "known", "method": "known", "facility": "known",
                        **{f: coverage(f) for f in ("period", "radius", "mass", "temp", "dist", "planets", "stars", "spec")}}}
lines = ",\n".join("  " + json.dumps(m, ensure_ascii=False, separators=(",", ":")) for m in members)
out = '{"meta":' + json.dumps(meta, ensure_ascii=False) + ',\n"members":[\n' + lines + "\n]}\n"
path = pathlib.Path(__file__).resolve().parent.parent / "data" / "pool-v1.json"
path.parent.mkdir(exist_ok=True)
path.write_bytes(out.encode("utf-8"))
print(f"wrote {path}: {n} planets ({dropped} dropped)")
