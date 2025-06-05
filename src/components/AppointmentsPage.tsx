import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, Clock, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { usePet } from "@/contexts/PetContext";
import { Badge } from "./ui/badge";
import { CalendarEvent, eventColors, loadEvents } from "@/data/calendarEvents";
import { DialogTrigger } from "./ui/dialog";
import BackButton from "./BackButton";
import { formatToBrazilianDate } from "@/lib/dateUtils";
import PetAvatars from "./PetAvatars";
import { Dialog } from "./ui/dialog";
import CalendarEventForm from "./CalendarEventForm";

const AppointmentsPage = () => {
  const navigate = useNavigate();
  const { selectedPet } = usePet();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [appointmentEvents, setAppointmentEvents] = useState<CalendarEvent[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Carregar todos os eventos quando o componente monta
  useEffect(() => {
    const loadedEvents = loadEvents();
    setEvents(loadedEvents);
  }, []);

  // Filtrar eventos do tipo 'consulta' para o pet selecionado
  useEffect(() => {
    const filteredEvents = events.filter(
      (event) => event.type === "consulta" && event.petId === selectedPet.id
    );
    
    // Ordenar os eventos por data, do mais recente para o mais antigo
    const sortedAppointmentEvents = [...filteredEvents].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    setAppointmentEvents(sortedAppointmentEvents);
  }, [events, selectedPet]);

  // Salvar eventos no localStorage quando há mudanças
  useEffect(() => {
    localStorage.setItem('petcare-events', JSON.stringify(events));
  }, [events]);
  
  // Adicionar novo evento ou atualizar existente
  const handleAddEvent = (newEvent: CalendarEvent) => {
    // Garantir que o tipo do evento seja 'consulta'
    const appointmentEvent = { ...newEvent, type: "consulta" as const };
    
    const eventExists = events.some(event => event.id === appointmentEvent.id);
    
    if (eventExists) {
      setEvents(prev => 
        prev.map(event => 
          event.id === appointmentEvent.id ? appointmentEvent : event
        )
      );
    } else {
      setEvents(prev => [...prev, appointmentEvent]);
    }
    setIsDialogOpen(false);
  };

  // Marcar evento como concluído/não concluído
  const toggleEventCompletion = (eventId: string) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === eventId 
          ? { ...event, completed: !event.completed } 
          : event
      )
    );
  };
  
  // Excluir evento
  const deleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

  // Agrupar eventos por mês/ano para mostrar em seções
  const groupEventsByMonthYear = (events: CalendarEvent[]) => {
    const grouped: { [key: string]: CalendarEvent[] } = {};
    
    events.forEach((event) => {
      const date = new Date(event.date);
      const monthYear = `${date.getMonth()}-${date.getFullYear()}`;
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      
      grouped[monthYear].push(event);
    });
    
    return grouped;
  };

  const groupedEvents = groupEventsByMonthYear(appointmentEvents);
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (    
    <div className="min-h-screen flex flex-col pb-20">      <header className="flex items-center justify-between p-3 bg-white shadow-sm">
        <div className="flex items-center">
          <BackButton />
          <h1 className="text-lg font-bold ml-2">Consultas</h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>          <CalendarEventForm 
            onAddEvent={handleAddEvent} 
            selectedDate={new Date()} 
            onClose={() => setIsDialogOpen(false)}
            defaultEventType="consulta"
            formTitle="Adicionar Nova Consulta"
            showEventTypeSelector={false}
          />
        </Dialog>
      </header>
      
      {/* Pet Avatars Section */}
      <div className="w-full bg-white shadow-sm py-2 border-t border-gray-100">
        <PetAvatars showAddButton={false} />
      </div>      <main className="flex-1 container mx-auto p-2 md:p-3">
        <div className="grid grid-cols-1 gap-3">
          {/* Banner com informações do pet */}
          <div className="bg-white rounded-lg shadow p-3">
            <div className="flex items-center gap-2">
              <img
                src={selectedPet.image}
                alt={`${selectedPet.name} Avatar`}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h2 className="text-base font-semibold">
                  Histórico de Consultas de {selectedPet.name}
                </h2>
                <p className="text-xs text-gray-500">
                  {appointmentEvents.length} consultas registradas
                </p>
              </div>
            </div>
          </div>          {/* Lista de Consultas */}
          <div className="bg-white rounded-lg shadow p-3">
            {appointmentEvents.length > 0 ? (
              <div className="space-y-4">
                {Object.entries(groupedEvents).map(([monthYearKey, monthEvents]) => {
                  const [month, year] = monthYearKey.split('-').map(Number);
                  
                  return (
                    <div key={monthYearKey} className="mb-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-2 border-b pb-1">
                        {monthNames[month]} {year}
                      </h3>
                      <div className="space-y-2">
                        {monthEvents.map((event) => (
                          <div 
                            key={event.id} 
                            className="border rounded-lg p-2 hover:shadow-md transition-shadow"
                            style={{ borderLeftWidth: '4px', borderLeftColor: eventColors[event.type] }}
                          >                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className={`text-sm font-medium ${event.completed ? 'line-through text-gray-400' : ''}`}>
                                  {event.title}
                                </h3>
                                <div className="flex items-center gap-2 text-gray-500 text-xs mt-1">
                                  <div className="flex items-center">
                                    <CalendarIcon className="h-3 w-3 mr-0.5" />
                                    <span>{formatToBrazilianDate(new Date(event.date))}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-0.5" />
                                    <span>{event.time}</span>
                                  </div>
                                </div>
                              </div>
                                <div className="flex flex-col space-y-1 items-end">
                                <Badge 
                                  variant="outline" 
                                  className="text-xs px-1.5 py-0" 
                                  style={{ color: eventColors[event.type] }}
                                >
                                  {event.completed ? 'Concluído' : 'Pendente'}
                                </Badge>
                                <div className="flex space-x-1">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-5 px-1.5 text-xs" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleEventCompletion(event.id);
                                    }}
                                  >
                                    {event.completed ? 'Desfazer' : 'Concluído'}
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
                                    </DialogTrigger>                                    <CalendarEventForm 
                                      onAddEvent={handleAddEvent} 
                                      selectedDate={new Date(event.date)} 
                                      onClose={() => {}} 
                                      eventToEdit={event}
                                      defaultEventType="consulta"
                                      formTitle="Editar Consulta"
                                      showEventTypeSelector={false}
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
                    </div>
                  );
                })}
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
                <p className="text-sm">Nenhuma consulta registrada para {selectedPet.name}</p>
                <Button 
                  variant="outline" 
                  className="mt-3 text-sm"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Adicionar Consulta
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppointmentsPage;
