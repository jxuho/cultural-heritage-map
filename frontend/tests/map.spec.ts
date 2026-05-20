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

  // 실제 district layer가 렌더될 때까지 기다리기
  await expect(page.locator('.leaflet-overlay-pane path').first()).toBeAttached(
    {
      timeout: 30000,
    },
  );
}

test.describe('Step-by-Step Map Flow @map', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToMap(page); // "Explore Map" 클릭 및 로딩 대기
  });

  test('Should transition from District to Cluster and open SidePanel by clicking an individual marker', async ({
    page,
  }) => {
    // 1. 명확한 클래스 기반 로케이터 정의
    const districtPaths = page.locator('.leaflet-overlay-pane path');
    const zoomInButton = page.getByRole('button', { name: /Zoom in/i });

    // 개별 마커와 사이드 패널 로케이터
    const individualMarker = page.locator(
      '.leaflet-marker-icon.custom-div-icon',
    );
    const sidePanel = page.locator('aside');

    // 2. 초기 상태 확인 (행정구역 마커 표시)
    await expect(districtPaths.first()).toBeVisible({ timeout: 10000 });

    // 3. 줌인 버튼을 눌러 개별 마커가 보이는 레벨까지 진입
    for (let i = 0; i < 3; i++) {
      await zoomInButton.click();
      await page.waitForTimeout(500);
    }

    // 4. 행정구역은 사라지고, 우리가 클릭해야 할 '개별 마커'가 떴는지 확인
    await expect(districtPaths.first()).not.toBeVisible();
    await expect(individualMarker.first()).toBeVisible();

    // 5. 정확하게 '개별 마커'를 딱 한 번 클릭하여 사이드 패널 트리거
    await individualMarker.first().click();

    // 6. 사이드 패널이 정상적으로 열리는지 검증
    await expect(sidePanel).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Guest User Constraints @map', () => {
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

test.describe('Authenticated User Features @map', () => {
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
