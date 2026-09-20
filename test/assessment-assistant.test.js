import test from 'node:test';
import assert from 'node:assert/strict';
import { assessmentGaps, calculateMeasureResult, compareResults, containsProhibitedDiagnosticLanguage, detectPossibleFindings, measurementChange, suggestionEngine } from '../src/assessment-assistant.js';
import { assessmentMeasures } from '../src/assessment-measures-data.js';
import { addRecord, emptyState, validateState } from '../src/store.js';

test('parser tolera acentos, caixa e termos equivalentes sem confirmar fatos',()=>{
  const findings=detectPossibleFindings('DOR nos JOELHOS, desequilíbrio, mancando e dificuldade para pentear o cabelo.');
  assert.ok(findings.every(item=>item.status==='possible'));
  assert.ok(['dor','joelho','instabilidade','claudicacao','alcance-acima-cabeca-dificil'].every(id=>findings.some(item=>item.findingId===id)));
});

test('sugestões partem de achados e perguntas, sem linguagem diagnóstica proibida',()=>{
  const result=suggestionEngine({population:'adulto',findings:['velocidade-reduzida','sentar-levantar-dificil','instabilidade']});
  assert.ok(['10mwt','tug','5xsts','30cst'].some(id=>result.suggestions.some(item=>item.measureId===id)));
  assert.ok(result.questions.length>=3);
  assert.equal(containsProhibitedDiagnosticLanguage(JSON.stringify(result)),false);
});

test('perfis A, B e C produzem perguntas coerentes sem inferir doença',()=>{
  const profiles=[
    ['joelho','forca-reduzida','instabilidade','assimetria'],
    ['joelho','dor','baixa-tolerancia-caminhada'],
    ['ombro','cervical','lombar','tremor','instabilidade']
  ];
  const results=profiles.map(findings=>suggestionEngine({population:'adulto',findings}));
  assert.ok(results[0].suggestions.some(item=>item.measureId==='10mwt'));
  assert.ok(results[1].suggestions.some(item=>['2mwt','6mwt'].includes(item.measureId)));
  assert.ok(results[2].questions.some(item=>item.id==='coordination'));
  assert.ok(results.every(result=>!containsProhibitedDiagnosticLanguage(JSON.stringify(result))));
});

test('calculadoras validam e formatam 10MWT, cadência e Functional Reach',()=>{
  assert.deepEqual(calculateMeasureResult('10mwt',{timedDistance:'6',time:'7.5'}),{result:.8,unit:'m/s',derived:{speed:.8}});
  assert.equal(calculateMeasureResult('cadence',{steps:'120',time:'120'}).result,60);
  assert.deepEqual(calculateMeasureResult('functional-reach',{startPosition:'45',endPosition:'70',trial1:'',trial2:'',trial3:''}),{result:25,unit:'cm',derived:{best:25,average:25}});
  assert.throws(()=>calculateMeasureResult('10mwt',{timedDistance:'6',time:'0'}),/tempo.*maior que zero/);
});

test('circunferência bilateral e mudança percentual são cálculos descritivos',()=>{
  assert.deepEqual(calculateMeasureResult('circumference',{circumferenceA:'42',circumferenceB:'39.5'}),{result:42,unit:'cm',derived:{difference:2.5}});
  assert.deepEqual(measurementChange(12,10),{difference:2,percentage:20});
  assert.deepEqual(measurementChange(4,0),{difference:4,percentage:null});
});
test('comparação informa diferença e compatibilidade do protocolo',()=>{
  const initial={testId:'tug',result:18.3,device:'',assistance:'supervisao'};
  const current={testId:'tug',result:14.7,device:'',assistance:'supervisao'};
  assert.deepEqual(compareResults(initial,current),{difference:-3.6,comparable:true,note:'Condições registradas compatíveis.'});
});

test('catálogo central não contém ponto de corte universal e conserva instrumentos externos',()=>{
  assert.ok(assessmentMeasures.length>=18);
  assert.ok(assessmentMeasures.every(item=>item.id&&item.clinicalQuestion&&item.source?.url&&item.licenseStatus));
  assert.ok(assessmentMeasures.every(item=>!Object.hasOwn(item,'cutoff')));
  assert.ok(['external-spadi','external-quickdash','external-ndi','external-odi','external-koos','external-berg'].every(id=>assessmentMeasures.find(item=>item.id===id)?.licenseStatus==='license-review-required'));
});

test('lacunas usam somente achados confirmados e resultados do mesmo paciente',()=>{
  const state=emptyState();state.functionalTestResults.push({id:'x',patientId:'outro',testId:'10mwt'});
  const gaps=assessmentGaps(state,'p1',['dor','velocidade-reduzida']);
  assert.equal(gaps.length,2);
});

test('backup v4 migra para v5 e persiste casos do Assistente',()=>{
  const legacy={version:4,patients:[],assessments:[],plans:[],sessions:[],exercises:[],favorites:[],repertoires:[],goniometryRecords:[],caseDiscussions:[]};
  const state=validateState(legacy);assert.deepEqual(state.assessmentAssistantCases,[]);
  addRecord(state,'assessmentAssistantCases',{patientId:'p1',findings:['dor']});
  assert.equal(validateState(state).assessmentAssistantCases.length,1);
});
