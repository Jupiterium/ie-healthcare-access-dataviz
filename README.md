# Waiting or paying? Is it getting harder to get healthcare in Ireland?

Data Visualisation (Year 4, TUS), team The Foreigners: Huong "Jenny" Tran, Daniel Raducan, Yu Lin "Steven" Wan and Alessandro Bellassai.

The project asks why some people in Ireland do not get the medical care they need, because of waiting or because of cost.

**Main message.** In Ireland, waiting has become a bigger reason than cost for people going without medical care, and the hospital waiting list has grown over the same years. The charts show patterns, not causes.

## Data

| Source | What it holds | Accessed |
| --- | --- | --- |
| [Eurostat EU-SILC, hlth_silc_08](https://ec.europa.eu/eurostat/databrowser/view/hlth_silc_08/default/table?lang=en) | Share of people aged 16+ who needed a medical examination and did not get one, by main reason (too expensive or waiting list). Ireland, the EU average and 26 other countries, 2016 to 2025. | November 2026 |
| [NTPF outpatient waiting list](https://www.ntpf.ie/waiting-list-data/open-data/) | People on the public hospital outpatient waiting list, by how long they have waited. Monthly, January 2019 to September 2026. | November 2026 |

The two prepared tables are in `data/prepared`:

- `unmet_need_by_reason`: one row for each area, year and reason (560 rows).
- `waiting_list_national`: one row for each monthly snapshot and waiting-time band (370 rows).

## What is in this repo

| Folder or file | What it is |
| --- | --- |
| `Data_Audit.ipynb` | The data audit: loads the raw data, checks it, cleans it and builds the two prepared tables |
| `IrelandvsEUCharts.ipynb` | The charts for question 2 (Ireland vs the EU), with the reasoning for each chart type |
| `data/prepared` | The prepared tables and a log of what was loaded |
| `data/raw` | Raw downloads, created when the audit notebook runs (not committed) |
| `ntpf_files_for_data_raw.zip` | The nine NTPF files, saved from the NTPF website because it does not allow downloads from Python |
| `figures` | The charts as PNG files |
| `docs` | The report page. Open `docs/index.html` in a browser |
| `ad hoc submissions` | The Word documents, the markdown copies and the group presentation |

## How to run it

1. Install Python and the packages: `pip install pandas matplotlib jupyter`.
2. Open `Data_Audit.ipynb` and run it from the top. It downloads the Eurostat data when it runs, and reads the NTPF files from the zip. This rebuilds the tables in `data/prepared`. You can skip this step, because the prepared tables are already in the repo.
3. Open `IrelandvsEUCharts.ipynb` and run it. It reads the prepared tables and saves the charts in `figures`.
4. For the report page, run `python docs/make_data.py` from this folder after the tables change, then open `docs/index.html`. The page loads its chart library from the internet.

## Charts and owners

| Question | Chart | Owner | Where |
| --- | --- | --- | --- |
| Q1 The shift | Waiting and cost in Ireland over time | Daniel | to be added |
| Q2 Ireland vs the EU | Line charts and a 2025 ranking, waiting and cost side by side | Jenny | `IrelandvsEUCharts.ipynb`, `figures` |
| Q3 Waiting list and survey | The list over time, how long people wait, and the list against the survey | Steven and Alessandro | to be added |

## Limits

- The charts show patterns, not causes. There are only about ten yearly points, and the values are small.
- The survey covers all medical care. The waiting list covers public hospital outpatients only, so the two are shown side by side and never joined.
- Eurostat flags a break in Ireland's series in 2019 and 2020, and COVID may affect both sources.
- NTPF has not confirmed how the repeated rows in 2025 and 2026 should be read (we add them as split rows), and there is no snapshot for June 2021.