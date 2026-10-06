import test from 'node:test';
import assert from 'node:assert/strict';
import { conditionExercises, conditionPrograms, exercisesForCondition } from '../src/condition-exercises-data.js';

test('arsenal cobre os grupos clínicos solicitados com fichas completas',()=>{
  const expected=['joelho','equilibrio','fascite-plantar','tunel-carpo','dor-lombar','tendao-biceps','fratura','manguito-pos-op','escapula-alada','fibromialgia'];
  assert.ok(expected.every(id=>conditionPrograms.some(program=>program.id===id)));
  assert.ok(conditionExercises.length>=60);
  for(const exercise of conditionExercises){
    assert.ok(exercise.id&&exercise.name&&exercise.objective&&exercise.source);
    assert.ok(exercise.steps.length>=3);
    assert.ok(exercise.conditions.length>=1);
  }
});

test('cada condição possui possibilidades sem ids duplicados',()=>{
  assert.equal(new Set(conditionExercises.map(item=>item.id)).size,conditionExercises.length);
  for(const program of conditionPrograms)assert.ok(exercisesForCondition(program.id).length>=5,program.name);
});
