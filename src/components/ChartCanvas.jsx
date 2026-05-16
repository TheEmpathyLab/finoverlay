import React, { useRef, useEffect, useCallback } from 'react';
import { render, getYearAtX } from '../engine/renderer.js';

export default function ChartCanvas({
  domain,
  events,
  overlayEntries,
  seriesCache,
  rangeStart,
  rangeEnd,
  visibleSeries,
  showEvents,
  showOverlay,
  showFill,
  selectedEventId,
  hoveredYear,
  activePackets,
  onHoverChange,
  onEventClick,
  onOverlayClick,
  canvasRef: externalCanvasRef,
}) {
  const internalRef = useRef(null);
  const canvasRef = externalCanvasRef || internalRef;
  const wrapRef = useRef(null);

  const doRender = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !domain) return;

    render(canvas, {
      domain,
      events: events || [],
      overlayEntries: overlayEntries || [],
      seriesCache,
      config: {
        rangeStart,
        rangeEnd,
        visibleSeries: visibleSeries || [],
        showEvents,
        showOverlay,
        showFill,
        selectedEventId,
        hoveredYear,
        activePackets: activePackets || [],
      },
      callbacks: {
        onHoverChange,
        onEventClick,
        onOverlayClick,
      },
    });
  }, [
    domain, events, overlayEntries, seriesCache,
    rangeStart, rangeEnd, visibleSeries,
    showEvents, showOverlay, showFill,
    selectedEventId, hoveredYear, activePackets,
    onHoverChange, onEventClick, onOverlayClick,
    canvasRef,
  ]);

  // Re-render on prop changes
  useEffect(() => {
    doRender();
  }, [doRender]);

  // ResizeObserver
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    function updateSize() {
      const dpr = window.devicePixelRatio || 1;
      const w = wrap.offsetWidth;
      const h = wrap.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      doRender();
    }

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [doRender, canvasRef]);

  function handleMouseMove(e) {
    const canvas = canvasRef.current;
    if (!canvas || !domain) return;
    const year = getYearAtX(canvas, domain, rangeStart, rangeEnd, e.clientX);
    onHoverChange?.(year, e.clientX, e.clientY);
  }

  function handleMouseLeave() {
    onHoverChange?.(null, null, null);
  }

  function handleClick(e) {
    const canvas = canvasRef.current;
    if (!canvas || !domain) return;
    const year = getYearAtX(canvas, domain, rangeStart, rangeEnd, e.clientX);

    // Find nearest event
    const visStart = Math.max(domain.x_range.start, rangeStart);
    const visEnd = rangeEnd !== undefined ? Math.min(domain.x_range.end, rangeEnd) : domain.x_range.end;

    if (showEvents && events) {
      const eventsInRange = events.filter(
        (ev) => ev.date >= visStart && ev.date <= visEnd
      );
      let nearestYear = null;
      let minDist = 3;
      for (const ev of eventsInRange) {
        const dist = Math.abs(ev.date - year);
        if (dist < minDist) { minDist = dist; nearestYear = ev.date; }
      }
      if (nearestYear !== null) {
        const yearEvents = eventsInRange
          .filter((ev) => ev.date === nearestYear)
          .sort((a, b) => b.magnitude - a.magnitude);
        onEventClick?.(yearEvents);
        return;
      }
    }

    // Find nearest overlay entry
    if (showOverlay && overlayEntries) {
      const overlayInRange = overlayEntries.filter(
        (ov) => ov.date >= visStart && ov.date <= visEnd
      );
      let nearest = null;
      let minDist = 3;
      for (const ov of overlayInRange) {
        const dist = Math.abs(ov.date - year);
        if (dist < minDist) {
          minDist = dist;
          nearest = ov;
        }
      }
      if (nearest) {
        onOverlayClick?.(nearest);
      }
    }
  }

  return (
    <div ref={wrapRef} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', cursor: 'crosshair' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />
    </div>
  );
}
