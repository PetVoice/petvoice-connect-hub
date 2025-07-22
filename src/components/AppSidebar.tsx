import React from 'react';
import { 
  Home, 
  PawPrint, 
  Microscope, 
  BookOpen, 
  Calendar, 
  Heart, 
  BarChart3, 
  Users, 
  CreditCard, 
  HeadphonesIcon, 
  Settings,
  Network,
  Brain,
  Music
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useTranslation } from '@/hooks/useTranslation';

// Navigation items
const getNavigationItems = (t: any) => [
  { title: t('navigation.dashboard'), url: '/', icon: Home },
  { title: t('navigation.pets'), url: '/pets', icon: PawPrint },
  { title: t('navigation.analysis'), url: '/analysis', icon: Microscope },
  { title: t('navigation.aiMusicTherapy'), url: '/ai-music-therapy', icon: Music },
  { title: t('navigation.aiTraining'), url: '/training', icon: Brain },
  { title: t('navigation.diary'), url: '/diary', icon: BookOpen },
  { title: t('navigation.calendar'), url: '/calendar', icon: Calendar },
  { title: t('navigation.wellness'), url: '/wellness', icon: Heart },
  { title: t('navigation.stats'), url: '/stats', icon: BarChart3 },
];

const getCommunityItems = (t: any) => [
  { title: t('navigation.community'), url: '/community', icon: Users },
];

const getSupportItems = (t: any) => [
  { title: t('navigation.support'), url: '/support', icon: HeadphonesIcon },
  { title: t('common.settings'), url: '/settings', icon: Settings },
];

const AppSidebar: React.FC = () => {
  const { state, open, setOpen, openMobile, setOpenMobile, isMobile } = useSidebar();
  const location = useLocation();
  const { t } = useTranslation();
  
  const isCollapsed = state === 'collapsed';
  
  const navigationItems = getNavigationItems(t);
  const communityItems = getCommunityItems(t);
  const supportItems = getSupportItems(t);

  // Auto-hide sidebar on navigation for mobile
  React.useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [location.pathname, setOpenMobile, isMobile]);
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const getNavClassName = (path: string) => {
    return isActive(path) 
      ? "bg-azure/20 text-azure border-r-2 border-azure font-medium shadow-glow" 
      : "hover:bg-azure/10 text-muted-foreground hover:text-foreground hover:shadow-glow transition-all duration-300";
  };

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon" data-guide="sidebar">
      <SidebarContent className="gap-0">
        {/* Logo and Title */}
        <div className={`flex items-center gap-3 p-4 border-b border-border ${isCollapsed && !isMobile ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-lg gradient-azure flex items-center justify-center shadow-glow animate-gentle-float">
            <span className="text-white font-bold text-sm">🐾</span>
          </div>
          {(!isCollapsed || isMobile) && (
            <div className="animate-fade-in">
              <h1 className="text-lg font-bold text-primary">
                PetVoice
              </h1>
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup data-guide="main-navigation">
          <SidebarGroupLabel className={isCollapsed && !isMobile ? "hidden" : "block px-4 pb-2"}>
            {t('navigation.mainNavigation')}
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => {
                // Add data-guide attributes for tutorial
                const getDataGuide = (url: string) => {
                  switch (url) {
                    case '/': return 'dashboard-menu';
                    case '/pets': return 'pets-menu';
                    case '/analysis': return 'ai-analysis-menu';
                    case '/ai-music-therapy': return 'music-therapy-menu';
                    case '/training': return 'training-menu';
                    case '/diary': return 'diary-menu';
                    default: return undefined;
                  }
                };

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={`${getNavClassName(item.url)} transition-smooth flex items-center gap-3 p-3 rounded-lg`}
                        data-guide={getDataGuide(item.url)}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {(!isCollapsed || isMobile) && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              
              {/* Community items */}
              {communityItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={`${getNavClassName(item.url)} transition-smooth flex items-center gap-3 p-3 rounded-lg`}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {(!isCollapsed || isMobile) && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Support items */}
              {supportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={`${getNavClassName(item.url)} transition-smooth flex items-center gap-3 p-3 rounded-lg`}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {(!isCollapsed || isMobile) && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;