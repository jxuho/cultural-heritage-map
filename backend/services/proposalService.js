const mongoose = require('mongoose');

const Proposal = require('../models/Proposal');
const CulturalSite = require('../models/CulturalSite');
const ExcludeSourceId = require('../models/ExcludeSourceId');
const Review = require('../models/Review');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const {
  CULTURAL_SITE_UPDATABLE_FIELDS,
  CULTURAL_CATEGORY,
} = require('../config/culturalSiteConfig');
const { queryOverpass } = require('./overpassService');
const {
  processOsmElementForCulturalSite,
} = require('../utils/osmDataProcessor');
const { singleElementQuery } = require('../config/osmData');
const {
  isValidLatLng,
  isPointInCity,
  areCoordinatesMatching,
} = require('../utils/locationUtils');

const proposalPopulation = [
  {
    path: 'culturalSite',
    select: 'name description category address website imageUrl openingHours',
  },
  { path: 'proposedBy', select: 'name email' },
];

const parseSourceId = (sourceId) => {
  if (!sourceId) {
    throw new AppError(
      'sourceId is required when proposing a new cultural site. (e.g., node/12345, way/56789)',
      400,
    );
  }

  const sourceIdParts = sourceId.split('/');
  if (
    sourceIdParts.length !== 2 ||
    !['node', 'way', 'relation'].includes(sourceIdParts[0]) ||
    Number.isNaN(parseInt(sourceIdParts[1], 10))
  ) {
    throw new AppError(
      'Invalid sourceId format. (e.g., node/12345, way/56789, relation/123)',
      400,
    );
  }

  return {
    osmType: sourceIdParts[0],
    osmId: parseInt(sourceIdParts[1], 10),
  };
};

const assertNoPendingProposal = async (proposalType, rawData, userId) => {
  if (proposalType !== 'update' && proposalType !== 'delete') {
    return;
  }

  const culturalSiteId = rawData.culturalSite;
  if (!culturalSiteId) {
    throw new AppError('Cultural site ID (culturalSite) is required.', 400);
  }

  const existingPendingProposal = await Proposal.findOne({
    culturalSite: culturalSiteId,
    proposedBy: userId,
    status: 'pending',
  });

  if (!existingPendingProposal) {
    return;
  }

  const proposalTypeMessages = {
    update: 'modification proposal',
    delete: 'deletion proposal',
    create: 'creation proposal',
  };

  throw new AppError(
    `A ${proposalTypeMessages[existingPendingProposal.proposalType]} for this cultural site has already been submitted and is pending review.`,
    409,
  );
};

const validateCreateProposalLocation = (
  location,
  actualLocation,
  currentCity,
) => {
  if (!location) {
    throw new AppError(
      'Valid location information (location) is required when proposing a new cultural site.',
      400,
    );
  }
  if (
    location.type !== 'Point' ||
    location.coordinates.length !== 2 ||
    !isValidLatLng(location.coordinates[0], location.coordinates[1])
  ) {
    throw new AppError(
      'The provided location information (location) format is invalid.',
      400,
    );
  }
  if (
    !isPointInCity(
      location.coordinates[1],
      location.coordinates[0],
      currentCity,
    )
  ) {
    throw new AppError(
      `The provided location information (location) is outside ${currentCity}.`,
      400,
    );
  }
  if (
    !areCoordinatesMatching(
      [location.coordinates[0], location.coordinates[1]],
      [actualLocation.coordinates[0], actualLocation.coordinates[1]],
    )
  ) {
    throw new AppError(
      'The provided location information does not match the actual OSM node. Please select the exact location on the map.',
      400,
    );
  }
};

const buildCreateProposal = async (rawData, userId, proposalMessage) => {
  const currentCity = process.env.CITY_NAME || 'berlin';
  const proposedSourceId = rawData.sourceId;
  const { osmType, osmId } = parseSourceId(proposedSourceId);

  const existingCulturalSite = await CulturalSite.findOne({
    sourceId: proposedSourceId,
  });
  if (existingCulturalSite) {
    throw new AppError(
      `A cultural site with sourceId (${proposedSourceId}) is already registered. Please use a modification proposal.`,
      409,
    );
  }

  const existingCreateProposal = await Proposal.findOne({
    'proposedChanges.sourceId': proposedSourceId,
    proposedBy: userId,
    proposalType: 'create',
    status: 'pending',
  });
  if (existingCreateProposal) {
    throw new AppError(
      'A creation proposal for this OSM ID has already been submitted and is pending review.',
      409,
    );
  }

  const osmResponse = await queryOverpass(singleElementQuery(osmType, osmId));
  const actualOsmElement = osmResponse.elements[0];
  if (!actualOsmElement) {
    throw new AppError(
      `No element corresponding to the proposed OSM ID (${proposedSourceId}) could be found in Overpass API.`,
      404,
    );
  }

  const actualSourceId = `${actualOsmElement.type}/${actualOsmElement.id}`;
  if (proposedSourceId !== actualSourceId) {
    throw new AppError(
      'The provided sourceId does not match the actual OSM data.',
      400,
    );
  }

  const processedFromOsm =
    await processOsmElementForCulturalSite(actualOsmElement);
  validateCreateProposalLocation(
    rawData.location,
    processedFromOsm.location,
    currentCity,
  );

  const proposedChanges = { ...processedFromOsm };
  for (const field of CULTURAL_SITE_UPDATABLE_FIELDS) {
    if (rawData[field] !== undefined) {
      proposedChanges[field] = rawData[field];
    }
  }

  proposedChanges.sourceId = actualSourceId;
  proposedChanges.location = processedFromOsm.location;
  proposedChanges.originalTags = actualOsmElement.tags;

  if (
    proposedChanges.category &&
    !CULTURAL_CATEGORY.includes(proposedChanges.category)
  ) {
    throw new AppError(
      `Invalid category value: ${proposedChanges.category}`,
      400,
    );
  }

  return Proposal.create({
    proposedBy: userId,
    proposalType: 'create',
    proposedChanges,
    proposalMessage,
    status: 'pending',
  });
};

const buildUpdateProposal = async (rawData, userId, proposalMessage) => {
  const culturalSite = await CulturalSite.findById(rawData.culturalSite);
  if (!culturalSite) {
    throw new AppError('Cultural site to modify not found.', 404);
  }

  const proposedChanges = {};
  for (const field of CULTURAL_SITE_UPDATABLE_FIELDS) {
    if (
      rawData[field] !== undefined &&
      JSON.stringify(culturalSite[field]) !== JSON.stringify(rawData[field])
    ) {
      proposedChanges[field] = {
        oldValue: culturalSite[field],
        newValue: rawData[field],
      };
    }
  }

  if (Object.keys(proposedChanges).length === 0) {
    throw new AppError(
      'Valid changes are required for a modification proposal. (Please provide values different from existing ones)',
      400,
    );
  }
  if (
    proposedChanges.category &&
    proposedChanges.category.newValue &&
    !CULTURAL_CATEGORY.includes(proposedChanges.category.newValue)
  ) {
    throw new AppError(
      `Invalid category value: ${proposedChanges.category.newValue}`,
      400,
    );
  }

  return Proposal.create({
    culturalSite: rawData.culturalSite,
    proposedBy: userId,
    proposalType: 'update',
    proposedChanges,
    proposalMessage,
    status: 'pending',
  });
};

const buildDeleteProposal = async (rawData, userId, proposalMessage) => {
  const culturalSite = await CulturalSite.findById(rawData.culturalSite);
  if (!culturalSite) {
    throw new AppError('Cultural site to delete not found.', 404);
  }

  return Proposal.create({
    culturalSite: rawData.culturalSite,
    proposedBy: userId,
    proposalType: 'delete',
    proposedChanges: {},
    proposalMessage,
    status: 'pending',
  });
};

const createProposal = async (userId, body) => {
  const { proposalType, proposalMessage, ...rawData } = body;
  if (!proposalType) {
    throw new AppError('Proposal type (proposalType) is required.', 400);
  }

  await assertNoPendingProposal(proposalType, rawData, userId);

  if (proposalType === 'create') {
    return buildCreateProposal(rawData, userId, proposalMessage);
  }
  if (proposalType === 'update') {
    return buildUpdateProposal(rawData, userId, proposalMessage);
  }
  if (proposalType === 'delete') {
    return buildDeleteProposal(rawData, userId, proposalMessage);
  }

  throw new AppError('Unknown proposal type.', 400);
};

const getProposalsByUserId = (userId) =>
  Proposal.find({ proposedBy: userId })
    .populate(proposalPopulation)
    .sort('-createdAt');

const getAllProposals = (query) => {
  const filter = {};
  if (query.status) {
    filter.status = query.status;
  }
  if (query.type) {
    filter.proposalType = query.type;
  }

  return Proposal.find(filter).populate(proposalPopulation).sort('-createdAt');
};

const getProposalById = async (id) => {
  const proposal = await Proposal.findById(id)
    .populate('culturalSite', 'name sourceId location')
    .populate('proposedBy', 'name email')
    .populate('reviewedBy', 'name email');

  if (!proposal) {
    throw new AppError('No proposal found with that ID.', 404);
  }

  return proposal;
};

const applyAcceptedProposal = async (proposal, adminId, session) => {
  if (proposal.proposalType === 'create') {
    const newCulturalSiteData = {
      ...proposal.proposedChanges,
      registeredBy: adminId,
      proposedBy: proposal.proposedBy,
    };

    if (
      !newCulturalSiteData.name ||
      !newCulturalSiteData.category ||
      !newCulturalSiteData.location ||
      !newCulturalSiteData.sourceId
    ) {
      throw new AppError(
        'Missing required information for creating a new cultural site.',
        400,
      );
    }

    return CulturalSite.create([newCulturalSiteData], { session });
  }

  if (proposal.proposalType === 'update') {
    const culturalSite = await CulturalSite.findById(
      proposal.culturalSite,
    ).session(session);
    if (!culturalSite) {
      throw new AppError(
        'Target cultural site for modification not found.',
        404,
      );
    }

    const updateData = {};
    for (const field of CULTURAL_SITE_UPDATABLE_FIELDS) {
      if (
        proposal.proposedChanges[field] !== undefined &&
        proposal.proposedChanges[field].newValue !== undefined
      ) {
        updateData[field] = proposal.proposedChanges[field].newValue;
      }
    }

    Object.assign(culturalSite, updateData);
    await culturalSite.save({ session });
    return culturalSite;
  }

  if (proposal.proposalType === 'delete') {
    const culturalSite = await CulturalSite.findById(
      proposal.culturalSite,
    ).session(session);

    if (culturalSite) {
      await Review.deleteMany({ culturalSite: culturalSite._id }).session(
        session,
      );
      await User.updateMany(
        { favoriteSites: culturalSite._id },
        { $pull: { favoriteSites: culturalSite._id } },
        { session },
      );
      await CulturalSite.findByIdAndDelete(proposal.culturalSite).session(
        session,
      );

      if (culturalSite.sourceId) {
        await ExcludeSourceId.findOneAndUpdate(
          { sourceId: culturalSite.sourceId },
          {
            sourceId: culturalSite.sourceId,
            reason: 'Deleted by user proposal',
          },
          { upsert: true, new: true, session },
        );
      }
    }

    return culturalSite;
  }

  throw new AppError('Unknown proposal type.', 400);
};

const acceptProposal = async (id, adminId, adminComment) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const proposal = await Proposal.findById(id).session(session);
    if (!proposal) {
      throw new AppError('Proposal not found.', 404);
    }
    if (proposal.status !== 'pending') {
      throw new AppError('This proposal has already been processed.', 400);
    }

    const culturalSite = await applyAcceptedProposal(
      proposal,
      adminId,
      session,
    );

    proposal.status = 'accepted';
    proposal.reviewedBy = adminId;
    proposal.reviewedAt = Date.now();
    proposal.adminComment = adminComment || 'Accepted';
    await proposal.save({ session });

    await session.commitTransaction();
    return { proposal, culturalSite };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const rejectProposal = async (id, adminId, adminComment) => {
  const proposal = await Proposal.findById(id);

  if (!proposal) {
    throw new AppError('No proposal found with that ID.', 404);
  }
  if (proposal.status !== 'pending') {
    throw new AppError('This proposal has already been reviewed.', 400);
  }

  proposal.status = 'rejected';
  proposal.reviewedBy = adminId;
  proposal.reviewedAt = Date.now();
  proposal.adminComment = adminComment || 'Proposal rejected.';
  await proposal.save();

  return proposal;
};

module.exports = {
  createProposal,
  getProposalsByUserId,
  getAllProposals,
  getProposalById,
  acceptProposal,
  rejectProposal,
};
