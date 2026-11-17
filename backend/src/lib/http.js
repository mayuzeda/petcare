export class HttpError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function parse(schema, data) {
  const result = schema.safeParse(data ?? {});
  if (!result.success) {
    throw new HttpError(
      400,
      'Dados inválidos',
      result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    );
  }
  return result.data;
}

export function findOwnedPet(db, userId, petId) {
  const pet = db.prepare('SELECT * FROM pets WHERE id = ? AND owner_id = ?').get(petId, userId);
  if (!pet) throw new HttpError(404, 'Pet não encontrado');
  return pet;
}
