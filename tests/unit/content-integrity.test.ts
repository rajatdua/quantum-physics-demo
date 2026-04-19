import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  assertFolderMatchesReleaseDate,
  assertAllLevelFilesPresent,
  assertUniqueReleaseDates
} from '../../src/lib/validate-issues';

const ISSUES_DIR = join(process.cwd(), 'src', 'content', 'issues');

function parseReleaseDate(yamlPath: string): string {
  const raw = readFileSync(yamlPath, 'utf8');
  const match = /^releaseDate:\s*"?(\d{4}-\d{2}-\d{2})"?\s*$/m.exec(raw);
  if (!match) throw new Error(`Could not parse releaseDate from ${yamlPath}`);
  return match[1];
}

function collectIssueFolders(): string[] {
  if (!existsSync(ISSUES_DIR)) return [];
  return readdirSync(ISSUES_DIR)
    .filter((name) => !name.startsWith('_'))
    .filter((name) => statSync(join(ISSUES_DIR, name)).isDirectory());
}

function collectAllFiles(folder: string): Set<string> {
  const files = new Set<string>();
  const base = join(ISSUES_DIR, folder, 'da');
  if (!existsSync(base)) return files;
  for (const name of readdirSync(base)) {
    if (name.endsWith('.md')) {
      files.add(`issues/${folder}/da/${name}`);
    }
  }
  return files;
}

describe('content integrity (cross-entry)', () => {
  const folders = collectIssueFolders();

  it('every issue folder has an index.yaml whose year/month matches the folder name', () => {
    for (const folder of folders) {
      const yamlPath = join(ISSUES_DIR, folder, 'index.yaml');
      expect(existsSync(yamlPath)).toBe(true);
      const releaseDate = parseReleaseDate(yamlPath);
      expect(() => assertFolderMatchesReleaseDate(folder, releaseDate)).not.toThrow();
    }
  });

  it('every issue has all 4 required Danish level files', () => {
    for (const folder of folders) {
      const files = collectAllFiles(folder);
      expect(() => assertAllLevelFilesPresent(folder, 'da', files)).not.toThrow();
    }
  });

  it('no two issues share a releaseDate', () => {
    const issues = folders.map((folder) => ({
      folder,
      releaseDate: parseReleaseDate(join(ISSUES_DIR, folder, 'index.yaml'))
    }));
    expect(() => assertUniqueReleaseDates(issues)).not.toThrow();
  });
});
