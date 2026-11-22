from pathlib import Path

import pandas as pd
import matplotlib.pyplot as plt

BASE_DIR = Path(__file__).resolve().parent
PREPARED = BASE_DIR / "data" / "prepared"
FIGURES = BASE_DIR / "figures"
FIGURES.mkdir(parents=True, exist_ok=True)

ORANGE = "#eb6834"  # waiting
BLUE = "#2a78d6"    # cost
GREY = "#898781"    # EU average and background

unmet_path = PREPARED / "unmet_need_by_reason_v1_2026-11-11.csv"
waiting_path = PREPARED / "waiting_list_national_v1_2026-11-11.csv"
missing = [str(path) for path in (unmet_path, waiting_path) if not path.is_file()]
if missing:
    raise FileNotFoundError(
        "Required data file(s) not found:\n- " + "\n- ".join(missing)
    )

unmet = pd.read_csv(unmet_path)
waiting = pd.read_csv(waiting_path, parse_dates=["snapshot"])

total = waiting.groupby("snapshot")["people"].sum() / 1000
yearly_list = total.groupby(total.index.year).mean().loc[2019:2025]
yearly_list.round(1)

ie = unmet[(unmet["group"] == "Ireland") & (unmet["reason"] == "Waiting list")]
survey = ie.set_index("year")["pct"].loc[2019:2025]
breaks = ie.set_index("year")["is_break"].loc[2019:2025]
survey

assert round(yearly_list[2019] * 1000) == 555628
assert round(yearly_list[2021] * 1000) == 636015
assert round(yearly_list[2024] * 1000) == 585630
assert round(yearly_list[2025] * 1000) == 602124
assert [survey[y] for y in (2019, 2021, 2024, 2025)] == [1.0, 2.0, 2.7, 2.1]
print("All checks passed")

same = (yearly_list.diff().dropna() > 0) == (survey.diff().dropna() > 0)
print(same.to_string())
print(f"Same direction in {same.sum()} of {len(same)} year changes")


fig, (top, bottom) = plt.subplots(2, 1, sharex=True, figsize=(8, 5.5))
fig.suptitle("The waiting list and the survey answer moved the same way\noverall, but not every year",
             x=0.01, ha="left", fontsize=13, fontweight="bold", y=0.99)

# top: list
top.plot(yearly_list.index, yearly_list.values, color=ORANGE, marker="o", lw=2.2)
top.set_ylim(530, 670); top.set_ylabel("Waiting list\n(thousands of people)", fontsize=9)
for y, v in yearly_list.items():
    top.annotate(f"{v:.0f}", (y, v), textcoords="offset points", xytext=(0, 8), ha="center", fontsize=8, color="#333")
top.annotate("List peaks in 2021", (2021, yearly_list[2021]), xytext=(2022.0, 658), fontsize=8.5,
             color=ORANGE, fontweight="bold", arrowprops=dict(arrowstyle="-", color=ORANGE, lw=0.8))
top.text(0.995, 0.04, "y-axis starts at 530", transform=top.transAxes, ha="right", fontsize=7.5, color=GREY)

# bottom: survey, hollow markers for break years
bottom.plot(survey.index, survey.values, color=ORANGE, lw=2.2, zorder=2)
for y, v in survey.items():
    hollow = bool(breaks[y])
    bottom.plot(y, v, "o", ms=7, mfc="white" if hollow else ORANGE, mec=ORANGE, mew=2, zorder=3)
    bottom.annotate(f"{v:.1f}%", (y, v), textcoords="offset points", xytext=(0, 8), ha="center", fontsize=8, color="#333")
bottom.annotate("Survey answer peaks in 2024", (2024, survey[2024]), xytext=(2021.3, 2.95), fontsize=8.5,
                color=ORANGE, fontweight="bold", arrowprops=dict(arrowstyle="-", color=ORANGE, lw=0.8))
bottom.text(2019.05, 0.2, "Hollow points: break in the survey series", fontsize=7.5, color=GREY)
bottom.set_ylim(0, 3.3); bottom.set_ylabel("Went without care because\nof waiting (% of people 16+)", fontsize=9)
bottom.yaxis.set_major_formatter(lambda v, _: f"{v:.0f}%")
bottom.set_xticks(range(2019, 2026)); bottom.set_xlabel("Year (yearly average for the list; survey value for the answer)", fontsize=8.5)

for ax in (top, bottom):
    ax.spines[["top", "right"]].set_visible(False); ax.grid(axis="y", color="#e5e4e0", lw=0.6); ax.tick_params(labelsize=8.5)

fig.text(0.01, 0.012,
 "Source: NTPF outpatient waiting list open data; Eurostat EU-SILC (hlth_silc_08), accessed Nov 2026. Different measures: the list covers hospital outpatients,\n"
 "the survey covers all medical care. Shows direction, not cause. 2021 averages 11 snapshots (June missing). Stops at 2025: 2026 has only nine months\n"
 "(its average so far, about 666,000, is higher than 2021).", fontsize=6.6, color=GREY, va="bottom")
fig.tight_layout(rect=(0, 0.085, 1, 0.95))
fig.savefig(FIGURES / "chart4_list_and_survey.png", dpi=200)
plt.show()
