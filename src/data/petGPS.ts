// Dados fictícios para o GPS dos pets

// Tipos de dados
export interface PetGPSData {
  hour: string;
  day: string;
  date: string;
  distance: number;     // Distância percorrida em metros
  steps: number;        // Número de passos
  active: number;       // Tempo ativo em minutos
  inactive: number;     // Tempo inativo em minutos
  location: string;     // Local onde o pet está (casa, quintal, rua, parque)
}

export interface LocationCount {
  location: string;
  count: number;
  percentage: number;
}

export type TimeRange = "day" | "week" | "month";

// Dados diários (a cada hora) - Bella (cachorro) - ALTO nível de atividade
export const getBellaDailyData = (): PetGPSData[] => {
  return [
    { hour: "00:00", day: "Seg", date: "29/05", distance: 30, steps: 60, active: 8, inactive: 52, location: "casa" },
    { hour: "01:00", day: "Seg", date: "29/05", distance: 10, steps: 20, active: 2, inactive: 58, location: "casa" },
    { hour: "02:00", day: "Seg", date: "29/05", distance: 0, steps: 0, active: 0, inactive: 60, location: "casa" },
    { hour: "03:00", day: "Seg", date: "29/05", distance: 0, steps: 0, active: 0, inactive: 60, location: "casa" },
    { hour: "04:00", day: "Seg", date: "29/05", distance: 0, steps: 0, active: 0, inactive: 60, location: "casa" },
    { hour: "05:00", day: "Seg", date: "29/05", distance: 50, steps: 120, active: 10, inactive: 50, location: "casa" },
    { hour: "06:00", day: "Seg", date: "29/05", distance: 250, steps: 550, active: 25, inactive: 35, location: "quintal" },
    { hour: "07:00", day: "Seg", date: "29/05", distance: 1800, steps: 3800, active: 50, inactive: 10, location: "rua" },
    { hour: "08:00", day: "Seg", date: "29/05", distance: 450, steps: 980, active: 35, inactive: 25, location: "quintal" },
    { hour: "09:00", day: "Seg", date: "29/05", distance: 200, steps: 450, active: 22, inactive: 38, location: "casa" },
    { hour: "10:00", day: "Seg", date: "29/05", distance: 320, steps: 680, active: 30, inactive: 30, location: "quintal" },
    { hour: "11:00", day: "Seg", date: "29/05", distance: 380, steps: 800, active: 35, inactive: 25, location: "quintal" },
    { hour: "12:00", day: "Seg", date: "29/05", distance: 220, steps: 480, active: 25, inactive: 35, location: "casa" },
    { hour: "13:00", day: "Seg", date: "29/05", distance: 180, steps: 380, active: 20, inactive: 40, location: "casa" },
    { hour: "14:00", day: "Seg", date: "29/05", distance: 350, steps: 750, active: 35, inactive: 25, location: "quintal" },
    { hour: "15:00", day: "Seg", date: "29/05", distance: 280, steps: 600, active: 30, inactive: 30, location: "quintal" },
    { hour: "16:00", day: "Seg", date: "29/05", distance: 220, steps: 480, active: 25, inactive: 35, location: "casa" },
    { hour: "17:00", day: "Seg", date: "29/05", distance: 2000, steps: 4200, active: 55, inactive: 5, location: "rua" },
    { hour: "18:00", day: "Seg", date: "29/05", distance: 480, steps: 1000, active: 40, inactive: 20, location: "quintal" },
    { hour: "19:00", day: "Seg", date: "29/05", distance: 320, steps: 680, active: 30, inactive: 30, location: "casa" },
    { hour: "20:00", day: "Seg", date: "29/05", distance: 250, steps: 520, active: 25, inactive: 35, location: "casa" },
    { hour: "21:00", day: "Seg", date: "29/05", distance: 120, steps: 250, active: 15, inactive: 45, location: "casa" },
    { hour: "22:00", day: "Seg", date: "29/05", distance: 50, steps: 100, active: 8, inactive: 52, location: "casa" },
    { hour: "23:00", day: "Seg", date: "29/05", distance: 20, steps: 40, active: 5, inactive: 55, location: "casa" }
  ];
};

// Dados diários (a cada hora) - Thor (cachorro) - MODERADO nível de atividade
export const getThorDailyData = (): PetGPSData[] => {
  return [
    { hour: "00:00", day: "Seg", date: "29/05", distance: 0, steps: 0, active: 0, inactive: 60, location: "casa" },
    { hour: "01:00", day: "Seg", date: "29/05", distance: 0, steps: 0, active: 0, inactive: 60, location: "casa" },
    { hour: "02:00", day: "Seg", date: "29/05", distance: 0, steps: 0, active: 0, inactive: 60, location: "casa" },
    { hour: "03:00", day: "Seg", date: "29/05", distance: 0, steps: 0, active: 0, inactive: 60, location: "casa" },
    { hour: "04:00", day: "Seg", date: "29/05", distance: 0, steps: 0, active: 0, inactive: 60, location: "casa" },
    { hour: "05:00", day: "Seg", date: "29/05", distance: 10, steps: 20, active: 2, inactive: 58, location: "casa" },
    { hour: "06:00", day: "Seg", date: "29/05", distance: 120, steps: 250, active: 15, inactive: 45, location: "quintal" },
    { hour: "07:00", day: "Seg", date: "29/05", distance: 950, steps: 2000, active: 35, inactive: 25, location: "rua" },
    { hour: "08:00", day: "Seg", date: "29/05", distance: 180, steps: 380, active: 20, inactive: 40, location: "quintal" },
    { hour: "09:00", day: "Seg", date: "29/05", distance: 120, steps: 250, active: 15, inactive: 45, location: "casa" },
    { hour: "10:00", day: "Seg", date: "29/05", distance: 150, steps: 320, active: 18, inactive: 42, location: "casa" },
    { hour: "11:00", day: "Seg", date: "29/05", distance: 180, steps: 380, active: 20, inactive: 40, location: "quintal" },
    { hour: "12:00", day: "Seg", date: "29/05", distance: 140, steps: 300, active: 15, inactive: 45, location: "casa" },
    { hour: "13:00", day: "Seg", date: "29/05", distance: 90, steps: 190, active: 10, inactive: 50, location: "casa" },
    { hour: "14:00", day: "Seg", date: "29/05", distance: 160, steps: 340, active: 18, inactive: 42, location: "quintal" },
    { hour: "15:00", day: "Seg", date: "29/05", distance: 120, steps: 250, active: 15, inactive: 45, location: "casa" },
    { hour: "16:00", day: "Seg", date: "29/05", distance: 100, steps: 210, active: 12, inactive: 48, location: "casa" },
    { hour: "17:00", day: "Seg", date: "29/05", distance: 900, steps: 1900, active: 35, inactive: 25, location: "rua" },
    { hour: "18:00", day: "Seg", date: "29/05", distance: 220, steps: 460, active: 22, inactive: 38, location: "quintal" },
    { hour: "19:00", day: "Seg", date: "29/05", distance: 150, steps: 320, active: 18, inactive: 42, location: "casa" },
    { hour: "20:00", day: "Seg", date: "29/05", distance: 90, steps: 190, active: 12, inactive: 48, location: "casa" },
    { hour: "21:00", day: "Seg", date: "29/05", distance: 40, steps: 80, active: 5, inactive: 55, location: "casa" },
    { hour: "22:00", day: "Seg", date: "29/05", distance: 10, steps: 20, active: 2, inactive: 58, location: "casa" },
    { hour: "23:00", day: "Seg", date: "29/05", distance: 0, steps: 0, active: 0, inactive: 60, location: "casa" }
  ];
};

// Dados diários (a cada hora) - Dom (gato) - BAIXO nível de atividade
export const getDomDailyData = (): PetGPSData[] => {
  return [
    { hour: "00:00", day: "Seg", date: "29/05", distance: 60, steps: 130, active: 8, inactive: 52, location: "casa" },
    { hour: "01:00", day: "Seg", date: "29/05", distance: 70, steps: 150, active: 10, inactive: 50, location: "casa" },
    { hour: "02:00", day: "Seg", date: "29/05", distance: 80, steps: 170, active: 11, inactive: 49, location: "casa" },
    { hour: "03:00", day: "Seg", date: "29/05", distance: 50, steps: 110, active: 6, inactive: 54, location: "casa" },
    { hour: "04:00", day: "Seg", date: "29/05", distance: 30, steps: 70, active: 4, inactive: 56, location: "casa" },
    { hour: "05:00", day: "Seg", date: "29/05", distance: 20, steps: 40, active: 3, inactive: 57, location: "casa" },
    { hour: "06:00", day: "Seg", date: "29/05", distance: 10, steps: 20, active: 2, inactive: 58, location: "casa" },
    { hour: "07:00", day: "Seg", date: "29/05", distance: 0, steps: 0, active: 0, inactive: 60, location: "casa" },
    { hour: "08:00", day: "Seg", date: "29/05", distance: 0, steps: 0, active: 0, inactive: 60, location: "casa" },
    { hour: "09:00", day: "Seg", date: "29/05", distance: 0, steps: 0, active: 0, inactive: 60, location: "casa" },
    { hour: "10:00", day: "Seg", date: "29/05", distance: 5, steps: 10, active: 1, inactive: 59, location: "casa" },
    { hour: "11:00", day: "Seg", date: "29/05", distance: 10, steps: 20, active: 2, inactive: 58, location: "casa" },
    { hour: "12:00", day: "Seg", date: "29/05", distance: 20, steps: 40, active: 3, inactive: 57, location: "casa" },
    { hour: "13:00", day: "Seg", date: "29/05", distance: 25, steps: 50, active: 3, inactive: 57, location: "casa" },
    { hour: "14:00", day: "Seg", date: "29/05", distance: 15, steps: 30, active: 2, inactive: 58, location: "casa" },
    { hour: "15:00", day: "Seg", date: "29/05", distance: 10, steps: 20, active: 2, inactive: 58, location: "casa" },
    { hour: "16:00", day: "Seg", date: "29/05", distance: 5, steps: 10, active: 1, inactive: 59, location: "casa" },
    { hour: "17:00", day: "Seg", date: "29/05", distance: 10, steps: 20, active: 2, inactive: 58, location: "casa" },
    { hour: "18:00", day: "Seg", date: "29/05", distance: 20, steps: 40, active: 3, inactive: 57, location: "casa" },
    { hour: "19:00", day: "Seg", date: "29/05", distance: 40, steps: 90, active: 5, inactive: 55, location: "casa" },
    { hour: "20:00", day: "Seg", date: "29/05", distance: 55, steps: 120, active: 7, inactive: 53, location: "casa" },
    { hour: "21:00", day: "Seg", date: "29/05", distance: 65, steps: 140, active: 9, inactive: 51, location: "casa" },
    { hour: "22:00", day: "Seg", date: "29/05", distance: 70, steps: 150, active: 10, inactive: 50, location: "casa" },
    { hour: "23:00", day: "Seg", date: "29/05", distance: 65, steps: 140, active: 9, inactive: 51, location: "casa" }
  ];
};

// Dados semanais - Bella (ALTO nível de atividade)
export const getBellaWeeklyData = (): PetGPSData[] => {
  return [
    { hour: "09:00", day: "Seg", date: "29/05", distance: 3500, steps: 7400, active: 220, inactive: 260, location: "casa+rua" },
    { hour: "09:00", day: "Ter", date: "30/05", distance: 3800, steps: 8000, active: 230, inactive: 250, location: "casa+rua" },
    { hour: "09:00", day: "Qua", date: "31/05", distance: 3600, steps: 7600, active: 225, inactive: 255, location: "casa+rua" },
    { hour: "09:00", day: "Qui", date: "01/06", distance: 3700, steps: 7800, active: 228, inactive: 252, location: "casa+rua" },
    { hour: "09:00", day: "Sex", date: "02/06", distance: 3900, steps: 8200, active: 235, inactive: 245, location: "casa+rua" },
    { hour: "09:00", day: "Sab", date: "03/06", distance: 5000, steps: 10500, active: 280, inactive: 160, location: "parque" },
    { hour: "09:00", day: "Dom", date: "04/06", distance: 5200, steps: 11000, active: 290, inactive: 150, location: "parque" }
  ];
};

// Dados semanais - Thor (MODERADO nível de atividade)
export const getThorWeeklyData = (): PetGPSData[] => {
  return [
    { hour: "09:00", day: "Seg", date: "29/05", distance: 2300, steps: 4800, active: 150, inactive: 330, location: "casa+rua" },
    { hour: "09:00", day: "Ter", date: "30/05", distance: 2400, steps: 5000, active: 155, inactive: 325, location: "casa+rua" },
    { hour: "09:00", day: "Qua", date: "31/05", distance: 2250, steps: 4700, active: 145, inactive: 335, location: "casa+rua" },
    { hour: "09:00", day: "Qui", date: "01/06", distance: 2200, steps: 4600, active: 140, inactive: 340, location: "casa+rua" },
    { hour: "09:00", day: "Sex", date: "02/06", distance: 2500, steps: 5200, active: 160, inactive: 320, location: "casa+rua" },
    { hour: "09:00", day: "Sab", date: "03/06", distance: 3300, steps: 6800, active: 210, inactive: 270, location: "parque" },
    { hour: "09:00", day: "Dom", date: "04/06", distance: 3500, steps: 7200, active: 220, inactive: 260, location: "parque" }
  ];
};

// Dados semanais - Dom (BAIXO nível de atividade)
export const getDomWeeklyData = (): PetGPSData[] => {
  return [
    { hour: "09:00", day: "Seg", date: "29/05", distance: 700, steps: 1500, active: 80, inactive: 400, location: "casa" },
    { hour: "09:00", day: "Ter", date: "30/05", distance: 750, steps: 1600, active: 85, inactive: 395, location: "casa" },
    { hour: "09:00", day: "Qua", date: "31/05", distance: 720, steps: 1550, active: 82, inactive: 398, location: "casa" },
    { hour: "09:00", day: "Qui", date: "01/06", distance: 680, steps: 1450, active: 75, inactive: 405, location: "casa" },
    { hour: "09:00", day: "Sex", date: "02/06", distance: 800, steps: 1700, active: 90, inactive: 390, location: "casa" },
    { hour: "09:00", day: "Sab", date: "03/06", distance: 770, steps: 1650, active: 88, inactive: 392, location: "casa" },
    { hour: "09:00", day: "Dom", date: "04/06", distance: 750, steps: 1600, active: 85, inactive: 395, location: "casa" }
  ];
};

// Dados mensais - Bella (ALTO nível de atividade)
export const getBellaMonthlyData = (): PetGPSData[] => {
  return [
    { hour: "12:00", day: "Sem 1", date: "01/05", distance: 27000, steps: 57000, active: 1650, inactive: 1650, location: "misto" },
    { hour: "12:00", day: "Sem 2", date: "08/05", distance: 28500, steps: 60000, active: 1700, inactive: 1600, location: "misto" },
    { hour: "12:00", day: "Sem 3", date: "15/05", distance: 27800, steps: 58000, active: 1680, inactive: 1620, location: "misto" },
    { hour: "12:00", day: "Sem 4", date: "22/05", distance: 29000, steps: 61000, active: 1750, inactive: 1550, location: "misto" }
  ];
};

// Dados mensais - Thor (MODERADO nível de atividade)
export const getThorMonthlyData = (): PetGPSData[] => {
  return [
    { hour: "12:00", day: "Sem 1", date: "01/05", distance: 16000, steps: 33000, active: 1050, inactive: 2250, location: "misto" },
    { hour: "12:00", day: "Sem 2", date: "08/05", distance: 17500, steps: 36000, active: 1100, inactive: 2200, location: "misto" },
    { hour: "12:00", day: "Sem 3", date: "15/05", distance: 16800, steps: 35000, active: 1070, inactive: 2230, location: "misto" },
    { hour: "12:00", day: "Sem 4", date: "22/05", distance: 18000, steps: 37500, active: 1120, inactive: 2180, location: "misto" }
  ];
};

// Dados mensais - Dom (BAIXO nível de atividade)
export const getDomMonthlyData = (): PetGPSData[] => {
  return [
    { hour: "12:00", day: "Sem 1", date: "01/05", distance: 5000, steps: 10500, active: 580, inactive: 2720, location: "casa" },
    { hour: "12:00", day: "Sem 2", date: "08/05", distance: 5300, steps: 11000, active: 600, inactive: 2700, location: "casa" },
    { hour: "12:00", day: "Sem 3", date: "15/05", distance: 5100, steps: 10700, active: 590, inactive: 2710, location: "casa" },
    { hour: "12:00", day: "Sem 4", date: "22/05", distance: 5400, steps: 11200, active: 610, inactive: 2690, location: "casa" }
  ];
};

// Obter dados de GPS baseado no ID do pet e intervalo de tempo
export const getPetGPSData = (petId: number, timeRange: TimeRange): PetGPSData[] => {
  // Bella (id: 1)
  if (petId === 1) {
    switch (timeRange) {
      case "day":
        return getBellaDailyData();
      case "week":
        return getBellaWeeklyData();
      case "month":
        return getBellaMonthlyData();
      default:
        return getBellaDailyData();
    }
  }
  
  // Dom (id: 2)
  else if (petId === 2) {
    switch (timeRange) {
      case "day":
        return getDomDailyData();
      case "week":
        return getDomWeeklyData();
      case "month":
        return getDomMonthlyData();
      default:
        return getDomDailyData();
    }
  }
  
  // Thor (id: 3)
  else {
    switch (timeRange) {
      case "day":
        return getThorDailyData();
      case "week":
        return getThorWeeklyData();
      case "month":
        return getThorMonthlyData();
      default:
        return getThorDailyData();
    }
  }
};

// Calcular dados resumidos para o pet
export const calculateGPSSummary = (petId: number, timeRange: TimeRange) => {
  const data = getPetGPSData(petId, timeRange);
  
  // Calcular a distância total
  const totalDistance = data.reduce((sum, item) => sum + item.distance, 0);
  
  // Calcular o total de passos
  const totalSteps = data.reduce((sum, item) => sum + item.steps, 0);
  
  // Calcular o tempo total ativo (em minutos)
  const totalActiveTime = data.reduce((sum, item) => sum + item.active, 0);
  
  // Calcular o tempo total inativo (em minutos)
  const totalInactiveTime = data.reduce((sum, item) => sum + item.inactive, 0);

  // Calcular a distribuição de locais
  const locations: Record<string, number> = {};
  data.forEach(item => {
    if (!locations[item.location]) {
      locations[item.location] = 0;
    }
    locations[item.location] += 1;
  });

  // Converter para array de objetos com percentagens
  const locationCount: LocationCount[] = Object.entries(locations).map(([location, count]) => ({
    location,
    count,
    percentage: Math.round((count / data.length) * 100)
  }));

  // Ordenar por contagem
  locationCount.sort((a, b) => b.count - a.count);
  const activePercentage = Math.round((totalActiveTime / (totalActiveTime + totalInactiveTime)) * 100);
  
  // Determinar o nível de atividade com base na porcentagem de tempo ativo
  let activityLevel;
  if (activePercentage >= 50) {
    activityLevel = "ALTO";
  } else if (activePercentage >= 30) {
    activityLevel = "MODERADO";
  } else {
    activityLevel = "BAIXO";
  }

  return {
    totalDistance,
    totalSteps,
    totalActiveTime,
    totalInactiveTime,
    activePercentage,
    activityLevel,
    locationCount
  };
};

// Verificar alertas ou padrões incomuns
export const checkGPSAlerts = (petId: number, timeRange: TimeRange) => {
  const data = getPetGPSData(petId, timeRange);
  const summary = calculateGPSSummary(petId, timeRange);
  
  const alerts = [];
  // Alertas específicos baseados no perfil do pet e no nível de atividade calculado
  if (petId === 1) { // Bella
    if (timeRange === "day" && !data.some(item => item.location === "rua" || item.location === "parque")) {
      alerts.push(`Bella não teve atividade externa hoje. Um passeio diário é recomendado para qualquer cachorro.`);
    }
    
    if (summary.activityLevel === "BAIXO") {
      alerts.push(`Atividade muito abaixo do esperado para Bella (${summary.activePercentage}%). Verifique se há algum problema de saúde.`);
    } else if (summary.activityLevel === "MODERADO") {
      alerts.push(`Bella está com nível moderado de atividade (${summary.activePercentage}%), mas poderia se beneficiar de mais exercícios.`);
    }
  } 
  else if (petId === 3) { // Thor
    if (timeRange === "day" && !data.some(item => item.location === "rua" || item.location === "parque")) {
      alerts.push(`Thor não teve atividade externa hoje. Um passeio diário é importante para sua saúde.`);
    }
    
    if (summary.activityLevel === "BAIXO") {
      alerts.push(`Atividade abaixo do recomendado para um Golden Retriever como Thor (${summary.activePercentage}%). Esta raça precisa de exercícios regulares.`);
    }
  }
  // Dom (gato) não deve sair de casa, mas deve ter atividade adequada dentro de casa
  else if (petId === 2) {
    if (data.some(item => item.location !== "casa")) {
      alerts.push(`Dom saiu de casa. Verifique se ele está seguro, gatos devem permanecer em ambiente interno.`);
    }
    
    if (summary.activityLevel === "BAIXO" && summary.activePercentage < 10) {
      alerts.push(`Nível de atividade muito baixo (${summary.activePercentage}%). Mesmo para gatos, brincadeiras interativas são importantes para saúde mental e física.`);
    }
  }
  
  return {
    hasAlerts: alerts.length > 0,
    alerts
  };
};
