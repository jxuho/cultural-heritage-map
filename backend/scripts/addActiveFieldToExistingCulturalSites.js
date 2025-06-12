require('dotenv').config();
const mongoose = require('mongoose');
const CulturalSite = require('../models/CulturalSite'); // CulturalSite 모델 가져오기

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('DB 연결 성공!'));

const addActiveField = async () => {
  try {
    console.log('기존 CulturalSite 문서에 active 필드 추가 시작...');

    // active 필드가 없거나 false인 모든 CulturalSite 문서에 active: true 설정
    const result = await CulturalSite.updateMany(
      { active: { $exists: false } }, // active 필드가 없는 문서
      { $set: { active: true } }
    );
    // OR: { $or: [{ active: { $exists: false } }, { active: false }] } // active 필드가 없거나 false인 경우

    console.log(`${result.matchedCount}개의 문서 중 ${result.modifiedCount}개의 문서가 업데이트되었습니다.`);

    console.log('active 필드 추가 완료.');
  } catch (err) {
    console.error('active 필드 추가 중 오류 발생:', err);
  } finally {
    mongoose.connection.close(); // 작업 완료 후 DB 연결 종료
  }
};

addActiveField();