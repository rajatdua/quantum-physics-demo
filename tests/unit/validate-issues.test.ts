import { describe, it, expect } from 'vitest';
import { assertFolderMatchesReleaseDate } from '../../src/lib/validate-issues';
import { assertAllLevelFilesPresent } from '../../src/lib/validate-issues';
import { assertUniqueReleaseDates } from '../../src/lib/validate-issues';

describe('assertFolderMatchesReleaseDate', () => {
  it('passes when folder name matches year/month of releaseDate', () => {
    expect(() => assertFolderMatchesReleaseDate('2026-04', '2026-04-15')).not.toThrow();
  });

  it('passes at month boundary (first day)', () => {
    expect(() => assertFolderMatchesReleaseDate('2026-04', '2026-04-01')).not.toThrow();
  });

  it('passes at month boundary (last day)', () => {
    expect(() => assertFolderMatchesReleaseDate('2026-04', '2026-04-30')).not.toThrow();
  });

  it('throws when year differs', () => {
    expect(() =>
      assertFolderMatchesReleaseDate('2026-04', '2025-04-15')
    ).toThrow(/2026-04.*2025-04/);
  });

  it('throws when month differs', () => {
    expect(() =>
      assertFolderMatchesReleaseDate('2026-04', '2026-05-15')
    ).toThrow(/2026-04.*2026-05/);
  });

  it('throws on malformed folder name', () => {
    expect(() =>
      assertFolderMatchesReleaseDate('april-2026', '2026-04-15')
    ).toThrow(/YYYY-MM/);
  });

  it('throws on malformed releaseDate', () => {
    expect(() =>
      assertFolderMatchesReleaseDate('2026-04', '2026/04/15')
    ).toThrow(/ISO/);
  });
});

describe('assertAllLevelFilesPresent', () => {
  it('passes when all 4 level files exist', () => {
    const files = new Set([
      'issues/2026-04/da/udskoling.md',
      'issues/2026-04/da/gymnasium.md',
      'issues/2026-04/da/universitet.md',
      'issues/2026-04/da/kandidat.md'
    ]);
    expect(() => assertAllLevelFilesPresent('2026-04', 'da', files)).not.toThrow();
  });

  it('throws when one level file is missing (names the missing level)', () => {
    const files = new Set([
      'issues/2026-04/da/udskoling.md',
      'issues/2026-04/da/gymnasium.md',
      'issues/2026-04/da/universitet.md'
    ]);
    expect(() =>
      assertAllLevelFilesPresent('2026-04', 'da', files)
    ).toThrow(/kandidat/);
  });

  it('throws with all missing levels listed', () => {
    const files = new Set(['issues/2026-04/da/udskoling.md']);
    try {
      assertAllLevelFilesPresent('2026-04', 'da', files);
      throw new Error('should have thrown');
    } catch (e) {
      if (!(e instanceof Error)) throw e;
      expect(e.message).toContain('gymnasium');
      expect(e.message).toContain('universitet');
      expect(e.message).toContain('kandidat');
    }
  });
});

describe('assertUniqueReleaseDates', () => {
  it('passes when all dates are unique', () => {
    expect(() =>
      assertUniqueReleaseDates([
        { folder: '2026-04', releaseDate: '2026-04-15' },
        { folder: '2026-05', releaseDate: '2026-05-15' }
      ])
    ).not.toThrow();
  });

  it('throws when two issues share a releaseDate', () => {
    expect(() =>
      assertUniqueReleaseDates([
        { folder: '2026-04', releaseDate: '2026-04-15' },
        { folder: '2026-04-backup', releaseDate: '2026-04-15' }
      ])
    ).toThrow(/2026-04-15.*2026-04.*2026-04-backup/);
  });
});
