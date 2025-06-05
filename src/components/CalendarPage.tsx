
import { useNavigate } from "react-router-dom";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "./ui/calendar";
import { useState, useEffect } from "react";
import { usePet } from "@/contexts/PetContext";
import { Badge } from "./ui/badge";
import { CalendarEvent, EventType, eventColors, getEventsForDate, loadEvents } from "@/data/calendarEvents";
import { Dialog, DialogTrigger } from "./ui/dialog";
import CalendarEventForm from "./CalendarEventForm";
import BackButton from "./BackButton";
import { formatToBrazilianDate } from "@/lib/dateUtils";
import { ptBR } from "date-fns/locale";
import PetAvatars from "./PetAvatars";

// Custom type definitions for day rendering with events
type CalendarDayProps = {
  date: Date;
  events: CalendarEvent[];
};

const CalendarPage = () => {
  const navigate = useNavigate();
  const { selectedPet } = usePet();
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Load events on component mount
  useEffect(() => {
    const loadedEvents = loadEvents();
    setEvents(loadedEvents);
  }, []);

  // Update selected date events when date or pet changes
  useEffect(() => {
    if (date) {
      const filteredEvents = getEventsForDate(events, date, selectedPet.id);
      setSelectedDateEvents(filteredEvents);
    }
  }, [date, events, selectedPet]);

  // Save events to localStorage whenever events change
  useEffect(() => {
    localStorage.setItem('petcare-events', JSON.stringify(events));
  }, [events]);
  // Handler for adding new events
  const handleAddEvent = (newEvent: CalendarEvent) => {
    // Check if this is an edit (existing ID) or a new event
    const eventExists = events.some(event => event.id === newEvent.id);
    
    if (eventExists) {
      setEvents(prev => 
        prev.map(event => 
          event.id === newEvent.id ? newEvent : event
        )
      );
    } else {
      setEvents(prev => [...prev, newEvent]);
    }
    setIsDialogOpen(false);
  };

  // Handler for marking events as completed
  const toggleEventCompletion = (eventId: string) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === eventId 
          ? { ...event, completed: !event.completed } 
          : event
      )
    );
  };
  
  // Handler for deleting events
  const deleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

  // Custom day rendering to show event indicators
  const renderDay = (day: Date) => {
    const dayEvents = getEventsForDate(events, day, selectedPet.id);
    
    if (dayEvents.length === 0) return null;
    
    // Group events by type to show one indicator per type
    const eventTypes = new Set(dayEvents.map(event => event.type));
    
    return (
      <div className="flex flex-wrap gap-0.5 absolute bottom-1 left-0 right-0 justify-center">
        {Array.from(eventTypes).map(type => (
          <div 
            key={type}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: eventColors[type as EventType] }}
          />
        ))}
      </div>
    );
  };

  return (    <div className="min-h-screen flex flex-col pb-20">      <header className="flex items-center justify-between p-3 bg-white shadow-sm">
        <div className="flex items-center">
          <BackButton />
          <h1 className="text-lg font-bold ml-2">Calendário</h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <CalendarEventForm 
            onAddEvent={handleAddEvent} 
            selectedDate={date} 
            onClose={() => setIsDialogOpen(false)} 
          />
        </Dialog>
      </header>
        {/* Pet Avatars Section */}
      <div className="w-full bg-white shadow-sm py-2 border-t border-gray-100">
        <PetAvatars showAddButton={false} />
      </div>      <main className="flex-1 container mx-auto p-2 md:p-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Calendar Section */}
          <div className="md:col-span-7 bg-white rounded-lg shadow p-3"><Calendar
              mode="single"
              selected={date}
              onSelect={newDate => newDate && setDate(newDate)}
              className="rounded-md"
              locale={ptBR}
              components={{
                DayContent: (props) => (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {props.date.getDate()}
                    {renderDay(props.date)}
                  </div>
                ),
              }}
            />
          </div>          {/* Events List Section */}
          <div className="md:col-span-5 bg-white rounded-lg shadow p-3">            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <img
                  src={selectedPet.image}
                  alt={`${selectedPet.name} Avatar`}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <h2 className="text-base font-semibold">
                  Eventos de {selectedPet.name} - {formatToBrazilianDate(date)}
                </h2>
              </div>
            </div>
            
            {selectedDateEvents.length > 0 ? (              <div className="space-y-2">
                {selectedDateEvents.map((event) => (                  <div 
                    key={event.id} 
                    className="border rounded-lg p-2 hover:shadow-md transition-shadow"
                    style={{ borderLeftWidth: '4px', borderLeftColor: eventColors[event.type] }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`text-sm font-medium ${event.completed ? 'line-through text-gray-400' : ''}`}>{event.title}</h3>
                        <div className="flex items-center text-gray-500 text-xs mt-0.5">
                          <CalendarIcon className="h-3 w-3 mr-0.5" />
                          <span>{event.time}</span>
                        </div>
                      </div>                      <div className="flex flex-col items-end space-y-1">
                        <Badge variant="outline" className="text-xs px-1.5 py-0" style={{ color: eventColors[event.type] }}>
                          {event.type}
                        </Badge>                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-5 px-1.5 text-xs" 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleEventCompletion(event.id);
                            }}
                          >                            {event.completed ? 'Desfazer' : 'Concluído'}
                          </Button>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-5 px-1.5 text-xs"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Editar
                              </Button>
                            </DialogTrigger>
                            <CalendarEventForm 
                              onAddEvent={handleAddEvent} 
                              selectedDate={date} 
                              onClose={() => {}} 
                              eventToEdit={event}
                            />
                          </Dialog>
                            <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-5 px-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50" 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteEvent(event.id);
                            }}
                          >
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </div>
                    {event.notes && <p className="text-xs text-gray-500 mt-1">{event.notes}</p>}
                  </div>
                ))}
              </div>
            ) : (              <div className="text-center py-6 text-gray-500">
                <div className="flex justify-center mb-2">
                  <img
                    src={selectedPet.image}
                    alt={`${selectedPet.name} Avatar`}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200"
                  />
                </div>
                <CalendarIcon className="h-8 w-8 mx-auto mb-1 opacity-20" />
                <p className="text-sm">Nenhum evento para {selectedPet.name} nesta data</p>
                <Button 
                  variant="outline" 
                  className="mt-3 text-sm"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Adicionar Evento
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CalendarPage;
