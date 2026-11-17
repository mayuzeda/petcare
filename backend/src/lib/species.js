// Faixas de referência usadas para classificar leituras da coleira.
const PROFILES = {
  cachorro: {
    heartRate: { min: 60, max: 140 },
    temperature: { min: 37.5, max: 39.2 },
    dailyStepsGoal: 10000,
    dailyActiveMinutesGoal: 180,
  },
  gato: {
    heartRate: { min: 120, max: 220 },
    temperature: { min: 38.0, max: 39.2 },
    dailyStepsGoal: 4000,
    dailyActiveMinutesGoal: 150,
  },
  outro: {
    heartRate: { min: 60, max: 200 },
    temperature: { min: 37.5, max: 39.5 },
    dailyStepsGoal: 5000,
    dailyActiveMinutesGoal: 120,
  },
};

export const SPECIES = Object.keys(PROFILES);

export function speciesProfile(species) {
  return PROFILES[species] ?? PROFILES.outro;
}

export function isInRange(value, range) {
  return value >= range.min && value <= range.max;
}
