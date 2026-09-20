import test from 'node:test';
import assert from 'node:assert/strict';
import { functionalTests } from '../src/v06-data.js';
import { angleStability, buildDischargeReport, functionalTestSeries, movingMedian, numericChange, readingQuality, reassessmentRows, summarizeTestVariation } from '../src/v06-core.js';
import { emptyState, addRecord, validateState } from '../src/store.js';

test('v0.6 possui central inicial de testes funcionais com fonte e sem pontos de corte',()=>{
  assert.ok(functionalTests.length>=8);
  assert.ok(functionalTests.every(item=>item.name&&item.objective&&item.execution&&item.variable&&item.unit&&item.source&&item.limitations));
  assert.ok(functionalTests.every(item=>!Object.hasOwn(item,'cutoff')));
});

test('histórico funcional calcula apenas variação observada',()=>{
  const records=[{patientId:'p1',testId:'tug',date:'2026-01-01',result:'14.32'},{patientId:'p2',testId:'tug',date:'2026-01-01',result:'8'},{patientId:'p1',testId:'tug',date:'2026-01-10',result:'11.90'}];
  assert.equal(functionalTestSeries(records,'p1','tug').length,2);
  assert.equal(summarizeTestVariation(records,'p1','tug','s').label,'-2.42s');
  assert.equal(numericChange(7,3),-4);
});

test('reavaliação reúne EVA, ADM, força e teste sem misturar pacientes',()=>{
  const state=emptyState();
  state.assessments.push({id:'a1',patientId:'p1',date:'2026-01-01',clinical:{rom:[{joint:'Joelho',movement:'Flexão',side:'E',degrees:'90'}],strength:[{movement:'Extensão',side:'E',grade:'3'}]}},{id:'a2',patientId:'p1',date:'2026-02-01',clinical:{rom:[{joint:'Joelho',movement:'Flexão',side:'E',degrees:'112'}],strength:[{movement:'Extensão',side:'E',grade:'4'}]}});
  state.sessions.push({id:'s1',patientId:'p1',date:'2026-01-01',painBefore:'7'},{id:'s2',patientId:'p1',date:'2026-02-01',painBefore:'3'});
  state.functionalTestResults.push({id:'t1',patientId:'p1',date:'2026-01-01',testName:'TUG',result:'16.2',unit:'s'},{id:'t2',patientId:'p1',date:'2026-02-01',testName:'TUG',result:'12.8',unit:'s'});
  const rows=reassessmentRows(state,'p1');
  assert.deepEqual(rows.map(row=>row.change),[-4,22,1,-3.3999999999999986]);
});

test('suavização e qualidade rejeitam landmarks insuficientes ou instáveis',()=>{
  assert.equal(movingMedian([10,100,11,12,13],5),12);
  assert.ok(angleStability([90,91,89,90])<2);
  assert.equal(readingQuality([{visibility:.2},{visibility:.9},{visibility:.9}],[90,91,90]).capture,false);
  assert.equal(readingQuality([{visibility:.9},{visibility:.9},{visibility:.9}],[90,91,90]).level,'good');
});

test('relatório de alta não inventa campos ausentes',()=>{
  const text=buildDischargeReport({currentCondition:'deambula com dispositivo',guidance:'manter programa revisado'});
  assert.match(text,/Condição atual/);
  assert.doesNotMatch(text,/Condição inicial|Objetivos atingidos|sem intercorrências/);
});

test('migração v4 preserva dados e cria coleções v0.6',()=>{
  const legacy={version:4,patients:[],assessments:[],plans:[],sessions:[],exercises:[],favorites:[],repertoires:[],goniometryRecords:[],caseDiscussions:[]};
  const state=validateState(legacy);
  assert.equal(state.version,5);
  assert.deepEqual(state.functionalTestResults,[]);
  const patient=addRecord(state,'patients',{code:'QA-01'});
  addRecord(state,'goals',{patientId:patient.id,description:'Meta'});
  assert.equal(state.goals.length,1);
});
