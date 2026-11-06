// Tests für den Quiz-API-Service. Netzwerk wird mit einem Fake-fetch simuliert,
// damit Flugmodus, Timeout und API-Codes ohne echtes Netz geprüft werden können.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  fetchQuestions,
  fetchCategories,
  buildQuestionsUrl,
  decode,
  shuffle,
  toQuestion,
  errorMessage,
} from '../src/services/quizApi.js';

const settings = { amount: 10, categoryId: 17, difficulty: 'medium' };

const okResponse = (body) => async () => ({ ok: true, status: 200, json: async () => body });

const rawQuestion = {
  type: 'multiple',
  difficulty: 'medium',
  category: 'Science%20%26%20Nature',
  question: 'What%20is%20the%20chemical%20symbol%20for%20gold%3F',
  correct_answer: 'Au',
  incorrect_answers: ['Ag', 'Gd', 'Go'],
};

test('URL enthält Anzahl, Kategorie, Schwierigkeit, nur Multiple Choice und url3986', () => {
  const url = buildQuestionsUrl(settings);
  assert.match(url, /amount=10/);
  assert.match(url, /category=17/);
  assert.match(url, /difficulty=medium/);
  assert.match(url, /type=multiple/);
  assert.match(url, /encode=url3986/);
});

test('Sonderzeichen werden umgewandelt', () => {
  assert.equal(decode('Science%20%26%20Nature'), 'Science & Nature');
  assert.equal(decode('Earth%27s%2021%25'), "Earth's 21%");
  assert.equal(decode('Caf%C3%A9'), 'Café');
  assert.equal(decode('100%'), '100%'); // ungültige Kodierung → unverändert
});

test('Antworten werden gemischt, richtige Antwort bleibt auffindbar', () => {
  const q = toQuestion(rawQuestion, 0, () => 0);
  assert.equal(q.question, 'What is the chemical symbol for gold?');
  assert.equal(q.answers.length, 4);
  assert.equal(q.answers[q.correctIndex], 'Au');
  assert.deepEqual([...q.answers].sort(), ['Ag', 'Au', 'Gd', 'Go']);
  // Mischen verändert das Original nicht
  const list = [1, 2, 3, 4];
  shuffle(list);
  assert.deepEqual(list, [1, 2, 3, 4]);
});

test('Erfolgreiche Antwort liefert umgewandelte Fragen', async () => {
  const questions = await fetchQuestions(settings, {
    fetchImpl: okResponse({ response_code: 0, results: [rawQuestion, rawQuestion] }),
  });
  assert.equal(questions.length, 2);
  assert.equal(questions[0].category, 'Science & Nature');
});

test('Flugmodus / kein Netz → OFFLINE', async () => {
  const fetchImpl = async () => {
    throw new TypeError('Network request failed');
  };
  await assert.rejects(fetchQuestions(settings, { fetchImpl }), { code: 'OFFLINE' });
});

test('Timeout nach der eingestellten Zeit → TIMEOUT', async () => {
  // Fake-fetch, das nie antwortet, aber auf Abbruch reagiert
  const fetchImpl = (url, { signal }) =>
    new Promise((_, reject) => {
      signal.addEventListener('abort', () => {
        const e = new Error('aborted');
        e.name = 'AbortError';
        reject(e);
      });
    });
  await assert.rejects(fetchQuestions(settings, { fetchImpl, timeoutMs: 50 }), { code: 'TIMEOUT' });
});

test('API-Code 1 (zu wenige Fragen) → NOT_ENOUGH mit verständlicher Meldung', async () => {
  const err = await fetchQuestions(settings, {
    fetchImpl: okResponse({ response_code: 1, results: [] }),
  }).catch((e) => e);
  assert.equal(err.code, 'NOT_ENOUGH');
  assert.match(errorMessage(err), /zu wenige Fragen/);
});

test('API-Code 5 (Rate-Limit) → wartet 5 s und versucht es einmal erneut', async () => {
  let calls = 0;
  let waited = 0;
  const fetchImpl = async () => {
    calls++;
    const body = calls === 1 ? { response_code: 5, results: [] } : { response_code: 0, results: [rawQuestion] };
    return { ok: true, status: 200, json: async () => body };
  };
  const questions = await fetchQuestions(settings, {
    fetchImpl,
    sleepImpl: async (ms) => {
      waited = ms;
    },
  });
  assert.equal(calls, 2);
  assert.equal(waited, 5000);
  assert.equal(questions.length, 1);
});

test('API-Code 5 zweimal hintereinander → RATE_LIMIT', async () => {
  await assert.rejects(
    fetchQuestions(settings, {
      fetchImpl: okResponse({ response_code: 5, results: [] }),
      sleepImpl: async () => {},
    }),
    { code: 'RATE_LIMIT' }
  );
});

test('Kategorien werden alphabetisch sortiert', async () => {
  const cats = await fetchCategories({
    fetchImpl: okResponse({
      trivia_categories: [
        { id: 17, name: 'Science & Nature' },
        { id: 9, name: 'General Knowledge' },
      ],
    }),
  });
  assert.deepEqual(
    cats.map((c) => c.id),
    [9, 17]
  );
});
