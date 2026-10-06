import test from 'node:test';
import assert from 'node:assert/strict';
import { saveSessionPlan, loadSessionPlan, clearSessionPlan } from '../src/draft-persistence.js';

const memory=()=>{const values=new Map();return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};};

test('plano de sessão persiste por conta e paciente',()=>{
  const storage=memory(),draft={selected:['a','b'],conditionId:'joelho',query:''};
  saveSessionPlan('user-1','patient-1',draft,storage);
  assert.deepEqual(loadSessionPlan('user-1','patient-1',storage),draft);
  assert.equal(loadSessionPlan('user-2','patient-1',storage),null);
});

test('plano concluído pode ser removido',()=>{
  const storage=memory();saveSessionPlan('user','patient',{selected:['a']},storage);clearSessionPlan('user','patient',storage);
  assert.equal(loadSessionPlan('user','patient',storage),null);
});
