import test from 'node:test';
import assert from 'node:assert/strict';
import { structureTranscript } from '../src/voice-structure.js';
import { buildRapidEvolution, rapidCarePage } from '../src/rapid-care-ui.js';

test('áudio clínico vira sugestões estruturadas sem apagar a fonte',()=>{
  const text='Paciente refere dor nos joelhos há vários anos. Piora quando anda muito. Apresenta marcha com bengala.';
  const result=structureTranscript(text);
  assert.equal(result.sourceText,text);
  assert.match(result.fields.chiefComplaint.value,/dor nos joelhos/i);
  assert.match(result.fields.painWorse.value,/piora quando anda/i);
  assert.match(result.fields.ambulation.value,/bengala/i);
});

test('evolução rápida inclui somente campos realmente registrados',()=>{
  const result=buildRapidEvolution({date:'2026-09-20',focus:'mobilidade',painScore:'6',pain:'antes 6/10; depois 4/10',exercise:'sentar e levantar 3x10',response:'sem intercorrências'});
  assert.match(result,/sentar e levantar 3x10/);
  assert.match(result,/Dor referida: 6\/10/);
  assert.doesNotMatch(result,/Sinais vitais|Marcha|Força/);
});

test('atendimento individual e duplo são telas e fluxos distintos',()=>{
  const state={patients:[{id:'a',code:'ORT-01'},{id:'b',code:'NEU-02'}],quickCareSessions:[],sessions:[]};
  const individual=rapidCarePage(state,'a','','individual');
  assert.match(individual,/Novo atendimento/);
  assert.match(individual,/Salvar atendimento/);
  assert.doesNotMatch(individual,/Salvar registros/);
  const dual=rapidCarePage(state,'a','b','duplo');
  assert.match(dual,/Atendimento rápido/);
  assert.match(dual,/PACIENTE A/);
  assert.match(dual,/PACIENTE B/);
  assert.match(dual,/data-action="save-rapid-all"/);
});
