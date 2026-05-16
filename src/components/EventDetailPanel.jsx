import React, { useState, useEffect } from 'react';

export default function EventDetailPanel({ domain, events, onClose }) {
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Reset navigator when the year cluster changes
  useEffect(() => {
    setFocusedIndex(0);
  }, [events]);

  if (!events || events.length === 0) return null;

  const event = events[focusedIndex];
  const count = events.length;
  const color = domain?.color_scheme?.[event.direction] || 'var(--gold)';
  const dirLabel = domain?.direction_labels?.[event.direction] || event.direction;
  const dots = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div
      className="shrink-0"
      style={{
        background: 'var(--surface)',
        borderTop: `3px solid ${color}`,
        maxHeight: 220,
        overflowY: 'auto',
        padding: '0 24px 16px',
      }}
    >
      {/* Navigator — only shown when multiple events share this year */}
      {count > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 0 10px',
            borderBottom: '1px solid var(--border)',
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontSize: '0.6rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}
          >
            {count} events in {event.date}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Event dots */}
            <div style={{ display: 'flex', gap: 4, marginRight: 4 }}>
              {events.map((ev, idx) => (
                <button
                  key={ev.id}
                  onClick={() => setFocusedIndex(idx)}
                  title={ev.title}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: idx === focusedIndex
                      ? (domain?.color_scheme?.[ev.direction] || 'var(--text)')
                      : 'var(--border)',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'background 0.15s',
                  }}
                />
              ))}
            </div>
            <button
              onClick={() => setFocusedIndex((i) => Math.max(0, i - 1))}
              disabled={focusedIndex === 0}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                color: focusedIndex === 0 ? 'var(--border)' : 'var(--text-dim)',
                cursor: focusedIndex === 0 ? 'default' : 'pointer',
                fontSize: 12,
                lineHeight: 1,
                padding: '3px 7px',
                borderRadius: 2,
              }}
            >
              ←
            </button>
            <span
              style={{
                fontSize: '0.65rem',
                color: 'var(--text-muted)',
                minWidth: 32,
                textAlign: 'center',
              }}
            >
              {focusedIndex + 1} / {count}
            </span>
            <button
              onClick={() => setFocusedIndex((i) => Math.min(count - 1, i + 1))}
              disabled={focusedIndex === count - 1}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                color: focusedIndex === count - 1 ? 'var(--border)' : 'var(--text-dim)',
                cursor: focusedIndex === count - 1 ? 'default' : 'pointer',
                fontSize: 12,
                lineHeight: 1,
                padding: '3px 7px',
                borderRadius: 2,
              }}
            >
              →
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, paddingTop: count === 1 ? 16 : 0 }}>
        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Dateline */}
          <div
            style={{
              fontSize: '0.6rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            <span>{event.date}</span>
            <span style={{ color: 'var(--border)' }}>—</span>
            {event.category && <span>{event.category}</span>}
            {event.category && <span style={{ color: 'var(--border)' }}>—</span>}
            <span style={{ color }}>{dirLabel}</span>
          </div>

          {/* Headline */}
          <div
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--text)',
              lineHeight: 1.25,
              marginBottom: 8,
            }}
          >
            {event.title}
          </div>

          {/* Magnitude */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span
              style={{
                fontSize: '0.58rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
              }}
            >
              {domain?.magnitude_label || 'Magnitude'}
            </span>
            <div style={{ display: 'flex', gap: 3 }}>
              {dots.map((d) => (
                <div
                  key={d}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: d <= event.magnitude ? color : 'var(--border)',
                  }}
                />
              ))}
            </div>
            <span
              style={{
                fontSize: '0.68rem',
                fontFamily: "'DM Mono', monospace",
                color: 'var(--text-dim)',
              }}
            >
              {event.magnitude}/10
            </span>
          </div>

          {/* Body */}
          <p style={{ fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--text-dim)' }}>
            {event.description}
          </p>

          {event.source_url && (
            <a
              href={event.source_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                marginTop: 8,
                fontSize: '0.72rem',
                color: 'var(--text-dim)',
                textDecoration: 'underline',
                textUnderlineOffset: 2,
              }}
            >
              Source →
            </a>
          )}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: 18,
            lineHeight: 1,
            padding: '2px 4px',
            flexShrink: 0,
            transition: 'color 0.15s',
            marginTop: count > 1 ? 0 : 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
