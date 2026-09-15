import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEvolution, comparisonData, timelineRecords, suggestPhysioDiagnosis } from '../src/clinical-workflow.js';

test('evolução usa somente exercícios efetivamente executados',()=>{
  const exercises=new Map([['feito',{name:'Exercício realizado'}],['plano',{name:'Somente planejado'}],['parado',{name:'Interrompido'}]]);
  const text=buildEvolution(
    {generalState:'estável',objective:'melhorar mobilidade',painBefore:'5',painAfter:'3',incidents:''},
    [
      {exerciseId:'feito',status:'realizado',actualSets:'2',actualReps:'10'},
      {exerciseId:'plano',status:'planejado'},
      {exerciseId:'parado',status:'interrompido',stopReason:'dor aumentou'}
    ],
    id=>exercises.get(id)
  );
  assert.match(text,/Exercício realizado/);
  assert.doesNotMatch(text,/Somente planejado/);
  assert.match(text,/Interrompido/);
  assert.doesNotMatch(text,/sem intercorrências/i);
});

test('sugestão fisioterapêutica é aberta e exige revisão',()=>{
  const assessment={pain:{intensity:'7'},strength:[{grade:'3'}],rom:[],balance:{dynamic:'alterado'},functionality:{ambulation:'assimétrica'}};
  const text=suggestPhysioDiagnosis(assessment,true);
  assert.match(text,/a revisar/i);
  assert.match(text,/dados registrados/i);
});

test('comparação e linha do tempo não misturam pacientes',()=>{
  const state={
    assessments:[
      {id:'a1',patientId:'p1',date:'2026-01-01',clinical:{rom:[{joint:'Joelho',movement:'Flexão',side:'Direito',degrees:'90'}],strength:[]}},
      {id:'a2',patientId:'p2',date:'2026-01-02',clinical:{rom:[{joint:'Joelho',movement:'Flexão',side:'Direito',degrees:'120'}],strength:[]}}
    ],
    plans:[],
    sessions:[{id:'s1',patientId:'p1',date:'2026-01-03',painBefore:'7',painAfter:'4'},{id:'s2',patientId:'p2',date:'2026-01-03',painBefore:'2',painAfter:'1'}],
    goniometryRecords:[]
  };
  const comparison=comparisonData(state,'p1');
  assert.deepEqual(comparison.pain.map(item=>item.value),['7 → 4/10']);
  assert.equal(comparison.rom[0].values[0].value,'90°');
  assert.ok(timelineRecords(state,'p1').every(item=>item.patientId==='p1'));
});
