import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, isToday } from 'date-fns';
import { it } from 'date-fns/locale';
import { CalendarEvent, EVENT_CATEGORIES } from '@/types/calendar';

interface CalendarViewProps {
  currentDate: Date;
  onCurrentDateChange: (date: Date) => void;
  events: CalendarEvent[];
  onDayClick: (day: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentDate,
  onCurrentDateChange,
  events,
  onDayClick,
  onEventClick
}) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      isSameDay(parseISO(event.start_time), date)
    );
  };

  const getCategoryInfo = (category: string) => {
    return EVENT_CATEGORIES[category as keyof typeof EVENT_CATEGORIES] || EVENT_CATEGORIES.other;
  };

  const getCategoryColor = (category: string) => {
    const categoryInfo = getCategoryInfo(category);
    // Extract background color for dots
    if (categoryInfo.color.includes('bg-red-500')) return 'bg-red-500';
    if (categoryInfo.color.includes('bg-blue-500')) return 'bg-blue-500';
    if (categoryInfo.color.includes('bg-green-500')) return 'bg-green-500';
    if (categoryInfo.color.includes('bg-yellow-500')) return 'bg-yellow-500';
    if (categoryInfo.color.includes('bg-purple-500')) return 'bg-purple-500';
    if (categoryInfo.color.includes('bg-orange-500')) return 'bg-orange-500';
    if (categoryInfo.color.includes('bg-indigo-500')) return 'bg-indigo-500';
    return 'bg-gray-500';
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
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const todayDate = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={`
                  relative min-h-24 p-2 border rounded-lg cursor-pointer transition-colors
                  ${isCurrentMonth ? 'bg-background hover:bg-muted/50' : 'bg-muted/20 text-muted-foreground'}
                  ${todayDate ? 'ring-2 ring-primary' : ''}
                `}
                onClick={() => onDayClick(day)}
              >
                <div className="text-sm font-medium mb-1">{format(day, 'd')}</div>
                
                {(() => {
                  if (dayEvents.length === 0) return null;
                  
                  return (
                    <div className="absolute inset-2 flex flex-col justify-center">
                      {dayEvents.length > 1 && (
                        <div className="text-xs text-center mb-1 bg-primary text-primary-foreground rounded px-1">
                          {dayEvents.length}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {dayEvents.slice(0, 4).map((event, index) => (
                          <div
                            key={event.id}
                            className={`w-2 h-2 rounded-full ${getCategoryColor(event.category)}`}
                            title={`${getCategoryInfo(event.category).icon} ${event.title}`}
                          />
                        ))}
                        {dayEvents.length > 4 && (
                          <div className="text-xs">+{dayEvents.length - 4}</div>
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