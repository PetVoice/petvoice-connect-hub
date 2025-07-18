import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Brain, 
  BarChart3, 
  Bell,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw
} from 'lucide-react';
import {
  useCommunityPatterns,
  useCrossSpeciesInsights,
  useCommunityTrends,
  useCommunityAnomalies,
  useCommunityStats,
  useAINotifications,
  useMarkNotificationRead,
  useDismissNotification
} from '@/hooks/useCommunityLearning';
import { generateInsights } from '@/utils/insightsGenerator';
import { usePets } from '@/contexts/PetContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

const CommunityInsightsDashboard: React.FC = () => {
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Hook per i dati
  const { data: patterns, isLoading: patternsLoading } = useCommunityPatterns({ 
    species: selectedSpecies.length > 0 ? selectedSpecies : undefined 
  });
  const { data: insights, isLoading: insightsLoading } = useCrossSpeciesInsights();
  const { data: trends, isLoading: trendsLoading } = useCommunityTrends(selectedCategory || undefined);
  const { data: anomalies, isLoading: anomaliesLoading } = useCommunityAnomalies();
  const { data: stats, isLoading: statsLoading } = useCommunityStats();
  const { data: notifications, isLoading: notificationsLoading } = useAINotifications();

  const markAsRead = useMarkNotificationRead();
  const dismissNotification = useDismissNotification();
  const { pets } = usePets();
  const activePet = pets?.[0]; // Use first pet for demo
  const queryClient = useQueryClient();
  
  // Query for generating community insights using existing system
  const { data: communityInsights, isLoading: communityLoading, refetch: refetchInsights } = useQuery({
    queryKey: ['community-insights', activePet?.id],
    queryFn: async () => {
      if (!activePet) return [];
      
      // Fetch data needed for insights
      const [analysisData, diaryData, healthData] = await Promise.all([
        supabase
          .from('pet_analyses')
          .select('*')
          .eq('pet_id', activePet.id)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('diary_entries')
          .select('*')
          .eq('pet_id', activePet.id)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('health_metrics')
          .select('*')
          .eq('pet_id', activePet.id)
          .order('created_at', { ascending: false })
          .limit(20)
      ]);
      
      const insights = generateInsights({
        analysisData: analysisData.data || [],
        diaryData: diaryData.data || [],
        healthData: healthData.data || [],
        wellnessData: [],
        petData: activePet,
        timeRange: 'Last 30 days'
      });
      
      return insights;
    },
    enabled: !!activePet,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const handleProcessData = async () => {
    if (!activePet) return;
    
    try {
      await refetchInsights();
      // Simulate processing community patterns
      const communityPatterns = communityInsights?.filter(insight => 
        insight.category === 'Community Patterns' || 
        insight.category === 'Cross-Species Learning' ||
        insight.category === 'Anomaly Detection'
      ) || [];
      
      console.log('Community patterns discovered:', communityPatterns);
      
      // Update stats based on insights
      queryClient.invalidateQueries({ queryKey: ['community-stats'] });
      
    } catch (error) {
      console.error('Error processing data:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header con pulsante di elaborazione */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Community Learning AI</h1>
          <p className="text-muted-foreground">Insights automatici dai dati della comunità</p>
        </div>
        <Button 
          onClick={handleProcessData}
          disabled={communityLoading}
          className="bg-azure hover:bg-azure-dark text-white"
        >
          {communityLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Elaborando...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Genera Insights
            </>
          )}
        </Button>
      </div>

      {/* Header con statistiche */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pattern Validati</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.validated_patterns || 0}</div>
            <p className="text-xs text-muted-foreground">
              su {stats?.total_patterns || 0} totali
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trend Attivi</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_trends || 0}</div>
            <p className="text-xs text-muted-foreground">
              identificati dalla AI
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Specie Coperte</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.species_coverage || 0}</div>
            <p className="text-xs text-muted-foreground">
              nel database globale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anomalie Aperte</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.open_anomalies || 0}</div>
            <p className="text-xs text-muted-foreground">
              da investigare
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Notifiche AI */}
      {notifications && notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifiche AI Insights
            </CardTitle>
            <CardDescription>
              Aggiornamenti automatici dai sistemi di apprendimento comunitario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.slice(0, 5).map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-3 border rounded-lg ${!notification.is_read ? 'bg-muted/50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getPriorityColor(notification.priority)}>
                          {notification.priority.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-medium">{notification.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), { 
                          addSuffix: true, 
                          locale: it 
                        })}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {!notification.is_read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead.mutate(notification.id)}
                          disabled={markAsRead.isPending}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => dismissNotification.mutate(notification.id)}
                        disabled={dismissNotification.isPending}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs principali */}
      <Tabs defaultValue="patterns" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="patterns">Pattern Globali</TabsTrigger>
          <TabsTrigger value="trends">Trend</TabsTrigger>
          <TabsTrigger value="insights">Cross-Species</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalie</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pattern Comportamentali Globali</CardTitle>
              <CardDescription>
                Pattern scoperti automaticamente dall'analisi dei dati collettivi
              </CardDescription>
            </CardHeader>
            <CardContent>
              {communityLoading ? (
                <div className="flex items-center justify-center p-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {communityInsights?.filter(insight => 
                    insight.category === 'Community Patterns' || 
                    insight.category === 'Cross-Species Learning' ||
                    insight.category === 'Anomaly Detection'
                  ).map((insight) => (
                    <div key={insight.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{insight.type}</Badge>
                            <Badge variant={insight.severity === 'high' || insight.severity === 'critical' ? 'destructive' : 'secondary'}>
                              {insight.severity}
                            </Badge>
                          </div>
                          <h4 className="font-medium">{insight.title}</h4>
                        </div>
                        <div className={`text-sm font-medium ${getConfidenceColor(insight.confidence / 100)}`}>
                          {insight.confidence}% confidence
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <p className="text-muted-foreground">{insight.description}</p>
                        
                        <div>
                          <span className="text-muted-foreground">Category:</span>
                          <p className="font-medium">{insight.category}</p>
                        </div>
                        
                        <div>
                          <span className="text-muted-foreground">Data Points:</span>
                          <p className="font-medium">{insight.evidence?.dataPoints || 0}</p>
                        </div>
                        
                        {insight.recommendation && (
                          <div className="mt-3 p-2 bg-muted rounded">
                            <span className="text-muted-foreground">Recommendation:</span>
                            <p className="font-medium">{insight.recommendation.action}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-muted-foreground p-8">
                      Nessun pattern scoperto. Clicca "Genera Insights" per elaborare i dati.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trend Identificati</CardTitle>
              <CardDescription>
                Tendenze emergenti rilevate automaticamente nei dati globali
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* ... contenuto per trend ... */}
              <div className="text-center text-muted-foreground p-8">
                Feature in sviluppo - Trend analysis
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Transfer Cross-Species</CardTitle>
              <CardDescription>
                Insights applicabili tra diverse specie basati su similitudini comportamentali
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* ... contenuto per cross-species insights ... */}
              <div className="text-center text-muted-foreground p-8">
                Feature in sviluppo - Cross-species insights
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Anomalie Rilevate</CardTitle>
              <CardDescription>
                Comportamenti anomali identificati dai sistemi di monitoraggio AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              {anomaliesLoading ? (
                <div className="flex items-center justify-center p-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {anomalies?.map((anomaly) => (
                    <div key={anomaly.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={getSeverityColor(anomaly.severity)}>
                              {anomaly.severity}
                            </Badge>
                            <Badge variant="outline">{anomaly.anomaly_type}</Badge>
                            <Badge variant="outline">{anomaly.resolution_status}</Badge>
                          </div>
                        </div>
                        <div className={`text-sm font-medium ${getConfidenceColor(anomaly.confidence_score)}`}>
                          {Math.round(anomaly.confidence_score * 100)}% confidence
                        </div>
                      </div>
                      
                      <div className="text-sm space-y-2">
                        <div>
                          <span className="text-muted-foreground">Specie coinvolte:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {anomaly.affected_species.map((species) => (
                              <Badge key={species} variant="outline" className="text-xs">
                                {species}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-muted-foreground">Metodo di rilevamento:</span>
                          <p className="font-medium">{anomaly.detection_method}</p>
                        </div>
                        
                        <div>
                          <span className="text-muted-foreground">Report community:</span>
                          <p className="font-medium">{anomaly.community_reports}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityInsightsDashboard;