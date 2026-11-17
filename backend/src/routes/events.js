import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { HttpError, findOwnedPet, parse } from '../lib/http.js';
import { toEvent } from '../lib/serializers.js';

const EVENT_TYPES = ['consulta', 'vacina', 'exame', 'remedio', 'vermifugo', 'cirurgia'];

const createSchema = z.object({
  petId: z.string().min(1),
  title: z.string().trim().min(1, 'Informe um título'),
  type: z.enum(EVENT_TYPES),
  startsAt: z.iso.datetime({ offset: true }),
  reminder: z.boolean().default(true),
  notes: z.string().trim().nullish(),
});

const updateSchema = createSchema
  .omit({ petId: true })
  .partial()
  .extend({ status: z.enum(['agendado', 'concluido', 'cancelado']).optional() });

const querySchema = z.object({
  petId: z.string().optional(),
  type: z.enum(EVENT_TYPES).optional(),
  from: z.iso.datetime({ offset: true }).optional(),
  to: z.iso.datetime({ offset: true }).optional(),
  status: z.enum(['agendado', 'concluido', 'cancelado']).optional(),
});

const COLUMNS = { title: 'title', type: 'type', startsAt: 'starts_at', reminder: 'reminder', notes: 'notes', status: 'status' };

export default async function eventRoutes(app) {
  const { db } = app;

  const findOwnedEvent = (userId, eventId) => {
    const event = db
      .prepare('SELECT e.* FROM events e JOIN pets p ON p.id = e.pet_id WHERE e.id = ? AND p.owner_id = ?')
      .get(eventId, userId);
    if (!event) throw new HttpError(404, 'Evento não encontrado');
    return event;
  };

  app.get('/events', async (request) => {
    const q = parse(querySchema, request.query);
    const where = ['p.owner_id = ?'];
    const params = [request.userId];
    if (q.petId) (where.push('e.pet_id = ?'), params.push(q.petId));
    if (q.type) (where.push('e.type = ?'), params.push(q.type));
    if (q.status) (where.push('e.status = ?'), params.push(q.status));
    if (q.from) (where.push('e.starts_at >= ?'), params.push(new Date(q.from).toISOString()));
    if (q.to) (where.push('e.starts_at <= ?'), params.push(new Date(q.to).toISOString()));
    const rows = db
      .prepare(`SELECT e.* FROM events e JOIN pets p ON p.id = e.pet_id WHERE ${where.join(' AND ')} ORDER BY e.starts_at`)
      .all(...params);
    const now = new Date();
    return rows.map((r) => toEvent(r, now));
  });

  app.post('/events', async (request, reply) => {
    const body = parse(createSchema, request.body);
    findOwnedPet(db, request.userId, body.petId);
    const id = randomUUID();
    db.prepare(`
      INSERT INTO events (id, pet_id, title, type, starts_at, reminder, notes, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'agendado', ?)
    `).run(
      id,
      body.petId,
      body.title,
      body.type,
      new Date(body.startsAt).toISOString(),
      body.reminder ? 1 : 0,
      body.notes ?? null,
      new Date().toISOString(),
    );
    reply.code(201);
    return toEvent(db.prepare('SELECT * FROM events WHERE id = ?').get(id));
  });

  app.patch('/events/:eventId', async (request) => {
    const event = findOwnedEvent(request.userId, request.params.eventId);
    const body = parse(updateSchema, request.body);
    const entries = Object.entries(body).map(([key, value]) => {
      if (key === 'startsAt') return [key, new Date(value).toISOString()];
      if (key === 'reminder') return [key, value ? 1 : 0];
      return [key, value ?? null];
    });
    if (entries.length) {
      const sets = entries.map(([key]) => `${COLUMNS[key]} = ?`).join(', ');
      db.prepare(`UPDATE events SET ${sets} WHERE id = ?`).run(...entries.map(([, v]) => v), event.id);
    }
    return toEvent(db.prepare('SELECT * FROM events WHERE id = ?').get(event.id));
  });

  app.delete('/events/:eventId', async (request, reply) => {
    const event = findOwnedEvent(request.userId, request.params.eventId);
    db.prepare('DELETE FROM events WHERE id = ?').run(event.id);
    reply.code(204);
  });
}
