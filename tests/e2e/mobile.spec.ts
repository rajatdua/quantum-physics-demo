import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['iPhone 13'] });

test('mobile home: no horizontal overflow', async ({ page }) => {
  await page.goto('/');
  const [bodyWidth, viewportWidth] = await page.evaluate(() => [document.body.scrollWidth, window.innerWidth]);
  expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
});

test('mobile reading page: no horizontal overflow', async ({ page }) => {
  await page.goto('/2026/04/gymnasium/');
  const [bodyWidth, viewportWidth] = await page.evaluate(() => [document.body.scrollWidth, window.innerWidth]);
  expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
});
