import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { buildApp } from '../src/app.js';
import { openDatabase } from '../src/db/index.js';
import { DEMO_USER, seedDemo } from '../src/db/seed.js';

describe('PetCare API', () => {
  let app;
  let token;
  let pets;

  const call = (method, url, payload) =>
    app.inject({ method, url, payload, headers: token ? { authorization: `Bearer ${token}` } : {} });

  before(async () => {
    const db = openDatabase(':memory:');
    seedDemo(db);
    app = buildApp({ db });
    await app.ready();
  });

  after(() => app.close());

  it('bloqueia rotas privadas sem token', async () => {
    const res = await call('GET', '/pets');
    assert.equal(res.statusCode, 401);
  });

  it('rejeita senha errada e aceita a conta demo', async () => {
    const bad = await call('POST', '/auth/login', { email: DEMO_USER.email, password: 'errada' });
    assert.equal(bad.statusCode, 401);

    const res = await call('POST', '/auth/login', { email: DEMO_USER.email, password: DEMO_USER.password });
    assert.equal(res.statusCode, 200);
    token = res.json().token;
    assert.equal(res.json().user.name, DEMO_USER.name);
  });

  it('lista os pets do usuário', async () => {
    const res = await call('GET', '/pets');
    pets = res.json();
    assert.deepEqual(pets.map((p) => p.name), ['Bella', 'Dom', 'Thor']);
  });

  it('monta o dashboard agregado com telemetria simulada', async () => {
    const thor = pets.find((p) => p.name === 'Thor');
    const res = await call('GET', `/pets/${thor.id}/dashboard`);
    assert.equal(res.statusCode, 200);
    const body = res.json();
    assert.equal(body.weeklyActivity.length, 7);
    assert.ok(body.stats.heartRate.value > 0);
    assert.ok(body.stats.steps.progress >= 0 && body.stats.steps.progress <= 1);
    assert.ok(body.locations.length > 0);
    assert.ok(body.careTeam.length > 0);
    assert.ok(body.upcomingEvents.length > 0);
  });

  it('retorna séries de saúde por período', async () => {
    const bella = pets[0];
    const day = (await call('GET', `/pets/${bella.id}/health?range=day`)).json();
    const month = (await call('GET', `/pets/${bella.id}/health?range=month`)).json();
    assert.ok(day.points.length >= 23);
    assert.equal(month.points.length, 30);
    const invalid = await call('GET', `/pets/${bella.id}/health?range=year`);
    assert.equal(invalid.statusCode, 400);
  });

  it('cria, conclui e remove um evento', async () => {
    const created = await call('POST', '/events', {
      petId: pets[0].id,
      title: 'Reforço de vacina',
      type: 'vacina',
      startsAt: new Date(Date.now() + 86400000).toISOString(),
    });
    assert.equal(created.statusCode, 201);
    const id = created.json().id;

    const done = await call('PATCH', `/events/${id}`, { status: 'concluido' });
    assert.equal(done.json().status, 'concluido');

    const removed = await call('DELETE', `/events/${id}`);
    assert.equal(removed.statusCode, 204);
  });

  it('busca o que já está cadastrado para o usuário', async () => {
    const bella = (await call('GET', '/search?q=bella')).json();
    assert.ok(bella.some((hit) => hit.kind === 'pet' && hit.title === 'Bella'));
    assert.ok(bella.some((hit) => hit.kind === 'event'));
    assert.ok(bella.some((hit) => hit.kind === 'document'));

    const exame = (await call('GET', '/search?q=exame')).json();
    assert.ok(exame.some((hit) => hit.kind === 'event' && hit.type === 'exame'));
    assert.ok(exame.some((hit) => hit.kind === 'document'));

    const sessao = (await call('GET', '/search?q=sessão')).json();
    assert.ok(sessao.some((hit) => hit.kind === 'session'));

    const short = await call('GET', '/search?q=a');
    assert.deepEqual(short.json(), []);

    const foreign = await call('GET', '/search?q=inexistente-xyz');
    assert.deepEqual(foreign.json(), []);
  });

  it('cadastra um novo usuário isolado dos dados demo', async () => {
    const res = await call('POST', '/auth/register', { name: 'Ana', email: 'ana@exemplo.com', password: '123456' });
    assert.equal(res.statusCode, 201);
    const other = res.json().token;
    const list = await app.inject({ method: 'GET', url: '/pets', headers: { authorization: `Bearer ${other}` } });
    assert.deepEqual(list.json(), []);
    const foreign = await app.inject({
      method: 'GET',
      url: `/pets/${pets[0].id}`,
      headers: { authorization: `Bearer ${other}` },
    });
    assert.equal(foreign.statusCode, 404);
  });
});
