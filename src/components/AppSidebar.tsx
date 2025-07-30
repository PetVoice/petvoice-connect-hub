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

// Complete navigation items array with uniform spacing
const menuItems = [
  { title: 'Dashboard', url: '/', icon: Home },
  { title: 'I Miei Pet', url: '/pets', icon: PawPrint },
  { title: 'Analisi Emotiva', url: '/analysis', icon: Microscope },
  { title: 'Musicoterapia AI', url: '/ai-music-therapy', icon: Music },
  { title: 'Training AI', url: '/training', icon: Brain },
  { title: 'Machine Learning', url: '/machine-learning', icon: BarChart3 },
  { title: 'Diario', url: '/diary', icon: BookOpen },
  { title: 'Calendario', url: '/calendar', icon: Calendar },
  { title: 'Community', url: '/community', icon: Users },
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

  return (
    <Sidebar 
      className={`
        ${isCollapsed && !isMobile ? "w-16" : "w-64"} 
        ${isMobile ? "w-64" : ""}
      `} 
      collapsible="icon" 
      data-guide="sidebar"
    >
      <SidebarContent className="gap-0">
        {/* Logo and Title */}
        <div className={`flex items-center gap-3 ${
          isMobile ? 'p-3' : 'p-4'
        } border-b border-border ${isCollapsed && !isMobile ? "justify-center" : ""}`}>
          <div className={`${
            isMobile ? 'w-7 h-7' : 'w-8 h-8'
          } rounded-lg bg-sky-light flex items-center justify-center shadow-glow animate-gentle-float`}>
            <span className={`text-white font-bold ${
              isMobile ? 'text-xs' : 'text-sm'
            }`}>🐾</span>
          </div>
          {(!isCollapsed || isMobile) && (
            <div>
              <h1 className={`font-bold text-foreground ${
                isMobile ? 'text-base' : 'text-lg'
              }`}>
                PetVoice
              </h1>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <div className={`flex-1 overflow-y-auto ${isMobile ? 'py-2' : 'py-4'}`}>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink 
                        to={item.url} 
                        className={`flex items-center rounded-lg group relative transition-all duration-200 ${
                          isMobile ? 'px-2 py-2 mx-1' : 'px-3 py-2'
                        } ${
                          isActive(item.url)
                            ? 'bg-primary/10 text-primary border-l-2 border-primary shadow-glow transform scale-[1.02]'
                            : 'text-muted-foreground hover:text-foreground hover:bg-primary/5 hover:shadow-glow hover:scale-[1.02]'
                        }`}
                        style={isActive(item.url) ? {
                          backgroundColor: 'hsl(var(--primary) / 0.1)',
                          color: 'hsl(var(--primary))',
                          boxShadow: 'var(--shadow-glow)',
                          transform: 'scale(1.02)',
                          borderLeft: '2px solid hsl(var(--primary))'
                        } : {}}
                      >
                        <item.icon className={`${
                          isMobile ? 'h-4 w-4' : 'h-5 w-5'
                        } ${isCollapsed && !isMobile ? "mx-auto" : isMobile ? "mr-2" : "mr-3"} transition-colors`} />
                        {(!isCollapsed || isMobile) && (
                          <span className={`font-medium transition-colors ${
                            isMobile ? 'text-sm' : 'text-base'
                          }`}>{item.title}</span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;