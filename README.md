# ie-healthcare-access-dataviz
Data Visualization (Year 4) project on what stops people in Ireland getting healthcare (cost or waiting lists?), set against rising prices and other factors. Language is Python, and data used such as Eurostat, CSO, NTPF, and other open data.

## Run Alessandro's chart

From the repository root, install the Python dependencies and run the script:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python "Alessandro Data Viz\A00318549 - Alessandro Chart Code.py"
```

The chart is saved to `Alessandro Data Viz/figures/chart4_list_and_survey.png` and displayed by Matplotlib.
