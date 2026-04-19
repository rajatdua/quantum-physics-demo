export {};

// Adds `in-view` class to .reading__prose paragraphs and headings as they
// scroll into view, triggering CSS-driven fade-up + heading underline draw.
// Re-binds on Astro view transitions via astro:page-load.

const SELECTOR = '.reading__prose > p, .reading__prose h2, .reading__prose h3';

function bind(): void {
  const targets = document.querySelectorAll<HTMLElement>(SELECTOR);
  if (targets.length === 0) return;

  if (typeof IntersectionObserver === 'undefined') {
    // Old browser — just reveal everything immediately.
    targets.forEach((el) => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      }
    },
    {
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1
    }
  );

  targets.forEach((el) => {
    if (el.dataset.observed === '1') return;
    el.dataset.observed = '1';
    observer.observe(el);
  });
}

bind();
document.addEventListener('astro:page-load', bind);
