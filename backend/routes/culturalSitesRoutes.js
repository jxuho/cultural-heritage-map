const express = require('express');
const router = express.Router();

const culturalSitesController = require('../controllers/culturalSiteController')
const authController = require('../controllers/authController')
const reviewRouter = require('./reviewsRoutes');

// 리뷰 라우트
router.use('/:culturalSiteId/reviews', reviewRouter);

// 좌표 기준 주위 cultural site 가져오기
/**
 * @swagger
 * /cultural-sites/nearby-osm:
 *    get:
 *      summary: get the nearby cultural sites.
 *      description: query to Overpass API to get nearby OSM elements in array. using extended query.
 *      tags: 
 *        - Cultural Sites
 *      responses:
 *        200: 
 *          description: return nearby OSM elements
 *          content: 
 *            application/json:
 *        400: 
 *          description: 유효하지 않은 위/경도 파라미터 또는 Chemnitz 경계 외부 위치.
 *          content: 
 *            application/json:
 *        500: 
 *          description: internal server error
 * 
 */
router.get('/nearby-osm',
  authController.protect, 
  authController.restrictTo('admin', 'user'),
  culturalSitesController.getNearbyOsmCulturalSites)

// osm 원본을 schema에 맞게 가공
/**
 * @swagger
 * /cultural-sites/process-osm:
 *   post:
 *     summary: OSM element를 CulturalSite로 변환환
 *     tags:
 *       - Cultural Sites
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: 잘못된 요청
 */
router.post('/process-osm', 
  authController.protect,
  authController.restrictTo('admin', 'user'),
  culturalSitesController.processAndPreviewOsmCulturalSite)

// schema에 일치하는 데이터를 db에 저장
router.post('/', 
  authController.protect,
  authController.restrictTo('admin'),
  culturalSitesController.saveCulturalSiteToDb)

// 전체 조회 + 필터링 (query: category, name)
router.get('/', culturalSitesController.getAllCulturalSites);

// 단건 조회
router.get('/:id', culturalSitesController.getCulturalSiteById);

// 문화 유적지 정보 업데이트 (관리자용, 인증 필요)
router.put('/:id',
  authController.protect, // <<<<<< 보호 미들웨어
  authController.restrictTo('admin'), // <<<<<< 권한 미들웨어
  culturalSitesController.updateCulturalSiteById);

// DELETE /:id: 문화 유적지 삭제 (관리자용, 인증 필요)
router.delete('/:id',
  authController.protect, // <<<<<< 보호 미들웨어
  authController.restrictTo('admin'), // <<<<<< 권한 미들웨어
  culturalSitesController.deleteCulturalSiteById);



module.exports = router;
