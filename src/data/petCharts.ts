// Data fictício para os gráficos dos pets
import { Pet } from "./pets";

// Tipos de dados
export interface PetHealthData {
  hour: string;
  day: string;
  date: string;
  temperature: number;
  heartRate: number;
  activity: number;
}

export type TimeRange = "day" | "week" | "month";

// Dados diários (a cada hora)
export const getDailyData = (petId: number): PetHealthData[] => {
  // Dados para Bella (id: 1) - dados normais
  if (petId === 1) {
    return [
      { hour: "00:00", day: "Seg", date: "29/05", temperature: 37.8, heartRate: 72, activity: 10 },
      { hour: "01:00", day: "Seg", date: "29/05", temperature: 37.7, heartRate: 68, activity: 5 },
      { hour: "02:00", day: "Seg", date: "29/05", temperature: 37.6, heartRate: 65, activity: 3 },
      { hour: "03:00", day: "Seg", date: "29/05", temperature: 37.5, heartRate: 64, activity: 2 },
      { hour: "04:00", day: "Seg", date: "29/05", temperature: 37.6, heartRate: 65, activity: 3 },
      { hour: "05:00", day: "Seg", date: "29/05", temperature: 37.7, heartRate: 70, activity: 8 },
      { hour: "06:00", day: "Seg", date: "29/05", temperature: 37.9, heartRate: 75, activity: 15 },
      { hour: "07:00", day: "Seg", date: "29/05", temperature: 38.0, heartRate: 85, activity: 35 },
      { hour: "08:00", day: "Seg", date: "29/05", temperature: 38.2, heartRate: 95, activity: 60 },
      { hour: "09:00", day: "Seg", date: "29/05", temperature: 38.3, heartRate: 100, activity: 85 },
      { hour: "10:00", day: "Seg", date: "29/05", temperature: 38.4, heartRate: 105, activity: 90 },
      { hour: "11:00", day: "Seg", date: "29/05", temperature: 38.5, heartRate: 110, activity: 95 },
      { hour: "12:00", day: "Seg", date: "29/05", temperature: 38.6, heartRate: 100, activity: 85 },
      { hour: "13:00", day: "Seg", date: "29/05", temperature: 38.5, heartRate: 95, activity: 75 },
      { hour: "14:00", day: "Seg", date: "29/05", temperature: 38.4, heartRate: 90, activity: 65 },
      { hour: "15:00", day: "Seg", date: "29/05", temperature: 38.3, heartRate: 85, activity: 60 },
      { hour: "16:00", day: "Seg", date: "29/05", temperature: 38.4, heartRate: 95, activity: 80 },
      { hour: "17:00", day: "Seg", date: "29/05", temperature: 38.5, heartRate: 100, activity: 85 },
      { hour: "18:00", day: "Seg", date: "29/05", temperature: 38.4, heartRate: 95, activity: 75 },
      { hour: "19:00", day: "Seg", date: "29/05", temperature: 38.3, heartRate: 90, activity: 60 },
      { hour: "20:00", day: "Seg", date: "29/05", temperature: 38.1, heartRate: 85, activity: 45 },
      { hour: "21:00", day: "Seg", date: "29/05", temperature: 38.0, heartRate: 80, activity: 30 },
      { hour: "22:00", day: "Seg", date: "29/05", temperature: 37.9, heartRate: 75, activity: 20 },
      { hour: "23:00", day: "Seg", date: "29/05", temperature: 37.8, heartRate: 70, activity: 15 }
    ];
  }
  
  // Dados para Dom (id: 2) - dados normais para gato
  else if (petId === 2) {
    return [
      { hour: "00:00", day: "Seg", date: "29/05", temperature: 38.3, heartRate: 130, activity: 20 },
      { hour: "01:00", day: "Seg", date: "29/05", temperature: 38.2, heartRate: 125, activity: 15 },
      { hour: "02:00", day: "Seg", date: "29/05", temperature: 38.1, heartRate: 120, activity: 10 },
      { hour: "03:00", day: "Seg", date: "29/05", temperature: 38.0, heartRate: 118, activity: 5 },
      { hour: "04:00", day: "Seg", date: "29/05", temperature: 38.1, heartRate: 120, activity: 8 },
      { hour: "05:00", day: "Seg", date: "29/05", temperature: 38.2, heartRate: 125, activity: 15 },
      { hour: "06:00", day: "Seg", date: "29/05", temperature: 38.3, heartRate: 135, activity: 25 },
      { hour: "07:00", day: "Seg", date: "29/05", temperature: 38.4, heartRate: 140, activity: 40 },
      { hour: "08:00", day: "Seg", date: "29/05", temperature: 38.5, heartRate: 145, activity: 65 },
      { hour: "09:00", day: "Seg", date: "29/05", temperature: 38.6, heartRate: 150, activity: 80 },
      { hour: "10:00", day: "Seg", date: "29/05", temperature: 38.7, heartRate: 155, activity: 95 },
      { hour: "11:00", day: "Seg", date: "29/05", temperature: 38.8, heartRate: 160, activity: 100 },
      { hour: "12:00", day: "Seg", date: "29/05", temperature: 38.7, heartRate: 155, activity: 85 },
      { hour: "13:00", day: "Seg", date: "29/05", temperature: 38.6, heartRate: 150, activity: 70 },
      { hour: "14:00", day: "Seg", date: "29/05", temperature: 38.5, heartRate: 145, activity: 60 },
      { hour: "15:00", day: "Seg", date: "29/05", temperature: 38.6, heartRate: 150, activity: 75 },
      { hour: "16:00", day: "Seg", date: "29/05", temperature: 38.7, heartRate: 155, activity: 90 },
      { hour: "17:00", day: "Seg", date: "29/05", temperature: 38.8, heartRate: 160, activity: 95 },
      { hour: "18:00", day: "Seg", date: "29/05", temperature: 38.7, heartRate: 155, activity: 85 },
      { hour: "19:00", day: "Seg", date: "29/05", temperature: 38.6, heartRate: 150, activity: 75 },
      { hour: "20:00", day: "Seg", date: "29/05", temperature: 38.5, heartRate: 145, activity: 65 },
      { hour: "21:00", day: "Seg", date: "29/05", temperature: 38.4, heartRate: 140, activity: 50 },
      { hour: "22:00", day: "Seg", date: "29/05", temperature: 38.3, heartRate: 135, activity: 35 },
      { hour: "23:00", day: "Seg", date: "29/05", temperature: 38.2, heartRate: 130, activity: 25 }
    ];
  }
  
  // Dados para Thor (id: 3) - dados com caso grave de temperatura e batimento cardíaco elevados
  else {
    return [
      { hour: "00:00", day: "Seg", date: "29/05", temperature: 38.0, heartRate: 75, activity: 12 },
      { hour: "01:00", day: "Seg", date: "29/05", temperature: 37.9, heartRate: 72, activity: 8 },
      { hour: "02:00", day: "Seg", date: "29/05", temperature: 37.8, heartRate: 70, activity: 5 },
      { hour: "03:00", day: "Seg", date: "29/05", temperature: 37.9, heartRate: 72, activity: 6 },
      { hour: "04:00", day: "Seg", date: "29/05", temperature: 38.0, heartRate: 75, activity: 8 },
      { hour: "05:00", day: "Seg", date: "29/05", temperature: 38.1, heartRate: 80, activity: 10 },
      { hour: "06:00", day: "Seg", date: "29/05", temperature: 38.3, heartRate: 85, activity: 20 },
      { hour: "07:00", day: "Seg", date: "29/05", temperature: 38.5, heartRate: 90, activity: 35 },
      { hour: "08:00", day: "Seg", date: "29/05", temperature: 38.7, heartRate: 95, activity: 50 },
      { hour: "09:00", day: "Seg", date: "29/05", temperature: 38.9, heartRate: 105, activity: 70 },
      { hour: "10:00", day: "Seg", date: "29/05", temperature: 39.2, heartRate: 115, activity: 80 },
      { hour: "11:00", day: "Seg", date: "29/05", temperature: 39.5, heartRate: 125, activity: 85 },
      { hour: "12:00", day: "Seg", date: "29/05", temperature: 39.8, heartRate: 135, activity: 60 }, // Início do caso grave
      { hour: "13:00", day: "Seg", date: "29/05", temperature: 40.1, heartRate: 145, activity: 40 },
      { hour: "14:00", day: "Seg", date: "29/05", temperature: 40.5, heartRate: 160, activity: 30 }, // Pico de temperatura e batimento cardíaco
      { hour: "15:00", day: "Seg", date: "29/05", temperature: 40.3, heartRate: 155, activity: 25 },
      { hour: "16:00", day: "Seg", date: "29/05", temperature: 40.0, heartRate: 145, activity: 30 },
      { hour: "17:00", day: "Seg", date: "29/05", temperature: 39.7, heartRate: 140, activity: 35 }, // Início da recuperação
      { hour: "18:00", day: "Seg", date: "29/05", temperature: 39.4, heartRate: 130, activity: 40 },
      { hour: "19:00", day: "Seg", date: "29/05", temperature: 39.1, heartRate: 120, activity: 45 },
      { hour: "20:00", day: "Seg", date: "29/05", temperature: 38.8, heartRate: 110, activity: 50 },
      { hour: "21:00", day: "Seg", date: "29/05", temperature: 38.5, heartRate: 100, activity: 40 },
      { hour: "22:00", day: "Seg", date: "29/05", temperature: 38.3, heartRate: 90, activity: 30 },
      { hour: "23:00", day: "Seg", date: "29/05", temperature: 38.1, heartRate: 85, activity: 20 }
    ];
  }
};

// Dados semanais (por dia)
export const getWeeklyData = (petId: number): PetHealthData[] => {
  // Dados para Bella (id: 1)
  if (petId === 1) {
    return [
      { hour: "", day: "Seg", date: "23/05", temperature: 38.2, heartRate: 85, activity: 70 },
      { hour: "", day: "Ter", date: "24/05", temperature: 38.1, heartRate: 82, activity: 75 },
      { hour: "", day: "Qua", date: "25/05", temperature: 38.3, heartRate: 88, activity: 80 },
      { hour: "", day: "Qui", date: "26/05", temperature: 38.2, heartRate: 85, activity: 85 },
      { hour: "", day: "Sex", date: "27/05", temperature: 38.0, heartRate: 80, activity: 65 },
      { hour: "", day: "Sab", date: "28/05", temperature: 38.1, heartRate: 82, activity: 90 },
      { hour: "", day: "Dom", date: "29/05", temperature: 38.2, heartRate: 85, activity: 60 }
    ];
  }
  
  // Dados para Dom (id: 2)
  else if (petId === 2) {
    return [
      { hour: "", day: "Seg", date: "23/05", temperature: 38.5, heartRate: 140, activity: 75 },
      { hour: "", day: "Ter", date: "24/05", temperature: 38.4, heartRate: 135, activity: 80 },
      { hour: "", day: "Qua", date: "25/05", temperature: 38.5, heartRate: 145, activity: 90 },
      { hour: "", day: "Qui", date: "26/05", temperature: 38.6, heartRate: 150, activity: 85 },
      { hour: "", day: "Sex", date: "27/05", temperature: 38.5, heartRate: 145, activity: 75 },
      { hour: "", day: "Sab", date: "28/05", temperature: 38.4, heartRate: 140, activity: 95 },
      { hour: "", day: "Dom", date: "29/05", temperature: 38.5, heartRate: 145, activity: 80 }
    ];
  }
  
  // Dados para Thor (id: 3) com caso grave na quinta-feira
  else {
    return [
      { hour: "", day: "Seg", date: "23/05", temperature: 38.3, heartRate: 90, activity: 65 },
      { hour: "", day: "Ter", date: "24/05", temperature: 38.2, heartRate: 85, activity: 70 },
      { hour: "", day: "Qua", date: "25/05", temperature: 38.4, heartRate: 95, activity: 75 },
      { hour: "", day: "Qui", date: "26/05", temperature: 40.2, heartRate: 145, activity: 35 }, // Dia crítico
      { hour: "", day: "Sex", date: "27/05", temperature: 39.5, heartRate: 120, activity: 45 }, // Recuperação
      { hour: "", day: "Sab", date: "28/05", temperature: 38.7, heartRate: 100, activity: 55 },
      { hour: "", day: "Dom", date: "29/05", temperature: 38.3, heartRate: 90, activity: 65 }
    ];
  }
};

// Dados mensais (últimos 30 dias)
export const getMonthlyData = (petId: number): PetHealthData[] => {
  // Dados simplificados para o mês (5 pontos de dados)
  // Dados para Bella (id: 1)
  if (petId === 1) {
    return [
      { hour: "", day: "", date: "29/04", temperature: 38.1, heartRate: 82, activity: 75 },
      { hour: "", day: "", date: "07/05", temperature: 38.2, heartRate: 85, activity: 80 },
      { hour: "", day: "", date: "14/05", temperature: 38.0, heartRate: 80, activity: 70 },
      { hour: "", day: "", date: "21/05", temperature: 38.1, heartRate: 82, activity: 75 },
      { hour: "", day: "", date: "29/05", temperature: 38.2, heartRate: 85, activity: 80 }
    ];
  }
  
  // Dados para Dom (id: 2)
  else if (petId === 2) {
    return [
      { hour: "", day: "", date: "29/04", temperature: 38.4, heartRate: 140, activity: 80 },
      { hour: "", day: "", date: "07/05", temperature: 38.5, heartRate: 145, activity: 85 },
      { hour: "", day: "", date: "14/05", temperature: 38.6, heartRate: 150, activity: 90 },
      { hour: "", day: "", date: "21/05", temperature: 38.5, heartRate: 145, activity: 85 },
      { hour: "", day: "", date: "29/05", temperature: 38.4, heartRate: 140, activity: 80 }
    ];
  }
  
  // Dados para Thor (id: 3) com caso grave em meados do mês
  else {
    return [
      { hour: "", day: "", date: "29/04", temperature: 38.2, heartRate: 85, activity: 70 },
      { hour: "", day: "", date: "07/05", temperature: 38.3, heartRate: 90, activity: 75 },
      { hour: "", day: "", date: "14/05", temperature: 39.8, heartRate: 135, activity: 45 }, // Período crítico
      { hour: "", day: "", date: "21/05", temperature: 38.5, heartRate: 100, activity: 60 }, // Recuperação
      { hour: "", day: "", date: "29/05", temperature: 38.2, heartRate: 85, activity: 70 }
    ];
  }
};

// Função para pegar os dados de acordo com o intervalo de tempo
export const getPetHealthData = (petId: number, timeRange: TimeRange): PetHealthData[] => {
  // Se o ID não for 1, 2 ou 3, gerar dados padrão para pets recém-adicionados
  const isNewPet = ![1, 2, 3].includes(petId);
  
  if (isNewPet) {
    // Dados padrão para novos pets (sem anomalias)
    const defaultData = generateDefaultData(timeRange);
    return defaultData;
  }
  
  switch (timeRange) {
    case "day":
      return getDailyData(petId);
    case "week":
      return getWeeklyData(petId);
    case "month":
      return getMonthlyData(petId);
    default:
      return getDailyData(petId);
  }
};

// Gera dados padrão para novos pets
const generateDefaultData = (timeRange: TimeRange): PetHealthData[] => {
  switch (timeRange) {
    case "day":
      return Array.from({ length: 24 }, (_, i) => {
        const hour = i.toString().padStart(2, '0');
        return {
          hour: `${hour}:00`,
          day: "Seg",
          date: "29/05",
          temperature: 38 + Math.random() * 0.5,
          heartRate: 80 + Math.random() * 30,
          activity: Math.min(100, Math.max(0, 30 + Math.random() * 60)),
        };
      });
    case "week":
      const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];
      return days.map((day, i) => ({
        hour: "",
        day,
        date: `${23 + i}/05`,
        temperature: 38 + Math.random() * 0.5,
        heartRate: 80 + Math.random() * 30,
        activity: Math.min(100, Math.max(0, 30 + Math.random() * 60)),
      }));
    case "month":
      return [
        { hour: "", day: "", date: "29/04", temperature: 38.1, heartRate: 85, activity: 70 },
        { hour: "", day: "", date: "07/05", temperature: 38.2, heartRate: 90, activity: 75 },
        { hour: "", day: "", date: "14/05", temperature: 38.1, heartRate: 85, activity: 80 },
        { hour: "", day: "", date: "21/05", temperature: 38.3, heartRate: 95, activity: 75 },
        { hour: "", day: "", date: "29/05", temperature: 38.2, heartRate: 90, activity: 80 }
      ];
    default:
      return [];
  }
};

// Função para verificar condições anormais e gerar alertas
export const checkForAbnormalities = (petId: number, timeRange: TimeRange): { hasAbnormality: boolean; message: string } => {
  if (petId === 3) { // Thor
    if (timeRange === "day") {
      return {
        hasAbnormality: true,
        message: "Alerta: Temperatura e batimentos cardíacos elevados detectados hoje entre 12h e 17h."
      };
    } else if (timeRange === "week") {
      return {
        hasAbnormality: true,
        message: "Alerta: Dados anormais detectados na quinta-feira (26/05)."
      };
    } else if (timeRange === "month") {
      return {
        hasAbnormality: true,
        message: "Alerta: Episódio febril detectado em meados do mês."
      };
    }
  }
  
  // Sem anormalidades para outros pets (incluindo novos pets adicionados) ou períodos
  return { hasAbnormality: false, message: "" };
};
