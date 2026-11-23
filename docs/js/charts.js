/*
 * The report page and the one-chart pages: navigation between the views, and the charts. The charts match the notebooks:
 *   1. Waiting and cost in Ireland over time                 (chart 1, Daniel)
 *   2. Ireland against the EU average, and a 2025 ranking    (charts 2 and 2b, Jenny)
 *   3. The waiting list over time, and how long people wait  (charts 3a and 3b, Steven)
 *   4. The waiting list and the survey on the same years     (chart 4, Alessandro)
 * The numbers come from data.js, which make_data.py builds from the prepared tables.
 * A one-chart page sets <body data-chart="chart1"> (or chart2, chart3, chart4) and gets only that chart, with no menu.
 */
(function () {
  'use strict';

  // ---------- look of the charts ----------

  const COLORS = {
    waiting: '#eb6834',
    cost: '#2a78d6',
    eu: '#898781',
    other: '#d3d1c7',
    grid: '#eef1f6',
    axis: '#c5cfdd',
    text: '#1f2a44',
  };
  const YEAR_SHADES = ['#f9d3c1', '#f4a785', '#eb6834', '#a8390f']; // light (first year) to dark (last year)

  Chart.defaults.color = '#6b7690';
  Chart.defaults.font.family = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  Chart.defaults.font.size = 12;
  Chart.defaults.animation = false;

  const S = DATA.survey;
  const L = DATA.list;
  const pct = (value) => value.toFixed(1) + '%';
  const people = (value) => Math.round(value).toLocaleString('en-IE');
  const last = (list) => list[list.length - 1];
  const setText = (id, text) => {
    const element = document.getElementById(id);
    if (element) element.textContent = text; // a one-chart page has only some of these
  };

  // ---------- key numbers on the overview, and the ranking title ----------

  const rankWaiting = DATA.rank['Waiting list'];
  const rankCost = DATA.rank['Too expensive'];

  setText('stat-waiting', pct(last(S.ie_waiting)));
  setText('note-waiting', `EU average ${pct(last(S.eu_waiting))}, up from ${pct(S.ie_waiting[0])} in 2016`);
  setText('stat-cost', pct(last(S.ie_cost)));
  setText('note-cost', `EU average ${pct(last(S.eu_cost))}, down from ${pct(S.ie_cost[0])} in 2016`);
  setText('stat-list', people(L.last));
  setText('note-list', `up from ${people(L.first)} in January 2019`);
  setText('rank-title', `In 2025 Ireland is ${rankWaiting}th highest of 27 EU countries on waiting, and ${rankCost}th on cost`);

  // ---------- shared pieces ----------

  const yAxis = (min, max, step, format, title) => ({
    min,
    max,
    grid: { color: COLORS.grid },
    border: { display: false },
    ticks: { stepSize: step, font: { size: 11 }, callback: format },
    title: { display: Boolean(title), text: title },
  });

  const yearAxis = () => ({
    grid: { display: false },
    border: { color: COLORS.axis },
    ticks: { autoSkip: false, maxRotation: 90, minRotation: 0, font: { size: 11 } }, // every year
  });

  const legendTop = {
    position: 'top',
    align: 'start',
    labels: { usePointStyle: true, pointStyle: 'line', boxWidth: 26, boxHeight: 8, padding: 14 },
  };

  function lineSeries(label, data, color, dash, width) {
    return {
      label,
      data,
      borderColor: color,
      backgroundColor: color,
      borderWidth: width,
      borderDash: dash,
      pointRadius: 0,
      pointHoverRadius: 5,
      tension: 0, // straight lines, as in the notebooks
    };
  }

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
  };

  /** Writes the value at the end of each bar (horizontal or vertical). */
  function valueLabels(format, horizontal) {
    return {
      id: 'valueLabels' + Math.random(),
      afterDatasetsDraw(chart) {
        const { ctx } = chart;
        ctx.save();
        ctx.fillStyle = '#4a5368';
        ctx.font = '11px system-ui, sans-serif';
        chart.data.datasets.forEach((dataset, d) => {
          chart.getDatasetMeta(d).data.forEach((bar, i) => {
            const value = dataset.data[i];
            if (horizontal) {
              ctx.textBaseline = 'middle';
              ctx.textAlign = 'left';
              ctx.fillText(format(value), bar.x + 5, bar.y);
            } else {
              ctx.textBaseline = 'bottom';
              ctx.textAlign = 'center';
              ctx.fillText(format(value), bar.x, bar.y - 3);
            }
          });
        });
        ctx.restore();
      },
    };
  }

  // ---------- chart 1: waiting and cost in Ireland over time ----------

  function drawChart1() {
    const breaks = S.break_years; // Eurostat's break years, drawn as hollow points
    const isBreak = (i) => breaks.includes(S.years[i]);

    const series = (label, data, color) => ({
      ...lineSeries(label, data, color, [], 3),
      pointRadius: 5,
      pointHoverRadius: 7,
      pointBorderWidth: 2,
      pointBorderColor: color,
      pointBackgroundColor: data.map((_, i) => (isBreak(i) ? '#ffffff' : color)),
    });

    // the COVID years (2020 and 2021) as a light grey band behind the lines
    const covidBand = {
      id: 'covidBand',
      beforeDatasetsDraw(chart) {
        const { ctx, chartArea, scales } = chart;
        const from = scales.x.getPixelForValue(S.years.indexOf(2020) - 0.5);
        const to = scales.x.getPixelForValue(S.years.indexOf(2021) + 0.5);
        ctx.save();
        ctx.fillStyle = 'rgba(137, 135, 129, 0.12)';
        ctx.fillRect(from, chartArea.top, to - from, chartArea.bottom - chartArea.top);
        ctx.fillStyle = COLORS.eu;
        ctx.font = '12px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('COVID years', (from + to) / 2, chartArea.top + 6);
        ctx.restore();
      },
    };

    // a label at the end of each line, so no legend is needed
    const endLabels = {
      id: 'endLabels',
      afterDatasetsDraw(chart) {
        const { ctx } = chart;
        ctx.save();
        ctx.font = 'bold 14px system-ui, sans-serif';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        chart.data.datasets.forEach((dataset, d) => {
          const point = last(chart.getDatasetMeta(d).data);
          ctx.fillStyle = dataset.borderColor;
          ctx.fillText(`${dataset.label} ${pct(last(dataset.data))}`, point.x + 12, point.y);
        });
        ctx.restore();
      },
    };

    new Chart(document.getElementById('shift'), {
      type: 'line',
      data: {
        labels: S.years,
        datasets: [series('Waiting list', S.ie_waiting, COLORS.waiting), series('Too expensive', S.ie_cost, COLORS.cost)],
      },
      options: {
        ...baseOptions,
        layout: { padding: { right: 150 } }, // room for the end labels
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => items[0].label + (isBreak(items[0].dataIndex) ? ' (break in the series)' : ''),
              label: (ctx) => ctx.dataset.label + ': ' + pct(ctx.parsed.y),
              footer: (items) => {
                const gap = S.ie_waiting[items[0].dataIndex] - S.ie_cost[items[0].dataIndex];
                return (gap >= 0 ? 'Waiting is higher by ' : 'Cost is higher by ') + Math.abs(gap).toFixed(1) + ' points';
              },
            },
          },
        },
        scales: { x: yearAxis(), y: yAxis(0, 3, 0.5, (v) => pct(v), '% of people aged 16+') }, // the same 0 to 3% scale as chart 2
      },
      plugins: [covidBand, endLabels],
    });
  }

  // ---------- chart 2: Ireland against the EU average, and the 2025 ranking ----------

  function drawLineChart(canvasId, ireland, eu, color, showAxisTitle) {
    new Chart(document.getElementById(canvasId), {
      type: 'line',
      data: {
        labels: S.years,
        datasets: [lineSeries('Ireland', ireland, color, [], 3), lineSeries('EU27 average', eu, COLORS.eu, [6, 5], 2)],
      },
      options: {
        ...baseOptions,
        plugins: {
          legend: legendTop,
          tooltip: { callbacks: { label: (ctx) => ctx.dataset.label + ': ' + pct(ctx.parsed.y) } },
        },
        scales: { x: yearAxis(), y: yAxis(0, 3, 0.2, (v) => pct(v), showAxisTitle ? '% of people aged 16+' : '') }, // the same scale for both reasons
      },
    });
  }

  function barColor(row, irelandColor) {
    if (row.group === 'Ireland') return irelandColor;
    if (row.group === 'EU average') return COLORS.eu;
    return COLORS.other;
  }

  function drawRanking(canvasId, reason, irelandColor) {
    const rows = DATA.ranking[reason];

    new Chart(document.getElementById(canvasId), {
      type: 'bar',
      data: {
        labels: rows.map((row) => (row.area === 'EU average' ? 'EU27 average' : row.area)),
        datasets: [
          {
            data: rows.map((row) => row.pct),
            backgroundColor: rows.map((row) => barColor(row, irelandColor)),
            borderRadius: 2,
            barPercentage: 0.72,
            categoryPercentage: 0.95,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { right: 34 } }, // room for the value labels
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => pct(ctx.parsed.x) } } },
        scales: {
          x: { min: 0, max: 10, grid: { color: COLORS.grid }, border: { display: false }, ticks: { stepSize: 2, callback: (v) => v + '%' } },
          y: { grid: { display: false }, border: { color: COLORS.axis }, ticks: { autoSkip: false, font: { size: 11 }, color: COLORS.text } },
        },
      },
      plugins: [valueLabels(pct, true)],
    });
  }

  function drawChart2() {
    drawLineChart('ireland-waiting', S.ie_waiting, S.eu_waiting, COLORS.waiting, true);
    drawLineChart('ireland-cost', S.ie_cost, S.eu_cost, COLORS.cost, false);
    drawRanking('rank-waiting', 'Waiting list', COLORS.waiting);
    drawRanking('rank-cost', 'Too expensive', COLORS.cost);
  }

  // ---------- chart 3: the list over time, and how long people wait ----------

  function drawChart3() {
    const monthName = (key) => {
      const [year, month] = key.split('-');
      return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(month) - 1] + ' ' + year;
    };

    // 3a: one line, broken where a month has no snapshot (the value is null)
    new Chart(document.getElementById('list-monthly'), {
      type: 'line',
      data: {
        labels: L.months,
        datasets: [{ ...lineSeries('People on the list', L.monthly, COLORS.waiting, [], 3), spanGaps: false }],
      },
      options: {
        ...baseOptions,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => monthName(items[0].label),
              label: (ctx) => people(ctx.parsed.y * 1000) + ' people',
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { color: COLORS.axis },
            ticks: {
              autoSkip: false,
              maxRotation: 0,
              font: { size: 11 },
              callback: (value, index) => (L.months[index].endsWith('-01') ? L.months[index].slice(0, 4) : ''), // a label for every year
            },
          },
          y: yAxis(450, 700, 25, (v) => v + 'k', 'People on the list (thousands)'),
        },
      },
    });

    // 3b: grouped bars, one group for each waiting-time band and one bar for each year
    const B = L.bands;
    new Chart(document.getElementById('list-bands'), {
      type: 'bar',
      data: {
        labels: B.bands,
        datasets: B.years.map((year, i) => ({
          label: String(year),
          data: B.values[String(year)],
          backgroundColor: YEAR_SHADES[i],
          borderRadius: 2,
          barPercentage: 0.9,
          categoryPercentage: 0.8,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', align: 'end', labels: { usePointStyle: true, pointStyle: 'rect', boxWidth: 10, padding: 14 } },
          tooltip: { callbacks: { label: (ctx) => ctx.dataset.label + ': ' + people(ctx.parsed.y * 1000) + ' people' } },
        },
        scales: {
          x: { grid: { display: false }, border: { color: COLORS.axis }, ticks: { font: { size: 12 }, color: COLORS.text } },
          y: yAxis(0, 450, 50, (v) => v + 'k', 'People waiting (thousands, yearly average)'),
        },
      },
      plugins: [valueLabels((v) => String(Math.round(v)), false)],
    });
  }

  // ---------- chart 4: the list and the survey on the same years ----------

  function drawChart4() {
    const years = L.yearly.years; // 2019 to 2025
    const survey = years.map((y) => S.ie_waiting[S.years.indexOf(y)]);

    // both panels get the same width for the y-axis labels, so the years line up
    const sameWidth = { afterFit: (scale) => (scale.width = 56) };

    const panel = (canvasId, data, scale) =>
      new Chart(document.getElementById(canvasId), {
        type: 'line',
        data: { labels: years, datasets: [{ ...lineSeries('', data, COLORS.waiting, [], 3), pointRadius: 4, pointHoverRadius: 6 }] },
        options: {
          ...baseOptions,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => scale.tip(ctx.parsed.y) } } },
          scales: { x: yearAxis(), y: { ...scale.axis, ...sameWidth } },
        },
      });

    panel('cmp-list', L.yearly.avg, {
      axis: yAxis(500, 700, 25, (v) => v + 'k'),
      tip: (v) => people(v * 1000) + ' people',
    });
    panel('cmp-survey', survey, {
      axis: yAxis(0, 3, 0.5, (v) => pct(v)),
      tip: pct,
    });
  }

  // ---------- navigation: one view at a time, drawn the first time it is opened ----------

  const drawers = {
    chart1: drawChart1,
    chart2: drawChart2,
    chart3: drawChart3,
    chart4: drawChart4,
  };
  // a one-chart page: draw its chart and stop (no menu, no views)
  const single = document.body.dataset.chart;
  if (single) {
    drawers[single]();
    return;
  }

  const drawn = {};
  const views = Array.from(document.querySelectorAll('.view'));
  const tabs = Array.from(document.querySelectorAll('.tabs a'));

  function show(name) {
    if (!views.some((v) => v.id === 'v-' + name)) name = 'overview';

    views.forEach((v) => v.classList.toggle('active', v.id === 'v-' + name));
    tabs.forEach((t) => {
      if (t.dataset.view === name) {
        t.setAttribute('aria-current', 'page');
        t.scrollIntoView({ block: 'nearest', inline: 'center' });
      } else {
        t.removeAttribute('aria-current');
      }
    });

    // charts are drawn when their view is visible, so they get the right size
    if (drawers[name] && !drawn[name]) {
      drawers[name]();
      drawn[name] = true;
    }
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', () => show(location.hash.slice(1)));
  show(location.hash.slice(1));
})();
