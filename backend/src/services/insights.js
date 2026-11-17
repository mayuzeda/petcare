import {
  DAY_MS,
  addDays,
  dayMonthLabel,
  hourLabel,
  localDateKey,
  startOfDay,
  weekdayLabel,
} from '../lib/dates.js';
import { toCareMember, toEvent, toPet } from '../lib/serializers.js';
import { isInRange, speciesProfile } from '../lib/species.js';
import { ensureTelemetry, readingsBetween } from './telemetry.js';

const round1 = (n) => Math.round(n * 10) / 10;
const ratio = (part, total) => (total ? Math.min(1, Math.round((part / total) * 1000) / 1000) : 0);
const average = (values) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);
const sum = (values) => values.reduce((a, b) => a + b, 0);

function changePct(current, previous) {
  if (!previous) return 0;
  return round1(((current - previous) / previous) * 100);
}

function vitalStat(current, previous, key, range, unit, decimals) {
  const values = current.map((r) => r[key]);
  const value = average(values);
  const inRange = values.filter((v) => isInRange(v, range)).length;
  const latest = values.at(-1);
  const factor = 10 ** decimals;
  return {
    value: Math.round(value * factor) / factor,
    latest: latest ?? null,
    unit,
    changePct: changePct(value, average(previous.map((r) => r[key]))),
    progress: ratio(inRange, values.length),
    normalRange: range,
    status: latest == null || isInRange(latest, range) ? 'normal' : 'alerta',
  };
}

function groupByDay(readings, days, now) {
  const today = startOfDay(now);
  const buckets = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = addDays(today, -i);
    buckets.push({ day, key: localDateKey(day), rows: [] });
  }
  const index = new Map(buckets.map((b) => [b.key, b]));
  for (const r of readings) {
    index.get(localDateKey(new Date(r.recorded_at)))?.rows.push(r);
  }
  return buckets;
}

function locationBreakdown(readings) {
  const hours = new Map();
  for (const r of readings) hours.set(r.location, (hours.get(r.location) ?? 0) + 1);
  const total = readings.length || 1;
  return [...hours.entries()]
    .map(([location, count]) => ({
      location,
      minutes: count * 60,
      percentage: round1((count / total) * 100),
    }))
    .sort((a, b) => b.minutes - a.minutes);
}

function upcomingEvents(db, petId, now, limit) {
  const overdue = db
    .prepare(
      `SELECT * FROM events WHERE pet_id = ? AND status = 'agendado' AND starts_at < ?
       ORDER BY starts_at DESC LIMIT 3`,
    )
    .all(petId, now.toISOString());
  const next = db
    .prepare(
      `SELECT * FROM events WHERE pet_id = ? AND status = 'agendado' AND starts_at >= ?
       ORDER BY starts_at LIMIT ?`,
    )
    .all(petId, now.toISOString(), limit);
  return [...overdue.reverse(), ...next].slice(0, limit).map((e) => toEvent(e, now));
}

export function buildDashboard(db, userId, pet, now = new Date()) {
  ensureTelemetry(db, pet, now);
  const profile = speciesProfile(pet.species);

  const last24 = readingsBetween(db, pet.id, new Date(now.getTime() - DAY_MS), now);
  const prev24 = readingsBetween(
    db,
    pet.id,
    new Date(now.getTime() - 2 * DAY_MS),
    new Date(now.getTime() - DAY_MS - 1),
  );

  const weekStart = addDays(startOfDay(now), -6);
  const week = readingsBetween(db, pet.id, weekStart, now);

  const heartRate = vitalStat(last24, prev24, 'heart_rate', profile.heartRate, 'bpm', 0);
  const temperature = vitalStat(last24, prev24, 'temperature', profile.temperature, '°C', 1);
  const steps = sum(last24.map((r) => r.steps));
  const prevSteps = sum(prev24.map((r) => r.steps));

  const weeklyActivity = groupByDay(week, 7, now).map((b) => ({
    label: weekdayLabel(b.day),
    date: b.key,
    activeMinutes: sum(b.rows.map((r) => r.active_min)),
    steps: sum(b.rows.map((r) => r.steps)),
    goalMinutes: profile.dailyActiveMinutesGoal,
  }));

  const alerts = [];
  if (temperature.status === 'alerta') {
    alerts.push({
      severity: 'alta',
      title: 'Temperatura fora do normal',
      message: `${pet.name} está com ${temperature.latest} °C (referência ${profile.temperature.min}–${profile.temperature.max} °C).`,
    });
  }
  if (heartRate.status === 'alerta') {
    alerts.push({
      severity: 'media',
      title: 'Batimentos alterados',
      message: `${pet.name} está com ${heartRate.latest} bpm (referência ${profile.heartRate.min}–${profile.heartRate.max} bpm).`,
    });
  }

  const careTeam = db
    .prepare('SELECT * FROM care_team WHERE user_id = ? ORDER BY last_contact_at DESC LIMIT 5')
    .all(userId)
    .map(toCareMember);

  return {
    pet: toPet(pet),
    hasCollar: Boolean(pet.collar_id),
    generatedAt: now.toISOString(),
    stats: {
      heartRate,
      temperature,
      steps: {
        value: steps,
        unit: 'passos',
        changePct: changePct(steps, prevSteps),
        progress: ratio(steps, profile.dailyStepsGoal),
        goal: profile.dailyStepsGoal,
        status: 'normal',
      },
    },
    weeklyActivity,
    locations: locationBreakdown(week),
    upcomingEvents: upcomingEvents(db, pet.id, now, 5),
    careTeam,
    alerts,
  };
}

const RANGES = {
  day: { days: 1, bucket: 'hour' },
  week: { days: 7, bucket: 'day' },
  month: { days: 30, bucket: 'day' },
};

export function buildSeries(db, pet, range, now = new Date()) {
  ensureTelemetry(db, pet, now);
  const spec = RANGES[range] ?? RANGES.week;

  if (spec.bucket === 'hour') {
    const rows = readingsBetween(db, pet.id, new Date(now.getTime() - DAY_MS + 1), now);
    return rows.map((r) => ({
      label: hourLabel(new Date(r.recorded_at)),
      timestamp: r.recorded_at,
      temperature: r.temperature,
      heartRate: r.heart_rate,
      activity: r.activity,
      steps: r.steps,
      distanceM: r.distance_m,
      activeMinutes: r.active_min,
    }));
  }

  const from = addDays(startOfDay(now), -(spec.days - 1));
  const rows = readingsBetween(db, pet.id, from, now);
  return groupByDay(rows, spec.days, now).map((b) => ({
    label: spec.days <= 7 ? weekdayLabel(b.day) : dayMonthLabel(b.day),
    timestamp: b.day.toISOString(),
    temperature: round1(average(b.rows.map((r) => r.temperature))),
    heartRate: Math.round(average(b.rows.map((r) => r.heart_rate))),
    activity: Math.round(average(b.rows.map((r) => r.activity))),
    steps: sum(b.rows.map((r) => r.steps)),
    distanceM: sum(b.rows.map((r) => r.distance_m)),
    activeMinutes: sum(b.rows.map((r) => r.active_min)),
  }));
}

export function buildHealth(db, pet, range, now = new Date()) {
  const points = buildSeries(db, pet, range, now);
  const profile = speciesProfile(pet.species);
  const summarize = (key) => {
    const values = points.map((p) => p[key]).filter((v) => v > 0);
    if (!values.length) return { avg: 0, min: 0, max: 0 };
    return { avg: round1(average(values)), min: Math.min(...values), max: Math.max(...values) };
  };
  return {
    range,
    points,
    normalRanges: { heartRate: profile.heartRate, temperature: profile.temperature },
    summary: { temperature: summarize('temperature'), heartRate: summarize('heartRate') },
  };
}

export function buildActivity(db, pet, range, now = new Date()) {
  const points = buildSeries(db, pet, range, now);
  const spec = RANGES[range] ?? RANGES.week;
  const from = spec.bucket === 'hour' ? new Date(now.getTime() - DAY_MS) : addDays(startOfDay(now), -(spec.days - 1));
  const profile = speciesProfile(pet.species);
  return {
    range,
    points,
    locations: locationBreakdown(readingsBetween(db, pet.id, from, now)),
    totals: {
      steps: sum(points.map((p) => p.steps)),
      distanceM: sum(points.map((p) => p.distanceM)),
      activeMinutes: sum(points.map((p) => p.activeMinutes)),
    },
    goals: { dailySteps: profile.dailyStepsGoal, dailyActiveMinutes: profile.dailyActiveMinutesGoal },
  };
}
