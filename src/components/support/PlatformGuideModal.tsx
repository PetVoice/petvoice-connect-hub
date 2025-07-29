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
  ChevronRight
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
                  La dashboard è il tuo punto di partenza. Qui trovi:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-3 h-3 text-primary" />
                    Riassunto attività dei tuoi animali
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-3 h-3 text-primary" />
                    Prossimi appuntamenti veterinari
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-3 h-3 text-primary" />
                    Trend di benessere
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-3 h-3 text-primary" />
                    Raccomandazioni AI personalizzate
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
                  Accesso diretto alle funzioni più usate:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <PlusCircle className="w-3 h-3 text-accent" />
                    Aggiungi nuovo animale
                  </li>
                  <li className="flex items-center gap-2">
                    <Camera className="w-3 h-3 text-accent" />
                    Analizza comportamento
                  </li>
                  <li className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-accent" />
                    Crea evento calendario
                  </li>
                  <li className="flex items-center gap-2">
                    <MessageCircle className="w-3 h-3 text-accent" />
                    Chat con la community
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Widget Personalizzabili
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Personalizza la tua dashboard spostando e ridimensionando i widget secondo le tue preferenze.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Badge variant="outline">Stato di salute</Badge>
                <Badge variant="outline">Attività recente</Badge>
                <Badge variant="outline">Meteo e umore</Badge>
                <Badge variant="outline">Playlist musicali</Badge>
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
                Tipi di Analisi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <Camera className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium">Foto</h4>
                  <p className="text-xs text-muted-foreground">Analizza postura, espressioni e stato emotivo</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <Video className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium">Video</h4>
                  <p className="text-xs text-muted-foreground">Movimento, comportamenti e interazioni</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <Mic className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium">Audio</h4>
                  <p className="text-xs text-muted-foreground">Vocalizzazioni, stress e comunicazione</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Come Interpretare i Risultati
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium">Metriche di Benessere:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• <strong>Felicità:</strong> Postura rilassata, coda alzata, giocosità</li>
                  <li>• <strong>Stress:</strong> Respirazione accelerata, tremori, isolamento</li>
                  <li>• <strong>Energia:</strong> Livello di attività e movimento</li>
                  <li>• <strong>Salute:</strong> Indicatori fisici e comportamentali</li>
                </ul>
              </div>
              
              <div className="p-3 bg-accent/10 rounded-lg">
                <p className="text-sm">
                  <strong>💡 Suggerimento:</strong> Effettua analisi regolari per tracciare i cambiamenti nel tempo e identificare pattern comportamentali.
                </p>
              </div>
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
                <h4 className="font-medium">Funzioni avanzate:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Sincronizzazione con Google Calendar</li>
                  <li>• Notifiche push personalizzabili</li>
                  <li>• Promemoria automatici</li>
                  <li>• Condivisione con veterinari</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="w-4 h-4" />
                Integrazione Servizi Locali
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Il calendario si integra automaticamente con i servizi nella tua zona:
              </p>
              <ul className="space-y-1 text-sm">
                <li>• Trova veterinari disponibili</li>
                <li>• Prenota servizi di toelettatura</li>
                <li>• Localizza pet sitter</li>
                <li>• Eventi e corsi di addestramento</li>
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
                Il diario genera automaticamente insights sui pattern comportamentali:
              </p>
              <ul className="space-y-1 text-sm">
                <li>• Correlazioni tra meteo e umore</li>
                <li>• Trend di attività nel tempo</li>
                <li>• Identificazione di anomalie</li>
                <li>• Previsioni di benessere</li>
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
                      Discussioni aperte su qualsiasi argomento pet-related
                    </p>
                  </div>
                  
                  <div className="p-2 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-3 h-3 text-green-500" />
                      <span className="font-medium text-sm">Chat Private</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Conversazioni dirette con altri utenti
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Funzioni social:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Condividi foto e video dei tuoi animali</li>
                  <li>• Chiedi consigli alla community</li>
                  <li>• Partecipa a eventi locali</li>
                  <li>• Trova compagni di gioco per i tuoi pet</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                AI Community Learning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                L'IA impara dalle discussioni della community per fornire consigli sempre più personalizzati e accurati.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-yellow-500" />
                  <span>Suggerimenti basati su esperienze simili</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-3 h-3 text-blue-500" />
                  <span>Trend comportamentali della community</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-3 h-3 text-red-500" />
                  <span>Consigli di benessere validati dalla community</span>
                </div>
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
                <Video className="w-4 h-4" />
                Tutorial Interattivi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Ogni protocollo include video tutorial step-by-step:
              </p>
              <ul className="space-y-1 text-sm">
                <li>• Video dimostrativi HD</li>
                <li>• Istruzioni vocali passo-passo</li>
                <li>• Quiz di comprensione</li>
                <li>• Tracking dei progressi</li>
                <li>• Certificazioni di completamento</li>
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
                  <li>L'IA analizza lo stato emotivo del tuo pet</li>
                  <li>Genera playlist adatte al momento</li>
                  <li>Monitora le reazioni durante l'ascolto</li>
                  <li>Ottimizza le raccomandazioni future</li>
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
                La musicoterapia AI traccia l'efficacia attraverso:
              </p>
              <ul className="space-y-1 text-sm">
                <li>• Riduzione dei livelli di stress</li>
                <li>• Miglioramento della qualità del sonno</li>
                <li>• Aumento dell'energia positiva</li>
                <li>• Diminuzione di comportamenti ansiosi</li>
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