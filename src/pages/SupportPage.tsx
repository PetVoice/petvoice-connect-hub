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
            {/* FAQ COMPLETE basate su TUTTE le funzionalità della piattaforma */}
            {[
              // === GENERALE ===
              {
                id: '1',
                question: '🎯 Cos\'è PetVoice e come funziona?',
                answer: 'PetVoice è la piattaforma AI più avanzata per il benessere degli animali domestici.<br><br><strong>🔥 FUNZIONALITÀ PRINCIPALI:</strong><br>• <strong>Dashboard Intelligente</strong> - Panoramica wellness e metriche avanzate<br>• <strong>Gestione Pet</strong> - Profili completi con dati sanitari<br>• <strong>Analisi AI Multimodale</strong> - Audio, video, foto, testo con IA<br>• <strong>Diario Comportamentale</strong> - Tracciamento quotidiano avanzato<br>• <strong>Calendario Smart</strong> - Appuntamenti e promemoria automatici<br>• <strong>Protocolli Training AI</strong> - Addestramento personalizzato<br>• <strong>Music Therapy AI</strong> - Musicoterapia generata dall\'IA<br>• <strong>Machine Learning</strong> - Previsioni comportamentali<br>• <strong>Community</strong> - Social network per proprietari<br>• <strong>Pet Matching</strong> - Trova pet compatibili<br>• <strong>Tutorial Interattivi</strong> - Guide passo-passo',
                category: 'general',
                tags: ['introduzione', 'funzionalità', 'AI'],
                helpful_count: 157,
                not_helpful_count: 3,
                view_count: 3245
              },
              {
                id: '2',
                question: '🧠 Come funziona l\'Analisi AI con la nuova interfaccia colorata?',
                answer: '<strong>🎨 NUOVA INTERFACCIA COLORATA:</strong><br><br>• 🟦 <strong>INDIGO</strong> → Analisi Testuale (Descrizioni NLP)<br>• 🌸 <strong>ROSA</strong> → Analisi Foto (Computer Vision)<br>• 🟣 <strong>VIOLA</strong> → Analisi Video (Movimento + Audio)<br>• 🟠 <strong>ARANCIONE</strong> → Analisi Audio (Vocalizzazioni)<br>• 🪸 <strong>CORAL</strong> → Upload Multimediale (File multipli)<br><br><strong>📊 ACCURATEZZA:</strong><br>• Testo: 92-97% • Foto: 85-95% • Video: 90-98% • Audio: 88-94%<br><br><strong>⚡ AUTO-ANALISI:</strong><br>Sistema intelligente che rileva il tipo di file e avvia automaticamente l\'analisi più appropriata.',
                category: 'features',
                tags: ['analisi', 'AI', 'interfaccia', 'colori'],
                helpful_count: 89,
                not_helpful_count: 2,
                view_count: 1567
              },
              {
                id: '3',
                question: '📂 Che tipi di file posso caricare?',
                answer: '<strong>🎬 VIDEO:</strong> MP4, MOV, AVI, WebM (max 100MB, 5min)<br><strong>🎵 AUDIO:</strong> MP3, WAV, M4A, AAC, OGG (max 100MB, 5min)<br><strong>📸 IMMAGINI:</strong> JPEG, PNG, WebP, GIF, HEIC (max 10MB)<br><strong>📝 TESTO:</strong> Descrizioni fino a 2000 caratteri<br><br><strong>🎯 FUNZIONI INTEGRATE:</strong><br>• Registrazione audio/video diretta<br>• Cattura foto in tempo reale<br>• Drag & drop multiplo<br>• Auto-analisi intelligente<br>• Elaborazione cloud veloce<br><br><strong>💡 TIP:</strong> Combina più tipi di media per analisi più accurate (fino al 98%)',
                category: 'technical',
                tags: ['file', 'formati', 'upload', 'limiti'],
                helpful_count: 124,
                not_helpful_count: 1,
                view_count: 2134
              },
              {
                id: '4',
                question: '🐕 Come gestire più pet contemporaneamente?',
                answer: '<strong>🏠 GESTIONE MULTI-PET:</strong><br><br><strong>✅ AGGIUNTA PET:</strong><br>1. Sezione "Pet" → "Aggiungi Pet"<br>2. Dati base: nome, tipo, razza, nascita<br>3. Dettagli: peso, allergie, paure, preferenze<br>4. Foto profilo e documentazione<br><br><strong>🔄 CAMBIO PET ATTIVO:</strong><br>• Selettore dropdown in alto<br>• Dati separati per ogni pet<br>• Profili indipendenti<br><br><strong>📊 FUNZIONI PER PET:</strong><br>• Dashboard personalizzata<br>• Cronologia analisi separate<br>• Diario comportamentale individuale<br>• Calendario eventi specifico<br>• Statistiche comparative',
                category: 'features',
                tags: ['pet', 'gestione', 'multipli', 'profili'],
                helpful_count: 95,
                not_helpful_count: 1,
                view_count: 1678
              },
              {
                id: '5',
                question: '📊 Come interpreto i risultati delle analisi?',
                answer: '<strong>🎯 STRUTTURA RISULTATI:</strong><br><br><strong>📈 EMOZIONE PRIMARIA:</strong><br>• Percentuale confidenza (>70% = alta affidabilità)<br>• Valori soglia: <50% dubbia, 50-70% media, >70% alta<br><br><strong>🔍 ANALISI DETTAGLIATA:</strong><br>• Emozioni secondarie rilevate<br>• Insights comportamentali specifici<br>• Raccomandazioni personalizzate AI<br>• Trigger identificati<br>• Context ambientale (meteo, ora)<br><br><strong>💾 CRONOLOGIA:</strong><br>• Tutte le analisi salvate<br>• Filtri per data/tipo/emozione<br>• Trend temporali<br>• Comparazioni storiche<br>• Export PDF per veterinario',
                category: 'features',
                tags: ['risultati', 'interpretazione', 'confidenza', 'insights'],
                helpful_count: 156,
                not_helpful_count: 4,
                view_count: 2387
              },
              
              // === DIARIO ===
              {
                id: '6',
                question: '📖 Come utilizzare efficacemente il Diario?',
                answer: '<strong>📝 FUNZIONALITÀ DIARIO:</strong><br><br><strong>📅 VOCI GIORNALIERE:</strong><br>• Titolo e contenuto libero<br>• Mood score 1-10 (essenziale per AI)<br>• Tag comportamentali multipli<br>• Temperature tracking<br>• Note vocali integrate<br>• Gallery foto illimitate<br><br><strong>🎯 BEST PRACTICES:</strong><br>• Aggiorna quotidianamente (stessa ora)<br>• Sii specifico nei tag comportamentali<br>• Includi contesto (ambiente, eventi)<br>• Usa foto per documentare<br><br><strong>📊 ANALYTICS:</strong><br>• Vista calendario con codice colori<br>• Trend mood nel tempo<br>• Correlazioni comportamentali<br>• Export report veterinario',
                category: 'features',
                tags: ['diario', 'tracking', 'mood', 'quotidiano'],
                helpful_count: 87,
                not_helpful_count: 2,
                view_count: 1456
              },
              
              // === CALENDARIO ===
              {
                id: '7',
                question: '📅 Come pianificare appuntamenti e promemoria?',
                answer: '<strong>🗓️ CALENDARIO INTELLIGENTE:</strong><br><br><strong>📋 TIPI EVENTI:</strong><br>• Veterinario (con reminder automatici)<br>• Toelettatura e cura<br>• Vaccinazioni e controlli<br>• Promemoria farmaci<br>• Training sessions<br>• Socializzazione<br><br><strong>🔔 NOTIFICHE SMART:</strong><br>• Alert personalizzabili (15min-7giorni prima)<br>• Reminder automatici ricorrenti<br>• Push notifications<br>• Email backup<br><br><strong>🔗 INTEGRAZIONI:</strong><br>• Export Google Calendar<br>• Sync Outlook<br>• Condivisione famiglia<br>• PDF print-friendly',
                category: 'features',
                tags: ['calendario', 'appuntamenti', 'promemoria', 'notifiche'],
                helpful_count: 102,
                not_helpful_count: 1,
                view_count: 1789
              },
              
              // === TRAINING AI ===
              {
                id: '8',
                question: '🎓 Come funzionano i Protocolli di Training AI?',
                answer: '<strong>🤖 TRAINING AI PERSONALIZZATO:</strong><br><br><strong>⚡ GENERAZIONE AUTOMATICA:</strong><br>• AI analizza comportamento del pet<br>• Crea protocolli su misura (7-30 giorni)<br>• Esercizi progressivi e sicuri<br>• Adattamento in tempo reale<br><br><strong>📊 MONITORAGGIO:</strong><br>• Progresso tracciato automaticamente<br>• Valutazioni efficacia (1-5 stelle)<br>• Statistiche completion rate<br>• Feedback continuo AI<br><br><strong>🏆 COMMUNITY:</strong><br>• Protocolli pubblici condivisibili<br>• Rating e recensioni<br>• Successo stories<br>• Personalizzazione avanzata<br><br><strong>💡 RISULTATI:</strong><br>• Report completo fine protocollo<br>• Raccomandazioni future<br>• Protocolli mantenimento',
                category: 'features',
                tags: ['training', 'protocolli', 'AI', 'addestramento'],
                helpful_count: 134,
                not_helpful_count: 3,
                view_count: 2156
              },
              
              // === MUSIC THERAPY ===
              {
                id: '9',
                question: '🎵 Cos\'è la Music Therapy AI e come funziona?',
                answer: '<strong>🎼 MUSICOTERAPIA AVANZATA:</strong><br><br><strong>🎯 GENERAZIONE AI:</strong><br>• Musica terapeutica personalizzata<br>• Algoritmi basati su mood del pet<br>• Frequenze specifiche per specie<br>• Adattamento real-time<br><br><strong>🎨 TIPI SESSIONI:</strong><br>• Rilassamento e antistress<br>• Stimolazione cognitiva<br>• Recupero post-trauma<br>• Socializzazione<br>• Sonno e riposo<br><br><strong>📊 MONITORAGGIO:</strong><br>• Tracking risposta comportamentale<br>• Efficacia sessioni<br>• Playlist ottimizzate AI<br>• Progressi nel tempo<br><br><strong>⚙️ PERSONALIZZAZIONE:</strong><br>• Strumenti preferiti<br>• Durata sessioni<br>• Intensità e volume<br>• Orari ottimali',
                category: 'features',
                tags: ['music', 'therapy', 'AI', 'rilassamento'],
                helpful_count: 76,
                not_helpful_count: 2,
                view_count: 1234
              },
              
              // === MACHINE LEARNING ===
              {
                id: '10',
                question: '🔮 Come funzionano le Previsioni comportamentali?',
                answer: '<strong>🧠 MACHINE LEARNING AVANZATO:</strong><br><br><strong>📈 ANALISI PREDITTIVA:</strong><br>• Algoritmi proprietari su dati storici<br>• Pattern recognition comportamentale<br>• Previsioni problemi futuri<br>• Interventi preventivi suggeriti<br><br><strong>🎯 COSA PREDICE:</strong><br>• Cambiamenti umore/comportamento<br>• Rischi sanitari emergenti<br>• Periodi stress/ansia<br>• Efficacia training<br>• Stagionalità comportamentale<br><br><strong>💡 FEEDBACK LOOP:</strong><br>• Più dati = previsioni più accurate<br>• Correzioni automatiche<br>• Apprendimento continuo<br>• Miglioramento costante algoritmi<br><br><strong>📊 ACCURATEZZA:</strong><br>• 85-92% dopo 30 giorni dati<br>• 90-95% dopo 90 giorni',
                category: 'features',
                tags: ['previsioni', 'machine learning', 'AI', 'predittiva'],
                helpful_count: 67,
                not_helpful_count: 1,
                view_count: 987
              },
              
              // === COMMUNITY ===
              {
                id: '11',
                question: '👥 Come funziona la Community di PetVoice?',
                answer: '<strong>🌍 SOCIAL NETWORK PET:</strong><br><br><strong>💬 CHAT E MESSAGGI:</strong><br>• Chat pubbliche per canali tematici<br>• Messaggi privati tra utenti<br>• Condivisione esperienze<br>• Consigli e supporto peer-to-peer<br><br><strong>🤝 PET MATCHING:</strong><br>• Algoritmo compatibilità caratteriale<br>• Suggerimenti socializzazione<br>• Organizzazione incontri<br>• Geolocalizzazione (opzionale)<br><br><strong>📚 KNOWLEDGE SHARING:</strong><br>• Condivisione protocolli training<br>• Success stories<br>• Tips e trucchi<br>• Recensioni veterinari/servizi<br><br><strong>🔒 PRIVACY:</strong><br>• Controllo completo visibilità<br>• Moderazione contenuti<br>• Report abuse<br>• Settings privacy granulari',
                category: 'features',
                tags: ['community', 'social', 'chat', 'matching'],
                helpful_count: 89,
                not_helpful_count: 2,
                view_count: 1345
              },
              
              // === TUTORIAL E GUIDE ===
              {
                id: '12',
                question: '🎯 Come accedere ai Tutorial Interattivi?',
                answer: '<strong>📚 SISTEMA GUIDE AVANZATO:</strong><br><br><strong>🎮 TUTORIAL INTERATTIVI:</strong><br>• Guide passo-passo con highlighting<br>• Validazione azioni real-time<br>• Progress tracking<br>• Skill assessment<br>• Achievement unlock<br><br><strong>📖 CATEGORIE GUIDE:</strong><br>• Primi passi con PetVoice<br>• Setup profilo pet ottimale<br>• Mastering analisi AI<br>• Strategie diario efficace<br>• Training avanzato<br>• Interpretazione risultati<br><br><strong>🎥 CONTENUTI MULTIMEDIALI:</strong><br>• Video tutorial HD<br>• Screenshots annotate<br>• Demo interattive<br>• Case studies<br><br><strong>💫 ACCESSO:</strong><br>• Menu principale "Tutorial"<br>• Widget dashboard<br>• Contest help in-app',
                category: 'features',
                tags: ['tutorial', 'guide', 'learning', 'interattivo'],
                helpful_count: 45,
                not_helpful_count: 1,
                view_count: 678
              },
              
              // === TECNICO ===
              {
                id: '13',
                question: '🔐 I miei dati sono sicuri? Privacy e GDPR',
                answer: '<strong>🛡️ SICUREZZA ENTERPRISE:</strong><br><br><strong>🔒 PROTEZIONE DATI:</strong><br>• Crittografia AES-256 end-to-end<br>• Server Supabase certificati GDPR<br>• Backup automatici giornalieri<br>• Zero-knowledge architecture<br><br><strong>🗑️ CONTROLLO UTENTE:</strong><br>• Export completo dati personali<br>• Eliminazione account totale<br>• Right to be forgotten GDPR<br>• Trasparenza uso dati<br><br><strong>📱 FILE MULTIMEDIALI:</strong><br>• Elaborazione cloud sicura<br>• Eliminazione automatica post-analisi<br>• Nessuna memorizzazione permanente<br>• Processing località EU<br><br><strong>⚙️ PRIVACY SETTINGS:</strong><br>• Granularità controlli<br>• Opt-out analytics<br>• Consensi revocabili<br>• Audit log accessi',
                category: 'technical',
                tags: ['sicurezza', 'privacy', 'GDPR', 'dati'],
                helpful_count: 156,
                not_helpful_count: 0,
                view_count: 2567
              },
              {
                id: '14',
                question: '🌐 Compatibilità browser e dispositivi',
                answer: '<strong>💻 COMPATIBILITÀ UNIVERSALE:</strong><br><br><strong>🌍 BROWSER SUPPORTATI:</strong><br>• Chrome 90+ (consigliato)<br>• Firefox 88+<br>• Safari 14+<br>• Edge 90+<br>• Mobile browsers ottimizzati<br><br><strong>📱 DISPOSITIVI:</strong><br>• Desktop/Laptop (Windows/Mac/Linux)<br>• Tablet (iOS/Android)<br>• Smartphone (iOS/Android)<br>• Touch screen ottimizzato<br><br><strong>⚡ PERFORMANCE:</strong><br>• PWA (Progressive Web App)<br>• Offline mode limitato<br>• Cache intelligente<br>• Compressione automatica<br><br><strong>🎤 REQUISITI MEDIA:</strong><br>• Microfono per audio analysis<br>• Fotocamera per video/foto<br>• Connessione stabile (2+ Mbps)',
                category: 'technical',
                tags: ['compatibilità', 'browser', 'dispositivi', 'requisiti'],
                helpful_count: 78,
                not_helpful_count: 2,
                view_count: 1123
              },
              
              // === ABBONAMENTO ===
              {
                id: '15',
                question: '💎 Differenze tra Piano Gratuito e Premium',
                answer: '<strong>💰 CONFRONTO PIANI:</strong><br><br><strong>🆓 PIANO GRATUITO:</strong><br>• 1 pet massimo<br>• 10 analisi AI/mese<br>• Funzionalità base diario<br>• Calendario semplice<br>• Supporto community<br><br><strong>⭐ PIANO PREMIUM (€9.99/mese):</strong><br>• Pet illimitati<br>• Analisi AI illimitate<br>• Tutte le funzioni AI avanzate<br>• Music Therapy personalizzata<br>• Machine Learning predittivo<br>• Protocolli training premium<br>• Export PDF avanzati<br>• Priorità supporto<br>• Beta features access<br><br><strong>🎯 UPGRADE BENEFICI:</strong><br>• ROI immediato per multi-pet<br>• Analisi più accurate<br>• Insights predittivi<br>• Support veterinario',
                category: 'billing',
                tags: ['abbonamento', 'premium', 'prezzi', 'features'],
                helpful_count: 167,
                not_helpful_count: 3,
                view_count: 3456
              },
              {
                id: '16',
                question: '💳 Come gestire pagamenti e cancellazioni',
                answer: '<strong>💰 GESTIONE ABBONAMENTO:</strong><br><br><strong>💳 METODI PAGAMENTO:</strong><br>• Carta credito/debito<br>• PayPal<br>• Google Pay / Apple Pay<br>• SEPA Direct Debit (EU)<br>• Fatturazione aziendale<br><br><strong>🔄 MODIFICHE PIANO:</strong><br>• Upgrade immediato<br>• Downgrade a fine ciclo<br>• Pause temporanea (max 3 mesi)<br>• Cancellazione istantanea<br><br><strong>📧 FATTURAZIONE:</strong><br>• Email automatica mensile<br>• PDF scaricabile<br>• Storico completo<br>• Dettagli fiscali<br><br><strong>⏰ CANCELLAZIONE:</strong><br>• Nessun vincolo contrattuale<br>• Accesso fino a fine periodo<br>• Dati conservati 30 giorni<br>• Riattivazione semplice',
                category: 'billing',
                tags: ['pagamenti', 'cancellazione', 'fatturazione', 'gestione'],
                helpful_count: 89,
                not_helpful_count: 1,
                view_count: 1678
              },
              
              // === SUPPORTO ===
              {
                id: '17',
                question: '🆘 Come ottenere supporto tecnico rapido',
                answer: '<strong>🚀 SUPPORTO MULTI-CANALE:</strong><br><br><strong>💬 CHAT LIVE AI (24/7):</strong><br>• Assistente AI istantaneo<br>• Risoluzione problemi comuni<br>• Escalation a umano quando necessario<br>• Pulsante in basso a destra<br><br><strong>📧 EMAIL SUPPORT:</strong><br>• petvoice2025@gmail.com<br>• Risposta entro 4-24h<br>• Allegati supportati<br>• Thread conversation<br><br><strong>🎫 SISTEMA TICKET:</strong><br>• Tracking stato resolution<br>• Priorità basata su piano<br>• Premium: risposta <2h<br>• Cronologia completa<br><br><strong>📚 SELF-SERVICE:</strong><br>• Knowledge base completa<br>• FAQ aggiornate<br>• Video tutorial<br>• Community forum',
                category: 'general',
                tags: ['supporto', 'help', 'assistenza', 'chat'],
                helpful_count: 123,
                not_helpful_count: 2,
                view_count: 2345
              },
              {
                id: '18',
                question: '📊 Come esportare dati e report per il veterinario',
                answer: '<strong>📋 EXPORT PROFESSIONALE:</strong><br><br><strong>📄 REPORT PDF:</strong><br>• Dashboard wellness completo<br>• Cronologia analisi AI<br>• Trend comportamentali<br>• Dati diario aggregati<br>• Grafici e statistiche<br><br><strong>🎯 REPORT VETERINARIO:</strong><br>• Template professionale<br>• Dati sanitari rilevanti<br>• Timeline eventi importanti<br>• Recommendations AI<br>• Medical insights<br><br><strong>📅 EXPORT CALENDARIO:</strong><br>• PDF stampabile<br>• ICS per import calendari<br>• Reminder personalizzati<br>• Vista mensile/annuale<br><br><strong>💾 BACKUP COMPLETO:</strong><br>• JSON strutturato<br>• CSV per analysis<br>• ZIP con media files<br>• GDPR compliant export',
                category: 'technical',
                tags: ['export', 'PDF', 'veterinario', 'backup'],
                helpful_count: 145,
                not_helpful_count: 1,
                view_count: 2567
              }
            ].filter(faq =>
              (selectedCategory === 'all' || faq.category === selectedCategory) &&
              (searchQuery === '' || 
               faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
               faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
            ).map((faq) => (
              <Card key={faq.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg text-primary">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed mb-4"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
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