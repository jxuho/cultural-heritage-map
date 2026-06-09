import { test, expect } from '@playwright/test';

test.describe('Homepage Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Page title and main UI elements should be displayed', async ({
    page,
  }) => {
    // Check page title
    await expect(page).toHaveTitle(/Cultural Heritage Map/);

    // Check for presence of header or specific text
    const header = page.getByRole('banner'); 
    await expect(header).toBeVisible();
  });

  test('Should render map after clicking explore button', async ({ page }) => {
    const exploreButton = page.getByRole('button', { name: /Explore Map/i });
    await exploreButton.click();

    // After clicking the button, wait until the MapComponent is rendered.
    const mapContainer = page.locator('.leaflet-container');

    // Wait until the map appears in the DOM and become visible (wait within the default timeout)
    await expect(mapContainer).toBeVisible({ timeout: 10000 });
  });
});
