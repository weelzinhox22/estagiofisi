import test from 'node:test';
import assert from 'node:assert/strict';
import { discussionMeetings, commonComplaints, generalReferences } from '../src/general-physio-data.js';

test('Fisioterapia Geral contém encontros e queixas com fontes', () => {
  assert.equal(discussionMeetings.length,9);
  assert.ok(commonComplaints.length>=10);
  assert.ok(generalReferences.every(x=>x.label&&x.url.startsWith('https://')));
  for(const item of [...discussionMeetings,...commonComplaints]) assert.ok(item.references.length>0,`${item.id} sem referência`);
});
test('fichas de queixa separam perguntas, exame, alertas e possibilidades', () => {
  for(const item of commonComplaints){
    assert.ok(item.questions.length>=3);
    assert.ok(item.exam.length>=2);
    assert.ok(item.alerts.length>=2);
    assert.ok(item.possibilities.length>=2);
  }
});
