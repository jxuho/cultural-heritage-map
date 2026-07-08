const asyncHandler = require('../utils/asyncHandler');
const proposalService = require('../services/proposalService');

const createProposal = asyncHandler(async (req, res) => {
  const proposal = await proposalService.createProposal(req.user.id, req.body);

  res.status(201).json({
    status: 'success',
    message: 'Proposal successfully submitted.',
    data: { proposal },
  });
});

const getProposalsByUserId = asyncHandler(async (req, res) => {
  const proposals = await proposalService.getProposalsByUserId(req.user.id);

  res.status(200).json({
    status: 'success',
    results: proposals.length,
    data: { proposals },
  });
});

const getAllProposals = asyncHandler(async (req, res) => {
  const proposals = await proposalService.getAllProposals(req.query);

  res.status(200).json({
    status: 'success',
    results: proposals.length,
    data: { proposals },
  });
});

const getProposalById = asyncHandler(async (req, res) => {
  const proposal = await proposalService.getProposalById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { proposal },
  });
});

const acceptProposal = asyncHandler(async (req, res) => {
  const { proposal, culturalSite } = await proposalService.acceptProposal(
    req.params.id,
    req.user.id,
    req.body.adminComment,
  );

  res.status(200).json({
    status: 'success',
    message: 'Proposal successfully accepted.',
    data: { proposal, culturalSite },
  });
});

const rejectProposal = asyncHandler(async (req, res) => {
  const proposal = await proposalService.rejectProposal(
    req.params.id,
    req.user.id,
    req.body.adminComment,
  );

  res.status(200).json({
    status: 'success',
    message: 'Proposal successfully rejected.',
    data: { proposal },
  });
});

module.exports = {
  createProposal,
  getProposalsByUserId,
  getAllProposals,
  getProposalById,
  acceptProposal,
  rejectProposal,
};
