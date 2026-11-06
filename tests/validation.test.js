import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateNickname,
  validateQuestionCount,
  validateQuizSetup,
  hasErrors,
} from '../src/services/validation.js';

test('Nickname: gültige Namen', () => {
  assert.equal(validateNickname('QuizMaus88'), null);
  assert.equal(validateNickname('abc'), null);
  assert.equal(validateNickname('a'.repeat(15)), null);
  assert.equal(validateNickname('  Nikola  '), null); // Leerzeichen am Rand werden entfernt
  assert.equal(validateNickname('Jürg'), null);
});

test('Nickname: ungültige Namen mit Meldung', () => {
  assert.match(validateNickname(''), /Bitte gib einen Nickname ein/);
  assert.match(validateNickname('ab'), /Zu kurz/);
  assert.match(validateNickname('a'.repeat(16)), /Zu lang/);
  assert.match(validateNickname('Quiz Maus'), /Nur Buchstaben und Zahlen/);
  assert.match(validateNickname('quiz_maus!'), /Nur Buchstaben und Zahlen/);
});

test('Anzahl Fragen: Grenzen 5–20', () => {
  assert.equal(validateQuestionCount('5'), null);
  assert.equal(validateQuestionCount('20'), null);
  assert.equal(validateQuestionCount(10), null);
  assert.ok(validateQuestionCount('4'));
  assert.ok(validateQuestionCount('21'));
  assert.ok(validateQuestionCount(''));
  assert.ok(validateQuestionCount('7.5'));
});

test('Quiz-Setup: Kategorie ist Pflicht', () => {
  const errors = validateQuizSetup({ categoryId: null, difficulty: 'medium', amount: '10' });
  assert.ok(errors.category);
  assert.ok(hasErrors(errors));
  const ok = validateQuizSetup({ categoryId: 17, difficulty: 'hard', amount: '10' });
  assert.equal(hasErrors(ok), false);
});
