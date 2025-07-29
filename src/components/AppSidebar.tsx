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
import { useUnreadCounts } from '@/hooks/useUnreadCounts';

// Complete navigation items array with uniform spacing
const menuItems = [
  { title: 'Dashboard', url: '/', icon: Home },
  { title: 'I Miei Pet', url: '/pets', icon: PawPrint },
  { title: 'Analisi Emotiva', url: '/analysis', icon: Microscope },
  { title: 'Musicoterapia AI', url: '/ai-music-therapy', icon: Music },
  { title: 'Training AI', url: '/training', icon: Brain },
  { title: 'Diario', url: '/diary', icon: BookOpen },
  { title: 'Calendario', url: '/calendar', icon: Calendar },
  { title: 'Community', url: '/community', icon: Users },
  { title: 'Supporto', url: '/support', icon: HeadphonesIcon },
  { title: 'Impostazioni', url: '/settings', icon: Settings },
];

const AppSidebar: React.FC = () => {
  const { state, openMobile, setOpenMobile, isMobile } = useSidebar();
  const location = useLocation();
  const { unreadCounts } = useUnreadCounts();
  
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

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon" data-guide="sidebar">
      <SidebarContent className="gap-0">
        {/* Logo and Title */}
        <div className={`flex items-center gap-3 p-4 border-b border-border ${isCollapsed && !isMobile ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-lg bg-sky-light flex items-center justify-center shadow-glow animate-gentle-float">
            <span className="text-white font-bold text-sm">🐾</span>
          </div>
          {(!isCollapsed || isMobile) && (
            <div>
              <h1 className="text-lg font-bold text-foreground">
                PetVoice
              </h1>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => {
                  const hasUnreadBadge = 
                    (item.url === '/community' && unreadCounts.privateMessages > 0) ||
                    (item.url === '/support' && unreadCounts.supportTickets > 0);
                  
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive(item.url)}>
                        <NavLink 
                          to={item.url} 
                          className={`flex items-center px-3 py-2 rounded-lg group relative ${
                            isActive(item.url)
                              ? 'bg-primary/10 text-primary border-l-2 border-primary shadow-glow transform scale-[1.02] !important'
                              : 'text-muted-foreground hover:text-foreground hover:bg-primary/5 hover:shadow-glow hover:scale-[1.02] transition-all duration-200'
                          }`}
                          style={isActive(item.url) ? {
                            backgroundColor: 'hsl(var(--primary) / 0.1)',
                            color: 'hsl(var(--primary))',
                            boxShadow: 'var(--shadow-glow)',
                            transform: 'scale(1.02)',
                            borderLeft: '2px solid hsl(var(--primary))'
                          } : {}}
                        >
                          <div className="flex items-center relative">
                            <item.icon className={`h-5 w-5 ${isCollapsed && !isMobile ? "mx-auto" : "mr-3"} transition-colors`} />
                            {hasUnreadBadge && (
                              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                            )}
                          </div>
                          {(!isCollapsed || isMobile) && (
                            <span className="font-medium transition-colors">{item.title}</span>
                          )}
                          {hasUnreadBadge && (!isCollapsed || isMobile) && (
                            <div className="ml-auto">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            </div>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;