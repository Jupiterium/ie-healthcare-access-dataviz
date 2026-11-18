/*
 * Charts for the report page. They match Charts_Jenny_v1.ipynb:
 *   1. a line chart for each reason, Ireland against the EU average
 *   2. a 2025 ranking of the 27 EU countries for each reason, with Ireland highlighted
 * The numbers come from data.js, which make_data.py builds from the prepared table.
 */
(function () {
  'use strict';

  // Look of the charts

  const COLORS = {
    waiting: '#eb6834',
    cost: '#2a78d6',
    eu: '#898781',
    other: '#d3d1c7',
    grid: '#eef1f6',
    axis: '#c5cfdd',
    text: '#1f2a44',
  };

  Chart.defaults.color = '#6b7690';
  Chart.defaults.font.family = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  Chart.defaults.font.size = 12;
  Chart.defaults.animation = false;

  const S = DATA.survey;
  const pct = (value) => value.toFixed(1) + '%';
  const last = (list) => list[list.length - 1];
  const setText = (id, text) => {
    document.getElementById(id).textContent = text;
  };

  // Key numbers and the ranking title


  const rankWaiting = DATA.rank['Waiting list'];
  const rankCost = DATA.rank['Too expensive'];

  setText('stat-waiting', pct(last(S.ie_waiting)));
  setText('note-waiting', `EU average ${pct(last(S.eu_waiting))}, up from ${pct(S.ie_waiting[0])} in 2016`);
  setText('stat-cost', pct(last(S.ie_cost)));
  setText('note-cost', `EU average ${pct(last(S.eu_cost))}, down from ${pct(S.ie_cost[0])} in 2016`);
  setText('stat-rank', rankWaiting + 'th');
  setText('rank-title', `In 2025 Ireland is ${rankWaiting}th highest of 27 EU countries on waiting, and ${rankCost}th on cost`);

  // Chart 1: Ireland vs the EU average, 2016 to 2025

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
      tension: 0, // straight lines, as in the notebook
    };
  }

// One line chart: Ireland and the EU average for one reason.
  function drawLineChart(canvasId, ireland, eu, color, showAxisTitle) {
    new Chart(document.getElementById(canvasId), {
      type: 'line',
      data: {
        labels: S.years,
        datasets: [
          lineSeries('Ireland', ireland, color, [], 3),
          lineSeries('EU27 average', eu, COLORS.eu, [6, 5], 2),
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            align: 'start',
            labels: { usePointStyle: true, pointStyle: 'line', boxWidth: 26, boxHeight: 8, padding: 14 },
          },
          tooltip: {
            callbacks: { label: (ctx) => ctx.dataset.label + ': ' + pct(ctx.parsed.y) },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { color: COLORS.axis },
            ticks: { autoSkip: false, maxRotation: 90, minRotation: 0, font: { size: 11 } }, // every year
          },
          y: {
            min: 0,
            max: 3, // the same scale for both reasons
            grid: { color: COLORS.grid },
            border: { display: false },
            ticks: { stepSize: 0.2, font: { size: 11 }, callback: (value) => pct(value) }, // a value every 0.2%
            title: { display: showAxisTitle, text: '% of people aged 16+' },
          },
        },
      },
    });
  }

  // Chart 2: where Ireland sits in 2025

  /** Writes the value at the end of each bar. */
  const valueLabels = {
    id: 'valueLabels',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      const bars = chart.getDatasetMeta(0).data;
      const values = chart.data.datasets[0].data;

      ctx.save();
      ctx.fillStyle = '#4a5368';
      ctx.font = '11px system-ui, sans-serif';
      ctx.textBaseline = 'middle';
      bars.forEach((bar, i) => ctx.fillText(pct(values[i]), bar.x + 5, bar.y));
      ctx.restore();
    },
  };

  function barColor(row, irelandColor) {
    if (row.group === 'Ireland') return irelandColor;
    if (row.group === 'EU average') return COLORS.eu;
    return COLORS.other;
  }

  // One ranking: all countries for one reason, the highest at the top.
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
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => pct(ctx.parsed.x) } },
        },
        scales: {
          x: {
            min: 0,
            max: 10,
            grid: { color: COLORS.grid },
            border: { display: false },
            ticks: { stepSize: 2, callback: (value) => value + '%' },
          },
          y: {
            grid: { display: false },
            border: { color: COLORS.axis },
            ticks: { autoSkip: false, font: { size: 11 }, color: COLORS.text },
          },
        },
      },
      plugins: [valueLabels],
    });
  }

  // Draw everything

  drawLineChart('ireland-waiting', S.ie_waiting, S.eu_waiting, COLORS.waiting, true);
  drawLineChart('ireland-cost', S.ie_cost, S.eu_cost, COLORS.cost, false);
  drawRanking('rank-waiting', 'Waiting list', COLORS.waiting);
  drawRanking('rank-cost', 'Too expensive', COLORS.cost);
})();
