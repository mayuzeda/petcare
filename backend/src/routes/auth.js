import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { HttpError, parse } from '../lib/http.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { toUser } from '../lib/serializers.js';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome'),
  email: z.email('E-mail inválido').transform((v) => v.toLowerCase()),
  password: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres'),
});

const loginSchema = z.object({
  email: z.email('E-mail inválido').transform((v) => v.toLowerCase()),
  password: z.string().min(1, 'Informe a senha'),
});

export default async function authRoutes(app) {
  const { db } = app;

  const session = (user) => ({ token: app.jwt.sign({ sub: user.id }), user: toUser(user) });

  app.post('/auth/register', async (request, reply) => {
    const body = parse(registerSchema, request.body);
    if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(body.email)) {
      throw new HttpError(409, 'Já existe uma conta com este e-mail');
    }
    const user = {
      id: randomUUID(),
      name: body.name,
      email: body.email,
      created_at: new Date().toISOString(),
    };
    db.prepare('INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)').run(
      user.id,
      user.name,
      user.email,
      hashPassword(body.password),
      user.created_at,
    );
    reply.code(201);
    return session(user);
  });

  app.post('/auth/login', async (request) => {
    const body = parse(loginSchema, request.body);
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(body.email);
    if (!user || !verifyPassword(body.password, user.password_hash)) {
      throw new HttpError(401, 'E-mail ou senha incorretos');
    }
    return session(user);
  });
}
