const FOLDER_RE = /^(\d{4})-(\d{2})$/;
const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function assertFolderMatchesReleaseDate(folder: string, releaseDate: string): void {
  const folderMatch = FOLDER_RE.exec(folder);
  if (!folderMatch) {
    throw new Error(`Issue folder must be YYYY-MM, got "${folder}"`);
  }
  const isoMatch = ISO_RE.exec(releaseDate);
  if (!isoMatch) {
    throw new Error(`releaseDate must be ISO YYYY-MM-DD, got "${releaseDate}"`);
  }
  const [, fy, fm] = folderMatch;
  const [, iy, im] = isoMatch;
  if (fy !== iy || fm !== im) {
    throw new Error(
      `Issue folder "${folder}" does not match releaseDate year/month (${iy}-${im})`
    );
  }
}

export const levelSlugs = ['udskoling', 'gymnasium', 'universitet', 'kandidat'] as const;
export type Level = typeof levelSlugs[number];

export function assertAllLevelFilesPresent(
  folder: string,
  locale: string,
  files: Set<string>
): void {
  const missing: Level[] = [];
  for (const level of levelSlugs) {
    const expected = `issues/${folder}/${locale}/${level}.md`;
    if (!files.has(expected)) missing.push(level);
  }
  if (missing.length > 0) {
    throw new Error(
      `Issue "${folder}" (${locale}) is missing level files: ${missing.join(', ')}`
    );
  }
}

export function assertUniqueReleaseDates(
  issues: Array<{ folder: string; releaseDate: string }>
): void {
  const byDate = new Map<string, string[]>();
  for (const issue of issues) {
    const folders = byDate.get(issue.releaseDate) ?? [];
    folders.push(issue.folder);
    byDate.set(issue.releaseDate, folders);
  }
  for (const [date, folders] of byDate) {
    if (folders.length > 1) {
      throw new Error(
        `Duplicate releaseDate ${date} on issues: ${folders.join(', ')}`
      );
    }
  }
}
