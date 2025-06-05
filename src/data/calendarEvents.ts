// Tipos de eventos do calendário de pets
import { Pet } from "./pets";

export type EventType = 
  | "consulta" 
  | "vacina" 
  | "exame" 
  | "remedio" 
  | "vermifugo" 
  | "cirurgia";

export interface CalendarEvent {
  id: string;
  petId: number;
  title: string;
  type: EventType;
  date: Date;
  time: string;
  reminder: boolean;
  notes?: string;
  completed?: boolean;
}

// Mapeamento de cores para cada tipo de evento
export const eventColors: Record<EventType, string> = {
  consulta: "#3b82f6", // azul
  vacina: "#10b981", // verde
  exame: "#8b5cf6", // roxo
  remedio: "#f97316", // laranja
  vermifugo: "#eab308", // amarelo
  cirurgia: "#ef4444", // vermelho
};

// Mapeamento de ícones para cada tipo de evento
export const eventIcons: Record<EventType, string> = {
  consulta: "/consulta.png",
  vacina: "/vacina.png",
  exame: "/exames.png",
  remedio: "/remedios.png",
  vermifugo: "/remedios.png",
  cirurgia: "/coleira.png",
};

// Lista de eventos iniciais
export const initialEvents: CalendarEvent[] = [
  {
    id: "1",
    petId: 3, // Thor
    title: "Consulta de rotina",
    type: "consulta",
    date: new Date(new Date().setDate(new Date().getDate() + 3)),
    time: "14:30",
    reminder: true,
  },
  {
    id: "2",
    petId: 1, // Bella
    title: "Vacinação anual",
    type: "vacina",
    date: new Date(new Date().setDate(new Date().getDate() + 7)),
    time: "10:00",
    reminder: true,
  },
  {
    id: "3",
    petId: 2, // Dom
    title: "Exame de sangue",
    type: "exame",
    date: new Date(new Date().setDate(new Date().getDate() + 5)),
    time: "09:15",
    reminder: true,
  },
  {
    id: "4",
    petId: 3, // Thor
    title: "Dose de antibiótico",
    type: "remedio",
    date: new Date(),
    time: "08:00",
    reminder: true,
    notes: "Administrar com alimento"
  },
  {
    id: "5",
    petId: 1, // Bella
    title: "Aplicação de vermífugo",
    type: "vermifugo",
    date: new Date(new Date().setDate(new Date().getDate() + 14)),
    time: "19:00",
    reminder: true,
  },
  {
    id: "6",
    petId: 2, // Dom
    title: "Cirurgia dentária",
    type: "cirurgia",
    date: new Date(new Date().setDate(new Date().getDate() + 21)),
    time: "08:30",
    reminder: true,
    notes: "Jejum de 12 horas antes da cirurgia"
  },
  {
    id: "7",
    petId: 3, // Thor
    title: "Resultado de exames",
    type: "exame",
    date: new Date(new Date().setDate(new Date().getDate() + 10)),
    time: "15:45",
    reminder: true,
  },
  {
    id: "8",
    petId: 1, // Bella
    title: "Consulta dermatológica",
    type: "consulta",
    date: new Date(new Date().setDate(new Date().getDate() + 2)),
    time: "11:30",
    reminder: true,
    notes: "Verificar manchas na pele"
  },
  {
    id: "9",
    petId: 2, // Dom
    title: "Vacina antirrábica",
    type: "vacina",
    date: new Date(new Date().setDate(new Date().getDate() + 12)),
    time: "16:00",
    reminder: true,
  },
  {
    id: "10",
    petId: 3, // Thor
    title: "Medicação cardíaca",
    type: "remedio",
    date: new Date(new Date().setDate(new Date().getDate() + 1)),
    time: "20:00",
    reminder: true,
    notes: "Administrar depois da janta"
  }
];

// Funções auxiliares para trabalhar com eventos
export const getEventsForDate = (events: CalendarEvent[], date: Date, petId?: number): CalendarEvent[] => {
  const targetDate = new Date(date).setHours(0, 0, 0, 0);
  
  return events.filter(event => {
    const eventDate = new Date(event.date).setHours(0, 0, 0, 0);
    return eventDate === targetDate && (!petId || event.petId === petId);
  });
};

// Get events for a specific pet
export const getEventsForPet = (events: CalendarEvent[], petId: number): CalendarEvent[] => {
  return events.filter(event => event.petId === petId);
};

// Get upcoming events for a specific pet
export const getUpcomingEventsForPet = (
  events: CalendarEvent[], 
  petId: number, 
  daysAhead: number = 30
): CalendarEvent[] => {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + daysAhead);
  
  today.setHours(0, 0, 0, 0);
  futureDate.setHours(23, 59, 59, 999);
  
  return events.filter(event => {
    const eventDate = new Date(event.date);
    return (
      event.petId === petId &&
      eventDate >= today &&
      eventDate <= futureDate &&
      !event.completed
    );
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Get events that require reminders (events happening today or tomorrow)
export const getEventsForReminder = (events: CalendarEvent[]): CalendarEvent[] => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  
  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(23, 59, 59, 999);
  
  return events.filter(event => {
    const eventDate = new Date(event.date);
    return (
      event.reminder &&
      eventDate >= today &&
      eventDate <= tomorrow &&
      !event.completed
    );
  });
};

// Função para carregar eventos do localStorage
export const loadEvents = (): CalendarEvent[] => {
  try {
    const savedEvents = localStorage.getItem('petcare-events');
    if (savedEvents) {
      const events = JSON.parse(savedEvents);
      // Converte strings de data de volta para objetos Date
      return events.map((event: any) => ({
        ...event,
        date: new Date(event.date)
      }));
    }
  } catch (error) {
    console.error('Erro ao carregar eventos:', error);
  }
  return initialEvents;
};



// Função para salvar eventos no localStorage
export const saveEvents = (events: CalendarEvent[]): void => {
  try {
    localStorage.setItem('petcare-events', JSON.stringify(events));
  } catch (error) {
    console.error('Erro ao salvar eventos:', error);
  }
};
