// fn(req, res, next)가 반환하는 Promise를 처리하고, 
// .catch(next)를 통해 에러가 발생하면 next() 함수를 호출하여 에러를 미들웨어 체인으로 전달합니다. 
// Promise.resolve()로 감싸는 것은 fn이 Promise를 반환하지 않는 동기 함수일 때도 Promise로 변환하여 
// .catch()를 사용할 수 있도록 하는 안전장치입니다. 
// (하지만 일반적으로 컨트롤러 함수는 async 키워드로 인해 항상 Promise를 반환하므로 필수는 아닙니다.)

const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;