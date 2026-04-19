import { describe, it, expect } from 'vitest';
import { computeIssueNumbers } from '../../src/lib/issue-numbering';

describe('computeIssueNumbers', () => {
  it('assigns #1 to the earliest issue, #2 to the next, etc.', () => {
    const numbered = computeIssueNumbers([
      { folder: '2026-05', releaseDate: '2026-05-15' },
      { folder: '2026-04', releaseDate: '2026-04-15' },
      { folder: '2026-06', releaseDate: '2026-06-15' }
    ]);
    expect(numbered).toEqual([
      { folder: '2026-04', releaseDate: '2026-04-15', number: 1 },
      { folder: '2026-05', releaseDate: '2026-05-15', number: 2 },
      { folder: '2026-06', releaseDate: '2026-06-15', number: 3 }
    ]);
  });

  it('is stable — input order does not affect output assignment', () => {
    const a = computeIssueNumbers([
      { folder: '2026-04', releaseDate: '2026-04-15' },
      { folder: '2026-05', releaseDate: '2026-05-15' }
    ]);
    const b = computeIssueNumbers([
      { folder: '2026-05', releaseDate: '2026-05-15' },
      { folder: '2026-04', releaseDate: '2026-04-15' }
    ]);
    expect(a).toEqual(b);
  });

  it('backfilling an older issue renumbers downstream (documented behavior)', () => {
    const before = computeIssueNumbers([
      { folder: '2026-04', releaseDate: '2026-04-15' }
    ]);
    expect(before[0].number).toBe(1);

    const after = computeIssueNumbers([
      { folder: '2026-04', releaseDate: '2026-04-15' },
      { folder: '2025-11', releaseDate: '2025-11-15' }
    ]);
    expect(after.find((i) => i.folder === '2025-11')?.number).toBe(1);
    expect(after.find((i) => i.folder === '2026-04')?.number).toBe(2);
  });

  it('handles empty input', () => {
    expect(computeIssueNumbers([])).toEqual([]);
  });
});
