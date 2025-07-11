import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import PetsPage from "@/pages/PetsPage";
import AuthPage from "@/pages/AuthPage";
import PlaceholderPage from "@/components/PlaceholderPage";
import ResetPassword from "@/pages/ResetPassword";
import { Microscope, BookOpen, Calendar, Heart, BarChart3, Users, CreditCard, Handshake, GraduationCap, HeadphonesIcon, Settings } from "lucide-react";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
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
                    <PlaceholderPage
                      title="Analisi Emotiva"
                      description="Analizza le emozioni del tuo pet"
                      icon={<Microscope className="h-6 w-6 text-white" />}
                      features={["Upload audio/video", "Analisi in tempo reale", "Report dettagliati", "Storico analisi"]}
                    />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/diary" element={
                <ProtectedRoute>
                  <Layout>
                    <PlaceholderPage
                      title="Diario"
                      description="Tieni traccia delle attività quotidiane"
                      icon={<BookOpen className="h-6 w-6 text-white" />}
                      features={["Voci giornaliere", "Foto e video", "Note comportamentali", "Mood tracking"]}
                    />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/calendar" element={
                <ProtectedRoute>
                  <Layout>
                    <PlaceholderPage
                      title="Calendario"
                      description="Programma e monitora le attività"
                      icon={<Calendar className="h-6 w-6 text-white" />}
                      features={["Pianificazione eventi", "Reminder", "Visite veterinarie", "Attività ricorrenti"]}
                    />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/wellness" element={
                <ProtectedRoute>
                  <Layout>
                    <PlaceholderPage
                      title="Benessere"
                      description="Monitora la salute emotiva del tuo pet"
                      icon={<Heart className="h-6 w-6 text-white" />}
                      features={["Score benessere", "Trend emotivi", "Raccomandazioni", "Alert salute"]}
                    />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/stats" element={
                <ProtectedRoute>
                  <Layout>
                    <PlaceholderPage
                      title="Statistiche"
                      description="Analizza i progressi nel tempo"
                      icon={<BarChart3 className="h-6 w-6 text-white" />}
                      features={["Grafici dettagliati", "Confronti temporali", "Export dati", "Report PDF"]}
                    />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/community" element={
                <ProtectedRoute>
                  <Layout>
                    <PlaceholderPage
                      title="Community"
                      description="Connettiti con altri proprietari"
                      icon={<Users className="h-6 w-6 text-white" />}
                      features={["Forum discussioni", "Gruppi locali", "Condivisione esperienze", "Consigli esperti"]}
                    />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/subscription" element={
                <ProtectedRoute>
                  <Layout>
                    <PlaceholderPage
                      title="Abbonamenti"
                      description="Gestisci il tuo piano"
                      icon={<CreditCard className="h-6 w-6 text-white" />}
                      features={["Piani premium", "Funzionalità avanzate", "Supporto prioritario", "Analisi illimitate"]}
                    />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/affiliate" element={
                <ProtectedRoute>
                  <Layout>
                    <PlaceholderPage
                      title="Affiliazione"
                      description="Guadagna con il programma affiliati" 
                      icon={<Handshake className="h-6 w-6 text-white" />}
                      features={["Link affiliazione", "Commissioni", "Statistiche guadagni", "Materiali promozionali"]}
                    />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/tutorial" element={
                <ProtectedRoute>
                  <Layout>
                    <PlaceholderPage
                      title="Tutorial"
                      description="Impara ad usare PetVoice"
                      icon={<GraduationCap className="h-6 w-6 text-white" />}
                      features={["Video guide", "Documentazione", "FAQ", "Best practices"]}
                    />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/support" element={
                <ProtectedRoute>
                  <Layout>
                    <PlaceholderPage
                      title="Supporto"
                      description="Ottieni aiuto quando ne hai bisogno"
                      icon={<HeadphonesIcon className="h-6 w-6 text-white" />}
                      features={["Chat live", "Ticket support", "Knowledge base", "Contatti diretti"]}
                    />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Layout>
                    <PlaceholderPage
                      title="Impostazioni"
                      description="Personalizza la tua esperienza"
                      icon={<Settings className="h-6 w-6 text-white" />}
                      features={["Profilo utente", "Preferenze", "Notifiche", "Privacy"]}
                    />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
