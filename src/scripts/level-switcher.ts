export {};

const LEVEL_KEY = 'qp.level';
const LEVEL_IN_PATH = /^\/(\d{4})\/(\d{2})\/(udskoling|gymnasium|universitet|kandidat)\/?$/;
const ISSUE_IN_PATH = /^\/(\d{4})\/(\d{2})\/?$/;

function currentIssueAndLevel(): { year: string; month: string; level?: string } | null {
  const path = window.location.pathname;
  const levelMatch = LEVEL_IN_PATH.exec(path);
  if (levelMatch) return { year: levelMatch[1], month: levelMatch[2], level: levelMatch[3] };
  const issueMatch = ISSUE_IN_PATH.exec(path);
  if (issueMatch) return { year: issueMatch[1], month: issueMatch[2] };
  return null;
}

function initLevelSwitcher(): void {
  const select = document.querySelector<HTMLSelectElement>('[data-level-switcher]');
  if (!select || select.dataset.bound === '1') return;
  select.dataset.bound = '1';

  const ctx = currentIssueAndLevel();
  if (ctx?.level) select.value = ctx.level;

  select.addEventListener('change', () => {
    const newLevel = select.value;
    try { localStorage.setItem(LEVEL_KEY, newLevel); } catch { /* ignore */ }
    if (ctx) {
      window.location.assign(`/${ctx.year}/${ctx.month}/${newLevel}/`);
    }
  });
}

initLevelSwitcher();
document.addEventListener('astro:page-load', initLevelSwitcher);
