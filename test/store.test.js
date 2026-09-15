import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyState, addRecord, validateState, patientRecords, painSeries, catalog, saveState, loadState, STORAGE_KEY } from '../src/store.js';

test('registro clínico fica vinculado ao paciente', () => {
  const state = emptyState();
  const patient = addRecord(state, 'patients', {code:'P-01'});
  addRecord(state, 'sessions', {patientId:patient.id, date:'2026-09-14', painBefore:'4', painAfter:'2'});
  assert.equal(patientRecords(state, patient.id).sessions.length, 1);
  assert.deepEqual(painSeries(state.sessions), [{date:'2026-09-14', before:4, after:2}]);
});
test('exercício exige proveniência e todos os itens iniciais têm fonte', () => {
  assert.ok(catalog.every(ex => ex.source && ex.name));
  assert.throws(() => addRecord(emptyState(), 'exercises', {name:'Exemplo'}), /fonte/);
});
test('backup validado persiste e rejeita formato incompatível', () => {
  const memory = new Map(); const storage = {getItem:k => memory.get(k), setItem:(k,v) => memory.set(k,v)};
  const state = emptyState(); addRecord(state, 'patients', {code:'P-02'});
  saveState(state, storage);
  assert.equal(loadState(storage).patients[0].code, 'P-02');
  assert.equal(JSON.parse(memory.get(STORAGE_KEY)).version, 3);
  assert.throws(() => validateState({version:99}), /incompatível/);
});


test('migra versão 2 e persiste discussões de caso desidentificadas', () => {
  const legacy={version:2,patients:[],assessments:[],plans:[],sessions:[],exercises:[],favorites:[],repertoires:[],goniometryRecords:[]};
  const state=validateState(legacy);
  assert.equal(state.version,3);
  const row=addRecord(state,'caseDiscussions',{caseCode:'Caso L-01',topic:'Lombalgia'});
  assert.equal(state.caseDiscussions[0].id,row.id);
});
