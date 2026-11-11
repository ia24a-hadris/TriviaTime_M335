import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createRound,
  answer,
  next,
  progress,
  summary,
  isLastQuestion,
  wasCorrect,
  praise,
} from '../src/services/quizLogic.js';

const q = (correctIndex) => ({ question: 'Q', answers: ['a', 'b', 'c', 'd'], correctIndex });
const settings = (difficulty) => ({ categoryId: 17, categoryName: 'Science & Nature', difficulty, amount: 3 });

test('Punkte je Schwierigkeit: 10 / 20 / 30 pro richtige Antwort', () => {
  for (const [difficulty, pts] of [
    ['easy', 10],
    ['medium', 20],
    ['hard', 30],
  ]) {
    let r = createRound(settings(difficulty), [q(0)]);
    r = answer(r, 0);
    assert.equal(r.score, pts);
  }
});

test('falsche Antwort gibt 0 Punkte, Feedback-Phase zeigt richtig/falsch', () => {
  let r = createRound(settings('medium'), [q(2), q(1)]);
  r = answer(r, 0);
  assert.equal(r.phase, 'feedback');
  assert.equal(wasCorrect(r), false);
  assert.equal(r.score, 0);
  assert.equal(r.correct, 0);
});

test('Doppel-Tap: zweite Antwort auf dieselbe Frage zählt nicht', () => {
  let r = createRound(settings('hard'), [q(1)]);
  r = answer(r, 1);
  r = answer(r, 1);
  assert.equal(r.score, 30);
  assert.equal(r.correct, 1);
});

test('ganze Runde: 2 von 3 richtig bei Mittel = 40 Punkte, danach done', () => {
  let r = createRound(settings('medium'), [q(0), q(1), q(2)]);
  r = next(answer(r, 0)); // richtig
  r = next(answer(r, 3)); // falsch
  assert.equal(isLastQuestion(r), true);
  r = answer(r, 2); // richtig
  r = next(r);
  assert.equal(r.phase, 'done');
  const s = summary(r, new Date('2026-11-11T10:00:00Z'));
  assert.deepEqual(
    { amount: s.amount, correct: s.correct, points: s.points, ppc: s.pointsPerCorrect, date: s.date },
    { amount: 3, correct: 2, points: 40, ppc: 20, date: '2026-11-11T10:00:00.000Z' }
  );
});

test('«Weiter» ohne Antwort geht nicht weiter', () => {
  const r = createRound(settings('easy'), [q(0), q(1)]);
  assert.equal(next(r).index, 0);
});

test('Fortschritt zählt beantwortete Fragen', () => {
  let r = createRound(settings('easy'), [q(0), q(0), q(0), q(0)]);
  assert.equal(progress(r), 0);
  r = answer(r, 0);
  assert.equal(progress(r), 0.25);
  r = next(r);
  assert.equal(progress(r), 0.25);
});

test('Lob-Text', () => {
  assert.equal(praise(8, 10), 'Stark');
  assert.equal(praise(5, 10), 'Gut gemacht');
  assert.equal(praise(1, 10), 'Weiter so');
});
