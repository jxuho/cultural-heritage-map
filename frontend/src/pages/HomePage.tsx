import { lazy, Suspense, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';

import SidePanel from '../components/SidePanel/SidePanel.jsx';
import FilterPanel from '../components/Filter/FilterPanel.jsx';
import MapContextMenu from '../components/Map/MapContextMenu.jsx';
import LoadingSpinner from '../components/LoadingSpinner';
import LandingPage from './LandingPage';

const MapComponent = lazy(() => import('../components/Map/MapComponent.jsx'));
import { useAllCulturalSites } from '../hooks/data/useCulturalSitesQueries';

const HomePage = () => {
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hasVisited = sessionStorage.getItem('berlin_portal_visited');
    if (hasVisited === 'true') {
      setShowMap(true);
    }
    setIsCheckingSession(false);
  }, []);

  const isPreFetchTarget = !isCheckingSession && !showMap;
  useAllCulturalSites(isPreFetchTarget);

  const handleExploreMap = () => {
    sessionStorage.setItem('berlin_portal_visited', 'true');
    setShowMap(true);
  };

  if (isCheckingSession) {
    return <div className="w-full h-full bg-white" />;
  }

  return (
    <div className="relative w-full h-full bg-white overflow-hidden">
      <AnimatePresence mode="wait">
        {!showMap ? (
          <motion.div
            key="landing"
            initial={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: '-100vh',
              transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            }}
            className="w-full h-full overflow-y-auto"
          >
            <LandingPage
              onExploreMap={handleExploreMap}
              onSignIn={() => navigate('/sign-in')}
            />
          </motion.div>
        ) : (
          <motion.div
            key="map-interface"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full h-full relative overflow-hidden"
          >
            <Suspense
              fallback={
                <div className="h-full w-full flex flex-col items-center justify-center bg-white font-mono text-xs uppercase tracking-widest text-black">
                  <LoadingSpinner />
                  <p className="mt-4">Initializing Geospatial Map Engine...</p>
                </div>
              }
            >
              <MapComponent />
            </Suspense>

            <div className="absolute top-4 left-4 z-20">
              <FilterPanel />
            </div>
            <SidePanel />
            <MapContextMenu />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;
