// Parse CSV text into OVERLAY_ENTRY array
// Expected columns: date, title, value, note, unit
// date column must be parseable as a year (YYYY)

let _idCounter = 1000;

export function parseCSV(csvText, addedBy = 'import') {
  const entries = [];
  const errors = [];

  const lines = csvText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    errors.push('CSV must have a header row and at least one data row.');
    return { entries, errors };
  }

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));
  const dateIdx = header.indexOf('date');
  const titleIdx = header.indexOf('title');
  const valueIdx = header.indexOf('value');
  const noteIdx = header.indexOf('note');
  const unitIdx = header.indexOf('unit');

  if (dateIdx < 0) {
    errors.push('CSV is missing a "date" column.');
    return { entries, errors };
  }
  if (titleIdx < 0) {
    errors.push('CSV is missing a "title" column.');
    return { entries, errors };
  }

  for (let i = 1; i < lines.length; i++) {
    const raw = lines[i];
    // Handle quoted fields
    const cols = _parseCsvRow(raw);

    const dateStr = cols[dateIdx]?.trim() || '';
    const titleStr = cols[titleIdx]?.trim() || '';
    const valueStr = valueIdx >= 0 ? (cols[valueIdx]?.trim() || '') : '';
    const noteStr = noteIdx >= 0 ? (cols[noteIdx]?.trim() || '') : '';
    const unitStr = unitIdx >= 0 ? (cols[unitIdx]?.trim() || '') : '';

    const year = parseInt(dateStr, 10);
    if (isNaN(year) || year < 1000 || year > 2100) {
      errors.push(`Row ${i + 1}: invalid date "${dateStr}" — expected a 4-digit year.`);
      continue;
    }
    if (!titleStr) {
      errors.push(`Row ${i + 1}: missing title.`);
      continue;
    }

    entries.push({
      id: `csv-${_idCounter++}`,
      date: year,
      title: titleStr,
      value: valueStr,
      note: noteStr,
      unit: unitStr,
      added_by: addedBy,
    });
  }

  return { entries, errors };
}

function _parseCsvRow(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}
