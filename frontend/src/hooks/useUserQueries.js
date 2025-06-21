import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfileApi } from '../api/userApi'; 

// 프로필 업데이트를 위한 useMutation 훅
export const useUpdateProfile = () => {
    const queryClient = useQueryClient(); 

    return useMutation({
        mutationFn: updateProfileApi, // 위에서 정의한 API 함수를 mutationFn으로 사용
        onSuccess: (data) => {
            // 성공 시 필요한 캐시 무효화
            // 예를 들어, 현재 로그인된 사용자의 정보가 변경되었으므로 해당 캐시를 무효화합니다.
            if (data?.data?.user?._id) {
                queryClient.invalidateQueries({ queryKey: ['user', data.data.user._id] });
            }
            // 전역적인 사용자 목록이나 프로필 관련 캐시가 있다면 함께 무효화
            queryClient.invalidateQueries({ queryKey: ['userProfile'] }); // 가상의 사용자 프로필 쿼리 키
            queryClient.invalidateQueries({ queryKey: ['myReviews'] }); // 사용자 리뷰에도 영향이 있을 수 있다면
            queryClient.invalidateQueries({ queryKey: ['myFavorites'] }); // 사용자 즐겨찾기에도 영향이 있을 수 있다면
        },
        onError: (error) => {
            console.error("Profile update failed:", error);
            // 에러 처리 로직 (예: 토스트 알림 표시)
            throw error; // 컴포넌트에서 에러를 catch할 수 있도록 다시 던집니다.
        },
    });
};