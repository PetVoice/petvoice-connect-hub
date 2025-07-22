import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DIARY_CATEGORIES, MOOD_LABELS } from '@/types/diary';

interface DiaryLegendProps {
  show: boolean;
}

export const DiaryLegend: React.FC<DiaryLegendProps> = ({ show }) => {
  if (!show) return null;

  return (
    <Card className="shadow-elegant animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg">Legenda Diario</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mood Categories */}
        <div>
          <h4 className="font-medium mb-3">Categorie Umore</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {Object.entries(DIARY_CATEGORIES).map(([key, category]) => (
              <Badge key={key} className={`${category.color} text-center justify-center`}>
                {category.label}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Mood Scale */}
        <div>
          <h4 className="font-medium mb-3">Scala Umore (1-10)</h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
            {Object.entries(MOOD_LABELS).map(([score, label]) => (
              <div key={score} className="flex items-center gap-2">
                <span className="font-mono text-xs w-6 text-center bg-muted rounded px-1">
                  {score}
                </span>
                <span className="text-xs">{label}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Visual Indicators */}
        <div>
          <h4 className="font-medium mb-3">Indicatori Visivi</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span>Umore alto (8-10)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span>Umore buono (6-7)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span>Umore neutro/basso (3-5)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span>Umore molto basso (1-2)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-gray-300"></div>
              <span>Nessun dato umore</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};