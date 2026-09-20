import test from 'node:test';
import assert from 'node:assert/strict';
import { structureTranscript } from '../src/voice-structure.js';
import { buildRapidEvolution } from '../src/rapid-care-ui.js';

test('áudio clínico vira sugestões estruturadas sem apagar a fonte',()=>{
  const text='Paciente refere dor nos joelhos há vários anos. Piora quando anda muito. Apresenta marcha com bengala.';
  const result=structureTranscript(text);
  assert.equal(result.sourceText,text);
  assert.match(result.fields.chiefComplaint.value,/dor nos joelhos/i);
  assert.match(result.fields.painWorse.value,/piora quando anda/i);
  assert.match(result.fields.ambulation.value,/bengala/i);
});

test('evolução rápida inclui somente campos realmente registrados',()=>{
  const result=buildRapidEvolution({date:'2026-09-20',pain:'antes 6/10; depois 4/10',exercise:'sentar e levantar 3x10',response:'sem intercorrências'});
  assert.match(result,/sentar e levantar 3x10/);
  assert.doesNotMatch(result,/Sinais vitais|Marcha|Força/);
});
