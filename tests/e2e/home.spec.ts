import { test, expect } from '@playwright/test';

test('home shows the latest published issue cover', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/Udgave #1/)).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'Superposition' })).toBeVisible();
  await expect(page.getByTestId('read-more')).toBeVisible();
  await expect(page.getByRole('link', { name: /Lyt til podcasten/ })).toBeVisible();
});

test('read-more link targets the gymnasium level by default', async ({ page }) => {
  await page.goto('/');
  const href = await page.getByTestId('read-more').getAttribute('href');
  expect(href).toBe('/2026/04/gymnasium/');
});

test('read-more link respects stored level preference', async ({ page, context }) => {
  await context.addInitScript(() => localStorage.setItem('qp.level', 'universitet'));
  await page.goto('/');
  const href = await page.getByTestId('read-more').getAttribute('href');
  expect(href).toBe('/2026/04/universitet/');
});
