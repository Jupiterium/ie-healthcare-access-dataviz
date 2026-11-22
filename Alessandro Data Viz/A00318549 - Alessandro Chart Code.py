# Chart 4: the waiting list and the survey (the same code as ListvsSurveyCharts.ipynb)
from pathlib import Path

import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.ticker import PercentFormatter

BASE_DIR = Path(__file__).resolve().parent.parent  # the repo folder, one level above this script
PREPARED = BASE_DIR / "data" / "prepared"
FIGURES = BASE_DIR / "figures"
FIGURES.mkdir(exist_ok=True)

ORANGE = "#eb6834"  # waiting
BLUE = "#2a78d6"    # cost
GREY = "#898781"    # EU average and background

unmet = pd.read_csv(PREPARED / "unmet_need_by_reason_v1_2026-11-11.csv")
waiting = pd.read_csv(PREPARED / "waiting_list_national_v1_2026-11-11.csv", parse_dates=["snapshot"])

# Step 1: yearly average of the waiting list
total = waiting.groupby("snapshot")["people"].sum() / 1000
yearly_list = total.groupby(total.index.year).mean().loc[2019:2025]
yearly_list.round(1)

# Step 2: the survey answer for Ireland
ie = unmet[(unmet["group"] == "Ireland") & (unmet["reason"] == "Waiting list")]
survey = ie.set_index("year")["pct"].loc[2019:2025]
survey

# Step 3: check the numbers against the guide
assert round(yearly_list[2019] * 1000) == 555628
assert round(yearly_list[2021] * 1000) == 636015
assert round(yearly_list[2024] * 1000) == 585630
assert round(yearly_list[2025] * 1000) == 602124
assert [survey[y] for y in (2019, 2021, 2024, 2025)] == [1.0, 2.0, 2.7, 2.1]
print("All checks passed")

# Step 4: how often did they move the same way?
same = (yearly_list.diff().dropna() > 0) == (survey.diff().dropna() > 0)
print(same.to_string())
print(f"Same direction in {same.sum()} of {len(same)} year changes")

# Step 5: the chart
years = list(range(2019, 2026))

fig, (top, bottom) = plt.subplots(2, 1, sharex=True, figsize=(8, 6.2))  # two panels, one shared year axis

top.plot(years, yearly_list, color=ORANGE, marker="o", linewidth=3)
top.set_title("People on the outpatient waiting list (yearly average)", fontsize=11)
top.set_ylim(500, 700)
top.set_yticks(range(500, 701, 25))
top.set_yticklabels([f"{v}k" for v in range(500, 701, 25)])

bottom.plot(years, survey, color=ORANGE, marker="o", linewidth=3)
bottom.set_title("Went without care because of waiting, Ireland (% of people aged 16+)", fontsize=11)
bottom.set_ylim(0, 3)
bottom.set_yticks([0, 0.5, 1, 1.5, 2, 2.5, 3])
bottom.yaxis.set_major_formatter(PercentFormatter(decimals=1))
bottom.set_xticks(years)

for ax in (top, bottom):
    ax.grid(axis="y", color="#efefef", linewidth=0.6)
    ax.set_axisbelow(True)
    ax.spines[["top", "right"]].set_visible(False)
    ax.tick_params(labelsize=9)

fig.text(
    0.01,
    0.95,
    "The waiting list and the survey answer, 2019 to 2025",
    fontsize=14,
    fontweight="bold",
    ha="left",
)
fig.text(
    0.01,
    0.905,
    "Both are higher in 2025 than in 2019, but they did not move the same way every year.",
    fontsize=10.5,
    ha="left",
)
fig.text(
    0.01,
    0.015,
    "Source: NTPF outpatient waiting list open data and Eurostat EU-SILC (hlth_silc_08)",
    fontsize=9,
    color=GREY,
    ha="left",
)
fig.subplots_adjust(top=0.84, bottom=0.1, left=0.1, right=0.97, hspace=0.4)
fig.savefig(FIGURES / "chart4_list_and_survey.png", dpi=200)
plt.show()
