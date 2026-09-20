import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyState, validateState } from '../src/store.js';

test('estado v5 anterior recebe novas coleções sem perder pacientes',()=>{
  const old=emptyState();
  old.patients.push({id:'p1',code:'P-01'});
  delete old.clinicalMentorCases;
  delete old.voiceStructuredRecords;
  const migrated=validateState(old);
  assert.equal(migrated.patients[0].code,'P-01');
  assert.deepEqual(migrated.clinicalMentorCases,[]);
  assert.deepEqual(migrated.voiceStructuredRecords,[]);
});
