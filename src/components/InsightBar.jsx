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
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        minHeight: 64,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        overflowX: 'auto',
        gap: 0,
      }}
    >
      {/* Stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 }}>
        <InsightItem label="Entries" value={overlayEntries.length} accent="var(--gold)" />
        <Divider />

        {overlayEntries.length > 0 && (
          <>
            <InsightItem label="Range" value={`${spanStart}–${spanEnd}`} />
            <Divider />
          </>
        )}

        {isFinancial ? (
          <>
            <InsightItem
              label="Events in Range"
              value={overlayEntries.length > 0 ? eventsInSpan.length : '—'}
            />
            <Divider />
            <InsightItem
              label="Contractions"
              value={overlayEntries.length > 0 ? restrictsCount : '—'}
              accent="var(--red)"
            />
          </>
        ) : (
          <>
            <InsightItem
              label="Decisions"
              value={overlayEntries.length > 0 ? eventsInSpan.length : '—'}
            />
            <Divider />
            <InsightItem
              label="Expanding"
              value={overlayEntries.length > 0 ? expandsCount : '—'}
              accent="var(--green)"
            />
            <Divider />
            <InsightItem
              label="Restricting"
              value={overlayEntries.length > 0 ? restrictsCount : '—'}
              accent="var(--red)"
            />
          </>
        )}
      </div>

      {/* Pull quote narrative */}
      <div
        style={{
          marginLeft: 'auto',
          paddingLeft: 20,
          borderLeft: '2px solid var(--border)',
          maxWidth: 380,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: 'italic',
            fontSize: '0.8rem',
            lineHeight: 1.55,
            color: 'var(--text-dim)',
          }}
        >
          {narrative}
        </div>
      </div>
    </div>
  );
}

function InsightItem({ label, value, accent }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '0 16px', flexShrink: 0 }}>
      <span
        style={{
          fontSize: '0.54rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: 2,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '0.9rem',
          color: accent || 'var(--text)',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return (
    <div style={{ width: 1, height: 28, background: 'var(--border)', flexShrink: 0 }} />
  );
}
