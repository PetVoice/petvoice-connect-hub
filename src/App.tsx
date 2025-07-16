import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PetProvider } from "@/contexts/PetContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import PetsPage from "@/pages/PetsPage";
import AnalysisPage from "@/pages/AnalysisPage";
import DiaryPage from "@/pages/DiaryPage";
import CalendarPage from "@/pages/CalendarPage";
import WellnessPage from "@/pages/WellnessPage";
import AuthPage from "@/pages/AuthPage";
import PlaceholderPage from "@/components/PlaceholderPage";
import StatsPage from "@/pages/StatsPage";
import CommunityPage from "@/pages/CommunityPage";
import SubscriptionPage from "@/pages/SubscriptionPage";
import SubscriptionSuccessPage from "@/pages/SubscriptionSuccessPage";
import ResetPassword from "@/pages/ResetPassword";
import TutorialPage from "@/pages/TutorialPage";
import AffiliationPage from "@/pages/AffiliationPage";
import SupportPage from "@/pages/SupportPage";
import { Microscope, BookOpen, Calendar, Heart, BarChart3, Users, CreditCard, Handshake, GraduationCap, HeadphonesIcon, Settings } from "lucide-react";
import SettingsPage from './pages/SettingsPage';
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PetProvider>
        <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
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
              <Route path="/tutorial" element={
                <ProtectedRoute>
                  <Layout>
                    <TutorialPage />
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
        </TooltipProvider>
        </ThemeProvider>
      </PetProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
