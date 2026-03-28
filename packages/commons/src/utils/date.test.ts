import { parseDate, formatDate } from './date';

describe('parseDate', () => {
  // ── Happy path ──────────────────────────────────────────────────────────
  it('passes through ISO format unchanged', () => {
    expect(parseDate('2026-03-27')).toBe('2026-03-27');
  });

  it('parses MM/DD/YYYY', () => {
    expect(parseDate('03/27/2026')).toBe('2026-03-27');
  });

  it('parses MM/DD/YY (2-digit year)', () => {
    expect(parseDate('03/27/26')).toBe('2026-03-27');
  });

  it('parses single-digit month and day', () => {
    expect(parseDate('3/7/2026')).toBe('2026-03-07');
  });

  it('parses "Mar 27 2026" (short month name)', () => {
    expect(parseDate('Mar 27 2026')).toBe('2026-03-27');
  });

  it('parses "March 27, 2026" (long month name with comma)', () => {
    expect(parseDate('March 27, 2026')).toBe('2026-03-27');
  });

  it('parses all month abbreviations', () => {
    const cases: [string, string][] = [
      ['Jan 1 2026', '2026-01-01'],
      ['Feb 2 2026', '2026-02-02'],
      ['Apr 3 2026', '2026-04-03'],
      ['May 4 2026', '2026-05-04'],
      ['Jun 5 2026', '2026-06-05'],
      ['Jul 6 2026', '2026-07-06'],
      ['Aug 7 2026', '2026-08-07'],
      ['Sep 8 2026', '2026-09-08'],
      ['Oct 9 2026', '2026-10-09'],
      ['Nov 10 2026', '2026-11-10'],
      ['Dec 11 2026', '2026-12-11'],
    ];
    for (const [input, expected] of cases) {
      expect(parseDate(input)).toBe(expected);
    }
  });

  // ── Failure path ────────────────────────────────────────────────────────
  it('returns null for unrecognised format', () => {
    expect(parseDate('not a date')).toBeNull();
    expect(parseDate('')).toBeNull();
    expect(parseDate('27-03-2026')).toBeNull(); // DD-MM-YYYY not supported
  });

  // ── Edge cases ──────────────────────────────────────────────────────────
  it('pads month and day with leading zero', () => {
    expect(parseDate('1/5/2026')).toBe('2026-01-05');
  });

  it('handles December (month 12)', () => {
    expect(parseDate('Dec 31 2026')).toBe('2026-12-31');
  });
});

describe('formatDate', () => {
  it('formats ISO date as human-readable string', () => {
    // e.g. "Mar 27, 2026"
    const result = formatDate('2026-03-27');
    expect(result).toMatch(/Mar/);
    expect(result).toMatch(/27/);
    expect(result).toMatch(/2026/);
  });

  it('formats January correctly', () => {
    const result = formatDate('2026-01-01');
    expect(result).toMatch(/Jan/);
  });
});
