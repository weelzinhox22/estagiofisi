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

test('consulta rápida oferece voz, intenções, categorias e histórico local',()=>{
  assert.match(app,/quick-consult-hero/);
  assert.match(app,/name="quickQuery"/);
  assert.match(app,/quick-intents/);
  assert.match(app,/quick-categories/);
  assert.match(app,/QUICK_HISTORY_KEY/);
  assert.match(app,/quickTokens/);
});

test('atendimento rápido usa cabeçalho nativo, seleção compacta e valida registro clínico',()=>{
  assert.match(app,/rapidCareHasContent/);
  assert.match(css,/rapid-native-head/);
  assert.match(css,/rapid-selection-summary/);
  assert.match(css,/rapid-form-guide/);
});

test('pacientes usam avatares chibi e cards mobile enriquecidos',()=>{
  assert.match(app,/patient-chibi chibi-/);
  assert.match(css,/patient-chibi-sprite\.png/);
  assert.match(css,/patient-row-copy/);
  assert.match(css,/patient-status-pill/);
});

test('cadastro de paciente usa fluxo mobile por contexto clínico',()=>{
  assert.match(app,/patient-form-modal/);
  assert.match(css,/patient-form-welcome/);
  assert.match(css,/patient-privacy-card/);
  assert.match(css,/patient-form-section/);
});

test('inicialização não exibe mensagem técnica de carregamento',()=>{
  assert.doesNotMatch(app,/Carregando conta/);
  assert.match(app,/app-start-skeleton/);
  assert.match(css,/skeleton-sweep/);
});

test('biblioteca usa hero, navegação visual e cards ilustrados',()=>{
  assert.match(app,/library-native-hero/);
  assert.match(app,/exercise-card-visual/);
  assert.match(app,/exerciseVisual/);
  assert.match(css,/visual-exercise-grid/);
  assert.match(css,/mix-blend-mode:normal/);
});

test('troca de página sempre restaura o topo e anima a entrada',()=>{
  assert.match(app,/history\.scrollRestoration='manual'/);
  assert.match(app,/scrollPageTop/);
  assert.match(app,/hashchange[^\n]*scrollPageTop/);
  assert.match(css,/route-enter/);
});

test('Mais funciona como central visual de recursos',()=>{
  assert.match(css,/more-native-hero/);
  assert.match(css,/more-group>header/);
});

test('refresh oculta barras até a conta estar pronta',()=>{
  assert.match(app,/classList\.add\('app-booting'\)/);
  assert.match(app,/classList\.remove\('app-booting'\)/);
  assert.match(css,/body\.app-booting \.bottom-nav/);
  assert.match(css,/boot-brand/);
  assert.match(index,/<body class="app-booting">/);
  assert.match(css,/visibility:hidden!important/);
});

test('bottom bar usa ícones vetoriais e ação central elevada',()=>{
  assert.match(app,/plusCircle/);
  assert.match(app,/nav-\$\{id\}/);
  assert.match(css,/bottom-nav \.nav-atendimento-rapido/);
});

test('Conta e Aprender possuem hierarquia mobile completa',()=>{
  assert.match(css,/account-native-hero/);
  assert.match(css,/account-status-grid/);
  assert.match(css,/learning-native-hero/);
  assert.match(css,/learning-tool-layout/);
  assert.match(app,/learning-example/);
});
