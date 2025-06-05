import { useEffect, useState } from "react";
import { usePet } from "@/contexts/PetContext";
import { 
  CalendarEvent, 
  EventType,
  eventColors, 
  getUpcomingEventsForPet,
  loadEvents
} from "@/data/calendarEvents";
import { Calendar, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { isToday, isTomorrow, formatToBrazilianDate } from "@/lib/dateUtils";

const UpcomingEventsWidget = () => {
  const { selectedPet } = usePet();
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  
  useEffect(() => {
    const events = loadEvents();
    const petEvents = getUpcomingEventsForPet(events, selectedPet.id, 30);
    // Get just the first 3 events
    setUpcomingEvents(petEvents.slice(0, 3));
  }, [selectedPet.id]);
  const formatEventDate = (eventDate: Date) => {
    if (isToday(eventDate)) {
      return "Hoje";
    } else if (isTomorrow(eventDate)) {
      return "Amanhã";
    } else {
      return formatToBrazilianDate(eventDate);
    }
  };
  
  if (upcomingEvents.length === 0) {
    return null;
  }
  
  return (
    <Card className="w-full">      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Próximos Eventos</CardTitle>
        <button 
          onClick={() => navigate('/calendar')}
          className="text-xs text-primary flex items-center"
        >
          Ver Todos <ChevronRight className="h-3 w-3" />
        </button>
      </CardHeader>
      <CardContent className="px-2">
        <div className="space-y-3">
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-center p-2 hover:bg-muted/50 rounded-md transition-colors"
              onClick={() => navigate('/calendar')}
            >
              <div
                className="w-2 h-10 rounded-full mr-3"
                style={{ backgroundColor: eventColors[event.type as EventType] }}
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium truncate">{event.title}</h4>
                <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>
                    {formatEventDate(new Date(event.date))} • {event.time}
                  </span>
                </div>
              </div>
              <div className="ml-2">
                <span 
                  className="text-xs px-2 py-1 rounded-full" 
                  style={{ 
                    backgroundColor: `${eventColors[event.type as EventType]}20`,
                    color: eventColors[event.type as EventType] 
                  }}
                >
                  {event.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingEventsWidget;
