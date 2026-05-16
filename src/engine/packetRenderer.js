/**
 * Packet rendering system — domain-agnostic context layers.
 *
 * Each packet has a `type` that determines how it renders:
 *   "band"  — colored horizontal bands behind the chart (e.g. presidential terms)
 *   "strip" — thin labeled bar at top of chart area (future: SCOTUS composition)
 *
 * All render functions receive a shared `ctx` object and geometric params
 * already computed by the main renderer (PAD, chartW, chartH, dpr).
 *
 * yearToX: linear year → x pixel mapping.
 * This matches the main renderer for contiguous year ranges (the tiny
 * index-vs-range rounding difference is imperceptible at this scale).
 */

function yearToX(year, visStart, visEnd, PAD, chartW) {
  const t = (year - visStart) / Math.max(1, visEnd - visStart);
  return PAD.left + t * chartW;
}

function renderBandPacket(ctx, packet, visStart, visEnd, PAD, chartW, chartH, dpr) {
  const { render: renderOpts = {}, data = [], legend = [] } = packet;
  const opacity = renderOpts.opacity ?? 0.09;
  const labelOpacity = renderOpts.label_opacity ?? 0.45;
  const showLabels = renderOpts.show_labels !== false;
  const minBandWidth = (renderOpts.min_band_width_for_label ?? 18) * dpr;

  for (const band of data) {
    const bandStart = Math.max(band.start, visStart);
    const bandEnd = Math.min(band.end, visEnd);
    if (bandStart >= bandEnd) continue;

    const x0 = yearToX(bandStart, visStart, visEnd, PAD, chartW);
    const x1 = yearToX(bandEnd, visStart, visEnd, PAD, chartW);
    const bandW = x1 - x0;
    if (bandW < 0.5) continue;

    // Parse hex color and apply opacity
    const hex = band.color || '#888888';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    ctx.fillStyle = `rgba(${r},${g},${b},${opacity})`;
    ctx.fillRect(x0, PAD.top, bandW, chartH);

    // President name label — rotated if band is narrow
    if (showLabels && band.label) {
      ctx.save();
      ctx.fillStyle = `rgba(${r},${g},${b},${labelOpacity})`;
      const fontSize = 9 * dpr;
      ctx.font = `${fontSize}px 'DM Sans', sans-serif`;

      if (bandW >= minBandWidth * 3) {
        // Wide band: horizontal label centered
        ctx.textAlign = 'center';
        ctx.fillText(band.label, x0 + bandW / 2, PAD.top + 14 * dpr);
      } else if (bandW >= minBandWidth) {
        // Narrow band: rotated label
        ctx.translate(x0 + bandW / 2, PAD.top + 14 * dpr);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'right';
        ctx.fillText(band.label, 0, 0);
      }
      ctx.restore();
    }
  }
}

/**
 * Entry point called from the main renderer after background fill,
 * before grid lines and series data.
 */
export function renderPackets(ctx, { activePackets, visStart, visEnd, PAD, chartW, chartH, dpr }) {
  if (!activePackets || activePackets.length === 0) return;

  for (const packet of activePackets) {
    if (packet.type === 'band') {
      renderBandPacket(ctx, packet, visStart, visEnd, PAD, chartW, chartH, dpr);
    }
    // Future: 'strip', 'event_stream', 'line'
  }
}
