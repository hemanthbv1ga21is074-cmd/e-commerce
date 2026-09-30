import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnnouncementStrip } from './AnnouncementStrip';
import { Header } from './Header';
import { Footer } from './Footer';
import { BottomTabBar } from './BottomTabBar';
import { MobileDrawer } from './MobileDrawer';
import { SearchOverlay } from './SearchOverlay';
import { DevPanel } from '../ui/DevPanel';
import { ToastContainer } from '../ui/ToastContainer';
import { CookieConsentBanner } from '../compliance/CookieConsentBanner';

export const Layout: React.FC = () => {
  const { pathname } = useLocation();

  // Scroll to top whenever route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-white text-primary">
      <AnnouncementStrip />
      <Header />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
      <BottomTabBar />
      <MobileDrawer />
      <SearchOverlay />
      <DevPanel />
      <ToastContainer />
      <CookieConsentBanner />
    </div>
  );
};
