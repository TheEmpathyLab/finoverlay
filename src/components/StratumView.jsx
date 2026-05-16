import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import ChartCanvas from './ChartCanvas.jsx';
import EventDetailPanel from './EventDetailPanel.jsx';
import InsightBar from './InsightBar.jsx';
import { buildSeriesValues, buildCumulativeImpact } from '../engine/renderer.js';

export default function StratumView({ domainId, onChangeDomain }) {
  const [domain, setDomain] = useState(null);
  const [events, setEvents] = useState([]);
  const [overlayEntries, setOverlayEntries] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedOverlayId, setSelectedOverlayId] = useState(null);
  const [hoveredYear, setHoveredYear] = useState(null);
  const [rangeStart, setRangeStart] = useState(null);
  const [visibleSeries, setVisibleSeries] = useState([]);
  const [showFill, setShowFill] = useState(true);
  const [showEvents, setShowEvents] = useState(true);
  const [showOverlay, setShowOverlay] = useState(true);

  // Packet system
  const [packetRegistry, setPacketRegistry] = useState([]);     // metadata from packets/registry.json
  const [loadedPackets, setLoadedPackets] = useState({});        // { [id]: packet data }
  const [activePacketIds, setActivePacketIds] = useState(new Set());

  const canvasRef = useRef(null);

  // Load domain JSON on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const mod = await import(`../data/${domainId}.json`);
        const data = mod.default;
        if (cancelled) return;

        setDomain(data);
        setEvents(data.events || []);
        setRangeStart(data.x_range.start);

        if (data.series) {
          const defaultVisible = data.series
            .filter((s) => s.default_visible)
            .map((s) => s.key);
          setVisibleSeries(defaultVisible);
        } else {
          setVisibleSeries([]);
        }
      } catch (err) {
        console.error('Failed to load domain:', err);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [domainId]);

  // Load packet registry once on mount
  useEffect(() => {
    import('../data/packets/registry.json').then((mod) => {
      setPacketRegistry(mod.default || []);
    }).catch(() => {});
  }, []);

  // Preload all packet data whenever the registry changes
  useEffect(() => {
    if (!packetRegistry.length) return;
    packetRegistry.forEach((meta) => {
      if (loadedPackets[meta.id]) return;
      import(`../data/packets/${meta.id}.json`).then((mod) => {
        setLoadedPackets((prev) => ({ ...prev, [meta.id]: mod.default }));
      }).catch(() => {});
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packetRegistry]);

  const activePackets = useMemo(
    () => [...activePacketIds].map((id) => loadedPackets[id]).filter(Boolean),
    [activePacketIds, loadedPackets]
  );

  const handleTogglePacket = useCallback((id) => {
    setActivePacketIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Build series / cumulative cache (memoized, recomputed only when domain/events change)
  const seriesCache = useMemo(() => {
    if (!domain) return null;
    if (domain.chart_type === 'logarithmic_series') {
      return buildSeriesValues(domain);
    } else if (domain.chart_type === 'cumulative_impact') {
      return buildCumulativeImpact(domain, events);
    }
    return null;
  }, [domain, events]);

  // Range buttons
  const rangeButtons = useMemo(() => {
    if (!domain) return [];
    const start = domain.x_range.start;
    const end = domain.x_range.end;
    const span = end - start;

    // Generate sensible breakpoints
    if (span >= 90) {
      // Financial: 1926-2024 — show from different decades
      const decades = [];
      for (let y = start; y <= end - 20; y += 10) {
        decades.push(y);
      }
      // Show a subset
      return [start, ...decades.filter((_, i) => i % 3 === 2)].slice(0, 6);
    } else {
      // Voting rights: 1960-2025
      const pts = [];
      for (let y = start; y <= end - 10; y += 10) {
        pts.push(y);
      }
      return pts;
    }
  }, [domain]);

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) || null,
    [events, selectedEventId]
  );

  // Handlers
  const handleHoverChange = useCallback((year) => {
    setHoveredYear(year);
  }, []);

  const handleEventClick = useCallback((evt) => {
    setSelectedEventId((prev) => (prev === evt.id ? null : evt.id));
    setSelectedOverlayId(null);
  }, []);

  const handleOverlayClick = useCallback((entry) => {
    setSelectedOverlayId((prev) => (prev === entry.id ? null : entry.id));
  }, []);

  const handleToggleSeries = useCallback((key) => {
    setVisibleSeries((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const handleAddOverlay = useCallback((entry) => {
    setOverlayEntries((prev) => [...prev, entry]);
  }, []);

  const handleDeleteOverlay = useCallback((id) => {
    setOverlayEntries((prev) => prev.filter((e) => e.id !== id));
    if (selectedOverlayId === id) setSelectedOverlayId(null);
  }, [selectedOverlayId]);

  const handleImportCSV = useCallback((entries) => {
    setOverlayEntries((prev) => [...prev, ...entries]);
  }, []);

  function handleExportPNG() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create export canvas with footer
    const footerH = 40;
    const exportCanvas = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height + footerH * dpr;

    const ectx = exportCanvas.getContext('2d');
    ectx.drawImage(canvas, 0, 0);

    // Footer background
    ectx.fillStyle = '#f2f1ee';
    ectx.fillRect(0, canvas.height, canvas.width, footerH * dpr);

    // Footer text
    ectx.font = `${11 * dpr}px 'DM Sans', sans-serif`;
    ectx.fillStyle = '#888888';
    ectx.textAlign = 'left';
    ectx.fillText(
      `${domain?.name || 'Stratum'} · ${overlayEntries.length} overlay entries · ${new Date().toLocaleDateString()}`,
      16 * dpr,
      canvas.height + 25 * dpr
    );

    ectx.textAlign = 'right';
    ectx.fillStyle = '#b5893a';
    ectx.font = `italic ${11 * dpr}px 'Playfair Display', serif`;
    ectx.fillText('Stratum', exportCanvas.width - 16 * dpr, canvas.height + 25 * dpr);

    const a = document.createElement('a');
    a.download = `stratum-${domainId}-${Date.now()}.png`;
    a.href = exportCanvas.toDataURL('image/png');
    a.click();
  }

  if (!domain || rangeStart === null) {
    return (
      <div
        className="flex items-center justify-center h-full"
        style={{ background: 'var(--bg)', color: 'var(--text-dim)' }}
      >
        <div className="text-center">
          <div className="font-serif text-2xl mb-2" style={{ color: 'var(--gold)' }}>
            Stratum
          </div>
          <div className="text-sm">Loading domain…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: '100%', background: 'var(--bg)' }}>
      {/* Header */}
      <Header
        domain={domain}
        events={events}
        onChangeDomain={onChangeDomain}
        onExportPNG={handleExportPNG}
      />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          domain={domain}
          overlayEntries={overlayEntries}
          selectedOverlayId={selectedOverlayId}
          visibleSeries={visibleSeries}
          showFill={showFill}
          showEvents={showEvents}
          showOverlay={showOverlay}
          packetRegistry={packetRegistry}
          activePacketIds={activePacketIds}
          onSelectOverlay={(id) => setSelectedOverlayId((p) => (p === id ? null : id))}
          onAddOverlay={handleAddOverlay}
          onDeleteOverlay={handleDeleteOverlay}
          onImportCSV={handleImportCSV}
          onToggleSeries={handleToggleSeries}
          onToggleFill={() => setShowFill((p) => !p)}
          onToggleEvents={() => setShowEvents((p) => !p)}
          onToggleOverlay={() => setShowOverlay((p) => !p)}
          onTogglePacket={handleTogglePacket}
        />

        {/* Chart column */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Toolbar */}
          <div
            className="flex items-center gap-4 px-6 py-3 shrink-0"
            style={{
              background: 'var(--surface)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div className="flex gap-1">
              {rangeButtons.map((yr) => (
                <button
                  key={yr}
                  onClick={() => setRangeStart(yr)}
                  className="px-3 py-1 rounded text-xs transition-all"
                  style={{
                    background: rangeStart === yr ? 'var(--gold-dim)' : 'transparent',
                    border: rangeStart === yr ? '1px solid var(--gold-line)' : '1px solid transparent',
                    color: rangeStart === yr ? 'var(--gold)' : 'var(--text-dim)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => {
                    if (rangeStart !== yr) e.currentTarget.style.color = 'var(--text)';
                  }}
                  onMouseLeave={(e) => {
                    if (rangeStart !== yr) e.currentTarget.style.color = 'var(--text-dim)';
                  }}
                >
                  {yr}
                </button>
              ))}
            </div>

            <div
              className="ml-auto font-serif text-sm"
              style={{ color: 'var(--text-dim)' }}
            >
              {domain.y_axis_label} · {domain.x_range.start}–{domain.x_range.end}
            </div>
          </div>

          {/* Canvas */}
          <ChartCanvas
            domain={domain}
            events={events}
            overlayEntries={overlayEntries}
            seriesCache={seriesCache}
            rangeStart={rangeStart}
            rangeEnd={domain.x_range.end}
            visibleSeries={visibleSeries}
            showEvents={showEvents}
            showOverlay={showOverlay}
            showFill={showFill}
            selectedEventId={selectedEventId}
            hoveredYear={hoveredYear}
            activePackets={activePackets}
            onHoverChange={handleHoverChange}
            onEventClick={handleEventClick}
            onOverlayClick={handleOverlayClick}
            canvasRef={canvasRef}
          />

          {/* Event detail */}
          {selectedEvent && (
            <EventDetailPanel
              domain={domain}
              event={selectedEvent}
              onClose={() => setSelectedEventId(null)}
            />
          )}

          {/* Insight bar */}
          <InsightBar
            domain={domain}
            events={events}
            overlayEntries={overlayEntries}
          />
        </div>
      </div>
    </div>
  );
}
