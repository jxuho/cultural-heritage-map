import { useCallback, useState, useEffect } from 'react';
import StarIcon from '../StarIcon';

const ReviewForm = ({
  userReview,
  onReviewActionCompleted,
  currentUser,
  isSubmitting, // SidePanelItems로부터 받은 뮤테이션 로딩 상태
  submitError,  // SidePanelItems로부터 받은 뮤테이션 에러 상태
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // `userReview` prop이 변경될 때마다 폼을 초기화하거나 기존 리뷰로 채웁니다.
  useEffect(() => {
    if (userReview) {
      setRating(userReview.rating);
      setComment(userReview.comment || "");
    } else {
      setRating(0);
      setComment("");
    }
    // `submitError`는 prop으로 받으므로, 여기서 초기화할 필요는 없습니다.
  }, [userReview]);

  const handleStarClick = useCallback((clickedIndex) => {
    if (!currentUser) {
      alert("리뷰를 작성하려면 먼저 로그인해주세요!");
      return;
    }
    setRating(clickedIndex + 1);
  }, [currentUser]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("로그인 후 리뷰를 작성할 수 있습니다.");
      return;
    }

    if (rating === 0) {
      alert("별점을 선택해주세요!");
      return;
    }

    try {
      if (userReview) {
        await onReviewActionCompleted('update', rating, userReview.rating, comment);
      } else {
        await onReviewActionCompleted('create', rating, null, comment);
      }
    } catch (error) {
      // 에러 처리는 `onReviewActionCompleted` 내부의 `onError`에서 이미 처리됩니다.
      console.error(error); // 디버깅을 위한 로깅은 유지합니다.
    }
    // `isSubmitting` 상태는 props로 받으므로 여기서는 변경하지 않습니다.
  }, [rating, comment, userReview, onReviewActionCompleted, currentUser]);


  const handleDelete = useCallback(async () => {
    if (!currentUser) {
      alert("로그인 후 리뷰를 삭제할 수 있습니다.");
      return;
    }

    if (!userReview || !window.confirm("정말로 리뷰를 삭제하시겠습니까?")) {
      return;
    }

    try {
      await onReviewActionCompleted('delete', null, userReview.rating);
    } catch (error) {
      // 에러 처리는 `onReviewActionCompleted` 내부의 `onError`에서 이미 처리됩니다.
      console.error(error); // 디버깅을 위한 로깅은 유지합니다.
    }
    // `isSubmitting` 상태는 props로 받으므로 여기서는 변경하지 않습니다.
  }, [userReview, onReviewActionCompleted, currentUser]);

  return (
    <div className="p-4 border-b border-gray-200 bg-white">
      {currentUser ? (
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          {userReview ? "내 리뷰" : "리뷰 작성"}
        </h3>
      ) : (
        <h3 className="text-lg font-semibold text-gray-600 mb-3">
          리뷰를 작성하려면 로그인해주세요.
        </h3>
      )}

      {/* `submitError` prop을 사용하여 에러 메시지 표시 */}
      {submitError && <p className="text-red-600 text-sm mb-3">{submitError}</p>}

      <div className="flex items-center mb-3">
        <span className="font-medium text-gray-700 mr-2">별점:</span>
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <StarIcon
              key={i}
              rating={rating}
              index={i}
              className={`w-6 h-6 ${currentUser ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              onClick={() => handleStarClick(i)}
            />
          ))}
        </div>
        {rating > 0 && <span className="ml-2 text-gray-700 font-bold">{rating.toFixed(1)}점</span>}
      </div>

      <div className="mb-3">
        <label htmlFor="reviewComment" className="sr-only">리뷰 메시지</label>
        <textarea
          id="reviewComment"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800 resize-y"
          rows="3"
          placeholder={currentUser ? "리뷰를 작성해주세요..." : "로그인 후 리뷰를 작성할 수 있습니다."}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={isSubmitting || !currentUser}
        ></textarea>
      </div>

      {currentUser && (
        <div className="flex justify-end space-x-2">
          {userReview && (
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors disabled:bg-red-300 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? '삭제 중...' : '삭제하기'}
            </button>
          )}
          <button
            type="submit"
            onClick={handleSubmit}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? (userReview ? '수정 중...' : '제출 중...') : (userReview ? '수정하기' : '리뷰 제출')}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewForm;