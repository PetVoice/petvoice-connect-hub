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
import LandingPage from "@/pages/LandingPage";
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
        <Route path="/" element={<LandingPage />} />
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
        <Route path="/wellness" element={
          <ProtectedRoute>
            <AppLayout>
              <WellnessPage />
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
        <Route path="/stats" element={
          <ProtectedRoute>
            <AppLayout>
              <StatsPage />
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
