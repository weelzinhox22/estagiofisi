import test from 'node:test';
import assert from 'node:assert/strict';
import { exercises } from '../src/clinical-data.js';
import { muscles, clinicalTests, goniometry, reflexes, scales, functionalProblems } from '../src/reference-data.js';
import { gaitSelects, gaitTestGuide, gaitChecklist, buildGaitSummary, gaitHasObservation } from '../src/gait-assessment.js';

test('metas de conteúdo clínico são atendidas', () => {
  assert.ok(exercises.length >= 160);
  assert.ok(muscles.length >= 20);
  assert.ok(clinicalTests.length >= 20);
  assert.ok(functionalProblems.length >= 20);
  assert.ok(exercises.filter(x => x.kind === 'neuro').length >= 10);
  assert.ok(goniometry.length >= 20 && reflexes.length >= 5 && scales.length >= 5);
});
test('todo exercício tem ficha, dose educacional e proveniência', () => {
  const required=['name','category','region','joint','startPosition','objective','functionalApplication','exampleDose','doseNotes','care','stopWhen','source'];
  for(const exercise of exercises){
    for(const field of required) assert.ok(exercise[field],`${exercise.id} sem ${field}`);
    assert.match(exercise.exampleDose,/^Exemplo educacional:/);
    assert.ok(exercise.steps.length>=3 && exercise.why.length>=3);
  }
});
test('testes não incluem acurácia diagnóstica inventada', () => {
  for(const item of clinicalTests){
    assert.ok(item.objective && item.position && item.execution && item.interpretation && item.positive && item.structure && item.notes);
    assert.doesNotMatch(JSON.stringify(item),/sensibilidade|especificidade|%/i);
  }
});

test('novas áreas práticas têm variedade e proveniência específica', () => {
  const expected={'Cardiorrespiratória':12,'Condicionamento':10,'Funcional e cotidiano':12,'Mobilidade no leito':10};
  for(const [category,minimum] of Object.entries(expected)) assert.ok(exercises.filter(x=>x.category===category).length>=minimum,category);
  assert.ok(exercises.filter(x=>x.category==='Cardiorrespiratória').every(x=>x.source.includes('Cardiopulmonary')));
  assert.equal(new Set(exercises.map(x=>x.name)).size,exercises.length);
});

test('roteiro de marcha gera resumo apenas com dados observados', () => {
  const values={pace:'lento',symmetry:'menor-esquerda',device:'bengala habitual',notes:''};
  const summary=buildGaitSummary(values,['10mwt'],[{id:'knee-valgus',side:'Direito'}]);
  assert.match(summary,/ritmo: Lento/);
  assert.match(summary,/Passo menor à esquerda/);
  assert.match(summary,/Teste de Caminhada de 10 Metros/);
  assert.match(summary,/Valgo de joelho \(Direito\)/);
  assert.doesNotMatch(summary,/\b(diagnóstico|positivo|normal)\b/i);
  assert.equal(gaitHasObservation(values),true);
  assert.ok(Object.keys(gaitSelects).length>=10 && gaitTestGuide.length>=6 && gaitChecklist.length>=16);
});
