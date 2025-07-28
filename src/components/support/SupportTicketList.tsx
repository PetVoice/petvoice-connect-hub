import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock, MessageCircle, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

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
}

interface SupportTicketListProps {
  tickets: SupportTicket[];
  selectedTicketId?: string;
  onTicketSelect: (ticket: SupportTicket) => void;
  onTicketClose: (ticket: SupportTicket) => void;
  loading?: boolean;
}

export const SupportTicketList: React.FC<SupportTicketListProps> = ({
  tickets,
  selectedTicketId,
  onTicketSelect,
  onTicketClose,
  loading = false
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'urgent': return 'bg-red-500';
      case 'critical': return 'bg-red-700';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Aperto';
      case 'in_progress': return 'In lavorazione';
      case 'resolved': return 'Risolto';
      case 'closed': return 'Chiuso';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2 mb-2" />
              <div className="flex gap-2">
                <div className="h-5 bg-muted rounded w-16" />
                <div className="h-5 bg-muted rounded w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-center">
        <div>
          <MessageCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Nessun ticket</p>
          <p className="text-sm text-muted-foreground mt-1">
            Crea il tuo primo ticket di supporto
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => (
        <Card 
          key={ticket.id}
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedTicketId === ticket.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onTicketSelect(ticket)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">
                  {ticket.subject}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  #{ticket.ticket_number} • {ticket.category}
                </p>
              </div>
              
              <div className="flex items-center gap-2 ml-3">
                <Badge className={`${getStatusColor(ticket.status)} text-white text-xs`}>
                  {getStatusText(ticket.status)}
                </Badge>
                <Badge className={`${getPriorityColor(ticket.priority)} text-white text-xs`}>
                  {ticket.priority}
                </Badge>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {ticket.description}
            </p>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(ticket.created_at), { 
                  addSuffix: true, 
                  locale: it 
                })}
              </div>
              
              {ticket.status !== 'closed' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTicketClose(ticket);
                  }}
                >
                  <X className="h-3 w-3 mr-1" />
                  Chiudi
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};