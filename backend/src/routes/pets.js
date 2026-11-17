import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { findOwnedPet, parse } from '../lib/http.js';
import { toPet } from '../lib/serializers.js';
import { SPECIES } from '../lib/species.js';
import { buildActivity, buildDashboard, buildHealth } from '../services/insights.js';

const petSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do pet'),
  species: z.enum(SPECIES),
  breed: z.string().trim().nullish(),
  sex: z.enum(['macho', 'femea']).nullish(),
  birthDate: z.iso.date().nullish(),
  weightKg: z.number().positive().nullish(),
  collarId: z.string().trim().min(1).nullish(),
  photoUrl: z.string().trim().nullish(),
});

const rangeSchema = z.object({ range: z.enum(['day', 'week', 'month']).default('week') });

const COLUMNS = {
  name: 'name',
  species: 'species',
  breed: 'breed',
  sex: 'sex',
  birthDate: 'birth_date',
  weightKg: 'weight_kg',
  collarId: 'collar_id',
  photoUrl: 'photo_url',
};

export default async function petRoutes(app) {
  const { db } = app;

  app.get('/pets', async (request) =>
    db
      .prepare('SELECT * FROM pets WHERE owner_id = ? ORDER BY created_at, name')
      .all(request.userId)
      .map(toPet),
  );

  app.post('/pets', async (request, reply) => {
    const body = parse(petSchema, request.body);
    const id = randomUUID();
    db.prepare(`
      INSERT INTO pets (id, owner_id, name, species, breed, sex, birth_date, weight_kg, collar_id, photo_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      request.userId,
      body.name,
      body.species,
      body.breed ?? null,
      body.sex ?? null,
      body.birthDate ?? null,
      body.weightKg ?? null,
      body.collarId ?? null,
      body.photoUrl ?? null,
      new Date().toISOString(),
    );
    reply.code(201);
    return toPet(db.prepare('SELECT * FROM pets WHERE id = ?').get(id));
  });

  app.get('/pets/:petId', async (request) => toPet(findOwnedPet(db, request.userId, request.params.petId)));

  app.patch('/pets/:petId', async (request) => {
    const pet = findOwnedPet(db, request.userId, request.params.petId);
    const body = parse(petSchema.partial(), request.body);
    const entries = Object.entries(body).filter(([key]) => key in COLUMNS);
    if (entries.length) {
      const sets = entries.map(([key]) => `${COLUMNS[key]} = ?`).join(', ');
      db.prepare(`UPDATE pets SET ${sets} WHERE id = ?`).run(...entries.map(([, v]) => v ?? null), pet.id);
    }
    return toPet(db.prepare('SELECT * FROM pets WHERE id = ?').get(pet.id));
  });

  app.delete('/pets/:petId', async (request, reply) => {
    const pet = findOwnedPet(db, request.userId, request.params.petId);
    db.prepare('DELETE FROM pets WHERE id = ?').run(pet.id);
    reply.code(204);
  });

  app.get('/pets/:petId/dashboard', async (request) => {
    const pet = findOwnedPet(db, request.userId, request.params.petId);
    return buildDashboard(db, request.userId, pet);
  });

  app.get('/pets/:petId/health', async (request) => {
    const pet = findOwnedPet(db, request.userId, request.params.petId);
    const { range } = parse(rangeSchema, request.query);
    return buildHealth(db, pet, range);
  });

  app.get('/pets/:petId/activity', async (request) => {
    const pet = findOwnedPet(db, request.userId, request.params.petId);
    const { range } = parse(rangeSchema, request.query);
    return buildActivity(db, pet, range);
  });
}
