/**
 * OSM에 query를 적용해서 geojson파일을 가지고온다.
 */
const fs = require('fs');
const path = require('path');

const {baseCulturalSiteQuery} = require('../config/osmData')
const { queryOverpass } = require('../services/overpassService');

async function fetchAndSaveCulturalSites() {
    console.log('Overpass API에서 Chemnitz 문화유산 데이터 가져오기 시작...');
    const OVERPASS_QUERY = baseCulturalSiteQuery();
    try {
        const osmData = await queryOverpass(OVERPASS_QUERY);
        const fileName = `chemnitz_cultural_sites_${Date.now()}.json`;
        const filePath = path.join(__dirname, '../data', fileName); // 'data' 폴더에 저장

        // 'data' 폴더가 없으면 생성
        const dataDir = path.join(__dirname, '../data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        fs.writeFile(filePath, JSON.stringify(osmData, null, 2), (err) => {
            if (err) {
                console.error('파일 저장 중 오류 발생:', err);
            } else {
                console.log(`✨ OSM 데이터가 ${filePath}에 성공적으로 저장되었습니다.`);
                console.log(`총 ${osmData.elements ? osmData.elements.length : 0}개의 문화유산을 가져왔습니다.`);
            }
        });

    } catch (error) {
        console.error('❌ Overpass API 호출 중 오류 발생:', error.message);
        if (error.response) {
            console.error('응답 상태 코드:', error.response.status);
            console.error('응답 데이터:', error.response.data);
        }
    }
}

// 함수 실행
fetchAndSaveCulturalSites();