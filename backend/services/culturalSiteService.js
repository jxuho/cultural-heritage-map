const fs = require('fs/promises');
const path = require('path');
const mongoose = require('mongoose');

const CulturalSite = require('../models/CulturalSite');
const Review = require('../models/Review');
const User = require('../models/User');
const ExcludeSourceId = require('../models/ExcludeSourceId');
const AppError = require('../utils/AppError');
const { addSourceIdToExclusion } = require('./excludeSourceIdService');
const { isPointInCity, isValidLatLng } = require('../utils/locationUtils');
const {
  extendedCulturalSiteQuery,
  CITY_RELATION_IDS,
} = require('../config/osmData');
const { queryOverpass } = require('./overpassService');
const {
  processOsmElementForCulturalSite,
} = require('../utils/osmDataProcessor');
const {
  CULTURAL_SITE_UPDATABLE_FIELDS,
  CULTURAL_CATEGORY,
} = require('../config/culturalSiteConfig');

let districtBoundariesCache = null;

const parseBboxParams = (query) => {
  const bboxRaw = query.bbox;
  if (!bboxRaw || typeof bboxRaw !== 'string') {
    return null;
  }

  const values = bboxRaw.split(',').map((value) => Number(value.trim()));
  if (values.length !== 4 || values.some(Number.isNaN)) {
    return null;
  }

  const [minLng, minLat, maxLng, maxLat] = values;
  if (minLng >= maxLng || minLat >= maxLat) {
    return null;
  }

  return { minLng, minLat, maxLng, maxLat };
};

const buildCulturalSiteListFilter = (query) => {
  const bbox = parseBboxParams(query);
  if (!bbox) {
    return { filter: {}, aggregationOptions: {} };
  }

  return {
    filter: {
      location: {
        $geoWithin: {
          $box: [
            [bbox.minLng, bbox.minLat],
            [bbox.maxLng, bbox.maxLat],
          ],
        },
      },
    },
    aggregationOptions: { hint: { location: '2dsphere' } },
  };
};

const getAllCulturalSites = async (query) => {
  const { filter, aggregationOptions } = buildCulturalSiteListFilter(query);

  const result = await CulturalSite.aggregate(
    [
      { $match: filter },
      {
        $project: {
          _id: 1,
          name: 1,
          category: 1,
          location: 1,
          address: 1,
          averageRating: 1,
          reviewCount: 1,
        },
      },
      {
        $group: {
          _id: null,
          allSites: { $push: '$$ROOT' },
        },
      },
    ],
    aggregationOptions,
  );

  return result[0]?.allSites || [];
};

const getReviewSortOrder = (reviewSortParam = 'newest') => {
  if (reviewSortParam === 'highestRating') {
    return { rating: -1 };
  }
  if (reviewSortParam === 'lowestRating') {
    return { rating: 1 };
  }
  return { createdAt: -1 };
};

const buildCulturalSiteDetailPipeline = (siteId, reviewSortParam) => [
  {
    $match: { _id: mongoose.Types.ObjectId.createFromHexString(siteId) },
  },
  {
    $lookup: {
      from: 'reviews',
      localField: 'reviews',
      foreignField: '_id',
      as: 'reviewsData',
    },
  },
  {
    $unwind: {
      path: '$reviewsData',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $lookup: {
      from: 'users',
      localField: 'reviewsData.user',
      foreignField: '_id',
      as: 'reviewsData.userPopulated',
    },
  },
  {
    $unwind: {
      path: '$reviewsData.userPopulated',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $addFields: {
      'reviewsData.user': {
        _id: '$reviewsData.userPopulated._id',
        username: '$reviewsData.userPopulated.username',
        profileImage: '$reviewsData.userPopulated.profileImage',
      },
    },
  },
  {
    $group: {
      _id: '$_id',
      name: { $first: '$name' },
      description: { $first: '$description' },
      category: { $first: '$category' },
      location: { $first: '$location' },
      address: { $first: '$address' },
      website: { $first: '$website' },
      imageUrl: { $first: '$imageUrl' },
      openingHours: { $first: '$openingHours' },
      licenseInfo: { $first: '$licenseInfo' },
      sourceId: { $first: '$sourceId' },
      favoritesCount: { $first: '$favoritesCount' },
      proposedBy: { $first: '$proposedBy' },
      registeredBy: { $first: '$registeredBy' },
      createdAt: { $first: '$createdAt' },
      updatedAt: { $first: '$updatedAt' },
      originalTags: { $first: '$originalTags' },
      reviews: {
        $push: {
          $cond: {
            if: { $ne: ['$reviewsData', null] },
            then: {
              _id: '$reviewsData._id',
              rating: '$reviewsData.rating',
              comment: '$reviewsData.comment',
              createdAt: '$reviewsData.createdAt',
              user: '$reviewsData.user',
            },
            else: '$$REMOVE',
          },
        },
      },
    },
  },
  {
    $addFields: {
      reviews: {
        $filter: {
          input: '$reviews',
          as: 'review',
          cond: { $ne: ['$$review', null] },
        },
      },
    },
  },
  {
    $addFields: {
      reviews: {
        $sortArray: {
          input: '$reviews',
          sortBy: getReviewSortOrder(reviewSortParam),
        },
      },
    },
  },
  {
    $addFields: {
      averageRating: { $ifNull: [{ $avg: '$reviews.rating' }, 0] },
      reviewCount: { $size: '$reviews' },
    },
  },
  {
    $project: {
      name: 1,
      description: 1,
      category: 1,
      location: 1,
      address: 1,
      website: 1,
      imageUrl: 1,
      openingHours: 1,
      licenseInfo: 1,
      sourceId: 1,
      favoritesCount: 1,
      proposedBy: 1,
      registeredBy: 1,
      createdAt: 1,
      updatedAt: 1,
      reviews: 1,
      averageRating: 1,
      reviewCount: 1,
      originalTags: 1,
    },
  },
];

const normalizeReviewSummary = (culturalSite) => {
  const reviews = Array.isArray(culturalSite.reviews)
    ? culturalSite.reviews.filter(
        (review) => review && review._id && review.user && review.user._id,
      )
    : [];

  if (reviews.length === 0) {
    return {
      ...culturalSite,
      reviews,
      averageRating: 0,
      reviewCount: 0,
    };
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);

  return {
    ...culturalSite,
    reviews,
    averageRating: parseFloat((totalRating / reviews.length).toFixed(1)),
    reviewCount: reviews.length,
  };
};

const getCulturalSiteById = async (siteId, reviewSortParam) => {
  if (!mongoose.isObjectIdOrHexString(siteId)) {
    throw new AppError('Not valid Id.', 400);
  }

  const [culturalSite] = await CulturalSite.aggregate(
    buildCulturalSiteDetailPipeline(siteId, reviewSortParam),
  );

  if (!culturalSite) {
    throw new AppError('No cultural heritage with that ID found.', 404);
  }

  return normalizeReviewSummary(culturalSite);
};

const buildCulturalSiteUpdateData = (body) => {
  const updateData = {};
  for (const field of CULTURAL_SITE_UPDATABLE_FIELDS) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  if (updateData.category && !CULTURAL_CATEGORY.includes(updateData.category)) {
    throw new AppError(`Invalid category value: ${updateData.category}`, 400);
  }
  if (
    updateData.name &&
    (updateData.name.length < 2 || updateData.name.length > 100)
  ) {
    throw new AppError('Name must be between 2 and 100 characters long.', 400);
  }
  if (updateData.description && updateData.description.length > 1000) {
    throw new AppError('Description cannot exceed 1000 characters.', 400);
  }
  if (Object.keys(updateData).length === 0) {
    throw new AppError(
      'The field to be updated is not provided or is invalid.',
      400,
    );
  }

  return updateData;
};

const updateCulturalSiteById = async (siteId, body) => {
  const culturalSite = await CulturalSite.findByIdAndUpdate(
    siteId,
    buildCulturalSiteUpdateData(body),
    { new: true, runValidators: true },
  );

  if (!culturalSite) {
    throw new AppError('No cultural heritage with that ID found.', 404);
  }

  return culturalSite;
};

const deleteCulturalSiteById = async (siteId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const culturalSite = await CulturalSite.findById(siteId).session(session);

    if (!culturalSite) {
      throw new AppError('No cultural heritage with that ID found.', 404);
    }

    await CulturalSite.findByIdAndDelete(siteId, { session });

    if (culturalSite.reviews && culturalSite.reviews.length > 0) {
      await Review.deleteMany({ culturalSite: culturalSite._id }, { session });
      await User.updateMany(
        { reviews: { $in: culturalSite.reviews } },
        { $pullAll: { reviews: culturalSite.reviews } },
        { session },
      );
    }

    await User.updateMany(
      { favoriteSites: siteId },
      { $pull: { favoriteSites: siteId } },
      { session },
    );

    await addSourceIdToExclusion(culturalSite.sourceId, session);
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    if (error.code === 11000) {
      throw new AppError('The ID already exists in the exclusion list.', 409);
    }
    throw error;
  } finally {
    session.endSession();
  }
};

const assertPointInCurrentCity = (lat, lon, cityName, message) => {
  try {
    if (!isPointInCity(lat, lon, cityName)) {
      throw new AppError(message, 400);
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Error occurs during location validation: ${error.message}`,
      500,
    );
  }
};

const getNearbyOsmCulturalSites = async ({ lon, lat, noReverseGeocode }) => {
  const currentCity = process.env.CITY_NAME || 'berlin';

  if (!isValidLatLng(lon, lat)) {
    throw new AppError(
      'Effective latitude and longitude query parameters are required.',
      400,
    );
  }

  const parsedLat = parseFloat(lat);
  const parsedLon = parseFloat(lon);
  const radius = 50;

  assertPointInCurrentCity(
    parsedLat,
    parsedLon,
    currentCity,
    `Since the input location is not inside the boundary when ${currentCity}, the surrounding OSM cultural heritage cannot be searched.`,
  );

  const currentCityAreaId = CITY_RELATION_IDS[currentCity];
  if (!currentCityAreaId) {
    throw new AppError(
      `OSM area ID for city "${currentCity}" is not defined.`,
      400,
    );
  }

  const osmData = await queryOverpass(
    extendedCulturalSiteQuery(currentCityAreaId, radius, parsedLat, parsedLon),
  );
  const processedSites = (
    await Promise.all(
      (osmData.elements || []).map((el) =>
        processOsmElementForCulturalSite(el, noReverseGeocode !== 'true'),
      ),
    )
  ).filter(
    (site) => site !== null && !site.name.startsWith('Unnamed Site (ID:'),
  );

  const osmSourceIds = processedSites
    .map((site) => site.sourceId)
    .filter(Boolean);
  if (osmSourceIds.length === 0) {
    return processedSites;
  }

  const existingCulturalSites = await CulturalSite.find({
    sourceId: { $in: osmSourceIds },
  }).select('sourceId');
  const existingSourceIds = new Set(
    existingCulturalSites.map((site) => site.sourceId),
  );

  return processedSites.filter((site) => !existingSourceIds.has(site.sourceId));
};

const saveCulturalSiteToDb = async (culturalSiteData, registeredBy) => {
  const currentCity = process.env.CITY_NAME || 'berlin';

  if (
    !culturalSiteData.name ||
    !culturalSiteData.category ||
    !culturalSiteData.location ||
    !Array.isArray(culturalSiteData.location.coordinates) ||
    culturalSiteData.location.coordinates.length !== 2 ||
    !culturalSiteData.sourceId
  ) {
    throw new AppError(
      'The required fields for the cultural heritage data to be saved are missing or not in the correct format.',
      400,
    );
  }

  const [parsedLon, parsedLat] = culturalSiteData.location.coordinates;
  assertPointInCurrentCity(
    parsedLat,
    parsedLon,
    currentCity,
    `The entered location is not within the ${currentCity} city boundary. Only cultural heritage within ${currentCity} can be registered.`,
  );

  const existingCulturalSite = await CulturalSite.findOne({
    sourceId: culturalSiteData.sourceId,
  });
  if (existingCulturalSite) {
    throw new AppError(
      `sourceId '${culturalSiteData.sourceId}' is already registered as a cultural heritage site.`,
      409,
    );
  }

  const isExcluded = await ExcludeSourceId.findOne({
    sourceId: culturalSiteData.sourceId,
  });
  if (isExcluded) {
    throw new AppError(
      `sourceId '${culturalSiteData.sourceId}' is in the exclusion list.`,
      403,
    );
  }

  try {
    return await CulturalSite.create({
      ...culturalSiteData,
      registeredBy,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError(
        `Error occurred while saving to database: ${error.message}`,
        409,
      );
    }
    throw new AppError(
      `Error occurred while saving processed cultural heritage: ${error.message}`,
      500,
    );
  }
};

const getDistrictStats = () =>
  CulturalSite.aggregate([
    { $match: { active: true } },
    {
      $group: {
        _id: '$address.district',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

const getDistrictBoundaries = async () => {
  if (!districtBoundariesCache) {
    const boundaryFilePath = path.join(
      __dirname,
      '..',
      'data',
      'berlin_district_boundary.geojson',
    );
    const rawGeojson = await fs.readFile(boundaryFilePath, 'utf8');
    districtBoundariesCache = JSON.parse(rawGeojson);
  }

  return districtBoundariesCache;
};

module.exports = {
  getAllCulturalSites,
  getCulturalSiteById,
  updateCulturalSiteById,
  deleteCulturalSiteById,
  getNearbyOsmCulturalSites,
  saveCulturalSiteToDb,
  getDistrictStats,
  getDistrictBoundaries,
};
