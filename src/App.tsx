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
import DashboardPage from "@/pages/DashboardPage";
import PetsPage from "@/pages/PetsPage";
import AnalysisPage from "@/pages/AnalysisPage";
import DiaryPage from "@/pages/DiaryPage";
import CalendarPage from "@/pages/CalendarPage";
import WellnessPage from "@/pages/WellnessPage";
import AIMusicTherapyPage from "@/pages/AIMusicTherapyPage";
import AuthPage from "@/pages/AuthPage";

import StatsPage from "@/pages/StatsPage";
import CommunityPage from "@/pages/CommunityPage";
import SubscriptionPage from "@/pages/SubscriptionPage";
import SubscriptionSuccessPage from "@/pages/SubscriptionSuccessPage";
import ResetPassword from "@/pages/ResetPassword";

import SupportPage from "@/pages/SupportPage";
import PetMatchingPage from "@/pages/PetMatchingPage";
import TrainingPage from "@/pages/TrainingPage";
import TrainingDashboard from "@/pages/TrainingDashboard";


import SettingsPage from './pages/SettingsPage';
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
            <PetProvider>
              <Layout>
                <DashboardPage />
              </Layout>
            </PetProvider>
          </ProtectedRoute>
        } />
        <Route path="/pets" element={
          <ProtectedRoute>
            <PetProvider>
              <Layout>
                <PetsPage />
              </Layout>
            </PetProvider>
          </ProtectedRoute>
        } />
        <Route path="/analysis" element={
          <ProtectedRoute>
            <PetProvider>
              <Layout>
                <AnalysisPage />
              </Layout>
            </PetProvider>
          </ProtectedRoute>
        } />
        <Route path="/diary" element={
          <ProtectedRoute>
            <PetProvider>
              <Layout>
                <DiaryPage />
              </Layout>
            </PetProvider>
          </ProtectedRoute>
        } />
        <Route path="/calendar" element={
          <ProtectedRoute>
            <PetProvider>
              <Layout>
                <CalendarPage />
              </Layout>
            </PetProvider>
          </ProtectedRoute>
        } />
        <Route path="/wellness" element={
          <ProtectedRoute>
            <PetProvider>
              <Layout>
                <WellnessPage />
              </Layout>
            </PetProvider>
          </ProtectedRoute>
        } />
        <Route path="/ai-music-therapy" element={
          <ProtectedRoute>
            <PetProvider>
              <Layout>
                <AIMusicTherapyPage />
              </Layout>
            </PetProvider>
          </ProtectedRoute>
        } />
        <Route path="/stats" element={
          <ProtectedRoute>
            <PetProvider>
              <Layout>
                <StatsPage />
              </Layout>
            </PetProvider>
          </ProtectedRoute>
        } />
        <Route path="/pet-matching" element={
          <ProtectedRoute>
            <PetProvider>
              <Layout>
                <PetMatchingPage />
              </Layout>
            </PetProvider>
          </ProtectedRoute>
        } />
        <Route path="/training" element={
          <ProtectedRoute>
            <PetProvider>
              <Layout>
                <TrainingPage />
              </Layout>
            </PetProvider>
          </ProtectedRoute>
        } />
        <Route path="/training/dashboard/:protocolId" element={
          <ProtectedRoute>
            <PetProvider>
              <Layout>
                <TrainingDashboard />
              </Layout>
            </PetProvider>
          </ProtectedRoute>
        } />
        <Route path="/community" element={
          <ProtectedRoute>
            <PetProvider>
              <Layout>
                <CommunityPage />
              </Layout>
            </PetProvider>
          </ProtectedRoute>
        } />
        <Route path="/subscription" element={
          <ProtectedRoute>
            <PetProvider>
              <Layout>
                <SubscriptionPage />
              </Layout>
            </PetProvider>
          </ProtectedRoute>
        } />
        <Route path="/subscription-success" element={
          <ProtectedRoute>
            <PetProvider>
              <Layout>
                <SubscriptionSuccessPage />
              </Layout>
            </PetProvider>
          </ProtectedRoute>
        } />
        <Route path="/support" element={
          <ProtectedRoute>
            <SupportPage />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <PetProvider>
              <Layout>
                <SettingsPage />
              </Layout>
            </PetProvider>
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
      <LanguageProvider>
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
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
