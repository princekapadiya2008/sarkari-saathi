import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { closeDb } from '../src/db/connection.js';
import { anonymousAgent, setupApp } from './helpers.js';

describe('public catalog', () => {
  let app;
  let agent;

  beforeEach(() => {
    ({ app } = setupApp());
    agent = anonymousAgent(app);
  });
  afterEach(() => closeDb());

  it('lists published demo journeys and categories', async () => {
    const categories = await agent.get('/api/categories');
    assert.equal(categories.status, 200);
    assert.ok(categories.body.data.find((item) => item.id === 'Government'));

    const journeys = await agent.get('/api/journeys');
    assert.equal(journeys.status, 200);
    assert.ok(journeys.body.data.length >= 5);
    assert.ok(journeys.body.data.every((item) => item.status === 'published'));
  });

  it('filters and searches published journeys', async () => {
    const education = await agent.get('/api/journeys?category=Education');
    assert.equal(education.body.data.length, 1);
    assert.equal(education.body.data[0].id, 'demo-college');

    const search = await agent.get('/api/journeys?q=college');
    assert.equal(search.body.data[0].id, 'demo-college');
  });

  it('returns journey details, steps, documents, and branches', async () => {
    const detail = await agent.get('/api/journeys/demo-government-doc');
    assert.equal(detail.status, 200);
    assert.ok(detail.body.data.steps.length >= 7);
    assert.equal(detail.body.data.createdBy, undefined);

    const steps = await agent.get('/api/journeys/demo-government-doc/steps');
    assert.equal(steps.body.data[0].title, 'Check eligibility');

    const docs = await agent.get('/api/journeys/demo-government-doc/documents');
    assert.ok(docs.body.data.some((item) => item.name.includes('Identity proof')));

    const branches = await agent.get('/api/journeys/demo-government-doc/branches');
    assert.equal(branches.body.data[0].question.includes('required document'), true);
  });

  it('returns 404 for missing or unpublished ids', async () => {
    const missing = await agent.get('/api/journeys/does-not-exist');
    assert.equal(missing.status, 404);
  });
});
