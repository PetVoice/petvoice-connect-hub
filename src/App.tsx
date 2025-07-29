import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

import { AppearanceProvider } from "@/contexts/AppearanceContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import { AdminLayout } from "@/components/AdminLayout";

// Critical pages (loaded immediately)
import AuthPage from "@/pages/AuthPage";
import ResetPassword from "@/pages/ResetPassword";
import { Index } from "./pages/Index";
import SubscriptionSuccessPage from "@/pages/SubscriptionSuccessPage";
import NotFound from "./pages/NotFound";
import { NotificationEventsProvider } from './contexts/NotificationEventsContext';
import { NotificationManager } from '@/components/NotificationManager';

// Lazy-loaded components with fallbacks
import {
  LazyDashboardPage,
  LazyAnalysisPage,
  LazyCalendarPage,
  LazyCommunityPage,
  LazyDiaryPage,
  LazyPetsPage,
  LazySettingsPage,
  LazyTrainingDashboard,
  LazyTutorialPage,
  LazySubscriptionPage,
  LazySupportPage,
  LazyPetMatchingPage,
  LazyAIMusicTherapyPage,
  LazyTrainingPage,
  LazyAdminDashboard,
  LazyAdminTickets,
  preloadCriticalComponents,
} from '@/components/ui/lazy-component';

import { DashboardSkeleton, PageSkeleton, ListSkeleton } from '@/components/ui/page-skeleton';

const queryClient = new QueryClient();

function AppContent() {
  // Preload critical components on app start
  React.useEffect(() => {
    preloadCriticalComponents();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Root Route - handles redirect based on user role */}
        <Route path="/" element={<Index />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route 
            index 
            element={
              <React.Suspense fallback={<DashboardSkeleton />}>
                <LazyAdminDashboard />
              </React.Suspense>
            } 
          />
          <Route 
            path="tickets" 
            element={
              <React.Suspense fallback={<ListSkeleton />}>
                <LazyAdminTickets />
              </React.Suspense>
            } 
          />
          <Route path="users" element={<div className="p-6">Gestione Utenti - Coming Soon</div>} />
          <Route path="analytics" element={<div className="p-6">Analytics - Coming Soon</div>} />
          <Route path="database" element={<div className="p-6">Database - Coming Soon</div>} />
          <Route path="security" element={<div className="p-6">Sicurezza - Coming Soon</div>} />
          <Route path="community" element={<div className="p-6">Community Admin - Coming Soon</div>} />
          <Route path="alerts" element={<div className="p-6">Alert Sistema - Coming Soon</div>} />
          <Route path="reports" element={<div className="p-6">Report - Coming Soon</div>} />
          <Route path="settings" element={<div className="p-6">Configurazione - Coming Soon</div>} />
        </Route>
        
        {/* User Routes - wrapped in ProtectedRoute and AppLayout */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppLayout>
              <React.Suspense fallback={<DashboardSkeleton />}>
                <LazyDashboardPage />
              </React.Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/pets" element={
          <ProtectedRoute>
            <AppLayout>
              <React.Suspense fallback={<ListSkeleton />}>
                <LazyPetsPage />
              </React.Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/analysis" element={
          <ProtectedRoute>
            <AppLayout>
              <React.Suspense fallback={<PageSkeleton />}>
                <LazyAnalysisPage />
              </React.Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/diary" element={
          <ProtectedRoute>
            <AppLayout>
              <React.Suspense fallback={<PageSkeleton />}>
                <LazyDiaryPage />
              </React.Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/calendar" element={
          <ProtectedRoute>
            <AppLayout>
              <React.Suspense fallback={<PageSkeleton />}>
                <LazyCalendarPage />
              </React.Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/ai-music-therapy" element={
          <ProtectedRoute>
            <AppLayout>
              <React.Suspense fallback={<PageSkeleton />}>
                <LazyAIMusicTherapyPage />
              </React.Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/pet-matching" element={
          <ProtectedRoute>
            <AppLayout>
              <React.Suspense fallback={<PageSkeleton />}>
                <LazyPetMatchingPage />
              </React.Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/training" element={
          <ProtectedRoute>
            <AppLayout>
              <React.Suspense fallback={<PageSkeleton />}>
                <LazyTrainingPage />
              </React.Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/training/dashboard/:protocolId" element={
          <ProtectedRoute>
            <AppLayout>
              <React.Suspense fallback={<DashboardSkeleton />}>
                <LazyTrainingDashboard />
              </React.Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        {/* Legacy route for backward compatibility */}
        <Route path="/training-dashboard/:protocolId" element={
          <ProtectedRoute>
            <AppLayout>
              <React.Suspense fallback={<DashboardSkeleton />}>
                <LazyTrainingDashboard />
              </React.Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/community" element={
          <ProtectedRoute>
            <AppLayout>
              <React.Suspense fallback={<ListSkeleton />}>
                <LazyCommunityPage />
              </React.Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/subscription" element={
          <ProtectedRoute>
            <AppLayout>
              <React.Suspense fallback={<PageSkeleton />}>
                <LazySubscriptionPage />
              </React.Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/subscription-success" element={
          <ProtectedRoute>
            <AppLayout>
              <SubscriptionSuccessPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/support" element={
          <ProtectedRoute>
            <AppLayout>
              <React.Suspense fallback={<ListSkeleton />}>
                <LazySupportPage />
              </React.Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <AppLayout>
              <React.Suspense fallback={<PageSkeleton />}>
                <LazySettingsPage />
              </React.Suspense>
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <AppearanceProvider>
          <NotificationEventsProvider>
            <TooltipProvider>
              <NotificationManager />
              <AppContent />
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </NotificationEventsProvider>
        </AppearanceProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;