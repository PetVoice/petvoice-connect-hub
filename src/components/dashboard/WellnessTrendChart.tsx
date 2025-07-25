import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Calendar, Heart, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface WellnessTrendChartProps {
  petId: string;
  userId: string;
}

const WellnessTrendChart: React.FC<WellnessTrendChartProps> = ({ petId, userId }) => {
  console.log('WellnessTrendChart rendered with:', { petId, userId });
  
  // Dati di esempio per ora per vedere se si visualizza
  const mockData = [
    { date: '20/12', score: 75 },
    { date: '21/12', score: 80 },
    { date: '22/12', score: 85 },
    { date: '23/12', score: 78 },
    { date: '24/12', score: 82 },
    { date: '25/12', score: 88 },
    { date: '26/12', score: 90 }
  ];

  return (
    <Card className="petvoice-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Trend Benessere Generale
            </CardTitle>
            <CardDescription>
              Monitora l'andamento complessivo della salute e benessere
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-success/10 text-success">
              Ottimo
            </Badge>
            <span className="text-2xl font-bold">88/100</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockData}>
              <defs>
                <linearGradient id="wellnessGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                domain={[0, 100]}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{label}</p>
                        <p className="text-sm">
                          <span className="font-medium text-primary">Benessere: </span>
                          {data.score}/100
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#wellnessGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between text-sm mt-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <span>+15% rispetto alla settimana scorsa</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span>Basato su tutti i fattori di salute</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WellnessTrendChart;