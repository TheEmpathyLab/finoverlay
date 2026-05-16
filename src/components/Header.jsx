import React from 'react';

export default function Header({ domain, events, onChangeDomain, onExportPNG }) {
  const eventCount = events?.length || 0;

  return (
    <header
      style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          height: 48,
        }}
      >
        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--text)',
              letterSpacing: '-0.01em',
            }}
          >
            Empath Graph
          </span>
          <span
            style={{
              fontSize: '0.6rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}
          >
            Knowledge Over Time
          </span>
        </div>

        {/* Domain label */}
        {domain && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: domain.color_scheme?.primary || 'var(--gold)',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: '0.68rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--text-dim)',
              }}
            >
              {domain.name}
            </span>
            <span
              style={{
                fontSize: '0.65rem',
                color: 'var(--text-muted)',
                borderLeft: '1px solid var(--border)',
                paddingLeft: 8,
              }}
            >
              {eventCount} events
            </span>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={onChangeDomain}
            style={{
              padding: '5px 13px',
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-dim)',
              fontSize: '0.7rem',
              letterSpacing: '0.06em',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
              borderRadius: 2,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--text)';
              e.currentTarget.style.color = 'var(--text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-dim)';
            }}
          >
            Change Domain
          </button>
          <button
            onClick={onExportPNG}
            style={{
              padding: '5px 13px',
              background: 'var(--text)',
              border: '1px solid var(--text)',
              color: '#ffffff',
              fontSize: '0.7rem',
              letterSpacing: '0.06em',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 500,
              transition: 'background 0.15s',
              borderRadius: 2,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#333333'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--text)'; }}
          >
            Export PNG
          </button>
        </div>
      </div>
    </header>
  );
}
