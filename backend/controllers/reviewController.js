const Review = require('../models/Review');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const CulturalSite = require('../models/CulturalSite');
const User = require('../models/User');
const mongoose = require('mongoose');

// 1. [추가] 관리자 전용: 모든 문화재의 전체 리뷰 가져오기 (페이지네이션 포함)
const getAllReviewsForAdmin = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const reviews = await Review.find()
    .populate({
      path: 'culturalSite',
      select: 'name',
    })
    .populate({
      path: 'user',
      select: 'username profileImage',
    })
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const totalResults = await Review.countDocuments();
  const totalPages = Math.ceil(totalResults / limit);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    totalResults,
    page,
    totalPages,
    data: {
      reviews,
    },
  });
});

// 2. 특정 문화재의 리뷰 조회 (기존 로직 유지)
const getAllReviewsFromCulturalSite = asyncHandler(async (req, res, next) => {
  let filter = {};

  if (req.params.culturalSiteId) {
    if (!mongoose.isObjectIdOrHexString(req.params.culturalSiteId)) {
      return next(new AppError('id is not valid.', 400));
    }

    const culturalSite = await CulturalSite.findById(req.params.culturalSiteId);
    if (!culturalSite) {
      return next(new AppError('Cannot find the cultural site.', 404));
    }
    filter = { culturalSite: req.params.culturalSiteId };
  }

  if (req.query.user) {
    if (!mongoose.isObjectIdOrHexString(req.query.user)) {
      return next(new AppError('invalid user.', 400));
    }
    filter.user = req.query.user;
  }

  const reviews = await Review.find(filter)
    .populate({ path: 'culturalSite', select: 'name' })
    .populate({ path: 'user', select: 'username profileImage' })
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews },
  });
});

// 3. 리뷰 단건 조회
const getReviewById = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.reviewId)
    .populate({ path: 'culturalSite', select: 'name' })
    .populate({ path: 'user', select: 'username' });

  if (!review) {
    return next(new AppError('There are no reviews with that ID.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { review },
  });
});

// 4. 리뷰 생성 (트랜잭션 내에서 스키마 미들웨어가 안전하게 동작하도록 수정)
const createReview = asyncHandler(async (req, res, next) => {
  if (!req.body.culturalSite) req.body.culturalSite = req.params.culturalSiteId;
  if (!req.body.user) req.body.user = req.user.id;

  const existingCulturalSite = await CulturalSite.findById(
    req.body.culturalSite,
  );
  if (!existingCulturalSite) {
    return next(
      new AppError('No cultural heritages found to leave a review for.', 404),
    );
  }

  const existingReview = await Review.findOne({
    user: req.body.user,
    culturalSite: req.body.culturalSite,
  });
  if (existingReview) {
    return next(
      new AppError(
        'You have already left a review for this cultural heritage.',
        409,
      ),
    );
  }

  const { culturalSite, user, rating, comment } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const newReview = new Review({ culturalSite, user, rating, comment });

    // 1. 리뷰 저장 (훅이 없으므로 평점 계산 없이 순수하게 저장만 됨)
    const savedReview = await newReview.save({ session });

    // 2. CulturalSite의 reviews 배열 업데이트
    await CulturalSite.findByIdAndUpdate(
      culturalSite,
      { $addToSet: { reviews: savedReview._id } },
      { session, new: true },
    );

    // 3. 먼저 트랜잭션을 커밋하여 DB에 안전하게 반영
    await session.commitTransaction();
    session.endSession(); // 세션 종료

    // 🌟 4. 데이터가 확정된 후, 트랜잭션 밖에서 평점 평균을 안전하게 계산 (충돌 위험 제로)
    await Review.calcAverageRatings(culturalSite);

    res.status(201).json({
      status: 'success',
      data: { review: savedReview },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Review creation transaction failed:', error);
    return next(
      new AppError('An error occurred while creating your review.', 500),
    );
  }
});

// 5. 리뷰 수정 (findByIdAndUpdate 사용 시 post(/^findOneAnd/) 트리거됨)
const updateReviewById = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.reviewId);

  if (!review) {
    return next(new AppError('There are no reviews with that ID.', 404));
  }

  if (review.user.toString() !== req.user.id) {
    return next(
      new AppError('You do not have permission to edit this review.', 403),
    );
  }

  // 스키마 훅(post('findOneAndUpdate'))을 작동시키기 위해 옵션을 준수합니다.
  const updatedReview = await Review.findByIdAndUpdate(
    req.params.reviewId,
    req.body,
    { new: true, runValidators: true },
  );

  res.status(200).json({
    status: 'success',
    data: { review: updatedReview },
  });
});

// 6. 리뷰 삭제
const deleteReviewById = asyncHandler(async (req, res, next) => {
  const { culturalSiteId, reviewId } = req.params;

  // 1. 삭제할 리뷰가 실제로 존재하는지 확인
  const review = await Review.findById(reviewId);
  if (!review) {
    return next(new AppError('No review found with that ID.', 404));
  }

  // 2. 권한 체크 (본인이 쓴 리뷰거나 어드민인 경우에만 삭제 허용)
  // * req.user.role과 req.user.id가 authController.protect를 통해 들어온다고 가정합니다.
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new AppError('You do not have permission to delete this review.', 403),
    );
  }

  // 트랜잭션 세션 시작
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 3. Review 컬렉션에서 리뷰 삭제
    await Review.findByIdAndDelete(reviewId, { session });

    // 4. CulturalSite 컬렉션의 reviews 배열에서 해당 리뷰 ID 제거 ($pull)
    await CulturalSite.findByIdAndUpdate(
      culturalSiteId,
      { $pull: { reviews: reviewId } },
      { session, new: true },
    );

    // 5. 원자적 작업이 완료되었으므로 트랜잭션 커밋 및 세션 종료
    await session.commitTransaction();
    session.endSession();

    // 🌟 6. 데이터가 최종 확정된 후, 트랜잭션 밖에서 평점 평균을 안전하게 재계산
    // (리뷰가 지워졌으므로 남은 리뷰들을 기준으로 평균이 감소하거나 변동됩니다)
    await Review.calcAverageRatings(culturalSiteId);

    // 204 No Content 응답 보냄
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    // 에러 발생 시 안전하게 롤백
    await session.abortTransaction();
    session.endSession();
    console.error('Review deletion transaction failed:', error);
    return next(
      new AppError('An error occurred while deleting the review.', 500),
    );
  }
});

module.exports = {
  getAllReviewsFromCulturalSite,
  getReviewById,
  createReview,
  updateReviewById,
  deleteReviewById,
  getAllReviewsForAdmin,
};
