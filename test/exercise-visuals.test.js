import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { exerciseVisual } from '../src/exercise-visuals.js';

const root=resolve(import.meta.dirname,'..');

test('cada exercício recebe uma ilustração local, inclusive itens futuros',()=>{
  for(const exercise of [
    {name:'Ponte de quadril',category:'Quadril'},
    {name:'Agachamento',category:'Joelho'},
    {name:'Exercício criado pelo usuário',category:'Outro'}
  ]){
    const visual=exerciseVisual(exercise);
    assert.match(visual.url,/^\/icons\/exercises\/workout-guide\/.+\/frame-2\.png$/);
    assert.equal(existsSync(resolve(root,visual.url.slice(1))),true,visual.url);
  }
});
