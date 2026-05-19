import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import {
  FaThList,
  FaMapMarkedAlt,
  FaBookmark,
  FaUserCircle,
  FaUserCog,
  FaArrowRight,
} from 'react-icons/fa';
import { Menu, X } from 'lucide-react';
import useAuthStore from '../store/authStore';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, logout, isAuthenticated } = useAuthStore();

  const navItems = [
    { label: 'Map Explorer', path: '/', icon: <FaMapMarkedAlt /> },
    { label: 'The Archives', path: '/list', icon: <FaThList /> },
  ];

  const handleProfileClick = (e: React.MouseEvent) => {
    if (window.innerWidth < 768) {
      e.preventDefault();
      setIsMobileMenuOpen(false);
      navigate('/my-account');
    }
  };

  return (
    <header className="sticky top-0 z-100 w-full shrink-0 bg-white/90 backdrop-blur-md border-b border-black font-sans selection:bg-black selection:text-white">
      {/* Bauhaus Accent Bar: Subtle Identity Lines */}
      <div className="h-0.5 w-full flex bg-transparent">
        <div className="h-full w-1/3 bg-black/20" />
        <div className="h-full w-1/3 bg-red-600/20" />
        <div className="h-full w-1/3 bg-amber-500/20" />
      </div>

      {/* [UX Improvement] 헤더 높이를 h-20에서 h-24(96px)로 확장하여 3단 스택 로고의 위아래 음성 공간 확보 */}
      <div className="container mx-auto h-24 flex items-center justify-between px-6 md:px-8 relative">
        {/* [Left] Mobile Menu Toggle (Sharp Rectangular Border) */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-black p-2.5 border border-black hover:bg-black hover:text-white transition-colors duration-200"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* [Left] Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative group flex items-center gap-2 py-2 transition-colors duration-300 ${
                  isActive
                    ? 'text-black font-black'
                    : 'text-gray-400 hover:text-black font-medium'
                }`}
              >
                <span className="text-[11px] uppercase tracking-[0.25em]">
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* [Center] Brand Identity: Stacked Option 3 (Micro-adjusted for h-24) */}
        <Link
          to="/"
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center group whitespace-nowrap"
        >
          <div className="flex flex-col items-center text-center leading-[1.1]">
            <span className="text-xl md:text-2xl font-black tracking-[0.14em] text-black uppercase mr-[-0.14em]">
              BERLIN
            </span>
            <span className="text-[15px] md:text-[17px] font-black tracking-[0.24em] text-black uppercase mt-0.5 mr-[-0.24em]">
              HERITAGE
            </span>
            <span className="text-[6.5px] md:text-[7.5px] tracking-[0.38em] font-medium text-black/40 uppercase mt-1.5 mr-[-0.38em] border-t border-black/10 pt-1 w-full block">
              Digital Collection
            </span>
          </div>
        </Link>

        {/* [Right] User Interaction Area */}
        <div className="flex items-center">
          {isAuthenticated ? (
            <div className="relative group">
              {/* Profile Button: Completely Square Sharp Border */}
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-3 p-1 border border-transparent hover:border-black transition-all duration-200 cursor-pointer outline-none"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.2em] leading-none mb-1">
                    {user?.role || 'Explorer'}
                  </p>
                  <p className="text-[11px] font-black text-black uppercase tracking-tight">
                    {user?.username}
                  </p>
                </div>

                {/* Sharp Squared Container for Avatar */}
                <div className="w-9 h-9 md:w-10 md:h-10 border border-black p-0.5 bg-white group-hover:bg-black transition-colors duration-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-none">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                      alt="profile"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-black group-hover:text-white transition-colors bg-white group-hover:bg-black">
                      <FaUserCircle size={18} />
                    </div>
                  )}
                </div>
              </button>

              {/* Desktop Dropdown: Pure Art Gallery Grid Style */}
              <div className="absolute right-0 mt-2 w-60 bg-white border border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] py-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 hidden md:block">
                <div className="px-5 pb-3 border-b border-black/10 mb-2">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.25em] mb-1">
                    Archive Access
                  </p>
                  <p className="text-[12px] font-medium text-black truncate font-mono">
                    {user?.email}
                  </p>
                </div>

                <MenuLink
                  onClick={() => navigate('/dashboard')}
                  icon={<FaBookmark />}
                  label="Dashboard"
                />
                <MenuLink
                  onClick={() => navigate('/my-account')}
                  icon={<FaUserCog />}
                  label="Preferences"
                />

                <div className="mt-4 px-4">
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 bg-black text-white hover:bg-gray-900 transition-colors duration-200 group/btn border border-black"
                  >
                    <span className="text-[10px] uppercase font-extrabold tracking-[0.2em]">
                      Sign Out
                    </span>
                    <FaArrowRight
                      size={10}
                      className="group-hover/btn:translate-x-1.5 transition-transform duration-200"
                    />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Sign In Link: Pure Typography with Underline Accent */
            <button
              onClick={() => navigate('/sign-in')}
              className="flex items-center gap-2 group text-black transition-all"
            >
              <span className="hidden sm:inline text-[11px] font-extrabold uppercase tracking-[0.25em] border-b-2 border-black pb-0.5 hover:bg-black hover:text-white hover:px-1 transition-all duration-200">
                Sign-In / Sign-Up
              </span>
              <FaArrowRight
                size={11}
                className="group-hover:translate-x-1.5 transition-transform duration-200"
              />
            </button>
          )}
        </div>
      </div>

      {/* [Mobile] Navigation Overlay: Adjusted top to match h-24 [96px + 2px accent line = top-[98px]] */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-24.5 left-0 w-full bg-white border-b-2 border-black shadow-[0_10px_0px_0px_rgba(0,0,0,0.05)] animate-in slide-in-from-top duration-200">
          <div className="flex flex-col divide-y divide-black/10">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-4 px-8 py-5 text-black hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <span className="text-black/40">{item.icon}</span>
                <span className="text-[11px] font-extrabold uppercase tracking-[0.25em]">
                  {item.label}
                </span>
              </Link>
            ))}
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-4 px-8 py-5 text-black hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <FaBookmark className="text-black/40" />
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.25em]">
                    Dashboard
                  </span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="flex items-center gap-4 px-8 py-5 bg-black text-white font-extrabold uppercase text-[11px] tracking-[0.25em] text-left transition-colors hover:bg-gray-900"
                >
                  <FaArrowRight size={11} className="rotate-180" />
                  Sign Out of Archive
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

const MenuLink = ({
  onClick,
  icon,
  label,
}: {
  onClick: () => void;
  icon: any;
  label: string;
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-4 px-5 py-3 hover:bg-black hover:text-white transition-all text-black group/item text-left"
  >
    <span className="text-xs opacity-40 group-hover/item:opacity-100 transition-opacity">
      {icon}
    </span>
    <span className="text-[11px] uppercase tracking-[0.2em] font-extrabold">
      {label}
    </span>
  </button>
);

export default Header;
