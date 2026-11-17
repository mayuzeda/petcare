import { buildApp } from './app.js';
import { config } from './config.js';
import { openDatabase } from './db/index.js';
import { DEMO_USER, seedDemo } from './db/seed.js';

const db = openDatabase(config.databasePath);
seedDemo(db);

const app = buildApp({ db, logger: { level: process.env.LOG_LEVEL ?? 'info' } });

try {
  await app.listen({ port: config.port, host: config.host });
  app.log.info(`Conta de demonstração: ${DEMO_USER.email} / ${DEMO_USER.password}`);
} catch (error) {
  app.log.error(error);
  process.exit(1);
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    await app.close();
    db.close();
    process.exit(0);
  });
}
