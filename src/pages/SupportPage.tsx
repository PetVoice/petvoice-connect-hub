import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, 
  Ticket, 
  Book, 
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
  PlayCircle,
  Pause
} from 'lucide-react';
import { AILiveChatButton } from '@/components/AILiveChat';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
  const [newFeatureRequest, setNewFeatureRequest] = useState({
    title: '',
    description: '',
    category: 'feature',
    tags: []
  });
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  // Carica i dati iniziali
  useEffect(() => {
    loadSupportData();
  }, []);

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
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Errore",
          description: "Devi essere autenticato per creare un ticket",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from('support_tickets')
        .insert({
          category: newTicket.category,
          priority: newTicket.priority,
          subject: newTicket.subject,
          description: newTicket.description,
          ticket_number: '', // Verrà generato automaticamente dal trigger
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Ticket creato",
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
      toast({
        title: "Errore",
        description: "Impossibile creare il ticket. Riprova più tardi.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const createFeatureRequest = async () => {
    if (!newFeatureRequest.title || !newFeatureRequest.description) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Errore",
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

      toast({
        title: "Richiesta inviata",
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
      toast({
        title: "Errore",
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

      toast({
        title: isHelpful ? "Grazie per il feedback!" : "Grazie per il feedback",
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
        toast({
          title: "Errore",
          description: "Devi essere autenticato per votare",
          variant: "destructive"
        });
        return;
      }

      // Verifica se l'utente ha già votato
      if (userVotes.includes(requestId)) {
        toast({
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

      toast({
        title: "Voto aggiunto",
        description: "Grazie per aver votato questa richiesta di funzionalità!"
      });
    } catch (error) {
      console.error('Error voting feature request:', error);
      toast({
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
        toast({
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
      
      toast({
        title: "Commento aggiunto",
        description: "Il tuo commento è stato pubblicato!"
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
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
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Caricamento supporto...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Centro di Supporto PetVoice
          </h1>
          <p className="text-muted-foreground">
            Ottieni aiuto, trova risposte e resta aggiornato sulle novità
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer" 
            onClick={() => setShowChatbot(true)}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Chat Live</p>
                  <p className="text-sm text-muted-foreground">Assistenza immediata</p>
                </div>
              </div>
            </CardContent>
          </Card>


          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setIsUserGuideDialogOpen(true)}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Book className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Guida Utente</p>
                  <p className="text-sm text-muted-foreground">Documentazione</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="features">Richieste</TabsTrigger>
            <TabsTrigger value="contact">Contatti</TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HelpCircle className="h-5 w-5" />
                  <span>Domande Frequenti</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Search and Filter */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Cerca nelle FAQ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tutte le categorie</SelectItem>
                        <SelectItem value="technical">Tecnico</SelectItem>
                        <SelectItem value="billing">Fatturazione</SelectItem>
                        <SelectItem value="medical">Medico</SelectItem>
                        <SelectItem value="general">Generale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* FAQ List */}
                  <div className="space-y-4">
                    {filteredFAQs.map((faq) => (
                      <Card key={faq.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium text-lg">{faq.question}</h3>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary">{faq.category}</Badge>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Eye className="h-3 w-3 mr-1" />
                                {faq.view_count}
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-muted-foreground mb-4">{faq.answer}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {faq.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground">Utile?</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markFAQHelpful(faq.id, true)}
                                className="h-8 w-8 p-0"
                              >
                                <ThumbsUp className="h-4 w-4" />
                              </Button>
                              <span className="text-sm text-muted-foreground">
                                {faq.helpful_count}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markFAQHelpful(faq.id, false)}
                                className="h-8 w-8 p-0"
                              >
                                <ThumbsDown className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredFAQs.length === 0 && (
                    <div className="text-center py-8">
                      <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Nessuna FAQ trovata per la tua ricerca
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>



          {/* Feature Requests Tab */}
          <TabsContent value="features" className="space-y-6">
            <Card>
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
                    <Card key={request.id} className="hover:shadow-md transition-shadow">
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Book className="h-5 w-5" />
                  <span>Guida Utente PetVoice</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                  <Card className="md:col-span-2 border-yellow-200">
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

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Methods */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Headphones className="h-5 w-5" />
                    <span>Contatti Diretti</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Chat Live</p>
                      <p className="text-sm text-muted-foreground">
                        Disponibile 24/7 per assistenza immediata
                      </p>
                    </div>
                    <Button size="sm" onClick={() => setShowChatbot(true)}>
                      Avvia Chat
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">
                        support@petvoice.com
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Invia Email
                    </Button>
                  </div>
                  
                </CardContent>
              </Card>

              {/* Support Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Orari di Supporto</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Lunedì - Venerdì</span>
                      <span className="text-muted-foreground">9:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Sabato</span>
                      <span className="text-muted-foreground">10:00 - 16:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Domenica</span>
                      <span className="text-muted-foreground">Chiuso</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
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
                      <span className="font-medium">Wellness:</span> Monitora salute con parametri vitali
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-red-50 rounded-lg">
                    <Heart className="h-4 w-4 text-red-600" />
                    <div className="text-sm">
                      <span className="font-medium">Primo Soccorso:</span> Guida di emergenza veterinaria
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-teal-50 rounded-lg">
                    <Users className="h-4 w-4 text-teal-600" />
                    <div className="text-sm">
                      <span className="font-medium">Community:</span> Chat con altri proprietari di pet
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

              {/* Programma Affiliazione */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Award className="h-5 w-5 text-green-600" />
                    <span>🤝 Programma Affiliazione</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
                    <div>
                      <h4 className="font-medium">Guadagna commissioni</h4>
                      <p className="text-sm text-muted-foreground">
                        Ricevi crediti per ogni amico che si abbona al servizio
                      </p>
                    </div>
                  </div>
                  
                  {/* Tier System */}
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <h5 className="font-medium text-sm mb-2">Sistema a Livelli:</h5>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>🥉 Bronzo (0-4 conversioni):</span>
                        <span className="font-medium">5% commissione</span>
                      </div>
                      <div className="flex justify-between">
                        <span>🥈 Argento (5-9 conversioni):</span>
                        <span className="font-medium">10% commissione</span>
                      </div>
                      <div className="flex justify-between">
                        <span>🥇 Oro (10-19 conversioni):</span>
                        <span className="font-medium">15% commissione</span>
                      </div>
                      <div className="flex justify-between">
                        <span>💎 Platino (20+ conversioni):</span>
                        <span className="font-medium">20% commissione</span>
                      </div>
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
      </div>
      
      {/* AI Live Chat */}
      <AILiveChatButton />
    </Layout>
  );
};

export default SupportPage;