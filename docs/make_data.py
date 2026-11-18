# Builds docs/data.js from the prepared Eurostat table, so the report page uses the same numbers as the notebook.

# Run from the repo folder:  python docs/make_data.py

import glob
import json
from pathlib import Path

import pandas as pd

unmet = pd.read_csv(sorted(glob.glob("data/prepared/unmet_need_by_reason*.csv"))[-1])

# Ireland and the EU average, 2016 to 2025
years = list(range(2016, 2026))


def series(group, reason):
    table = unmet[(unmet["group"] == group) & (unmet["reason"] == reason)].set_index("year")["pct"]
    return [round(float(table[y]), 1) for y in years]


survey = {
    "years": years,
    "ie_waiting": series("Ireland", "Waiting list"),
    "ie_cost": series("Ireland", "Too expensive"),
    "eu_waiting": series("EU average", "Waiting list"),
    "eu_cost": series("EU average", "Too expensive"),
}

# ranking for 2025, highest first
ranking = {}
for reason in ["Waiting list", "Too expensive"]:
    t = unmet[(unmet["year"] == 2025) & (unmet["reason"] == reason)].sort_values("pct", ascending=False)
    ranking[reason] = [{"area": r.area, "group": r.group, "pct": round(float(r.pct), 1)} for r in t.itertuples()]

# the rank of Ireland among the 27 countries (without the EU average)
rank = {}
for reason, rows in ranking.items():
    countries = [r for r in rows if r["group"] != "EU average"]
    rank[reason] = [r["area"] for r in countries].index("Ireland") + 1

data = {"survey": survey, "ranking": ranking, "rank": rank}
Path("docs/data.js").write_text("const DATA = " + json.dumps(data, separators=(",", ":")) + ";\n", encoding="utf-8")
print("saved docs/data.js | Ireland's rank:", rank)
