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
import DashboardPage from "@/pages/DashboardPage";
import PetsPage from "@/pages/PetsPage";
import AnalysisPage from "@/pages/AnalysisPage";
import DiaryPage from "@/pages/DiaryPage";
import CalendarPage from "@/pages/CalendarPage";

import AIMusicTherapyPage from "@/pages/AIMusicTherapyPage";
import MachineLearningPage from "@/pages/MachineLearningPage";
import AuthPage from "@/pages/AuthPage";

import CommunityPage from "@/pages/CommunityPage";
import SubscriptionPage from "@/pages/SubscriptionPage";
import SubscriptionSuccessPage from "@/pages/SubscriptionSuccessPage";
import ResetPassword from "@/pages/ResetPassword";
import { Index } from "./pages/Index";

import SupportPage from "@/pages/SupportPage";
import PetMatchingPage from "@/pages/PetMatchingPage";
import TrainingPage from "@/pages/TrainingPage";
import TrainingDashboard from "@/pages/TrainingDashboard";

// Admin Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminTickets } from "./pages/admin/AdminTickets";

import SettingsPage from './pages/SettingsPage';
import NotFound from "./pages/NotFound";
import { NotificationEventsProvider } from './contexts/NotificationEventsContext';
import { NotificationManager } from '@/components/NotificationManager';
import { AdaptiveIntelligenceProvider } from '@/contexts/AdaptiveIntelligenceContext';

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
        <Route path="/machine-learning" element={
          <ProtectedRoute>
            <AppLayout>
              <MachineLearningPage />
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