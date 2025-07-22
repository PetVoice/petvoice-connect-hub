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
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => {
                    const categoryInfo = getCategoryInfo(event.category);
                    return (
                      <div
                        key={event.id}
                        className={`text-xs p-1 rounded cursor-pointer transition-all hover:scale-105 ${categoryInfo.color}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                        title={event.title}
                      >
                        <div className="flex items-center gap-1">
                          <span>{categoryInfo.icon}</span>
                          <span className="truncate flex-1">{event.title}</span>
                        </div>
                        {!event.is_all_day && (
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-2 w-2" />
                            <span>{format(parseISO(event.start_time), 'HH:mm')}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-muted-foreground text-center py-1">
                      +{dayEvents.length - 2} altri
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};