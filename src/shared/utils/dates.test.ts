import { countWorkingDays, formatDateRange, formatDateTime } from './dates';

describe('countWorkingDays', () => {
  it.each([
    ['one weekday', '2026-11-02', '2026-11-02', 1],
    ['Monday to Friday', '2026-11-02', '2026-11-06', 5],
    ['Friday to Monday (weekend skipped)', '2026-11-06', '2026-11-09', 2],
    ['a weekend only', '2026-11-07', '2026-11-08', 0],
    ['across a month end', '2026-10-30', '2026-11-03', 3], // Fri, Mon, Tue
  ])('%s', (_label, start, end, expected) => {
    expect(countWorkingDays(start, end)).toBe(expected);
  });
});

describe('formatDateRange', () => {
  it('shows one date for a single day', () => {
    expect(formatDateRange('2026-11-02', '2026-11-02')).toBe('Mon 2 Nov');
  });
  it('shows start – end for a range', () => {
    expect(formatDateRange('2026-11-02', '2026-11-06')).toBe('Mon 2 Nov – Fri 6 Nov');
  });
});

describe('formatDateTime', () => {
  it('formats a moment as date and time', () => {
    expect(formatDateTime('2026-10-01T10:00:00')).toBe('1 Oct 2026, 10:00');
  });
});
