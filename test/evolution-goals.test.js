import test from 'node:test';
import assert from 'node:assert/strict';
import { catalog } from '../src/store.js';
import { evolutionGoalsFromEntries, findEvolutionExercise, goalsSentence } from '../src/evolution-goals.js';

test('reconhece nome abreviado com dose',()=>{
  const exercise=findEvolutionExercise('agachamento 3x10',catalog);
  assert.equal(exercise?.name,'Agachamento');
});

test('gera finalidades clínicas para exercícios comuns',()=>{
  const goals=evolutionGoalsFromEntries(['sentar e levantar 3x10','elevação de panturrilha 3x10','marcha com obstáculos 5 min'],catalog);
  const text=goalsSentence(goals);
  assert.match(text,/transfer|quadríceps/i);
  assert.match(text,/panturrilha|propulsão/i);
  assert.match(text,/marcha|deslocamento/i);
});

test('mantém finalidade conservadora quando o exercício não é reconhecido',()=>{
  assert.match(goalsSentence(evolutionGoalsFromEntries(['atividade inventada 2x8'],catalog)),/força, mobilidade e funcionalidade/i);
});
