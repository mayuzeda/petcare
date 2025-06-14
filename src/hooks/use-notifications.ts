import { useState, useEffect } from 'react';
import {
    Notification,
    generateNotificationsFromEvents,
    loadNotifications,
    saveNotifications,
    markNotificationAsRead,
    getNotificationsForPet,
    getUnreadCount,
    addCustomNotification
} from '@/data/notifications';
import { loadEvents } from '@/data/calendarEvents';
import { usePet } from '@/contexts/PetContext';

export const useNotifications = () => {
    const { pets, selectedPet } = usePet();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    // Carregar notificações quando o hook é inicializado
    useEffect(() => {
        const loadAndGenerateNotifications = async () => {
            setIsLoading(true);

            try {
                // Carregar eventos do calendário
                const events = loadEvents();

                // Gerar notificações baseadas nos eventos
                const generatedNotifications = generateNotificationsFromEvents(events, pets);

                // Carregar notificações salvas
                const savedNotifications = loadNotifications();

                // Combinar notificações salvas com as geradas
                const allNotifications = [
                    ...generatedNotifications,
                    ...savedNotifications.filter(saved =>
                        // Manter apenas notificações personalizadas (que não são baseadas em eventos)
                        !saved.eventId || !generatedNotifications.some(generated => generated.id === saved.id)
                    )
                ];

                // Ordenar por data (mais recentes primeiro)
                const sortedNotifications = allNotifications.sort(
                    (a, b) => b.time.getTime() - a.time.getTime()
                );

                setNotifications(sortedNotifications);

                // Salvar no localStorage (apenas as notificações personalizadas, as baseadas em eventos são regeneradas)
                const customNotifications = sortedNotifications.filter(n => !n.eventId || savedNotifications.some(s => s.id === n.id));
                saveNotifications(customNotifications);
                saveNotifications(sortedNotifications);

            } catch (error) {
                console.error('Erro ao carregar notificações:', error);
                setNotifications([]);
            } finally {
                setIsLoading(false);
            }
        };

        if (pets.length > 0) {
            loadAndGenerateNotifications();
        }
    }, [pets]);

    // Atualizar notificações quando eventos mudarem
    const refreshNotifications = () => {
        if (pets.length > 0) {
            const events = loadEvents();
            const generatedNotifications = generateNotificationsFromEvents(events, pets);

            // Manter notificações personalizadas (que não têm eventId)
            const customNotifications = notifications.filter(n => !n.eventId);

            const allNotifications = [
                ...customNotifications,
                ...generatedNotifications
            ];

            const sortedNotifications = allNotifications.sort(
                (a, b) => b.time.getTime() - a.time.getTime()
            );

            setNotifications(sortedNotifications);
            saveNotifications(sortedNotifications);
        }
    };

    // Marcar notificação como lida
    const markAsRead = (notificationId: string) => {
        const updatedNotifications = markNotificationAsRead(notifications, notificationId);
        setNotifications(updatedNotifications);
        saveNotifications(updatedNotifications);
    };

    // Marcar todas as notificações como lidas
    const markAllAsRead = (petId?: number) => {
        const updatedNotifications = notifications.map(notification => {
            if (!petId || notification.petId === petId) {
                return { ...notification, read: true };
            }
            return notification;
        });

        setNotifications(updatedNotifications);
        saveNotifications(updatedNotifications);
    };

    // Adicionar notificação personalizada
    const addNotification = (notification: Omit<Notification, 'id' | 'time'>) => {
        const newNotification = addCustomNotification(notification);
        const updatedNotifications = [newNotification, ...notifications];

        setNotifications(updatedNotifications);
        saveNotifications(updatedNotifications);

        return newNotification;
    };

    // Remover notificação
    const removeNotification = (notificationId: string) => {
        const updatedNotifications = notifications.filter(n => n.id !== notificationId);
        setNotifications(updatedNotifications);
        saveNotifications(updatedNotifications);
    };

    // Obter notificações do pet selecionado
    const getSelectedPetNotifications = () => {
        return getNotificationsForPet(notifications, selectedPet.id);
    };

    // Obter contagem de não lidas para o pet selecionado
    const getSelectedPetUnreadCount = () => {
        return getUnreadCount(notifications, selectedPet.id);
    };

    // Obter todas as notificações não lidas
    const getAllUnreadNotifications = () => {
        return notifications.filter(n => !n.read);
    };

    // Obter contagem total de não lidas
    const getTotalUnreadCount = () => {
        return getUnreadCount(notifications);
    };

    return {
        // Estado
        notifications,
        isLoading,

        // Ações
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        addNotification,
        removeNotification,

        // Getters
        getSelectedPetNotifications,
        getSelectedPetUnreadCount,
        getAllUnreadNotifications,
        getTotalUnreadCount,

        // Getters para pet específico
        getNotificationsForPet: (petId: number) => getNotificationsForPet(notifications, petId),
        getUnreadCountForPet: (petId: number) => getUnreadCount(notifications, petId)
    };
};
