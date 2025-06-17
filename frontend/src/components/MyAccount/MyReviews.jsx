// src/components/Review/MyReview.jsx
import { useState, useCallback } from 'react';
import StarIcon from '../StarIcon';
import ReviewForm from '../Review/ReviewForm';
import useAuthStore from '../../store/authStore';

// Import custom TanStack Query hooks
import { useMyReviews, useReviewMutation } from '../../hooks/useCulturalSitesQueries';

const MyReviews = () => {
  // queryClient is no longer needed directly in this component because its actions are encapsulated in the custom hooks.
  // const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  const [expandedReviewId, setExpandedReviewId] = useState(null);

  // --- TanStack Query: Fetch My Reviews (using custom hook) ---
  const {
    data: reviews = [],
    isLoading: loadingReviews,
    isError: reviewFetchError,
    error: reviewsError,
  } = useMyReviews(); // Call the custom hook

  // --- TanStack Query: Review Create/Update/Delete Mutation (using custom hook) ---
  const reviewMutation = useReviewMutation(); // Call the custom hook

  const handleReviewActionCompleted = useCallback(async (actionType, newRating, oldRating, comment) => {
    // Find the current review being acted upon to get its culturalSite._id
    const targetReview = reviews.find(r => r._id === expandedReviewId);
    const placeIdForAction = targetReview?.culturalSite._id;
    const reviewIdForAction = expandedReviewId;
    const oldRatingOfTargetReview = targetReview?.rating; // Get old rating directly from the fetched review

    if (!placeIdForAction) {
      alert("문화재 정보를 찾을 수 없습니다.");
      return;
    }

    await reviewMutation.mutateAsync({
      actionType,
      placeId: placeIdForAction,
      reviewId: actionType === 'create' ? undefined : reviewIdForAction,
      reviewData: actionType === 'delete' ? undefined : { rating: newRating, comment: comment },
      oldRating: oldRatingOfTargetReview, // Pass oldRating to the mutation for manual cache update if needed
    });

    // This state update should remain in the component, not in the generic hook
    setExpandedReviewId(null); // Close the form on successful review action
  }, [reviewMutation, expandedReviewId, reviews]);


  if (loadingReviews) {
    return <p className="text-gray-600 text-center py-4">리뷰를 불러오는 중입니다...</p>;
  }

  if (reviewFetchError) {
    return <p className="text-red-600 text-center py-4">리뷰를 불러오는 중 오류가 발생했습니다: {reviewsError.message}</p>;
  }

  if (reviews.length === 0) {
    return <p className="text-gray-600 text-center py-4">아직 작성된 리뷰가 없습니다.</p>;
  }

  return (
    <div className="space-y-4 p-4">
      {reviews.map((review) => (
        <div
          key={review._id}
          className="bg-gray-50 p-3 rounded-lg shadow-sm border border-gray-100"
        >
          {/* Main review content (clickable to expand/collapse) */}
          <div
            className="cursor-pointer"
            onClick={() => setExpandedReviewId(expandedReviewId === review._id ? null : review._id)}
          >
            <div className="flex items-center mb-2">
              {review.culturalSite.imageUrl && (
                <img
                  src={review.culturalSite.imageUrl}
                  alt={`${review.culturalSite.name}'s image`}
                  className="w-8 h-8 rounded-full object-cover mr-2 border border-gray-200"
                />
              )}
              <p className="font-semibold text-gray-800 mr-2 flex-grow">
                {review.culturalSite.name || "Unknown"}
              </p>
              <div className="flex text-yellow-500 text-sm">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    rating={review.rating}
                    index={i}
                    className="w-4 h-4"
                    displayMode="reviewForm"
                  />
                ))}
              </div>
            </div>
            {review.comment && (
              <p className="text-gray-700 text-sm italic">
                "{review.comment}"
              </p>
            )}
            <p className="text-gray-500 text-xs mt-2 text-right">
              {new Date(review.createdAt).toLocaleDateString(
                "ko-KR",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
            </p>
          </div>

          {/* Conditionally render ReviewForm if this review is expanded */}
          {expandedReviewId === review._id && (
            <div
              className="mt-4 border-t pt-4 border-gray-200"
              onClick={(e) => e.stopPropagation()} // IMPORTANT: Stop propagation here to prevent re-collapsing when clicking inside the form
            >
              <ReviewForm
                userReview={review} // Pass the specific review object to the form for editing
                onReviewActionCompleted={handleReviewActionCompleted}
                currentUser={currentUser}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MyReviews;