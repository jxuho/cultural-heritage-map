// scripts/migrateDistricts.js (또는 해당 파일 경로)

// require('dotenv').config(); // ⚠️ app.js에서 이미 로드하므로 제거 혹은 유지 가능
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const booleanPointInPolygon = require('@turf/boolean-point-in-polygon').default;
const { point, polygon, multiPolygon } = require('@turf/helpers');
const CulturalSite = require('../models/CulturalSite');

// 💡 변경: 호출 가능한 async 함수로 만들고 외부로 내보냅니다. Mongoose 연결/해제 로직은 제거합니다.
const migrateDistricts = async () => {
  try {
    // ⚠️ 내부의 mongoose.connect(...) 구문은 app.js와 중복되므로 과감히 제거합니다!

    const districtsPath = path.join(
      __dirname,
      '../data/berlin_district_boundary.geojson',
    );

    if (!fs.existsSync(districtsPath)) {
      console.log(
        '⚠️ 구역 경계 GeoJSON 파일이 없어 마이그레이션을 건너뜁니다.',
      );
      return;
    }

    const districtsData = JSON.parse(fs.readFileSync(districtsPath, 'utf8'));
    const sites = await CulturalSite.find({});

    // 만약 이미 마이그레이션이 되어 있는 상태라면 굳이 돌릴 필요가 없으므로 체크 로직 추가 (선택)
    if (
      sites.length > 0 &&
      sites[0].address?.district &&
      sites[0].address.district !== 'Unknown'
    ) {
      console.log('✅ 이미 구역 마이그레이션이 완료되어 있습니다. 패스합니다.');
      return;
    }

    console.log(`🚀 Starting district migration for ${sites.length} sites...`);
    const bulkOperations = [];

    for (const site of sites) {
      const [lon, lat] = site.location.coordinates;
      const pt = point([lon, lat]);
      let foundDistrict = 'Unknown';

      for (const feature of districtsData.features) {
        try {
          let poly;
          if (feature.geometry.type === 'Polygon') {
            poly = polygon(feature.geometry.coordinates);
          } else if (feature.geometry.type === 'MultiPolygon') {
            poly = multiPolygon(feature.geometry.coordinates);
          }

          if (poly && booleanPointInPolygon(pt, poly)) {
            foundDistrict = feature.properties.name;
            break;
          }
        } catch (err) {
          continue;
        }
      }

      const oldAddress =
        typeof site.address === 'string'
          ? site.address
          : site.address?.fullAddress || '';

      bulkOperations.push({
        updateOne: {
          filter: { _id: site._id },
          update: {
            $set: {
              'address.fullAddress': oldAddress,
              'address.street': site.address?.street || '',
              'address.houseNumber': site.address?.houseNumber || '',
              'address.postcode': site.address?.postcode || '',
              'address.district': foundDistrict,
              'address.city': 'berlin',
            },
          },
        },
      });
    }

    if (bulkOperations.length === 0) return;

    console.log(`⏳ Sending updates to MongoDB in bulk...`);
    const chunkSize = 500;
    let processedCount = 0;

    for (let i = 0; i < bulkOperations.length; i += chunkSize) {
      const chunk = bulkOperations.slice(i, i + chunkSize);
      await CulturalSite.bulkWrite(chunk);
      processedCount += chunk.length;
      console.log(
        `⏳ Progress: ${processedCount}/${bulkOperations.length} sites updated...`,
      );
    }

    console.log(
      `\n✨ District Migration Completed! ${bulkOperations.length} sites updated.`,
    );
  } catch (error) {
    console.error('❌ District Migration failed:', error);
  }
  // ⚠️ 기존에 있던 mongoose.connection.close() 및 process.exit(0)는 제거합니다.
};

// 💡 스크립트 직접 실행도 지원하도록 분기 처리 유지
if (require.main === module) {
  require('dotenv').config();
  mongoose.connect(process.env.MONGO_URI).then(async () => {
    await migrateDistricts();
    await mongoose.connection.close();
    process.exit(0);
  });
}

module.exports = migrateDistricts; // 👈 함수 내보내기
