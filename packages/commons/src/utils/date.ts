/** Parse any of the common receipt date formats to a YYYY-MM-DD string */
export function parseDate(raw: string): string | null {
  // ISO already
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  // MM/DD/YY or MM/DD/YYYY
  const mdyMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
  if (mdyMatch) {
    const [, m, d, y] = mdyMatch;
    const year = (y ?? '').length === 2 ? `20${y}` : y;
    return `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  // "Mar 27 2026" or "March 27, 2026"
  const months: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
  };
  const longMatch = raw.match(/^([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})$/);
  if (longMatch) {
    const [, mon, d, y] = longMatch;
    const monthKey = (mon ?? '').toLowerCase().slice(0, 3);
    const monthNum = months[monthKey];
    if (monthNum) {
      return `${y}-${monthNum}-${String(d).padStart(2, '0')}`;
    }
  }

  return null;
}

/** Format a YYYY-MM-DD date for display: "Mar 27, 2026" */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Get today's date as a YYYY-MM-DD string */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0] ?? '';
}
