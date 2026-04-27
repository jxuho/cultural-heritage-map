import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { server } from '../../mocks/server';

import {
  useAllCulturalSites,
  useCulturalSiteDetail,
  useNearbyOsm,
  useCreateCulturalSite,
  useUpdateCulturalSite,
  useDeleteCulturalSite,
} from './useCulturalSitesQueries';


beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// 2. 테스트용 QueryClient 및 Wrapper 생성 함수
// 테스트마다 새로운 QueryClient를 생성해야 캐시(상태)가 공유되지 않습니다.
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // 테스트 실패 시 재시도하지 않도록 설정 (빠른 실패)
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

const createWrapper = () => {
  const testQueryClient = createTestQueryClient();
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useCulturalSitesQueries', () => {
  describe('Queries', () => {
    test('useAllCulturalSites: 모든 유적지를 성공적으로 불러와야 한다', async () => {
      const { result } = renderHook(() => useAllCulturalSites(), {
        wrapper: createWrapper(),
      });

      // 초기 상태 확인
      expect(result.current.isPending).toBe(true);

      // 데이터 fetch 완료 대기
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // MSW에서 정의한 mockCulturalSites 데이터가 반환되는지 확인
      expect(result.current.data).toBeDefined();
      expect(result.current.data?.length).toBeGreaterThan(0);
      expect(result.current.data?.[0].name).toBe('abc');
    });

    test('useCulturalSiteDetail: 특정 ID의 유적지를 성공적으로 불러와야 한다', async () => {
      const testId = 'site-123';
      const { result } = renderHook(() => useCulturalSiteDetail(testId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?._id).toBe(testId);
      expect(result.current.data?.name).toBe('abc');
    });

    test('useNearbyOsm: 위도와 경도를 기반으로 주변 OSM 데이터를 불러와야 한다', async () => {
      // enabled: false 속성 때문에 수동으로 refetch를 호출해야 합니다.
      const { result } = renderHook(() => useNearbyOsm(37.564, 126.974), {
        wrapper: createWrapper(),
      });

      // 수동으로 fetch 실행
      result.current.refetch();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.[0]._id).toBe('site-123'); // MSW에서 mockCulturalSites[0] 반환 설정함
    });
  });

  describe('Mutations', () => {
    test('useCreateCulturalSite: 새로운 유적지를 성공적으로 생성해야 한다', async () => {
      const { result } = renderHook(() => useCreateCulturalSite(), {
        wrapper: createWrapper(),
      });

      const newSiteData = {
        name: 'New Site',
        category: 'artwork',
      };

      // mutateAsync를 사용하여 Promise 결과 대기
      await result.current.mutateAsync(newSiteData);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      
      // MSW에서 '_id: new-id-999' 를 합쳐서 반환하도록 설정됨
      expect(result.current.data?._id).toBe('new-id-999');
      expect(result.current.data?.name).toBe('New Site');
    });

    test('useUpdateCulturalSite: 기존 유적지를 성공적으로 수정해야 한다', async () => {
      const { result } = renderHook(() => useUpdateCulturalSite(), {
        wrapper: createWrapper(),
      });

      const updatePayload = {
        culturalSiteId: 'site-123',
        updateData: { name: 'Updated Site Name' },
      };

      await result.current.mutateAsync(updatePayload);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // MSW에서 기존 mock 데이터에 updateData를 덮어씌워 반환함
      expect(result.current.data?.name).toBe('Updated Site Name');
      expect(result.current.data?._id).toBe('site-123');
    });

    test('useDeleteCulturalSite: 유적지를 성공적으로 삭제해야 한다', async () => {
      const { result } = renderHook(() => useDeleteCulturalSite(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync('site-123');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Api 함수가 boolean(true)를 반환하도록 설계되어 있음
      expect(result.current.data).toBe(true);
    });
  });
});