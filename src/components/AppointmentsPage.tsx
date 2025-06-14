import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, Clock, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { usePet } from "@/contexts/PetContext";
import { Badge } from "./ui/badge";
import { CalendarEvent, eventColors, loadEvents } from "@/data/calendarEvents";
import { DialogTrigger } from "./ui/dialog";

import { formatToBrazilianDate } from "@/lib/dateUtils";
import { Dialog } from "./ui/dialog";
import CalendarEventForm from "./CalendarEventForm";
import { PetLayout } from "./PetLayout";

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

  const groupedEvents = groupEventsByMonthYear(appointmentEvents);  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Floating Action Button para adicionar consulta
  const fabButton = (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          className="rounded-full w-14 h-14 bg-orange-500 hover:bg-orange-600 p-0 shadow-lg hover:shadow-xl transition-shadow"
          size="lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <CalendarEventForm
        onAddEvent={handleAddEvent}
        selectedDate={new Date()}
        onClose={() => setIsDialogOpen(false)}
        defaultEventType="consulta"
        formTitle="Adicionar Nova Consulta"
        showEventTypeSelector={false}
      />
    </Dialog>
  );

  return (
    <PetLayout
      title="Consultas"
      floatingActionButton={fabButton}
    >
      <div className="w-full max-w-4xl">        {/* Banner com informações do pet */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-3">
            <img
              src={selectedPet.image}
              alt={`${selectedPet.name} Avatar`}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h2 className="text-lg font-semibold">
                Histórico de Consultas de {selectedPet.name}
              </h2>
              <p className="text-sm text-gray-500">
                {appointmentEvents.length} consultas registradas
              </p>
            </div>
          </div>
        </div>{/* Lista de Consultas */}
        <div className="bg-white rounded-lg shadow p-4">
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
                      {monthEvents.map((event) => (                        <div
                          key={event.id}
                          className="border rounded-lg p-3 hover:shadow-md transition-shadow border-l-4"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <h3 className={`text-sm font-medium truncate ${
                                event.completed ? 'line-through text-gray-400' : 'text-gray-900'
                              }`}>
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
                              {event.notes && (
                                <p className="text-xs text-gray-500 mt-2 line-clamp-2">{event.notes}</p>
                              )}
                            </div>
                            
                            <div className="flex flex-col items-end space-y-2 ml-3">                              <Badge
                                variant="outline"
                                className="text-xs px-2 py-1 text-blue-600"
                              >
                                {event.completed ? 'Concluído' : 'Pendente'}
                              </Badge>
                              
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleEventCompletion(event.id);
                                  }}
                                  className="text-xs px-2 py-1 h-7"
                                >
                                  {event.completed ? 'Desfazer' : 'Concluído'}
                                </Button>

                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-xs px-2 py-1 h-7"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      Editar
                                    </Button>
                                  </DialogTrigger>
                                  <CalendarEventForm
                                    onAddEvent={handleAddEvent}
                                    selectedDate={new Date(event.date)}
                                    onClose={() => { }}
                                    eventToEdit={event}
                                    defaultEventType="consulta"
                                    formTitle="Editar Consulta"
                                    showEventTypeSelector={false}
                                  />
                                </Dialog>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs px-2 py-1 h-7 text-red-600 hover:text-red-700"
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
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="flex justify-center mb-3">
                <img
                  src={selectedPet.image}
                  alt={`${selectedPet.name} Avatar`}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-200"
                />
              </div>
              <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm text-center">
                Nenhuma consulta registrada para {selectedPet.name}
              </p>
              <Button
                variant="outline"
                className="mt-4 text-sm"
                onClick={() => setIsDialogOpen(true)}
              >
                Adicionar Consulta
              </Button>
            </div>
          )}
        </div>
      </div>
    </PetLayout>
  );
};

export default AppointmentsPage;
