import type { IssueRef } from './issue-numbering';

export function resolveLatestPublished<T extends IssueRef>(
  issues: T[],
  today: Date
): T | undefined {
  const todayIso = today.toISOString().slice(0, 10);
  const published = issues.filter((i) => i.releaseDate <= todayIso);
  if (published.length === 0) return undefined;
  return published.reduce((latest, i) =>
    i.releaseDate > latest.releaseDate ? i : latest
  );
}
