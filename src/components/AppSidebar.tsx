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

// Navigation items
const navigationItems = [
  { title: 'Dashboard', url: '/', icon: Home },
  { title: 'I Miei Pet', url: '/pets', icon: PawPrint },
  { title: 'Analisi Emotiva', url: '/analysis', icon: Microscope },
  { title: 'Diario', url: '/diary', icon: BookOpen },
  { title: 'AI Music Therapy', url: '/ai-music-therapy', icon: Music },
  { title: 'AI Training', url: '/training', icon: Brain },
  { title: 'Calendario', url: '/calendar', icon: Calendar },
  { title: 'Benessere', url: '/wellness', icon: Heart },
  { title: 'Statistiche', url: '/stats', icon: BarChart3 },
];

const communityItems = [
  { title: 'Community', url: '/community', icon: Users },
  { title: 'Abbonamenti', url: '/subscription', icon: CreditCard },
];

const supportItems = [
  { title: 'Supporto', url: '/support', icon: HeadphonesIcon },
  { title: 'Impostazioni', url: '/settings', icon: Settings },
];

const AppSidebar: React.FC = () => {
  const { state, open, setOpen, openMobile, setOpenMobile, isMobile } = useSidebar();
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

  const getNavClassName = (path: string) => {
    return isActive(path) 
      ? "bg-azure/20 text-azure border-r-2 border-azure font-medium shadow-glow" 
      : "hover:bg-azure/10 text-muted-foreground hover:text-foreground hover:shadow-glow transition-all duration-300";
  };

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="gap-0">
        {/* Logo and Title */}
        <div className={`flex items-center gap-3 p-4 border-b border-border ${isCollapsed && !isMobile ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-lg gradient-azure flex items-center justify-center shadow-glow">
            <span className="text-white font-bold text-sm">🐾</span>
          </div>
          {(!isCollapsed || isMobile) && (
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-azure to-azure-dark bg-clip-text text-transparent">
                PetVoice
              </h1>
              <p className="text-xs text-muted-foreground">
                Dashboard
              </p>
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed && !isMobile ? "hidden" : "block"}>
            Navigazione Principale
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
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

        {/* Community & Business */}
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed && !isMobile ? "hidden" : "block"}>
            Community
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Support */}
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed && !isMobile ? "hidden" : "block"}>
            Supporto
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
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