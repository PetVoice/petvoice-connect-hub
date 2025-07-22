import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EVENT_CATEGORIES, EVENT_STATUS } from '@/types/calendar';

interface CalendarLegendProps {
  show: boolean;
}

export const CalendarLegend: React.FC<CalendarLegendProps> = ({ show }) => {
  if (!show) return null;

  return (
    <Card className="shadow-elegant animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg">Legenda Calendario</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Event Categories */}
        <div>
          <h4 className="font-medium mb-3">Categorie Eventi</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {Object.entries(EVENT_CATEGORIES).map(([key, category]) => (
              <Badge key={key} className={`${category.color} text-center justify-center`}>
                {category.icon} {category.label}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Event Status */}
        <div>
          <h4 className="font-medium mb-3">Stati Eventi</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
            {Object.entries(EVENT_STATUS).map(([key, status]) => {
              const statusEmoji = {
                scheduled: '📅',
                completed: '✅', 
                cancelled: '❌',
                rescheduled: '🔄'
              }[key] || '📅';
              
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-lg">{statusEmoji}</span>
                  <span className="text-xs">{status}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Visual Indicators */}
        <div>
          <h4 className="font-medium mb-3">Indicatori Visivi</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-red-500"></div>
              <span>🏥 Eventi Medici - Visite veterinarie, controlli</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-blue-500"></div>
              <span>✂️ Toelettatura - Bagni, spazzolatura, cure</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span>🎓 Addestramento - Lezioni, training</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-yellow-500"></div>
              <span>🐕 Socializzazione - Incontri con altri cani</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-purple-500"></div>
              <span>🏃 Esercizio - Passeggiate, giochi, sport</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-orange-500"></div>
              <span>🍽️ Alimentazione - Pasti, snack speciali</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-indigo-500"></div>
              <span>✈️ Viaggi - Spostamenti, vacanze</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-gray-500"></div>
              <span>📅 Altri eventi</span>
            </div>
          </div>
        </div>
        
        {/* Time Indicators */}
        <div>
          <h4 className="font-medium mb-3">Indicazioni Temporali</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-xs bg-muted px-2 py-1 rounded">🕒</span>
              <span>Eventi con orario specifico</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs bg-muted px-2 py-1 rounded">📅</span>
              <span>Eventi per tutto il giorno</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs bg-muted px-2 py-1 rounded">📍</span>
              <span>Eventi con location specificata</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};