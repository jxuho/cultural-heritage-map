/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  /* 파일 내 테스트를 병렬로 실행 */
  fullyParallel: true,
  /* 실수로 test.only를 남겼을 경우 CI 빌드 실패 처리 */
  forbidOnly: !!process.env.CI,
  /* CI 환경에서만 2회 재시도 */
  retries: process.env.CI ? 2 : 0,
  /* 중요: CI 환경에서는 워커를 1개로 제한하여 CPU/메모리 과부하 방지 */
  workers: process.env.CI ? 1 : undefined,
  /* CI 환경을 고려해 전체 글로벌 타임아웃을 60초로 상향 */
  timeout: 60000,

  expect: {
    /* 개별 단언문(expect)의 기본 타임아웃을 10초로 상향 */
    timeout: 10000,
  },

  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    /* 실패 시에만 트레이스(Trace) 로그를 남겨 리소스 절약 */
    trace: 'on-first-retry',
    viewport: { width: 1440, height: 900 },
    /* CI 환경에서 하드웨어 가속 문제로 지도가 깨지는 것을 방지 */
    launchOptions: {
      args: ['--disable-lcd-text', '--gpu-no-context-lost'],
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 서버 기동 대기 시간 연장
  },
});
