import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Ticket, 
  Search, 
  Filter,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Send
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { useTranslatedToast } from '@/hooks/use-translated-toast';

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
  user_id: string;
  profiles?: {
    display_name: string;
    user_id: string;
  } | null;
}

export const AdminTickets: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketReplies, setTicketReplies] = useState<any[]>([]);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const { showToast } = useTranslatedToast();

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, searchQuery, statusFilter, priorityFilter]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          profiles:user_id (display_name, user_id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets((data as any) || []);
    } catch (error) {
      console.error('Error loading tickets:', error);
      showToast({
        title: "❌ Errore",
        description: "Impossibile caricare i ticket",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
      setTicketReplies(data || []);
    } catch (error) {
      console.error('Error loading replies:', error);
    }
  };

  const filterTickets = () => {
    let filtered = tickets;

    if (searchQuery) {
      filtered = filtered.filter(ticket => 
        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.profiles?.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }

    setFilteredTickets(filtered);
  };

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: newStatus })
        .eq('id', ticketId);

      if (error) throw error;

      showToast({
        title: "✅ Stato aggiornato",
        description: `Ticket aggiornato a: ${newStatus}`
      });

      loadTickets();
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      showToast({
        title: "❌ Errore",
        description: "Impossibile aggiornare il ticket",
        variant: "destructive"
      });
    }
  };

  const addStaffReply = async () => {
    if (!selectedTicket || !replyContent.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('support_ticket_replies')
        .insert({
          ticket_id: selectedTicket.id,
          user_id: user.id,
          content: replyContent.trim(),
          is_staff_reply: true
        });

      if (error) throw error;

      showToast({
        title: "✅ Risposta inviata",
        description: "La risposta è stata inviata al cliente"
      });

      setReplyContent('');
      loadTicketReplies(selectedTicket.id);
    } catch (error) {
      console.error('Error adding reply:', error);
      showToast({
        title: "❌ Errore",
        description: "Impossibile inviare la risposta",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <AlertTriangle className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestione Ticket di Supporto</h1>
        <Button onClick={loadTickets} variant="outline">
          <Ticket className="h-4 w-4 mr-2" />
          Ricarica
        </Button>
      </div>

      {/* Filtri */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca per oggetto, numero ticket o utente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                <SelectItem value="open">Aperto</SelectItem>
                <SelectItem value="in_progress">In lavorazione</SelectItem>
                <SelectItem value="resolved">Risolto</SelectItem>
                <SelectItem value="closed">Chiuso</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Priorità" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le priorità</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="low">Bassa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista Ticket */}
      <Card>
        <CardHeader>
          <CardTitle>Ticket ({filteredTickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nessun ticket trovato
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTickets.map((ticket) => (
                <div 
                  key={ticket.id} 
                  className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedTicket(ticket);
                    loadTicketReplies(ticket.id);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium">{ticket.subject}</h3>
                        <Badge variant="outline">{ticket.ticket_number}</Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{ticket.profiles?.display_name || 'Utente sconosciuto'}</span>
                        </div>
                        <span>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true, locale: it })}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${getPriorityColor(ticket.priority)} text-white`}>
                        {ticket.priority}
                      </Badge>
                      <Badge className={`${getStatusColor(ticket.status)} text-white flex items-center space-x-1`}>
                        {getStatusIcon(ticket.status)}
                        <span>{ticket.status}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Dettagli Ticket */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTicket?.subject} - {selectedTicket?.ticket_number}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="space-y-6">
              {/* Informazioni Ticket */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Utente</label>
                  <p className="font-medium">{selectedTicket.profiles?.display_name || 'Utente sconosciuto'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Categoria</label>
                  <p>{selectedTicket.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Priorità</label>
                  <Badge className={`${getPriorityColor(selectedTicket.priority)} text-white`}>
                    {selectedTicket.priority}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Stato</label>
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getStatusColor(selectedTicket.status)} text-white`}>
                      {selectedTicket.status}
                    </Badge>
                    <Select 
                      value={selectedTicket.status} 
                      onValueChange={(value) => updateTicketStatus(selectedTicket.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Aperto</SelectItem>
                        <SelectItem value="in_progress">In lavorazione</SelectItem>
                        <SelectItem value="resolved">Risolto</SelectItem>
                        <SelectItem value="closed">Chiuso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Descrizione */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Descrizione</label>
                <div className="mt-1 p-4 bg-muted rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedTicket.description}</p>
                </div>
              </div>

              {/* Risposte */}
              <div>
                <h3 className="font-medium mb-3">Cronologia Conversazione</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {ticketReplies.map((reply) => (
                    <Card key={reply.id} className={reply.is_staff_reply ? "bg-green-50" : "bg-blue-50"}>
                      <CardContent className="p-3">
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                            reply.is_staff_reply ? 'bg-green-500' : 'bg-blue-500'
                          }`}>
                            {reply.is_staff_reply ? 'ST' : 'CL'}
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium text-sm ${reply.is_staff_reply ? 'text-green-900' : 'text-blue-900'}`}>
                              {reply.is_staff_reply ? 'Team di Supporto' : selectedTicket.profiles?.display_name}
                            </p>
                            <p className={`text-sm mt-1 whitespace-pre-wrap ${reply.is_staff_reply ? 'text-green-700' : 'text-blue-700'}`}>
                              {reply.content}
                            </p>
                            <p className={`text-xs mt-2 ${reply.is_staff_reply ? 'text-green-600' : 'text-blue-600'}`}>
                              {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true, locale: it })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Nuova Risposta */}
              {selectedTicket.status !== 'closed' && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Risposta del Supporto</label>
                  <Textarea
                    placeholder="Scrivi la tua risposta al cliente..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={4}
                    className="mt-1"
                  />
                  <Button 
                    onClick={addStaffReply} 
                    disabled={!replyContent.trim()}
                    className="mt-3"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Invia Risposta
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};