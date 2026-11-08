# Project Proposal
## Provisional Project Title
Waiting or Paying? Is It Getting Harder to Get Healthcare in Ireland?
### Problem and Motivation
When people in Ireland need medical care, two things can stop them: a long wait for public hospital care, or the cost of care. This project looks at how often each one is the reason people go without care, and how this has changed since 2016.
Two published sources show why this is worth a closer look. The public hospital outpatient waiting list grew from about 556,000 people on average in 2019 to about 666,000 in 2026 so far [1]. In the Eurostat survey, the share of people in Ireland who went without a medical examination because of the waiting list rose from 1.0% in 2016 to 2.1% in 2025, while the share who said cost was the reason fell from 1.5% to 0.6% [2].
These are two different sources that measure different things, so on their own they do not show whether the changes are linked. The problem is not only whether waiting is long or care is expensive. It is which of the two stops more people today, whether Ireland is different from the rest of the EU, and whether what people report follows the waiting list.

### Main Questions
Each question is linked to a visualisation task. Chart types will be chosen after exploring the data.
1.	The shift (change): Between 2016 and 2025, has the main reason people in Ireland go without medical care moved from cost to waiting?
2.	Ireland vs. the EU (compare): Is the pattern in Ireland different from the EU average?
3.	Waiting list and survey (relate): Has the number of people on the hospital waiting list changed in the same direction as the share of people who say waiting stopped them getting care?
Potential Stakeholders and Audience
•	People living in Ireland who need care, who want to know whether waiting or cost is the bigger barrier.
•	Department of Health and HSE planners, who need to know where people go without care and whether waiting lists are part of the reason.
•	Patient advocacy groups, who want evidence for their campaigns.
•	Health researchers and journalists, who report on waiting lists and access to care.
•	Readers of health news and health - service planners, patient groups

### Data Sources
Eurostat - unmet need for medical examination [2]. Eurostat publishes this indicator from the EU-SILC survey, which the CSO carries out in Ireland. It gives the percentage of people aged 16 and over who needed a medical examination in the last 12 months but did not get one, and the main reason [3]. We will use two reasons, too expensive and waiting list, for all ages, for Ireland and the EU average, from 2016 to 2025. One row is one area, year and reason: year is temporal, area and reason are nominal and the percentage is quantitative. Flags mark breaks in the series.
National Treatment Purchase Fund (NTPF) - outpatient waiting list [1]. The NTPF collects the public hospital waiting lists in Ireland and publishes them as monthly CSV files. They count the people waiting for a first outpatient appointment, by specialty and by how long they have waited. We will add them up to a national total for each month, from January 2019 to September 2026. One row is one month and waiting-time band: month is temporal, band is ordinal and the number of people is quantitative. Groups under 20 are combined as Small Volume.

### Project Scope
- Will investigate: whether people in Ireland say they went without care because of cost or because of waiting from 2016 to 2025, how this compares with the EU average, and how the hospital outpatient waiting list changed from 2019 to 2026.
- Will not investigate: age groups, income, health insurance, prices, population and migration, hospital beds and doctors, or individual hospitals. We will also not claim to prove what causes the changes, because yearly national data can show that things move together but not why.

### Known Risks or Limitations
-	Self-reported data: The survey depends on people's own answers, so it may miss people who never tried to get care.
-	Small percentages: Ireland's rates are small (never above 2.7%), so small changes may be noise. We will check Eurostat's flags and not over-read single years.
-	Break in series and COVID years: Eurostat flags a break in the Irish data in 2019 and 2020, and COVID (2020-2021) probably affects both sources. We will mark these years on the charts.
-	NTPF data issues: The 2025 and 2026 files repeat some rows, which we add together as split rows, and June 2021 has no snapshot. Both are still to be confirmed with the NTPF.
-	Different measures: The survey's "waiting list" reason covers all medical care, including GP visits, while the NTPF counts only public hospital outpatient lists, and one is yearly and the other monthly. We will show them side by side by year and not treat them as the same thing.
-	Association, not cause: With about ten yearly points, things that rise over the same years will look related even if they are not, so we will describe patterns only.

### References
- [1]	National Treatment Purchase Fund, “Waiting list open data,” NTPF, 2026. [Dataset]. Accessed: Nov. 7, 2026. [Online]. Available: https://www.ntpf.ie/waiting-list-data/open-data/https://www.ntpf.ie/waiting-list-data/open-data/
- [2]	Eurostat, “Self-reported unmet needs for medical examination by sex, age, main reason declared and income quintile (hlth_silc_08),” Eurostat, 2026. [Dataset]. Accessed: Nov. 7, 2026. [Online]. Available: https://ec.europa.eu/eurostat/databrowser/view/hlth_silc_08/default/table?lang=enhttps://www.cso.ie/en/releasesandpublications/ep/p-cpi/consumerpriceindexaugust2026/
- [3]	Eurostat, “Unmet health care needs statistics,” Statistics Explained, 2025. Accessed: Nov. 7, 2026. [Online]. Available: https://ec.europa.eu/eurostat/statistics-explained/index.php/Unmet_health_care_needs_statisticshttps://www.hia.ie/sites/default/files/2026-03/q4_market_bulletin.pdf
