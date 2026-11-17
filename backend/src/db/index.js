import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pets (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('cachorro', 'gato', 'outro')),
  breed TEXT,
  sex TEXT CHECK (sex IN ('macho', 'femea')),
  birth_date TEXT,
  weight_kg REAL,
  collar_id TEXT,
  photo_url TEXT,
  sim_fever INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS telemetry (
  pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  recorded_at TEXT NOT NULL,
  temperature REAL NOT NULL,
  heart_rate INTEGER NOT NULL,
  activity INTEGER NOT NULL,
  steps INTEGER NOT NULL,
  distance_m INTEGER NOT NULL,
  active_min INTEGER NOT NULL,
  location TEXT NOT NULL,
  PRIMARY KEY (pet_id, recorded_at)
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('consulta', 'vacina', 'exame', 'remedio', 'vermifugo', 'cirurgia')),
  starts_at TEXT NOT NULL,
  reminder INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado', 'concluido', 'cancelado')),
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_pet_start ON events(pet_id, starts_at);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('vacinas', 'receitas', 'exames', 'outros')),
  file_type TEXT NOT NULL,
  file_url TEXT,
  file_size INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  favorite INTEGER NOT NULL DEFAULT 0,
  uploaded_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pet_id TEXT REFERENCES pets(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS care_team (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  clinic TEXT,
  rating REAL NOT NULL DEFAULT 5,
  phone TEXT,
  last_contact_at TEXT
);

CREATE TABLE IF NOT EXISTS specialties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  wait_min INTEGER NOT NULL,
  wait_max INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS tele_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  specialty_id TEXT NOT NULL REFERENCES specialties(id),
  symptoms TEXT,
  status TEXT NOT NULL DEFAULT 'aguardando' CHECK (status IN ('aguardando', 'em_atendimento', 'finalizada', 'cancelada')),
  created_at TEXT NOT NULL
);
`;

export function openDatabase(filePath) {
  if (filePath !== ':memory:') {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }
  const db = new DatabaseSync(filePath);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(SCHEMA);
  return db;
}

export function transaction(db, fn) {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}
