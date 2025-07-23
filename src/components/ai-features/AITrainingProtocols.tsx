import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Play, 
  Pause, 
  SkipForward, 
  Square, 
  Clock, 
  Target, 
  TrendingUp,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Calendar,
  Filter,
  Search,
  BarChart3,
  Heart,
  Shield,
  Zap,
  Moon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Protocol {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration_days: number;
  current_day: number;
  progress_percentage: number;
  status: string;
  target_behavior: string;
  triggers: string[];
  required_materials: string[];
  success_rate: number;
  ai_generated: boolean;
  is_public: boolean;
  veterinary_approved: boolean;
  community_rating: number;
  community_usage: number;
  mentor_recommended: boolean;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

interface Pet {
  id: string;
  name: string;
  type: string;
}

interface AITrainingProtocolsProps {
  selectedPet: Pet;
}

export const AITrainingProtocols: React.FC<AITrainingProtocolsProps> = ({ selectedPet }) => {
  const { toast } = useToast();
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [filteredProtocols, setFilteredProtocols] = useState<Protocol[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('available');

  // Carica protocolli dal database
  const fetchProtocols = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('ai_training_protocols')
        .select('*');

      if (activeTab === 'available') {
        query = query.or('is_public.eq.true,user_id.is.null');
      } else if (activeTab === 'active') {
        query = query.eq('status', 'active');
      } else if (activeTab === 'completed') {
        query = query.eq('status', 'completed');
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setProtocols((data || []).map(protocol => ({
        ...protocol,
        progress_percentage: typeof protocol.progress_percentage === 'string' 
          ? parseInt(protocol.progress_percentage) || 0 
          : protocol.progress_percentage || 0,
        triggers: Array.isArray(protocol.triggers) ? protocol.triggers.map(t => String(t)) : [],
        required_materials: Array.isArray(protocol.required_materials) ? protocol.required_materials.map(m => String(m)) : [],
        category: protocol.category || 'comportamento',
        description: protocol.description || '',
        title: protocol.title || '',
        difficulty: protocol.difficulty || 'medio', 
        target_behavior: protocol.target_behavior || '',
        community_usage: typeof protocol.community_usage === 'string' 
          ? parseInt(protocol.community_usage) || 0 
          : protocol.community_usage || 0,
        success_rate: protocol.success_rate || 0,
        community_rating: protocol.community_rating || 0,
        ai_generated: protocol.ai_generated || false,
        is_public: protocol.is_public || false,
        veterinary_approved: protocol.veterinary_approved || false,
        mentor_recommended: protocol.mentor_recommended || false
      })));
    } catch (error) {
      console.error('Errore nel caricamento protocolli:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i protocolli",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtra protocolli in base ai criteri
  useEffect(() => {
    let filtered = protocols;

    // Filtro di ricerca
    if (searchQuery) {
      filtered = filtered.filter(protocol => 
        protocol.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        protocol.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        protocol.target_behavior.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtri per status, difficulty, category
    if (statusFilter !== 'all') {
      filtered = filtered.filter(protocol => protocol.status === statusFilter);
    }
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(protocol => protocol.difficulty === difficultyFilter);
    }
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(protocol => protocol.category === categoryFilter);
    }

    setFilteredProtocols(filtered);
  }, [protocols, searchQuery, statusFilter, difficultyFilter, categoryFilter]);

  // Carica protocolli all'avvio e quando cambia tab
  useEffect(() => {
    fetchProtocols();
  }, [activeTab]);

  // Avvia un protocollo
  const startProtocol = async (protocolId: string) => {
    try {
      const { error } = await supabase
        .from('ai_training_protocols')
        .update({ 
          status: 'active',
          current_day: 1,
          progress_percentage: '0',
          last_activity_at: new Date().toISOString()
        })
        .eq('id', protocolId);

      if (error) throw error;

      toast({
        title: "Protocollo avviato",
        description: "Il protocollo è stato avviato con successo",
      });

      fetchProtocols();
    } catch (error) {
      console.error('Errore nell\'avvio del protocollo:', error);
      toast({
        title: "Errore",
        description: "Impossibile avviare il protocollo",
        variant: "destructive"
      });
    }
  };

  // Ferma un protocollo
  const stopProtocol = async (protocolId: string) => {
    try {
      const { error } = await supabase
        .from('ai_training_protocols')
        .update({ 
          status: 'stopped',
          last_activity_at: new Date().toISOString()
        })
        .eq('id', protocolId);

      if (error) throw error;

      toast({
        title: "Protocollo fermato",
        description: "Il protocollo è stato interrotto",
      });

      fetchProtocols();
    } catch (error) {
      console.error('Errore nel fermare il protocollo:', error);
      toast({
        title: "Errore",
        description: "Impossibile fermare il protocollo",
        variant: "destructive"
      });
    }
  };

  // Riavvia un protocollo
  const restartProtocol = async (protocolId: string) => {
    try {
      const { error } = await supabase
        .from('ai_training_protocols')
        .update({ 
          status: 'active',
          current_day: 1,
          progress_percentage: '0',
          last_activity_at: new Date().toISOString()
        })
        .eq('id', protocolId);

      if (error) throw error;

      toast({
        title: "Protocollo riavviato",
        description: "Il protocollo è stato riavviato da capo",
      });

      fetchProtocols();
    } catch (error) {
      console.error('Errore nel riavviare il protocollo:', error);
      toast({
        title: "Errore",
        description: "Impossibile riavviare il protocollo",
        variant: "destructive"
      });
    }
  };

  // Ottieni icona per categoria
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'comportamento':
        return Brain;
      case 'socializzazione':
        return Heart;
      case 'ansia':
        return Shield;
      case 'energia':
        return Zap;
      case 'rilassamento':
        return Moon;
      default:
        return Target;
    }
  };

  // Ottieni colore per difficoltà
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'facile':
        return 'bg-green-500';
      case 'medio':
        return 'bg-yellow-500';
      case 'difficile':
        return 'bg-orange-500';
      case 'esperto':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Ottieni colore per status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-green-600';
      case 'completed':
        return 'text-blue-600';
      case 'stopped':
        return 'text-red-600';
      case 'available':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  // Formatta status per display
  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Attivo';
      case 'completed':
        return 'Completato';
      case 'stopped':
        return 'Interrotto';
      case 'available':
        return 'Disponibile';
      default:
        return status;
    }
  };

  // Formatta difficoltà per display
  const getDifficultyText = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'facile':
        return 'Facile';
      case 'medio':
        return 'Medio';
      case 'difficile':
        return 'Difficile';
      case 'esperto':
        return 'Esperto';
      default:
        return difficulty;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Protocolli di Training AI</h2>
          <p className="text-muted-foreground">Programmi personalizzati per {selectedPet.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            AI-Generated
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Disponibili</TabsTrigger>
          <TabsTrigger value="active">Attivi</TabsTrigger>
          <TabsTrigger value="completed">Completati</TabsTrigger>
        </TabsList>

        {/* Filtri */}
        <div className="flex items-center gap-4 py-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca protocolli..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti</SelectItem>
              <SelectItem value="available">Disponibili</SelectItem>
              <SelectItem value="active">Attivi</SelectItem>
              <SelectItem value="completed">Completati</SelectItem>
              <SelectItem value="stopped">Interrotti</SelectItem>
            </SelectContent>
          </Select>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Difficoltà" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte</SelectItem>
              <SelectItem value="facile">Facile</SelectItem>
              <SelectItem value="medio">Medio</SelectItem>
              <SelectItem value="difficile">Difficile</SelectItem>
              <SelectItem value="esperto">Esperto</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte</SelectItem>
              <SelectItem value="comportamento">Comportamento</SelectItem>
              <SelectItem value="socializzazione">Socializzazione</SelectItem>
              <SelectItem value="ansia">Ansia</SelectItem>
              <SelectItem value="energia">Energia</SelectItem>
              <SelectItem value="rilassamento">Rilassamento</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content per ogni tab */}
        <TabsContent value="available" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredProtocols.map((protocol) => {
                const CategoryIcon = getCategoryIcon(protocol.category);
                return (
                  <Card key={protocol.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`p-3 rounded-full ${getDifficultyColor(protocol.difficulty)} text-white`}>
                            <CategoryIcon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold">{protocol.title}</h3>
                              <Badge variant="outline" className={getStatusColor(protocol.status)}>
                                {getStatusText(protocol.status)}
                              </Badge>
                              {protocol.ai_generated && (
                                <Badge variant="secondary">AI</Badge>
                              )}
                              {protocol.veterinary_approved && (
                                <Badge variant="outline" className="text-green-600">Vet Approved</Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground mb-3">{protocol.description}</p>
                            <div className="flex items-center gap-4 mb-3">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{protocol.duration_days} giorni</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{protocol.target_behavior}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{protocol.success_rate}% successo</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{getDifficultyText(protocol.difficulty)}</Badge>
                              <Badge variant="outline">{protocol.category}</Badge>
                              {protocol.community_rating > 0 && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                  <span className="text-xs">{protocol.community_rating.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm"
                            onClick={() => setSelectedProtocol(protocol)}
                            variant="outline"
                          >
                            Dettagli
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => startProtocol(protocol.id)}
                            disabled={loading}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Avvia
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {filteredProtocols.length === 0 && !loading && (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nessun protocollo trovato</h3>
                  <p className="text-muted-foreground">Prova a modificare i filtri di ricerca</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredProtocols.filter(p => p.status === 'active').map((protocol) => {
                const CategoryIcon = getCategoryIcon(protocol.category);
                return (
                  <Card key={protocol.id} className="border-green-200 bg-green-50/30">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-3 rounded-full bg-green-500 text-white">
                            <CategoryIcon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">{protocol.title}</h3>
                            <p className="text-muted-foreground mb-3">{protocol.description}</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Attivo</Badge>
                      </div>
                      
                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Progresso</span>
                          <span className="text-sm text-muted-foreground">
                            Giorno {protocol.current_day} di {protocol.duration_days}
                          </span>
                        </div>
                        <Progress value={protocol.progress_percentage} className="h-2" />
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-muted-foreground">
                            {protocol.progress_percentage}% completato
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Calendar className="h-4 w-4 mr-1" />
                          Programma
                        </Button>
                        <Button size="sm" variant="outline">
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Analytics
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => restartProtocol(protocol.id)}
                        >
                          Riavvia
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => stopProtocol(protocol.id)}
                        >
                          <Square className="h-4 w-4 mr-1" />
                          Ferma
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {filteredProtocols.filter(p => p.status === 'active').length === 0 && !loading && (
                <div className="text-center py-8">
                  <Play className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nessun protocollo attivo</h3>
                  <p className="text-muted-foreground">Avvia un protocollo dalla sezione "Disponibili"</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredProtocols.filter(p => p.status === 'completed').map((protocol) => {
                const CategoryIcon = getCategoryIcon(protocol.category);
                return (
                  <Card key={protocol.id} className="border-blue-200 bg-blue-50/30">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-3 rounded-full bg-blue-500 text-white">
                            <CheckCircle className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold">{protocol.title}</h3>
                              <Badge className="bg-blue-100 text-blue-800">Completato</Badge>
                            </div>
                            <p className="text-muted-foreground mb-3">{protocol.description}</p>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm">100% completato</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{protocol.success_rate}% efficacia</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <BarChart3 className="h-4 w-4 mr-1" />
                            Report
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => restartProtocol(protocol.id)}
                          >
                            Ripeti
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {filteredProtocols.filter(p => p.status === 'completed').length === 0 && !loading && (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nessun protocollo completato</h3>
                  <p className="text-muted-foreground">I protocolli completati appariranno qui</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dettagli Protocollo Modal/Sidebar */}
      {selectedProtocol && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {React.createElement(getCategoryIcon(selectedProtocol.category), { className: "h-5 w-5" })}
                {selectedProtocol.title}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedProtocol(null)}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{selectedProtocol.description}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium">Durata:</span>
                <p className="text-sm text-muted-foreground">{selectedProtocol.duration_days} giorni</p>
              </div>
              <div>
                <span className="text-sm font-medium">Difficoltà:</span>
                <p className="text-sm text-muted-foreground">{getDifficultyText(selectedProtocol.difficulty)}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Categoria:</span>
                <p className="text-sm text-muted-foreground">{selectedProtocol.category}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Tasso di successo:</span>
                <p className="text-sm text-muted-foreground">{selectedProtocol.success_rate}%</p>
              </div>
            </div>

            <div>
              <span className="text-sm font-medium">Comportamento obiettivo:</span>
              <p className="text-sm text-muted-foreground">{selectedProtocol.target_behavior}</p>
            </div>

            {selectedProtocol.triggers && selectedProtocol.triggers.length > 0 && (
              <div>
                <span className="text-sm font-medium">Triggers:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedProtocol.triggers.map((trigger, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {trigger}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {selectedProtocol.required_materials && selectedProtocol.required_materials.length > 0 && (
              <div>
                <span className="text-sm font-medium">Materiali necessari:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedProtocol.required_materials.map((material, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {material}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-4">
              <Button 
                onClick={() => startProtocol(selectedProtocol.id)}
                disabled={loading}
              >
                <Play className="h-4 w-4 mr-1" />
                Avvia Protocollo  
              </Button>
              <Button variant="outline" onClick={() => setSelectedProtocol(null)}>
                Chiudi
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};