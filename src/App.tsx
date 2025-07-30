import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppearanceProvider } from "@/contexts/AppearanceContext";
import { NotificationEventsProvider } from './contexts/NotificationEventsContext';
import { NotificationManager } from '@/components/NotificationManager';

import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import { AdminLayout } from "@/components/AdminLayout";
import { LazyWrapper } from "@/components/ui/lazy-wrapper";
import { useLazyComponent } from "@/hooks/useLazyComponent";

// Non-lazy imports (always needed)
import AuthPage from "@/pages/AuthPage";
import ResetPassword from "@/pages/ResetPassword";
import { Index } from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy page imports
const DashboardPage = () => {
  const { Component, hasError, isLoading, retry, canRetry } = useLazyComponent(
    () => import("@/pages/DashboardPage"),
    { delay: 0, preload: true }
  );
  return (
    <LazyWrapper
      Component={Component}
      hasError={hasError}
      isLoading={isLoading}
      onRetry={retry}
      canRetry={canRetry}
      fallbackType="skeleton"
      skeletonVariant="card"
    />
  );
};

const PetsPage = () => {
  const { Component, hasError, isLoading, retry, canRetry } = useLazyComponent(
    () => import("@/pages/PetsPage")
  );
  return (
    <LazyWrapper
      Component={Component}
      hasError={hasError}
      isLoading={isLoading}
      onRetry={retry}
      canRetry={canRetry}
      fallbackType="skeleton"
      skeletonVariant="list"
    />
  );
};

const AnalysisPage = () => {
  const { Component, hasError, isLoading, retry, canRetry } = useLazyComponent(
    () => import("@/pages/AnalysisPage")
  );
  return (
    <LazyWrapper
      Component={Component}
      hasError={hasError}
      isLoading={isLoading}
      onRetry={retry}
      canRetry={canRetry}
      fallbackType="skeleton"
      skeletonVariant="card"
    />
  );
};

const DiaryPage = () => {
  const { Component, hasError, isLoading, retry, canRetry } = useLazyComponent(
    () => import("@/pages/DiaryPage")
  );
  return (
    <LazyWrapper
      Component={Component}
      hasError={hasError}
      isLoading={isLoading}
      onRetry={retry}
      canRetry={canRetry}
      fallbackType="skeleton"
      skeletonVariant="card"
    />
  );
};

const CalendarPage = () => {
  const { Component, hasError, isLoading, retry, canRetry } = useLazyComponent(
    () => import("@/pages/CalendarPage")
  );
  return (
    <LazyWrapper
      Component={Component}
      hasError={hasError}
      isLoading={isLoading}
      onRetry={retry}
      canRetry={canRetry}
      fallbackType="skeleton"
      skeletonVariant="card"
    />
  );
};

const CommunityPage = () => {
  const { Component, hasError, isLoading, retry, canRetry } = useLazyComponent(
    () => import("@/pages/CommunityPage")
  );
  return (
    <LazyWrapper
      Component={Component}
      hasError={hasError}
      isLoading={isLoading}
      onRetry={retry}
      canRetry={canRetry}
      fallbackType="skeleton"
      skeletonVariant="list"
    />
  );
};

const SettingsPage = () => {
  const { Component, hasError, isLoading, retry, canRetry } = useLazyComponent(
    () => import("@/pages/SettingsPage")
  );
  return (
    <LazyWrapper
      Component={Component}
      hasError={hasError}
      isLoading={isLoading}
      onRetry={retry}
      canRetry={canRetry}
      fallbackType="skeleton"
      skeletonVariant="card"
    />
  );
};

const TrainingPage = () => {
  const { Component, hasError, isLoading, retry, canRetry } = useLazyComponent(
    () => import("@/pages/TrainingPage")
  );
  return (
    <LazyWrapper
      Component={Component}
      hasError={hasError}
      isLoading={isLoading}
      onRetry={retry}
      canRetry={canRetry}
      fallbackType="skeleton"
      skeletonVariant="card"
    />
  );
};

const TrainingDashboard = () => {
  const { Component, hasError, isLoading, retry, canRetry } = useLazyComponent(
    () => import("@/pages/TrainingDashboard")
  );
  return (
    <LazyWrapper
      Component={Component}
      hasError={hasError}
      isLoading={isLoading}
      onRetry={retry}
      canRetry={canRetry}
      fallbackType="skeleton"
      skeletonVariant="card"
    />
  );
};

const SupportPage = () => {
  const { Component, hasError, isLoading, retry, canRetry } = useLazyComponent(
    () => import("@/pages/SupportPage")
  );
  return (
    <LazyWrapper
      Component={Component}
      hasError={hasError}
      isLoading={isLoading}
      onRetry={retry}
      canRetry={canRetry}
      fallbackType="skeleton"
      skeletonVariant="list"
    />
  );
};

const PetMatchingPage = () => {
  const { Component, hasError, isLoading, retry, canRetry } = useLazyComponent(
    () => import("@/pages/PetMatchingPage")
  );
  return (
    <LazyWrapper
      Component={Component}
      hasError={hasError}
      isLoading={isLoading}
      onRetry={retry}
      canRetry={canRetry}
      fallbackType="skeleton"
      skeletonVariant="card"
    />
  );
};

const AIMusicTherapyPage = () => {
  const { Component, hasError, isLoading, retry, canRetry } = useLazyComponent(
    () => import("@/pages/AIMusicTherapyPage")
  );
  return (
    <LazyWrapper
      Component={Component}
      hasError={hasError}
      isLoading={isLoading}
      onRetry={retry}
      canRetry={canRetry}
      fallbackType="skeleton"
      skeletonVariant="card"
    />
  );
};

const SubscriptionPage = () => {
  const { Component, hasError, isLoading, retry, canRetry } = useLazyComponent(
    () => import("@/pages/SubscriptionPage")
  );
  return (
    <LazyWrapper
      Component={Component}
      hasError={hasError}
      isLoading={isLoading}
      onRetry={retry}
      canRetry={canRetry}
      fallbackType="skeleton"
      skeletonVariant="card"
    />
  );
};

const SubscriptionSuccessPage = () => {
  const { Component, hasError, isLoading, retry, canRetry } = useLazyComponent(
    () => import("@/pages/SubscriptionSuccessPage")
  );
  return (
    <LazyWrapper
      Component={Component}
      hasError={hasError}
      isLoading={isLoading}
      onRetry={retry}
      canRetry={canRetry}
      fallbackType="skeleton"
      skeletonVariant="card"
    />
  );
};

// Admin pages
const AdminDashboard = () => {
  const { Component, hasError, isLoading, retry, canRetry } = useLazyComponent(
    () => import("./pages/admin/AdminDashboard").then(module => ({ default: module.AdminDashboard }))
  );
  return (
    <LazyWrapper
      Component={Component}
      hasError={hasError}
      isLoading={isLoading}
      onRetry={retry}
      canRetry={canRetry}
      fallbackType="skeleton"
      skeletonVariant="card"
    />
  );
};

const AdminTickets = () => {
  const { Component, hasError, isLoading, retry, canRetry } = useLazyComponent(
    () => import("./pages/admin/AdminTickets").then(module => ({ default: module.AdminTickets }))
  );
  return (
    <LazyWrapper
      Component={Component}
      hasError={hasError}
      isLoading={isLoading}
      onRetry={retry}
      canRetry={canRetry}
      fallbackType="skeleton"
      skeletonVariant="list"
    />
  );
};

const queryClient = new QueryClient();

function AppContent() {
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
          <Route index element={<AdminDashboard />} />
          <Route path="tickets" element={<AdminTickets />} />
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
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/pets" element={
          <ProtectedRoute>
            <AppLayout>
              <PetsPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/analysis" element={
          <ProtectedRoute>
            <AppLayout>
              <AnalysisPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/diary" element={
          <ProtectedRoute>
            <AppLayout>
              <DiaryPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/calendar" element={
          <ProtectedRoute>
            <AppLayout>
              <CalendarPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/ai-music-therapy" element={
          <ProtectedRoute>
            <AppLayout>
              <AIMusicTherapyPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/pet-matching" element={
          <ProtectedRoute>
            <AppLayout>
              <PetMatchingPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/training" element={
          <ProtectedRoute>
            <AppLayout>
              <TrainingPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/training/dashboard/:protocolId" element={
          <ProtectedRoute>
            <AppLayout>
              <TrainingDashboard />
            </AppLayout>
          </ProtectedRoute>
        } />
        {/* Legacy route for backward compatibility */}
        <Route path="/training-dashboard/:protocolId" element={
          <ProtectedRoute>
            <AppLayout>
              <TrainingDashboard />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/community" element={
          <ProtectedRoute>
            <AppLayout>
              <CommunityPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/subscription" element={
          <ProtectedRoute>
            <AppLayout>
              <SubscriptionPage />
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
              <SupportPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <AppLayout>
              <SettingsPage />
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