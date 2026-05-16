import React, { useState, useRef } from 'react';
import { parseCSV } from '../engine/csvParser.js';

export default function OverlayPanel({
  domain,
  overlayEntries,
  selectedOverlayId,
  onSelect,
  onAdd,
  onDelete,
  onImportCSV,
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: '', title: '', value: '', note: '' });
  const [formError, setFormError] = useState('');
  const fileRef = useRef(null);

  const sorted = [...overlayEntries].sort((a, b) => a.date - b.date);

  function handleAdd() {
    const year = parseInt(form.date, 10);
    if (!form.title.trim() || isNaN(year) || year < 1000 || year > 2100) {
      setFormError('Please enter a valid year and title.');
      return;
    }
    onAdd({
      id: `overlay-${Date.now()}`,
      date: year,
      title: form.title.trim(),
      value: form.value.trim(),
      note: form.note.trim(),
      unit: '',
      added_by: 'user',
    });
    setForm({ date: '', title: '', value: '', note: '' });
    setFormError('');
    setShowForm(false);
  }

  function handleCSVChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const { entries, errors } = parseCSV(ev.target.result);
      if (errors.length > 0) {
        alert('CSV import errors:\n' + errors.join('\n'));
      }
      if (entries.length > 0) {
        onImportCSV(entries);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="flex flex-col h-full">
      {/* Entry list */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <SectionLabel>{domain?.default_overlay_label || 'Overlay'} Entries</SectionLabel>

        {sorted.length === 0 && (
          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              textAlign: 'center',
              padding: '24px 0',
              fontStyle: 'italic',
            }}
          >
            No entries yet.
          </div>
        )}

        {sorted.map((entry) => (
          <OverlayItem
            key={entry.id}
            entry={entry}
            isSelected={selectedOverlayId === entry.id}
            onSelect={() => onSelect(entry.id)}
            onDelete={() => onDelete(entry.id)}
          />
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <div
          style={{
            margin: '0 16px 12px',
            padding: '14px',
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
          }}
        >
          <FormRow label="Year">
            <input
              type="number"
              placeholder={`${domain?.x_range?.start || 1900}`}
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              style={inputStyle}
            />
          </FormRow>
          <FormRow label="Title">
            <input
              type="text"
              placeholder="e.g. Started first job"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={inputStyle}
            />
          </FormRow>
          <FormRow label="Value (optional)">
            <input
              type="text"
              placeholder="e.g. $120,000"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              style={inputStyle}
            />
          </FormRow>
          <FormRow label="Note (optional)">
            <textarea
              placeholder="Context for this entry..."
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={2}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 52 }}
            />
          </FormRow>

          {formError && (
            <div style={{ fontSize: '0.72rem', marginBottom: 8, color: 'var(--red)' }}>
              {formError}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              onClick={() => { setShowForm(false); setFormError(''); }}
              style={{ ...btnStyle, flex: 1 }}
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              style={{
                ...btnStyle,
                flex: 1,
                background: 'var(--text)',
                color: '#ffffff',
                border: '1px solid var(--text)',
                fontWeight: 500,
              }}
            >
              Add Entry
            </button>
          </div>
        </div>
      )}

      {/* Bottom actions */}
      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              width: '100%',
              padding: '9px',
              border: '1px dashed var(--border)',
              background: 'transparent',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              letterSpacing: '0.04em',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderStyle = 'solid';
              e.currentTarget.style.borderColor = 'var(--text)';
              e.currentTarget.style.color = 'var(--text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderStyle = 'dashed';
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            + Add Entry
          </button>
        )}

        <button
          onClick={() => fileRef.current?.click()}
          style={{ ...btnStyle, width: '100%', textAlign: 'center' }}
        >
          Import CSV
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={handleCSVChange}
        />
      </div>
    </div>
  );
}

function OverlayItem({ entry, isSelected, onSelect, onDelete }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 6,
        padding: '10px 12px',
        background: isSelected ? 'var(--surface2)' : hovered ? 'var(--surface2)' : 'transparent',
        border: `1px solid ${isSelected ? 'var(--gold)' : 'var(--border)'}`,
        borderLeft: `3px solid ${isSelected ? 'var(--gold)' : 'var(--border)'}`,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '0.82rem',
            fontWeight: 500,
            color: 'var(--text)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {entry.title}
        </div>
        <div style={{ fontSize: '0.7rem', marginTop: 2, color: 'var(--text-dim)' }}>
          {entry.date}
          {entry.value && (
            <span style={{ marginLeft: 8, fontFamily: "'DM Mono', monospace", color: 'var(--gold)' }}>
              {entry.value}
            </span>
          )}
        </div>
        {entry.note && (
          <div
            style={{
              fontSize: '0.7rem',
              marginTop: 2,
              color: 'var(--text-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {entry.note}
          </div>
        )}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '0 2px',
          flexShrink: 0,
          fontSize: 16,
          lineHeight: 1,
          opacity: hovered ? 0.6 : 0,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.color = 'var(--red)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.6';
          e.currentTarget.style.color = 'var(--text-muted)';
        }}
      >
        ×
      </button>
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
        marginBottom: 10,
        paddingBottom: 5,
        borderBottom: '1px solid var(--border)',
      }}
    >
      {children}
    </div>
  );
}

function FormRow({ label, children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label
        style={{
          display: 'block',
          fontSize: '0.65rem',
          marginBottom: 4,
          color: 'var(--text-dim)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 0,
  color: 'var(--text)',
  padding: '7px 10px',
  fontSize: '0.8rem',
  fontFamily: 'inherit',
  outline: 'none',
};

const btnStyle = {
  padding: '8px 14px',
  fontSize: '0.7rem',
  letterSpacing: '0.04em',
  cursor: 'pointer',
  border: '1px solid var(--border)',
  borderRadius: 0,
  background: 'transparent',
  color: 'var(--text-dim)',
  fontFamily: 'inherit',
  transition: 'all 0.15s',
};
