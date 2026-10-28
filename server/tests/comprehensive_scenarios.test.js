import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { closeDb, getDb } from '../src/db/connection.js';
import { anonymousAgent, makeUser, setupApp, signedInAgent, validJourney, PASSWORD } from './helpers.js';

describe('Phase 7 — Comprehensive Verification Scenarios', () => {
  let app;
  let adminAgent;
  let citizen1Agent;
  let citizen2Agent;

  beforeEach(async () => {
    ({ app } = setupApp());
    await makeUser({ name: 'Admin User', email: 'admin@example.com', role: 'admin' });
    await makeUser({ name: 'Citizen One', email: 'citizen1@example.com', role: 'user' });
    await makeUser({ name: 'Citizen Two', email: 'citizen2@example.com', role: 'user' });

    adminAgent = await signedInAgent(app, 'admin@example.com');
    citizen1Agent = await signedInAgent(app, 'citizen1@example.com');
    citizen2Agent = await signedInAgent(app, 'citizen2@example.com');
  });

  afterEach(() => closeDb());

  it('Scenario 1 & 6: Normal user and Admin user login verification', async () => {
    // Normal user profile check
    const userMe = await citizen1Agent.get('/api/auth/me');
    assert.equal(userMe.status, 200);
    assert.equal(userMe.body.data.user.role, 'user');
    assert.equal(userMe.body.data.user.email, 'citizen1@example.com');

    // Admin user profile check
    const adminMe = await adminAgent.get('/api/auth/me');
    assert.equal(adminMe.status, 200);
    assert.equal(adminMe.body.data.user.role, 'admin');
    assert.equal(adminMe.body.data.user.email, 'admin@example.com');
  });

  it('Scenario 3 & 4: Normal user cannot access Admin endpoints (403 Forbidden)', async () => {
    // Direct Admin API requests from normal user
    const listJourneys = await citizen1Agent.get('/api/admin/journeys');
    assert.equal(listJourneys.status, 403);
    assert.equal(listJourneys.body.error.code, 'FORBIDDEN');

    const createJourney = await citizen1Agent.post('/api/admin/journeys').send(validJourney());
    assert.equal(createJourney.status, 403);

    const listRequests = await citizen1Agent.get('/api/admin/requests');
    assert.equal(listRequests.status, 403);

    const addCategory = await citizen1Agent.post('/api/admin/categories').send({ id: 'Test', description: 'desc' });
    assert.equal(addCategory.status, 403);
  });

  it('Scenario 5: Logged-out users cannot access protected endpoints (401 Auth Required)', async () => {
    const anon = anonymousAgent(app);

    const adminCheck = await anon.get('/api/admin/journeys');
    assert.equal(adminCheck.status, 401);
    assert.equal(adminCheck.body.error.code, 'AUTH_REQUIRED');

    const userCheck = await anon.get('/api/me/journeys');
    assert.equal(userCheck.status, 401);
    assert.equal(userCheck.body.error.code, 'AUTH_REQUIRED');

    const meCheck = await anon.get('/api/auth/me');
    assert.equal(meCheck.status, 401);
  });

  it('Scenario 6: Admin can access authorized Admin features (200 OK)', async () => {
    const journeys = await adminAgent.get('/api/admin/journeys');
    assert.equal(journeys.status, 200);
    assert.ok(Array.isArray(journeys.body.data));

    const requests = await adminAgent.get('/api/admin/requests');
    assert.equal(requests.status, 200);
    assert.ok(Array.isArray(requests.body.data));

    const categories = await adminAgent.get('/api/admin/categories');
    assert.equal(categories.status, 200);
    assert.ok(Array.isArray(categories.body.data));
  });

  it('Scenario 7: Registration cannot create an admin account', async () => {
    const anon = anonymousAgent(app);

    // Attempting to pass role: 'admin' must fail schema validation (strict schema)
    const exploitAttempt = await anon.post('/api/auth/register').send({
      name: 'Hacker',
      email: 'hacker@example.com',
      password: PASSWORD,
      role: 'admin',
    });
    assert.equal(exploitAttempt.status, 400);

    // Standard registration always assigns role: 'user'
    const legitimate = await anon.post('/api/auth/register').send({
      name: 'New Citizen',
      email: 'newcitizen@example.com',
      password: PASSWORD,
    });
    assert.equal(legitimate.status, 201);
    assert.equal(legitimate.body.data.user.role, 'user');
    assert.equal(legitimate.body.data.user.email, 'newcitizen@example.com');
  });

  it('Scenario 8: Logout invalidates the authenticated session', async () => {
    // Verified before logout
    const preCheck = await citizen1Agent.get('/api/auth/me');
    assert.equal(preCheck.status, 200);

    // Execute logout
    const logoutRes = await citizen1Agent.post('/api/auth/logout');
    assert.equal(logoutRes.status, 200);

    // Verify session token is no longer accepted
    const postCheck = await citizen1Agent.get('/api/auth/me');
    assert.equal(postCheck.status, 401);

    const journeyCheck = await citizen1Agent.get('/api/me/journeys');
    assert.equal(journeyCheck.status, 401);
  });

  it('Scenario 9: Expired sessions are rejected', async () => {
    // Manually expire all sessions in the test database
    const past = new Date(Date.now() - 10000).toISOString();
    getDb().prepare('UPDATE sessions SET expires_at = ?').run(past);

    const expiredCheck = await citizen1Agent.get('/api/auth/me');
    assert.equal(expiredCheck.status, 401);
    assert.equal(expiredCheck.body.error.code, 'AUTH_REQUIRED');
  });

  it('Scenario 10: User A cannot read, modify, delete, or restore User B\'s personal journeys', async () => {
    // Citizen 1 creates a personal journey
    const created = await citizen1Agent.post('/api/me/journeys').send(validJourney({
      title: 'Citizen 1 Private Journey',
    }));
    assert.equal(created.status, 201);
    const jId = created.body.data.id;
    const stepId = created.body.data.steps[0].id;

    // Citizen 2 attempts to read Citizen 1's journey -> 404
    const readAttempt = await citizen2Agent.get(`/api/me/journeys/${jId}`);
    assert.equal(readAttempt.status, 404);

    // Citizen 2 attempts to modify Citizen 1's journey -> 404
    const updateAttempt = await citizen2Agent.put(`/api/me/journeys/${jId}`).send(validJourney({
      title: 'Hacked Title',
    }));
    assert.equal(updateAttempt.status, 404);

    // Citizen 2 attempts to update progress on Citizen 1's journey -> 404
    const progressAttempt = await citizen2Agent.patch(`/api/me/journeys/${jId}/progress`).send({
      stepId,
      completed: true,
    });
    assert.equal(progressAttempt.status, 404);

    // Citizen 2 attempts to update checklist on Citizen 1's journey -> 404
    const checklistAttempt = await citizen2Agent.patch(`/api/me/journeys/${jId}/checklist`).send({
      documentName: 'Document A',
      checked: true,
    });
    assert.equal(checklistAttempt.status, 404);

    // Citizen 2 attempts to delete Citizen 1's journey -> 404
    const deleteAttempt = await citizen2Agent.delete(`/api/me/journeys/${jId}`);
    assert.equal(deleteAttempt.status, 404);

    // Citizen 2 attempts to restore Citizen 1's journey -> 404
    const restoreAttempt = await citizen2Agent.post(`/api/me/journeys/${jId}/restore`).send({});
    assert.equal(restoreAttempt.status, 404);

    // Citizen 1 can still read their own journey
    const ownerRead = await citizen1Agent.get(`/api/me/journeys/${jId}`);
    assert.equal(ownerRead.status, 200);
    assert.equal(ownerRead.body.data.title, 'Citizen 1 Private Journey');
  });

  it('Scenario 11 & 12: Journey validation and error handling', async () => {
    // Invalid journey with title too short and no steps
    const invalid = await citizen1Agent.post('/api/me/journeys').send({
      title: 'A',
      steps: [],
    });
    assert.equal(invalid.status, 400);
    assert.equal(invalid.body.error.code, 'VALIDATION_ERROR');

    // Duplicate registration rejected
    const dup = await anonymousAgent(app).post('/api/auth/register').send({
      name: 'Duplicate User',
      email: 'citizen1@example.com',
      password: PASSWORD,
    });
    assert.equal(dup.status, 409);
    assert.equal(dup.body.error.code, 'EMAIL_TAKEN');

    // Invalid login credentials rejected
    const badLogin = await anonymousAgent(app).post('/api/auth/login').send({
      email: 'citizen1@example.com',
      password: 'WrongPassword123!',
    });
    assert.equal(badLogin.status, 401);
    assert.equal(badLogin.body.error.code, 'INVALID_CREDENTIALS');
  });

  it('Scenario 13: Citizen requests submission, duplicate prevention, and admin review', async () => {
    // Citizen 1 submits a request
    const req = await citizen1Agent.post('/api/me/requests').send({
      title: 'Ration Card Online Transfer Guide',
      description: 'Need visual route showing inter-district ration card transfer steps and documents.',
      category: 'Government',
    });
    assert.equal(req.status, 201);
    assert.equal(req.body.data.title, 'Ration Card Online Transfer Guide');
    assert.equal(req.body.data.status, 'submitted');

    // Duplicate request submission blocked
    const dupReq = await citizen1Agent.post('/api/me/requests').send({
      title: 'Ration Card Online Transfer Guide',
      description: 'Duplicate attempt for same open title.',
      category: 'Government',
    });
    assert.equal(dupReq.status, 409);

    const rId = req.body.data.id;

    // Citizen 2 cannot see Citizen 1's request
    const c2View = await citizen2Agent.get(`/api/me/requests/${rId}`);
    assert.equal(c2View.status, 404);

    // Admin reviews and transitions status
    const review = await adminAgent.patch(`/api/admin/requests/${rId}`).send({
      status: 'under_review',
      note: 'Admin is looking into this process.',
    });
    assert.equal(review.status, 200);
    assert.equal(review.body.data.status, 'under_review');

    // Admin accepts request
    const accept = await adminAgent.patch(`/api/admin/requests/${rId}`).send({
      status: 'accepted',
      note: 'Verified and accepted for official catalog publishing.',
    });
    assert.equal(accept.status, 200);
    assert.equal(accept.body.data.status, 'accepted');

    // Invalid status rejected by validator
    const badStatus = await adminAgent.patch(`/api/admin/requests/${rId}`).send({
      status: 'non_existent_status',
    });
    assert.equal(badStatus.status, 400);
  });
});
