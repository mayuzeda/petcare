import { CalendarEvent, EventType, eventColors, eventIcons } from "./calendarEvents";
import { Pet } from "./pets";

export interface Notification {
  id: string;
  petId: number;
  title: string;
  message: string;
  type: NotificationType;
  eventType?: EventType;
  eventId?: string; // Link to calendar event if applicable
  time: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionRequired?: boolean;
}

export type NotificationType = 
  | 'reminder' 
  | 'appointment' 
  | 'medication' 
  | 'vaccination' 
  | 'exam' 
  | 'general'
  | 'emergency';

// Mapeamento de cores para cada tipo de notificação
export const notificationColors: Record<NotificationType, string> = {
  reminder: "#3b82f6", // azul
  appointment: "#10b981", // verde
  medication: "#f97316", // laranja
  vaccination: "#10b981", // verde
  exam: "#8b5cf6", // roxo
  general: "#6b7280", // cinza
  emergency: "#ef4444", // vermelho
};

// Mapeamento de ícones para cada tipo de notificação
export const notificationIcons: Record<NotificationType, string> = {
  reminder: "⏰",
  appointment: "📅",
  medication: "💊",
  vaccination: "💉",
  exam: "🔬",
  general: "📋",
  emergency: "🚨",
};

// Função para gerar notificações baseadas nos eventos do calendário
export const generateNotificationsFromEvents = (
  events: CalendarEvent[],
  pets: Pet[]
): Notification[] => {
  const notifications: Notification[] = [];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  console.log('Gerando notificações para', events.length, 'eventos');

  events.forEach((event) => {
    const eventDate = new Date(event.date);
    const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    const pet = pets.find(p => p.id === event.petId);
    
    if (!pet) {
      console.log('Pet não encontrado para evento:', event);
      return;
    }

    console.log('Processando evento:', event.title, 'para pet:', pet.name, 'data:', eventDateOnly);

    // Sempre criar notificações para eventos futuros próximos (próximos 7 dias)
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    if (eventDateOnly >= today && eventDateOnly <= nextWeek && !event.completed) {
      let priority: 'low' | 'medium' | 'high' = 'medium';
      let timeOffset = 2 * 60 * 60 * 1000; // 2 horas atrás

      // Notificações para eventos de hoje
      if (eventDateOnly.getTime() === today.getTime()) {
        priority = 'high';
        timeOffset = 1 * 60 * 60 * 1000; // 1 hora atrás
        
        notifications.push({
          id: `today-${event.id}`,
          petId: event.petId,
          title: `${getEventTypeLabel(event.type)} hoje - ${pet.name}`,
          message: `${event.title} agendado para hoje às ${event.time}. ${event.notes ? event.notes : ''}`,
          type: mapEventTypeToNotificationType(event.type),
          eventType: event.type,
          eventId: event.id,
          time: new Date(now.getTime() - timeOffset),
          read: false,
          priority: priority,
          actionRequired: true
        });
      }

      // Notificações para eventos de amanhã
      if (eventDateOnly.getTime() === tomorrow.getTime()) {
        notifications.push({
          id: `tomorrow-${event.id}`,
          petId: event.petId,
          title: `${getEventTypeLabel(event.type)} amanhã - ${pet.name}`,
          message: `${event.title} agendado para amanhã às ${event.time}. ${event.notes ? event.notes : ''}`,
          type: mapEventTypeToNotificationType(event.type),
          eventType: event.type,
          eventId: event.id,
          time: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 horas atrás
          read: false,
          priority: 'medium',
          actionRequired: false
        });
      }

      // Notificações para eventos nos próximos dias
      if (eventDateOnly.getTime() > tomorrow.getTime()) {
        const daysUntil = Math.ceil((eventDateOnly.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
        
        notifications.push({
          id: `upcoming-${event.id}`,
          petId: event.petId,
          title: `${getEventTypeLabel(event.type)} em ${daysUntil} dias - ${pet.name}`,
          message: `${event.title} agendado para ${formatDate(eventDate)} às ${event.time}`,
          type: mapEventTypeToNotificationType(event.type),
          eventType: event.type,
          eventId: event.id,
          time: new Date(now.getTime() - (daysUntil * 60 * 60 * 1000)), // Proporcional aos dias
          read: false,
          priority: 'low',
          actionRequired: false
        });
      }
    }

    // Notificações para eventos atrasados
    if (eventDateOnly.getTime() < today.getTime()) {
      notifications.push({
        id: `overdue-${event.id}`,
        petId: event.petId,
        title: `${getEventTypeLabel(event.type)} atrasado`,
        message: `${event.title} estava agendado para ${formatDate(eventDate)} às ${event.time}`,
        type: 'emergency',
        eventType: event.type,
        eventId: event.id,
        time: new Date(eventDate.getTime() + 60 * 60 * 1000), // 1 hora após o evento
        read: false,
        priority: 'high',
        actionRequired: true
      });
    }
  });

  return notifications.sort((a, b) => b.time.getTime() - a.time.getTime());
};

// Função para mapear tipos de eventos para tipos de notificação
const mapEventTypeToNotificationType = (eventType: EventType): NotificationType => {
  switch (eventType) {
    case 'consulta':
    case 'cirurgia':
      return 'appointment';
    case 'vacina':
      return 'vaccination';
    case 'exame':
      return 'exam';
    case 'remedio':
    case 'vermifugo':
      return 'medication';
    default:
      return 'reminder';
  }
};

// Função para obter rótulo do tipo de evento
const getEventTypeLabel = (eventType: EventType): string => {
  switch (eventType) {
    case 'consulta':
      return 'Consulta';
    case 'vacina':
      return 'Vacinação';
    case 'exame':
      return 'Exame';
    case 'remedio':
      return 'Medicação';
    case 'vermifugo':
      return 'Vermífugo';
    case 'cirurgia':
      return 'Cirurgia';
    default:
      return 'Evento';
  }
};

// Função para formatar data
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Função para calcular tempo relativo
export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Agora mesmo';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min atrás`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h atrás`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} dia${diffInDays > 1 ? 's' : ''} atrás`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} mês${diffInMonths > 1 ? 'es' : ''} atrás`;
};

// Função para adicionar notificações personalizadas
export const addCustomNotification = (notification: Omit<Notification, 'id' | 'time'>): Notification => {
  return {
    ...notification,
    id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    time: new Date()
  };
};

// Função para marcar notificação como lida
export const markNotificationAsRead = (notifications: Notification[], notificationId: string): Notification[] => {
  return notifications.map(notification =>
    notification.id === notificationId 
      ? { ...notification, read: true }
      : notification
  );
};

// Função para filtrar notificações por pet
export const getNotificationsForPet = (notifications: Notification[], petId: number): Notification[] => {
  return notifications.filter(notification => notification.petId === petId);
};

// Função para obter contagem de notificações não lidas
export const getUnreadCount = (notifications: Notification[], petId?: number): number => {
  const filteredNotifications = petId 
    ? getNotificationsForPet(notifications, petId)
    : notifications;
  
  return filteredNotifications.filter(notification => !notification.read).length;
};

// Função para carregar notificações do localStorage
export const loadNotifications = (): Notification[] => {
  try {
    const savedNotifications = localStorage.getItem('petcare-notifications');
    if (savedNotifications) {
      const notifications = JSON.parse(savedNotifications);      return notifications.map((notification: Omit<Notification, 'time'> & { time: string }) => ({
        ...notification,
        time: new Date(notification.time)
      }));
    }
  } catch (error) {
    console.error('Erro ao carregar notificações:', error);
  }
  return [];
};

// Função para salvar notificações no localStorage
export const saveNotifications = (notifications: Notification[]): void => {
  try {
    localStorage.setItem('petcare-notifications', JSON.stringify(notifications));
  } catch (error) {
    console.error('Erro ao salvar notificações:', error);
  }
};
