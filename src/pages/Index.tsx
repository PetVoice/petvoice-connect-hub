import React, { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

export const Index: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();

  // Memoizza lo stato di loading complessivo
  const isLoading = useMemo(() => {
    return authLoading || (user && roleLoading);
  }, [authLoading, user, roleLoading]);

  // Memoizza la destinazione del redirect
  const redirectTo = useMemo(() => {
    if (isLoading) return null;
    
    if (user) {
      return isAdmin ? '/admin' : '/dashboard';
    }
    
    return '/auth';
  }, [user, isAdmin, isLoading]);

  // Loading con delay minimo per evitare flash
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground animate-pulse">
            Caricamento...
          </p>
        </div>
      </div>
    );
  }

  // Redirect senza flash
  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return null;
};