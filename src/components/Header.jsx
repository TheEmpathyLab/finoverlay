import React from 'react';

export default function Header({ domain, events, onChangeDomain, onExportPNG }) {
  const eventCount = events?.length || 0;

  return (
    <header
      className="flex items-center justify-between px-8 py-4 shrink-0"
      style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <span className="font-serif text-xl" style={{ color: 'var(--gold)' }}>
          Stratum
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Historical Impact Overlay Engine
        </span>
      </div>

      {/* Domain badge */}
      {domain && (
        <div
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm"
          style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
          }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: domain.color_scheme?.primary || 'var(--gold)' }}
          />
          <span className="font-medium" style={{ color: 'var(--text)' }}>
            {domain.name}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
            {eventCount} events
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onChangeDomain}
          className="px-4 py-2 rounded text-xs transition-all"
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-dim)',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--gold)';
            e.currentTarget.style.color = 'var(--gold)';
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
          className="px-4 py-2 rounded text-xs font-medium transition-all"
          style={{
            background: 'var(--gold)',
            border: '1px solid var(--gold)',
            color: '#0a0d14',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#dbb85a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--gold)';
          }}
        >
          Export PNG
        </button>
      </div>
    </header>
  );
}
