export interface Specialty {
  id: string;
  name: string;
  description: string;
  icon: string;
  averageWaitTime?: string;
}

export const specialties: Specialty[] = [
  {
    id: "general",
    name: "Clínico Veterinário Geral",
    description: "Consultas gerais e check-ups de rotina",
    icon: "🩺",
    averageWaitTime: "5-15 minutos"
  },
  {
    id: "dermatology",
    name: "Dermatologia",
    description: "Problemas de pele, alergias e pelagem",
    icon: "🔬",
    averageWaitTime: "20-30 minutos"
  },
  {
    id: "cardiology",
    name: "Cardiologia",
    description: "Saúde cardiovascular e problemas cardíacos",
    icon: "❤️",
    averageWaitTime: "30-45 minutos"
  },
  {
    id: "orthopedics",
    name: "Ortopedia",
    description: "Problemas ósseos, articulares e de locomoção",
    icon: "🦴",
    averageWaitTime: "25-40 minutos"
  },
  {
    id: "nutrition",
    name: "Nutrição",
    description: "Orientação alimentar e dietas especiais",
    icon: "🥗",
    averageWaitTime: "15-25 minutos"
  },
  {
    id: "behavior",
    name: "Comportamento",
    description: "Problemas comportamentais e adestramento",
    icon: "🧠",
    averageWaitTime: "20-35 minutos"
  },
  {
    id: "ophthalmology",
    name: "Oftalmologia",
    description: "Saúde ocular e problemas de visão",
    icon: "👁️",
    averageWaitTime: "30-40 minutos"
  },
  {
    id: "dentistry",
    name: "Odontologia",
    description: "Saúde bucal e dental",
    icon: "🦷",
    averageWaitTime: "25-35 minutos"
  }
];

export const loadingMessages = [
  "Estamos buscando um profissional para seu Pet 🔍",
  "Seu Pet será atendido em breve 💚",
  "Você sabia? Pets sentem quando estamos felizes! 😊",
  "Conectando com veterinários disponíveis... 👨‍⚕️",
  "Preparando sala de atendimento virtual 🏥",
  "Quase lá! Aguardando confirmação do profissional ⏰",
  "Curiosidade: Cães podem ter até 300 milhões de receptores olfativos! 👃",
  "Gatos dormem em média 16 horas por dia 😴",
  "Verificando disponibilidade de especialistas... ✅"
];
