import { useEffect, useState, useRef } from "react"; // useRef 추가
import { MapContainer, TileLayer, Marker, ZoomControl } from "react-leaflet"; // Popup 제거, useMapEvent 추가
import "leaflet/dist/leaflet.css"; // Leaflet 기본 CSS
import axios from "axios"; // API 호출 라이브러리

// Leaflet 마커 아이콘 깨짐 방지
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import shadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: shadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34], // 팝업은 사용 안 하지만, 기본값 유지를 위해
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// 전역 스토어 임포트
import useSidePanelStore from "../store/sidePanelStore";

function MapComponent() {
  const [culturalSites, setCulturalSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null); // 지도 인스턴스 참조

  // Zustand 스토어에서 사이드 패널 열기 액션을 가져옵니다.
  const openSidePanel = useSidePanelStore((state) => state.openSidePanel);

  // 컴포넌트 마운트 시 API에서 데이터 가져오기
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        // 백엔드 API 엔드포인트에 맞게 URL 수정
        const response = await axios.get(
          "http://localhost:5000/api/v1/cultural-sites"
        );
        const culturalSitesArray = response.data.data.culturalSites;
        setCulturalSites(culturalSitesArray);
      } catch (err) {
        setError(
          "Failed to fetch locations. Please check your backend server."
        );
        console.error("Error fetching locations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  // 로딩 및 에러 메시지
  if (loading && culturalSites.length === 0)
    return (
      <div className="flex justify-center items-center h-full text-lg">
        Loading map data...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-full text-lg text-red-500">
        Error: {error}
      </div>
    );

  // 지도의 초기 중심 좌표 (예: Chemnitz)
  const initialPosition = [50.8303, 12.91895]; // Lat, Lng

  return (
    <div className="h-full w-full">
      <MapContainer
        center={initialPosition}
        zoom={14}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
        }} // 맵 인스턴스 저장
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {culturalSites.map((culturalSite) => (
          <Marker
            key={culturalSite._id}
            position={[
              culturalSite.location.coordinates[1], // 위도 (latitude)
              culturalSite.location.coordinates[0], // 경도 (longitude)
            ]}
            eventHandlers={{
              click: () => openSidePanel(culturalSite),
            }}
          ></Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapComponent;
