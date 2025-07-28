import React from 'react';
import { 
  Users, 
  Ticket, 
  Settings, 
  BarChart3, 
  Database,
  Shield,
  MessageSquare,
  AlertTriangle,
  FileText,
  Home,
  LogOut
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
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

const adminItems = [
  { title: 'Dashboard', url: '/admin', icon: Home },
  { title: 'Gestione Utenti', url: '/admin/users', icon: Users },
  { title: 'Ticket di Supporto', url: '/admin/tickets', icon: Ticket },
  { title: 'Analytics', url: '/admin/analytics', icon: BarChart3 },
  { title: 'Database', url: '/admin/database', icon: Database },
  { title: 'Sicurezza', url: '/admin/security', icon: Shield },
  { title: 'Community', url: '/admin/community', icon: MessageSquare },
  { title: 'Alert Sistema', url: '/admin/alerts', icon: AlertTriangle },
  { title: 'Report', url: '/admin/reports', icon: FileText },
  { title: 'Configurazione', url: '/admin/settings', icon: Settings },
];

export function AdminAppSidebar() {
  const { state } = useSidebar();
  const { isAdmin } = useUserRole();
  const location = useLocation();
  
  const isCollapsed = state === 'collapsed';

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!isAdmin) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent>
        {/* Logo */}
        <div className={`flex items-center gap-3 p-4 border-b ${isCollapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">⚡</span>
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">PetVoice</p>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Amministrazione</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => 
                        `flex items-center px-3 py-2 rounded-lg ${
                          isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                        }`
                      }
                    >
                      <item.icon className={`h-4 w-4 ${isCollapsed ? "mx-auto" : "mr-3"}`} />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="hover:bg-red-100 hover:text-red-600">
                  <LogOut className={`h-4 w-4 ${isCollapsed ? "mx-auto" : "mr-3"}`} />
                  {!isCollapsed && <span>Logout</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}