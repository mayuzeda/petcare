import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { 
  CalendarEvent,
  getEventsForReminder,
  loadEvents,
  EventType,
  eventColors
} from "@/data/calendarEvents";
import { Calendar } from "lucide-react";

/**
 * Component that checks for upcoming events and shows reminders
 * This component doesn't render anything visually, it just provides the reminder functionality
 */
const CalendarReminder = () => {
  const { toast } = useToast();

  // Check for reminders when the component mounts
  useEffect(() => {
    const checkReminders = () => {
      const events = loadEvents();
      const reminders = getEventsForReminder(events);
      
      // Show notifications for events happening today
      const todayReminders = reminders.filter(event => {
        const eventDate = new Date(event.date);
        const today = new Date();
        return eventDate.setHours(0,0,0,0) === today.setHours(0,0,0,0);
      });
      
      // Only show today's reminders
      if (todayReminders.length > 0) {
        showEventReminders(todayReminders);
      }
    };

    // Call immediately and then set an interval
    checkReminders();
    
    // We don't need to check too frequently, once every hour is enough
    const interval = setInterval(checkReminders, 3600000); // 1 hour in milliseconds
    
    return () => {
      clearInterval(interval);
    };
  }, [toast]);

  const showEventReminders = (events: CalendarEvent[]) => {
    // Group reminders by pet ID to avoid showing too many toasts
    const petEventGroups: Record<number, CalendarEvent[]> = {};
    
    events.forEach(event => {
      if (!petEventGroups[event.petId]) {
        petEventGroups[event.petId] = [];
      }
      petEventGroups[event.petId].push(event);
    });
    
    // Show one reminder per pet
    Object.keys(petEventGroups).forEach((petId, index) => {
      const petEvents = petEventGroups[Number(petId)];
      const firstEvent = petEvents[0];
        // Add a small delay between toasts
      setTimeout(() => {
        toast({
          title: `Lembrete: ${firstEvent.title}`,
          description: (
            <div className="mt-2">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Hoje às {firstEvent.time}</span>
              </div>
              {petEvents.length > 1 && (
                <p className="mt-2 text-sm font-medium">
                  + {petEvents.length - 1} mais eventos hoje
                </p>
              )}
              <div 
                className="mt-2 h-1 w-full rounded-full"
                style={{ backgroundColor: eventColors[firstEvent.type as EventType] }}
              />
            </div>
          ),
          duration: 10000, // 10 segundos
        });
      }, index * 1000); // Stagger notifications by 1 second each
    });
  };

  return null;
};

export default CalendarReminder;
