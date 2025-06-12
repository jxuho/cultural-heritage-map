// geojson을 mongodb로 import하는 코드.
// reverse-geocoding을 통해 address를 가지고온다.

require('dotenv').config();
const fsAsync = require('fs/promises');
const path = require('path');
const mongoose = require('mongoose');
const CulturalSite = require('../models/CulturalSite'); // CulturalSite 모델 경로
const { processOsmElementForCulturalSite } = require('../utils/osmDataProcessor');


/**
 * turbo가 아닌, osm api에서 받아온 정보(elements)를 mongodb에 저장하는 함수.
 * /backend/data 내부의 최신 chemnitz_cultural_sites_[시간].geojson을 가지고온다.
 */
const importGeojson = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');
        const dataPath = await getLatestCulturalSitesFile();
        if (!dataPath) {
            console.error('No valid GeoJSON file found.');
            return;
        }
        const raw = await fsAsync.readFile(dataPath, 'utf8');
        const geojson = JSON.parse(raw);


        const culturalSitesToInsert = [];

        // overpass-turbo
        if (geojson.features) {
            for (const feature of geojson.features) {
                const properties = feature.properties;
                const geometry = feature.geometry;
                const osmElementLike = {
                    type: properties['@type'] || 'unknown',
                    id: properties['@id'] || feature.id,
                    geometry: {
                        type: geometry.type,
                        coordinates: geometry.coordinates // [lon, lat]
                    },
                    tags: properties
                };

                // 필수 필드 확인 (processOsmElementForCulturalSite 내부에서 처리되므로, 여기서는 간략화)
                if (!osmElementLike.id || !osmElementLike.geometry || !osmElementLike.geometry.coordinates) {
                    console.warn('Skipping feature due to missing sourceId or geometry:', JSON.stringify(feature)); // [cite: 82, 93]
                    continue;
                }
                try {
                    // processOsmElementForCulturalSite를 사용하여 데이터 가공
                    const culturalSiteData = await processOsmElementForCulturalSite(osmElementLike);
                    culturalSitesToInsert.push(culturalSiteData);
                } catch (error) {
                    console.warn(`Error processing GeoJSON element ${osmElementLike.id}: ${error.message}`);
                    // 유효하지 않은 요소는 건너뛰고 다음 요소로 진행
                }
            }
        } else {
            // Overpass API
            for (const element of geojson.elements) {
                // 필수 필드 확인 (processOsmElementForCulturalSite 내부에서 처리되므로, 여기서는 간략화)
                if (!element.type || !element.id) {
                    console.warn('Skipping element due to missing sourceId or geometry:', JSON.stringify(element));
                    continue;
                }
                try {
                    // processOsmElementForCulturalSite를 사용하여 데이터 가공
                    const culturalSiteData = await processOsmElementForCulturalSite(element);
                    culturalSitesToInsert.push(culturalSiteData);
                } catch (error) {
                    console.warn(`Error processing GeoJSON element ${element.id}: ${error.message}`);
                    // 유효하지 않은 요소는 건너뛰고 다음 요소로 진행
                }
            }
        }

        // 기존 데이터 삭제 (옵션, 개발 시 유용)
        await CulturalSite.deleteMany({});
        console.log('Existing CulturalSites deleted.');

        // 새 데이터 삽입
        const result = await CulturalSite.insertMany(culturalSitesToInsert, { ordered: false }); // ordered: false로 오류 발생 시에도 나머지 데이터 삽입 시도
        console.log(`Successfully inserted ${result.length} CulturalSites.`);

    } catch (error) {
        console.error('Error importing data:', error);
        if (error.writeErrors) {
            console.error('Write Errors:', error.writeErrors.map(e => e.errmsg));
        }
    } finally {
        mongoose.disconnect();
        console.log('MongoDB Disconnected.');
    }
};

async function getLatestCulturalSitesFile() {
    const dataDir = path.join(__dirname, '../data');
    // Updated pattern to only match 13-digit TIMESTAMPs
    const fileNamePattern = /^chemnitz_cultural_sites_(\d{13})\.(geo)?json$/;

    try {
        const files = await fsAsync.readdir(dataDir); // Read all files in the data directory
        let latestFile = null;
        let latestTimestamp = 0; // Initialize with 0 to find the largest timestamp

        for (const file of files) {
            const match = file.match(fileNamePattern);
            if (match) {
                const timestampPart = parseInt(match[1], 10); // Parse the 13-digit timestamp
                if (timestampPart > latestTimestamp) {
                    latestTimestamp = timestampPart;
                    latestFile = file;
                }
            }
        }

        if (latestFile) {
            const latestFilePath = path.join(dataDir, latestFile);
            console.log(`Found the latest cultural sites file: ${latestFilePath}`);
            return latestFilePath;
        } else {
            console.warn('No recent "chemnitz_cultural_sites_TIMESTAMP.json" files found in the data directory.');
            return null; // Return null if no matching file is found
        }
    } catch (error) {
        console.error('Error while searching for the latest cultural sites file:', error);
        throw error; // Re-throw the error for upstream handling
    }
}


importGeojson();