const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

// admin only: Get full reviews of all cultural assets (GET /api/v1/reviews/admin/all)
router.get(
  '/admin/all',
  authController.protect,
  authController.restrictTo('admin'),
  reviewController.getAllReviewsForAdmin,
);

// View all reviews of a specific cultural property
router.get('/', reviewController.getAllReviewsFromCulturalSite);

// View single review
router.get('/:reviewId', reviewController.getReviewById);

// Create review (logged in user and admin)
router.post(
  '/',
  authController.protect,
  authController.restrictTo('user', 'admin'),
  reviewController.createReview,
);

// Edit review
router.patch(
  '/:reviewId',
  authController.protect,
  authController.restrictTo('user', 'admin'),
  reviewController.updateReviewById,
);

// Delete review
router.delete(
  '/:reviewId',
  authController.protect,
  authController.restrictTo('user', 'admin'),
  reviewController.deleteReviewById,
);

module.exports = router;
