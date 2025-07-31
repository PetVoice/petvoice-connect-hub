import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

export const Index: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();

  // Mostra loading mentre verifica auth e ruoli
  if (authLoading || (user && roleLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se utente autenticato, controlla se è admin
  if (user) {
    // Se è admin, redirect al pannello admin
    if (isAdmin) {
      return <Navigate to="/admin" replace />;
    }
    // Se è utente normale, redirect alla dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // Se non autenticato, redirect al login
  return <Navigate to="/auth" replace />;
};