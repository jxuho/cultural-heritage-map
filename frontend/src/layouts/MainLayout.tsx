import { Outlet, useLocation } from 'react-router';
import Footer from '../components/Footer';
import Header from '../components/Header';
import AccountManager from '../components/AccountManager/AccountManager';

const MainLayout = () => {
  const { pathname } = useLocation();
  const isMapPage = pathname === '/';

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <AccountManager />
      {isMapPage ? (
        <main className="flex-1 min-h-0 relative overflow-hidden">
          <Outlet />
        </main>
      ) : (
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <Outlet />
          <Footer />
        </main>
      )}
    </div>
  );
};

export default MainLayout;
