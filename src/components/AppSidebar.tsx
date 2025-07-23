import React from 'react';
import { Home, PawPrint, Microscope, Music, Brain, BookOpen, Calendar, Heart, BarChart3, Users, HeadphonesIcon, Settings } from 'lucide-react';
import { useLocation, NavLink } from 'react-router-dom';
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

// Navigation items
const navigationItems = [
  { title: 'Dashboard', url: '/', icon: Home },
  { title: 'I Miei Pet', url: '/pets', icon: PawPrint },
  { title: 'Analisi Emotiva', url: '/analysis', icon: Microscope },
  { title: 'Musicoterapia AI', url: '/ai-music-therapy', icon: Music },
  { title: 'Training AI', url: '/training', icon: Brain },
  { title: 'Diario', url: '/diary', icon: BookOpen },
  { title: 'Calendario', url: '/calendar', icon: Calendar },
  { title: 'Benessere', url: '/wellness', icon: Heart },
  { title: 'Statistiche', url: '/stats', icon: BarChart3 },
];

const communityItems = [
  { title: 'Community', url: '/community', icon: Users },
];

const supportItems = [
  { title: 'Supporto', url: '/support', icon: HeadphonesIcon },
  { title: 'Impostazioni', url: '/settings', icon: Settings },
];

const AppSidebar: React.FC = () => {
  const { state, openMobile, setOpenMobile, isMobile } = useSidebar();
  const location = useLocation();
  
  const isCollapsed = state === 'collapsed';

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

  const renderNavItems = (items: typeof navigationItems, label?: string) => (
    <SidebarGroup>
      {label && (
        <SidebarGroupLabel className={isCollapsed && !isMobile ? "hidden" : "block px-4 pb-2"}>
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive(item.url)}>
                <NavLink 
                  to={item.url} 
                  className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 group ${
                    isActive(item.url)
                      ? 'bg-primary/10 text-primary border-l-2 border-primary shadow-soft'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isCollapsed && !isMobile ? "mx-auto" : "mr-3"} transition-colors`} />
                  {(!isCollapsed || isMobile) && (
                    <span className="font-medium transition-colors">{item.title}</span>
                  )}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon" data-guide="sidebar">
      <SidebarContent className="gap-0">
        {/* Logo and Title */}
        <div className={`flex items-center gap-3 p-4 border-b border-border ${isCollapsed && !isMobile ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-lg gradient-azure flex items-center justify-center shadow-glow animate-gentle-float">
            <span className="text-white font-bold text-sm">🐾</span>
          </div>
          {(!isCollapsed || isMobile) && (
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                PetVoice
              </h1>
              <p className="text-xs text-muted-foreground">AI Pet Care</p>
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto py-4">
          {renderNavItems(navigationItems, "Navigazione Principale")}
          {renderNavItems(communityItems)}
          {renderNavItems(supportItems)}
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;