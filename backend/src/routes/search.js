import { z } from 'zod';
import { parse } from '../lib/http.js';

const TYPE_LABEL = {
  consulta: 'Consulta',
  vacina: 'Vacina',
  exame: 'Exame',
  remedio: 'Remédio',
  vermifugo: 'Vermífugo',
  cirurgia: 'Cirurgia',
};

const DOC_LABEL = { vacinas: 'Vacinas', receitas: 'Receitas', exames: 'Exames', outros: 'Outros' };
const SPECIES_LABEL = { cachorro: 'Cachorro', gato: 'Gato', outro: 'Outro' };
const STATUS_LABEL = {
  aguardando: 'Aguardando',
  em_atendimento: 'Em atendimento',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
};

function fold(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
}

function hit(text, needle) {
  return fold(text).includes(needle);
}

function any(needle, values) {
  return values.some((value) => hit(value, needle));
}

export default async function searchRoutes(app) {
  const { db } = app;

  app.get('/search', async (request) => {
    const { q } = parse(z.object({ q: z.string().trim().min(1).max(80) }), request.query);
    const needle = fold(q);
    if (needle.length < 2) return [];

    const userId = request.userId;
    const pets = db.prepare('SELECT * FROM pets WHERE owner_id = ? ORDER BY name').all(userId);
    const petName = Object.fromEntries(pets.map((pet) => [pet.id, pet.name]));
    const hits = [];
    const broad = (words) => words.some((word) => needle === word || needle.startsWith(`${word} `));

    for (const pet of pets) {
      if (broad(['pet', 'pets']) || any(needle, [pet.name, pet.breed, pet.species, pet.collar_id])) {
        hits.push({
          kind: 'pet',
          id: pet.id,
          title: pet.name,
          subtitle: [SPECIES_LABEL[pet.species] ?? pet.species, pet.breed].filter(Boolean).join(' · '),
          petId: pet.id,
        });
      }
    }

    const events = db
      .prepare(
        `SELECT e.* FROM events e JOIN pets p ON p.id = e.pet_id
         WHERE p.owner_id = ? ORDER BY e.starts_at DESC`,
      )
      .all(userId);
    for (const event of events) {
      const label = TYPE_LABEL[event.type] ?? event.type;
      if (any(needle, [event.title, event.notes, event.type, label, petName[event.pet_id]])) {
        hits.push({
          kind: 'event',
          id: event.id,
          title: event.title,
          subtitle: `${label} · ${petName[event.pet_id]}`,
          petId: event.pet_id,
          type: event.type,
        });
      }
    }

    const documents = db
      .prepare(
        `SELECT d.* FROM documents d JOIN pets p ON p.id = d.pet_id
         WHERE p.owner_id = ? ORDER BY d.uploaded_at DESC`,
      )
      .all(userId);
    for (const doc of documents) {
      const label = DOC_LABEL[doc.category] ?? doc.category;
      if (broad(['documento', 'documentos']) || any(needle, [doc.name, doc.notes, doc.category, label, petName[doc.pet_id]])) {
        hits.push({
          kind: 'document',
          id: doc.id,
          title: doc.name,
          subtitle: `${label} · ${petName[doc.pet_id]}`,
          petId: doc.pet_id,
          type: doc.category,
        });
      }
    }

    const sessions = db
      .prepare(
        `SELECT s.*, sp.name AS specialty
         FROM tele_sessions s
         JOIN specialties sp ON sp.id = s.specialty_id
         WHERE s.user_id = ?
         ORDER BY s.created_at DESC`,
      )
      .all(userId);
    for (const session of sessions) {
      const status = STATUS_LABEL[session.status] ?? session.status;
      if (
        broad(['sessao', 'sessoes', 'telemedicina', 'teleconsulta']) ||
        any(needle, [session.symptoms, session.specialty, session.status, status, petName[session.pet_id]])
      ) {
        hits.push({
          kind: 'session',
          id: session.id,
          title: session.specialty,
          subtitle: [status, petName[session.pet_id], session.symptoms].filter(Boolean).join(' · '),
          petId: session.pet_id,
          type: session.status,
        });
      }
    }

    const team = db.prepare('SELECT * FROM care_team WHERE user_id = ?').all(userId);
    for (const member of team) {
      if (broad(['equipe', 'veterinario']) || any(needle, [member.name, member.role, member.clinic])) {
        hits.push({
          kind: 'care',
          id: member.id,
          title: member.name,
          subtitle: [member.role, member.clinic].filter(Boolean).join(' · '),
        });
      }
    }

    return hits.slice(0, 20);
  });
}
