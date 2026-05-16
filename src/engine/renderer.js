// Domain-agnostic canvas rendering engine
// Supports two chart_type values:
//   "logarithmic_series" — line chart with log Y scale (financial)
//   "cumulative_impact"  — computes running impact score from events and plots as line

import { renderPackets } from './packetRenderer.js';

const PAD_BASE = { top: 30, right: 20, bottom: 60, left: 85 };

function formatVal(v) {
  if (v >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M';
  if (v >= 1e3) return '$' + (v / 1e3).toFixed(0) + 'K';
  return '$' + v.toFixed(0);
}

/**
 * Builds cumulative growth values for each series starting from 10000.
 * Returns { years: number[], seriesMap: { [key]: number[] } }
 */
export function buildSeriesValues(domain) {
  if (!domain.series) return { years: [], seriesMap: {} };

  const years = [];
  for (let y = domain.x_range.start; y <= domain.x_range.end; y++) {
    years.push(y);
  }

  const seriesMap = {};
  for (const s of domain.series) {
    let val = 10000;
    const vals = [];
    for (const y of years) {
      const ret = s.annual_returns[String(y)];
      if (ret !== undefined) {
        val *= 1 + ret / 100;
      }
      vals.push(val);
    }
    seriesMap[s.key] = vals;
  }

  return { years, seriesMap };
}

/**
 * Builds cumulative impact score for voting-rights style domains.
 * Starts at 50, adds magnitude for expands, subtracts for restricts.
 * Returns { years: number[], values: number[] }
 */
export function buildCumulativeImpact(domain, events) {
  const years = [];
  for (let y = domain.x_range.start; y <= domain.x_range.end; y++) {
    years.push(y);
  }

  // Build a map of year -> delta
  const deltas = {};
  for (const evt of events) {
    if (evt.date >= domain.x_range.start && evt.date <= domain.x_range.end) {
      const delta =
        evt.direction === 'expands'
          ? evt.magnitude
          : evt.direction === 'restricts'
          ? -evt.magnitude
          : 0;
      deltas[evt.date] = (deltas[evt.date] || 0) + delta;
    }
  }

  let score = 50;
  const values = [];
  for (const y of years) {
    if (deltas[y] !== undefined) {
      score = Math.max(5, Math.min(95, score + deltas[y]));
    }
    values.push(score);
  }

  return { years, values };
}

/**
 * Main render function. All state is passed in; canvas is mutated.
 */
export function render(
  canvas,
  {
    domain,
    events,
    overlayEntries,
    seriesCache,
    config: {
      rangeStart,
      rangeEnd,
      visibleSeries = [],
      showEvents = true,
      showOverlay = true,
      showFill = true,
      selectedEventId = null,
      hoveredYear = null,
      activePackets = [],
    },
    callbacks: {
      onHoverChange = () => {},
      onEventClick = () => {},
      onOverlayClick = () => {},
    } = {},
  }
) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.width;
  const H = canvas.height;

  const PAD = {
    top: PAD_BASE.top * dpr,
    right: PAD_BASE.right * dpr,
    bottom: PAD_BASE.bottom * dpr,
    left: PAD_BASE.left * dpr,
  };

  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = '#fafaf8';
  ctx.fillRect(0, 0, W, H);

  // Determine visible year range
  const domainStart = domain.x_range.start;
  const domainEnd = domain.x_range.end;
  const visStart = Math.max(domainStart, rangeStart);
  const visEnd = Math.min(domainEnd, rangeEnd !== undefined ? rangeEnd : domainEnd);

  // Render context packets (background bands, etc.) before grid and series
  renderPackets(ctx, { activePackets, visStart, visEnd, PAD, chartW, chartH, dpr });

  if (domain.chart_type === 'logarithmic_series') {
    _renderLogarithmicSeries(ctx, canvas, domain, events, overlayEntries, seriesCache, {
      dpr, W, H, PAD, chartW, chartH,
      visStart, visEnd,
      visibleSeries, showEvents, showOverlay, showFill,
      selectedEventId, hoveredYear,
    });
  } else if (domain.chart_type === 'cumulative_impact') {
    _renderCumulativeImpact(ctx, canvas, domain, events, overlayEntries, seriesCache, {
      dpr, W, H, PAD, chartW, chartH,
      visStart, visEnd,
      showEvents, showOverlay, showFill,
      selectedEventId, hoveredYear,
    });
  }
}

function _buildYearIndex(allYears, visStart, visEnd) {
  const startIdx = allYears.findIndex((y) => y >= visStart);
  const endIdx = allYears.findLastIndex((y) => y <= visEnd);
  return { startIdx, endIdx };
}

function _xScale(i, totalPoints, PAD, chartW) {
  return PAD.left + (i / Math.max(1, totalPoints - 1)) * chartW;
}

function _drawGrid(ctx, dpr, PAD, chartW, chartH, years, visStart, visEnd, yScaleFn, gridValues, formatFn) {
  ctx.font = `${10 * dpr}px 'DM Mono', monospace`;
  ctx.textAlign = 'right';

  const visYears = years.filter((y) => y >= visStart && y <= visEnd);
  const totalPoints = visYears.length;

  // Horizontal grid
  for (const v of gridValues) {
    const y = yScaleFn(v);
    if (y > PAD.top && y < PAD.top + chartH) {
      ctx.strokeStyle = 'rgba(0,0,0,0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD.left, y);
      ctx.lineTo(PAD.left + chartW, y);
      ctx.stroke();

      ctx.fillStyle = '#999999';
      ctx.fillText(formatFn(v), PAD.left - 6, y + 4 * dpr);
    }
  }

  // Vertical year labels
  ctx.textAlign = 'center';
  ctx.fillStyle = '#999999';
  const step =
    totalPoints > 50 ? 10 : totalPoints > 25 ? 5 : totalPoints > 10 ? 2 : 1;

  visYears.forEach((y, i) => {
    if ((y - visYears[0]) % step === 0) {
      const x = _xScale(i, totalPoints, PAD, chartW);
      ctx.fillText(String(y), x, PAD.top + chartH + 18 * dpr);
      ctx.strokeStyle = 'rgba(0,0,0,0.04)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, PAD.top);
      ctx.lineTo(x, PAD.top + chartH);
      ctx.stroke();
    }
  });
}

function _drawEventMarkers(ctx, dpr, PAD, chartW, chartH, events, years, visStart, visEnd, domain, selectedEventId, hoveredYear, yValueAtYear) {
  const visYears = years.filter((y) => y >= visStart && y <= visEnd);
  const totalPoints = visYears.length;

  const domainEvents = events.filter(
    (e) => e.date >= visStart && e.date <= visEnd
  );

  for (const evt of domainEvents) {
    const i = visYears.indexOf(evt.date);
    if (i < 0) continue;

    const x = _xScale(i, totalPoints, PAD, chartW);
    const color = domain.color_scheme[evt.direction] || domain.color_scheme.primary;
    const isSelected = selectedEventId === evt.id;
    const isHovered = hoveredYear === evt.date;

    const markerH = (evt.magnitude / 10) * chartH;
    const lineW = isSelected || isHovered ? 3 * dpr : 1.5 * dpr;

    ctx.strokeStyle = color + (isSelected ? 'ff' : 'bb');
    ctx.lineWidth = lineW;
    ctx.setLineDash([4 * dpr, 4 * dpr]);
    ctx.beginPath();
    ctx.moveTo(x, PAD.top + chartH);
    ctx.lineTo(x, PAD.top + chartH - markerH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Diamond at top
    const dx = x;
    const dy = PAD.top + chartH - markerH;
    const ds = (isSelected ? 6 : 5) * dpr;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(dx, dy - ds);
    ctx.lineTo(dx + ds, dy);
    ctx.lineTo(dx, dy + ds);
    ctx.lineTo(dx - ds, dy);
    ctx.closePath();
    ctx.fill();

    // Label below X axis (truncated)
    const label = evt.title.length > 12 ? evt.title.slice(0, 12) + '…' : evt.title;
    ctx.font = `${8 * dpr}px 'DM Sans', sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = isSelected ? color : '#999999';
    ctx.fillText(label, x, PAD.top + chartH + 34 * dpr);
  }
}

function _drawOverlayPins(ctx, dpr, PAD, chartW, chartH, overlayEntries, years, visStart, visEnd, domain, yValueAtYear) {
  if (!overlayEntries || overlayEntries.length === 0) return;

  const visYears = years.filter((y) => y >= visStart && y <= visEnd);
  const totalPoints = visYears.length;
  const goldColor = '#b5893a';

  for (const entry of overlayEntries) {
    if (entry.date < visStart || entry.date > visEnd) continue;
    const i = visYears.indexOf(entry.date);
    if (i < 0) continue;

    const x = _xScale(i, totalPoints, PAD, chartW);
    const pinY = yValueAtYear(entry.date, visYears, PAD, chartW, chartH);
    const stemBottom = PAD.top + chartH;

    // Stem
    ctx.strokeStyle = goldColor;
    ctx.lineWidth = 1.5 * dpr;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(x, stemBottom);
    ctx.lineTo(x, pinY - 8 * dpr);
    ctx.stroke();

    // Circle
    const radius = 8 * dpr;
    ctx.beginPath();
    ctx.arc(x, pinY - 8 * dpr, radius, 0, Math.PI * 2);
    ctx.fillStyle = goldColor;
    ctx.fill();
    ctx.strokeStyle = '#fafaf8';
    ctx.lineWidth = 1 * dpr;
    ctx.stroke();

    // Label above circle
    const label = entry.title.length > 14 ? entry.title.slice(0, 13) + '…' : entry.title;
    ctx.font = `bold ${9 * dpr}px 'DM Sans', sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = goldColor;
    ctx.fillText(label, x, pinY - 8 * dpr - radius - 4 * dpr);
  }
}

function _drawLegend(ctx, dpr, PAD, series, visibleSeries) {
  let lx = PAD.left + 12 * dpr;
  const ly = PAD.top + 14 * dpr;

  ctx.font = `${10 * dpr}px 'DM Sans', sans-serif`;
  ctx.textAlign = 'left';

  for (const s of series) {
    if (!visibleSeries.includes(s.key)) continue;
    ctx.fillStyle = s.color;
    ctx.fillRect(lx, ly - 5 * dpr, 18 * dpr, 2.5 * dpr);
    ctx.fillStyle = '#666666';
    ctx.fillText(s.label, lx + 24 * dpr, ly + 1 * dpr);
    lx += ctx.measureText(s.label).width + 50 * dpr;
  }
}

function _drawHoverLine(ctx, dpr, PAD, chartH, x) {
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1 * dpr;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(x, PAD.top);
  ctx.lineTo(x, PAD.top + chartH);
  ctx.stroke();
}

// ─── Logarithmic Series (financial) ──────────────────────────────────────────

function _renderLogarithmicSeries(ctx, canvas, domain, events, overlayEntries, seriesCache, opts) {
  const { dpr, PAD, chartW, chartH, visStart, visEnd, visibleSeries, showEvents, showOverlay, showFill, selectedEventId, hoveredYear } = opts;

  if (!seriesCache) return;
  const { years, seriesMap } = seriesCache;

  const visYears = years.filter((y) => y >= visStart && y <= visEnd);
  const totalPoints = visYears.length;

  // Compute Y range across visible series in visible range
  let maxV = 1000;
  for (const s of domain.series) {
    if (!visibleSeries.includes(s.key)) continue;
    const vals = seriesMap[s.key];
    const { startIdx, endIdx } = _buildYearIndex(years, visStart, visEnd);
    const sliced = vals.slice(startIdx, endIdx + 1);
    const m = Math.max(...sliced);
    if (m > maxV) maxV = m;
  }
  maxV *= 1.05;
  const minV = 1;

  const logMax = Math.log10(maxV / minV);

  const yScale = (v) => {
    const safeV = Math.max(v, minV);
    const log = Math.log10(safeV / minV) / logMax;
    return PAD.top + chartH - log * chartH;
  };

  // Grid
  const gridValues = [100, 1000, 10000, 100000, 1000000, 10000000];
  _drawGrid(ctx, dpr, PAD, chartW, chartH, years, visStart, visEnd, yScale, gridValues.filter(v => v < maxV * 0.95), formatVal);

  // Draw series
  const { startIdx, endIdx } = _buildYearIndex(years, visStart, visEnd);

  for (const s of domain.series) {
    if (!visibleSeries.includes(s.key)) continue;
    const vals = seriesMap[s.key].slice(startIdx, endIdx + 1);

    if (showFill) {
      const grad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + chartH);
      grad.addColorStop(0, s.color + '22');
      grad.addColorStop(1, s.color + '00');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(_xScale(0, totalPoints, PAD, chartW), PAD.top + chartH);
      vals.forEach((v, i) => ctx.lineTo(_xScale(i, totalPoints, PAD, chartW), yScale(v)));
      ctx.lineTo(_xScale(vals.length - 1, totalPoints, PAD, chartW), PAD.top + chartH);
      ctx.closePath();
      ctx.fill();
    }

    ctx.beginPath();
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 2 * dpr;
    ctx.lineJoin = 'round';
    vals.forEach((v, i) => {
      if (i === 0) ctx.moveTo(_xScale(i, totalPoints, PAD, chartW), yScale(v));
      else ctx.lineTo(_xScale(i, totalPoints, PAD, chartW), yScale(v));
    });
    ctx.stroke();
  }

  // Hover line
  if (hoveredYear !== null && hoveredYear >= visStart && hoveredYear <= visEnd) {
    const hi = visYears.indexOf(hoveredYear);
    if (hi >= 0) {
      _drawHoverLine(ctx, dpr, PAD, chartH, _xScale(hi, totalPoints, PAD, chartW));
    }
  }

  // Event markers
  if (showEvents) {
    const yValueAtYear = (yr, vy, _p, _cw, _ch) => {
      // Place marker at the first visible series' value at that year
      const firstVisible = domain.series.find(s => visibleSeries.includes(s.key));
      if (!firstVisible) return PAD.top + chartH / 2;
      const vals = seriesMap[firstVisible.key];
      const absIdx = years.indexOf(yr);
      if (absIdx < 0) return PAD.top + chartH / 2;
      return yScale(vals[absIdx]);
    };
    _drawEventMarkers(ctx, dpr, PAD, chartW, chartH, events, years, visStart, visEnd, domain, selectedEventId, hoveredYear, yValueAtYear);
  }

  // Overlay pins
  if (showOverlay) {
    const yValueAtYear = (yr) => {
      const firstVisible = domain.series.find(s => visibleSeries.includes(s.key));
      if (!firstVisible) return PAD.top + chartH * 0.5;
      const vals = seriesMap[firstVisible.key];
      const absIdx = years.indexOf(yr);
      if (absIdx < 0) return PAD.top + chartH * 0.5;
      return yScale(vals[absIdx]);
    };
    _drawOverlayPins(ctx, dpr, PAD, chartW, chartH, overlayEntries, years, visStart, visEnd, domain, yValueAtYear);
  }

  // Legend
  _drawLegend(ctx, dpr, PAD, domain.series, visibleSeries);
}

// ─── Cumulative Impact (voting rights) ───────────────────────────────────────

function _renderCumulativeImpact(ctx, canvas, domain, events, overlayEntries, seriesCache, opts) {
  const { dpr, PAD, chartW, chartH, visStart, visEnd, showEvents, showOverlay, showFill, selectedEventId, hoveredYear } = opts;

  if (!seriesCache) return;
  const { years, values } = seriesCache;

  const visYears = years.filter((y) => y >= visStart && y <= visEnd);
  const totalPoints = visYears.length;

  const scoreMin = 0;
  const scoreMax = 100;

  const yScale = (v) => PAD.top + chartH - ((v - scoreMin) / (scoreMax - scoreMin)) * chartH;

  // Grid
  const gridValues = [10, 20, 30, 40, 50, 60, 70, 80, 90];
  const formatScore = (v) => String(v);
  _drawGrid(ctx, dpr, PAD, chartW, chartH, years, visStart, visEnd, yScale, gridValues, formatScore);

  // Midline label
  ctx.font = `${9 * dpr}px 'DM Sans', sans-serif`;
  ctx.fillStyle = '#888888';
  ctx.textAlign = 'left';
  ctx.fillText('Access Score (0–100)', PAD.left + 6 * dpr, PAD.top - 8 * dpr);

  // Neutral line at 50
  const mid50y = yScale(50);
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 1 * dpr;
  ctx.setLineDash([6 * dpr, 6 * dpr]);
  ctx.beginPath();
  ctx.moveTo(PAD.left, mid50y);
  ctx.lineTo(PAD.left + chartW, mid50y);
  ctx.stroke();
  ctx.setLineDash([]);

  const { startIdx, endIdx } = _buildYearIndex(years, visStart, visEnd);
  const slicedVals = values.slice(startIdx, endIdx + 1);

  if (showFill && slicedVals.length > 0) {
    // Fill above 50 green, below 50 red
    const path = new Path2D();
    path.moveTo(_xScale(0, totalPoints, PAD, chartW), PAD.top + chartH);
    slicedVals.forEach((v, i) => path.lineTo(_xScale(i, totalPoints, PAD, chartW), yScale(v)));
    path.lineTo(_xScale(slicedVals.length - 1, totalPoints, PAD, chartW), PAD.top + chartH);
    path.closePath();

    const gradG = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + chartH);
    gradG.addColorStop(0, '#2d7a4522');
    gradG.addColorStop(0.5, '#2d7a4522');
    gradG.addColorStop(0.5, '#c0392b22');
    gradG.addColorStop(1, '#c0392b00');
    ctx.fillStyle = gradG;
    ctx.fill(path);
  }

  if (slicedVals.length > 0) {
    ctx.beginPath();
    ctx.lineWidth = 2 * dpr;
    ctx.lineJoin = 'round';
    slicedVals.forEach((v, i) => {
      const x = _xScale(i, totalPoints, PAD, chartW);
      const y = yScale(v);
      ctx.strokeStyle = v >= 50 ? '#2d7a45' : '#c0392b';
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    });
    ctx.stroke();
  }

  // Hover line
  if (hoveredYear !== null && hoveredYear >= visStart && hoveredYear <= visEnd) {
    const hi = visYears.indexOf(hoveredYear);
    if (hi >= 0) {
      _drawHoverLine(ctx, dpr, PAD, chartH, _xScale(hi, totalPoints, PAD, chartW));
    }
  }

  // Event markers
  if (showEvents) {
    const yValueAtYear = (yr) => {
      const absIdx = years.indexOf(yr);
      if (absIdx < 0) return PAD.top + chartH / 2;
      return yScale(values[absIdx]);
    };
    _drawEventMarkers(ctx, dpr, PAD, chartW, chartH, events, years, visStart, visEnd, domain, selectedEventId, hoveredYear, yValueAtYear);
  }

  // Overlay pins
  if (showOverlay) {
    const yValueAtYear = (yr) => {
      const absIdx = years.indexOf(yr);
      if (absIdx < 0) return PAD.top + chartH * 0.5;
      return yScale(values[absIdx]);
    };
    _drawOverlayPins(ctx, dpr, PAD, chartW, chartH, overlayEntries, years, visStart, visEnd, domain, yValueAtYear);
  }
}

/**
 * Convert a canvas clientX coordinate to the nearest year.
 */
export function getYearAtX(canvas, domain, rangeStart, rangeEnd, clientX) {
  const dpr = window.devicePixelRatio || 1;
  const PAD = {
    left: PAD_BASE.left * dpr,
    right: PAD_BASE.right * dpr,
  };
  const rect = canvas.getBoundingClientRect();
  const mx = (clientX - rect.left) * dpr;
  const chartW = canvas.width - PAD.left - PAD.right;

  const visStart = Math.max(domain.x_range.start, rangeStart);
  const visEnd = Math.min(domain.x_range.end, rangeEnd !== undefined ? rangeEnd : domain.x_range.end);

  const totalYears = visEnd - visStart + 1;
  const relX = (mx - PAD.left) / chartW;
  const yearOffset = Math.round(relX * (totalYears - 1));
  const year = visStart + yearOffset;
  return Math.max(visStart, Math.min(visEnd, year));
}
