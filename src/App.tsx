import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PetProvider } from "@/contexts/PetContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AppearanceProvider } from "@/contexts/AppearanceContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import PetsPage from "@/pages/PetsPage";
import AnalysisPage from "@/pages/AnalysisPage";
import DiaryPage from "@/pages/DiaryPage";
import CalendarPage from "@/pages/CalendarPage";
import WellnessPage from "@/pages/WellnessPage";
import AuthPage from "@/pages/AuthPage";

import StatsPage from "@/pages/StatsPage";
import CommunityPage from "@/pages/CommunityPage";
import SubscriptionPage from "@/pages/SubscriptionPage";
import SubscriptionSuccessPage from "@/pages/SubscriptionSuccessPage";
import ResetPassword from "@/pages/ResetPassword";
import AffiliationPage from "@/pages/AffiliationPage";
import SupportPage from "@/pages/SupportPage";

import SettingsPage from './pages/SettingsPage';
import TrainingPage from './pages/TrainingPage';
import NotFound from "./pages/NotFound";
import { NotificationEventsProvider } from './contexts/NotificationEventsContext';
import { NotificationManager } from '@/components/NotificationManager';

const queryClient = new QueryClient();

function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/pets" element={
          <ProtectedRoute>
            <Layout>
              <PetsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/analysis" element={
          <ProtectedRoute>
            <Layout>
              <AnalysisPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/diary" element={
          <ProtectedRoute>
            <Layout>
              <DiaryPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/calendar" element={
          <ProtectedRoute>
            <Layout>
              <CalendarPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/wellness" element={
          <ProtectedRoute>
            <Layout>
              <WellnessPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/training" element={
          <ProtectedRoute>
            <Layout>
              <TrainingPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/stats" element={
          <ProtectedRoute>
            <Layout>
              <StatsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/community" element={
          <ProtectedRoute>
            <Layout>
              <CommunityPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/subscription" element={
          <ProtectedRoute>
            <Layout>
              <SubscriptionPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/subscription-success" element={
          <ProtectedRoute>
            <Layout>
              <SubscriptionSuccessPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/affiliate" element={
          <ProtectedRoute>
            <Layout>
              <AffiliationPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/support" element={
          <ProtectedRoute>
            <SupportPage />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout>
              <SettingsPage />
            </Layout>
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
      <PetProvider>
        <ThemeProvider>
          <LanguageProvider>
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
          </LanguageProvider>
        </ThemeProvider>
      </PetProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
