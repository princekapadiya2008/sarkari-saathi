import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { closeDb } from '../src/db/connection.js';
import { findOfficialJourney } from '../src/repositories/journeyRepository.js';
import { anonymousAgent, makeUser, setupApp, signedInAgent, validJourney } from './helpers.js';

describe('administrator management', () => {
  let app;
  let admin;
  let user;

  beforeEach(async () => {
    ({ app } = setupApp());
    await makeUser({ email: 'admin@example.com', role: 'admin' });
    await makeUser({ email: 'user@example.com', role: 'user' });
    admin = await signedInAgent(app, 'admin@example.com');
    user = await signedInAgent(app, 'user@example.com');
  });
  afterEach(() => closeDb());

  it('blocks anonymous and non-admin callers', async () => {
    const anon = await anonymousAgent(app).get('/api/admin/journeys');
    assert.equal(anon.status, 401);
    const forbidden = await user.get('/api/admin/journeys');
    assert.equal(forbidden.status, 403);
    const create = await user.post('/api/admin/journeys').send(validJourney());
    assert.equal(create.status, 403);
  });

  it('creates, edits, publishes, archives, and retrieves journeys', async () => {
    const created = await admin.post('/api/admin/journeys').send(validJourney());
    assert.equal(created.status, 201);
    assert.equal(created.body.data.status, 'draft');
    const id = created.body.data.id;
    assert.equal(created.body.data.steps[0].branch.question, 'Do you have it?');

    const publishedCatalog = await anonymousAgent(app).get(`/api/journeys/${id}`);
    assert.equal(publishedCatalog.status, 404);

    await admin.patch(`/api/admin/journeys/${id}/status`).send({ status: 'published' });
    const publicView = await anonymousAgent(app).get(`/api/journeys/${id}`);
    assert.equal(publicView.status, 200);

    const updated = await admin.put(`/api/admin/journeys/${id}`).send(validJourney({
      title: 'Updated Service Journey',
      verificationStatus: 'verified',
      lastVerified: '2026-01-15',
      sourceUrl: 'https://example.gov.in/source',
    }));
    assert.equal(updated.status, 200);
    assert.equal(updated.body.data.title, 'Updated Service Journey');
    assert.equal(updated.body.data.verificationStatus, 'verified');

    const archived = await admin.delete(`/api/admin/journeys/${id}`);
    assert.equal(archived.body.data.status, 'archived');
    assert.equal((await anonymousAgent(app).get(`/api/journeys/${id}`)).status, 404);

    const hard = await admin.delete(`/api/admin/journeys/${id}`);
    assert.equal(hard.body.data.deleted, true);
    assert.equal(findOfficialJourney(id), null);
  });

  it('rejects invalid journey payloads and missing ids', async () => {
    const invalid = await admin.post('/api/admin/journeys').send({ title: 'ab', steps: [] });
    assert.equal(invalid.status, 400);
    const missing = await admin.get('/api/admin/journeys/nope');
    assert.equal(missing.status, 404);
  });

  it('manages categories without allowing builtin deletion', async () => {
    const created = await admin.post('/api/admin/categories').send({ id: 'Legal', description: 'Legal processes' });
    assert.equal(created.status, 201);
    const updated = await admin.patch('/api/admin/categories/Legal').send({ description: 'Courts and documents' });
    assert.equal(updated.body.data.description, 'Courts and documents');
    const builtin = await admin.delete('/api/admin/categories/Government');
    assert.equal(builtin.status, 400);
    const removed = await admin.delete('/api/admin/categories/Legal');
    assert.equal(removed.body.data.deleted, true);
  });
});
