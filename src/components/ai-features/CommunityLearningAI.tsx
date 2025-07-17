import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  TrendingUp, 
  Users, 
  Brain, 
  AlertTriangle,
  CheckCircle,
  Eye,
  Share2,
  Filter,
  ArrowRight
} from 'lucide-react';

interface GlobalPattern {
  id: string;
  pattern: string;
  description: string;
  confidence: number;
  affectedSpecies: string[];
  geographicRegions: string[];
  timeframe: string;
  sampleSize: number;
  isAnomaly: boolean;
  impact: 'low' | 'medium' | 'high';
}

interface KnowledgeTransfer {
  id: string;
  sourceSpecies: string;
  targetSpecies: string;
  knowledge: string;
  successRate: number;
  applications: number;
  validationScore: number;
}

interface CommunityBenchmark {
  id: string;
  metric: string;
  userValue: number;
  communityAverage: number;
  topPercentile: number;
  ranking: number;
  totalUsers: number;
  improvement: number;
}

const mockGlobalPatterns: GlobalPattern[] = [
  {
    id: '1',
    pattern: 'Seasonal Anxiety Spike',
    description: 'Aumento significativo dei livelli di ansia durante i cambi di stagione',
    confidence: 94,
    affectedSpecies: ['Cani', 'Gatti'],
    geographicRegions: ['Europa', 'Nord America'],
    timeframe: 'Ultimi 6 mesi',
    sampleSize: 12847,
    isAnomaly: false,
    impact: 'high'
  },
  {
    id: '2',
    pattern: 'Urban Stress Correlation',
    description: 'Correlazione tra densità urbana e comportamenti compulsivi',
    confidence: 87,
    affectedSpecies: ['Cani'],
    geographicRegions: ['Città metropolitane'],
    timeframe: 'Anno corrente',
    sampleSize: 8923,
    isAnomaly: false,
    impact: 'medium'
  },
  {
    id: '3',
    pattern: 'Nutrition-Mood Link',
    description: 'Legame tra cambiamenti nutrizionali e stabilità emotiva',
    confidence: 91,
    affectedSpecies: ['Cani', 'Gatti', 'Conigli'],
    geographicRegions: ['Globale'],
    timeframe: 'Ultimi 3 mesi',
    sampleSize: 15632,
    isAnomaly: true,
    impact: 'high'
  }
];

const mockKnowledgeTransfers: KnowledgeTransfer[] = [
  {
    id: '1',
    sourceSpecies: 'Cani',
    targetSpecies: 'Gatti',
    knowledge: 'Tecniche di socializzazione graduale',
    successRate: 78,
    applications: 1247,
    validationScore: 85
  },
  {
    id: '2',
    sourceSpecies: 'Cavalli',
    targetSpecies: 'Cani',
    knowledge: 'Gestione ansia da separazione',
    successRate: 82,
    applications: 892,
    validationScore: 90
  },
  {
    id: '3',
    sourceSpecies: 'Gatti',
    targetSpecies: 'Conigli',
    knowledge: 'Arricchimento ambientale',
    successRate: 73,
    applications: 456,
    validationScore: 78
  }
];

const mockBenchmarks: CommunityBenchmark[] = [
  {
    id: '1',
    metric: 'Tempo di Risposta ai Trigger',
    userValue: 3.2,
    communityAverage: 4.1,
    topPercentile: 2.1,
    ranking: 1847,
    totalUsers: 8942,
    improvement: 12
  },
  {
    id: '2',
    metric: 'Stabilità Emotiva',
    userValue: 7.8,
    communityAverage: 6.9,
    topPercentile: 8.9,
    ranking: 2341,
    totalUsers: 8942,
    improvement: 8
  },
  {
    id: '3',
    metric: 'Successo Training',
    userValue: 84,
    communityAverage: 76,
    topPercentile: 92,
    ranking: 1203,
    totalUsers: 8942,
    improvement: 15
  }
];

export const CommunityLearningAI: React.FC = () => {
  const [selectedPattern, setSelectedPattern] = useState<GlobalPattern | null>(null);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (userValue: number, average: number) => {
    if (userValue > average * 1.1) return 'text-green-600';
    if (userValue < average * 0.9) return 'text-red-600';
    return 'text-blue-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Community Learning AI
          </CardTitle>
          <CardDescription>
            Insights globali e knowledge transfer dal collettivo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {/* Global Patterns */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Pattern Globali Scoperti
              </h3>
              <div className="grid gap-3">
                {mockGlobalPatterns.map((pattern) => (
                  <Card key={pattern.id} className="cursor-pointer hover:bg-accent/50"
                        onClick={() => setSelectedPattern(pattern)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{pattern.pattern}</h4>
                            <Badge className={getImpactColor(pattern.impact)}>
                              {pattern.impact} impact
                            </Badge>
                            {pattern.isAnomaly && (
                              <Badge variant="outline" className="border-orange-500 text-orange-600">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Anomalia
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {pattern.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {pattern.sampleSize.toLocaleString()} campioni
                            </span>
                            <span className="flex items-center gap-1">
                              <Brain className="h-3 w-3" />
                              {pattern.confidence}% confidenza
                            </span>
                            <span>{pattern.timeframe}</span>
                          </div>
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-1">
                              {pattern.affectedSpecies.map((species, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {species}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">{pattern.confidence}%</div>
                            <div className="text-xs text-muted-foreground">Confidenza</div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Knowledge Transfer */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Knowledge Transfer Cross-Species
              </h3>
              <div className="grid gap-3">
                {mockKnowledgeTransfers.map((transfer) => (
                  <Card key={transfer.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{transfer.knowledge}</h4>
                          <p className="text-sm text-muted-foreground">
                            {transfer.sourceSpecies} → {transfer.targetSpecies}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600">{transfer.successRate}%</div>
                          <div className="text-xs text-muted-foreground">Successo</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span>{transfer.applications} applicazioni</span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {transfer.validationScore}% validazione
                        </span>
                      </div>
                      <div className="mt-3">
                        <Progress value={transfer.validationScore} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Community Benchmarks */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Benchmark Anonimi Community
              </h3>
              <div className="grid gap-3">
                {mockBenchmarks.map((benchmark) => (
                  <Card key={benchmark.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{benchmark.metric}</h4>
                          <p className="text-sm text-muted-foreground">
                            Ranking #{benchmark.ranking.toLocaleString()} di {benchmark.totalUsers.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-xl font-bold ${getPerformanceColor(benchmark.userValue, benchmark.communityAverage)}`}>
                            {benchmark.userValue}
                          </div>
                          <div className="text-xs text-muted-foreground">Il tuo valore</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-gray-600">{benchmark.communityAverage}</div>
                          <div className="text-xs text-muted-foreground">Media</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-blue-600">{benchmark.topPercentile}</div>
                          <div className="text-xs text-muted-foreground">Top 10%</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600">+{benchmark.improvement}%</div>
                          <div className="text-xs text-muted-foreground">Miglioramento</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Anomaly Detection Alert */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Anomalia Rilevata:</strong> Il pattern "Nutrition-Mood Link" mostra correlazioni 
                inaspettate. La community sta investigando possibili cause stagionali.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};