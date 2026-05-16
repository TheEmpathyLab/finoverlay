import React from 'react';

export default function EventDetailPanel({ domain, event, onClose }) {
  if (!event) return null;

  const color = domain?.color_scheme?.[event.direction] || 'var(--gold)';
  const dirLabel = domain?.direction_labels?.[event.direction] || event.direction;

  const dots = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div
      className="shrink-0 px-6 py-4"
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        maxHeight: 200,
        overflowY: 'auto',
      }}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <span className="font-serif text-lg" style={{ color: 'var(--text)' }}>
              {event.title}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                color: 'var(--text-dim)',
              }}
            >
              {event.date}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded uppercase tracking-wide"
              style={{ background: color + '22', color, border: `1px solid ${color}55` }}
            >
              {event.category}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{ background: color + '22', color }}
            >
              {dirLabel}
            </span>
          </div>

          {/* Magnitude */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              {domain?.magnitude_label || 'Magnitude'}:
            </span>
            <div className="flex gap-1">
              {dots.map((d) => (
                <div
                  key={d}
                  className="rounded-full"
                  style={{
                    width: 8,
                    height: 8,
                    background: d <= event.magnitude ? color : 'var(--surface2)',
                    border: `1px solid ${d <= event.magnitude ? color : 'var(--border)'}`,
                  }}
                />
              ))}
            </div>
            <span className="text-xs font-mono" style={{ color }}>
              {event.magnitude}/10
            </span>
          </div>

          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-dim)' }}>
            {event.description}
          </p>

          {event.source_url && (
            <a
              href={event.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs mt-2 inline-block"
              style={{ color: 'var(--gold)' }}
            >
              Source →
            </a>
          )}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="shrink-0 text-sm transition-colors"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: 18,
            lineHeight: 1,
            padding: '2px 4px',
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
