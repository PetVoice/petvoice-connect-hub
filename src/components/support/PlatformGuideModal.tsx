import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Calendar, 
  BookOpen, 
  Activity, 
  Users, 
  Brain, 
  Settings, 
  MessageCircle, 
  Camera, 
  Heart, 
  Clock, 
  Map, 
  CreditCard,
  PlusCircle,
  Search,
  Filter,
  Edit,
  Share,
  Bell,
  Shield,
  Zap,
  BarChart3,
  Music,
  Gamepad2,
  FileText,
  Video,
  Mic,
  Eye,
  ChevronRight,
  MessageSquare,
  Upload,
  Sparkles
} from 'lucide-react';

interface PlatformGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PlatformGuideModal: React.FC<PlatformGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const guideSection = {
    dashboard: {
      title: "Dashboard",
      icon: <Home className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Panoramica Generale
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  La dashboard è il centro di controllo della tua piattaforma. Qui trovi:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-3 h-3 text-primary" />
                    Statistiche dei tuoi animali
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-3 h-3 text-primary" />
                    Punteggio di benessere calcolato
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-3 h-3 text-primary" />
                    Grafici di tendenza wellness
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-3 h-3 text-primary" />
                    Gestione dati medici completa
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent" />
                  Azioni Rapide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Accesso diretto alle funzioni principali:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Camera className="w-3 h-3 text-accent" />
                    Analizza comportamento
                  </li>
                  <li className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-accent" />
                    Gestisci calendario
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="w-3 h-3 text-accent" />
                    Aggiungi voce diario
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-accent" />
                    Pronto soccorso
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Monitoraggio Salute
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Visualizza metriche di salute e comportamento dei tuoi animali:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Badge variant="outline">Parametri vitali</Badge>
                <Badge variant="outline">Statistiche emozioni</Badge>
                <Badge variant="outline">Comportamenti tracciati</Badge>
                <Badge variant="outline">Farmaci attivi</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },

    pets: {
      title: "I Miei Animali",
      icon: <Heart className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <Card className="border-secondary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-secondary" />
                Gestione Profili Animali
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">Aggiungere un nuovo animale:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Clicca su "Aggiungi Animale"</li>
                  <li>Inserisci nome, specie, razza e età</li>
                  <li>Carica una foto profilo</li>
                  <li>Aggiungi informazioni mediche (facoltativo)</li>
                  <li>Salva il profilo</li>
                </ol>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Informazioni da tracciare:</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Badge variant="secondary">Peso e misure</Badge>
                  <Badge variant="secondary">Vaccinazioni</Badge>
                  <Badge variant="secondary">Allergie</Badge>
                  <Badge variant="secondary">Farmaci</Badge>
                  <Badge variant="secondary">Veterinario</Badge>
                  <Badge variant="secondary">Assicurazione</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Documenti e Certificati
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Mantieni organizzati tutti i documenti importanti:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <FileText className="w-3 h-3" />
                  Libretto sanitario
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="w-3 h-3" />
                  Certificati di vaccinazione
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="w-3 h-3" />
                  Risultati esami medici
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="w-3 h-3" />
                  Polizza assicurativa
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )
    },

    analysis: {
      title: "Analisi Comportamentale",
      icon: <Brain className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" />
                Modalità di Analisi Avanzate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg bg-indigo/5 border-indigo/20">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-indigo-700" />
                  <h4 className="font-medium text-indigo-700">🧠 Analisi Testuale</h4>
                  <p className="text-xs text-muted-foreground">Scrivi descrizioni comportamentali per analisi NLP avanzata (max 2K caratteri)</p>
                </div>
                <div className="text-center p-4 border rounded-lg bg-pink/5 border-pink/20">
                  <Camera className="w-8 h-8 mx-auto mb-2 text-pink-700" />
                  <h4 className="font-medium text-pink-700">📸 Analisi Foto</h4>
                  <p className="text-xs text-muted-foreground">Scatta o carica foto per analisi di espressioni e postura (max 10MB)</p>
                </div>
                <div className="text-center p-4 border rounded-lg bg-purple/5 border-purple/20">
                  <Video className="w-8 h-8 mx-auto mb-2 text-purple-700" />
                  <h4 className="font-medium text-purple-700">🎬 Analisi Video</h4>
                  <p className="text-xs text-muted-foreground">Registra video per analisi di movimento e comportamenti dinamici (max 5min)</p>
                </div>
                <div className="text-center p-4 border rounded-lg bg-orange/5 border-orange/20">
                  <Mic className="w-8 h-8 mx-auto mb-2 text-orange-700" />
                  <h4 className="font-medium text-orange-700">🎙️ Analisi Audio</h4>
                  <p className="text-xs text-muted-foreground">Registra o carica audio per analisi di vocalizzazioni e tono (max 5min)</p>
                </div>
              </div>
              
              <div className="p-4 bg-coral/5 border rounded-lg border-coral/20">
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="w-4 h-4 text-coral" />
                  <h4 className="font-medium text-coral">📊 Analisi Multimediale</h4>
                </div>
                <p className="text-xs text-muted-foreground">Carica più file contemporaneamente per analisi combinate e più accurate</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Interfaccia Colorata e Intuitiva
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground mb-3">
                Ogni modalità di analisi ha un colore distintivo per facilità d'uso:
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-indigo-700 rounded"></div>
                  <span>Testo → Indigo (NLP avanzato)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-pink-700 rounded"></div>
                  <span>Foto → Rosa (Computer Vision)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-700 rounded"></div>
                  <span>Video → Viola (Analisi dinamica)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-700 rounded"></div>
                  <span>Audio → Arancione (Riconoscimento audio)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Risultati e Cronologia Avanzata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium">Informazioni dettagliate rilevate:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• <strong>Emozione primaria:</strong> Con percentuale di confidenza 85-98%</li>
                  <li>• <strong>Emozioni secondarie:</strong> Stati emotivi aggiuntivi rilevati</li>
                  <li>• <strong>Insights comportamentali:</strong> Analisi dettagliata dei pattern</li>
                  <li>• <strong>Raccomandazioni AI:</strong> Suggerimenti personalizzati specifici</li>
                  <li>• <strong>Trigger identificati:</strong> Possibili cause scatenanti del comportamento</li>
                  <li>• <strong>Contesto ambientale:</strong> Integrazione con dati meteo quando possibile</li>
                </ul>
              </div>
              
              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-sm">
                  <strong>📊 Cronologia Avanzata:</strong> Filtri per tipo, emozione, confidenza e date. Export PDF per veterinari. Comparazione tra analisi multiple.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Funzioni Premium e AI Avanzate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-1 text-sm">
                <li>• <strong>Previsore Meteo-Umore:</strong> Correlazioni comportamento-clima</li>
                <li>• <strong>Elaborazione NLP:</strong> Analisi semantica delle descrizioni</li>
                <li>• <strong>Computer Vision Avanzata:</strong> Riconoscimento micro-espressioni</li>
                <li>• <strong>Analisi Audio ML:</strong> Riconoscimento tono, pitch e intensità</li>
                <li>• <strong>Filtri Intelligenti:</strong> Ricerca avanzata nella cronologia</li>
                <li>• <strong>Export Veterinario:</strong> Report PDF professionale per consultazioni</li>
                <li>• <strong>Analisi Comparative:</strong> Confronto progressi nel tempo</li>
                <li>• <strong>Auto-analisi:</strong> Elaborazione automatica per alcuni tipi di file</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )
    },

    calendar: {
      title: "Calendario",
      icon: <Calendar className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" />
                Gestione Eventi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">Tipi di eventi:</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Badge variant="outline" className="justify-start">
                    <Clock className="w-3 h-3 mr-1" />
                    Visite veterinarie
                  </Badge>
                  <Badge variant="outline" className="justify-start">
                    <Heart className="w-3 h-3 mr-1" />
                    Toelettatura
                  </Badge>
                  <Badge variant="outline" className="justify-start">
                    <Activity className="w-3 h-3 mr-1" />
                    Attività fisica
                  </Badge>
                  <Badge variant="outline" className="justify-start">
                    <Bell className="w-3 h-3 mr-1" />
                    Promemoria farmaci
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Funzioni disponibili:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Notifiche push personalizzabili</li>
                  <li>• Promemoria automatici</li>
                  <li>• Esportazione PDF calendario</li>
                  <li>• Filtri per categoria evento</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="w-4 h-4" />
                Strumenti Disponibili
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Funzionalità aggiuntive del calendario:
              </p>
              <ul className="space-y-1 text-sm">
                <li>• Trova veterinari nelle vicinanze</li>
                <li>• Schedulatore intelligente basato su pattern</li>
                <li>• Viste multiple: mensile, settimanale, giornaliera</li>
                <li>• Statistiche utilizzo calendario</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )
    },

    diary: {
      title: "Diario",
      icon: <BookOpen className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <Card className="border-secondary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-secondary" />
                Registrazione Quotidiana
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">Cosa registrare:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Heart className="w-3 h-3 text-red-500" />
                    <span>Umore e comportamento</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-3 h-3 text-blue-500" />
                    <span>Livello di attività</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-green-500" />
                    <span>Ore di sonno</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="w-3 h-3 text-purple-500" />
                    <span>Appetito e alimentazione</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-secondary/10 rounded-lg">
                <p className="text-sm">
                  <strong>✨ Suggerimento:</strong> Registra le informazioni ogni sera per creare un quadro completo del benessere del tuo animale.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analisi dei Pattern
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Il diario permette di visualizzare e analizzare:
              </p>
              <ul className="space-y-1 text-sm">
                <li>• Cronologia voci del diario nel tempo</li>
                <li>• Visualizzazione calendario per navigazione rapida</li>
                <li>• Filtri per categoria e tag comportamentali</li>
                <li>• Esportazione PDF dei dati del diario</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )
    },

    community: {
      title: "Community",
      icon: <Users className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Chat e Discussioni
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">Tipologie di chat:</h4>
                <div className="space-y-2">
                  <div className="p-2 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageCircle className="w-3 h-3 text-blue-500" />
                      <span className="font-medium text-sm">Chat Generale</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Discussioni aperte con tutta la community
                    </p>
                  </div>
                  
                  <div className="p-2 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-3 h-3 text-green-500" />
                      <span className="font-medium text-sm">Chat Private</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Conversazioni private con altri utenti (via Pet Matching)
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Funzioni disponibili:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Condividi messaggi nella chat generale</li>
                  <li>• Ricevi notifiche per nuovi messaggi</li>
                  <li>• Connetti con altri proprietari tramite Pet Matching</li>
                  <li>• Sistema di notifiche in tempo reale</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },

    petmatching: {
      title: "Pet Matching",
      icon: <Heart className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-accent" />
                Intelligenza di Matching
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">Come funziona:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>L'IA analizza il profilo del tuo pet</li>
                  <li>Cerca compatibility con altri animali</li>
                  <li>Considera comportamenti e personalità</li>
                  <li>Propone match ottimali per socializzazione</li>
                </ol>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Criteri di matching:</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Badge variant="outline">Taglia compatibile</Badge>
                  <Badge variant="outline">Livello energia</Badge>
                  <Badge variant="outline">Temperamento</Badge>
                  <Badge variant="outline">Età simile</Badge>
                  <Badge variant="outline">Vicinanza geografica</Badge>
                  <Badge variant="outline">Esperienza analisi</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Connessioni e Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground mb-3">
                Una volta trovato un match interessante:
              </p>
              <ul className="space-y-1 text-sm">
                <li>• Clicca "Connetti" per iniziare una chat privata</li>
                <li>• Presenta il tuo pet e le sue caratteristiche</li>
                <li>• Organizza incontri di socializzazione</li>
                <li>• Condividi esperienze e consigli</li>
              </ul>
              
              <div className="p-3 bg-accent/10 rounded-lg">
                <p className="text-sm">
                  <strong>🎯 Obiettivo:</strong> Creare una rete sociale per i tuoi animali, migliorando il loro benessere attraverso interazioni positive.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },

    training: {
      title: "Addestramento",
      icon: <Gamepad2 className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-accent" />
                Protocolli AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">Protocolli disponibili:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium text-sm mb-1">Addestramento Base</h5>
                    <p className="text-xs text-muted-foreground">Comandi fondamentali: seduto, resta, vieni</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium text-sm mb-1">Comportamenti Sociali</h5>
                    <p className="text-xs text-muted-foreground">Interazione con persone e altri animali</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium text-sm mb-1">Risoluzione Problemi</h5>
                    <p className="text-xs text-muted-foreground">Gestione di ansia, aggressività, paure</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium text-sm mb-1">Trick Avanzati</h5>
                    <p className="text-xs text-muted-foreground">Comandi complessi e spettacolari</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-accent/10 rounded-lg">
                <p className="text-sm">
                  <strong>🎯 Personalizzazione:</strong> Ogni protocollo si adatta automaticamente all'età, razza e personalità del tuo animale.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Sistema di Protocolli
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                I protocolli di addestramento includono:
              </p>
              <ul className="space-y-1 text-sm">
                <li>• Istruzioni dettagliate per ogni esercizio</li>
                <li>• Cronometraggio sessioni di allenamento</li>
                <li>• Valutazione del successo degli esercizi</li>
                <li>• Progressi tracciati nel tempo</li>
                <li>• Creazione protocolli personalizzati</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )
    },

    musictherapy: {
      title: "Musicoterapia AI",
      icon: <Music className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <Card className="border-secondary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="w-4 h-4 text-secondary" />
                Playlist Personalizzate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">Tipologie di musica:</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Badge variant="outline" className="justify-start">
                    <Heart className="w-3 h-3 mr-1 text-blue-500" />
                    Rilassamento
                  </Badge>
                  <Badge variant="outline" className="justify-start">
                    <Zap className="w-3 h-3 mr-1 text-yellow-500" />
                    Energia e gioco
                  </Badge>
                  <Badge variant="outline" className="justify-start">
                    <Shield className="w-3 h-3 mr-1 text-green-500" />
                    Anti-ansia
                  </Badge>
                  <Badge variant="outline" className="justify-start">
                    <Clock className="w-3 h-3 mr-1 text-purple-500" />
                    Sonno profondo
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Come funziona:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Seleziona il tipo di terapia adatto al momento</li>
                  <li>Regola volume e durata della sessione</li>
                  <li>Avvia la riproduzione di frequenze terapeutiche</li>
                  <li>Monitora i progressi della sessione</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Effetti Misurabili
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                La musicoterapia AI offre:
              </p>
              <ul className="space-y-1 text-sm">
                <li>• Sessioni di diversa durata e intensità</li>
                <li>• Controllo volume e tempo della sessione</li>
                <li>• Diverse categorie terapeutiche disponibili</li>
                <li>• Interfaccia di controllo intuitiva</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )
    },

    settings: {
      title: "Impostazioni",
      icon: <Settings className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" />
                Personalizzazione Profilo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">Impostazioni account:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Modifica informazioni personali</li>
                  <li>• Gestione password e sicurezza</li>
                  <li>• Preferenze di comunicazione</li>
                  <li>• Fuso orario e lingua</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Privacy e sicurezza:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Controllo visibilità profilo</li>
                  <li>• Gestione dati condivisi</li>
                  <li>• Backup automatico</li>
                  <li>• Eliminazione account</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifiche
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground mb-3">
                Personalizza quando e come ricevere le notifiche:
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-blue-500" />
                  <span>Promemoria appuntamenti</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-3 h-3 text-green-500" />
                  <span>Messaggi community</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="w-3 h-3 text-purple-500" />
                  <span>Insights AI</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-3 h-3 text-red-500" />
                  <span>Aggiornamenti benessere</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Abbonamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Gestisci il tuo piano di abbonamento:
              </p>
              <ul className="space-y-1 text-sm">
                <li>• Visualizza piano attuale</li>
                <li>• Upgrade/downgrade</li>
                <li>• Cronologia pagamenti</li>
                <li>• Gestione fatturazione</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Guida Completa della Piattaforma
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 border-r bg-muted/30 p-4">
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {Object.entries(guideSection).map(([key, section]) => (
                  <Button
                    key={key}
                    variant={activeSection === key ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection(key)}
                  >
                    {section.icon}
                    <span className="ml-2">{section.title}</span>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  {guideSection[activeSection as keyof typeof guideSection].icon}
                  <h2 className="text-xl font-semibold">
                    {guideSection[activeSection as keyof typeof guideSection].title}
                  </h2>
                </div>
                
                {guideSection[activeSection as keyof typeof guideSection].content}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlatformGuideModal;