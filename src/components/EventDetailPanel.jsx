import React from 'react';

export default function EventDetailPanel({ domain, event, onClose }) {
  if (!event) return null;

  const color = domain?.color_scheme?.[event.direction] || 'var(--gold)';
  const dirLabel = domain?.direction_labels?.[event.direction] || event.direction;

  const dots = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div
      className="shrink-0"
      style={{
        background: 'var(--surface)',
        borderTop: `3px solid ${color}`,
        maxHeight: 210,
        overflowY: 'auto',
        padding: '16px 24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
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
              fontSize: '1.15rem',
              fontWeight: 700,
              color: 'var(--text)',
              lineHeight: 1.25,
              marginBottom: 8,
            }}
          >
            {event.title}
          </div>

          {/* Magnitude */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8,
            }}
          >
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
          <p
            style={{
              fontSize: '0.82rem',
              lineHeight: 1.6,
              color: 'var(--text-dim)',
            }}
          >
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
