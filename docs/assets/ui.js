(() => {
  "use strict";
  const D = window.AmbassadorData;
  const { icon, money, number, percent, delta, escapeHtml } = D;

  function pageHead(eyebrow, title, sub, actions = "") {
    return `<div class="page-head">
      <div>
        <div class="eyebrow">${eyebrow}</div>
        <h1 class="page-title">${title}</h1>
        <p class="page-sub">${sub}</p>
      </div>
      ${actions ? `<div class="page-actions">${actions}</div>` : ""}
    </div>`;
  }

  function kpiCard(label, value, change, note, iconName, glow = "rgba(126,226,184,.08)") {
    return `<article class="kpi" style="--kpi-glow:${glow}">
      <div class="kpi-label"><span>${label}</span>${icon(iconName)}</div>
      <div class="kpi-value">${value}</div>
      <div class="kpi-meta">${delta(change)}<span>${note}</span></div>
    </article>`;
  }

  function rangeControl(target, current) {
    return `<div class="segmented" aria-label="Date range">
      ${[7, 30, 90].map((days) => `<button type="button" data-action="range" data-range="${days}" data-target="${target}" aria-pressed="${current === days}">${days}d</button>`).join("")}
    </div>`;
  }

  function sparkline(values, color = "var(--mint)") {
    const width = 120;
    const height = 30;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const span = max - min || 1;
    const points = values.map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - 3 - ((value - min) / span) * (height - 6);
      return [x, y];
    });
    const line = points.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
    const area = `${line} L${width} ${height} L0 ${height} Z`;
    const id = `spark-${Math.random().toString(36).slice(2, 8)}`;
    return `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".28"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
      <path d="${area}" fill="url(#${id})"/>
      <path d="${line}" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${points[points.length - 1][0]}" cy="${points[points.length - 1][1]}" r="2" fill="${color}"/>
    </svg>`;
  }

  let chartSequence = 0;

  function revenueChart(rows, days) {
    if (!rows.length) return `<div class="empty">No data for this range.</div>`;
    chartSequence += 1;
    const id = `chart-${chartSequence}`;
    const width = 760;
    const height = 224;
    const pad = { left: 44, right: 12, top: 14, bottom: 26 };
    const values = rows.map((row) => row.revenue);
    const commissions = rows.map((row) => row.commission);
    const max = Math.max(...values);
    const step = Math.ceil(max / 4 / 1000) * 1000 || 1000;
    const top = step * 4;
    const innerWidth = width - pad.left - pad.right;
    const innerHeight = height - pad.top - pad.bottom;
    const x = (index) => pad.left + (rows.length === 1 ? innerWidth / 2 : index / (rows.length - 1) * innerWidth);
    const y = (value) => pad.top + innerHeight - (value / top) * innerHeight;
    const path = (series) => series.map((value, index) => `${index ? "L" : "M"}${x(index).toFixed(1)} ${y(value).toFixed(1)}`).join(" ");
    const area = `${path(values)} L${x(rows.length - 1).toFixed(1)} ${pad.top + innerHeight} L${pad.left} ${pad.top + innerHeight} Z`;
    const grid = Array.from({ length: 5 }, (_, index) => {
      const gridY = pad.top + innerHeight - index / 4 * innerHeight;
      const value = step * index;
      return `<line class="grid-line" x1="${pad.left}" y1="${gridY}" x2="${width - pad.right}" y2="${gridY}"/>
        <text class="axis-label" x="${pad.left - 8}" y="${gridY + 3}" text-anchor="end">${value >= 1000 ? `$${value / 1000}k` : `$${value}`}</text>`;
    }).join("");
    const labelIndexes = [...new Set([0, Math.floor((rows.length - 1) / 3), Math.floor((rows.length - 1) * 2 / 3), rows.length - 1])];
    const labels = labelIndexes.map((index) => `<text class="axis-label" x="${x(index)}" y="${height - 8}" text-anchor="${index === 0 ? "start" : index === rows.length - 1 ? "end" : "middle"}">${D.formatDate(rows[index].date)}</text>`).join("");
    const points = rows.map((row, index) => {
      const commission = row.commission;
      return `<circle data-point cx="${x(index).toFixed(1)}" cy="${y(row.revenue).toFixed(1)}" r="8" fill="transparent" data-label="${D.formatDate(row.date)}" data-value="${money(row.revenue)} GMV · ${money(commission)} commission" style="cursor:crosshair"/>`;
    }).join("");
    return `<div class="chart" data-chart>
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Attributed revenue for the last ${days} days. Total ${money(values.reduce((a, b) => a + b, 0))}.">
        <defs>
          <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#7ee2b8" stop-opacity=".3"/>
            <stop offset="1" stop-color="#7ee2b8" stop-opacity="0"/>
          </linearGradient>
        </defs>
        ${grid}
        <path d="${area}" fill="url(#${id})"/>
        <path d="${path(commissions)}" fill="none" stroke="#f0b35b" stroke-width="1.4" stroke-opacity=".75" stroke-linecap="round" stroke-linejoin="round" style="stroke-dasharray:3 4"/>
        <path d="${path(values)}" fill="none" stroke="#7ee2b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        ${points}
        <circle cx="${x(rows.length - 1)}" cy="${y(values[values.length - 1])}" r="3" fill="#7ee2b8" stroke="#080b0a" stroke-width="1.5"/>
        ${labels}
      </svg>
      <div class="chart-tooltip" role="status" aria-live="off"></div>
    </div>`;
  }

  function donutChart(segments, centerValue, centerLabel) {
    const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;
    let offset = 0;
    const rings = segments.map((segment) => {
      const length = segment.value / total * 100;
      const circle = `<circle cx="21" cy="21" r="15.9155" fill="none" stroke="${segment.color}" stroke-width="4.2" stroke-dasharray="${Math.max(0, length - 1.4)} ${100 - Math.max(0, length - 1.4)}" stroke-dashoffset="${(-offset + 25).toFixed(2)}" stroke-linecap="butt"/>`;
      offset += length;
      return circle;
    }).join("");
    return `<div class="donut-wrap">
      <svg viewBox="0 0 42 42" role="img" aria-label="Channel mix: ${segments.map((segment) => `${segment.label} ${segment.value}%`).join(", ")}">
        <circle cx="21" cy="21" r="15.9155" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="4.2"/>
        ${rings}
        <text x="21" y="21.4" text-anchor="middle" class="donut-center">${centerValue}</text>
        <text x="21" y="25.9" text-anchor="middle" class="donut-center-sub">${centerLabel}</text>
      </svg>
      <div class="legend-list">
        ${segments.map((segment) => `<div class="legend-item"><i class="legend-swatch" style="background:${segment.color}"></i><span>${segment.label}</span><strong>${segment.value}%</strong></div>`).join("")}
      </div>
    </div>`;
  }

  function bindCharts() {
    document.querySelectorAll("[data-chart]").forEach((chart) => {
      const svg = chart.querySelector("svg");
      const tooltip = chart.querySelector(".chart-tooltip");
      const points = Array.from(chart.querySelectorAll("[data-point]"));
      if (!svg || !tooltip || !points.length) return;
      const viewBox = svg.viewBox.baseVal;
      svg.addEventListener("pointermove", (event) => {
        const rect = svg.getBoundingClientRect();
        const pointerX = (event.clientX - rect.left) / rect.width * viewBox.width;
        let nearest = points[0];
        let best = Infinity;
        points.forEach((point) => {
          const distance = Math.abs(Number(point.getAttribute("cx")) - pointerX);
          if (distance < best) { best = distance; nearest = point; }
        });
        const cx = Number(nearest.getAttribute("cx"));
        const cy = Number(nearest.getAttribute("cy"));
        tooltip.style.left = `${cx / viewBox.width * rect.width}px`;
        tooltip.style.top = `${Math.max(34, cy / viewBox.height * rect.height)}px`;
        tooltip.innerHTML = `<strong>${nearest.dataset.label}</strong>${nearest.dataset.value}`;
        tooltip.style.opacity = "1";
      });
      svg.addEventListener("pointerleave", () => { tooltip.style.opacity = "0"; });
    });
  }

  function bindRanges() {
    document.querySelectorAll(".range").forEach((range) => {
      const update = () => {
        const min = Number(range.min) || 0;
        const max = Number(range.max) || 100;
        const progress = ((Number(range.value) - min) / (max - min) * 100).toFixed(1);
        range.style.setProperty("--range-progress", `${progress}%`);
        if (range.dataset.output) {
          const output = document.getElementById(range.dataset.output);
          if (output) output.textContent = `${range.value}%`;
        }
      };
      range.addEventListener("input", update);
      update();
    });
  }

  window.AmbassadorUI = { pageHead, kpiCard, rangeControl, sparkline, revenueChart, donutChart, bindCharts, bindRanges };
})();
