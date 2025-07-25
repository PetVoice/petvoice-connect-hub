import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, isToday, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
import { it } from 'date-fns/locale';
import { CalendarEvent, EVENT_CATEGORIES } from '@/types/calendar';

interface CalendarViewProps {
  currentDate: Date;
  onCurrentDateChange: (date: Date) => void;
  events: CalendarEvent[];
  onDayClick: (day: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  viewMode: 'month' | 'week' | 'day';
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentDate,
  onCurrentDateChange,
  events,
  onDayClick,
  onEventClick,
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
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = viewMode === 'month' ? isSameMonth(day, currentDate) : true;
            const todayDate = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={`
                  relative ${viewMode === 'day' ? 'min-h-96 mb-4' : 'aspect-square h-24'} p-2 border border-primary/20 rounded-lg cursor-pointer transition-all duration-200
                  ${isCurrentMonth ? 'bg-primary/10 hover:bg-primary/20 hover:shadow-glow hover:scale-[1.02]' : 'bg-primary/5 text-muted-foreground hover:bg-primary/10'}
                  ${todayDate ? 'ring-2 ring-primary bg-primary/20' : ''}
                `}
                onClick={() => onDayClick(day)}
              >
                <div className="text-sm font-medium mb-1">
                  {format(day, viewMode === 'day' ? 'EEEE dd MMMM' : 'd', { locale: it })}
                </div>
                
                {viewMode === 'day' ? (
                  // Day view: show full event list
                  <div className="space-y-2">
                    {dayEvents.map((event) => {
                      const categoryInfo = getCategoryInfo(event.category);
                      return (
                        <div
                          key={event.id}
                          className={`p-2 rounded cursor-pointer transition-all hover:scale-105 ${categoryInfo.color}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(event);
                          }}
                          title={event.title}
                        >
                          <div className="flex items-center gap-2">
                            <span>{categoryInfo.icon}</span>
                            <span className="font-medium">{event.title}</span>
                          </div>
                          {!event.is_all_day && (
                            <div className="flex items-center gap-1 mt-1 text-sm">
                              <Clock className="h-3 w-3" />
                              <span>
                                {format(parseISO(event.start_time), 'HH:mm')} - {format(parseISO(event.end_time || event.start_time), 'HH:mm')}
                              </span>
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-1 mt-1 text-sm">
                              <MapPin className="h-3 w-3" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Month/Week view: show dots
                  (() => {
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