import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, isToday, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
import { it } from 'date-fns/locale';
import { DiaryEntry } from '@/types/diary';

interface DiaryCalendarViewProps {
  currentDate: Date;
  onCurrentDateChange: (date: Date) => void;
  entries: DiaryEntry[];
  onDayClick: (day: Date) => void;
  viewMode: 'month' | 'week' | 'day';
}

export const DiaryCalendarView: React.FC<DiaryCalendarViewProps> = ({
  currentDate,
  onCurrentDateChange,
  entries,
  onDayClick,
  viewMode
}) => {
  // Calculate date ranges based on view mode
  const getDateRange = () => {
    switch (viewMode) {
      case 'week':
        return {
          start: startOfWeek(currentDate, { locale: it }),
          end: endOfWeek(currentDate, { locale: it })
        };
      case 'day':
        return {
          start: currentDate,
          end: currentDate
        };
      default: // month
        return {
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate)
        };
    }
  };

  const { start, end } = getDateRange();
  const calendarDays = eachDayOfInterval({ start, end });

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

  // Navigation functions
  const navigatePrevious = () => {
    switch (viewMode) {
      case 'week':
        onCurrentDateChange(subWeeks(currentDate, 1));
        break;
      case 'day':
        onCurrentDateChange(addDays(currentDate, -1));
        break;
      default: // month
        onCurrentDateChange(subMonths(currentDate, 1));
        break;
    }
  };

  const navigateNext = () => {
    switch (viewMode) {
      case 'week':
        onCurrentDateChange(addWeeks(currentDate, 1));
        break;
      case 'day':
        onCurrentDateChange(addDays(currentDate, 1));
        break;
      default: // month
        onCurrentDateChange(addMonths(currentDate, 1));
        break;
    }
  };

  // Format header text based on view mode
  const getHeaderText = () => {
    switch (viewMode) {
      case 'week':
        return `${format(start, 'dd MMM', { locale: it })} - ${format(end, 'dd MMM yyyy', { locale: it })}`;
      case 'day':
        return format(currentDate, 'dd MMMM yyyy', { locale: it });
      default: // month
        return format(currentDate, 'MMMM yyyy', { locale: it });
    }
  };

  return (
    <Card className="bg-primary/10 border border-primary/20 shadow-elegant">
      <CardContent className="p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={navigatePrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h2 className="text-xl font-semibold">
            {getHeaderText()}
          </h2>
          
          <Button
            variant="outline"
            size="sm"
            onClick={navigateNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Days of Week Header (only for month and week view) */}
        {viewMode !== 'day' && (
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>
        )}

        {/* Calendar Grid */}
        <div className={`gap-2 ${
          viewMode === 'day' ? 'flex flex-col' : 
          viewMode === 'week' ? 'grid grid-cols-7' : 
          'grid grid-cols-7'
        }`}>
          {calendarDays.map((day) => {
            const dayEntries = getEntriesForDate(day);
            const isCurrentMonth = viewMode === 'month' ? isSameMonth(day, currentDate) : true;
            const todayDate = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={`
                  relative ${viewMode === 'day' ? 'min-h-96 mb-4' : 'aspect-square h-24'} p-2 border border-primary/20 rounded-lg cursor-pointer transition-all duration-200
                  ${isCurrentMonth ? 'bg-white hover:bg-primary/20 hover:shadow-glow hover:scale-[1.02]' : 'bg-white/50 text-muted-foreground hover:bg-primary/10'}
                  ${todayDate ? 'ring-2 ring-primary bg-primary/10' : ''}
                `}
                onClick={() => onDayClick(day)}
              >
                <div className="text-sm">
                  {format(day, viewMode === 'day' ? 'EEEE dd MMMM' : 'd', { locale: it })}
                </div>
                {viewMode === 'day' ? (
                  // Day view: show full entry list with mood and content
                  <div className="space-y-2 mt-2">
                    {dayEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="p-2 bg-muted/50 rounded border-l-4 border-primary"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`w-3 h-3 rounded-full ${getMoodColor(entry.mood_score)}`}
                            title={`Umore: ${entry.mood_score}/10`}
                          />
                          <span className="font-medium text-sm">
                            {entry.title || 'Voce senza titolo'}
                          </span>
                        </div>
                        {entry.content && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {entry.content}
                          </p>
                        )}
                        {entry.behavioral_tags && entry.behavioral_tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {entry.behavioral_tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="text-xs bg-primary/10 text-primary px-1 rounded">
                                {tag}
                              </span>
                            ))}
                            {entry.behavioral_tags.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{entry.behavioral_tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  // Month/Week view: show dots
                  (() => {
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
                  })()
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};