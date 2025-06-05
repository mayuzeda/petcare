import { format as formatDateFns } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata uma data para o formato brasileiro (dd/MM/yyyy)
 */
export const formatToBrazilianDate = (date: Date): string => {
  return formatDateFns(date, 'dd/MM/yyyy', { locale: ptBR });
};

/**
 * Formata uma data para o formato brasileiro com hora (dd/MM/yyyy HH:mm)
 */
export const formatToBrazilianDateTime = (date: Date, time?: string): string => {
  const dateStr = formatDateFns(date, 'dd/MM/yyyy', { locale: ptBR });
  return time ? `${dateStr} ${time}` : dateStr;
};

/**
 * Formata uma data para o formato "por extenso" em português
 * Ex: 10 de junho de 2025
 */
export const formatToLongDate = (date: Date): string => {
  return formatDateFns(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
};

/**
 * Verifica se uma data é hoje
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

/**
 * Verifica se uma data é amanhã
 */
export const isTomorrow = (date: Date): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear();
};
