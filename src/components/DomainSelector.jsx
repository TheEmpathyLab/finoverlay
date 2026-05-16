import React, { useState } from 'react';
import registry from '../data/registry.json';

const DOMAIN_ACCENT = {
  'financial-markets': '#2b5ea7',
  'voting-rights': '#6b4faa',
};

export default function DomainSelector({ onSelect }) {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen fade-up"
      style={{ background: 'var(--bg)' }}
    >
      {/* Masthead */}
      <div style={{ maxWidth: 680, width: '100%', padding: '0 24px', marginBottom: 28, textAlign: 'center' }}>
        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '2.75rem',
            fontWeight: 700,
            color: 'var(--text)',
            lineHeight: 1,
            letterSpacing: '-0.01em',
            marginBottom: 8,
          }}
        >
          Stratum
        </div>
        <div
          style={{
            fontSize: '0.6rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: 14,
          }}
        >
          Historical Impact Overlay Engine
        </div>
        <div style={{ borderTop: '1px solid var(--border)' }} />
      </div>

      {/* Domain list */}
      <div style={{ width: '100%', maxWidth: 680, padding: '0 24px' }}>
        <div
          style={{
            fontSize: '0.6rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: 6,
          }}
        >
          Choose a Domain
        </div>
        <div style={{ borderTop: '2px solid var(--text)' }} />
        {registry.map((domain, idx) => (
          <DomainCard
            key={domain.id}
            domain={domain}
            accent={DOMAIN_ACCENT[domain.id] || 'var(--gold)'}
            onSelect={onSelect}
            isLast={idx === registry.length - 1}
          />
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 32,
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          letterSpacing: '0.04em',
        }}
      >
        Domain-agnostic &nbsp;&middot;&nbsp; Add new domains by dropping a JSON file
      </div>
    </div>
  );
}

function DomainCard({ domain, accent, onSelect, isLast }) {
  const [hovered, setHovered] = useState(false);

  const yearRange = domain.tagline.match(/\d{4}[–\-]\d{4}/)?.[0] || '';

  return (
    <button
      onClick={() => onSelect(domain.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        gap: 20,
        alignItems: 'flex-start',
        width: '100%',
        padding: `18px ${hovered ? '8px' : '0'}`,
        background: hovered ? 'var(--surface2)' : 'transparent',
        border: 'none',
        borderBottom: isLast ? 'none' : '1px solid var(--border)',
        cursor: 'pointer',
        transition: 'background 0.15s, padding 0.15s',
        textAlign: 'left',
      }}
    >
      {/* Year range */}
      <div style={{ flexShrink: 0, width: 90, paddingTop: 4, textAlign: 'right' }}>
        <span
          style={{
            fontSize: '0.62rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            fontFamily: "'DM Mono', monospace",
          }}
        >
          {yearRange}
        </span>
      </div>

      {/* Vertical accent rule */}
      <div
        style={{
          width: 3,
          alignSelf: 'stretch',
          background: accent,
          flexShrink: 0,
          borderRadius: 1,
        }}
      />

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '1.4rem',
            fontWeight: 700,
            color: 'var(--text)',
            lineHeight: 1.2,
            marginBottom: 4,
          }}
        >
          {domain.name}
        </div>
        <div
          style={{
            fontSize: '0.82rem',
            color: 'var(--text-dim)',
            lineHeight: 1.5,
            marginBottom: 6,
          }}
        >
          {domain.tagline}
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <span
            style={{
              fontSize: '0.65rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}
          >
            {domain.event_count} events
          </span>
          <span
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-dim)',
              fontStyle: 'italic',
            }}
          >
            {domain.overlay_prompt}
          </span>
        </div>
      </div>

      {/* Arrow */}
      <div
        style={{
          flexShrink: 0,
          fontSize: '1rem',
          color: hovered ? 'var(--text)' : 'var(--text-muted)',
          transition: 'color 0.15s, transform 0.15s',
          transform: hovered ? 'translateX(3px)' : 'none',
          paddingTop: 6,
        }}
      >
        →
      </div>
    </button>
  );
}
