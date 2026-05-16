import React from 'react';
import registry from '../data/registry.json';

export default function DomainSelector({ onSelect }) {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen fade-up"
      style={{ background: 'var(--bg)' }}
    >
      {/* Header */}
      <div className="text-center mb-12">
        <div
          className="font-serif text-4xl mb-2"
          style={{ color: 'var(--gold)' }}
        >
          Stratum
        </div>
        <div className="text-sm" style={{ color: 'var(--text-dim)' }}>
          Historical Impact Overlay Engine
        </div>
      </div>

      {/* Domain cards */}
      <div className="grid grid-cols-1 gap-6 w-full max-w-3xl px-6 md:grid-cols-2">
        {registry.map((domain) => (
          <DomainCard key={domain.id} domain={domain} onSelect={onSelect} />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 text-xs" style={{ color: 'var(--text-muted)' }}>
        Domain-agnostic &nbsp;&middot;&nbsp; Add new domains by dropping a JSON file
      </div>
    </div>
  );
}

function DomainCard({ domain, onSelect }) {
  return (
    <button
      onClick={() => onSelect(domain.id)}
      className="text-left rounded-xl p-6 transition-all duration-200 group"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--gold)';
        e.currentTarget.style.boxShadow = '0 0 0 1px rgba(201,168,76,0.2), 0 8px 32px rgba(0,0,0,0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Time range badge */}
      <div
        className="inline-block text-xs px-2 py-1 rounded mb-4 font-mono"
        style={{
          background: 'var(--gold-dim)',
          color: 'var(--gold)',
          border: '1px solid var(--gold-line)',
        }}
      >
        {domain.tagline.match(/\d{4}[–\-]\d{4}/)?.[0] || ''}
      </div>

      {/* Name */}
      <div
        className="font-serif text-2xl mb-2"
        style={{ color: 'var(--text)' }}
      >
        {domain.name}
      </div>

      {/* Tagline */}
      <div className="text-sm mb-4" style={{ color: 'var(--text-dim)' }}>
        {domain.tagline}
      </div>

      {/* Event count */}
      <div className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
        {domain.event_count} events in registry
      </div>

      {/* Overlay hint */}
      <div
        className="text-xs italic mb-4"
        style={{ color: 'var(--text-dim)' }}
      >
        {domain.overlay_prompt}
      </div>

      {/* CTA */}
      <div
        className="flex items-center gap-2 text-sm font-medium transition-colors"
        style={{ color: 'var(--gold)' }}
      >
        <span>Explore domain</span>
        <span className="text-base">→</span>
      </div>
    </button>
  );
}
