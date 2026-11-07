# Stakeholder, Audience, and Data Audit

## Audience Brief (Part A)

### Stakeholder

*Who has an interest in the problem?*

| Stakeholder | Interest in the problem |
| --- | --- |
| People living in Ireland who need care | Is it waiting or cost that more often stops people getting care? |
| Department of Health and HSE planners | Where people are going without care, and whether waiting lists are part of the reason. |
| Patient advocacy groups | Evidence to support their campaigns. |
| Researchers and journalists | Reliable, comparable figures on waiting lists and unmet need. |

Stakeholders and audience are not the same. These groups care about the findings but already work with more detailed data than ours. The audience below is who will actually read our visualisations.

### Primary Audience

*Who will view the final visualisation?*

Students, journalists who cover health or the cost of living, and the general public. None of them need a statistics background. Journalists read quickly and want one clear finding they can repeat. Students can take more time.

### Audience Knowledge

*What do they already understand?*

From the news they know that hospital waiting lists are long and that healthcare can be expensive. They probably do not know:

- that a survey asks people why they went without care, and that waiting and cost are two of the answers
- that the share of people who say "waiting" has gone up in Ireland since 2016, while the share who say "cost" has gone down
- how Ireland compares with the EU average
- that these are small percentages, so small changes need care

### Audience Goals

*What do they want to know?*

| They want to know | Project question |
| --- | --- |
| Do people in Ireland go without care more because of waiting or because of cost, and has that changed since 2016? | Q1 The shift (change) |
| Is Ireland different from the EU average? | Q2 Ireland vs. the EU (compare) |
| Does the hospital waiting list move together with the share of people who say waiting stopped them? | Q3 Waiting list and survey (relate) |

### Possible Decisions

*What might they do with the information?*

Raise awareness, inform public discussion, and help planners and patient groups see whether waiting or cost is the bigger problem today.

### Visualization Constraints

- **Technical knowledge:** plain language and simple charts, with no statistical jargon.
- **Viewing time:** the main finding should be clear in a few seconds.
- **Device:** readable on a computer and on a phone.
- **Presentation context:** suitable for a news-style report or a presentation.
- **Explanation needed:** clear titles, labels and legends, and a short note on sources and limits. Say that the data show relationships, not causes.

---

## Data Audit (Part B)

We audited two sources. Every number below comes from the notebook `Data_Audit_Pandas_v4.ipynb`, which also builds the two prepared tables and stops if a number stops matching the data. Each source has one table that follows the audit checklist, then a small preview of its prepared data.

We kept the data small on purpose: official publishers only, all ages together, Ireland and the EU average, and no split by income or hospital, as in the proposal scope.

**Variable types:** Q quantitative, O ordinal, N nominal, T temporal, G geographical.

### 1. Eurostat: unmet need for medical care

The share of people who needed a medical examination and did not get one, by main reason. Code: notebook section 1.

| Audit item | What we found |
| --- | --- |
| **Source** | Eurostat dataset `hlth_silc_08` [1], from the EU-SILC survey. Pulled through the Eurostat API. |
| **Row is** | One area, year and reason (Ireland or the EU27 average, 2016 to 2025, too expensive or waiting list). 40 rows. |
| **Key variables** | area (G), year (T), reason (N), pct (Q), flag (N). |
| **Missing** | None. |
| **Duplicates** | None, one value for each area, year and reason. |
| **Unusual values** | Four Irish values (2019 and 2020) are flagged as a break in the series, which means the survey method changed. The EU average cost value for 2016 (1.9%) is much higher than 2017 (1.0%), with no flag and no explanation that we found. |
| **Cleaning** | Keep the two reasons, all ages, Ireland and the EU average, and 2016 to 2025. Keep the flags. Nothing was removed. |
| **Transformations** | Turn the wide table (one column per year) into one row per year, split each cell into its number and flag, give areas and reasons readable names, and add a column marking the break years. |
| **Aggregation** | None. Eurostat already gives yearly percentages. |
| **Assumptions** | The answers are self-reported, so people who never tried to get care are missed. The percentages are small (Ireland never above 2.7%), so single years can move by a few tenths. Break years are marked on the charts. We still have to confirm whether the percentage is of all people or only of those who needed care [2]. |

**Preview of the prepared table**

| area | year | reason | pct | flag |
| --- | ---: | --- | ---: | --- |
| Ireland | 2016 | Too expensive | 1.5 | |
| Ireland | 2016 | Waiting list | 1.0 | |
| Ireland | 2019 | Waiting list | 1.0 | b |
| Ireland | 2025 | Too expensive | 0.6 | |
| Ireland | 2025 | Waiting list | 2.1 | |
| EU27 average | 2025 | Waiting list | 1.2 | |

### 2. NTPF: outpatient waiting list

Monthly snapshots of the people waiting for a first outpatient appointment at a public hospital. The files come in two layouts. Code: notebook section 2.

| Audit item | What we found |
| --- | --- |
| **Source** | NTPF open data [3]. Nine CSV files saved from the NTPF website (its server does not allow downloads from Python). The latest snapshot is 24 Sep 2026. NTPF publishes how many people are waiting, not how many were treated. |
| **Row is** | Jan 2019 to Mar 2021 (27 snapshots): one snapshot, hospital, specialty, age profile and 3-month waiting band. Apr 2021 to Sep 2026 (65 snapshots): one snapshot, adult or child and specialty, with four 6-month waiting bands as columns. The prepared table has one row per snapshot and band (370 rows). |
| **Key variables** | snapshot (T), waiting-time band (O), people (Q). Hospital, specialty and adult or child (N) are only used to add up. |
| **Missing** | Two rows in the 2019 to 2021 files have no waiting band (2 people). No other counts are missing. |
| **Duplicates** | None in the hospital files. The 2025 and 2026 files repeat the same date, adult or child and specialty on three snapshots (85 extra rows). Keeping only the first copy would remove about 170,000 to 250,000 people, so we treat them as split rows and add them together. |
| **Unusual values** | "Small Volume" groups (under 20 people) are NTPF's own privacy rule, so they stay in. In the specialty files the four bands add up to 107 more people than NTPF's own total column, which we leave as it is. June 2021 has no snapshot, so there are 92 snapshots in 93 months. |
| **Cleaning** | Read all columns as text first, strip commas from numbers and read dates as day/month/year. Keep the "Small Volume" rows. |
| **Transformations** | Combine the seven 3-month bands of the hospital files into four 6-month bands, so both layouts match. |
| **Aggregation** | Add hospitals and specialties up to a national total for each snapshot and band, and add the split rows in 2025 and 2026. The list ran from 523,225 people (31 Jan 2019) to 692,529 (24 Sep 2026), averaging about 556,000 in 2019 and 666,000 in 2026 so far. |
| **Assumptions** | NTPF counts public hospital outpatient lists only, so it is not the same thing as the survey's "waiting list" answers, which cover all medical care. Inpatient and day-case lists are not included. The split-row decision still needs confirming with NTPF. |

**Preview of the prepared table (how long people wait)**

| snapshot | 0-6 months | 6-12 months | 12-18 months | 18+ months | total |
| --- | ---: | ---: | ---: | ---: | ---: |
| 31 Jan 2019 | 246,063 | 118,749 | 62,170 | 96,243 | 523,225 |
| 25 Mar 2021 | 236,903 | 108,003 | 105,786 | 178,064 | 628,756 |
| 29 Apr 2021 | 239,895 | 119,312 | 89,935 | 181,177 | 630,319 |
| 24 Sep 2026 | 407,175 | 160,650 | 71,248 | 53,456 | 692,529 |

### 3. Putting the two sources together

The two prepared tables share no column: one is a yearly percentage and the other a monthly count. We keep them in separate files (named topic_version_date, for example `unmet_need_by_reason_v1.csv`) and compare them side by side, by year, in the charts. We do not join them.

**Across both sources:**

- Yearly national data shows association, not cause. With about ten yearly points, things that rise over the same years look related, so we describe patterns only.
- COVID years (2020 and 2021) and the Eurostat break years are marked on the charts, not removed.

**Open items:**

- Confirm with NTPF that the repeated 2025 and 2026 rows are split rows.
- June 2021 has no NTPF snapshot. We do not know why, so we claim no cause and mark the gap on the trend chart.
- Confirm whether the Eurostat percentage is of all people or only of those who needed care.
- A second team member re-checks a sample of the numbers against the original sources, as the charter says.

---

## References

[1] Eurostat, “Self-reported unmet needs for medical examination by sex, age, main reason declared and income quintile (hlth_silc_08),” Eurostat, 2026. [Dataset]. Accessed: Nov. 7, 2026. [Online]. Available: <https://ec.europa.eu/eurostat/databrowser/view/hlth_silc_08/default/table?lang=en>

[2] Eurostat, “Unmet health care needs statistics,” Statistics Explained, 2025. Accessed: Nov. 7, 2026. [Online]. Available: <https://ec.europa.eu/eurostat/statistics-explained/index.php/Unmet_health_care_needs_statistics>

[3] National Treatment Purchase Fund, “Waiting list open data,” NTPF, 2026. [Dataset]. Accessed: Nov. 7, 2026. [Online]. Available: <https://www.ntpf.ie/waiting-list-data/open-data/>
