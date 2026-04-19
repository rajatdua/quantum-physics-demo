import { test, expect } from '@playwright/test';

test('archive lists the published issue as a linkable card', async ({ page }) => {
  await page.goto('/arkiv/');
  await expect(page.getByRole('heading', { level: 1, name: 'Arkiv' })).toBeVisible();
  const published = page.getByTestId('archive-card-published');
  await expect(published).toHaveCount(1);
  await expect(published).toContainText(/Superposition/);
});
