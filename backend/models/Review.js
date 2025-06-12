const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    culturalSite: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CulturalSite', // CulturalSite 모델을 참조합니다.
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // User 모델을 참조합니다.
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment: {
        type: String,
        trim: true,
        maxlength: 500
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    active: { // 소프트 삭제용 필드
        type: Boolean,
        default: true, 
        select: false
    }
});

// 한 사용자가 한 문화 유적지에 대해 하나의 리뷰만 남길 수 있도록 고유 인덱스 설정
reviewSchema.index({ user: 1, culturalSite: 1 }, { unique: true });



module.exports = mongoose.model('Review', reviewSchema);