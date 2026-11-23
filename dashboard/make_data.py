# Builds dashboard/data.js from the two prepared tables, so the dashboard uses the same numbers as the notebooks.

# Run from the repo folder:  python dashboard/make_data.py

import glob
import json
from pathlib import Path

import pandas as pd

unmet = pd.read_csv(sorted(glob.glob("data/prepared/unmet_need_by_reason*.csv"))[-1])
waiting = pd.read_csv(sorted(glob.glob("data/prepared/waiting_list_national*.csv"))[-1], parse_dates=["snapshot"])

# ---------- the survey (Eurostat): Ireland and the EU average, 2016 to 2025 ----------
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

# the years Eurostat flags as a break in Ireland's series
breaks = unmet[(unmet["group"] == "Ireland") & (unmet["is_break"])]["year"].unique().tolist()
survey["break_years"] = sorted(int(y) for y in breaks)

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

# ---------- the waiting list (NTPF) ----------
total = waiting.groupby("snapshot")["people"].sum()  # people on the list at each snapshot

# one value for each month from January 2019 to September 2026, empty (null) where there is no snapshot (June 2021)
by_month = total.groupby(total.index.to_period("M")).last()
months = pd.period_range(by_month.index.min(), by_month.index.max(), freq="M")
monthly = [None if m not in by_month.index else round(float(by_month[m]) / 1000, 1) for m in months]

# yearly average of the list, 2019 to 2025 (2026 has nine months only)
yearly = total.groupby(total.index.year).mean()
list_yearly = {"years": list(range(2019, 2026)), "avg": [round(float(yearly[y]) / 1000, 1) for y in range(2019, 2026)]}

# yearly average of each waiting-time band, in thousands, for four chosen years
bands = ["0-6 months", "6-12 months", "12-18 months", "18+ months"]
band_years = [2019, 2021, 2024, 2026]
waiting["year"] = waiting["snapshot"].dt.year
per_snapshot = waiting.groupby(["year", "snapshot", "band"])["people"].sum()
band_avg = per_snapshot.groupby(["year", "band"]).mean().unstack()[bands] / 1000
band_table = {
    "bands": bands,
    "years": band_years,
    "values": {str(y): [round(float(v), 1) for v in band_avg.loc[y]] for y in band_years},
}

waiting_list = {
    "first": int(total.iloc[0]),
    "last": int(total.iloc[-1]),
    "months": [str(m) for m in months],
    "monthly": monthly,
    "yearly": list_yearly,
    "bands": band_table,
}

data = {"survey": survey, "ranking": ranking, "rank": rank, "list": waiting_list}
Path("dashboard/data.js").write_text("const DATA = " + json.dumps(data, separators=(",", ":")) + ";\n", encoding="utf-8")
print("saved dashboard/data.js | Ireland's rank:", rank, "| break years:", survey["break_years"], "| months:", len(months))
