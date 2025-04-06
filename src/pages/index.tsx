
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Dashboard from '../components/Dashboard';
import Equipment from '../components/Equipment';
import Batches from '../components/Batches';
import Monitoring from '../components/Monitoring';
import Settings from '../components/Settings';
import UserProfile from '../components/UserProfile';
import { useLanguage, detectBrowserLanguage } from '../lib/i18n';
import { useAuth } from '../lib/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { setLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Set active tab based on path
    const path = location.pathname.substring(1); // Remove leading '/'
    if (path) {
      // Only set if path exists and is not empty
      setActiveTab(path === '' ? 'dashboard' : path);
    } else {
      setActiveTab('dashboard');
    }
    
    // Detect browser language on initial load
    const detectedLang = detectBrowserLanguage();
    setLanguage(detectedLang);
    
    // Add padding to body on mobile for bottom nav
    const checkForMobile = () => {
      if (window.innerWidth < 768) {
        document.body.style.paddingBottom = '70px'; // Increased height for mobile tab bar
      } else {
        document.body.style.paddingBottom = '0';
      }
    };
    
    checkForMobile();
    window.addEventListener('resize', checkForMobile);
    
    return () => {
      window.removeEventListener('resize', checkForMobile);
    };
  }, [setLanguage, location.pathname]);

  // When tab changes from layout, update the URL
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/${tab === 'dashboard' ? '' : tab}`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'equipment':
        return <Equipment />;
      case 'batches':
        return <Batches />;
      case 'monitoring':
        return <Monitoring />;
      case 'settings':
        return <Settings />;
      case 'profile':
        return <UserProfile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout 
      currentTab={activeTab} 
      onTabChange={handleTabChange}
    >
      {activeTab === 'profile' ? (
        // No left padding for profile page regardless of mobile or desktop
        <div className="w-full">
          {renderContent()}
        </div>
      ) : (
        // Other content has padding on desktop only, no padding on mobile
        <div className={isMobile ? "w-full" : "pl-0 md:pl-56"}>
          {renderContent()}
        </div>
      )}
    </Layout>
  );
};

export default Index;
