export {};

const LEVEL_KEY = 'qp.level';
const VALID = new Set(['udskoling', 'gymnasium', 'universitet', 'kandidat']);

function rewriteReadMore(): void {
  const link = document.querySelector<HTMLAnchorElement>('[data-testid="read-more"]');
  if (!link) return;
  try {
    const stored = localStorage.getItem(LEVEL_KEY);
    if (!stored || !VALID.has(stored)) return;
    const current = link.getAttribute('href');
    if (!current) return;
    const replaced = current.replace(/\/(udskoling|gymnasium|universitet|kandidat)\/?$/, `/${stored}/`);
    link.setAttribute('href', replaced);
  } catch { /* ignore */ }
}

rewriteReadMore();
document.addEventListener('astro:page-load', rewriteReadMore);
