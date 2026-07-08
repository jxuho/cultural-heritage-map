const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const culturalSiteService = require('../services/culturalSiteService');

const assertAdmin = (req, next, message) => {
  if (!req.user || req.user.role !== 'admin') {
    next(new AppError(message, 403));
    return false;
  }
  return true;
};

const getAllCulturalSites = asyncHandler(async (req, res) => {
  const culturalSites = await culturalSiteService.getAllCulturalSites(
    req.query,
  );

  res.status(200).json({
    status: 'success',
    results: culturalSites.length,
    data: { culturalSites },
  });
});

const getCulturalSiteById = asyncHandler(async (req, res) => {
  const culturalSite = await culturalSiteService.getCulturalSiteById(
    req.params.id,
    req.query.reviewSort,
  );

  res.status(200).json({
    status: 'success',
    data: { culturalSite },
  });
});

const updateCulturalSiteById = asyncHandler(async (req, res, next) => {
  if (
    !assertAdmin(
      req,
      next,
      'You do not have permission to edit cultural heritage. Only administrators can do so.',
    )
  ) {
    return;
  }

  const culturalSite = await culturalSiteService.updateCulturalSiteById(
    req.params.id,
    req.body,
  );

  res.status(200).json({
    status: 'success',
    message: 'Cultural heritage information has been successfully updated.',
    data: { culturalSite },
  });
});

const deleteCulturalSiteById = asyncHandler(async (req, res, next) => {
  if (
    !assertAdmin(
      req,
      next,
      'Do not have the authority to directly register cultural heritage. Only administrators can do this.',
    )
  ) {
    return;
  }

  await culturalSiteService.deleteCulturalSiteById(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

const getNearbyOsmCulturalSites = asyncHandler(async (req, res) => {
  const osmCulturalSites = await culturalSiteService.getNearbyOsmCulturalSites(
    req.query,
  );

  res.status(200).json({
    status: 'success',
    results: osmCulturalSites.length,
    data: { osmCulturalSites },
  });
});

const saveCulturalSiteToDb = asyncHandler(async (req, res, next) => {
  if (
    !assertAdmin(
      req,
      next,
      'Do not have the authority to directly register cultural heritage. Only administrators can do this.',
    )
  ) {
    return;
  }

  const culturalSite = await culturalSiteService.saveCulturalSiteToDb(
    req.body,
    req.user.id,
  );

  res.status(201).json({
    status: 'success',
    message:
      'Processed cultural heritage has been successfully saved to the database.',
    data: { culturalSite },
  });
});

const getDistrictStats = asyncHandler(async (req, res) => {
  const stats = await culturalSiteService.getDistrictStats();

  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

const getDistrictBoundaries = asyncHandler(async (req, res, next) => {
  try {
    const districtBoundaries =
      await culturalSiteService.getDistrictBoundaries();
    res.status(200).json({
      status: 'success',
      data: { districtBoundaries },
    });
  } catch (error) {
    next(
      new AppError(`Failed to load district boundaries: ${error.message}`, 500),
    );
  }
});

module.exports = {
  getAllCulturalSites,
  getCulturalSiteById,
  saveCulturalSiteToDb,
  updateCulturalSiteById,
  deleteCulturalSiteById,
  getNearbyOsmCulturalSites,
  getDistrictStats,
  getDistrictBoundaries,
};
