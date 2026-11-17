import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { HttpError, findOwnedPet, parse } from '../lib/http.js';
import { toDocument } from '../lib/serializers.js';

const createSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do documento'),
  category: z.enum(['vacinas', 'receitas', 'exames', 'outros']),
  fileType: z.string().trim().min(1).default('pdf'),
  fileUrl: z.string().trim().nullish(),
  fileSize: z.number().int().nonnegative().default(0),
  notes: z.string().trim().nullish(),
  favorite: z.boolean().default(false),
});

export default async function documentRoutes(app) {
  const { db } = app;

  const findOwnedDocument = (userId, documentId) => {
    const doc = db
      .prepare('SELECT d.* FROM documents d JOIN pets p ON p.id = d.pet_id WHERE d.id = ? AND p.owner_id = ?')
      .get(documentId, userId);
    if (!doc) throw new HttpError(404, 'Documento não encontrado');
    return doc;
  };

  app.get('/pets/:petId/documents', async (request) => {
    const pet = findOwnedPet(db, request.userId, request.params.petId);
    return db
      .prepare('SELECT * FROM documents WHERE pet_id = ? ORDER BY favorite DESC, uploaded_at DESC')
      .all(pet.id)
      .map(toDocument);
  });

  app.post('/pets/:petId/documents', async (request, reply) => {
    const pet = findOwnedPet(db, request.userId, request.params.petId);
    const body = parse(createSchema, request.body);
    const id = randomUUID();
    db.prepare(`
      INSERT INTO documents (id, pet_id, name, category, file_type, file_url, file_size, notes, favorite, uploaded_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      pet.id,
      body.name,
      body.category,
      body.fileType,
      body.fileUrl ?? null,
      body.fileSize,
      body.notes ?? null,
      body.favorite ? 1 : 0,
      new Date().toISOString(),
    );
    reply.code(201);
    return toDocument(db.prepare('SELECT * FROM documents WHERE id = ?').get(id));
  });

  app.patch('/documents/:documentId', async (request) => {
    const doc = findOwnedDocument(request.userId, request.params.documentId);
    const { favorite } = parse(z.object({ favorite: z.boolean() }), request.body);
    db.prepare('UPDATE documents SET favorite = ? WHERE id = ?').run(favorite ? 1 : 0, doc.id);
    return toDocument(db.prepare('SELECT * FROM documents WHERE id = ?').get(doc.id));
  });

  app.delete('/documents/:documentId', async (request, reply) => {
    const doc = findOwnedDocument(request.userId, request.params.documentId);
    db.prepare('DELETE FROM documents WHERE id = ?').run(doc.id);
    reply.code(204);
  });
}
