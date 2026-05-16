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
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div
          className="text-xs uppercase tracking-widest mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          {domain?.default_overlay_label || 'Overlay'} Entries
        </div>

        {sorted.length === 0 && (
          <div
            className="text-sm text-center py-6"
            style={{ color: 'var(--text-muted)' }}
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
          className="mx-4 mb-3 p-4 rounded-xl"
          style={{
            background: 'var(--surface2)',
            border: '1px solid var(--gold-line)',
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
            <div className="text-xs mb-2" style={{ color: 'var(--red)' }}>
              {formError}
            </div>
          )}

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => { setShowForm(false); setFormError(''); }}
              style={{ ...btnStyle, flex: 1 }}
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              style={{ ...btnStyle, flex: 1, background: 'var(--gold)', color: '#0a0d14', border: '1px solid var(--gold)', fontWeight: 500 }}
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Bottom actions */}
      <div className="px-4 pb-4 flex flex-col gap-2 shrink-0">
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              width: '100%',
              padding: '9px',
              border: '1px dashed var(--border)',
              borderRadius: 8,
              background: 'transparent',
              color: 'var(--text-dim)',
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
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
  return (
    <div
      className="flex items-start gap-3 mb-2 p-3 rounded-lg cursor-pointer group relative transition-all"
      style={{
        background: isSelected ? 'var(--gold-dim)' : 'var(--surface2)',
        border: `1px solid ${isSelected ? 'var(--gold)' : 'var(--border)'}`,
        borderLeft: '3px solid var(--gold)',
      }}
      onClick={onSelect}
    >
      <div className="flex-1 min-w-0">
        <div
          className="text-sm font-medium truncate"
          style={{ color: 'var(--text)' }}
        >
          {entry.title}
        </div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>
          {entry.date}
          {entry.value && (
            <span className="ml-2 font-mono" style={{ color: 'var(--gold)' }}>
              {entry.value}
            </span>
          )}
        </div>
        {entry.note && (
          <div
            className="text-xs mt-1 truncate"
            style={{ color: 'var(--text-muted)' }}
          >
            {entry.note}
          </div>
        )}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity text-base"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--red)',
          cursor: 'pointer',
          padding: '0 2px',
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}

function FormRow({ label, children }) {
  return (
    <div className="mb-3">
      <label
        className="block text-xs mb-1"
        style={{ color: 'var(--text-dim)' }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  padding: '7px 10px',
  borderRadius: 6,
  fontSize: 13,
  fontFamily: 'inherit',
  outline: 'none',
};

const btnStyle = {
  padding: '8px 14px',
  borderRadius: 6,
  fontSize: 13,
  cursor: 'pointer',
  border: '1px solid var(--border)',
  background: 'transparent',
  color: 'var(--text-dim)',
  fontFamily: 'inherit',
  transition: 'all 0.2s',
};
