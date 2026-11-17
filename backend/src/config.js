import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const config = {
  port: Number(process.env.PORT ?? 3333),
  host: process.env.HOST ?? '0.0.0.0',
  jwtSecret: process.env.JWT_SECRET ?? 'petcare-dev-secret-troque-em-producao',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  databasePath: process.env.DATABASE_PATH ?? path.join(rootDir, 'data', 'petcare.db'),
  publicDir: path.join(rootDir, 'public'),
};
