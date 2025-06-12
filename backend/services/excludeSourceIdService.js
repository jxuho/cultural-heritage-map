// backend/services/excludeSourceIdService.js
/**
 * mongodb의 excludeSourceIds 컬렉션에 sourceId를 추가하거나, 제거한다.
 * session을 인자로 전달받아서, transaction에서 해당 작업이 수행되어야 하는 경우를 고려한다.
 * 현재는 deleteCulturalSiteById, approveProposal의 delete옵션에서 사용됨
 * 
 */
const ExcludeSourceId = require('../models/ExcludeSourceId');

/**
 * 특정 sourceId를 제외 목록에 추가합니다.
 * @param {string} sourceId - 제외할 sourceId (예: "node/12345")
 * @param {object} [session] - Mongoose session object for transactions (선택 사항)
 */
const addSourceIdToExclusion = async (sourceId, session = null) => {
  try {
    const options = session ? { session } : {}; // 세션이 전달되면 옵션에 추가

    // findOne도 세션 옵션을 받도록 수정
    const existingEntry = await ExcludeSourceId.findOne({ sourceId: sourceId }, null, options);
    if (!existingEntry) {
      // create는 배열을 기대할 수 있으므로, 배열 형태로 전달하고 옵션 적용
      await ExcludeSourceId.create([{ sourceId: sourceId }], options);
      console.log(`[ExcludeService] SourceId '${sourceId}' successfully added to exclusion list.`);
      return true;
    } else {
      console.log(`[ExcludeService] SourceId '${sourceId}' already exists in exclusion list.`);
      return false;
    }
  } catch (error) {
    // MongoDB E11000은 고유성 제약 조건 위반 오류 (duplicate key error)입니다.
    if (error.code === 11000) {
        console.warn(`[ExcludeService] Attempted to add duplicate sourceId '${sourceId}'.`);
        // 트랜잭션 내부에서 unique 에러가 발생하면, 트랜잭션은 자동으로 실패하므로
        // 여기서는 throw하여 상위 catch 블록에서 처리하도록 합니다.
    }
    console.error(`[ExcludeService] Error adding sourceId '${sourceId}' to exclusion list:`, error);
    throw error; // 오류를 다시 던져 호출자가 처리할 수 있도록 함
  }
};

const removeSourceIdFromExclusion = async (sourceId, session = null) => { // remove도 세션 옵션 추가
  try {
    const options = session ? { session } : {};
    const result = await ExcludeSourceId.deleteOne({ sourceId: sourceId }, options);
    if (result.deletedCount > 0) {
      console.log(`[ExcludeService] SourceId '${sourceId}' successfully removed from exclusion list.`);
      return true;
    } else {
      console.log(`[ExcludeService] SourceId '${sourceId}' not found in exclusion list.`);
      return false;
    }
  } catch (error) {
    console.error(`[ExcludeService] Error removing sourceId '${sourceId}' from exclusion list:`, error);
    throw error;
  }
};

module.exports = {
  addSourceIdToExclusion,
  removeSourceIdFromExclusion,
};