import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { config } from '../config.js';
import { hashPassword } from '../lib/password.js';
import { openDatabase, transaction } from './index.js';

export const DEMO_USER = { name: 'Gustavo', email: 'demo@petcare.app', password: 'petcare123' };

const SPECIALTIES = [
  ['general', 'Clínico geral', 'Consultas gerais e check-ups de rotina', 'stethoscope', 5, 15],
  ['dermatology', 'Dermatologia', 'Problemas de pele, alergias e pelagem', 'dermatology', 20, 30],
  ['cardiology', 'Cardiologia', 'Saúde cardiovascular e problemas cardíacos', 'cardiology', 30, 45],
  ['orthopedics', 'Ortopedia', 'Problemas ósseos, articulares e de locomoção', 'orthopedics', 25, 40],
  ['nutrition', 'Nutrição', 'Orientação alimentar e dietas especiais', 'nutrition', 15, 25],
  ['behavior', 'Comportamento', 'Problemas comportamentais e adestramento', 'behavior', 20, 35],
  ['ophthalmology', 'Oftalmologia', 'Saúde ocular e problemas de visão', 'ophthalmology', 30, 40],
  ['dentistry', 'Odontologia', 'Saúde bucal e dental', 'dentistry', 25, 35],
];

export function seedSpecialties(db) {
  const insert = db.prepare(
    'INSERT OR IGNORE INTO specialties (id, name, description, icon, wait_min, wait_max) VALUES (?, ?, ?, ?, ?, ?)',
  );
  for (const s of SPECIALTIES) insert.run(...s);
}

function at(daysFromNow, time) {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

function hoursAgo(hours) {
  return new Date(Date.now() - hours * 3600_000).toISOString();
}

export function seedDemo(db) {
  seedSpecialties(db);
  if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(DEMO_USER.email)) {
    ensureDemoSessions(db);
    return;
  }

  transaction(db, () => {
    const now = new Date().toISOString();
    const userId = randomUUID();
    db.prepare('INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)').run(
      userId,
      DEMO_USER.name,
      DEMO_USER.email,
      hashPassword(DEMO_USER.password),
      now,
    );

    const pets = {
      bella: { name: 'Bella', species: 'cachorro', breed: 'SRD', sex: 'femea', birth: '2021-03-12', weight: 15, collar: '52386', photo: '/static/pets/bela.png', fever: 0 },
      dom: { name: 'Dom', species: 'gato', breed: 'SRD', sex: 'macho', birth: '2019-08-02', weight: 5.4, collar: '54486', photo: '/static/pets/dom.jpeg', fever: 0 },
      thor: { name: 'Thor', species: 'cachorro', breed: 'Golden Retriever', sex: 'macho', birth: '2017-01-20', weight: 30, collar: '512386', photo: '/static/pets/thor.jpg', fever: 1 },
    };
    const insertPet = db.prepare(`
      INSERT INTO pets (id, owner_id, name, species, breed, sex, birth_date, weight_kg, collar_id, photo_url, sim_fever, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const ids = {};
    for (const [key, p] of Object.entries(pets)) {
      ids[key] = randomUUID();
      insertPet.run(ids[key], userId, p.name, p.species, p.breed, p.sex, p.birth, p.weight, p.collar, p.photo, p.fever, now);
    }

    const insertEvent = db.prepare(`
      INSERT INTO events (id, pet_id, title, type, starts_at, reminder, notes, status, created_at)
      VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
    `);
    const events = [
      ['thor', 'Consulta de rotina', 'consulta', at(3, '14:30'), null, 'agendado'],
      ['bella', 'Vacinação anual (V10)', 'vacina', at(7, '10:00'), null, 'agendado'],
      ['dom', 'Exame de sangue', 'exame', at(5, '09:15'), 'Jejum de 8 horas', 'agendado'],
      ['thor', 'Dose de antibiótico', 'remedio', at(0, '08:00'), 'Administrar com alimento', 'agendado'],
      ['bella', 'Aplicação de vermífugo', 'vermifugo', at(14, '19:00'), null, 'agendado'],
      ['dom', 'Cirurgia dentária', 'cirurgia', at(21, '08:30'), 'Jejum de 12 horas antes da cirurgia', 'agendado'],
      ['thor', 'Resultado de exames', 'exame', at(10, '15:45'), null, 'agendado'],
      ['bella', 'Consulta dermatológica', 'consulta', at(2, '11:30'), 'Verificar manchas na pele', 'agendado'],
      ['dom', 'Vacina antirrábica', 'vacina', at(12, '16:00'), null, 'agendado'],
      ['thor', 'Medicação cardíaca', 'remedio', at(1, '20:00'), 'Administrar depois da janta', 'agendado'],
      ['bella', 'Banho e tosa', 'consulta', at(-6, '10:00'), null, 'concluido'],
      ['bella', 'Antipulgas mensal', 'vermifugo', at(-1, '18:00'), null, 'agendado'],
      ['thor', 'Raio-X de tórax', 'exame', at(-12, '09:00'), null, 'concluido'],
    ];
    for (const [pet, title, type, startsAt, notes, status] of events) {
      insertEvent.run(randomUUID(), ids[pet], title, type, startsAt, notes, status, now);
    }

    const insertDoc = db.prepare(`
      INSERT INTO documents (id, pet_id, name, category, file_type, file_url, file_size, notes, favorite, uploaded_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const docs = [
      ['bella', 'Resultado exame de sangue', 'exames', 'pdf', 1250000, 'Hemograma completo — Clínica PetVet', 1, hoursAgo(24 * 9)],
      ['bella', 'Carteira de vacinação', 'vacinas', 'pdf', 850000, 'Inclui todas as vacinas até hoje', 1, hoursAgo(24 * 30)],
      ['dom', 'Receita de antibiótico', 'receitas', 'jpg', 450000, 'Após procedimento dental', 0, hoursAgo(24 * 4)],
      ['thor', 'Raio-X de tórax', 'exames', 'png', 2800000, 'Suspeita de problema respiratório', 1, hoursAgo(24 * 12)],
      ['thor', 'Laudo cardiológico', 'exames', 'pdf', 980000, null, 0, hoursAgo(24 * 20)],
    ];
    for (const [pet, name, category, fileType, size, notes, fav, uploadedAt] of docs) {
      insertDoc.run(randomUUID(), ids[pet], name, category, fileType, null, size, notes, fav, uploadedAt);
    }

    const insertNotification = db.prepare(`
      INSERT INTO notifications (id, user_id, pet_id, type, title, message, read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const notifications = [
      ['thor', 'alerta', 'Temperatura elevada', 'A coleira do Thor registrou temperatura acima de 39,5 °C.', 0, hoursAgo(1)],
      ['thor', 'lembrete', 'Medicação de hoje', 'Dose de antibiótico às 08:00 — administrar com alimento.', 0, hoursAgo(3)],
      ['bella', 'lembrete', 'Consulta dermatológica', 'Bella tem consulta em 2 dias às 11:30.', 0, hoursAgo(6)],
      ['dom', 'exame', 'Preparo para exame', 'Dom precisa de jejum de 8 horas antes do exame de sangue.', 1, hoursAgo(20)],
      ['bella', 'atividade', 'Meta de passos batida!', 'Bella superou a meta diária de 10.000 passos ontem.', 1, hoursAgo(30)],
    ];
    for (const [pet, type, title, message, read, createdAt] of notifications) {
      insertNotification.run(randomUUID(), userId, ids[pet], type, title, message, read, createdAt);
    }

    const insertCare = db.prepare(`
      INSERT INTO care_team (id, user_id, name, role, clinic, rating, phone, last_contact_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const team = [
      ['Dra. Marina Lopes', 'Clínica geral', 'Clínica PetVet', 5, '(11) 98888-1020', hoursAgo(0.5)],
      ['Dr. Rafael Souza', 'Cardiologista', 'Hospital Vet Center', 4.8, '(11) 97777-3344', hoursAgo(26)],
      ['Ana Beatriz', 'Adestradora', 'Escola Pet Feliz', 4.5, '(11) 96666-5566', hoursAgo(72)],
      ['Dr. Caio Mendes', 'Dermatologista', 'DermaPet', 4.2, '(11) 95555-7788', hoursAgo(24 * 8)],
    ];
    for (const [name, role, clinic, rating, phone, last] of team) {
      insertCare.run(randomUUID(), userId, name, role, clinic, rating, phone, last);
    }
  });

  ensureDemoSessions(db);
}

function ensureDemoSessions(db) {
  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(DEMO_USER.email);
  if (!user) return;
  if (db.prepare('SELECT 1 FROM tele_sessions WHERE user_id = ?').get(user.id)) return;
  const pets = Object.fromEntries(
    db
      .prepare('SELECT id, name FROM pets WHERE owner_id = ?')
      .all(user.id)
      .map((pet) => [pet.name, pet.id]),
  );
  const insert = db.prepare(`
    INSERT INTO tele_sessions (id, user_id, pet_id, specialty_id, symptoms, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const now = new Date().toISOString();
  if (pets.Bella) {
    insert.run(randomUUID(), user.id, pets.Bella, 'dermatology', 'Manchas na pele e coceira', 'finalizada', now);
  }
  if (pets.Thor) {
    insert.run(randomUUID(), user.id, pets.Thor, 'cardiology', 'Cansaço depois do passeio', 'aguardando', now);
  }
}

const isCli = import.meta.url === pathToFileURL(process.argv[1] ?? '').href;
if (isCli) {
  if (process.argv.includes('--reset')) {
    for (const suffix of ['', '-wal', '-shm']) fs.rmSync(config.databasePath + suffix, { force: true });
  }
  const db = openDatabase(config.databasePath);
  seedDemo(db);
  db.close();
  console.log(`Banco pronto em ${config.databasePath}`);
  console.log(`Login de demonstração: ${DEMO_USER.email} / ${DEMO_USER.password}`);
}
