import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, isToday } from 'date-fns';
import { it } from 'date-fns/locale';
import { DiaryEntry } from '@/types/diary';

interface DiaryCalendarViewProps {
  currentDate: Date;
  onCurrentDateChange: (date: Date) => void;
  entries: DiaryEntry[];
  onDayClick: (day: Date) => void;
}

export const DiaryCalendarView: React.FC<DiaryCalendarViewProps> = ({
  currentDate,
  onCurrentDateChange,
  entries,
  onDayClick
}) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEntriesForDate = (date: Date) => {
    return entries.filter(entry => 
      isSameDay(parseISO(entry.entry_date), date)
    );
  };

  const getMoodColor = (moodScore: number | null) => {
    if (!moodScore) return 'bg-gray-300';
    if (moodScore <= 3) return 'bg-red-500';
    if (moodScore <= 5) return 'bg-yellow-500';
    if (moodScore <= 7) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <Card className="shadow-elegant">
      <CardContent className="p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCurrentDateChange(subMonths(currentDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h2 className="text-xl font-semibold">
            {format(currentDate, 'MMMM yyyy', { locale: it })}
          </h2>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCurrentDateChange(addMonths(currentDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day) => {
            const dayEntries = getEntriesForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const todayDate = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={`
                  relative aspect-square p-2 border rounded-lg cursor-pointer transition-colors
                  ${isCurrentMonth ? 'bg-background hover:bg-muted/50' : 'bg-muted/20 text-muted-foreground'}
                  ${todayDate ? 'ring-2 ring-primary' : ''}
                `}
                onClick={() => onDayClick(day)}
              >
                <div className="text-sm">{format(day, 'd')}</div>
                {(() => {
                  if (dayEntries.length === 0) return null;
                  
                  return (
                    <div className="absolute inset-2 flex flex-col justify-center">
                      {dayEntries.length > 1 && (
                        <div className="text-xs text-center mb-1 bg-primary text-primary-foreground rounded px-1">
                          {dayEntries.length}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {dayEntries.slice(0, 3).map((entry, index) => (
                          <div
                            key={entry.id}
                            className={`w-2 h-2 rounded-full ${getMoodColor(entry.mood_score)}`}
                            title={entry.title || 'Voce senza titolo'}
                          />
                        ))}
                        {dayEntries.length > 3 && (
                          <div className="text-xs">+{dayEntries.length - 3}</div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};