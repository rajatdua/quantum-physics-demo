import { describe, it, expect } from 'vitest';
import { resolveLatestPublished } from '../../src/lib/latest-issue';

const issues = [
  { folder: '2026-04', releaseDate: '2026-04-15' },
  { folder: '2026-05', releaseDate: '2026-05-15' },
  { folder: '2026-06', releaseDate: '2026-06-15' }
];

describe('resolveLatestPublished', () => {
  it('returns the most recent issue at or before today', () => {
    const result = resolveLatestPublished(issues, new Date('2026-05-20'));
    expect(result?.folder).toBe('2026-05');
  });

  it('returns the issue whose releaseDate equals today', () => {
    const result = resolveLatestPublished(issues, new Date('2026-05-15'));
    expect(result?.folder).toBe('2026-05');
  });

  it('skips future-dated issues', () => {
    const result = resolveLatestPublished(issues, new Date('2026-04-20'));
    expect(result?.folder).toBe('2026-04');
  });

  it('returns undefined when no issues are yet published', () => {
    const result = resolveLatestPublished(issues, new Date('2026-03-01'));
    expect(result).toBeUndefined();
  });

  it('returns undefined for empty input', () => {
    const result = resolveLatestPublished([], new Date('2026-05-01'));
    expect(result).toBeUndefined();
  });
});
