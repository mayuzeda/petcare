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
import { formatToBrazilianDate } from "@/lib/dateUtils";
import { ptBR } from "date-fns/locale";
import PetLayout from "./PetLayout";

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

  // Floating Action Button
  const fabButton = (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          className="rounded-full w-14 h-14 p-0 shadow-lg hover:shadow-xl transition-shadow bg-orange-500 hover:bg-orange-600"
          size="lg"
        >
          <Plus className="h-8 w-8" />
        </Button>
      </DialogTrigger>
      <CalendarEventForm
        onAddEvent={handleAddEvent}
        selectedDate={date}
        onClose={() => setIsDialogOpen(false)}
      />
    </Dialog>
  );

  return (
    <PetLayout
      title="Calendário"
      floatingActionButton={fabButton}
    >
      <div className="w-full max-w-6xl">
        {/* Layout consistente com grid fixo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">

          {/* Calendar Section - Tamanho fixo */}
          <div className="bg-white rounded-lg shadow-sm border p-2 flex flex-col">
            <div className="flex-1 flex items-center justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={newDate => newDate && setDate(newDate)}
                className="rounded-md border-0"
                locale={ptBR}
                components={{
                  DayContent: (props) => (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <span>{props.date.getDate()}</span>
                      {renderDay(props.date)}
                    </div>
                  )
                }}
              />
            </div>
          </div>

          {/* Events List Section - Tamanho fixo com scroll interno */}
          <div className="bg-white rounded-lg shadow-sm border p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-gray-800">
                  {formatToBrazilianDate(date)}
                </h2>
              </div>
              <Badge variant="outline" className="text-xs">
                {selectedDateEvents.length} {selectedDateEvents.length === 1 ? 'evento' : 'eventos'}
              </Badge>
            </div>

            {/* Área de eventos com altura fixa e scroll */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`p-4 rounded-lg border-l-4 transition-all hover:shadow-md cursor-pointer ${event.completed ? 'bg-gray-50 opacity-75' : 'bg-white shadow-sm'
                        }`}
                      style={{ borderLeftColor: eventColors[event.type] }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-sm font-medium truncate ${event.completed ? 'line-through text-gray-400' : 'text-gray-900'
                            }`}>
                            {event.title}
                          </h3>
                          <div className="flex items-center text-gray-500 text-xs mt-1">
                            <span>{event.time}</span>
                            <Badge
                              variant="secondary"
                              className="ml-2 text-xs"
                              style={{ backgroundColor: `${eventColors[event.type]}20`, color: eventColors[event.type] }}
                            >
                              {event.type}
                            </Badge>
                          </div>
                          {event.notes && (
                            <p className="text-xs text-gray-500 mt-2 line-clamp-2">{event.notes}</p>
                          )}
                        </div>

                        <div className="flex flex-col items-end space-y-2 ml-3">
                          <Button
                            variant={event.completed ? "default" : "outline"}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleEventCompletion(event.id);
                            }}
                            className="text-xs px-2 py-1 h-7"
                          >
                            {event.completed ? "Concluído" : "Marcar"}
                          </Button>

                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Implementar edição
                              }}
                              className="text-xs px-2 py-1 h-7"
                            >
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteEvent(event.id);
                              }}
                              className="text-xs px-2 py-1 h-7 text-red-600 hover:text-red-700"
                            >
                              Excluir
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Estado vazio com altura fixa
                <div className="flex flex-col items-center justify-center h-full text-gray-500 py-8">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm text-center">
                    Nenhum evento para {selectedPet.name}<br />
                    nesta data
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 text-sm"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    Adicionar Evento
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PetLayout>
  );
};

export default CalendarPage;
