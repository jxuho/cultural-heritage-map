const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        trim: true,
        maxlength: [20, '사용자 이름은 20자 이하로 입력해주세요.']
    },
    email: {
        type: String,
        required: [true, '이메일은 필수입니다.'],
        unique: true,
        lowercase: true,
    },
    googleId: {
        type: String,
        required: true,
        unique: true
    },
    profileImage: String,
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    favoriteSites: [{ // 즐겨찾기 문화 유적지
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CulturalSite'
    }],
    bio: {
        type: String,
        maxlength: [200, 'bio must be under 200 characters']
    },
}, {
    timestamps: true
});

userSchema.index({ 'currentLocation.coordinates': '2dsphere' }); // 지리 공간 인덱스 추가 (선택 사항)

const User = mongoose.model('User', userSchema);
module.exports = User;