import { usePet } from "@/contexts/PetContext";
import { CalendarEvent, EventType, eventColors } from "@/data/calendarEvents";
import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./ui/select";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";
import { Calendar } from "lucide-react";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { formatToBrazilianDate } from "@/lib/dateUtils";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface CalendarEventFormProps {
  onAddEvent: (event: CalendarEvent) => void;
  onClose: () => void;
  selectedDate: Date;
  eventToEdit?: CalendarEvent;
  defaultEventType?: EventType;
  formTitle?: string;
  showEventTypeSelector?: boolean;
}

const eventTypeOptions: { value: EventType; label: string }[] = [
  { value: "consulta", label: "Consulta" },
  { value: "vacina", label: "Vacina" },
  { value: "exame", label: "Exame" },
  { value: "remedio", label: "Medicamento" },
  { value: "vermifugo", label: "Vermífugo" },
  { value: "cirurgia", label: "Cirurgia" },
];

const CalendarEventForm = ({ 
  onAddEvent, 
  onClose, 
  selectedDate, 
  eventToEdit,
  defaultEventType,
  formTitle,
  showEventTypeSelector = true
}: CalendarEventFormProps) => {
  const { selectedPet } = usePet();
  
  const [title, setTitle] = useState(eventToEdit?.title || "");
  const [eventType, setEventType] = useState<EventType>(eventToEdit?.type || defaultEventType || "consulta");
  const [date, setDate] = useState<Date>(eventToEdit?.date || selectedDate);
  const [time, setTime] = useState(eventToEdit?.time || "09:00");
  const [reminder, setReminder] = useState(eventToEdit?.reminder || false);
  const [notes, setNotes] = useState(eventToEdit?.notes || "");
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEvent: CalendarEvent = {
      id: eventToEdit?.id || uuidv4(),
      petId: selectedPet.id,
      title,
      type: eventType,
      date,
      time,
      reminder,
      notes: notes || undefined,
      completed: eventToEdit?.completed || false,
    };
    
    onAddEvent(newEvent);
  };

  return (    <DialogContent className="sm:max-w-[500px]">      <DialogHeader>
        <DialogTitle>
          {formTitle || (eventToEdit ? "Editar Evento" : "Adicionar Novo Evento")} para {selectedPet.name}
        </DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            placeholder="Digite o título do evento"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {showEventTypeSelector ? (
            <div className="space-y-2">
              <Label htmlFor="eventType">Tipo de Evento</Label>
              <Select 
                value={eventType} 
                onValueChange={(value) => setEventType(value as EventType)}
              >
                <SelectTrigger 
                  id="eventType"
                  className="w-full"
                  style={{ borderColor: eventColors[eventType] }}
                >
                  <SelectValue placeholder="Selecione o tipo de evento" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypeOptions.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: eventColors[option.value] }}
                        />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
            <div className="space-y-2">
            <Label htmlFor="time">Horário</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
        </div>
          <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >                <Calendar className="mr-2 h-4 w-4" />
                {date ? formatToBrazilianDate(date) : <span>Escolha uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={(newDate) => {
                  if (newDate) {
                    setDate(newDate);
                    setIsDatePopoverOpen(false);
                  }
                }}
                locale={ptBR}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
          <div className="flex items-center space-x-2">
          <Switch 
            id="reminder" 
            checked={reminder} 
            onCheckedChange={setReminder} 
          />
          <Label htmlFor="reminder">Ativar notificações de lembrete</Label>
        </div>
          <div className="space-y-2">
          <Label htmlFor="notes">Observações (Opcional)</Label>
          <Textarea
            id="notes"
            placeholder="Adicione informações adicionais..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="h-24"
          />
        </div>          <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            {eventToEdit 
              ? (formTitle ? formTitle.replace("Adicionar", "Atualizar") : "Atualizar Evento")
              : (formTitle || "Adicionar Evento")
            }
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default CalendarEventForm;
