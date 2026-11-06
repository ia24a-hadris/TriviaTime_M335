// Tests für den Online-Bestenlisten-Service mit simuliertem Supabase-Server.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { saveScore, getTopScores, isOnlineConfigured } from '../src/services/onlineScores.js';

const config = { url: 'https://demo.supabase.co', key: 'test-key' };

test('ohne Zugangsdaten gilt die Online-Bestenliste als nicht konfiguriert', () => {
  assert.equal(isOnlineConfigured({}), false);
  assert.equal(isOnlineConfigured({ EXPO_PUBLIC_SUPABASE_URL: 'x', EXPO_PUBLIC_SUPABASE_KEY: 'y' }), true);
});

test('saveScore schickt POST mit Key und nur den erlaubten Feldern', async () => {
  let request;
  const fetchImpl = async (url, opts) => {
    request = { url, ...opts };
    return { ok: true, status: 201, json: async () => [{ id: 1, ...JSON.parse(opts.body) }] };
  };
  const row = await saveScore({ nickname: 'Nikola', points: 160, category: 'Science & Nature' }, { config, fetchImpl });
  assert.equal(request.method, 'POST');
  assert.equal(request.url, 'https://demo.supabase.co/rest/v1/scores');
  assert.equal(request.headers.apikey, 'test-key');
  assert.deepEqual(Object.keys(JSON.parse(request.body)), ['nickname', 'points', 'category']);
  assert.equal(row.id, 1);
});

test('getTopScores lädt Top 20 sortiert nach Punkten, optional nach Kategorie', async () => {
  let calledUrl;
  const fetchImpl = async (url) => {
    calledUrl = url;
    return { ok: true, status: 200, json: async () => [{ nickname: 'A', points: 300 }] };
  };
  const rows = await getTopScores({ category: 'Science & Nature' }, { config, fetchImpl });
  assert.match(calledUrl, /order=points\.desc/);
  assert.match(calledUrl, /limit=20/);
  assert.match(calledUrl, /category=eq\.Science%20%26%20Nature/);
  assert.equal(rows[0].points, 300);
});

test('kein Netz beim Laden → OFFLINE', async () => {
  const fetchImpl = async () => {
    throw new TypeError('Network request failed');
  };
  await assert.rejects(getTopScores({}, { config, fetchImpl }), { code: 'OFFLINE' });
});
