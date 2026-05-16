import React from 'react';
import { generateNarrative } from '../engine/narrative.js';

export default function InsightBar({ domain, events, overlayEntries }) {
  if (!domain) return null;

  const sorted = [...overlayEntries].sort((a, b) => a.date - b.date);
  const firstEntry = sorted[0];
  const lastEntry = sorted[sorted.length - 1];

  const spanStart = firstEntry?.date;
  const spanEnd = lastEntry?.date;

  const eventsInSpan =
    spanStart !== undefined
      ? events.filter((e) => e.date >= spanStart && e.date <= spanEnd)
      : [];

  const expandsCount = eventsInSpan.filter((e) => e.direction === 'expands').length;
  const restrictsCount = eventsInSpan.filter((e) => e.direction === 'restricts').length;

  const narrative = generateNarrative(domain, events, overlayEntries);

  const isFinancial = domain.chart_type === 'logarithmic_series';

  return (
    <div
      className="flex items-center gap-6 px-6 py-3 shrink-0 overflow-x-auto"
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        minHeight: 72,
      }}
    >
      {/* Stats */}
      <InsightItem
        label="Overlay Entries"
        value={overlayEntries.length}
        className="gold"
      />
      <Divider />

      {overlayEntries.length > 0 && (
        <>
          <InsightItem
            label="Date Range"
            value={`${spanStart}–${spanEnd}`}
            className="gold"
          />
          <Divider />
        </>
      )}

      {isFinancial ? (
        <>
          <InsightItem
            label="Market Events in Range"
            value={overlayEntries.length > 0 ? eventsInSpan.length : '—'}
          />
          <Divider />
          <InsightItem
            label="Contractions"
            value={overlayEntries.length > 0 ? restrictsCount : '—'}
            className="neg"
          />
        </>
      ) : (
        <>
          <InsightItem
            label="Decisions in Range"
            value={overlayEntries.length > 0 ? eventsInSpan.length : '—'}
          />
          <Divider />
          <InsightItem
            label="Expanding"
            value={overlayEntries.length > 0 ? expandsCount : '—'}
            className="pos"
          />
          <Divider />
          <InsightItem
            label="Restricting"
            value={overlayEntries.length > 0 ? restrictsCount : '—'}
            className="neg"
          />
        </>
      )}

      {/* Narrative */}
      <div
        className="ml-auto text-sm italic text-right"
        style={{
          color: 'var(--text-dim)',
          maxWidth: 400,
          lineHeight: 1.5,
          flexShrink: 0,
        }}
      >
        {narrative}
      </div>
    </div>
  );
}

function InsightItem({ label, value, className }) {
  const color =
    className === 'gold'
      ? 'var(--gold)'
      : className === 'pos'
      ? 'var(--green)'
      : className === 'neg'
      ? 'var(--red)'
      : 'var(--text)';

  return (
    <div className="flex flex-col shrink-0">
      <span
        className="text-xs uppercase tracking-widest"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </span>
      <span
        className="font-mono text-base mt-0.5"
        style={{ color }}
      >
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return (
    <div
      className="shrink-0"
      style={{ width: 1, height: 32, background: 'var(--border)' }}
    />
  );
}
