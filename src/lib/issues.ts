import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { computeIssueNumbers } from './issue-numbering';
import { resolveLatestPublished } from './latest-issue';
import { levelSlugs, type Level } from './validate-issues';

export type IssueEntry = CollectionEntry<'issues'>;
export type IssueBodyEntry = CollectionEntry<'issueBodies'>;

export async function getAllIssues(): Promise<IssueEntry[]> {
  const all = await getCollection('issues');
  return all.filter((entry) => !entry.id.startsWith('_'));
}

export async function getIssuesNumbered() {
  const entries = await getAllIssues();
  const refs = entries.map((entry) => ({
    folder: entry.id,
    releaseDate: entry.data.releaseDate,
    entry
  }));
  return computeIssueNumbers(refs);
}

export async function getLatestPublishedIssue(today: Date = new Date()) {
  const numbered = await getIssuesNumbered();
  return resolveLatestPublished(numbered, today);
}

export async function getIssueBody(
  folder: string,
  level: Level,
  locale: string = 'da'
): Promise<IssueBodyEntry> {
  const all = await getCollection('issueBodies');
  const match = all.find((entry) => entry.id === `${folder}/${locale}/${level}`);
  if (!match) {
    throw new Error(
      `Missing body for issue ${folder} (${locale}/${level}). ` +
      `Expected: src/content/issues/${folder}/${locale}/${level}.md`
    );
  }
  return match;
}

export { levelSlugs, type Level };
