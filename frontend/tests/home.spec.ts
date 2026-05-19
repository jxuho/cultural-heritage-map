import { test, expect } from '@playwright/test';

test.describe('Homepage Test', () => {
  // Actions to take before running each test
  test.beforeEach(async ({ page }) => {
    // Go to the baseURL (http://localhost:3000) set in playwright.config.ts
    await page.goto('/');
  });

  test('Page title and main UI elements should be displayed', async ({
    page,
  }) => {
    // 1. Check page title (regular expression can be used)
    await expect(page).toHaveTitle(/Cultural Heritage Map/);

    // 2. Check for presence of header or specific text
    const header = page.getByRole('banner'); // or getByText('Service Name')
    await expect(header).toBeVisible();
  });

  test('Should render map after clicking explore button', async ({ page }) => {
    // 1. Find and click the ‘Initialize Map Explorer Engine’ button on the landing page.
    // Make sure the text on the button matches exactly, or choose a clickable element.
    const exploreButton = page.getByRole('button', { name: /Explore Map/i });
    await exploreButton.click();

    // 2. After clicking the button, wait until the MapComponent is rendered.
    // Targets the actual map container that appears after Suspense has finished loading.
    const mapContainer = page.locator('.leaflet-container');

    // Wait until the map appears in the DOM and become visible (wait within the default timeout)
    await expect(mapContainer).toBeVisible({ timeout: 10000 });
  });
});
