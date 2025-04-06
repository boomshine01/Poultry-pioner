
import React, { useState, useEffect } from 'react';
import {
  Home,
  Boxes,
  Users,
  LineChart,
  Settings,
  User,
  Menu,
  X,
  Wifi
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from '../lib/i18n';
import { useTheme } from "../components/theme-provider"
import { Switch } from "@/components/ui/switch"
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from "@/hooks/use-toast";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const Layout: React.FC<{ children: React.ReactNode, currentTab: string, onTabChange: (tab: string) => void }> = ({ children, currentTab, onTabChange }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  useEffect(() => {
    // Apply theme class when the component mounts or theme changes
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    toast({
      title: t('languageChanged'),
      description: newLanguage === 'fr' ? 'Langue changée en Français' : 'Language changed to English',
    });
  };

  const handleThemeChange = (checked: boolean) => {
    const newTheme = checked ? 'dark' : 'light';
    setTheme(newTheme);
    toast({
      title: t('themeChanged'),
      description: newTheme === 'dark' ? t('darkModeEnabled') : t('lightModeEnabled')
    });
  };

  // Updated navigation items with translations
  const navigationItems = [
    { id: 'dashboard', label: t('dashboard'), icon: <Home /> },
    { id: 'equipment', label: t('equipment'), icon: <Boxes /> },
    { id: 'batches', label: t('batches'), icon: <Users /> },
    { id: 'monitoring', label: t('monitoring'), icon: <LineChart /> },
    { id: 'esp-connection', label: t('esp'), icon: <Wifi /> },
    { id: 'settings', label: t('settings'), icon: <Settings /> },
    { id: 'profile', label: t('profile'), icon: <User /> },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 w-full bg-secondary z-50 p-4 flex items-center justify-between">
          <button onClick={toggleSidebar} className="text-foreground focus:outline-none">
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <span className="text-xl font-bold text-primary">Poultry Pioneer</span>
          <div></div>
        </div>
      )}

      {/* Sidebar */}
      {(isSidebarOpen || !isMobile) && (
        <div
          className={`fixed z-40 h-full ${isMobile ? 'w-72' : 'w-56'} bg-secondary border-r border-r-muted flex-shrink-0 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${!isMobile ? 'translate-x-0' : ''
            }`}
        >
          <div className="h-full flex flex-col py-4">
            {/* App Name */}
            <div className="px-6 mb-8 flex items-center justify-between">
              <span className="text-xl font-bold text-primary">Poultry Pioneer</span>
              {isMobile && (
                <button onClick={closeSidebar} className="text-foreground focus:outline-none">
                  <X className="h-6 w-6" />
                </button>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-grow px-2">
              {navigationItems.map((item) => (
                <Link
                  to={`/${item.id === 'dashboard' ? '' : item.id}`}
                  key={item.id}
                  className={`flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors duration-200 ${currentTab === item.id ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                    }`}
                  onClick={() => {
                    onTabChange(item.id);
                    if (isMobile) closeSidebar();
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* User Info and Settings */}
            <div className="p-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full text-left rounded-md">
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" alt={user?.email || "Profile"} />
                        <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "PP"}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col truncate">
                        <span className="text-sm font-medium text-foreground truncate">{user?.email || 'Unknown User'}</span>
                        <span className="text-xs text-muted-foreground truncate">{user?.role || 'Role'}</span>
                      </div>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t('myProfile')}</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => {
                    onTabChange('profile');
                    if (isMobile) closeSidebar();
                  }}
                  >
                    {t('profile')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>{t('preferences')}</DropdownMenuLabel>
                  <DropdownMenuItem className="flex items-center justify-between">
                    <span>{t('language')}</span>
                    <select
                      className="ml-2 p-1 bg-background border-none focus:ring-0"
                      value={language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                    </select>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center justify-between">
                    <span>{t('darkMode')}</span>
                    <Switch
                      checked={theme === "dark"}
                      onCheckedChange={handleThemeChange}
                    />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden">
        {/* Content Padding */}
        <main className={`relative ${isMobile ? 'pt-16 px-4' : 'pt-8 px-6'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
