require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const booleanPointInPolygon = require('@turf/boolean-point-in-polygon').default;
const { point, polygon, multiPolygon } = require('@turf/helpers');
const CulturalSite = require('../models/CulturalSite');

const migrateDistricts = async () => {
  try {
    // 1. DB 연결
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 2. 구역 GeoJSON 데이터 로드 (파일 경로는 본인의 환경에 맞게 수정하세요)
    const districtsPath = path.join(
      __dirname,
      '../data/berlin_district_boundary.geojson',
    );
    const districtsData = JSON.parse(fs.readFileSync(districtsPath, 'utf8'));

    // 3. 모든 사이트 가져오기
    const sites = await CulturalSite.find({});
    console.log(`🚀 Starting migration for ${sites.length} sites...`);

    // 💡 변경: Atlas로 한 번에 보낼 업데이트 작업들을 담을 배열
    const bulkOperations = [];

    for (const site of sites) {
      const [lon, lat] = site.location.coordinates;
      const pt = point([lon, lat]);
      let foundDistrict = 'Unknown';

      // 각 구역 폴리곤과 대조
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

      // 💡 변경: 개별 site.save() 대신 bulkOperations 배열에 updateOne 명령을 푸시합니다.
      bulkOperations.push({
        updateOne: {
          filter: { _id: site._id },
          update: {
            $set: {
              address: {
                fullAddress: oldAddress,
                street: site.address?.street || '',
                houseNumber: site.address?.houseNumber || '',
                postcode: site.address?.postcode || '',
                district: foundDistrict,
                city: 'berlin',
              }
            }
          }
        }
      });
    }

    // 💡 변경: 수집된 모든 업데이트 작업을 500개씩 묶어서 대량으로 처리합니다.
    console.log(`⏳ Sending updates to MongoDB Atlas in bulk...`);

    const chunkSize = 500;
    let processedCount = 0;

    for (let i = 0; i < bulkOperations.length; i += chunkSize) {
      const chunk = bulkOperations.slice(i, i + chunkSize);
      await CulturalSite.bulkWrite(chunk);
      processedCount += chunk.length;
      console.log(`⏳ Progress: ${processedCount}/${bulkOperations.length} sites updated in Atlas...`);
    }

    console.log(`\n✨ Migration Completed! ${bulkOperations.length} sites updated.`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

migrateDistricts();
