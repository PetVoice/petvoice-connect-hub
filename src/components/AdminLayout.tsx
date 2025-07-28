import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { AdminAppSidebar } from '@/components/AdminAppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';

export const AdminLayout: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();

  // Mostra loading mentre verifica auth e ruoli
  if (authLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se non autenticato, redirect al login
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Se autenticato ma non admin, redirect alla dashboard normale
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Se è admin, mostra l'interfaccia di amministrazione
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminAppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-card flex items-center px-4">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-foreground">Amministrazione PetVoice</h1>
              <div className="ml-auto flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Admin: {user.email}</span>
              </div>
            </div>
          </header>
          
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};