import test from 'node:test';
import assert from 'node:assert/strict';
import { reasoningGuides, reasoningSources } from '../src/clinical-reasoning-data.js';

test('biblioteca de condutas cobre raciocínio e reavaliação', () => {
  assert.ok(reasoningGuides.length>=20);
  assert.equal(new Set(reasoningGuides.map(x=>x.id)).size,reasoningGuides.length);
  const required=['title','domain','purpose','consider','assess','possibilities','monitor','progress','avoid','questions','references'];
  for(const guide of reasoningGuides){
    for(const key of required) assert.ok(guide[key]&&(!Array.isArray(guide[key])||guide[key].length),`${guide.id} sem ${key}`);
    assert.ok(guide.references.every(x=>x.label&&x.url.startsWith('https://')));
  }
});
test('fontes institucionais das condutas estão declaradas', () => {
  assert.ok(reasoningSources.length>=8);
  assert.ok(reasoningSources.every(x=>x.label&&x.url));
});
