export interface IssueRef {
  folder: string;
  releaseDate: string; // ISO YYYY-MM-DD
}

export interface NumberedIssue extends IssueRef {
  number: number;
}

export function computeIssueNumbers<T extends IssueRef>(
  issues: T[]
): Array<T & { number: number }> {
  return [...issues]
    .sort((a, b) => (a.releaseDate < b.releaseDate ? -1 : a.releaseDate > b.releaseDate ? 1 : 0))
    .map((issue, i) => ({ ...issue, number: i + 1 }));
}
