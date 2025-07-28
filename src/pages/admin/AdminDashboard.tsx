import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Ticket, 
  AlertTriangle, 
  TrendingUp,
  MessageSquare,
  Database,
  Activity,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface DashboardStats {
  totalUsers: number;
  totalTickets: number;
  openTickets: number;
  urgentTickets: number;
  recentActivity: any[];
  systemHealth: 'healthy' | 'warning' | 'critical';
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTickets: 0,
    openTickets: 0,
    urgentTickets: 0,
    recentActivity: [],
    systemHealth: 'healthy'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Carica statistiche utenti
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Carica statistiche ticket
      const { data: tickets } = await supabase
        .from('support_tickets')
        .select('*');

      const openTickets = tickets?.filter(t => t.status === 'open' || t.status === 'in_progress').length || 0;
      const urgentTickets = tickets?.filter(t => t.priority === 'urgent' && t.status !== 'closed').length || 0;

      // Carica attività recente (ultimi 10 ticket)
      const { data: recentTickets } = await supabase
        .from('support_tickets')
        .select(`
          *,
          profiles:user_id (display_name, user_id)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      setStats({
        totalUsers: usersCount || 0,
        totalTickets: tickets?.length || 0,
        openTickets,
        urgentTickets,
        recentActivity: recentTickets || [],
        systemHealth: urgentTickets > 5 ? 'critical' : urgentTickets > 2 ? 'warning' : 'healthy'
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard Amministratore</h1>
        <Button onClick={loadDashboardData} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Aggiorna
        </Button>
      </div>

      {/* Statistiche Principali */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Utenti Totali</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Ticket className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ticket Totali</p>
                <p className="text-2xl font-bold">{stats.totalTickets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ticket Aperti</p>
                <p className="text-2xl font-bold">{stats.openTickets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ticket Urgenti</p>
                <p className="text-2xl font-bold">{stats.urgentTickets}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stato del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Stato del Sistema</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Badge 
              className={`
                ${stats.systemHealth === 'healthy' ? 'bg-green-500' : 
                  stats.systemHealth === 'warning' ? 'bg-yellow-500' : 'bg-red-500'} 
                text-white
              `}
            >
              {stats.systemHealth === 'healthy' ? 'Sistema Operativo' :
               stats.systemHealth === 'warning' ? 'Attenzione Richiesta' : 'Intervento Critico'}
            </Badge>
            <p className="text-sm text-muted-foreground">
              {stats.systemHealth === 'healthy' ? 'Tutti i sistemi funzionano correttamente' :
               stats.systemHealth === 'warning' ? 'Alcuni ticket richiedono attenzione' : 
               'Ticket urgenti in sospeso'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Attività Recente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Ticket Recenti</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Nessun ticket recente</p>
            ) : (
              stats.recentActivity.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col space-y-1">
                      <p className="font-medium">{ticket.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {ticket.profiles?.display_name || 'Utente sconosciuto'} • {ticket.ticket_number}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getPriorityColor(ticket.priority)} text-white`}>
                      {ticket.priority}
                    </Badge>
                    <Badge className={`${getStatusColor(ticket.status)} text-white`}>
                      {ticket.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true, locale: it })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};