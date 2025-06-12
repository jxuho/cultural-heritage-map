// backend/config/swaggerDef.js

const swaggerDefinition = {
  openapi: '3.1.0', // OpenAPI Specification 버전
  info: {
    title: 'Cultural Site API', // API 문서 제목
    version: '1.0.0', // API 버전
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Local Developement' // API 기본 URL
    },
  ],
  components: { // <--- 이 'components' 객체가 반드시 필요합니다.
    securitySchemes: { // <--- 'securitySchemes' 객체도 필요합니다.
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    // schemas: {} // 스키마 정의가 필요 없다면 이 줄은 생략 가능합니다.
  },
  security: [ // 전역 보안 설정 (이것이 정의되어 있으면 components.securitySchemes를 찾습니다.)
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  // Swagger 주석이 있는 파일 경로. app.js 위치(backend/) 기준으로 상대 경로 지정.
  apis: [
    './routes/*.js',       // backend/routes/ 디렉토리의 모든 .js 파일
    './models/*.js',    // 스키마 정의가 모델 파일에 있다면 추가 
    './controllers/*.js', // 컨트롤러에 주석이 있다면 추가
  ],
};

module.exports = options;