import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root=resolve(import.meta.dirname,'..');
const [app,css,index]=await Promise.all([
  readFile(resolve(root,'src/app.js'),'utf8'),
  readFile(resolve(root,'src/mobile-native-redesign.css'),'utf8'),
  readFile(resolve(root,'index.html'),'utf8')
]);

test('navegação mobile prioriza Biblioteca e mantém cinco destinos',()=>{
  assert.match(app,/mobileOrder=\['inicio','atendimento-rapido','pacientes','biblioteca','mais'\]/);
  assert.match(app,/moreSections=new Set\([^\n]*'downloads'/);
});

test('início usa ações reais sem criar registros fictícios',()=>{
  assert.match(app,/mobile-home-shell/);
  assert.match(app,/mobile-home-grid/);
  assert.match(app,/homeIcon\('users'\)/);
  assert.match(app,/homeIcon\('clipboard'\)/);
  assert.doesNotMatch(app,/<i>♟<\/i>|<i>▤<\/i>/);
  assert.match(app,/href="#biblioteca"/);
  assert.doesNotMatch(app,/ORT-01|Paciente exemplo|Dor no joelho direito há 3 semanas/);
});

test('camada mobile preserva desktop, safe-area, foco e movimento reduzido',()=>{
  assert.match(css,/@media\(max-width:900px\)/);
  assert.match(css,/env\(safe-area-inset-bottom\)/);
  assert.match(css,/:focus-visible/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(index,/mobile-native-redesign\.css/);
});

test('redesign diferencia todas as famílias de telas das pranchas',()=>{
  assert.match(app,/main\.dataset\.route=section/);
  for(const route of ['inicio','pacientes','sessao','biblioteca','exercicio','aprender','medidas','repertorio','downloads','conduta','ferramentas','conta','dados','casos','domiciliar','assistente','mentor']){
    assert.match(css,new RegExp(`data-route=["']${route}["']`),`estilo mobile ausente para ${route}`);
  }
  assert.match(css,/#clinical-assessment-form/);
  assert.match(css,/#gait-assessment-form/);
});
