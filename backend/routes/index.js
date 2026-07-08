const express = require('express');

const culturalSitesRoutes = require('./culturalSitesRoutes');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const proposalRoutes = require('./proposalRoutes');
const reviewsRoutes = require('./reviewsRoutes');

const router = express.Router();

router.use('/cultural-sites', culturalSitesRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/proposals', proposalRoutes);

module.exports = router;
