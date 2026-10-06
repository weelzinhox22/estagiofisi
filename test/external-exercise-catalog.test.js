import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildExternalExerciseCatalog, externalCatalogErrors, externalCatalogStats, externalExerciseCatalog } from '../src/external-exercise-catalog-data.js';
import { filterExternalCatalog } from '../src/external-exercise-catalog-ui.js';

test('catálogo externo preserva direitos e proveniência por item',()=>{
  assert.deepEqual(externalCatalogStats,{reusable:0,linkOnly:41,exerciseLinks:39,directories:2});
  assert.equal(externalCatalogErrors.length,0);
  assert.equal(new Set(externalExerciseCatalog.map(item=>item.id)).size,externalExerciseCatalog.length);
  for(const item of externalExerciseCatalog){
    assert.ok(item.name&&item.source&&item.originalUrl&&item.termsUrl&&item.checkedAt);
    assert.equal(item.reuseStatus,'somente_link');
    assert.equal(item.mediaUrl,'');
    assert.deepEqual(item.instructions,[]);
    assert.match(item.dosage,/não informado pela fonte/i);
  }
});

test('importação repetida ignora ids duplicados e registra o erro',()=>{
  const item=externalExerciseCatalog[0],result=buildExternalExerciseCatalog([item,item]);
  assert.equal(result.items.length,1);
  assert.equal(result.errors.length,1);
  assert.match(result.errors[0].message,/duplicado/i);
});

test('busca e filtros combinam região, objetivo, posição, equipamento e fonte',()=>{
  assert.ok(filterExternalCatalog(externalExerciseCatalog,{region:'ombro'}).every(item=>item.region.includes('ombro')));
  assert.ok(filterExternalCatalog(externalExerciseCatalog,{objective:'equilíbrio'}).every(item=>item.objective.includes('equilíbrio')));
  assert.ok(filterExternalCatalog(externalExerciseCatalog,{position:'sentado',equipment:'cadeira'}).length>=1);
  assert.ok(filterExternalCatalog(externalExerciseCatalog,{source:'usp',query:'lombar'}).length>=1);
  assert.ok(filterExternalCatalog(externalExerciseCatalog,{context:'Osteoartrite do joelho'}).length>=1);
});

test('interface integra catálogo, estados e cache offline na versão 1.0',async()=>{
  const root=resolve(import.meta.dirname,'..');
  const [app,index,sw,pkg,css]=await Promise.all(['src/app.js','index.html','sw.js','package.json','src/external-exercise-catalog.css'].map(file=>readFile(resolve(root,file),'utf8')));
  assert.match(app,/externalExerciseCatalogPage/);
  assert.match(app,/\['fontes','Fontes externas'/);
  assert.match(app,/external-catalog-search/);
  assert.match(index,/external-exercise-catalog\.css/);
  assert.match(sw,/external-exercise-catalog-data\.js/);
  assert.match(css,/\.external-exercise-grid/);
  assert.equal(JSON.parse(pkg).version,'1.0.0');
});
