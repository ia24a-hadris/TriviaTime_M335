import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  topScores,
  rankInCategory,
  rankInList,
  addToHistory,
  flushQueue,
  compareScores,
  groupByDifficulty,
  categoryFilterOptions,
  ALL_CATEGORIES,
} from '../src/services/leaderboard.js';

const e = (id, points, categoryName = 'Science & Nature', date = `2026-11-0${id}`) => ({ id, points, categoryName, date });

test('Top-Liste sortiert nach Punkten, bei Gleichstand der frühere zuerst', () => {
  const list = [e(1, 100), e(2, 300), e(3, 300), e(4, 50)];
  assert.deepEqual(
    topScores(list).map((x) => x.id),
    [2, 3, 1, 4]
  );
  assert.ok(compareScores(e(2, 300), e(3, 300)) < 0);
});

test('Top-Liste nach Kategorie filtern und begrenzen', () => {
  const list = [e(1, 100, 'History'), e(2, 300), e(3, 200, 'History')];
  assert.deepEqual(
    topScores(list, { categoryName: 'History' }).map((x) => x.id),
    [3, 1]
  );
  assert.equal(topScores(list, { limit: 1 }).length, 1);
});

test('Rang innerhalb der Kategorie', () => {
  const list = [e(1, 100), e(2, 300), e(3, 500, 'History'), e(4, 200)];
  assert.equal(rankInCategory(list, list[3]), 2); // 300 > 200 > 100
  assert.equal(rankInCategory(list, list[2]), 1);
});

test('Verlauf: neueste zuerst, höchstens limit Einträge', () => {
  let h = [];
  for (let i = 1; i <= 5; i++) h = addToHistory(h, e(i, i), 3);
  assert.deepEqual(
    h.map((x) => x.id),
    [5, 4, 3]
  );
});

test('Warteschlange: alles gesendet → leer', async () => {
  const sentIds = [];
  const res = await flushQueue([e(1, 10), e(2, 20)], async (x) => sentIds.push(x.id));
  assert.deepEqual(sentIds, [1, 2]);
  assert.equal(res.remaining.length, 0);
  assert.equal(res.error, null);
});

test('Warteschlange: Funkloch beim 2. Eintrag → Rest bleibt erhalten', async () => {
  let calls = 0;
  const res = await flushQueue([e(1, 10), e(2, 20), e(3, 30)], async () => {
    calls++;
    if (calls === 2) throw new Error('offline');
  });
  assert.deepEqual(
    res.sent.map((x) => x.id),
    [1]
  );
  assert.deepEqual(
    res.remaining.map((x) => x.id),
    [2, 3]
  );
  assert.ok(res.error);
});

test('Warteschlange: abgelehnter Eintrag blockiert nicht, der Rest wird gesendet', async () => {
  const res = await flushQueue(
    [e(1, 10), e(2, 9999), e(3, 30)],
    async (x) => {
      if (x.points > 600) throw Object.assign(new Error('abgelehnt'), { code: 'INVALID' });
    },
    { isPermanent: (err) => err.code === 'INVALID' }
  );
  assert.deepEqual(res.sent.map((x) => x.id), [1, 3]);
  assert.deepEqual(res.dropped.map((x) => x.id), [2]);
  assert.equal(res.remaining.length, 0);
  assert.equal(res.error, null);
});

test('Online-Rang: Position und Anzahl, null wenn nicht gefunden', () => {
  const sorted = [e(2, 300), e(1, 200), e(3, 100)];
  assert.deepEqual(rankInList(sorted, 1), { rank: 2, total: 3 });
  assert.equal(rankInList(sorted, 9), null);
});

test('Schwierigkeit: Top-Liste filtert, Aufteilen ergibt drei sortierte Seiten', () => {
  const list = [
    { ...e(1, 30), difficulty: 'easy' },
    { ...e(2, 60), difficulty: 'medium' },
    { ...e(3, 50), difficulty: 'easy' },
    { ...e(4, 90), difficulty: 'hard' },
  ];
  assert.deepEqual(
    topScores(list, { difficulty: 'easy' }).map((x) => x.id),
    [3, 1]
  );
  const pages = groupByDifficulty(list);
  assert.deepEqual(Object.keys(pages), ['easy', 'medium', 'hard']);
  assert.deepEqual(pages.easy.map((x) => x.id), [3, 1]);
  assert.deepEqual(pages.medium.map((x) => x.id), [2]);
  assert.deepEqual(pages.hard.map((x) => x.id), [4]);
  assert.deepEqual(groupByDifficulty([]), { easy: [], medium: [], hard: [] });
  assert.equal(groupByDifficulty(list, 1).easy.length, 1);
});

test('Kategorie-Filter: «Alle» zuerst, alle API-Kategorien, dazu Kategorien nur aus dem Verlauf', () => {
  const api = [
    { id: 17, name: 'Science & Nature' },
    { id: 9, name: 'General Knowledge' },
  ];
  const history = [{ categoryName: 'History', categoryId: 23 }, { categoryName: 'General Knowledge', categoryId: 9 }];
  const options = categoryFilterOptions(api, history);
  assert.deepEqual(
    options.map((o) => o.name),
    ['Alle Kategorien', 'General Knowledge', 'History', 'Science & Nature']
  );
  assert.equal(options[0].id, ALL_CATEGORIES);
  assert.equal(options.find((o) => o.name === 'History').categoryId, 23);
  // ohne Netz (keine API-Kategorien): nur «Alle» und die aus dem Verlauf
  assert.deepEqual(
    categoryFilterOptions([], history).map((o) => o.name),
    ['Alle Kategorien', 'General Knowledge', 'History']
  );
});
