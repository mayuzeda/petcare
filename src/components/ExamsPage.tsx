import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, Clock, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { usePet } from "@/contexts/PetContext";
import { Badge } from "./ui/badge";
import { CalendarEvent, eventColors, loadEvents } from "@/data/calendarEvents";
import { DialogTrigger } from "./ui/dialog";

import { formatToBrazilianDate } from "@/lib/dateUtils";
import { PetLayout } from "./PetLayout";
import { Dialog } from "./ui/dialog";
import CalendarEventForm from "./CalendarEventForm";

const ExamsPage = () => {
  const navigate = useNavigate();
  const { selectedPet } = usePet();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [examEvents, setExamEvents] = useState<CalendarEvent[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Carregar todos os eventos quando o componente monta
  useEffect(() => {
    const loadedEvents = loadEvents();
    setEvents(loadedEvents);
  }, []);

  // Filtrar eventos do tipo 'exame' para o pet selecionado
  useEffect(() => {
    const filteredEvents = events.filter(
      (event) => event.type === "exame" && event.petId === selectedPet.id
    );

    // Ordenar os eventos por data, do mais recente para o mais antigo
    const sortedExamEvents = [...filteredEvents].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setExamEvents(sortedExamEvents);
  }, [events, selectedPet]);

  // Salvar eventos no localStorage quando há mudanças
  useEffect(() => {
    localStorage.setItem('petcare-events', JSON.stringify(events));
  }, [events]);

  // Adicionar novo evento ou atualizar existente
  const handleAddEvent = (newEvent: CalendarEvent) => {
    // Garantir que o tipo do evento seja 'exame'
    const examEvent = { ...newEvent, type: "exame" as const };

    const eventExists = events.some(event => event.id === examEvent.id);

    if (eventExists) {
      setEvents(prev =>
        prev.map(event =>
          event.id === examEvent.id ? examEvent : event
        )
      );
    } else {
      setEvents(prev => [...prev, examEvent]);
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

  const groupedEvents = groupEventsByMonthYear(examEvents);
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  // Floating Action Button para adicionar exame
  const fabButton = (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          className="rounded-full w-14 h-14 bg-orange-400 p-0 shadow-lg hover:shadow-xl transition-shadow"
          size="lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <CalendarEventForm
        onAddEvent={handleAddEvent}
        selectedDate={new Date()}
        onClose={() => setIsDialogOpen(false)}
        defaultEventType="exame"
        formTitle="Adicionar Novo Exame"
        showEventTypeSelector={false}
      />
    </Dialog>
  );

  return (
    <PetLayout
      title="Exames"
      floatingActionButton={fabButton}    >
      <div className="w-full max-w-4xl">
        {/* Banner com informações do pet */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-3">
            <img
              src={selectedPet.image}
              alt={`${selectedPet.name} Avatar`}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h2 className="text-lg font-semibold">
                Histórico de Exames de {selectedPet.name}
              </h2>
              <p className="text-sm text-gray-500">
                {examEvents.length} exames registrados
              </p>
            </div>
          </div>
        </div>          {/* Lista de Exames */}
        <div className="bg-white rounded-lg shadow p-3">
          {examEvents.length > 0 ? (
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
                          className="border rounded-lg p-2 hover:shadow-md transition-shadow border-l-4"
                        ><div className="flex justify-between items-start">
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
                                    onClose={() => { }}
                                    eventToEdit={event}
                                    defaultEventType="exame"
                                    formTitle="Editar Exame"
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
          ) : (<div className="text-center py-6 text-gray-500">
            <CalendarIcon className="h-8 w-8 mx-auto mb-1 opacity-20" />
            <p className="text-sm">Nenhum exame registrado para {selectedPet.name}</p>
            <Button
              variant="outline"
              className="mt-3 text-sm"
              onClick={() => setIsDialogOpen(true)}
            >
              Adicionar Exame
            </Button>
          </div>
          )}
        </div>
      </div>

    </PetLayout>
  );
};

export default ExamsPage;
