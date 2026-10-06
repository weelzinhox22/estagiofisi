import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root=resolve(import.meta.dirname,'..');
const [app,css,mobile,sw]=await Promise.all([
  readFile(resolve(root,'src/app.js'),'utf8'),readFile(resolve(root,'src/styles.css'),'utf8'),
  readFile(resolve(root,'src/mobile-native-redesign.css'),'utf8'),readFile(resolve(root,'sw.js'),'utf8')
]);

test('biblioteca exibe diretório agrupado sem depender de carrossel horizontal',()=>{
  assert.match(app,/libraryGroups=.*Exercícios e tratamento.*Anatomia e avaliação.*Raciocínio clínico/s);
  assert.match(app,/library-tabs library-directory/);
  assert.match(css,/\.library-tabs\s*\{[^}]*display:\s*grid/s);
  assert.match(mobile,/library-tabs\.library-directory[^}]*display:grid!important/);
});

test('cards da biblioteca abrem uma página interna com conteúdo no topo',()=>{
  assert.match(app,/libraryPage\(section==='exercicios'\?'exercicios':id\|\|'inicio'\)/);
  assert.match(app,/if\(active==='inicio'\)return `\$\{libraryHero\(\)\}\$\{tabs\(''\)\}`/);
  assert.match(app,/const header=librarySectionHeader\(active\)/);
  assert.match(app,/class="library-back">← Todas as áreas/);
  assert.match(app,/main\.focus\(\{preventScroll:true\}\)/);
  assert.match(css,/\.library-subpage-head\s*\{/);
});

test('rascunhos e plano da sessão integram renderização e cache offline',()=>{
  assert.match(app,/restoreDrafts\(main/);
  assert.match(app,/loadSessionPlan\(activeUserId\(\),id\)/);
  assert.match(app,/saveFormDraft\(event\.target\.form/);
  assert.match(app,/navigator\.storage\?\.persist/);
  assert.match(sw,/draft-persistence\.js/);
});
