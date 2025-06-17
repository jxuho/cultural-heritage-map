import MapComponent from "../components/MapComponent.jsx";
import SidePanel from "../components/SidePanel/SidePanel.jsx";
import FilterPanel from "../components/FilterPanel.jsx";
import MapContextMenu from "../components/MapContextMenu.jsx";


const HomePage = () => {
  return (
    <>
      {/* MapComponent에 페칭된 culturalSites 데이터 전달 */}
      <MapComponent />
      <div className="absolute top-4 left-4 z-20">
        <FilterPanel />
      </div>
      <SidePanel />
      <MapContextMenu/>
    </>
  );
};

export default HomePage;

