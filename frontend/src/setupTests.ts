import '@testing-library/jest-dom'

import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

// 테스트 시작 전 서버 시작
beforeAll(() => server.listen());

// 각 테스트 종료 후 핸들러 초기화 (다른 테스트에 영향 주지 않기 위해)
afterEach(() => server.resetHandlers());

// 모든 테스트 종료 후 서버 정지
afterAll(() => server.close());