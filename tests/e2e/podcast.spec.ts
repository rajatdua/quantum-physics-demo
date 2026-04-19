import { test, expect } from '@playwright/test';

test('podcast renders Spotify embed when episodeId is set', async ({ page }) => {
  // Seed content has spotifyEpisodeId, so the iframe must render.
  await page.goto('/2026/04/gymnasium/');
  await expect(page.getByTestId('podcast-embed')).toBeVisible();
  await expect(page.getByTestId('podcast-pending')).toHaveCount(0);
});

test('podcast embed iframe points at open.spotify.com', async ({ page }) => {
  await page.goto('/2026/04/gymnasium/');
  const src = await page.getByTestId('podcast-embed').getAttribute('src');
  expect(src).toMatch(/^https:\/\/open\.spotify\.com\/embed\/episode\//);
});
