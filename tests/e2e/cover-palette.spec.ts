import { test, expect } from '@playwright/test';

test('cover has the palette class from frontmatter', async ({ page }) => {
  await page.goto('/2026/04/');
  // April 2026 issue uses palette: warm
  const cover = page.locator('.cover').first();
  await expect(cover).toHaveClass(/palette-warm/);
});
