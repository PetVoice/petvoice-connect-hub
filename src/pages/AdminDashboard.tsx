import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Users, Settings, Mail, Shield, Search, Edit, Trash2, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  display_name?: string;
  created_at: string;
  email_confirmed_at?: string;
  last_sign_in_at?: string;
  roles?: string[];
}

interface SupportTicket {
  id: string;
  ticket_number: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

const AdminDashboard = () => {
  const { isAdmin, loading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchTickets();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      // Fetch users from profiles with roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          display_name,
          created_at
        `);

      if (profilesError) throw profilesError;

      // Get roles separately
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('user_id, role');

      const formattedUsers = profiles?.map(profile => {
        const userRoles = roleData?.filter(r => r.user_id === profile.user_id).map(r => r.role) || [];
        return {
          id: profile.user_id,
          email: profile.user_id, // Temporary: using user_id as email placeholder
          display_name: profile.display_name,
          created_at: profile.created_at,
          roles: userRoles
        };
      }) || [];

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare gli utenti",
        variant: "destructive"
      });
    }
  };

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTickets = data?.map(ticket => ({
        ...ticket,
        user_email: 'N/A', // Placeholder
        user_name: 'N/A'   // Placeholder
      })) || [];

      setTickets(formattedTickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Errore", 
        description: "Impossibile caricare i ticket",
        variant: "destructive"
      });
    }
  };

  const updateUserRole = async (userId: string, role: 'admin' | 'moderator' | 'user', action: 'add' | 'remove') => {
    try {
      if (action === 'add') {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: role });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role);
        if (error) throw error;
      }

      toast({
        title: "Successo",
        description: `Ruolo ${action === 'add' ? 'aggiunto' : 'rimosso'} con successo`
      });

      fetchUsers();
      setShowRoleDialog(false);
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il ruolo",
        variant: "destructive"
      });
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status })
        .eq('id', ticketId);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Stato ticket aggiornato"
      });

      fetchTickets();
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il ticket",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Caricamento...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTickets = tickets.filter(ticket =>
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Amministratore</h1>
          <p className="text-muted-foreground">Gestisci utenti, ticket e impostazioni di sistema</p>
        </div>
        <Badge variant="destructive" className="px-3 py-1">
          <Shield className="h-4 w-4 mr-1" />
          ADMIN
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utenti Totali</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Aperti</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter(t => t.status === 'open').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amministratori</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.roles?.includes('admin')).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Urgenti</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {tickets.filter(t => t.priority === 'critical' && t.status !== 'resolved').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Gestione Utenti</TabsTrigger>
          <TabsTrigger value="tickets">Ticket Supporto</TabsTrigger>
          <TabsTrigger value="settings">Impostazioni</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Utenti Registrati</CardTitle>
              <CardDescription>
                Gestisci gli utenti della piattaforma e i loro ruoli
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca utenti per email o nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Ruoli</TableHead>
                    <TableHead>Registrato</TableHead>
                    <TableHead>Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.display_name || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {user.roles?.map(role => (
                            <Badge key={role} variant={role === 'admin' ? 'destructive' : 'secondary'}>
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString('it-IT')}
                      </TableCell>
                      <TableCell>
                        <Dialog open={showRoleDialog && selectedUser?.id === user.id} onOpenChange={setShowRoleDialog}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Ruoli
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Gestisci Ruoli - {user.email}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Ruoli Attuali:</h4>
                                <div className="flex gap-2">
                                  {user.roles?.map(role => (
                                    <div key={role} className="flex items-center gap-2">
                                      <Badge variant={role === 'admin' ? 'destructive' : 'secondary'}>
                                        {role}
                                      </Badge>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => updateUserRole(user.id, role as 'admin' | 'moderator' | 'user', 'remove')}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">Aggiungi Ruolo:</h4>
                                <div className="flex gap-2">
                                  {['admin', 'moderator', 'user'].filter(role => !user.roles?.includes(role)).map(role => (
                                    <Button
                                      key={role}
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateUserRole(user.id, role as 'admin' | 'moderator' | 'user', 'add')}
                                    >
                                      <UserPlus className="h-3 w-3 mr-1" />
                                      {role}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ticket di Supporto</CardTitle>
              <CardDescription>
                Gestisci le richieste di supporto degli utenti
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca ticket per numero, oggetto o utente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Oggetto</TableHead>
                    <TableHead>Utente</TableHead>
                    <TableHead>Priorità</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono text-sm">
                        {ticket.ticket_number}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {ticket.subject}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{ticket.user_name || 'N/A'}</div>
                          <div className="text-sm text-muted-foreground">{ticket.user_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          ticket.priority === 'critical' ? 'destructive' :
                          ticket.priority === 'high' ? 'default' : 
                          'secondary'
                        }>
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={ticket.status}
                          onValueChange={(value) => updateTicketStatus(ticket.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Aperto</SelectItem>
                            <SelectItem value="in_progress">In Corso</SelectItem>
                            <SelectItem value="waiting_user">In Attesa Utente</SelectItem>
                            <SelectItem value="resolved">Risolto</SelectItem>
                            <SelectItem value="closed">Chiuso</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {new Date(ticket.created_at).toLocaleDateString('it-IT')}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4 mr-1" />
                          Rispondi
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Impostazioni Sistema</CardTitle>
              <CardDescription>
                Configura le impostazioni globali della piattaforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Manutenzione</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Metti la piattaforma in modalità manutenzione
                  </p>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Modalità Manutenzione
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Backup Database</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Crea un backup completo del database
                  </p>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Crea Backup
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Log Sistema</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Visualizza i log di sistema e errori
                  </p>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Visualizza Log
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;