import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, 
  Ticket, 
  Book, 
  BookOpen,
  Search, 
  Star, 
  Phone, 
  Mail, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Send, 
  Heart, 
  ThumbsUp, 
  ThumbsDown,
  Lightbulb,
  Settings,
  TrendingUp,
  Users,
  Zap,
  Shield,
  Paperclip,
  Calendar,
  BarChart3,
  HelpCircle,
  VideoIcon,
  MessageSquare,
  PhoneCall,
  Globe,
  Award,
  Target,
  Headphones,
  Bot,
  Filter,
  Download,
  Upload,
  Eye,
  AlertTriangle,
  Info,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Bell,
  Brain,
  Activity,
  Timer,
  Flag,
  XCircle,
  UserCheck,
  FileCheck,
  Database,
  Code,
  RefreshCw,
  Lock,
  Camera,
  Mic,
  Music,
  PlayCircle,
  Pause,
  Edit,
  Trash2
} from 'lucide-react';
import { AILiveChatButton } from '@/components/AILiveChat';
import { supabase } from '@/integrations/supabase/client';
import { useTranslatedToast } from '@/hooks/use-translated-toast';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { useNotifications } from '@/hooks/useNotifications';

interface SupportTicket {
  id: string;
  ticket_number: string;
  category: string;
  priority: string;
  subject: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  sla_deadline: string;
  customer_satisfaction_rating?: number;
  satisfaction_feedback?: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  helpful_count: number;
  not_helpful_count: number;
  view_count: number;
}

interface KnowledgeBase {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  helpful_count: number;
  not_helpful_count: number;
  view_count: number;
}

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  votes: number;
  created_at: string;
  user_id: string;
}

interface FeatureRequestComment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  feature_request_id: string;
}

interface FeatureRequestVote {
  id: string;
  user_id: string;
  feature_request_id: string;
}

const SupportPage: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase[]>([]);
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>([]);
  const [featureComments, setFeatureComments] = useState<{[key: string]: FeatureRequestComment[]}>({});
  const [userVotes, setUserVotes] = useState<string[]>([]);
  const [selectedFeatureForComments, setSelectedFeatureForComments] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newTicket, setNewTicket] = useState({
    category: '',
    priority: 'medium',
    subject: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
  }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('faq');
  const [isNewTicketDialogOpen, setIsNewTicketDialogOpen] = useState(false);
  const [isNewFeatureDialogOpen, setIsNewFeatureDialogOpen] = useState(false);
  const [isUserGuideDialogOpen, setIsUserGuideDialogOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<SupportTicket | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketToClose, setTicketToClose] = useState<SupportTicket | null>(null);
  const [ticketReply, setTicketReply] = useState('');
  const [ticketReplies, setTicketReplies] = useState<{[key: string]: any[]}>({});
  const [newFeatureRequest, setNewFeatureRequest] = useState({
    title: '',
    description: '',
    category: 'feature',
    tags: []
  });
  const { showToast } = useTranslatedToast();
  const { addNotification } = useNotifications();

  // Carica i dati iniziali
  useEffect(() => {
    loadSupportData();
  }, []);

  // Funzione per ottenere l'ultimo messaggio
  const getLastMessage = (ticket: SupportTicket) => {
    const replies = ticketReplies[ticket.id] || [];
    if (replies.length > 0) {
      return replies[replies.length - 1]; // Ultimo reply
    }
    return null;
  };

  const loadSupportData = async () => {
    try {
      setLoading(true);
      
      // Carica tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (ticketsError) {
        console.error('Error loading tickets:', ticketsError);
      } else {
        setTickets(ticketsData || []);
      }

      // Carica FAQ
      const { data: faqData, error: faqError } = await supabase
        .from('support_faq')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true });

      if (faqError) {
        console.error('Error loading FAQ:', faqError);
      } else {
        setFaqs(faqData || []);
      }

      // Carica knowledge base
      const { data: kbData, error: kbError } = await supabase
        .from('support_knowledge_base')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (kbError) {
        console.error('Error loading knowledge base:', kbError);
      } else {
        setKnowledgeBase(kbData || []);
      }

      // Carica feature requests
      const { data: frData, error: frError } = await supabase
        .from('support_feature_requests')
        .select('*')
        .order('votes', { ascending: false });

      if (frError) {
        console.error('Error loading feature requests:', frError);
      } else {
        setFeatureRequests(frData || []);
      }

      // Carica i voti dell'utente corrente
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: votesData } = await supabase
          .from('feature_request_votes')
          .select('feature_request_id')
          .eq('user_id', user.id);
        
        setUserVotes(votesData?.map(v => v.feature_request_id) || []);
      }

    } catch (error) {
      console.error('Error loading support data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async () => {
    if (!newTicket.subject || !newTicket.description || !newTicket.category) {
      showToast({
        title: "❌ Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showToast({
          title: "❌ Errore",
          description: "Devi essere autenticato per creare un ticket",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      console.log('Creating ticket with data:', {
        category: newTicket.category,
        priority: newTicket.priority,
        subject: newTicket.subject,
        description: newTicket.description,
        user_id: user.id,
        status: 'open'
      });

      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          ticket_number: '', // Verrà generato automaticamente dal trigger
          category: newTicket.category,
          priority: newTicket.priority,
          subject: newTicket.subject,
          description: newTicket.description,
          user_id: user.id,
          status: 'open'
        });

      console.log('Insert result:', { data, error });

      if (error) {
        console.error('Detailed error:', error);
        throw error;
      }

      showToast({
        title: "✅ Ticket creato",
        description: "Il tuo ticket è stato creato con successo. Riceverai una risposta entro 24 ore."
      });

      // Notifica per nuovo ticket
      addNotification({
        title: 'Ticket di supporto creato',
        message: `Il tuo ticket "${newTicket.subject}" è stato inviato al supporto`,
        type: 'success',
        read: false,
        action_url: '/support'
      });

      // Reset form
      setNewTicket({
        category: '',
        priority: 'medium',
        subject: '',
        description: ''
      });

      setIsNewTicketDialogOpen(false);
      
      // Ricarica i tickets
      loadSupportData();
    } catch (error) {
      console.error('Error creating ticket:', error);
      showToast({
        title: "❌ Errore",
        description: "Impossibile creare il ticket. Riprova più tardi.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeTicket = async (ticketId: string, ticketSubject: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: 'closed' })
        .eq('id', ticketId);

      if (error) throw error;

      showToast({
        title: "✅ Ticket chiuso",
        description: `Il ticket "${ticketSubject}" è stato chiuso.`
      });
      
      // Ricarica i tickets
      loadSupportData();
    } catch (error) {
      console.error('Error closing ticket:', error);
      showToast({
        title: "❌ Errore",
        description: "Impossibile chiudere il ticket. Riprova più tardi.",
        variant: "destructive"
      });
    }
  };

  const loadTicketReplies = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('support_ticket_replies')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTicketReplies(prev => ({
        ...prev,
        [ticketId]: data || []
      }));
    } catch (error) {
      console.error('Error loading ticket replies:', error);
    }
  };

  const addTicketReply = async (ticketId: string, content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showToast({
          title: "❌ Errore",
          description: "Devi essere autenticato per rispondere",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('support_ticket_replies')
        .insert({
          ticket_id: ticketId,
          user_id: user.id,
          content: content.trim(),
          is_staff_reply: false
        });

      if (error) throw error;

      showToast({
        title: "✅ Risposta inviata",
        description: "La tua risposta è stata aggiunta al ticket."
      });

      // Ricarica le risposte per questo ticket
      loadTicketReplies(ticketId);
      setTicketReply('');
    } catch (error) {
      console.error('Error adding ticket reply:', error);
      showToast({
        title: "❌ Errore",
        description: "Impossibile inviare la risposta. Riprova più tardi.",
        variant: "destructive"
      });
    }
  };

  const createFeatureRequest = async () => {
    if (!newFeatureRequest.title || !newFeatureRequest.description) {
      showToast({
        title: "❌ Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showToast({
          title: "❌ Errore",
          description: "Devi essere autenticato per creare una richiesta",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('support_feature_requests')
        .insert({
          title: newFeatureRequest.title,
          description: newFeatureRequest.description,
          category: newFeatureRequest.category,
          user_id: user.id
        });

      if (error) throw error;

      showToast({
        title: "✅ Richiesta inviata",
        description: "La tua richiesta di funzionalità è stata inviata con successo."
      });

      // Reset form
      setNewFeatureRequest({
        title: '',
        description: '',
        category: 'feature',
        tags: []
      });

      setIsNewFeatureDialogOpen(false);
      
      // Ricarica i data
      loadSupportData();
    } catch (error) {
      console.error('Error creating feature request:', error);
      showToast({
        title: "❌ Errore",
        description: "Impossibile inviare la richiesta. Riprova più tardi.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const markFAQHelpful = async (faqId: string, isHelpful: boolean) => {
    try {
      const faq = faqs.find(f => f.id === faqId);
      if (!faq) return;

      const updateField = isHelpful ? 'helpful_count' : 'not_helpful_count';
      const currentCount = isHelpful ? faq.helpful_count : faq.not_helpful_count;

      const { error } = await supabase
        .from('support_faq')
        .update({ 
          [updateField]: currentCount + 1,
          view_count: faq.view_count + 1
        })
        .eq('id', faqId);

      if (error) throw error;

      // Aggiorna lo stato locale
      setFaqs(faqs.map(f => 
        f.id === faqId 
          ? { 
              ...f, 
              [updateField]: currentCount + 1,
              view_count: f.view_count + 1
            }
          : f
      ));

      showToast({
        title: "✅ Grazie per il feedback!",
        description: "Il tuo feedback ci aiuta a migliorare il supporto."
      });
    } catch (error) {
      console.error('Error updating FAQ feedback:', error);
    }
  };

  const voteFeatureRequest = async (requestId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showToast({
          title: "Errore",
          description: "Devi essere autenticato per votare",
          variant: "destructive"
        });
        return;
      }

      // Verifica se l'utente ha già votato
      if (userVotes.includes(requestId)) {
        showToast({
          title: "Già votato",
          description: "Hai già votato questa richiesta"
        });
        return;
      }

      // Aggiungi il voto
      const { error: voteError } = await supabase
        .from('feature_request_votes')
        .insert({
          user_id: user.id,
          feature_request_id: requestId
        });

      if (voteError) throw voteError;

      // Aggiorna il contatore
      const request = featureRequests.find(r => r.id === requestId);
      if (!request) return;

      const { error: updateError } = await supabase
        .from('support_feature_requests')
        .update({ votes: request.votes + 1 })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Aggiorna lo stato locale
      setFeatureRequests(featureRequests.map(r => 
        r.id === requestId 
          ? { ...r, votes: r.votes + 1 }
          : r
      ));
      setUserVotes([...userVotes, requestId]);

      showToast({
        title: "✅ Voto aggiunto",
        description: "Grazie per aver votato questa richiesta di funzionalità!"
      });
    } catch (error) {
      console.error('Error voting feature request:', error);
      showToast({
        title: "Errore",
        description: "Impossibile aggiungere il voto",
        variant: "destructive"
      });
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      text: chatInput,
      sender: 'user' as const,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);

    try {
      // Simula l'intelligenza artificiale per l'assistenza
      const aiResponse = await getAIResponse(chatInput);
      
      const botResponse = {
        text: aiResponse,
        sender: 'bot' as const,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorResponse = {
        text: "Mi dispiace, sto avendo dei problemi tecnici. Puoi riprovare o aprire un ticket di supporto per assistenza personalizzata.",
        sender: 'bot' as const,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const loadFeatureComments = async (featureRequestId: string) => {
    try {
      const { data, error } = await supabase
        .from('feature_request_comments')
        .select('*')
        .eq('feature_request_id', featureRequestId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setFeatureComments(prev => ({
        ...prev,
        [featureRequestId]: data || []
      }));
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const addFeatureComment = async () => {
    if (!newComment.trim() || !selectedFeatureForComments) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showToast({
          title: "Errore",
          description: "Devi essere autenticato per commentare",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('feature_request_comments')
        .insert({
          feature_request_id: selectedFeatureForComments,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment('');
      loadFeatureComments(selectedFeatureForComments);
      
      showToast({
        title: "Commento aggiunto",
        description: "Il tuo commento è stato pubblicato!"
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      showToast({
        title: "Errore",
        description: "Impossibile aggiungere il commento",
        variant: "destructive"
      });
    }
  };

  const getAIResponse = async (userMessage: string): Promise<string> => {
    // Logica di AI semplificata per rispondere alle domande comuni
    const message = userMessage.toLowerCase();
    
    if (message.includes('prezzo') || message.includes('costo') || message.includes('piano')) {
      return "PetVoice offre un servizio completo per il monitoraggio del benessere del tuo pet. Include analisi comportamentali avanzate, supporto dedicato, calendari intelligenti e molto altro. Vuoi sapere di più sulle funzionalità disponibili?";
    }
    
    if (message.includes('ticket') || message.includes('problema') || message.includes('bug')) {
      return "Per problemi tecnici o richieste specifiche, ti consiglio di aprire un ticket di supporto. Il nostro team risponde entro 24 ore. Posso aiutarti a identificare quale categoria di ticket è più adatta?";
    }
    
    if (message.includes('analisi') || message.includes('comportamento') || message.includes('emozione')) {
      return "Le analisi comportamentali di PetVoice utilizzano AI avanzata per interpretare le emozioni del tuo pet. Puoi caricare audio, video o foto per ottenere insights dettagliati. Hai bisogno di aiuto con l'upload dei file?";
    }
    
    if (message.includes('calendario') || message.includes('appuntamento') || message.includes('veterinario')) {
      return "Il calendario intelligente di PetVoice può aiutarti a programmare visite veterinarie, trattamenti e attività. Puoi anche impostare promemoria automatici. Vuoi che ti spieghi come utilizzare questa funzione?";
    }
    
    if (message.includes('diario') || message.includes('registrazione') || message.includes('giornaliero')) {
      return "Il diario digitale ti permette di tracciare l'umore, i comportamenti e la salute del tuo pet quotidianamente. Puoi aggiungere foto, note vocali e tag comportamentali. Ti serve aiuto per iniziare?";
    }
    
    
    if (message.includes('emergenza') || message.includes('urgente') || message.includes('aiuto')) {
      return "Per emergenze relative alla salute del tuo pet, contatta immediatamente il tuo veterinario. Per supporto tecnico urgente, usa il supporto di emergenza 24/7 nella sezione contatti. Posso aiutarti con qualcos'altro?";
    }
    
    if (message.includes('premium') || message.includes('abbonamento') || message.includes('pagamento')) {
      return "PetVoice offre un servizio completo con analisi illimitate, supporto dedicato, backup cloud e funzioni avanzate. Puoi utilizzare tutte le funzionalità per monitorare al meglio il benessere del tuo pet. Vuoi vedere tutte le caratteristiche?";
    }
    
    // Risposta generica per altre domande
    return "Ciao! Sono l'assistente virtuale di PetVoice. Posso aiutarti con informazioni sui nostri servizi, prezzi, funzioni e problemi tecnici. Se non riesco a rispondere alla tua domanda, ti suggerirò di aprire un ticket per supporto personalizzato. Come posso aiutarti oggi?";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500';
      case 'in_progress': return 'bg-orange-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <Settings className="h-4 w-4" />;
      case 'billing': return <BarChart3 className="h-4 w-4" />;
      case 'medical': return <Heart className="h-4 w-4" />;
      case 'general': return <HelpCircle className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredKnowledgeBase = knowledgeBase.filter(kb => {
    const matchesSearch = kb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         kb.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || kb.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Caricamento supporto...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">{/* Removed Layout wrapper */}
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Headphones className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Supporto</h1>
            <p className="text-muted-foreground mt-1">
              Ottieni aiuto, trova risposte e resta aggiornato sulle novità
            </p>
          </div>
        </div>


        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="tickets">Ticket</TabsTrigger>
            <TabsTrigger value="features">Richieste</TabsTrigger>
            <TabsTrigger value="guide">Guida</TabsTrigger>
            <TabsTrigger value="contact">Contatti</TabsTrigger>
          </TabsList>
          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            <Card className="bg-gradient-to-br from-violet-50/80 to-purple-50/60 border-violet-200/50 shadow-elegant hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HelpCircle className="h-5 w-5" />
                  <span>Domande Frequenti</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  
                  {/* FAQ Generali */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Funzionalità Principali</h3>
                    
                    <Card className="bg-gradient-to-br from-sky-50/80 to-blue-50/60 border-sky-200/50 shadow-elegant hover:shadow-glow transition-all duration-300">
                      <CardContent className="p-4">
                        <h4 className="font-medium text-lg mb-2">Come funziona l'analisi comportamentale AI?</h4>
                        <p className="text-muted-foreground mb-3">
                          Il nostro sistema AI analizza video, audio e foto del tuo pet per identificare pattern comportamentali, 
                          stati emotivi e possibili problemi di salute. L'algoritmo è addestrato su migliaia di casi e continua ad apprendere.
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">AI</Badge>
                          <Badge variant="outline" className="text-xs">analisi</Badge>
                          <Badge variant="outline" className="text-xs">comportamento</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-emerald-50/80 to-green-50/60 border-emerald-200/50 shadow-elegant hover:shadow-glow transition-all duration-300">
                      <CardContent className="p-4">
                        <h4 className="font-medium text-lg mb-2">Quali formati di file posso caricare?</h4>
                        <p className="text-muted-foreground mb-3">
                          Video: MP4, MOV, AVI (max 100MB, 5sec-5min) • Audio: MP3, WAV, M4A (max 50MB, 3sec-10min) • 
                          Immagini: JPG, PNG, HEIC (max 10MB, min 800x600px)
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">video</Badge>
                          <Badge variant="outline" className="text-xs">audio</Badge>
                          <Badge variant="outline" className="text-xs">foto</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-50/80 to-yellow-50/60 border-amber-200/50 shadow-elegant hover:shadow-glow transition-all duration-300">
                      <CardContent className="p-4">
                        <h4 className="font-medium text-lg mb-2">Come interpreto i risultati dell'analisi?</h4>
                        <p className="text-muted-foreground mb-3">
                          Ogni analisi fornisce un punteggio di benessere (1-10), indicatori di stress, raccomandazioni 
                          personalizzate e confronti con i dati storici. I grafici mostrano i trend nel tempo.
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">risultati</Badge>
                          <Badge variant="outline" className="text-xs">benessere</Badge>
                          <Badge variant="outline" className="text-xs">trend</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* FAQ Account e Abbonamento */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Account e Abbonamento</h3>
                    
                    <Card className="bg-gradient-to-br from-purple-50/80 to-violet-50/60 border-purple-200/50 shadow-elegant hover:shadow-glow transition-all duration-300">
                      <CardContent className="p-4">
                        <h4 className="font-medium text-lg mb-2">Quanto costa PetVoice Premium?</h4>
                        <p className="text-muted-foreground mb-3">
                          Il piano Premium costa €0,97 al mese e include analisi illimitate, protocolli di addestramento AI, 
                          supporto prioritario, calendari intelligenti e backup cloud. Puoi cancellare in qualsiasi momento.
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">premium</Badge>
                          <Badge variant="outline" className="text-xs">prezzo</Badge>
                          <Badge variant="outline" className="text-xs">abbonamento</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-rose-50/80 to-pink-50/60 border-rose-200/50 shadow-elegant hover:shadow-glow transition-all duration-300">
                      <CardContent className="p-4">
                        <h4 className="font-medium text-lg mb-2">Posso usare PetVoice gratuitamente?</h4>
                        <p className="text-muted-foreground mb-3">
                          Sì! Il piano gratuito include 3 analisi al mese, diario base e accesso alla community. 
                          Perfetto per iniziare a conoscere il tuo pet meglio.
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">gratuito</Badge>
                          <Badge variant="outline" className="text-xs">limiti</Badge>
                          <Badge variant="outline" className="text-xs">prova</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* FAQ Tecnico */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Problemi Tecnici</h3>
                    
                    <Card className="bg-gradient-to-br from-orange-50/80 to-red-50/60 border-orange-200/50 shadow-elegant hover:shadow-glow transition-all duration-300">
                      <CardContent className="p-4">
                        <h4 className="font-medium text-lg mb-2">L'upload del file non funziona, cosa faccio?</h4>
                        <p className="text-muted-foreground mb-3">
                          Verifica la connessione internet, controlla che il file rispetti i limiti di dimensione e formato. 
                          Se il problema persiste, prova a riavviare l'app o contatta il supporto.
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">upload</Badge>
                          <Badge variant="outline" className="text-xs">errore</Badge>
                          <Badge variant="outline" className="text-xs">risoluzione</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-cyan-50/80 to-blue-50/60 border-cyan-200/50 shadow-elegant hover:shadow-glow transition-all duration-300">
                      <CardContent className="p-4">
                        <h4 className="font-medium text-lg mb-2">I miei dati sono al sicuro?</h4>
                        <p className="text-muted-foreground mb-3">
                          Assolutamente sì. Utilizziamo crittografia end-to-end, server certificati GDPR e backup automatici. 
                          I tuoi dati non vengono mai condivisi con terze parti senza consenso.
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">sicurezza</Badge>
                          <Badge variant="outline" className="text-xs">privacy</Badge>
                          <Badge variant="outline" className="text-xs">GDPR</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Info Contatto */}
                  <div className="bg-muted/30 rounded-lg p-4 mt-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <MessageCircle className="h-5 w-5 text-primary" />
                      <h4 className="font-medium">Non trovi la risposta?</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Il nostro team di supporto è sempre disponibile per aiutarti. Contattaci tramite chat o email.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab('contact')}
                    >
                      Contatta il Supporto
                    </Button>
                  </div>

                </div>
              </CardContent>
            </Card>
           </TabsContent>
           
           {/* Tickets Tab */}
           <TabsContent value="tickets" className="space-y-6">
             <Card className="bg-gradient-to-br from-orange-50/80 to-amber-50/60 border-orange-200/50 shadow-elegant hover:shadow-glow transition-all duration-300">
               <CardHeader>
                 <div className="flex items-center justify-between">
                   <CardTitle className="flex items-center space-x-2">
                     <Ticket className="h-5 w-5" />
                     <span>I miei Ticket di Supporto</span>
                   </CardTitle>
                   <Dialog open={isNewTicketDialogOpen} onOpenChange={setIsNewTicketDialogOpen}>
                     <DialogTrigger asChild>
                       <Button className="bg-primary hover:bg-primary/90">
                         <Plus className="h-4 w-4 mr-2" />
                         Nuovo Ticket
                       </Button>
                     </DialogTrigger>
                     <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-2">
                            <Ticket className="h-5 w-5" />
                            <span>{editingTicket ? 'Modifica Ticket' : 'Crea un Nuovo Ticket di Supporto'}</span>
                          </DialogTitle>
                        </DialogHeader>
                       <div className="space-y-4 pt-4">
                         <div className="grid grid-cols-2 gap-4">
                           <div>
                             <label className="text-sm font-medium">Categoria</label>
                             <Select value={newTicket.category} onValueChange={(value) => setNewTicket({...newTicket, category: value})}>
                               <SelectTrigger>
                                 <SelectValue placeholder="Seleziona categoria" />
                               </SelectTrigger>
                               <SelectContent>
                                 <SelectItem value="technical">Problemi Tecnici</SelectItem>
                                 <SelectItem value="billing">Fatturazione</SelectItem>
                                 <SelectItem value="medical">Medico/Veterinario</SelectItem>
                                 <SelectItem value="general">Generale</SelectItem>
                               </SelectContent>
                             </Select>
                           </div>
                           <div>
                             <label className="text-sm font-medium">Priorità</label>
                             <Select value={newTicket.priority} onValueChange={(value) => setNewTicket({...newTicket, priority: value})}>
                               <SelectTrigger>
                                 <SelectValue />
                               </SelectTrigger>
                               <SelectContent>
                                 <SelectItem value="low">Bassa</SelectItem>
                                 <SelectItem value="medium">Media</SelectItem>
                                 <SelectItem value="high">Alta</SelectItem>
                                 <SelectItem value="urgent">Urgente</SelectItem>
                               </SelectContent>
                             </Select>
                           </div>
                         </div>
                         <div>
                           <label className="text-sm font-medium">Oggetto</label>
                           <Input
                             value={newTicket.subject}
                             onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                             placeholder="Descrivi brevemente il problema"
                           />
                         </div>
                         <div>
                           <label className="text-sm font-medium">Descrizione dettagliata</label>
                           <Textarea
                             value={newTicket.description}
                             onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                             placeholder="Fornisci tutti i dettagli necessari per aiutarci a risolvere il problema"
                             rows={4}
                           />
                         </div>
                          <div className="flex space-x-2">
                            <Button 
                              onClick={createTicket} 
                              disabled={isSubmitting}
                              className="flex-1"
                            >
                              {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                              Crea Ticket
                            </Button>
                            <Button variant="outline" onClick={() => {
                              setIsNewTicketDialogOpen(false);
                              setEditingTicket(null);
                              setNewTicket({
                                category: '',
                                priority: 'medium',
                                subject: '',
                                description: ''
                              });
                            }}>
                              Annulla
                            </Button>
                          </div>
                       </div>
                     </DialogContent>
                   </Dialog>
                 </div>
               </CardHeader>
               <CardContent>
                 <div className="space-y-4">
                   {tickets.length === 0 ? (
                     <div className="text-center py-8">
                       <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                       <h3 className="text-lg font-medium mb-2">Nessun ticket aperto</h3>
                       <p className="text-muted-foreground mb-4">
                         Non hai ancora creato nessun ticket di supporto.
                       </p>
                       <Button 
                         onClick={() => setIsNewTicketDialogOpen(true)}
                         className="bg-primary hover:bg-primary/90"
                       >
                         <Plus className="h-4 w-4 mr-2" />
                         Crea il tuo primo ticket
                       </Button>
                     </div>
                   ) : (
                     <div className="space-y-3">
                        {tickets.map((ticket) => (
                          <Card key={ticket.id} className="border border-gray-200/50 hover:border-primary/20 transition-all duration-200 cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    {getCategoryIcon(ticket.category)}
                                    <h4 className="font-medium">{ticket.subject}</h4>
                                    <Badge 
                                      variant="outline" 
                                      className={`${getStatusColor(ticket.status)} text-white border-0`}
                                    >
                                      {ticket.status === 'open' ? 'Aperto' : 
                                       ticket.status === 'in_progress' ? 'In lavorazione' :
                                       ticket.status === 'resolved' ? 'Risolto' : 'Chiuso'}
                                    </Badge>
                                    <Badge variant="outline" className={`
                                      ${ticket.priority === 'urgent' ? 'bg-red-500 text-white border-0' :
                                        ticket.priority === 'high' ? 'bg-orange-500 text-white border-0' :
                                        ticket.priority === 'medium' ? 'bg-yellow-500 text-white border-0' :
                                        'bg-gray-500 text-white border-0'}
                                    `}>
                                      {ticket.priority === 'urgent' ? 'Urgente' :
                                       ticket.priority === 'high' ? 'Alta' :
                                       ticket.priority === 'medium' ? 'Media' : 'Bassa'}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">{ticket.description}</p>
                                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                    <span className="flex items-center space-x-1">
                                      <Clock className="h-3 w-3" />
                                      <span>Creato {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true, locale: it })}</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                      <span>#{ticket.ticket_number}</span>
                                    </span>
                                  </div>
                                </div>
                                {ticket.status !== 'closed' && (
                                  <div className="flex items-center space-x-2 ml-4" onClick={(e) => e.stopPropagation()}>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                          }}
                                          className="h-8 px-2 bg-red-500 text-white hover:bg-red-600 border-red-500"
                                        >
                                          <XCircle className="h-3 w-3 mr-1" />
                                          Chiudi
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Conferma chiusura ticket</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Sei sicuro di voler chiudere il ticket "{ticket.subject}"?
                                            Questa azione non può essere annullata.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                                           <AlertDialogAction 
                                             className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                             onClick={() => closeTicket(ticket.id, ticket.subject)}
                                           >
                                             Chiudi Ticket
                                           </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                       ))}
                     </div>
                   )}
                 </div>
               </CardContent>
             </Card>
           </TabsContent>
           
           {/* Feature Requests Tab */}
           <TabsContent value="features" className="space-y-6">
        <Card className="bg-gradient-to-br from-sky-50/80 to-blue-50/60 border-sky-200/50 shadow-elegant hover:shadow-glow hover:scale-[1.02] transition-all duration-300 transform-gpu">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5" />
                    <span>Richieste di Funzionalità</span>
                  </CardTitle>
                  <Dialog open={isNewFeatureDialogOpen} onOpenChange={setIsNewFeatureDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nuova funzionalità
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Richiedi Nuova Funzionalità</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Titolo</label>
                          <Input
                            value={newFeatureRequest.title}
                            onChange={(e) => setNewFeatureRequest({ ...newFeatureRequest, title: e.target.value })}
                            placeholder="Titolo della funzionalità"
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-2 block">Categoria</label>
                          <Select value={newFeatureRequest.category} onValueChange={(value) => setNewFeatureRequest({ ...newFeatureRequest, category: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona categoria" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="feature">Nuova Funzionalità</SelectItem>
                              <SelectItem value="improvement">Miglioramento</SelectItem>
                              <SelectItem value="ui">Interfaccia Utente</SelectItem>
                              <SelectItem value="performance">Performance</SelectItem>
                              <SelectItem value="integration">Integrazione</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">Descrizione</label>
                          <Textarea
                            value={newFeatureRequest.description}
                            onChange={(e) => setNewFeatureRequest({ ...newFeatureRequest, description: e.target.value })}
                            placeholder="Descrivi la funzionalità che vorresti vedere implementata"
                            rows={4}
                          />
                        </div>
                        
                        <Button
                          onClick={createFeatureRequest}
                          className="w-full"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Invio in corso...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Invia Richiesta
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {featureRequests.map((request) => (
                    <Card key={request.id} className="bg-gradient-to-br from-teal-50/80 to-cyan-50/60 border-teal-200/50 shadow-elegant hover:shadow-glow hover:scale-[1.02] transition-all duration-300 transform-gpu">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-medium mb-2">{request.title}</h3>
                            <p className="text-muted-foreground text-sm mb-2">
                              {request.description}
                            </p>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{request.category}</Badge>
                              <Badge className={`${getPriorityColor(request.priority)} text-white`}>
                                {request.priority}
                              </Badge>
                              <Badge variant="secondary">{request.status}</Badge>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-center space-y-2">
                            <Button
                              variant={userVotes.includes(request.id) ? "default" : "outline"}
                              size="sm"
                              onClick={() => voteFeatureRequest(request.id)}
                              disabled={userVotes.includes(request.id)}
                              className="flex items-center space-x-1"
                            >
                              <ThumbsUp className="h-3 w-3" />
                              <span>{request.votes}</span>
                            </Button>
                            <span className="text-xs text-muted-foreground">
                              {userVotes.includes(request.id) ? 'votato' : 'voti'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>
                            {formatDistanceToNow(new Date(request.created_at), { 
                              addSuffix: true, 
                              locale: it 
                            })}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedFeatureForComments(request.id);
                              loadFeatureComments(request.id);
                            }}
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Discuti
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {featureRequests.length === 0 && (
                    <div className="text-center py-8">
                      <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Non hai ancora creato nessuna richiesta
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Guide Tab */}
          <TabsContent value="guide" className="space-y-6">
        <Card className="bg-gradient-to-br from-purple-50/80 to-violet-50/60 border-purple-200/50 shadow-elegant hover:shadow-glow hover:scale-[1.02] transition-all duration-300 transform-gpu">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Book className="h-5 w-5" />
                  <span>Guida Utente PetVoice</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Primi Passi */}
                  <Card className="bg-gradient-to-br from-blue-50/80 to-indigo-50/60 border-blue-200/50 shadow-elegant hover:shadow-glow transition-all duration-300 border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-lg">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <span>🚀 Primi Passi</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">1</div>
                        <div>
                          <h4 className="font-medium">Registra il tuo pet</h4>
                          <p className="text-sm text-muted-foreground">
                            Vai su "I Miei Pet" e aggiungi nome, tipo, razza e dettagli del tuo animale
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">2</div>
                        <div>
                          <h4 className="font-medium">Prima analisi</h4>
                          <p className="text-sm text-muted-foreground">
                            Carica un video, audio o foto per la tua prima analisi comportamentale
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">3</div>
                        <div>
                          <h4 className="font-medium">Inizia il diario</h4>
                          <p className="text-sm text-muted-foreground">
                            Registra quotidianamente l'umore e i comportamenti del tuo pet
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Funzioni Principali */}
                  <Card className="bg-gradient-to-br from-emerald-50/80 to-green-50/60 border-emerald-200/50 shadow-elegant hover:shadow-glow transition-all duration-300 border-green-200">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-lg">
                        <Zap className="h-5 w-5 text-green-600" />
                        <span>⚡ Funzioni Principali</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                        <Camera className="h-4 w-4 text-green-600" />
                        <div className="text-sm">
                          <span className="font-medium">Analisi AI:</span> Carica file per analisi comportamentali
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <div className="text-sm">
                          <span className="font-medium">Calendario:</span> Programma visite e attività
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-2 bg-purple-50 rounded-lg">
                        <FileText className="h-4 w-4 text-purple-600" />
                        <div className="text-sm">
                          <span className="font-medium">Diario:</span> Traccia giornalmente comportamenti e umore
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-2 bg-orange-50 rounded-lg">
                        <BarChart3 className="h-4 w-4 text-orange-600" />
                        <div className="text-sm">
                          <span className="font-medium">Wellness:</span> Monitora la salute e il benessere
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Suggerimenti */}
                  <Card className="bg-gradient-to-br from-sky-50/80 to-blue-50/60 border-sky-200/50 shadow-elegant hover:shadow-glow transition-all duration-300 border-blue-200">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-lg">
                        <Lightbulb className="h-5 w-5 text-blue-600" />
                        <span>💡 Suggerimenti</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <p className="text-sm text-muted-foreground">
                          <strong>File di qualità:</strong> Usa video/audio chiari per analisi più precise
                        </p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <p className="text-sm text-muted-foreground">
                          <strong>Consistenza:</strong> Aggiorna il diario quotidianamente per trend migliori
                        </p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <p className="text-sm text-muted-foreground">
                          <strong>Analisi regolari:</strong> Carica contenuti regolarmente per monitoraggi migliori
                        </p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <p className="text-sm text-muted-foreground">
                          <strong>Backup:</strong> I tuoi dati sono al sicuro nel cloud
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Risoluzione Problemi */}
                  <Card className="bg-gradient-to-br from-red-50/80 to-rose-50/60 border-red-200/50 shadow-elegant hover:shadow-glow transition-all duration-300 border-red-200">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-lg">
                        <Shield className="h-5 w-5 text-red-600" />
                        <span>🛠️ Risoluzione Problemi</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">Upload non funziona?</h5>
                        <p className="text-xs text-muted-foreground">
                          Verifica connessione internet e dimensione file (max 100MB)
                        </p>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">Analisi imprecisa?</h5>
                        <p className="text-xs text-muted-foreground">
                          Usa video di almeno 10 secondi con buona illuminazione
                        </p>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">Non vedi i dati?</h5>
                        <p className="text-xs text-muted-foreground">
                          Aggiorna la pagina o contatta il supporto se il problema persiste
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full mt-3"
                        onClick={() => {
                          setActiveTab('tickets');
                          setIsNewTicketDialogOpen(true);
                        }}
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Contatta Supporto
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Formati Supportati */}
                  <Card className="bg-gradient-to-br from-amber-50/80 to-yellow-50/60 border-amber-200/50 shadow-elegant hover:shadow-glow transition-all duration-300 md:col-span-2 border-yellow-200">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-lg">
                        <FileText className="h-5 w-5 text-yellow-600" />
                        <span>📁 Formati Supportati & Limiti</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <h5 className="font-medium flex items-center space-x-2">
                            <PlayCircle className="h-4 w-4" />
                            <span>Video</span>
                          </h5>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>• MP4, MOV, AVI</p>
                            <p>• Max 100MB</p>
                            <p>• Durata: 5sec - 5min</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h5 className="font-medium flex items-center space-x-2">
                            <Mic className="h-4 w-4" />
                            <span>Audio</span>
                          </h5>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>• MP3, WAV, M4A</p>
                            <p>• Max 50MB</p>
                            <p>• Durata: 3sec - 10min</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h5 className="font-medium flex items-center space-x-2">
                            <Camera className="h-4 w-4" />
                            <span>Immagini</span>
                          </h5>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>• JPG, PNG, HEIC</p>
                            <p>• Max 10MB</p>
                            <p>• Min 800x600px</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Guide Tab */}
          <TabsContent value="guide" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quick Start */}
              <Card className="bg-gradient-to-br from-violet-50/80 to-purple-50/60 border-violet-200/50 shadow-elegant hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5" />
                    <span>Inizia Subito</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">1. Configura il Profilo</h4>
                    <p className="text-sm text-muted-foreground">
                      Aggiungi i tuoi pet e completa le informazioni di base per iniziare
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">2. Primo Diario</h4>
                    <p className="text-sm text-muted-foreground">
                      Registra le prime osservazioni comportamentali per creare una baseline
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">3. Analisi AI</h4>
                    <p className="text-sm text-muted-foreground">
                      Carica foto, video o audio per ottenere insights comportamentali
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Features Overview */}
              <Card className="bg-gradient-to-br from-sky-50/80 to-blue-50/60 border-sky-200/50 shadow-elegant hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5" />
                    <span>Funzionalità Principali</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">📊 Dashboard Intelligente</h4>
                    <p className="text-sm text-muted-foreground">
                      Monitora il benessere dei tuoi pet con grafici e metriche avanzate
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">🎯 Protocolli di Addestramento</h4>
                    <p className="text-sm text-muted-foreground">
                      Piani personalizzati generati dall'AI per problemi comportamentali
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">🏥 Valutazione Rischi</h4>
                    <p className="text-sm text-muted-foreground">
                      Sistema di early warning per identificare problemi di salute
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Features */}
              <Card className="bg-gradient-to-br from-emerald-50/80 to-green-50/60 border-emerald-200/50 shadow-elegant hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5" />
                    <span>Funzioni Avanzate</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">🔬 Analisi Predittiva</h4>
                    <p className="text-sm text-muted-foreground">
                      L'AI prevede comportamenti futuri basandosi sui pattern storici
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">📱 Integrazione Wearable</h4>
                    <p className="text-sm text-muted-foreground">
                      Sincronizza dati da dispositivi IoT e collari smart
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">👥 Community Insights</h4>
                    <p className="text-sm text-muted-foreground">
                      Confronta i progressi con altri pet simili in modo anonimo
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Support */}
              <Card className="bg-gradient-to-br from-orange-50/80 to-amber-50/60 border-orange-200/50 shadow-elegant hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Headphones className="h-5 w-5" />
                    <span>Supporto</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">📞 Contatti di Emergenza</h4>
                    <p className="text-sm text-muted-foreground">
                      Disponibile nella sezione Benessere - Emergenze per consultazioni rapide
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full mt-3"
                    onClick={() => {
                      setActiveTab('contact');
                    }}
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Contatta Supporto
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-6">
            <div className="flex justify-center">
              {/* Contact Methods */}
              <Card className="bg-gradient-to-br from-purple-50/80 to-violet-50/60 border-purple-200/50 shadow-elegant hover:shadow-glow hover:scale-[1.02] transition-all duration-300 transform-gpu w-full max-w-2xl">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center space-x-2">
                    <Headphones className="h-5 w-5" />
                    <span>Contatti Diretti</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center space-y-4 p-6 bg-muted/50 rounded-lg">
                    <Mail className="h-8 w-8 text-primary" />
                    <div className="text-center">
                      <p className="font-medium text-lg">Email</p>
                      <p className="text-sm text-muted-foreground">
                        petvoice2025@gmail.com
                      </p>
                    </div>
                    <Button size="lg" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Invia Email
                    </Button>
                  </div>
                  
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>

        {/* Chatbot Modal */}
        {showChatbot && (
          <Dialog open={showChatbot} onOpenChange={setShowChatbot}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Bot className="h-5 w-5" />
                  <span>Assistente Virtuale</span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <ScrollArea className="h-80 w-full border rounded-lg p-4">
                  <div className="space-y-4">
                    {chatMessages.length === 0 && (
                      <div className="text-center text-muted-foreground">
                        <Bot className="h-8 w-8 mx-auto mb-2" />
                        <p>Ciao! Come posso aiutarti oggi?</p>
                      </div>
                    )}
                    
                    {chatMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs p-3 rounded-lg ${
                            message.sender === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-muted p-3 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200"></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                <div className="flex space-x-2">
                  <Input
                    placeholder="Scrivi il tuo messaggio..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                  />
                  <Button onClick={handleChatSubmit} disabled={!chatInput.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Comments Dialog */}
        <Dialog open={!!selectedFeatureForComments} onOpenChange={() => setSelectedFeatureForComments(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Discussione: {featureRequests.find(r => r.id === selectedFeatureForComments)?.title}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Existing Comments */}
              <div className="space-y-3">
                {selectedFeatureForComments && featureComments[selectedFeatureForComments]?.map((comment) => (
                  <Card key={comment.id} className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium">Utente</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { 
                          addSuffix: true, 
                          locale: it 
                        })}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </Card>
                ))}
                
                {selectedFeatureForComments && (!featureComments[selectedFeatureForComments] || featureComments[selectedFeatureForComments].length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nessun commento ancora. Inizia la discussione!</p>
                  </div>
                )}
              </div>
              
              {/* Add Comment */}
              <div className="border-t pt-4">
                <Textarea
                  placeholder="Scrivi un commento..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="mb-3"
                />
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setSelectedFeatureForComments(null)}>
                    Chiudi
                  </Button>
                  <Button 
                    onClick={() => addFeatureComment()}
                    disabled={!newComment.trim()}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Pubblica Commento
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* User Guide Modal */}
        <Dialog open={isUserGuideDialogOpen} onOpenChange={setIsUserGuideDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Book className="h-5 w-5" />
                <span>Guida Utente PetVoice</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Primi Passi */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span>🚀 Primi Passi</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">1</div>
                    <div>
                      <h4 className="font-medium">Registra il tuo pet</h4>
                      <p className="text-sm text-muted-foreground">
                        Vai su "I Miei Pet" e aggiungi nome, tipo, razza e dettagli del tuo animale
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">2</div>
                    <div>
                      <h4 className="font-medium">Prima analisi</h4>
                      <p className="text-sm text-muted-foreground">
                        Carica un video, audio o foto per la tua prima analisi comportamentale
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">3</div>
                    <div>
                      <h4 className="font-medium">Inizia il diario</h4>
                      <p className="text-sm text-muted-foreground">
                        Registra quotidianamente l'umore e i comportamenti del tuo pet
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Funzioni Principali */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Zap className="h-5 w-5 text-green-600" />
                    <span>⚡ Funzioni Principali</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                    <Camera className="h-4 w-4 text-green-600" />
                    <div className="text-sm">
                      <span className="font-medium">Analisi AI:</span> Carica file per analisi comportamentali avanzate
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <div className="text-sm">
                      <span className="font-medium">Calendario Intelligente:</span> Programma automaticamente visite e attività
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-purple-50 rounded-lg">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <div className="text-sm">
                      <span className="font-medium">Diario Avanzato:</span> Traccia comportamenti con insights AI
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-orange-50 rounded-lg">
                    <BarChart3 className="h-4 w-4 text-orange-600" />
                    <div className="text-sm">
                      <span className="font-medium">Analytics Predittivi:</span> Monitora salute con previsioni AI
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-red-50 rounded-lg">
                    <Heart className="h-4 w-4 text-red-600" />
                    <div className="text-sm">
                      <span className="font-medium">Primo Soccorso:</span> Guida di emergenza veterinaria completa
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-teal-50 rounded-lg">
                    <Users className="h-4 w-4 text-teal-600" />
                    <div className="text-sm">
                      <span className="font-medium">Community:</span> Chat con altri proprietari e esperti
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-indigo-50 rounded-lg">
                    <Music className="h-4 w-4 text-indigo-600" />
                    <div className="text-sm">
                      <span className="font-medium">Musicoterapia AI:</span> Brani personalizzati per il benessere
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Suggerimenti */}
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                    <span>💡 Suggerimenti</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p className="text-sm text-muted-foreground">
                      <strong>File di qualità:</strong> Usa video/audio chiari per analisi più precise
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p className="text-sm text-muted-foreground">
                      <strong>Consistenza:</strong> Aggiorna il diario quotidianamente per trend migliori
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p className="text-sm text-muted-foreground">
                      <strong>Parametri Vitali:</strong> Registra temperatura, respirazione e battito per valutazioni accurate
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p className="text-sm text-muted-foreground">
                      <strong>Analytics Reali:</strong> I grafici si aggiornano automaticamente con i tuoi dati
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p className="text-sm text-muted-foreground">
                      <strong>Emergenze:</strong> Consulta sempre la guida di primo soccorso per valori critici
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Risoluzione Problemi */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Shield className="h-5 w-5 text-red-600" />
                    <span>🛠️ Risoluzione Problemi</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Upload non funziona?</h5>
                    <p className="text-xs text-muted-foreground">
                      Verifica connessione internet e dimensione file (max 100MB)
                    </p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Parametri vitali critici?</h5>
                    <p className="text-xs text-muted-foreground">
                      Se vedi valori anomali (es. respirazione 5), consulta immediatamente il veterinario
                    </p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Analytics non mostra dati?</h5>
                    <p className="text-xs text-muted-foreground">
                      Aggiungi più metriche di salute e visite mediche per vedere i grafici
                    </p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Guida primo soccorso?</h5>
                    <p className="text-xs text-muted-foreground">
                      Disponibile nella sezione Benessere - Emergenze per consultazioni rapide
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full mt-3"
                    onClick={() => {
                      setIsUserGuideDialogOpen(false);
                      setActiveTab('tickets');
                      setIsNewTicketDialogOpen(true);
                    }}
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Contatta Supporto
                  </Button>
                </CardContent>
              </Card>

              {/* Funzionalità AI Avanzate */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Award className="h-5 w-5 text-green-600" />
                    <span>🤖 Funzionalità AI Avanzate</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                    <Bot className="h-4 w-4 text-green-600" />
                    <div className="text-sm">
                      <span className="font-medium">Analisi Comportamentale:</span> AI avanzata per interpretare video, audio e foto
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                    <Music className="h-4 w-4 text-blue-600" />
                    <div className="text-sm">
                      <span className="font-medium">Musicoterapia AI:</span> Brani personalizzati basati sull'umore del pet
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-purple-50 rounded-lg">
                    <BookOpen className="h-4 w-4 text-purple-600" />
                    <div className="text-sm">
                      <span className="font-medium">Protocolli Training:</span> Addestramento personalizzato generato da AI
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-orange-50 rounded-lg">
                    <MessageCircle className="h-4 w-4 text-orange-600" />
                    <div className="text-sm">
                      <span className="font-medium">Chat AI Live:</span> Assistenza 24/7 con intelligenza artificiale
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-red-50 rounded-lg">
                    <BarChart3 className="h-4 w-4 text-red-600" />
                    <div className="text-sm">
                      <span className="font-medium">Analytics Predittivi:</span> Previsioni sulla salute e comportamento
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Community */}
              <Card className="border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Users className="h-5 w-5 text-purple-600" />
                    <span>👥 Community</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3 p-2 bg-purple-50 rounded-lg">
                    <MessageSquare className="h-4 w-4 text-purple-600" />
                    <div className="text-sm">
                      <span className="font-medium">Chat Globale:</span> Connettiti con altri proprietari di animali
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-purple-50 rounded-lg">
                    <Globe className="h-4 w-4 text-purple-600" />
                    <div className="text-sm">
                      <span className="font-medium">Canali per Paese:</span> Discussioni locali e informazioni
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-purple-50 rounded-lg">
                    <Target className="h-4 w-4 text-purple-600" />
                    <div className="text-sm">
                      <span className="font-medium">Gruppi Specifici:</span> Canali per tipo di animale e razza
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 mt-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <p className="text-sm text-muted-foreground">
                      <strong>Messaggi:</strong> Testo, emoji, file e messaggi vocali
                    </p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <p className="text-sm text-muted-foreground">
                      <strong>Emergenze:</strong> Segnala situazioni di urgenza per aiuto immediato
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Formati Supportati */}
              <Card className="md:col-span-2 border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <FileText className="h-5 w-5 text-yellow-600" />
                    <span>📁 Formati Supportati & Limiti</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <VideoIcon className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                      <h6 className="font-medium text-sm">Video</h6>
                      <p className="text-xs text-muted-foreground">
                        MP4, MOV, AVI<br />
                        Max 100MB, 10min
                      </p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <Mic className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                      <h6 className="font-medium text-sm">Audio</h6>
                      <p className="text-xs text-muted-foreground">
                        MP3, WAV, M4A<br />
                        Max 50MB, 15min
                      </p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <Camera className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                      <h6 className="font-medium text-sm">Immagini</h6>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG, HEIC<br />
                        Max 20MB, alta risoluzione
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
            </div>
          </DialogContent>
        </Dialog>

        {/* Ticket Details Modal */}
        <Dialog open={!!selectedTicket} onOpenChange={(open) => {
          if (open && selectedTicket) {
            loadTicketReplies(selectedTicket.id);
          }
          if (!open) {
            setSelectedTicket(null);
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Ticket className="h-5 w-5" />
                <span>Dettagli Ticket #{selectedTicket?.ticket_number}</span>
              </DialogTitle>
            </DialogHeader>
            
            {selectedTicket && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Stato</label>
                    <div className="mt-1">
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(selectedTicket.status)} text-white border-0`}
                      >
                        {selectedTicket.status === 'open' ? 'Aperto' : 
                         selectedTicket.status === 'in_progress' ? 'In lavorazione' :
                         selectedTicket.status === 'resolved' ? 'Risolto' : 'Chiuso'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Priorità</label>
                    <div className="mt-1">
                      <Badge variant="outline" className={`
                        ${selectedTicket.priority === 'urgent' ? 'bg-red-500 text-white border-0' :
                          selectedTicket.priority === 'high' ? 'bg-orange-500 text-white border-0' :
                          selectedTicket.priority === 'medium' ? 'bg-yellow-500 text-white border-0' :
                          'bg-gray-500 text-white border-0'}
                      `}>
                        {selectedTicket.priority === 'urgent' ? 'Urgente' :
                         selectedTicket.priority === 'high' ? 'Alta' :
                         selectedTicket.priority === 'medium' ? 'Media' : 'Bassa'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Categoria</label>
                    <div className="mt-1 flex items-center space-x-2">
                      {getCategoryIcon(selectedTicket.category)}
                      <span className="text-sm">
                        {selectedTicket.category === 'technical' ? 'Problemi Tecnici' :
                         selectedTicket.category === 'billing' ? 'Fatturazione' :
                         selectedTicket.category === 'medical' ? 'Medico/Veterinario' : 'Generale'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Creato</label>
                    <p className="text-sm mt-1">
                      {formatDistanceToNow(new Date(selectedTicket.created_at), { addSuffix: true, locale: it })}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Oggetto</label>
                  <h3 className="text-lg font-medium mt-1">{selectedTicket.subject}</h3>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Descrizione</label>
                  <div className="mt-1 p-4 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedTicket.description}</p>
                  </div>
                </div>
                    
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3 flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>Cronologia Conversazione</span>
                  </h4>
                  <div className="space-y-3">
                    {/* Risposte dal database - più recenti in alto */}
                    {selectedTicket && ticketReplies[selectedTicket.id]?.map((reply) => (
                      <Card key={reply.id} className={reply.is_staff_reply ? "p-3 bg-green-50" : "p-3 bg-blue-50"}>
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                            reply.is_staff_reply ? 'bg-green-500' : 'bg-blue-500'
                          }`}>
                            {reply.is_staff_reply ? 'ST' : 'Tu'}
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium text-sm ${reply.is_staff_reply ? 'text-green-900' : 'text-blue-900'}`}>
                              {reply.is_staff_reply ? 'Team di Supporto' : 'La tua risposta'}
                            </p>
                            <p className={`text-sm mt-1 whitespace-pre-wrap ${reply.is_staff_reply ? 'text-green-700' : 'text-blue-700'}`}>
                              {reply.content}
                            </p>
                            <p className={`text-xs mt-2 ${reply.is_staff_reply ? 'text-green-600' : 'text-blue-600'}`}>
                              {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true, locale: it })}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                    
                    {/* Messaggio iniziale dell'utente - sempre in fondo */}
                    <Card className="p-3 bg-blue-50">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          Tu
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-blue-900">La tua richiesta</p>
                          <p className="text-sm text-blue-700 mt-1">{selectedTicket.description}</p>
                          <p className="text-xs text-blue-600 mt-2">
                            {formatDistanceToNow(new Date(selectedTicket.created_at), { addSuffix: true, locale: it })}
                          </p>
                        </div>
                      </div>
                    </Card>
                    {selectedTicket.status === 'open' ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>In attesa di risposta dal supporto...</p>
                        <p className="text-xs mt-2">Riceverai una notifica appena il team risponderà</p>
                      </div>
                    ) : selectedTicket.status === 'in_progress' ? (
                      <Card className="p-3 bg-blue-50">
                        <div className="flex items-start space-x-3">
                          <UserCheck className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm text-blue-900">Team di Supporto</p>
                            <p className="text-sm text-blue-700 mt-1">
                              Abbiamo preso in carico il tuo ticket e stiamo lavorando per risolvere il problema. 
                              Ti contatteremo presto con un aggiornamento.
                            </p>
                            <p className="text-xs text-blue-600 mt-2">
                              {formatDistanceToNow(new Date(selectedTicket.updated_at), { addSuffix: true, locale: it })}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ) : selectedTicket.status === 'resolved' ? (
                      <Card className="p-3 bg-green-50">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm text-green-900">Team di Supporto</p>
                            <p className="text-sm text-green-700 mt-1">
                              Il problema è stato risolto! Se hai bisogno di ulteriore assistenza, 
                              non esitare a creare un nuovo ticket.
                            </p>
                            <p className="text-xs text-green-600 mt-2">
                              Risolto {formatDistanceToNow(new Date(selectedTicket.updated_at), { addSuffix: true, locale: it })}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ) : (
                      <Card className="p-3 bg-gray-50">
                        <div className="flex items-start space-x-3">
                          <XCircle className="h-5 w-5 text-gray-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm text-gray-900">Ticket Chiuso</p>
                            <p className="text-sm text-gray-700 mt-1">
                              Questo ticket è stato chiuso. Se hai bisogno di ulteriore assistenza, 
                              crea un nuovo ticket di supporto.
                            </p>
                            <p className="text-xs text-gray-600 mt-2">
                              Chiuso {formatDistanceToNow(new Date(selectedTicket.updated_at), { addSuffix: true, locale: it })}
                            </p>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>

                {selectedTicket.status !== 'closed' && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Aggiungi una risposta</h4>
                    <Textarea
                      placeholder="Scrivi la tua risposta o aggiungi dettagli..."
                      value={ticketReply}
                      onChange={(e) => setTicketReply(e.target.value)}
                      rows={3}
                      className="mb-3"
                    />
                    <Button 
                      onClick={() => {
                        if (ticketReply.trim() && selectedTicket) {
                          addTicketReply(selectedTicket.id, ticketReply);
                        }
                      }}
                      disabled={!ticketReply.trim()}
                      size="sm"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Invia Risposta
                    </Button>
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t">
                  <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                    Chiudi
                  </Button>
                  {selectedTicket.status !== 'closed' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <XCircle className="h-4 w-4 mr-2" />
                          Chiudi Ticket
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Conferma chiusura ticket</AlertDialogTitle>
                          <AlertDialogDescription>
                            Sei sicuro di voler chiudere il ticket "{selectedTicket.subject}"?
                            Questa azione non può essere annullata.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                              closeTicket(selectedTicket.id, selectedTicket.subject);
                              setSelectedTicket(null);
                            }}
                          >
                            Chiudi Ticket
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        
        {/* AI Live Chat */}
        <AILiveChatButton />
      </div>
    );
};

export default SupportPage;