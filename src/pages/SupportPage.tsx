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
import { useTranslatedToast } from '@/hooks/use-translated-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { SupportTicketList } from '@/components/support/SupportTicketList';
import { SupportTicketDetails } from '@/components/support/SupportTicketDetails';
import { TicketCloseConfirmModal } from '@/components/support/TicketCloseConfirmModal';

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
  const { showToast } = useTranslatedToast();
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

      // Carica i voti dell'utente corrente
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
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (!user) {
        showToast({
          title: "Errore",
          description: "Devi essere autenticato per creare un ticket",
          variant: "destructive"
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

      showToast({
        title: "Ticket creato",
        description: "Il tuo ticket è stato creato con successo. Riceverai una risposta entro 24 ore.",
        variant: "success"
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
      showToast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (!user) {
        showToast({
          title: "Errore", 
          description: "Devi essere autenticato per creare una richiesta",
          variant: "destructive"
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

      showToast({
        title: "Richiesta inviata",
        description: "La tua richiesta di funzionalità è stata inviata con successo.",
        variant: "success"
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
      showToast({
        title: "Errore",
        description: "Impossibile inviare la richiesta. Riprova più tardi.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const editFeatureRequest = async () => {
    if (!editingFeatureRequest?.title || !editingFeatureRequest?.description) {
      showToast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
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

      showToast({
        title: "Richiesta aggiornata",
        description: "La richiesta di funzionalità è stata aggiornata con successo.",
        variant: "success"
      });

      setEditingFeatureRequest(null);
      setIsEditFeatureDialogOpen(false);
      
      // Ricarica le feature requests
      loadSupportData();
    } catch (error) {
      console.error('Error updating feature request:', error);
      showToast({
        title: "Errore",
        description: "Impossibile aggiornare la richiesta. Riprova più tardi.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleVote = async (requestId: string) => {
    if (!user) {
      showToast({
        title: "Errore",
        description: "Devi essere autenticato per votare",
        variant: "destructive"
      });
      return;
    }

    const hasVoted = userVotes.includes(requestId);
    
    try {
      if (hasVoted) {
        // Rimuovi voto
        const { error } = await supabase
          .from('feature_request_votes')
          .delete()
          .eq('feature_request_id', requestId)
          .eq('user_id', user.id);

        if (error) throw error;

        // Decrementa il conteggio voti
        await supabase.rpc('increment_feature_votes', {
          request_id: requestId,
          increment_value: -1
        });

        setUserVotes(prev => prev.filter(id => id !== requestId));
      } else {
        // Aggiungi voto
        const { error } = await supabase
          .from('feature_request_votes')
          .insert({
            feature_request_id: requestId,
            user_id: user.id
          });

        if (error) throw error;

        // Incrementa il conteggio voti
        await supabase.rpc('increment_feature_votes', {
          request_id: requestId,
          increment_value: 1
        });

        setUserVotes(prev => [...prev, requestId]);
      }

      // Ricarica i dati per vedere il conteggio aggiornato
      loadSupportData();
    } catch (error) {
      console.error('Error toggling vote:', error);
      showToast({
        title: "Errore",
        description: "Impossibile votare. Riprova più tardi.",
        variant: "destructive"
      });
    }
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

      showToast({
        title: "Richiesta eliminata",
        description: "La richiesta di funzionalità è stata eliminata con successo.",
        variant: "success"
      });

      setIsDeleteConfirmOpen(false);
      setFeatureToDelete(null);
      
      // Ricarica le feature requests
      loadSupportData();
    } catch (error) {
      console.error('Error deleting feature request:', error);
      showToast({
        title: "Errore",
        description: "Impossibile eliminare la richiesta. Riprova più tardi.",
        variant: "destructive"
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

      showToast({
        title: "Ticket chiuso",
        description: `Il ticket #${ticketToClose.ticket_number} è stato chiuso correttamente.`,
        variant: "success"
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
      showToast({
        title: "Errore",
        description: "Impossibile chiudere il ticket. Riprova più tardi.",
        variant: "destructive"
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
        <h1 className="text-3xl font-bold mb-2">Centro di Supporto</h1>
        <p className="text-muted-foreground">
          Trova risposte alle tue domande o contatta il nostro team di supporto
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tickets" className="flex items-center space-x-2">
            <Ticket className="h-4 w-4" />
            <span>I Miei Ticket</span>
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
            <h2 className="text-xl font-semibold">I Miei Ticket di Supporto</h2>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <SupportTicketList
                tickets={tickets}
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
                    <h3 className="font-medium mb-2">Seleziona un ticket</h3>
                    <p className="text-sm text-muted-foreground">
                      Scegli un ticket dalla lista per visualizzare i dettagli e la cronologia
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
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
            {filteredFaqs.map((faq) => (
              <Card key={faq.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{faq.answer}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {faq.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-muted rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {faq.helpful_count}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        {faq.not_helpful_count}
                      </Button>
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
    </div>
  );
};

export default SupportPage;