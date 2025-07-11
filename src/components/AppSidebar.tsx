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
  Handshake, 
  GraduationCap, 
  HeadphonesIcon, 
  Settings 
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
  { title: 'Calendario', url: '/calendar', icon: Calendar },
  { title: 'Benessere', url: '/wellness', icon: Heart },
  { title: 'Statistiche', url: '/stats', icon: BarChart3 },
];

const communityItems = [
  { title: 'Community', url: '/community', icon: Users },
  { title: 'Abbonamenti', url: '/subscription', icon: CreditCard },
  { title: 'Affiliazione', url: '/affiliate', icon: Handshake },
];

const supportItems = [
  { title: 'Tutorial', url: '/tutorial', icon: GraduationCap },
  { title: 'Supporto', url: '/support', icon: HeadphonesIcon },
  { title: 'Impostazioni', url: '/settings', icon: Settings },
];

const AppSidebar: React.FC = () => {
  const { state } = useSidebar();
  const location = useLocation();
  
  const isCollapsed = state === 'collapsed';
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const getNavClassName = (path: string) => {
    return isActive(path) 
      ? "bg-coral/10 text-coral border-r-2 border-coral font-medium" 
      : "hover:bg-accent/50 text-muted-foreground hover:text-foreground";
  };

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="gap-0">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "hidden" : "block"}>
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
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Community & Business */}
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "hidden" : "block"}>
            Community & Business
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
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Support */}
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "hidden" : "block"}>
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
                      {!isCollapsed && <span>{item.title}</span>}
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