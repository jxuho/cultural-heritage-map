import { test, expect, Page } from '@playwright/test';

// Common functions for entering the map
async function navigateToMap(page: Page) {
  await page.goto('/');
  // Button click on landing page
  const exploreButton = page.getByRole('button', { name: /Explore Map/i });
  await exploreButton.click();

  // waiting for loading
  await expect(page.getByText('Loading the Map...')).not.toBeVisible({
    timeout: 15000,
  });
  // Check map container
  await expect(page.locator('.leaflet-container')).toBeVisible();
}

test.describe('Step-by-Step Map Flow', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToMap(page); // Click “Explore Map” and wait for loading to complete
  });

  test('Step 1: Verify District Markers are rendered', async ({ page }) => {
    // 1. First check if the Path element is attached to the DOM (whether to render or not)
    const districtPaths = page.locator('.leaflet-overlay-pane path');
    await expect(districtPaths.first()).toBeAttached({ timeout: 10000 });

    // 2. Check whether the opacity is not 0 (is it visible)
    const firstPath = districtPaths.first();
    const opacity = await firstPath.evaluate(
      (el) => window.getComputedStyle(el).fillOpacity,
    );

    // Check whether fillOpacity is not the string "0" (e.g., if it is 0.04, determine that it is visible)
    expect(parseFloat(opacity)).toBeGreaterThan(0);
  });

  test('Step 2: Should transition from District to Cluster mode by clicking Zoom-in button', async ({
    page,
  }) => {
    // 1. Check current status: DistrictMarkers are visible
    const districtPaths = page.locator('.leaflet-overlay-pane path');
    await expect(districtPaths.first()).toBeVisible();

    // 2. Find and click the zoom in button
    // Find the button using aria-label according to the HTML structure you provided.
    const zoomInButton = page.getByRole('button', { name: /Zoom in/i });

    // 3. Click enough until the state switches (zoom level 12 -> 13 or higher)
    for (let i = 0; i < 3; i++) {
      await zoomInButton.click();
      // Waiting for zoom animation and data loading (Supercluster worker)
      await page.waitForTimeout(600);
    }

    // 4. Check status changes
    // DistrictMarkers should disappear and cluster markers should be visible
    await expect(districtPaths.first()).not.toBeVisible({ timeout: 5000 });
    await expect(page.locator('.leaflet-marker-icon').first()).toBeVisible({
      timeout: 5000,
    });
  });

  test('Full Map Interaction: District -> Zoom -> Marker/Cluster Click -> SidePanel', async ({
    page,
  }) => {
    // ---Step 1: Initial confirmation ---
    const districtPaths = page.locator('.leaflet-overlay-pane path');
    await expect(districtPaths.first()).toBeAttached();

    // ---Step 2: Zoom in (enter cluster mode) ---
    const zoomInButton = page.getByRole('button', { name: /Zoom in/i });

    // Click on zoom 3 times to induce state transition
    for (let i = 0; i < 3; i++) {
      await zoomInButton.click();
      await page.waitForTimeout(1000); // Wait for zoom and marker rendering
    }

    // District(path) should disappear and marker should be visible
    await expect(districtPaths.first()).not.toBeVisible();
    await expect(page.locator('.leaflet-marker-icon').first()).toBeVisible();

    // ---Step 3: While zoomed, click until the side panel appears ---
    // Since we are already zoomed, this loop splits the cluster further or
    // Opens the sidepanel by clicking on individual markers.
    let panelOpened = false;
    for (let i = 0; i < 10; i++) {
      // Check if the side panel is visible
      if (await page.locator('aside').isVisible()) {
        panelOpened = true;
        break;
      }

      // Click on marker
      await page.locator('.leaflet-marker-icon').first().click();

      // Wait considering the time the side panel opens after clicking
      await page.waitForTimeout(1000);
    }

    // final confirmation
    await expect(panelOpened, 'Side panel should be visible').toBe(true);
    await expect(page.locator('aside')).toBeVisible();
  });
});

test.describe('Guest User Constraints', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/auth/refresh', (route) =>
      route.fulfill({ status: 401 }),
    );
    await navigateToMap(page);
  });

  test('Guest users should not see context menu on right-click', async ({
    page,
  }) => {
    await page
      .locator('.leaflet-container')
      .click({ button: 'right', position: { x: 300, y: 300 } });
    await expect(page.getByTestId('map-context-menu')).not.toBeVisible();
  });
});

test.describe('Authenticated User Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/auth/refresh', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          data: { user: { username: 'AdminUser', role: 'admin' } },
        }),
      }),
    );
    await navigateToMap(page);
  });

  test('Logged-in user should see context menu on right-click', async ({
    page,
  }) => {
    await page
      .locator('.leaflet-container')
      .click({ button: 'right', position: { x: 500, y: 500 } });
    await expect(page.getByTestId('map-context-menu')).toBeVisible();
  });
});
