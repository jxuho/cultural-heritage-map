// backend/controllers/reviewController.js
const Review = require('../models/Review');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const CulturalSite = require('../models/CulturalSite'); // CulturalSite 모델 임포트
const User = require('../models/User')
const mongoose = require('mongoose');

// 모든 리뷰 조회 (필터링 및 정렬 가능)
const getAllReviews = asyncHandler(async (req, res, next) => {
    let filter = {};
    // 특정 문화유산의 리뷰만 보고 싶을 때 (예: /api/reviews?culturalSite=ID)
    if (req.params.culturalSiteId) filter = { culturalSite: req.params.culturalSiteId };

    // 2. 특정 user에 대한 리뷰 필터링 (새로 추가)
    // /api/reviews?user=userId
    if (req.query.user) {
        filter.user = req.query.user;
    }

    const reviews = await Review.find(filter)
        .populate({
            path: 'culturalSite',
            select: 'name' // 문화유산 이름만 가져옴
        })
        .populate({
            path: 'user',
            select: 'username profileImage' // 사용자 이름, 프로필 사진만 가져옴
        })
        .sort('-createdAt'); // 최신순 정렬;

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews
        }
    });
});

// 특정 리뷰 조회
const getReviewById = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.reviewId)
        .populate({
            path: 'culturalSite',
            select: 'name'
        })
        .populate({
            path: 'user',
            select: 'username'
        });

    if (!review) {
        return next(new AppError('해당 ID를 가진 리뷰가 없습니다.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            review
        }
    });
});

// 새로운 리뷰 생성 (로그인한 사용자만 가능)
const createReview = asyncHandler(async (req, res, next) => {
    if (!req.body.culturalSite) req.body.culturalSite = req.params.culturalSiteId; // URL 파라미터에서 culturalSiteId 가져오기 [cite: 241]
    if (!req.body.user) req.body.user = req.user.id; // 현재 로그인한 사용자 ID [cite: 241]

    const existingCulturalSite = await CulturalSite.findById(req.body.culturalSite);
    if (!existingCulturalSite) {
        return next(new AppError('리뷰를 남길 문화유산을 찾을 수 없습니다.', 404));
    }

    // 이미 리뷰를 남겼는지 확인
    const existingReview = await Review.findOne({ user: req.body.user, culturalSite: req.body.culturalSite });
    if (existingReview) {
        return next(new AppError('이미 이 문화유산에 대한 리뷰를 남겼습니다.', 409)); // 409 Conflict [cite: 241]
    }

    const { culturalSite, user, rating, comment } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const newReview = new Review({
            culturalSite,
            user,
            rating,
            comment
        });

        // 1. Review 문서 저장 (세션 포함)
        const savedReview = await newReview.save({ session });

        // 2. CulturalSite의 reviews 배열 업데이트 (세션 포함)
        // $addToSet을 사용하여 중복 추가 방지
        await CulturalSite.findByIdAndUpdate(
            culturalSite,
            { $addToSet: { reviews: savedReview._id } },
            { session, new: true } // new: true는 업데이트 후의 문서를 반환 (여기서는 필요 없지만 좋은 습관)
        );

        // User.reviews 배열 업데이트 로직은 제거 (User 스키마에서 필드 제거)

        await session.commitTransaction(); // 모든 작업 성공 시 커밋

        res.status(201).json({
            status: 'success',
            data: {
                review: savedReview
            }
        });
    } catch (error) {
        await session.abortTransaction(); // 오류 발생 시 롤백
        console.error('리뷰 생성 트랜잭션 실패:', error);
        return next(new AppError('리뷰 생성 중 오류가 발생했습니다.', 500));
    } finally {
        session.endSession(); // 세션 종료
    }
});

// 리뷰 업데이트 (리뷰 작성자만 가능)
const updateReviewById = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
        return next(new AppError('해당 ID를 가진 리뷰가 없습니다.', 404));
    }

    // 리뷰 작성자와 현재 로그인한 사용자가 일치하는지 확인
    if (review.user.toString() !== req.user.id) {
        return next(new AppError('이 리뷰를 수정할 권한이 없습니다.', 403));
    }

    const updatedReview = await Review.findByIdAndUpdate(req.params.reviewId, req.body, {
        new: true,
        runValidators: true
    });

    // 만약 rating이 변경되었다면 CulturalSite의 averageRating 재계산이 필요할 수 있으나,
    // 이는 CulturalSite 스키마의 virtual 필드로 처리되거나,
    // 직접 CulturalSite 문서에 평균 평점을 저장한다면 해당 업데이트 로직을 추가해야 합니다.
    // (현재는 virtual 필드이므로 별도 업데이트 필요 없음)

    res.status(200).json({
        status: 'success',
        data: {
            review: updatedReview
        }
    });
});

// 리뷰 삭제 (리뷰 작성자 또는 관리자)
const deleteReviewById = asyncHandler(async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const review = await Review.findById(req.params.reviewId).session(session);
        if (!review) {
            await session.abortTransaction(); // 리뷰가 없으면 롤백
            return next(new AppError('해당 ID를 가진 리뷰가 없습니다.', 404));
        }

        // 리뷰 작성자 또는 관리자인지 확인
        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            await session.abortTransaction(); // 권한 없으면 롤백
            return next(new AppError('이 리뷰를 삭제할 권한이 없습니다.', 403));
        }

        // 1. Review 문서 삭제 (세션 포함)
        await Review.findByIdAndDelete(req.params.reviewId, { session });

        // 2. CulturalSite의 reviews 배열에서 제거 (세션 포함)
        await CulturalSite.findByIdAndUpdate(
            review.culturalSite,
            { $pull: { reviews: review._id } },
            { session }
        );

        // User.reviews 배열에서 제거 로직은 제거 (User 스키마에서 필드 제거)

        await session.commitTransaction(); // 모든 작업 성공 시 커밋

        res.status(204).json({ // 204 No Content는 성공적으로 삭제되었지만 응답 본문에 데이터가 없음을 의미합니다. [cite: 242]
            status: 'success',
            data: null
        });
    } catch (error) {
        await session.abortTransaction(); // 오류 발생 시 롤백
        console.error('리뷰 삭제 트랜잭션 실패:', error);
        return next(new AppError('리뷰 삭제 중 오류가 발생했습니다.', 500));
    } finally {
        session.endSession(); // 세션 종료
    }
});

module.exports = {
    getAllReviews,
    getReviewById,
    createReview,
    updateReviewById,
    deleteReviewById
}