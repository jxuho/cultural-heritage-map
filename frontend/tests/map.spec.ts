import { test, expect, Page, Locator } from '@playwright/test';

const AUTH_REFRESH_ENDPOINT = '**/auth/refresh';

const SELECTORS = {
  map: '.leaflet-container',
  districtLayerPath: '.leaflet-overlay-pane path',
  individualMarker: '.leaflet-marker-icon.custom-div-icon',
  sidePanel: 'aside',
} as const;

const TEST_POINTS = {
  contextMenu: { x: 500, y: 500 },
} as const;

type MockUser = {
  username: string;
  role: 'admin' | 'user';
};

function mapContainer(page: Page): Locator {
  return page.locator(SELECTORS.map);
}

function districtPaths(page: Page): Locator {
  return page.locator(SELECTORS.districtLayerPath);
}

function individualMarkers(page: Page): Locator {
  return page.locator(SELECTORS.individualMarker);
}

function sidePanel(page: Page): Locator {
  return page.locator(SELECTORS.sidePanel);
}

function contextMenu(page: Page): Locator {
  return page.getByTestId('map-context-menu');
}

async function mockGuestUser(page: Page): Promise<void> {
  await page.route(AUTH_REFRESH_ENDPOINT, async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'fail',
        message: 'Unauthorized',
      }),
    });
  });
}

async function mockAuthenticatedUser(
  page: Page,
  user: MockUser,
): Promise<void> {
  await page.route(AUTH_REFRESH_ENDPOINT, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'success',
        data: { user },
      }),
    });
  });
}

async function navigateToMap(page: Page): Promise<void> {
  await page.goto('/');

  await test.step('Enter the map from the landing page', async () => {
    await page.getByRole('button', { name: /explore map/i }).click();
  });

  await test.step('Wait until the map is loaded', async () => {
    await expect(page.getByText('Loading the Map...')).toBeHidden({
      timeout: 15_000,
    });

    await expect(mapContainer(page)).toBeVisible();

    await expect(
      districtPaths(page).first(),
      'Expected district layer to be rendered after map loading',
    ).toBeVisible({
      timeout: 30_000,
    });
  });
}

async function zoomInUntilIndividualMarkersAreVisible(
  page: Page,
): Promise<void> {
  const zoomInButton = page.getByRole('button', { name: /zoom in/i });
  const maxZoomAttempts = 5;

  for (let attempt = 0; attempt < maxZoomAttempts; attempt++) {
    if (await individualMarkers(page).first().isVisible()) {
      return;
    }

    await zoomInButton.click();

    await expect(
      mapContainer(page),
      'Expected map to remain visible after zooming',
    ).toBeVisible();
  }

  await expect(
    individualMarkers(page).first(),
    `Expected individual markers to appear after ${maxZoomAttempts} zoom attempts`,
  ).toBeVisible({
    timeout: 10_000,
  });
}

async function openMapContextMenu(page: Page): Promise<void> {
  await mapContainer(page).click({
    button: 'right',
    position: TEST_POINTS.contextMenu,
  });
}

test.describe('Map flow @map', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToMap(page);
  });

  test('opens the side panel when an individual marker is clicked', async ({
    page,
  }) => {
    await test.step('Given district markers are visible initially', async () => {
      await expect(districtPaths(page).first()).toBeVisible();
      await expect(sidePanel(page)).toBeHidden();
    });

    await test.step('When the user zooms in until individual markers appear', async () => {
      await zoomInUntilIndividualMarkersAreVisible(page);
    });

    await test.step('Then district layer disappears and individual markers are visible', async () => {
      await expect(districtPaths(page).first()).toBeHidden();
      await expect(individualMarkers(page).first()).toBeVisible();
    });

    await test.step('When the user clicks an individual marker', async () => {
      await individualMarkers(page).first().click();
    });

    await test.step('Then the side panel opens', async () => {
      await expect(sidePanel(page)).toBeVisible({
        timeout: 5_000,
      });
    });
  });
});

test.describe('Guest user constraints @map', () => {
  test.beforeEach(async ({ page }) => {
    await mockGuestUser(page);
    await navigateToMap(page);
  });

  test('does not show the map context menu on right-click', async ({
    page,
  }) => {
    await openMapContextMenu(page);

    await expect(contextMenu(page)).toBeHidden();
  });
});

test.describe('Authenticated user features @map', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedUser(page, {
      username: 'AdminUser',
      role: 'admin',
    });

    await navigateToMap(page);
  });

  test('shows the map context menu on right-click', async ({ page }) => {
    await openMapContextMenu(page);

    await expect(contextMenu(page)).toBeVisible();
  });
});
