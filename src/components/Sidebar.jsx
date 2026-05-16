import React, { useState } from 'react';
import OverlayPanel from './OverlayPanel.jsx';

export default function Sidebar({
  domain,
  overlayEntries,
  selectedOverlayId,
  visibleSeries,
  showFill,
  showEvents,
  showOverlay,
  packetRegistry,
  activePacketIds,
  onSelectOverlay,
  onAddOverlay,
  onDeleteOverlay,
  onImportCSV,
  onToggleSeries,
  onToggleFill,
  onToggleEvents,
  onToggleOverlay,
  onTogglePacket,
}) {
  const [activeTab, setActiveTab] = useState('overlay');

  return (
    <div
      className="flex flex-col h-full"
      style={{
        width: 300,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        flexShrink: 0,
      }}
    >
      {/* Tabs */}
      <div
        className="flex shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <TabButton
          label="Overlay"
          active={activeTab === 'overlay'}
          onClick={() => setActiveTab('overlay')}
        />
        <TabButton
          label="Layers"
          active={activeTab === 'layers'}
          onClick={() => setActiveTab('layers')}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'overlay' ? (
          <OverlayPanel
            domain={domain}
            overlayEntries={overlayEntries}
            selectedOverlayId={selectedOverlayId}
            onSelect={onSelectOverlay}
            onAdd={onAddOverlay}
            onDelete={onDeleteOverlay}
            onImportCSV={onImportCSV}
          />
        ) : (
          <LayersPanel
            domain={domain}
            visibleSeries={visibleSeries}
            showFill={showFill}
            showEvents={showEvents}
            showOverlay={showOverlay}
            packetRegistry={packetRegistry}
            activePacketIds={activePacketIds}
            onToggleSeries={onToggleSeries}
            onToggleFill={onToggleFill}
            onToggleEvents={onToggleEvents}
            onToggleOverlay={onToggleOverlay}
            onTogglePacket={onTogglePacket}
          />
        )}
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '11px 0',
        background: 'transparent',
        border: 'none',
        borderBottom: `2px solid ${active ? 'var(--text)' : 'transparent'}`,
        color: active ? 'var(--text)' : 'var(--text-muted)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: '0.62rem',
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        transition: 'color 0.15s',
      }}
    >
      {label}
    </button>
  );
}

function LayersPanel({
  domain,
  visibleSeries,
  showFill,
  showEvents,
  showOverlay,
  packetRegistry,
  activePacketIds,
  onToggleSeries,
  onToggleFill,
  onToggleEvents,
  onToggleOverlay,
  onTogglePacket,
}) {
  const hasSeries = domain?.series && domain.series.length > 0;

  const compatiblePackets = (packetRegistry || []).filter((p) => {
    if (!domain) return false;
    if (!p.compatible_x_units.includes(domain.x_unit)) return false;
    const dStart = domain.x_range.start;
    const dEnd = domain.x_range.end;
    return p.time_range.start <= dEnd && p.time_range.end >= dStart;
  });

  return (
    <div className="overflow-y-auto h-full px-4 py-4">
      <SectionLabel>Context Packets</SectionLabel>
      {compatiblePackets.length === 0 && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12, fontStyle: 'italic' }}>
          No packets available for this domain.
        </div>
      )}
      {compatiblePackets.map((p) => (
        <PacketToggle
          key={p.id}
          meta={p}
          on={activePacketIds?.has(p.id)}
          onClick={() => onTogglePacket(p.id)}
        />
      ))}

      {hasSeries && (
        <>
          <SectionLabel>Data Series</SectionLabel>
          {domain.series.map((s) => (
            <LayerToggle
              key={s.key}
              label={s.label}
              color={s.color}
              on={visibleSeries.includes(s.key)}
              onClick={() => onToggleSeries(s.key)}
            />
          ))}
        </>
      )}

      <SectionLabel>Chart Style</SectionLabel>
      {hasSeries && (
        <LayerToggle
          label="Fill under curves"
          color="var(--text-dim)"
          on={showFill}
          onClick={onToggleFill}
        />
      )}
      <LayerToggle
        label="Show domain events"
        color="var(--text-dim)"
        on={showEvents}
        onClick={onToggleEvents}
      />
      <LayerToggle
        label="Show overlay entries"
        color="var(--gold)"
        on={showOverlay}
        onClick={onToggleOverlay}
      />
    </div>
  );
}

function PacketToggle({ meta, on, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        marginBottom: 8,
        padding: '10px 12px',
        background: on ? 'var(--surface2)' : hovered ? 'var(--surface2)' : 'transparent',
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${on ? 'var(--text)' : 'var(--border)'}`,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 2 }}>
            {(meta.legend || []).slice(0, 3).map((l) => (
              <div
                key={l.label}
                style={{ width: 5, height: 12, background: l.color, opacity: 0.75 }}
              />
            ))}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text)' }}>{meta.name}</span>
        </div>
        <div className={`toggle-sw ${on ? 'on' : ''}`} />
      </div>
      <div style={{ fontSize: '0.68rem', marginTop: 4, color: 'var(--text-muted)', paddingLeft: 17 }}>
        {meta.description}
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontSize: '0.58rem',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        marginBottom: 8,
        marginTop: 16,
        paddingBottom: 5,
        borderBottom: '1px solid var(--border)',
      }}
    >
      {children}
    </div>
  );
}

function LayerToggle({ label, color, on, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 10px',
        marginBottom: 6,
        background: hovered ? 'var(--surface2)' : 'transparent',
        border: '1px solid var(--border)',
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }}
        />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          {label}
        </span>
      </div>
      <div className={`toggle-sw ${on ? 'on' : ''}`} />
    </div>
  );
}
