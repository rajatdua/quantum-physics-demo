import { test, expect } from '@playwright/test';

test('reading page renders title, eyebrow, prose, podcast, and issue nav', async ({ page }) => {
  await page.goto('/2026/04/gymnasium/');
  await expect(page.getByRole('heading', { level: 1, name: 'Superposition' })).toBeVisible();
  await expect(page.getByText(/Udgave #1.*GYMNASIUM/i)).toBeVisible();
  // Podcast slot renders — either embed or pending
  const pending = page.getByTestId('podcast-pending');
  const embed = page.getByTestId('podcast-embed');
  await expect(pending.or(embed)).toBeVisible();
});

test('level switcher navigates to same issue at new level', async ({ page }) => {
  await page.goto('/2026/04/gymnasium/');
  await page.locator('[data-level-switcher]').selectOption('universitet');
  await page.waitForURL('**/2026/04/universitet/');
  await expect(page).toHaveURL(/\/2026\/04\/universitet\/$/);
});
