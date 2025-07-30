import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Ticket, 
  Book, 
  Search, 
  Star, 
  Mail, 
  Plus, 
  ThumbsUp, 
  ThumbsDown,
  Headphones,
  Bot,
  ExternalLink,
  HelpCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { AILiveChatButton } from '@/components/AILiveChat';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedToast } from '@/hooks/use-unified-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { SupportTicketList } from '@/components/support/SupportTicketList';
import { SupportTicketDetails } from '@/components/support/SupportTicketDetails';
import { TicketCloseConfirmModal } from '@/components/support/TicketCloseConfirmModal';
import PlatformGuideModal from '@/components/support/PlatformGuideModal';

interface SupportTicket {
  id: string;
  ticket_number: string;
  category: string;
  priority: string;
  subject: string;
  description: string;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  unread_count?: number; // Aggiungiamo il conteggio dei messaggi non letti
  profiles?: {
    display_name: string;
    email: string;
  } | null;
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

const SupportPage: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
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
  const [activeTab, setActiveTab] = useState('tickets');
  const [isNewTicketDialogOpen, setIsNewTicketDialogOpen] = useState(false);
  const [isNewFeatureDialogOpen, setIsNewFeatureDialogOpen] = useState(false);
  const [newFeatureRequest, setNewFeatureRequest] = useState({
    title: '',
    description: '',
    category: 'feature',
    tags: []
  });
  const [editingFeatureRequest, setEditingFeatureRequest] = useState<FeatureRequest | null>(null);
  const [isEditFeatureDialogOpen, setIsEditFeatureDialogOpen] = useState(false);
  const [featureToDelete, setFeatureToDelete] = useState<FeatureRequest | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);
  const [ticketToClose, setTicketToClose] = useState<SupportTicket | null>(null);
  const [isClosingTicket, setIsClosingTicket] = useState(false);
  const [isPlatformGuideOpen, setIsPlatformGuideOpen] = useState(false);
  const { showSuccessToast, showErrorToast } = useUnifiedToast();
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();

  // Carica i dati iniziali e setup realtime
  useEffect(() => {
    console.log('🚀 useEffect triggered, user:', user);
    if (user?.id) {
      console.log('✅ User found, loading support data for:', user.id);
      loadSupportData();
      const cleanup = setupTicketsRealtimeSubscription();
      
      // Cleanup quando il componente viene smontato
      return cleanup;
    } else {
      console.log('❌ No user found, cannot load support data');
    }
  }, [user?.id]);

  const setupTicketsRealtimeSubscription = () => {
    console.log('🔔 Setting up realtime subscription for tickets');
    
    const channel = supabase
      .channel('tickets-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'support_tickets'
        },
        (payload) => {
          console.log('🔄 Ticket updated in realtime:', payload.new);
          const updatedTicket = payload.new as SupportTicket;
          
          // Aggiorna la lista dei ticket
          setTickets(prev => 
            prev.map(ticket => 
              ticket.id === updatedTicket.id ? { ...ticket, ...updatedTicket } : ticket
            )
          );
          
          // Se il ticket aggiornato è quello attualmente selezionato, aggiornalo anche
          if (selectedTicket && selectedTicket.id === updatedTicket.id) {
            setSelectedTicket({ ...selectedTicket, ...updatedTicket });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_tickets'
        },
        (payload) => {
          console.log('➕ New ticket created in realtime:', payload.new);
          const newTicket = payload.new as SupportTicket;
          // Per i nuovi ticket, non impostare unread_count (sarà undefined = non mostrato)
          setTickets(prev => [newTicket, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_ticket_unread_counts'
        },
         (payload) => {
           console.log('🔔 Unread count updated in realtime:', payload);
           if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
             const unreadData = payload.new;
             // Solo aggiorna se l'unread count è per l'utente corrente
             if (unreadData.user_id === user?.id) {
               setTickets(prev => 
                 prev.map(ticket => 
                   ticket.id === unreadData.ticket_id 
                     ? { ...ticket, unread_count: unreadData.unread_count > 0 ? unreadData.unread_count : undefined }
                     : ticket
                 )
               );
             }
           }
         }
      )
      .subscribe();

    return () => {
      console.log('🔌 Cleaning up tickets realtime subscription');
      supabase.removeChannel(channel);
    };
  };

  const loadSupportData = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Loading tickets for user:', user?.id);
      
      // Carica tickets senza join - faremo query separate per i profili
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      // Carica separatamente gli unread counts per l'utente corrente
      const { data: unreadCounts, error: unreadError } = await supabase
        .from('support_ticket_unread_counts')
        .select('ticket_id, unread_count')
        .eq('user_id', user?.id);

      console.log('📊 Tickets query result:', { ticketsData, ticketsError });
      console.log('🔔 Unread counts query result:', { unreadCounts, unreadError });

      if (ticketsError) {
        console.error('Error loading tickets:', ticketsError);
      } else if (unreadError) {
        console.error('Error loading unread counts:', unreadError);
      } else {
        console.log('✅ Tickets loaded:', ticketsData?.length, 'tickets');
        
        // Crea una mappa degli unread counts per ticket_id (solo per count > 0)
        const unreadMap = (unreadCounts || []).reduce((acc, count) => {
          if (count.unread_count > 0) {
            acc[count.ticket_id] = count.unread_count;
          }
          return acc;
        }, {} as { [key: string]: number });
        
        // Ottieni i user IDs unici dai ticket per caricare i profili
        const userIds = [...new Set((ticketsData || []).map(ticket => ticket.user_id))];
        
        // Carica i profili per tutti gli utenti che hanno ticket
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, display_name, email')
          .in('user_id', userIds);
        
        // Crea una mappa dei profili per user_id
        const profilesMap = (profilesData || []).reduce((acc, profile) => {
          acc[profile.user_id] = profile;
          return acc;
        }, {} as { [key: string]: { user_id: string; display_name: string; email: string } });
        
        // Trasforma i dati per includere unread_count e profile info
        const ticketsWithData = (ticketsData || []).map(ticket => ({
          id: ticket.id,
          ticket_number: ticket.ticket_number,
          category: ticket.category,
          priority: ticket.priority,
          subject: ticket.subject,
          description: ticket.description,
          status: ticket.status,
          user_id: ticket.user_id,
          created_at: ticket.created_at,
          updated_at: ticket.updated_at,
          unread_count: unreadMap[ticket.id], // undefined se non presente, che è falsy
          profiles: profilesMap[ticket.user_id] ? {
            display_name: profilesMap[ticket.user_id].display_name,
            email: profilesMap[ticket.user_id].email
          } : null
        }));
        
        setTickets(ticketsWithData);
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

      // Feature requests e voti non più disponibili dopo pulizia database

    } catch (error) {
      console.error('Error loading support data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async () => {
    if (!newTicket.subject || !newTicket.description || !newTicket.category) {
      showErrorToast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (!user) {
        showErrorToast({
          title: "Errore",
          description: "Devi essere autenticato per creare un ticket"
        });
        setIsSubmitting(false);
        return;
      }

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

      if (error) {
        console.error('Detailed error:', error);
        throw error;
      }

      showSuccessToast({
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
      showErrorToast({
        title: "Errore",
        description: "Impossibile creare il ticket. Riprova più tardi."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const createFeatureRequest = async () => {
    if (!newFeatureRequest.title || !newFeatureRequest.description) {
      showErrorToast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (!user) {
        showErrorToast({
          title: "Errore", 
          description: "Devi essere autenticato per creare una richiesta"
        });
        setIsSubmitting(false);
        return;
      }

      const { data, error } = await supabase
        .from('support_feature_requests')
        .insert({
          title: newFeatureRequest.title,
          description: newFeatureRequest.description,
          category: newFeatureRequest.category,
          user_id: user.id,
          status: 'open',
          votes: 0
        });

      if (error) {
        console.error('Detailed error:', error);
        throw error;
      }

      showSuccessToast({
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
      
      // Ricarica le feature requests
      loadSupportData();
    } catch (error) {
      console.error('Error creating feature request:', error);
      showErrorToast({
        title: "Errore",
        description: "Impossibile inviare la richiesta. Riprova più tardi."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const editFeatureRequest = async () => {
    if (!editingFeatureRequest?.title || !editingFeatureRequest?.description) {
      showErrorToast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('support_feature_requests')
        .update({
          title: editingFeatureRequest.title,
          description: editingFeatureRequest.description,
        })
        .eq('id', editingFeatureRequest.id);

      if (error) {
        console.error('Error updating feature request:', error);
        throw error;
      }

      showSuccessToast({
        title: "Richiesta aggiornata",
        description: "La richiesta di funzionalità è stata aggiornata con successo."
      });

      setEditingFeatureRequest(null);
      setIsEditFeatureDialogOpen(false);
      
      // Ricarica le feature requests
      loadSupportData();
    } catch (error) {
      console.error('Error updating feature request:', error);
      showErrorToast({
        title: "Errore",
        description: "Impossibile aggiornare la richiesta. Riprova più tardi."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleVote = async (requestId: string) => {
    if (!user) {
      showErrorToast({
        title: "Errore",
        description: "Devi essere autenticato per votare"
      });
      return;
    }

    // Funzionalità di voto temporaneamente disabilitata dopo pulizia database
    showErrorToast({
      title: "Funzionalità non disponibile",
      description: "Il sistema di voti è temporaneamente disabilitato"
    });
  };

  const handleEditFeatureRequest = (request: FeatureRequest) => {
    setEditingFeatureRequest(request);
    setIsEditFeatureDialogOpen(true);
  };

  const handleDeleteFeatureRequest = (request: FeatureRequest) => {
    setFeatureToDelete(request);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteFeatureRequest = async () => {
    if (!featureToDelete) return;

    try {
      const { error } = await supabase
        .from('support_feature_requests')
        .delete()
        .eq('id', featureToDelete.id);

      if (error) {
        console.error('Error deleting feature request:', error);
        throw error;
      }

      showSuccessToast({
        title: "Richiesta eliminata",
        description: "La richiesta di funzionalità è stata eliminata con successo."
      });

      setIsDeleteConfirmOpen(false);
      setFeatureToDelete(null);
      
      // Ricarica le feature requests
      loadSupportData();
    } catch (error) {
      console.error('Error deleting feature request:', error);
      showErrorToast({
        title: "Errore",
        description: "Impossibile eliminare la richiesta. Riprova più tardi."
      });
    }
  };

  const handleTicketSelect = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    
    // Marca il ticket come letto quando viene selezionato
    if (user?.id) {
      try {
        await supabase.rpc('mark_ticket_as_read', {
          p_ticket_id: ticket.id,
          p_user_id: user.id
        });
        
        // Aggiorna immediatamente la lista locale rimuovendo l'unread count
        setTickets(prev => 
          prev.map(t => 
            t.id === ticket.id ? { ...t, unread_count: undefined } : t
          )
        );
      } catch (error) {
        console.error('Error marking ticket as read:', error);
      }
    }
  };

  const handleTicketClose = (ticket: SupportTicket) => {
    setTicketToClose(ticket);
    setIsCloseConfirmOpen(true);
  };

  const confirmCloseTicket = async () => {
    if (!ticketToClose) return;

    setIsClosingTicket(true);
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          status: 'closed',
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketToClose.id);

      if (error) throw error;

      showSuccessToast({
        title: "Ticket chiuso",
        description: `Il ticket #${ticketToClose.ticket_number} è stato chiuso correttamente.`
      });

      // Aggiorna la lista tickets
      setTickets(prev => 
        prev.map(ticket => 
          ticket.id === ticketToClose.id 
            ? { ...ticket, status: 'closed' }
            : ticket
        )
      );

      // Aggiorna il ticket selezionato se è quello chiuso
      if (selectedTicket && selectedTicket.id === ticketToClose.id) {
        setSelectedTicket({ ...selectedTicket, status: 'closed' });
      }

      setIsCloseConfirmOpen(false);
      setTicketToClose(null);
    } catch (error) {
      console.error('Error closing ticket:', error);
      showErrorToast({
        title: "Errore",
        description: "Impossibile chiudere il ticket. Riprova più tardi."
      });
    } finally {
      setIsClosingTicket(false);
    }
  };

  const handleTicketUpdate = (updatedTicket: SupportTicket) => {
    setTickets(prev => 
      prev.map(ticket => 
        ticket.id === updatedTicket.id ? updatedTicket : ticket
      )
    );
    if (selectedTicket && selectedTicket.id === updatedTicket.id) {
      setSelectedTicket(updatedTicket);
    }
  };

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      text: chatInput,
      sender: 'user' as const,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);

    // Simula risposta del bot
    setTimeout(() => {
      const botMessage = {
        text: "Grazie per il tuo messaggio! Per un supporto più specifico, ti consiglio di creare un ticket di supporto dettagliato. In questo modo potrai ricevere assistenza personalizzata dal nostro team.",
        sender: 'bot' as const,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 2000);
  };

  // Filtra FAQ in base alla ricerca
  const filteredFaqs = faqs.filter(faq => 
    (selectedCategory === 'all' || faq.category === selectedCategory) &&
    (searchQuery === '' || 
     faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
     faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
     faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Centro di Supporto</h1>
            <p className="text-muted-foreground">
              Trova risposte alle tue domande o contatta il nostro team di supporto
            </p>
          </div>
          <Button 
            onClick={() => setIsPlatformGuideOpen(true)}
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
          >
            <Book className="h-5 w-5" />
            Guida della Piattaforma
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tickets" className="flex items-center space-x-2">
            <Ticket className="h-4 w-4" />
            <span>Ticket</span>
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center space-x-2">
            <HelpCircle className="h-4 w-4" />
            <span>FAQ</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center space-x-2">
            <Star className="h-4 w-4" />
            <span>Richieste Feature</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center space-x-2">
            <Headphones className="h-4 w-4" />
            <span>Contattaci</span>
          </TabsTrigger>
        </TabsList>

        {/* TICKETS */}
        <TabsContent value="tickets" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Ticket di Supporto</h2>
            <Dialog open={isNewTicketDialogOpen} onOpenChange={setIsNewTicketDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuovo Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Crea Nuovo Ticket</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Categoria *</label>
                    <Select 
                      value={newTicket.category} 
                      onValueChange={(value) => setNewTicket({...newTicket, category: value})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Tecnico</SelectItem>
                        <SelectItem value="billing">Fatturazione</SelectItem>
                        <SelectItem value="medical">Medico</SelectItem>
                        <SelectItem value="general">Generale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Priorità *</label>
                    <Select 
                      value={newTicket.priority} 
                      onValueChange={(value) => setNewTicket({...newTicket, priority: value})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Bassa</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                        <SelectItem value="critical">Critica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Oggetto *</label>
                    <Input
                      placeholder="Descrivi brevemente il problema"
                      value={newTicket.subject}
                      onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Descrizione *</label>
                    <Textarea
                      placeholder="Fornisci tutti i dettagli possibili sul problema"
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                      rows={4}
                      required
                    />
                  </div>
                  
                  <Button 
                    onClick={createTicket} 
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? 'Creazione...' : 'Crea Ticket'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="open" className="space-y-6">
            <TabsList>
              <TabsTrigger value="open">Ticket Aperti</TabsTrigger>
              <TabsTrigger value="closed">Ticket Chiusi</TabsTrigger>
            </TabsList>

            <TabsContent value="open" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <SupportTicketList
                    tickets={tickets.filter(ticket => ticket.status !== 'closed')}
                    selectedTicketId={selectedTicket?.id}
                    onTicketSelect={handleTicketSelect}
                    loading={loading}
                  />
                </div>
                
                <div className="lg:col-span-2">
                  {selectedTicket ? (
                    <SupportTicketDetails
                      ticket={selectedTicket}
                      onClose={() => setSelectedTicket(null)}
                      onTicketUpdate={handleTicketUpdate}
                      onTicketClose={handleTicketClose}
                    />
                  ) : (
                    <Card className="h-full flex items-center justify-center">
                      <CardContent className="text-center">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="font-medium mb-2">Seleziona un ticket aperto</h3>
                        <p className="text-sm text-muted-foreground">
                          Scegli un ticket dalla lista per visualizzare i dettagli e la cronologia
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="closed" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <SupportTicketList
                    tickets={tickets.filter(ticket => ticket.status === 'closed')}
                    selectedTicketId={selectedTicket?.id}
                    onTicketSelect={handleTicketSelect}
                    loading={loading}
                  />
                </div>
                
                <div className="lg:col-span-2">
                  {selectedTicket ? (
                    <SupportTicketDetails
                      ticket={selectedTicket}
                      onClose={() => setSelectedTicket(null)}
                      onTicketUpdate={handleTicketUpdate}
                      onTicketClose={handleTicketClose}
                    />
                  ) : (
                    <Card className="h-full flex items-center justify-center">
                      <CardContent className="text-center">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="font-medium mb-2">Seleziona un ticket chiuso</h3>
                        <p className="text-sm text-muted-foreground">
                          Scegli un ticket dalla lista per visualizzare i dettagli e la cronologia
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* FAQ */}
        <TabsContent value="faq" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Cerca nelle FAQ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le categorie</SelectItem>
                <SelectItem value="technical">Tecnico</SelectItem>
                <SelectItem value="billing">Fatturazione</SelectItem>
                <SelectItem value="general">Generale</SelectItem>
                <SelectItem value="features">Funzionalità</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {/* FAQ aggiornate con informazioni sulle nuove funzionalità */}
            {[
              {
                id: '1',
                question: 'Come funziona la nuova interfaccia colorata delle analisi?',
                answer: 'Abbiamo introdotto un sistema di colori intuitivo nella pagina di analisi per migliorare l\'usabilità:\n\n🎨 **Codifica Colori:**\n• 🟦 **INDIGO** → Analisi Testuale con "🧠 Analisi Avanzata con IA"\n• 🌸 **ROSA** → Analisi Foto con "📸 Analisi Foto Avanzata con IA"\n• 🟣 **VIOLA** → Analisi Video con "🎬 Analisi Video Avanzata con IA"\n• 🟠 **ARANCIONE** → Analisi Audio con "🎙️ Analisi Audio Avanzata con IA"\n• 🪸 **CORAL** → Upload Multimediale con "📊 Analisi Multimediale Avanzata con IA"\n\n✨ **Vantaggi:**\n• Navigazione più intuitiva\n• Identificazione rapida delle funzioni\n• Esperienza utente migliorata\n• Accessibilità aumentata per tutte le età',
                category: 'features',
                tags: ['interfaccia', 'colori', 'analisi', 'usabilità'],
                helpful_count: 15,
                not_helpful_count: 1,
                view_count: 143
              },
              {
                id: '2',
                question: 'Che tipi di analisi comportamentale posso fare?',
                answer: 'PetVoice offre 5 modalità di analisi avanzate:\n\n🧠 **ANALISI TESTUALE** (Indigo):\n• Max 2.000 caratteri\n• Elaborazione NLP istantanea\n• Accuratezza: 92-97%\n• Ideale per: Descrizioni comportamentali dettagliate\n\n📸 **ANALISI FOTO** (Rosa):\n• Max 10MB per immagine\n• Computer Vision avanzata\n• Tempo: 10-20 secondi\n• Rileva: Espressioni, postura, micro-segnali\n\n🎬 **ANALISI VIDEO** (Viola):\n• Max 5 minuti di durata\n• Analisi movimento + audio\n• Tempo: 20-45 secondi\n• Combina: Visual + audio analysis\n\n🎙️ **ANALISI AUDIO** (Arancione):\n• Max 5 minuti di registrazione\n• Riconoscimento tono e pitch\n• Tempo: 15-30 secondi\n• Rileva: Vocalizzazioni, stress, emozioni\n\n📊 **ANALISI MULTIMEDIALE** (Coral):\n• Caricamento file multipli\n• Analisi correlata e incrociata\n• Accuratezza superiore (fino al 98%)\n• Risultati unificati e completi',
                category: 'features',
                tags: ['analisi', 'AI', 'comportamento', 'modalità'],
                helpful_count: 28,
                not_helpful_count: 2,
                view_count: 267
              },
              {
                id: '3',
                question: 'Come funziona l\'auto-analisi intelligente?',
                answer: 'L\'auto-analisi rende il workflow più veloce e automatizzato:\n\n⚡ **Analisi Automatica per:**\n• File immagine caricati\n• File video caricati\n• File audio (se abilitato nelle impostazioni)\n\n🔄 **Come Funziona:**\n1. Carichi/registri il contenuto\n2. Il sistema rileva automaticamente il tipo\n3. Avvia l\'analisi senza click aggiuntivi\n4. Ricevi notifica quando pronta\n\n⚙️ **Controllo Utente:**\n• Puoi disabilitare l\'auto-analisi nelle impostazioni\n• Mantieni sempre il controllo manuale\n• Possibilità di rivedere prima dell\'invio\n\n💡 **Beneficio:** Workflow più veloce e automatizzato, riducendo i passaggi necessari per ottenere risultati!',
                category: 'features',
                tags: ['auto-analisi', 'automatico', 'workflow', 'velocità'],
                helpful_count: 22,
                not_helpful_count: 0,
                view_count: 189
              },
              {
                id: '4',
                question: 'Posso analizzare più file contemporaneamente?',
                answer: 'Sì! L\'analisi multimediale combinata è la nostra funzione più avanzata:\n\n📊 **Caricamento Multiplo:**\n• Trascina più file contemporaneamente\n• Diversi tipi di media insieme\n• Analisi correlata e incrociata\n• Risultati unificati e completi\n\n🔗 **Correlazioni Intelligenti:**\n• Audio + Video = Analisi comportamentale completa\n• Foto + Descrizione = Context enhancement\n• File multipli stesso evento = Maggiore precisione\n\n📈 **Vantaggi:**\n• Accuratezza superiore (fino al 98%)\n• Insights più profondi e dettagliati\n• Raccomandazioni più specifiche\n• Report veterinario più completo\n\n💫 **Tip:** Combina più modalità per i migliori risultati! Ad esempio: registra un video del comportamento + aggiungi descrizione testuale per massima precisione.',
                category: 'features',
                tags: ['file multipli', 'combinata', 'correlazione', 'accuratezza'],
                helpful_count: 31,
                not_helpful_count: 1,
                view_count: 298
              },
              {
                id: '5',
                question: 'I pulsanti dell\'analisi hanno colori diversi, perché?',
                answer: 'Abbiamo implementato un sistema di colori coordinato per migliorare l\'usabilità:\n\n🔘 **Design Coordinato:**\n• Ogni pulsante ha lo stesso colore del titolo corrispondente\n• Pulsanti più grandi e visibili (32x32px)\n• Effetti hover migliorati (scale 1.02)\n• Ombre e gradienti per maggiore profondità\n\n🎯 **Coordinazione Colori:**\n• Pulsante e titolo sempre dello stesso colore\n• Contrasto ottimizzato per leggibilità WCAG 2.1\n• Stati attivi/disattivi chiaramente distinti\n• Feedback visivo immediato su hover e click\n\n💡 **Benefici:**\n• Più facile trovare e usare le funzioni\n• Esperienza più fluida e intuitiva\n• Accessibilità migliorata per tutte le età\n• Riduzione dei tempi di apprendimento',
                category: 'technical',
                tags: ['pulsanti', 'colori', 'design', 'accessibilità'],
                helpful_count: 19,
                not_helpful_count: 0,
                view_count: 156
              },
              {
                id: '6',
                question: 'Come posso ottenere i migliori risultati dall\'analisi AI?',
                answer: 'Segui questi consigli per massimizzare l\'accuratezza dell\'analisi:\n\n📸 **Per Foto e Video:**\n• Usa buona illuminazione naturale\n• Mantieni il pet al centro dell\'inquadratura\n• Evita sfondi troppo caotici\n• Risoluzione minima: 800x600px\n\n🎙️ **Per Audio:**\n• Registra in ambiente silenzioso\n• Mantieni il microfono vicino al pet\n• Durata ideale: 30 secondi - 2 minuti\n• Evita rumori di fondo\n\n📝 **Per Descrizioni Testuali:**\n• Sii specifico e dettagliato\n• Includi contesto (ora, luogo, situazione)\n• Descrivi comportamenti osservabili\n• Usa almeno 50-100 parole\n\n🔄 **Per Analisi Multiple:**\n• Combina diversi tipi di media\n• Carica file dello stesso evento\n• Aggiungi sempre una descrizione testuale\n• Più dati = maggiore precisione',
                category: 'general',
                tags: ['consigli', 'accuratezza', 'qualità', 'best practices'],
                helpful_count: 35,
                not_helpful_count: 0,
                view_count: 421
              }
            ].filter(faq => 
              (selectedCategory === 'all' || faq.category === selectedCategory) &&
              (searchQuery === '' || 
               faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
               faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
               faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
            ).map((faq) => (
              <Card key={faq.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg text-primary">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed mb-4">
                    {faq.answer}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                        {faq.category === 'technical' ? 'Tecnico' : 
                         faq.category === 'features' ? 'Funzionalità' : 
                         faq.category === 'billing' ? 'Fatturazione' : 'Generale'}
                      </span>
                      {faq.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-muted rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {faq.helpful_count}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        {faq.not_helpful_count}
                      </Button>
                      <span className="text-xs text-muted-foreground ml-2">
                        {faq.view_count} views
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* CONTACT */}
        <TabsContent value="contact" className="space-y-6">
          <div className="grid gap-6 max-w-4xl mx-auto">
            {/* Contact Methods */}
            <Card className="bg-gradient-to-br from-purple-50/80 to-violet-50/60 border-purple-200/50">
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

        {/* FEATURE REQUESTS */}
        <TabsContent value="features" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Richieste di Funzionalità</h2>
            <Dialog open={isNewFeatureDialogOpen} onOpenChange={setIsNewFeatureDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuova Richiesta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Proponi una nuova funzionalità</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Titolo *</label>
                    <Input
                      placeholder="Nome della funzionalità"
                      value={newFeatureRequest.title}
                      onChange={(e) => setNewFeatureRequest({...newFeatureRequest, title: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Descrizione *</label>
                    <Textarea
                      placeholder="Descrivi la funzionalità che vorresti vedere..."
                      value={newFeatureRequest.description}
                      onChange={(e) => setNewFeatureRequest({...newFeatureRequest, description: e.target.value})}
                      rows={4}
                      required
                    />
                  </div>
                  <Button 
                    onClick={createFeatureRequest} 
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? 'Invio...' : 'Invia Richiesta'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {featureRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-medium">{request.title}</h3>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleVote(request.id)}
                        className={userVotes.includes(request.id) ? 'text-yellow-500' : ''}
                      >
                        <Star className={`h-4 w-4 mr-1 ${userVotes.includes(request.id) ? 'fill-current' : ''}`} />
                        {request.votes}
                      </Button>
                      {/* Pulsanti modifica/elimina per il proprietario o admin */}
                      {(user?.id === request.user_id || isAdmin) && (
                        <div className="flex gap-1 ml-2">
                          {user?.id === request.user_id && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-2"
                              onClick={() => handleEditFeatureRequest(request)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-2 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteFeatureRequest(request)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">{request.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {request.status} • {request.category}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal di conferma chiusura ticket */}
      <TicketCloseConfirmModal
        isOpen={isCloseConfirmOpen}
        ticket={ticketToClose}
        onClose={() => {
          setIsCloseConfirmOpen(false);
          setTicketToClose(null);
        }}
        onConfirm={confirmCloseTicket}
        loading={isClosingTicket}
      />

      {/* Modal di modifica feature request */}
      <Dialog open={isEditFeatureDialogOpen} onOpenChange={setIsEditFeatureDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica Richiesta di Funzionalità</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Titolo *</label>
              <Input
                placeholder="Nome della funzionalità"
                value={editingFeatureRequest?.title || ''}
                onChange={(e) => setEditingFeatureRequest(prev => 
                  prev ? {...prev, title: e.target.value} : null
                )}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descrizione *</label>
              <Textarea
                placeholder="Descrivi la funzionalità che vorresti vedere..."
                value={editingFeatureRequest?.description || ''}
                onChange={(e) => setEditingFeatureRequest(prev => 
                  prev ? {...prev, description: e.target.value} : null
                )}
                rows={4}
                required
              />
            </div>
            <Button 
              onClick={editFeatureRequest} 
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Aggiornamento...' : 'Aggiorna Richiesta'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AlertDialog di conferma eliminazione feature request */}
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Elimina Richiesta
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Sei sicuro di voler eliminare la richiesta "{featureToDelete?.title}"? 
              <br />
              <strong className="text-destructive">Questa azione non può essere annullata.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={confirmDeleteFeatureRequest}
              asChild
            >
              <AlertDialogAction>
                <Trash2 className="h-4 w-4 mr-2" />
                Conferma
              </AlertDialogAction>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Platform Guide Modal */}
      <PlatformGuideModal
        isOpen={isPlatformGuideOpen}
        onClose={() => setIsPlatformGuideOpen(false)}
      />
    </div>
  );
};

export default SupportPage;