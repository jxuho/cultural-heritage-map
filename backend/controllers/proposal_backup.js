// backend/controllers/proposalController.js
const Proposal = require('../models/Proposal');
const CulturalSite = require('../models/CulturalSite');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const mongoose = require('mongoose')
const { addSourceIdToExclusion } = require('../services/excludeSourceIdService');

// 1. 사용자가 문화유산 정보 수정/신규 등록/삭제를 제안
const createProposal = asyncHandler(async (req, res, next) => {
    const culturalSiteId = req.params.culturalSiteId; // 기존 문화유산 ID (수정/삭제 제안 시)
    const { proposalType, proposedChanges } = req.body; // 제안 유형과 변경 사항

    if (!proposalType) {
        return next(new AppError('제안 유형 (proposalType)은 필수입니다.', 400));
    }

    // 제안 유형에 따른 유효성 검사
    if (proposalType === 'create') {
        if (culturalSiteId) { // 새 문화유산 등록 제안인데 culturalSiteId가 있으면 오류
            return next(new AppError('새로운 문화유산 등록 제안 시 culturalSiteId는 포함할 수 없습니다.', 400));
        }
        if (!proposedChanges || Object.keys(proposedChanges).length === 0) {
            return next(new AppError('새로운 문화유산 등록 제안 시 proposedChanges는 필수입니다.', 400));
        }
        // 새로운 CulturalSite 등록 제안일 때는 proposedChanges에 CulturalSite 모델에 필요한 필수 필드들이 모두 포함되어야 함
        if (!proposedChanges.name || !proposedChanges.category || !proposedChanges.location || !proposedChanges.sourceId || !proposedChanges.description) {
            return next(new AppError('새로운 문화유산 등록 제안 시 이름, 카테고리, 위치, sourceId, description은 필수입니다.', 400));
        }
        const existingSite = await CulturalSite.findOne({ sourceId: proposedChanges.sourceId });
        if (existingSite) {
            return next(new AppError('이미 존재하는 sourceId입니다. 다른 sourceId를 사용하거나 기존 문화유산 정보 수정을 제안해주세요.', 400));
        }
    } else if (proposalType === 'update') {
        if (!culturalSiteId) { // 기존 문화유산 수정 제안인데 culturalSiteId가 없으면 오류
            return next(new AppError('기존 문화유산 수정 제안 시 culturalSiteId는 필수입니다.', 400));
        }
        const existingSite = await CulturalSite.findOne({ sourceId: proposedChanges.sourceId });
        if (!existingSite) {
            return next(new AppError('해당 sourceId가 존재하지 않습니다.', 400));
        }
        if (!proposedChanges || Object.keys(proposedChanges).length === 0) {
            return next(new AppError('문화유산 수정 제안 시 proposedChanges는 필수입니다.', 400));
        }
        if (!proposedChanges.name || !proposedChanges.category || !proposedChanges.location || !proposedChanges.sourceId || !proposedChanges.description) {
            return next(new AppError('문화유산 수정 제안 시 이름, 카테고리, 위치, sourceId, description은 필수입니다.', 400));
        }

    } else if (proposalType === 'delete') {
        if (!culturalSiteId) { // 문화유산 삭제 제안인데 culturalSiteId가 없으면 오류
            return next(new AppError('문화유산 삭제 제안 시 culturalSiteId는 필수입니다.', 400));
        }
        // 삭제 제안의 경우 proposedChanges는 선택 사항 (보통 비어있음)
    } else {
        return next(new AppError('유효하지 않은 제안 유형입니다.', 400));
    }


    let culturalSiteToPropose = null;
    if (culturalSiteId) { // 기존 문화유산에 대한 제안 (수정 또는 삭제)인 경우
        culturalSiteToPropose = await CulturalSite.findById(culturalSiteId);
        if (!culturalSiteToPropose) {
            return next(new AppError('해당 ID를 가진 문화유산이 존재하지 않습니다.', 404));
        }
        // 삭제 제안인 경우 이미 pending 상태인 삭제 제안이 있는지 확인 (중복 방지)
        if (proposalType === 'delete') {
            const existingPendingDeleteProposal = await Proposal.findOne({
                culturalSite: culturalSiteId,
                proposalType: 'delete',
                status: 'pending'
            });
            if (existingPendingDeleteProposal) {
                return next(new AppError('해당 문화유산에 대한 삭제 제안이 이미 보류 중입니다.', 400));
            }
        }
    }

    // 새 제안 생성
    const newProposal = await Proposal.create({
        culturalSite: culturalSiteToPropose ? culturalSiteToPropose._id : null,
        proposedBy: req.user.id,
        proposalType: proposalType, // 새 필드 사용
        proposedChanges: proposedChanges || {}, // 삭제 제안의 경우 proposedChanges가 없을 수 있으므로 빈 객체로 기본값 설정
        status: 'pending'
    });

    let successMessage;
    if (proposalType === 'create') successMessage = '새로운 문화유산 등록 제안이 제출되었습니다. 관리자의 승인을 기다려주세요.';
    else if (proposalType === 'update') successMessage = '문화유산 수정 제안이 제출되었습니다. 관리자의 승인을 기다려주세요.';
    else if (proposalType === 'delete') successMessage = '문화유산 삭제 제안이 제출되었습니다. 관리자의 승인을 기다려주세요.';

    res.status(201).json({
        status: 'success',
        message: successMessage,
        data: {
            proposal: newProposal
        }
    });
});

// 2. 관리자가 모든 제안 목록 조회 (기존과 동일)
const getAllProposals = asyncHandler(async (req, res, next) => {
    let filter = {};
    if (req.query.status) {  // status에 대한 필터링링
        filter.status = req.query.status;
    }
    if (req.query.culturalSiteId) {  // 특정 문화유산에 대한 필터링
        filter.culturalSite = req.query.culturalSiteId;
    }
    if (req.query.proposalType) { // proposalType으로 필터링 추가
        filter.proposalType = req.query.proposalType;
    }

    const proposals = await Proposal.find(filter)
        .populate({ path: 'culturalSite', select: 'name category address' })
        .populate({ path: 'proposedBy', select: 'username email' })
        .populate({ path: 'processedBy', select: 'username email' })
        .sort('-createdAt');

    res.status(200).json({
        status: 'success',
        results: proposals.length,
        data: {
            proposals
        }
    });
});

// 3. 관리자가 특정 제안 상세 조회 (기존과 동일)
const getProposalById = asyncHandler(async (req, res, next) => {
    const proposal = await Proposal.findById(req.params.id)
        .populate({ path: 'culturalSite', select: 'name category address' })
        .populate({ path: 'proposedBy', select: 'username email' })
        .populate({ path: 'processedBy', select: 'username email' });

    if (!proposal) {
        return next(new AppError('해당 ID를 가진 제안이 없습니다.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            proposal
        }
    });
});


// 4. 관리자가 제안 승인
const approveProposal = asyncHandler(async (req, res, next) => {
    const proposal = await Proposal.findById(req.params.id)
        .populate('proposedBy'); // proposedBy 필드 populate

    if (!proposal) {
        return next(new AppError('해당 ID를 가진 제안이 없습니다.', 404));
    }

    if (proposal.status !== 'pending') {
        return next(new AppError('이 제안은 이미 처리되었습니다.', 400));
    }

    let culturalSite = null; // 승인 결과로 영향을 받는 culturalSite
    let message;

    const session = await mongoose.startSession();
    session.startTransaction(); // 트랜잭션 시작

    try {
        if (proposal.proposalType === 'create') {
            // 새로운 문화유산 등록 제안 승인
            // create 작업도 트랜잭션에 포함시키려면 { session } 옵션을 전달해야 합니다.
            culturalSite = await CulturalSite.create([{ // create는 배열을 기대할 수 있으므로 배열로 감싸고 세션 전달
                ...proposal.proposedChanges,
                registeredBy: req.user.id,
                proposedBy: proposal.proposedBy._id,
            }], { session }); // <-- { session } 옵션 추가
            message = '새로운 문화유산 등록 제안이 승인되었고 문화유산이 생성되었습니다.';
        } else if (proposal.proposalType === 'update') {
            // 기존 문화유산 수정 제안 승인
            if (!proposal.culturalSite) {
                await session.abortTransaction(); // 오류 발생 시 트랜잭션 롤백
                return next(new AppError('수정 제안인데 참조할 문화유산 ID가 없습니다.', 400));
            }
            culturalSite = await CulturalSite.findByIdAndUpdate(
                proposal.culturalSite,
                proposal.proposedChanges,
                { new: true, runValidators: true, session } // <-- { session } 옵션 추가
            );
            if (!culturalSite) {
                await session.abortTransaction(); // 오류 발생 시 트랜잭션 롤백
                return next(new AppError('제안된 문화유산을 찾을 수 없어 업데이트할 수 없습니다.', 404));
            }
            message = '제안이 승인되었고 문화유산 정보가 업데이트되었습니다.';
        } else if (proposal.proposalType === 'delete') {
            if (!proposal.culturalSite) {
                await session.abortTransaction(); // 오류 발생 시 트랜잭션 롤백
                return next(new AppError('삭제 제안인데 참조할 문화유산 ID가 없습니다.', 400));
            }

            // CulturalSite 삭제 (session 옵션 전달)
            culturalSite = await CulturalSite.findByIdAndDelete(proposal.culturalSite, { session }); // <-- { session } 옵션 추가

            if (!culturalSite) {
                await session.abortTransaction(); // 오류 발생 시 트랜잭션 롤백
                return next(new AppError('제안된 문화유산을 찾을 수 없어 삭제할 수 없습니다.', 404));
            }

            // ExcludeSourceId에 sourceId 추가 (session 옵션 전달)
            await addSourceIdToExclusion(culturalSite.sourceId, session); // <-- 세션 전달

            message = '제안이 승인되었고 문화유산이 성공적으로 삭제되었습니다.';
        } else {
            await session.abortTransaction(); // 알 수 없는 유형일 경우 롤백
            return next(new AppError('알 수 없는 제안 유형입니다.', 500));
        }

        // 제안 상태 업데이트 (이 작업도 트랜잭션의 일부로 포함)
        proposal.status = 'approved';
        proposal.processedAt = Date.now();
        proposal.processedBy = req.user.id;
        proposal.adminNotes = req.body.adminNotes || proposal.adminNotes;
        await proposal.save({ session }); // <-- { session } 옵션 추가

        // 모든 작업이 성공하면 트랜잭션 커밋
        await session.commitTransaction();

        res.status(200).json({
            status: 'success',
            message: message,
            data: {
                proposal,
                affectedCulturalSite: culturalSite // 생성되거나 업데이트/삭제된 문화유산 반환
            }
        });

    } catch (error) {
        // 트랜잭션 중 오류 발생 시 롤백
        await session.abortTransaction();
        console.error('Error during proposal approval transaction:', error);

        // 특정 오류 유형에 따른 응답
        if (error.name === 'ValidationError') {
            return next(new AppError(`유효성 검사 오류: ${error.message}`, 400));
        }
        // ExcludeSourceId.create()에서 발생할 수 있는 중복 키 오류 (unique: true 설정 시)
        if (error.code === 11000) {
            return next(new AppError('이미 제외 목록에 있는 ID입니다.', 409)); // 409 Conflict
        }

        return next(new AppError('제안 처리 중 오류가 발생했습니다.', 500));
    } finally {
        // 세션 종료 (오류 발생 여부와 관계없이 항상 호출)
        session.endSession();
    }
});

// 5. 관리자가 제안 거절 (기존과 동일)
const rejectProposal = asyncHandler(async (req, res, next) => {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
        return next(new AppError('해당 ID를 가진 제안이 없습니다.', 404));
    }

    if (proposal.status !== 'pending') {
        return next(new AppError('이 제안은 이미 처리되었습니다.', 400));
    }

    // 제안 상태 업데이트
    proposal.status = 'rejected';
    proposal.processedAt = Date.now();
    proposal.processedBy = req.user.id;
    proposal.adminNotes = req.body.adminNotes || '관리자에 의해 거절되었습니다.';
    await proposal.save();

    res.status(200).json({
        status: 'success',
        message: '제안이 거절되었습니다.',
        data: {
            proposal
        }
    });
});

// 6. 사용자가 제안한 제안 조회
const getProposalsByUserId = async (req, res) => {
    try {
        const { userId } = req.params; // Get userId from URL parameters

        // Validate if userId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid User ID format.' });
        }

        // 관리자이거나, 해당 사용자인 경우에만 조회 가능
        if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
            // MongoDB ObjectId를 문자열로 비교해야 합니다.
            return res.status(403).json({ message: 'You are not authorized to view these proposals.' });
        }

        const proposals = await Proposal.find({ proposedBy: userId })
            .populate('culturalSite', 'name description') // Optionally populate culturalSite details
            .populate('proposedBy', 'username email') // Optionally populate proposedBy user details
            .populate('proposedChanges'); // Include proposedChanges

        if (!proposals || proposals.length === 0) {
            return res.status(404).json({ message: 'No proposals found for this user.' });
        }

        res.status(200).json({
            message: 'Proposals fetched successfully.',
            count: proposals.length,
            proposals
        });
    } catch (error) {
        console.error('Error fetching proposals by user:', error);
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};


module.exports = {
    createProposal,
    getAllProposals,
    getProposalById,
    approveProposal,
    rejectProposal,
    getProposalsByUserId
};