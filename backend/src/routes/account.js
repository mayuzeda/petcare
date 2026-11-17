import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { HttpError, findOwnedPet, parse } from '../lib/http.js';
import { toCareMember, toNotification, toSpecialty, toTeleSession, toUser } from '../lib/serializers.js';

const sessionSchema = z.object({
  petId: z.string().min(1),
  specialtyId: z.string().min(1),
  symptoms: z.string().trim().nullish(),
});

export default async function accountRoutes(app) {
  const { db } = app;

  app.get('/me', async (request) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(request.userId);
    if (!user) throw new HttpError(401, 'Sessão inválida');
    return toUser(user);
  });

  app.get('/notifications', async (request) => {
    const { petId } = parse(z.object({ petId: z.string().optional() }), request.query);
    const rows = petId
      ? db
          .prepare('SELECT * FROM notifications WHERE user_id = ? AND (pet_id = ? OR pet_id IS NULL) ORDER BY created_at DESC')
          .all(request.userId, petId)
      : db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC').all(request.userId);
    return rows.map(toNotification);
  });

  app.post('/notifications/:notificationId/read', async (request, reply) => {
    db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?').run(
      request.params.notificationId,
      request.userId,
    );
    reply.code(204);
  });

  app.post('/notifications/read-all', async (request, reply) => {
    db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(request.userId);
    reply.code(204);
  });

  app.get('/care-team', async (request) =>
    db
      .prepare('SELECT * FROM care_team WHERE user_id = ? ORDER BY last_contact_at DESC')
      .all(request.userId)
      .map(toCareMember),
  );

  app.get('/telemedicine/specialties', async () =>
    db.prepare('SELECT * FROM specialties ORDER BY wait_min').all().map(toSpecialty),
  );

  app.get('/telemedicine/sessions', async (request) =>
    db
      .prepare('SELECT * FROM tele_sessions WHERE user_id = ? ORDER BY created_at DESC')
      .all(request.userId)
      .map(toTeleSession),
  );

  app.post('/telemedicine/sessions', async (request, reply) => {
    const body = parse(sessionSchema, request.body);
    findOwnedPet(db, request.userId, body.petId);
    if (!db.prepare('SELECT 1 FROM specialties WHERE id = ?').get(body.specialtyId)) {
      throw new HttpError(404, 'Especialidade não encontrada');
    }
    const id = randomUUID();
    db.prepare(`
      INSERT INTO tele_sessions (id, user_id, pet_id, specialty_id, symptoms, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'aguardando', ?)
    `).run(id, request.userId, body.petId, body.specialtyId, body.symptoms ?? null, new Date().toISOString());
    reply.code(201);
    return toTeleSession(db.prepare('SELECT * FROM tele_sessions WHERE id = ?').get(id));
  });
}
