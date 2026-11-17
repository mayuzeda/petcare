import { transaction } from '../db/index.js';
import { DAY_MS, HOUR_MS, startOfDay, startOfHour } from '../lib/dates.js';

// Enquanto não há integração com coleiras reais, a telemetria é simulada de forma
// determinística (mesma hora + mesmo pet => mesma leitura) e preenchida sob demanda.
const HISTORY_DAYS = 30;

function hashString(value) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededRandom(seed) {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const DOG_ACTIVITY = [8, 4, 2, 2, 3, 10, 25, 70, 45, 30, 35, 40, 30, 25, 35, 30, 30, 75, 45, 35, 30, 20, 12, 8];
const CAT_ACTIVITY = [35, 30, 20, 15, 20, 30, 45, 40, 25, 15, 10, 10, 12, 10, 15, 20, 30, 45, 55, 50, 40, 35, 40, 38];

function locationFor(species, hour, activity, rand) {
  if (species === 'gato') return activity > 40 && rand() > 0.6 ? 'quintal' : 'casa';
  if ((hour === 7 || hour === 17) && activity > 50) return rand() > 0.5 ? 'parque' : 'rua';
  if (hour < 6 || hour > 21) return 'casa';
  return activity > 28 ? 'quintal' : 'casa';
}

export function simulateReading(pet, date) {
  const rand = seededRandom(hashString(`${pet.id}|${date.toISOString()}`));
  const hour = date.getHours();
  const isCat = pet.species === 'gato';
  const curve = isCat ? CAT_ACTIVITY : DOG_ACTIVITY;
  const energy = 0.75 + (hashString(pet.id) % 50) / 100;

  const activity = Math.max(0, Math.min(100, Math.round(curve[hour] * energy + (rand() - 0.5) * 16)));
  let temperature = (isCat ? 38.3 : 38.0) + activity * 0.006 + (rand() - 0.5) * 0.3;
  let heartRate = (isCat ? 135 : 72) + activity * (isCat ? 0.45 : 0.4) + (rand() - 0.5) * 10;

  if (pet.sim_fever && date.getTime() >= startOfDay(new Date()).getTime() && hour >= 6) {
    const intensity = Math.min(1, (hour - 5) / 3);
    temperature += 1.7 * intensity;
    heartRate += 50 * intensity;
  }

  const stepsPerPoint = isCat ? 5 : 13;
  const steps = Math.round(activity * stepsPerPoint * (0.8 + rand() * 0.4));
  const activeMin = Math.min(60, Math.round(activity * 0.2 + rand() * 3));

  return {
    temperature: Math.round(temperature * 10) / 10,
    heart_rate: Math.round(heartRate),
    activity,
    steps,
    distance_m: Math.round(steps * (isCat ? 0.25 : 0.55)),
    active_min: activeMin,
    location: locationFor(pet.species, hour, activity, rand),
  };
}

export function ensureTelemetry(db, pet, now = new Date()) {
  if (!pet.collar_id) return;

  const currentHour = startOfHour(now);
  const last = db
    .prepare('SELECT MAX(recorded_at) AS last FROM telemetry WHERE pet_id = ?')
    .get(pet.id);

  let cursor = last?.last
    ? new Date(new Date(last.last).getTime() + HOUR_MS)
    : startOfHour(new Date(currentHour.getTime() - HISTORY_DAYS * DAY_MS));
  if (cursor > currentHour) return;

  const insert = db.prepare(`
    INSERT OR IGNORE INTO telemetry
      (pet_id, recorded_at, temperature, heart_rate, activity, steps, distance_m, active_min, location)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  transaction(db, () => {
    for (; cursor <= currentHour; cursor = new Date(cursor.getTime() + HOUR_MS)) {
      const r = simulateReading(pet, cursor);
      insert.run(
        pet.id,
        cursor.toISOString(),
        r.temperature,
        r.heart_rate,
        r.activity,
        r.steps,
        r.distance_m,
        r.active_min,
        r.location,
      );
    }
  });
}

export function readingsBetween(db, petId, from, to) {
  return db
    .prepare(
      `SELECT recorded_at, temperature, heart_rate, activity, steps, distance_m, active_min, location
       FROM telemetry WHERE pet_id = ? AND recorded_at >= ? AND recorded_at <= ?
       ORDER BY recorded_at`,
    )
    .all(petId, from.toISOString(), to.toISOString());
}
