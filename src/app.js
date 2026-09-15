import { loadState, saveState, addRecord, updateRecord, removeRecord, patientRecords, painSeries, catalog, today, toggleFavorite, addToRepertoire } from './store.js';
import { muscles, clinicalTests, goniometry, reflexes, scales, functionalProblems } from './reference-data.js';
import { cameraPage, mountCamera, cleanupCamera } from './camera.js';
import { generalLibraryPage, meetingPage, complaintPage, casesPage, generalSearch } from './general-physio-ui.js';
import { reasoningLibraryPage, reasoningDetailPage, reasoningSearch } from './clinical-reasoning-ui.js';
import { gaitSelects, gaitTestGuide, gaitChecklist, buildGaitSummary, gaitHasObservation } from './gait-assessment.js';
import { buildEvolution, clinicalAssessmentFromForm, assessmentHasContent, buildAssessmentSummary, patientInitials, patientLabel, SESSION_BLOCKS } from './clinical-workflow.js';
import { assessmentRow, clinicalAssessmentBody, patientFormBody, patientWorkflowPage, planFormBody, printPatientPage } from './patient-workflow-ui.js';
import { sessionBuilderPage, sessionPayloadFromForm } from './session-workflow-ui.js';

let state = loadState();
let filter = '';
let quickQuery = '';
let libraryQuery = '';
let libraryCategory = 'Todas';
const neuroFilters = { objective:'', position:'', assistance:'' };
const sessionDrafts = new Map();
let deferredInstall;
const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const formatDate = value => value ? new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR') : '—';
const short = (text, len=92) => String(text || '').length > len ? `${String(text).slice(0,len)}…` : String(text || '');
const saved = () => { try { saveState(state); toast('Salvo neste dispositivo.'); render(); } catch { toast('Não foi possível salvar. Verifique o espaço do navegador.', true); } };
const toast = (message, error=false) => { const el = $('#toast'); el.textContent = message; el.className = error ? 'show error' : 'show'; clearTimeout(toast.timer); toast.timer = setTimeout(() => el.className = '', 3500); };
const input = (label,name,type='text',value='',attrs='') => `<label class="field"><span>${label}</span><input name="${name}" type="${type}" value="${esc(value)}" ${attrs}></label>`;
const area = (label,name,value='',placeholder='') => `<label class="field"><span>${label}</span><textarea name="${name}" rows="3" placeholder="${esc(placeholder)}">${esc(value)}</textarea></label>`;
const select = (label,name,options,value='') => `<label class="field"><span>${label}</span><select name="${name}">${options.map(([v,t])=>`<option value="${esc(v)}" ${v===value?'selected':''}>${esc(t)}</option>`).join('')}</select></label>`;
const empty = (title,desc,action='') => `<div class="empty"><div class="empty-icon">✳</div><h3>${title}</h3><p>${desc}</p>${action}</div>`;
const button = (label,action,cls='primary',extra='') => `<button type="button" class="button ${cls}" data-action="${action}" ${extra}>${label}</button>`;
const badge = (text,kind='') => `<span class="badge ${kind}">${esc(text)}</span>`;
const pageHeader = (eyebrow,title,desc,action='') => `<div class="page-head"><div><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${desc}</p></div>${action}</div>`;
const advisory = `<div class="advisory"><span class="advisory-icon">ⓘ</span><div><strong>Uso educacional e apoio clínico supervisionado</strong><p>Registros e exercícios exigem avaliação e decisão individual do profissional responsável. Não substitui diagnóstico ou julgamento clínico.</p></div></div>`;

const navItems = [['inicio','Visão geral','◫'],['consulta','Consulta rápida','⌕'],['pacientes','Pacientes','♧'],['biblioteca','Biblioteca','◇'],['repertorio','Meu repertório','★']];
function route() { return decodeURIComponent((location.hash.slice(1) || 'inicio').split('?')[0]).split('/'); }
function routeQuery() { return new URLSearchParams((location.hash.split('?')[1]||'')); }
function renderNav(section) {
  const activeSection = ['camera','encontro','queixa','casos','conduta'].includes(section) ? 'biblioteca' : section;
  const html = navItems.map(([id,label,icon]) => `<a href="#${id}" class="nav-item ${activeSection===id?'active':''}" ${activeSection===id?'aria-current="page"':''}><span aria-hidden="true">${icon}</span><span>${label}</span></a>`).join('');
  $('#desktop-nav').innerHTML = html;
  $('#mobile-nav').innerHTML = html;
  $('#breadcrumb').textContent = navItems.find(([id]) => id === activeSection)?.[1] || 'Visão geral';
}
function render() {
  cleanupCamera();
  const [section,id,tab] = route();
  renderNav(section);
  const main = $('#main');
  if (section === 'camera') { main.innerHTML = cameraPage(state.patients,routeQuery().get('patient')); queueMicrotask(() => mountCamera({onCapture:detail => { addRecord(state,'goniometryRecords',detail); saveState(state); toast('Medida estimada registrada.'); }})); }
  else if (section === 'imprimir' && id) main.innerHTML = printPatientPage(state,id,tab,allExercises());
  else if (section === 'conduta' && id) main.innerHTML = reasoningDetailPage(id);
  else if (section === 'encontro' && id) main.innerHTML = meetingPage(id);
  else if (section === 'queixa' && id) main.innerHTML = complaintPage(id,allExercises());
  else if (section === 'casos') main.innerHTML = casesPage(state,today());
  else if (section === 'exercicio' && id) main.innerHTML = exerciseDetail(id);
  else if (section === 'musculo' && id) main.innerHTML = muscleDetail(id);
  else if (section === 'teste' && id) main.innerHTML = testDetail(id);
  else if (section === 'sessao' && id) {
    const patient=state.patients.find(item=>item.id===id);
    const draft=sessionDrafts.get(id)||{selected:[],query:''};
    sessionDrafts.set(id,draft);
    main.innerHTML=patient?sessionBuilderPage({patient,draft,exercises:allExercises(),today:today()}):empty('Paciente não encontrado','Selecione um paciente para montar a sessão.');
    updateSessionTotal();
  }
  else if (section === 'consulta') main.innerHTML = quickPage();
  else if (section === 'biblioteca' || section === 'exercicios') main.innerHTML = libraryPage(id || 'exercicios');
  else if (section === 'repertorio') main.innerHTML = repertoirePage();
  else if (section === 'pacientes' && id) main.innerHTML = patientWorkflowPage(state,id,tab,allExercises());
  else if (section === 'pacientes') main.innerHTML = patientsPage();
  else if (section === 'dados') main.innerHTML = dataPage();
  else main.innerHTML = homePage();
  document.title = `${$('#breadcrumb').textContent} · Fisio Clínico`;
}
function homePage() {
  const active = state.patients.filter(p => !p.archived);
  const sessions = [...state.sessions].sort((a,b) => b.date.localeCompare(a.date));
  const recent = active.slice().sort((a,b) => b.createdAt.localeCompare(a.createdAt)).slice(0,4);
  return `<section class="hero"><div class="hero-copy"><span class="hero-label">ESPAÇO DE TRABALHO</span><h1>Cuide do registro.<br><em>Concentre-se na pessoa.</em></h1><p>Organize observações, planejamento e evolução em um só lugar, durante a prática supervisionada.</p><div class="hero-actions">${button('＋ Novo paciente','new-patient','light')}${button('Consulta rápida →','go-quick','outline-light')}</div></div><div class="hero-art" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="hero-flower">✳</div><span class="art-dot dot-a"></span><span class="art-dot dot-b"></span></div></section>
  ${advisory}
  <section class="stats" aria-label="Resumo"><div class="stat"><span>Pacientes ativos</span><strong>${active.length}</strong><small>Registros neste dispositivo</small></div><div class="stat"><span>Sessões registradas</span><strong>${state.sessions.length}</strong><small>Histórico de atendimento</small></div><div class="stat"><span>Planos criados</span><strong>${state.plans.length}</strong><small>Objetivos de acompanhamento</small></div></section>
  <div class="section-grid"><section class="panel"><div class="section-title"><div><span class="eyebrow">ACESSO RÁPIDO</span><h2>Pacientes recentes</h2></div><a href="#pacientes">Ver todos →</a></div>${recent.length ? `<div class="record-list">${recent.map(p => `<a class="record" href="#pacientes/${encodeURIComponent(p.id)}"><span class="avatar">${esc(patientInitials(p))}</span><span class="record-info"><strong>${esc(patientLabel(p))}</strong><small>${esc(p.chiefComplaint||p.focus||'Sem queixa registrada')}</small></span><span class="record-arrow">↗</span></a>`).join('')}</div>` : empty('Seu espaço começa aqui','Cadastre um código ou apelido para organizar o primeiro acompanhamento.',button('＋ Cadastrar paciente','new-patient','secondary'))}</section>
  <section class="panel"><div class="section-title"><div><span class="eyebrow">ATIVIDADE</span><h2>Últimas sessões</h2></div></div>${sessions.length ? `<div class="activity-list">${sessions.slice(0,4).map(s => {const p=state.patients.find(x=>x.id===s.patientId);return `<a href="#pacientes/${encodeURIComponent(s.patientId)}" class="activity"><span class="activity-date">${formatDate(s.date)}</span><strong>${esc(p?.code || 'Paciente removido')}</strong><small>${esc(short(s.summary || 'Sessão registrada',55))}</small></a>`}).join('')}</div>` : empty('Nenhuma sessão ainda','As sessões registradas aparecem aqui para consulta rápida.')}</section></div>`;
}
function patientsPage() {
  const rows = state.patients.filter(p => (p.archived ? filter === 'arquivados' : filter !== 'arquivados') && (filter === 'arquivados' || `${p.code||''} ${p.name||''} ${p.focus||''} ${p.chiefComplaint||''}`.toLocaleLowerCase('pt-BR').includes(filter.toLocaleLowerCase('pt-BR')))).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  return `${pageHeader('ACOMPANHAMENTO','Pacientes','Use códigos ou apelidos. Evite nomes completos e outros dados identificáveis.',button('＋ Novo paciente','new-patient'))}
  <div class="toolbar"><label class="search"><span>⌕</span><input id="patient-search" type="search" placeholder="Buscar por código ou foco..." value="${esc(filter === 'arquivados'?'':filter)}" aria-label="Buscar pacientes"></label><button class="button ghost" data-action="toggle-archived">${filter==='arquivados'?'Ver ativos':'Ver arquivados'}</button></div>
  <div class="panel list-panel">${rows.length ? `<div class="patient-table"><div class="table-head"><span>Paciente</span><span>Queixa principal</span><span>Cadastro</span><span></span></div>${rows.map(p=>`<a class="patient-row" href="#pacientes/${encodeURIComponent(p.id)}"><span class="person"><span class="avatar">${esc(patientInitials(p))}</span><strong>${esc(patientLabel(p))}</strong></span><span>${esc(p.chiefComplaint||p.focus||'—')}</span><span>${formatDate((p.createdAt||p.startDate||today()).slice(0,10))}</span><span>→</span></a>`).join('')}</div>` : empty('Nenhum registro encontrado',filter==='arquivados'?'Não há pacientes arquivados.':'Cadastre o primeiro paciente ou ajuste a busca.',filter==='arquivados'?'':button('＋ Novo paciente','new-patient','secondary'))}</div>`;
}
function patientPage(id) {
  const p = state.patients.find(x => x.id === id);
  if (!p) return `${pageHeader('PACIENTES','Registro não encontrado','O código solicitado não está neste dispositivo.')}<a class="button secondary" href="#pacientes">Voltar</a>`;
  const rec = patientRecords(state,id);
  const assess = rec.assessments.slice().sort((a,b)=>b.date.localeCompare(a.date));
  const plans = rec.plans.slice().sort((a,b)=>b.date.localeCompare(a.date));
  const sessions = rec.sessions.slice().sort((a,b)=>b.date.localeCompare(a.date));
  const pain = painSeries(sessions);
  return `<div class="back"><a href="#pacientes">← Todos os pacientes</a></div><div class="patient-hero"><div class="patient-identity"><span class="avatar large">${esc(p.code.slice(0,2).toUpperCase())}</span><div><span class="eyebrow">PRONTUÁRIO LOCAL</span><h1>${esc(p.code)}</h1><p>${esc(p.focus || 'Foco ainda não registrado')}</p></div></div><div class="patient-actions">${badge(p.archived?'Arquivado':'Ativo',p.archived?'muted':'green')}${button('Editar','edit-patient','secondary',`data-id="${esc(id)}"`)}${button(p.archived?'Reativar':'Arquivar','archive-patient','ghost',`data-id="${esc(id)}"`)}</div></div>
  <div class="patient-meta"><span><strong>Início</strong> ${formatDate(p.startDate)}</span><span><strong>Supervisor(a)</strong> ${esc(p.supervisor||'Não informado')}</span><span><strong>Local</strong> ${esc(p.setting||'Não informado')}</span></div>
  ${p.notes?`<div class="note-panel"><strong>Contexto do acompanhamento</strong><p>${esc(p.notes)}</p></div>`:''}
  ${advisory}
  <div class="section-grid clinical-grid"><section class="panel"><div class="section-title"><div><span class="eyebrow">AVALIAÇÃO</span><h2>Observações</h2></div><div class="section-actions">${button('Avaliar marcha','new-gait-assessment','small secondary',`data-id="${esc(id)}"`)}${button('＋ Geral','new-assessment','small',`data-id="${esc(id)}"`)}</div></div>${assess.length?assess.map(a=>`<article class="entry ${a.type==='Marcha'?'gait-entry':''}"><div class="entry-top"><strong>${formatDate(a.date)}</strong>${badge(a.type||'Avaliação',a.type==='Marcha'?'green':'')}</div>${a.complaint?`<p><b>Queixa/objetivo:</b> ${esc(a.complaint)}</p>`:''}${a.findings?`<p><b>${a.type==='Marcha'?'Resumo observacional':'Achados registrados'}:</b> ${esc(a.findings)}</p>`:''}${a.function?`<p><b>Função relatada:</b> ${esc(a.function)}</p>`:''}${a.type==='Marcha'&&a.gait?.selectedTests?.length?`<div class="gait-tags">${a.gait.selectedTests.map(testId=>gaitTestGuide.find(x=>x.id===testId)?.name).filter(Boolean).map(name=>`<span>${esc(name)}</span>`).join('')}</div>`:''}${a.pain!==''&&a.pain!=null?`<small>Dor referida: ${esc(a.pain)}/10</small>`:''}</article>`).join(''):empty('Sem avaliação registrada','Registre observações após avaliação supervisionada.')}</section>
  <section class="panel"><div class="section-title"><div><span class="eyebrow">PLANEJAMENTO</span><h2>Planos e objetivos</h2></div>${button('＋ Adicionar','new-plan','small',`data-id="${esc(id)}"`)}</div>${plans.length?plans.map(x=>`<article class="entry"><div class="entry-top"><strong>${esc(x.title)}</strong>${badge(x.status||'Ativo','green')}</div><small>${formatDate(x.date)}</small><p>${esc(x.goal)}</p>${x.notes?`<p class="muted">${esc(x.notes)}</p>`:''}</article>`).join(''):empty('Sem plano registrado','Defina objetivos individualizados com a supervisão responsável.')}</section></div>
  <section class="panel full-panel"><div class="section-title"><div><span class="eyebrow">EVOLUÇÃO</span><h2>Sessões</h2></div>${button('＋ Montar sessão','build-session','small',`data-id="${esc(id)}"`)}</div>${pain.length>1?`<div class="chart-wrap"><h3>Dor referida antes das sessões <small>(escala 0–10, autorrelato)</small></h3>${painChart(pain)}</div>`:''}${sessions.length?`<div class="sessions">${sessions.map(s=>`<article class="session"><div class="session-date"><span>${formatDate(s.date)}</span>${s.painBefore!==''&&s.painBefore!=null?`<small>Dor ${esc(s.painBefore)}${s.painAfter!==''&&s.painAfter!=null?` → ${esc(s.painAfter)}`:''}/10</small>`:''}</div><div><strong>${esc(s.summary||'Sessão registrada')}</strong>${s.interventions?`<p><b>${s.evolutionShort?'Evolução curta: ':''}</b>${esc(s.interventions)}</p>`:''}${s.response?`<small>Resposta: ${esc(s.response)}</small>`:''}${s.exerciseId?`<small>Exercício: ${esc([...catalog,...state.exercises].find(e=>e.id===s.exerciseId)?.name||'Não encontrado')}</small>`:''}${s.evolutionDetailed?`<details class="evolution-draft"><summary>Ver evolução detalhada</summary><p>${esc(s.evolutionDetailed)}</p></details>`:''}</div></article>`).join('')}</div>`:empty('Nenhuma sessão registrada','A evolução das sessões aparecerá aqui.')}</section>`;
}
function painChart(rows) {
  const width=600,height=150,pad=22;
  const points=rows.map((r,i)=>`${pad+i*(width-pad*2)/Math.max(rows.length-1,1)},${height-pad-r.before*(height-pad*2)/10}`).join(' ');
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Evolução da dor antes das sessões: ${rows.map(r=>`${formatDate(r.date)} ${r.before}`).join(', ')}"><line x1="${pad}" y1="${height-pad}" x2="${width-pad}" y2="${height-pad}" stroke="#d6e0da"/><polyline points="${points}" fill="none" stroke="#187866" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${rows.map((r,i)=>`<circle cx="${pad+i*(width-pad*2)/Math.max(rows.length-1,1)}" cy="${height-pad-r.before*(height-pad*2)/10}" r="5" fill="#187866"/>`).join('')}</svg><div class="chart-labels"><span>${formatDate(rows[0].date)}</span><span>${formatDate(rows.at(-1).date)}</span></div>`;
}

const normalized = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const allExercises = () => [...catalog, ...state.exercises.map(e=>({id:e.id,name:e.name,category:e.category||'Pessoal',region:e.region||e.category||'Pessoal',objective:e.objective||e.notes||'Exercício registrado pelo usuário.',why:[e.objective||e.notes||'Item do repertório pessoal.'],tags:e.tags?String(e.tags).split(','):['pessoal'],source:e.source,primaryMuscles:Array.isArray(e.primaryMuscles)?e.primaryMuscles:e.primaryMuscles?String(e.primaryMuscles).split(','):[],auxiliaryMuscles:[],steps:Array.isArray(e.steps)?e.steps:e.steps?[e.steps]:['Consulte as anotações próprias e a orientação do supervisor.'],equipment:Array.isArray(e.equipment)?e.equipment:[],progressions:Array.isArray(e.progressions)?e.progressions:[],regressions:Array.isArray(e.regressions)?e.regressions:[],indications:Array.isArray(e.indications)?e.indications:[],commonCompensations:[],commonErrors:[],exampleDose:e.exampleDose||'Definir conforme avaliação e orientação supervisionada.',doseNotes:[e.rest&&`Descanso: ${e.rest}`,'Registro pessoal; revisar antes do uso.'].filter(Boolean).join(' '),care:e.care||'Confirmar adequação, ambiente e resposta individual.',stopWhen:'Interromper diante de resposta preocupante e reavaliar.',functionalApplication:e.functionalApplication||'',clinicalNotes:e.notes||'',difficulty:e.difficulty||'A definir',side:e.side||'A definir',joint:e.joint||'A definir',videoUrl:e.videoUrl||'',capacities:[],custom:true,kind:'exercise'}))];
const favoriteKey = (kind,id) => `${kind}:${id}`;
const isFavorite = (kind,id) => state.favorites.includes(favoriteKey(kind,id));
const favoriteButton = (kind,id,label='Favoritar') => button(isFavorite(kind,id)?'★ Favorito':`☆ ${label}`,'toggle-favorite',isFavorite(kind,id)?'secondary':'ghost',`data-kind="${kind}" data-id="${esc(id)}"`);
const matchExercise = (exercise,query) => normalized([exercise.name,exercise.synonyms?.join(' '),exercise.category,exercise.region,exercise.joint,exercise.primaryMuscles?.join(' '),exercise.auxiliaryMuscles?.join(' '),exercise.tags?.join(' '),exercise.problems?.join(' '),exercise.objective].join(' ')).includes(normalized(query));
const lookupItem = key => {
  const [kind,id]=String(key).split(':');
  const source=kind==='exercise'?allExercises():kind==='muscle'?muscles:kind==='test'?clinicalTests:kind==='scale'?scales:[];
  const item=source.find(x=>x.id===id);
  return item?{kind,item}:null;
};
const tabs = active => `<div class="library-tabs">${[['exercicios','Exercícios'],['musculos','Músculos'],['testes','Testes'],['goniometria','Goniometria'],['reflexos','Reflexos'],['escalas','Escalas'],['neuro','Neuro'],['problemas','Problemas funcionais'],['geral','Fisio Geral'],['condutas','Condutas']].map(([id,label])=>`<a class="${active===id?'active':''}" href="#biblioteca/${id}">${label}</a>`).join('')}</div>`;
const exerciseCard = e => `<article class="exercise-card rich-card"><div class="card-actions"><span class="source-label">${esc(e.category)}</span><button class="star-button ${isFavorite('exercise',e.id)?'active':''}" data-action="toggle-favorite" data-kind="exercise" data-id="${esc(e.id)}" aria-label="Favoritar">${isFavorite('exercise',e.id)?'★':'☆'}</button></div><h3><a href="#exercicio/${encodeURIComponent(e.id)}">${esc(e.name)}</a></h3><p class="card-objective">${esc(e.objective)}</p><div class="tag-row">${(e.tags||[]).slice(0,3).map(t=>`<span>${esc(t)}</span>`).join('')}</div><a class="text-link" href="#exercicio/${encodeURIComponent(e.id)}">Abrir ficha completa →</a></article>`;

function quickResults(query) {
  if (!query.trim()) return '';
  const ex=allExercises().filter(x=>matchExercise(x,query)).slice(0,8);
  const mu=muscles.filter(x=>normalized([x.name,x.action,x.function].join(' ')).includes(normalized(query))).slice(0,5);
  const te=clinicalTests.filter(x=>normalized([x.name,x.region,x.objective,x.structure].join(' ')).includes(normalized(query))).slice(0,5);
  const sc=scales.filter(x=>normalized([x.name,x.purpose].join(' ')).includes(normalized(query))).slice(0,4);
  const ne=allExercises().filter(x=>x.kind==='neuro'&&matchExercise(x,query)).slice(0,5);
  const general=generalSearch(query);
  const conduct=reasoningSearch(query);
  const groups=[['Exercícios',ex,x=>`#exercicio/${x.id}`],['Músculos',mu,x=>`#musculo/${x.id}`],['Testes',te,x=>`#teste/${x.id}`],['Escalas',sc,x=>`#biblioteca/escalas`],['Neuro',ne,x=>`#exercicio/${x.id}`],['Queixas comuns',general.complaints,x=>`#queixa/${x.id}`],['Encontros',general.meetings,x=>`#encontro/${x.id}`],['Condutas',conduct,x=>`#conduta/${x.id}`]];
  const total=groups.reduce((n,g)=>n+g[1].length,0);
  return total?`<div class="result-groups">${groups.filter(g=>g[1].length).map(([title,items,href])=>`<section class="result-group"><h2>${title} <span>${items.length}</span></h2>${items.map(item=>`<a href="${href(item)}"><strong>${esc(item.name||item.title)}</strong><small>${esc(item.objective||item.function||item.purpose||item.summary||item.region||'Ficha de consulta')}</small><b>→</b></a>`).join('')}</section>`).join('')}</div>`:empty('Nenhum resultado','Tente outro termo, região, função ou sinônimo.');
}
function quickPage() {
  return `${pageHeader('MODO RÁPIDO','Consulta rápida','Pesquise sem selecionar um paciente. Os resultados aparecem agrupados por tipo.')}<div class="quick-search"><span>⌕</span><input id="quick-search" type="search" value="${esc(quickQuery)}" placeholder="Ex.: quadríceps, equilíbrio, AVE, joelho, sentar levantar" autofocus></div>${quickQuery?quickResults(quickQuery):`<div class="quick-prompts"><span>Experimente:</span>${['lombalgia','condicionamento','respiração','transferências','quedas','quadríceps','equilíbrio','AVE','marcha','sentar levantar'].map(q=>`<button data-action="quick-term" data-term="${q}">${q}</button>`).join('')}</div>${empty('O que você quer consultar?','Busque um problema, músculo, articulação, teste ou atividade. A consulta não gera prescrição.')}`}`;
}
function libraryPage(active='exercicios') {
  const header=`${pageHeader('CONHECIMENTO CLÍNICO','Biblioteca prática',`${catalog.length} exercícios e atividades, referências anatômicas e apoio ao exame supervisionado.`,button('Consulta rápida','go-quick','secondary'))}${tabs(active)}`;
  if(active==='geral') return header+generalLibraryPage(state);
  if(active==='condutas') return header+reasoningLibraryPage();
  if(active==='musculos') return header+muscleLibrary();
  if(active==='testes') return header+testLibrary();
  if(active==='goniometria') return header+goniometryLibrary();
  if(active==='reflexos') return header+reflexLibrary();
  if(active==='escalas') return header+scaleLibrary();
  if(active==='problemas') return header+problemLibrary();
  if(active==='neuro') return header+neuroLibrary();
  const categories=['Todas',...new Set(allExercises().map(x=>x.category))];
  const rows=allExercises().filter(x=>(libraryCategory==='Todas'||x.category===libraryCategory)&&(!libraryQuery||matchExercise(x,libraryQuery)));
  return header+`${advisory}<div class="library-toolbar"><label class="search"><span>⌕</span><input id="library-search" type="search" value="${esc(libraryQuery)}" placeholder="Buscar em ${allExercises().length} exercícios..."></label><select id="library-category" aria-label="Filtrar categoria">${categories.map(c=>`<option ${c===libraryCategory?'selected':''}>${esc(c)}</option>`).join('')}</select>${button('＋ Exercício pessoal','new-exercise','ghost')}</div><p class="result-count">${rows.length} possibilidades encontradas</p><div class="exercise-grid">${rows.map(exerciseCard).join('')}</div>`;
}
function muscleLibrary(){
  return `<div class="info-banner">Selecione um grupo para ver função, componentes, ação e exercícios relacionados.</div><div class="reference-grid">${muscles.map(m=>`<article class="reference-card"><div class="card-actions"><span class="source-label">ANATOMIA</span><button class="star-button ${isFavorite('muscle',m.id)?'active':''}" data-action="toggle-favorite" data-kind="muscle" data-id="${m.id}">${isFavorite('muscle',m.id)?'★':'☆'}</button></div><h3><a href="#musculo/${m.id}">${esc(m.name)}</a></h3><p>${esc(m.function)}</p><a class="text-link" href="#musculo/${m.id}">Ver exercícios relacionados →</a></article>`).join('')}</div>`;
}
function testLibrary(){
  const groups=[...new Set(clinicalTests.map(x=>x.region))];
  return `${advisory}${groups.map(g=>`<section class="library-group"><div class="section-title"><h2>${esc(g)}</h2><span class="group-count">${clinicalTests.filter(x=>x.region===g).length} testes</span></div><div class="reference-grid">${clinicalTests.filter(x=>x.region===g).map(t=>`<article class="reference-card"><div class="card-actions"><span class="source-label">TESTE</span><button class="star-button ${isFavorite('test',t.id)?'active':''}" data-action="toggle-favorite" data-kind="test" data-id="${t.id}">${isFavorite('test',t.id)?'★':'☆'}</button></div><h3><a href="#teste/${t.id}">${esc(t.name)}</a></h3><p>${esc(t.objective)}</p><a class="text-link" href="#teste/${t.id}">Abrir consulta →</a></article>`).join('')}</div></section>`).join('')}`;
}
function goniometryLibrary(){
  const records=[...state.goniometryRecords].sort((a,b)=>`${b.date||''}${b.createdAt||''}`.localeCompare(`${a.date||''}${a.createdAt||''}`));
  const cameraRecords=records.filter(r=>String(r.goniometryId).startsWith('camera-'));
  const bilateral=[];
  const longitudinal=[];
  const bySegment=new Map();
  for(const row of cameraRecords){
    if(!row.patientCode)continue;
    const key=`${row.patientCode}|${row.goniometryId}`;
    if(!bySegment.has(key))bySegment.set(key,[]);
    bySegment.get(key).push(row);
  }
  for(const [key,rows] of bySegment){
    const [patientCode]=key.split('|'),left=rows.find(x=>x.side==='Esquerdo'),right=rows.find(x=>x.side==='Direito');
    if(left&&right)bilateral.push({patientCode,joint:left.joint,left,right,difference:Math.abs(Number(left.value)-Number(right.value))});
    const bySide=new Map();
    for(const row of rows){if(!bySide.has(row.side))bySide.set(row.side,[]);bySide.get(row.side).push(row);}
    for(const [side,sideRows] of bySide){if(sideRows.length>=2)longitudinal.push({patientCode,joint:sideRows[0].joint,side,current:sideRows[0],previous:sideRows[1],change:Number(sideRows[0].value)-Number(sideRows[1].value)});}
  }
  const comparisons=(bilateral.length||longitudinal.length)?`<section class="panel camera-history"><div class="section-title"><div><span class="eyebrow">COMPARAÇÃO DESCRITIVA</span><h2>Lados e capturas</h2></div></div><p class="microcopy">Diferenças são apenas descritivas. Condições de câmera, posição e tarefa precisam ser equivalentes; o aplicativo não define simetria normal nem melhora clínica.</p><div class="mobile-cards">${bilateral.slice(0,4).map(x=>`<article class="measurement-card"><span class="source-label">BILATERAL · ${esc(x.patientCode)}</span><h3>${esc(x.joint)}</h3><dl><dt>Esquerdo</dt><dd>${esc(x.left.value)}° · ${formatDate(x.left.date)}</dd><dt>Direito</dt><dd>${esc(x.right.value)}° · ${formatDate(x.right.date)}</dd><dt>Diferença</dt><dd>${Number.isFinite(x.difference)?x.difference.toFixed(1):'—'}°</dd></dl></article>`).join('')}${longitudinal.slice(0,4).map(x=>`<article class="measurement-card"><span class="source-label">SEQUENCIAL · ${esc(x.patientCode)}</span><h3>${esc(x.joint)} · ${esc(x.side)}</h3><dl><dt>Atual</dt><dd>${esc(x.current.value)}° · ${formatDate(x.current.date)}</dd><dt>Anterior</dt><dd>${esc(x.previous.value)}° · ${formatDate(x.previous.date)}</dd><dt>Variação</dt><dd>${Number.isFinite(x.change)?`${x.change>0?'+':''}${x.change.toFixed(1)}°`:'—'}</dd></dl></article>`).join('')}</div></section>`:'';
  return `<div class="camera-entry"><div><strong>Usar câmera para estimativa angular</strong><p>10 modos, guia de enquadramento, gráfico, congelamento, marcação manual e comparações.</p></div><a class="button primary" href="#camera">Abrir câmera →</a></div><div class="info-banner">Sem valores normativos. Registre vista, posição e método de modo consistente. Medidas salvas: ${records.length}.</div>${comparisons}${cameraRecords.length?`<section class="panel camera-history"><div class="section-title"><div><span class="eyebrow">CAPTURAS DA CÂMERA</span><h2>Estimativas recentes</h2></div></div><div class="sessions">${cameraRecords.slice(0,8).map(r=>`<article class="session"><div class="session-date"><span>${formatDate(r.date)}</span><small>${esc([r.patientCode,r.side].filter(Boolean).join(' · '))}</small></div><div><strong>${esc(r.joint)} · ${esc(r.value)}°</strong><p>${esc(r.notes)}</p></div></article>`).join('')}</div></section>`:''}<div class="mobile-cards">${goniometry.map(g=>`<article class="measurement-card"><div><span class="source-label">${esc(g.joint)}</span><h3>${esc(g.movement)}</h3></div><dl><dt>Posição</dt><dd>${esc(g.position)}</dd><dt>Eixo</dt><dd>${esc(g.axis)}</dd><dt>Braço fixo</dt><dd>${esc(g.fixedArm)}</dd><dt>Braço móvel</dt><dd>${esc(g.movingArm)}</dd></dl>${button('Registrar valor','record-gonio','secondary',`data-id="${g.id}"`)}${records.filter(r=>r.goniometryId===g.id).slice(0,2).map(r=>`<div class="saved-measure"><strong>${esc(r.value)}° · ${formatDate(r.date)}</strong><small>${esc([r.patientCode,r.side,r.notes].filter(Boolean).join(' · ')||'Registro local')}</small></div>`).join('')}</article>`).join('')}</div>`;
}
function reflexLibrary(){
  return `<div class="info-banner">Consulta de registro. A resposta reflexa é apenas uma parte do exame neurológico.</div><div class="reference-grid">${reflexes.map(r=>`<article class="reference-card"><span class="source-label">REFLEXO</span><h3>${esc(r.name)}</h3><p><b>Raiz:</b> ${esc(r.root)}</p><p><b>Estrutura:</b> ${esc(r.structure)}</p><p><b>Resposta:</b> ${esc(r.expected)}</p><details><summary>Escala de registro</summary><p>${esc(r.scale)}</p><p>${esc(r.note)}</p></details></article>`).join('')}</div>`;
}
function scaleLibrary(){
  return `<div class="info-banner">Somente instrumentos e categorias simples incluídos; nenhum questionário protegido é reproduzido.</div><div class="reference-grid">${scales.map(x=>`<article class="reference-card"><div class="card-actions"><span class="source-label">ESCALA</span><button class="star-button ${isFavorite('scale',x.id)?'active':''}" data-action="toggle-favorite" data-kind="scale" data-id="${x.id}">${isFavorite('scale',x.id)?'★':'☆'}</button></div><h3>${esc(x.name)}</h3><p>${esc(x.purpose)}</p><details><summary>Como registrar</summary><p>${esc(x.record)}</p><small>${esc(x.license)}</small></details></article>`).join('')}</div>`;
}
function problemLibrary(){
  return `<div class="problem-notice"><strong>Possibilidades para consulta</strong><p>A escolha depende da avaliação fisioterapêutica, objetivos, tolerância e condição clínica.</p></div><div class="problem-list">${functionalProblems.map(p=>{const matches=p.exerciseNames.map(name=>allExercises().find(e=>normalized(e.name).includes(normalized(name)))).filter(Boolean);return `<details class="problem-card"><summary><span>${esc(p.name)}</span><small>${matches.length} possibilidades</small></summary><div class="problem-links">${matches.map(e=>`<a href="#exercicio/${e.id}">${esc(e.name)} <b>→</b></a>`).join('')}</div><p>${esc(p.notice)}</p></details>`}).join('')}</div>`;
}
function neuroLibrary(){
  const all=allExercises().filter(x=>x.kind==='neuro');
  const neuro=all.filter(e=>{
    const text=normalized([e.name,e.objective,e.tags?.join(' '),e.startPosition].join(' '));
    const objectiveOk=!neuroFilters.objective||text.includes(normalized(neuroFilters.objective));
    const positionOk=!neuroFilters.position||text.includes(normalized(neuroFilters.position))||(neuroFilters.position==='marcha'&&text.includes('em pe'));
    const levels=e.difficulty==='Avançada'?['supervisão','assistência parcial','assistência maior']:['independente','supervisão','assistência parcial','assistência maior'];
    return objectiveOk&&positionOk&&(!neuroFilters.assistance||levels.includes(neuroFilters.assistance));
  });
  return `<div class="problem-notice"><strong>Filtre pela tarefa, não apenas pelo diagnóstico</strong><p>O diagnóstico aparece como termo de consulta. A seleção depende da função, estágio, segurança, cognição, fadiga, dispositivos e assistência.</p></div><div class="neuro-filters">${select('Objetivo','neuroObjective',[['','Todos'],...['controle de tronco','alcance','equilíbrio','transferência','ortostatismo','marcha','MMSS','MMII','coordenação','dupla tarefa'].map(x=>[x,x])],neuroFilters.objective)}${select('Posição','neuroPosition',[['','Todas'],...['decúbito','sedestação','ortostatismo','marcha'].map(x=>[x,x])],neuroFilters.position)}${select('Assistência','neuroAssistance',[['','Todas'],...['independente','supervisão','assistência parcial','assistência maior'].map(x=>[x,x])],neuroFilters.assistance)}</div><p class="form-hint">O nível de assistência é um filtro de planejamento e deve ser confirmado na avaliação. Atividades encontradas: ${neuro.length} de ${all.length}.</p><div class="exercise-grid">${neuro.map(exerciseCard).join('')}</div>`;
}
function exerciseDetail(id){
  const e=allExercises().find(x=>x.id===id);
  if(!e)return empty('Exercício não encontrado','Volte à biblioteca e tente novamente.',`<a class="button secondary" href="#biblioteca/exercicios">Biblioteca</a>`);
  return `<div class="back"><a href="#biblioteca/exercicios">← Biblioteca</a></div><article class="detail-page"><div class="detail-hero"><div><span class="eyebrow">${esc(e.category)} · ${esc(e.difficulty)}</span><h1>${esc(e.name)}</h1><div class="tag-row">${(e.tags||[]).map(t=>`<span>${esc(t)}</span>`).join('')}</div></div><div class="detail-actions">${favoriteButton('exercise',e.id)}${button('＋ Repertório','add-repertoire','secondary',`data-kind="exercise" data-id="${e.id}"`)}${button('＋ Adicionar à sessão','add-session','primary',`data-id="${e.id}"`)}</div></div>${e.synonyms?.length?`<p class="synonyms"><b>Sinônimos:</b> ${esc(e.synonyms.join(', '))}</p>`:''}<section class="detail-highlight"><span>OBJETIVO</span><p>${esc(e.objective)}</p></section><section class="detail-section why"><h2>Por que utilizar este exercício?</h2><ul>${e.why.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section><section class="detail-section"><h2>Como realizar</h2><p><b>Posição inicial:</b> ${esc(e.startPosition)}</p><ol>${e.steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></section><div class="detail-columns"><section class="detail-section"><h2>Músculos</h2><h3>Principais</h3><p>${esc(e.primaryMuscles.join(', ')||'Variam conforme a tarefa.')}</p><h3>Participação</h3><p>${esc(e.auxiliaryMuscles.join(', ')||'Variam conforme execução.')}</p></section><section class="detail-section"><h2>Aplicação funcional</h2><p>${esc(e.functionalApplication)}</p><p><b>Capacidades:</b> ${esc(e.capacities.join(', '))}</p><p><b>Equipamentos:</b> ${esc(e.equipment.join(', ')||'Nenhum')}</p><p><b>Lado:</b> ${esc(e.side)}</p></section></div><section class="detail-section dose-box"><h2>Dose de exemplo</h2><p>${esc(e.exampleDose)}</p><small>${esc(e.doseNotes)}</small></section><div class="detail-columns"><section class="detail-section"><h2>Progressões</h2><ul>${e.progressions.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section><section class="detail-section"><h2>Regressões</h2><ul>${e.regressions.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section></div><div class="detail-columns"><section class="detail-section"><h2>Compensações e erros comuns</h2><ul>${[...e.commonCompensations,...e.commonErrors].map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section><section class="detail-section care-box"><h2>Cuidados</h2><p>${esc(e.care)}</p><h3>Quando interromper</h3><p>${esc(e.stopWhen)}</p></section></div>${e.indications?.length?`<section class="detail-section"><h2>Indicações registradas</h2><ul>${e.indications.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>`:''}<section class="detail-section"><h2>Observações clínicas</h2><p>${esc(e.clinicalNotes)}</p>${/^https?:\/\//i.test(e.videoUrl||'')?`<p><a class="button secondary small" href="${esc(e.videoUrl)}" target="_blank" rel="noreferrer">Ver demonstração visual</a></p>`:''}</section><footer class="source-box"><strong>Fonte / proveniência</strong><p>${esc(e.source)}</p></footer></article>`;
}
function muscleDetail(id){
  const m=muscles.find(x=>x.id===id);if(!m)return empty('Músculo não encontrado','Consulte a biblioteca.');
  const related=allExercises().filter(e=>m.queries.some(q=>matchExercise(e,q)));
  return `<div class="back"><a href="#biblioteca/musculos">← Músculos</a></div><div class="detail-hero"><div><span class="eyebrow">ANATOMIA FUNCIONAL</span><h1>${esc(m.name)}</h1></div><div class="detail-actions">${favoriteButton('muscle',m.id)}${button('＋ Repertório','add-repertoire','secondary',`data-kind="muscle" data-id="${m.id}"`)}</div></div><div class="detail-columns"><section class="detail-section"><h2>Componentes</h2><p>${esc(m.components)}</p><h2>Ação</h2><p>${esc(m.action)}</p></section><section class="detail-section why"><h2>Função prática</h2><p>${esc(m.function)}</p></section></div><section class="library-group"><div class="section-title"><h2>Exercícios relacionados</h2><span class="group-count">${related.length} possibilidades</span></div><div class="exercise-grid">${related.map(exerciseCard).join('')}</div></section><footer class="source-box"><strong>Fonte / proveniência</strong><p>${esc(m.source)}</p></footer>`;
}
function testDetail(id){
  const t=clinicalTests.find(x=>x.id===id);if(!t)return empty('Teste não encontrado','Consulte a biblioteca.');
  return `<div class="back"><a href="#biblioteca/testes">← Testes clínicos</a></div><div class="detail-hero"><div><span class="eyebrow">${esc(t.region)} · TESTE CLÍNICO</span><h1>${esc(t.name)}</h1></div><div class="detail-actions">${favoriteButton('test',t.id)}${button('＋ Repertório','add-repertoire','secondary',`data-kind="test" data-id="${t.id}"`)}</div></div>${advisory}<div class="detail-columns"><section class="detail-section"><h2>Objetivo</h2><p>${esc(t.objective)}</p><h2>Estrutura relacionada</h2><p>${esc(t.structure)}</p></section><section class="detail-section"><h2>Posição</h2><p>${esc(t.position)}</p><h2>Execução</h2><p>${esc(t.execution)}</p></section></div><section class="detail-section"><h2>Interpretação geral</h2><p>${esc(t.interpretation)}</p><h3>Resultado considerado positivo na consulta</h3><p>${esc(t.positive)}</p></section><section class="detail-section care-box"><h2>Observações</h2><p>${esc(t.notes)}</p></section><footer class="source-box"><strong>Fonte / proveniência</strong><p>${esc(t.source)}</p></footer>`;
}
function repertoirePage(){
  const favoriteItems=state.favorites.map(lookupItem).filter(Boolean);
  return `${pageHeader('USO PESSOAL','Meu repertório','Favoritos e grupos próprios para acesso rápido durante o estágio.',button('＋ Novo grupo','new-repertoire'))}<section class="panel"><div class="section-title"><div><span class="eyebrow">ACESSO RÁPIDO</span><h2>Favoritos</h2></div><span class="group-count">${favoriteItems.length} itens</span></div>${favoriteItems.length?`<div class="repertoire-items">${favoriteItems.map(({kind,item})=>`<a href="${kind==='exercise'?`#exercicio/${item.id}`:kind==='muscle'?`#musculo/${item.id}`:kind==='test'?`#teste/${item.id}`:'#biblioteca/escalas'}"><span>${kind==='exercise'?'Exercício':kind==='muscle'?'Músculo':kind==='test'?'Teste':'Escala'}</span><strong>${esc(item.name)}</strong><b>→</b></a>`).join('')}</div>`:empty('Nenhum favorito','Use a estrela em exercícios, músculos, testes e escalas.')}</section><section class="library-group"><div class="section-title"><div><span class="eyebrow">COLEÇÕES</span><h2>Grupos pessoais</h2></div></div>${state.repertoires.length?`<div class="reference-grid">${state.repertoires.map(r=>`<article class="reference-card"><div class="card-actions"><span class="source-label">GRUPO</span><button class="star-button" data-action="edit-repertoire" data-id="${r.id}">✎</button></div><h3>${esc(r.name)}</h3><p>${esc(r.notes||'Grupo pessoal')}</p><div class="repertoire-items compact">${(r.items||[]).map(lookupItem).filter(Boolean).map(({kind,item})=>`<a href="${kind==='exercise'?`#exercicio/${item.id}`:kind==='muscle'?`#musculo/${item.id}`:`#teste/${item.id}`}"><strong>${esc(item.name)}</strong><b>→</b></a>`).join('')}</div></article>`).join('')}</div>`:empty('Crie seu primeiro grupo','Organize itens como “Joelho pós-operatório”, “AVE” ou “Exercícios que o professor ensinou”.',button('＋ Novo grupo','new-repertoire','secondary'))}</section>`;
}
function sessionBuilder(patientId){
  const patient=state.patients.find(x=>x.id===patientId);if(!patient)return empty('Paciente não encontrado','Selecione um paciente para montar a sessão.');
  const draft=sessionDrafts.get(patientId)||{selected:[],query:''};sessionDrafts.set(patientId,draft);
  const selected=draft.selected.map(id=>allExercises().find(x=>x.id===id)).filter(Boolean);
  const candidates=allExercises().filter(x=>!draft.selected.includes(x.id)&&(!draft.query||matchExercise(x,draft.query))).slice(0,12);
  return `<div class="back"><a href="#pacientes/${patientId}">← ${esc(patient.code)}</a></div>${pageHeader('GERADOR DE SESSÃO','Montar sessão','Selecione possibilidades, defina parâmetros e registre somente o que ocorreu.')}<form id="session-builder-form"><input type="hidden" name="patientId" value="${patientId}"><section class="panel session-context"><div class="form-grid">${input('Data *','date','date',today(),'required')}${input('Objetivo da sessão *','objective','text','','required maxlength="180"')}${input('Estado geral','generalState','text','','maxlength="120"')}${input('Orientação','orientation','text','','maxlength="120"')}${input('PA inicial','bpInitial','text','','placeholder="Ex.: 120/80 mmHg" maxlength="40"')}${input('PA final','bpFinal','text','','placeholder="Preencha somente se medida" maxlength="40"')}</div></section><div class="session-layout"><section class="panel"><div class="section-title"><h2>1. Buscar exercícios</h2><span class="group-count">${candidates.length} exibidos</span></div><label class="search wide"><span>⌕</span><input id="session-search" value="${esc(draft.query)}" placeholder="Objetivo, músculo, articulação..."></label><div class="picker-list">${candidates.map(e=>`<button type="button" data-action="session-add-exercise" data-id="${e.id}"><span><strong>${esc(e.name)}</strong><small>${esc(e.category)} · ${esc(e.objective)}</small></span><b>＋</b></button>`).join('')}</div></section><section class="panel selected-panel"><div class="section-title"><h2>2. Planejar e registrar</h2><span class="group-count">${selected.length} selecionados</span></div>${selected.length?selected.map((e,i)=>`<article class="session-exercise"><div class="session-exercise-head"><strong>${i+1}. ${esc(e.name)}</strong><button type="button" data-action="session-remove-exercise" data-id="${e.id}">×</button></div><input type="hidden" name="exerciseId" value="${e.id}"><div class="parameter-grid">${select('Status',`status-${e.id}`,[['planejado','Planejado'],['realizado','Realizado'],['nao-realizado','Não realizado'],['interrompido','Interrompido'],['modificado','Modificado']])}${input('Séries',`sets-${e.id}`,'text','','maxlength="20"')}${input('Repetições',`reps-${e.id}`,'text','','maxlength="30"')}${input('Tempo',`time-${e.id}`,'text','','maxlength="30"')}${input('Carga',`load-${e.id}`,'text','','maxlength="30"')}${select('Assistência',`assist-${e.id}`,[['','Não registrada'],['independente','Independente'],['supervisao','Supervisão'],['parcial','Assistência parcial'],['maior','Assistência maior']])}${input('Dor',`pain-${e.id}`,'number','','min="0" max="10"')}${input('Observação',`note-${e.id}`,'text','','maxlength="160"')}</div></article>`).join(''):empty('Selecione exercícios','Use a busca ao lado para montar a sessão.')}</section></div><section class="panel session-close"><h2>3. Fechamento e evolução</h2><div class="form-grid">${area('Resposta observada','response','','Resposta durante e após a sessão')}${area('Intercorrências','incidents','','Deixe em branco se não houver informação a registrar')}</div><div class="form-grid">${input('Dor antes (0–10)','painBefore','number','','min="0" max="10"')}${input('Dor depois (0–10)','painAfter','number','','min="0" max="10"')}</div><div class="sticky-action"><button type="submit" class="button primary" ${selected.length?'':'disabled'}>Concluir sessão e gerar evolução</button></div></section></form>`;
}
function evolutionDraft(values,items,detailed=false){
  const bits=[];
  if(values.generalState)bits.push(`Estado geral: ${values.generalState}.`);
  if(values.orientation)bits.push(`Orientação: ${values.orientation}.`);
  if(values.bpInitial)bits.push(`PA inicial: ${values.bpInitial}.`);
  if(values.objective)bits.push(`Objetivo da sessão: ${values.objective}.`);
  const done=items.filter(x=>x.status!=='nao-realizado');
  if(done.length)bits.push(`Intervenções: ${done.map(x=>{const e=allExercises().find(y=>y.id===x.exerciseId);const params=[x.sets&&`${x.sets} séries`,x.reps&&`${x.reps} repetições`,x.time&&x.time,x.load&&`carga ${x.load}`,x.assistance&&`assistência: ${x.assistance}`].filter(Boolean).join(', ');return `${e?.name||'atividade'} (${x.status}${params?'; '+params:''}${detailed&&x.note?'; '+x.note:''})`}).join('; ')}.`);
  if(detailed&&values.response)bits.push(`Resposta: ${values.response}.`);
  if(values.painBefore)bits.push(`Dor referida antes: ${values.painBefore}/10.`);
  if(values.painAfter)bits.push(`Dor referida após: ${values.painAfter}/10.`);
  if(values.bpFinal)bits.push(`PA final: ${values.bpFinal}.`);
  if(values.incidents)bits.push(`Intercorrências: ${values.incidents}.`);
  return bits.join(' ');
}

function exercisesPage() {
  const all = [...catalog,...state.exercises];
  const groups = [...new Set(all.map(e=>e.category))];
  return `${pageHeader('BIBLIOTECA','Exercícios','Catálogo de nomes para registro e estudo. A prescrição deve ser individualizada.',button('＋ Adicionar exercício','new-exercise'))}${advisory}<div class="library-intro"><span class="intro-mark">◇</span><div><strong>Proveniência em cada exercício</strong><p>Os itens iniciais são apenas nomes traduzidos de um projeto MIT. Não incluem técnica, dose ou indicação clínica.</p></div></div>${groups.map(g=>`<section class="library-group"><div class="section-title"><div><span class="eyebrow">CATÁLOGO</span><h2>${esc(g)}</h2></div><span class="group-count">${all.filter(e=>e.category===g).length} itens</span></div><div class="exercise-grid">${all.filter(e=>e.category===g).map(e=>`<article class="exercise-card"><div class="exercise-symbol">${g==='Mobilidade'?'↗':g==='Membros inferiores'?'◉':g==='Membros superiores'?'✳':'◎'}</div><h3>${esc(e.name)}</h3><span class="source-label">${e.custom?'Adicionado pelo usuário':'Catálogo MIT'}</span><p><strong>Fonte:</strong> ${esc(e.source)}</p>${e.notes?`<p>${esc(e.notes)}</p>`:''}</article>`).join('')}</div></section>`).join('')}`;
}
function dataPage() {
  return `${pageHeader('CONTROLE LOCAL','Dados e privacidade','Controle seus registros e faça cópias de segurança.')}${advisory}<div class="section-grid"><section class="panel settings-card"><div class="settings-icon">⇩</div><h2>Exportar backup</h2><p>Baixe um arquivo JSON com pacientes, avaliações, planos, sessões e exercícios personalizados.</p>${button('Exportar dados','export-data')}</section><section class="panel settings-card"><div class="settings-icon">⇧</div><h2>Importar backup</h2><p>A importação substitui os dados locais atuais. Exporte uma cópia antes de importar.</p><label class="button secondary import-label">Selecionar arquivo<input id="import-file" type="file" accept="application/json,.json" hidden></label></section></div><section class="panel privacy"><span class="eyebrow">PRIVACIDADE</span><h2>Antes de usar em estágio</h2><p>Este protótipo guarda dados no armazenamento local do navegador, sem criptografia, autenticação ou sincronização. Use apenas códigos ou apelidos e dados desidentificados. Verifique as regras da instituição e a supervisão antes de registrar dados reais. Limpar dados do navegador pode apagar todos os registros.</p><p>O aplicativo funciona offline após a primeira visita pela rede. O arquivo de backup deve ser guardado de forma segura pelo responsável.</p><div class="data-count">${state.patients.length} pacientes · ${state.assessments.length} avaliações · ${state.sessions.length} sessões</div></section>`;
}
function modal(title,body,formId) {
  $('#dialog-root').innerHTML = `<div class="modal-backdrop" data-action="close-modal"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-head"><div><span class="eyebrow">FISIO CLÍNICO</span><h2 id="modal-title">${title}</h2></div><button type="button" class="icon-button close" data-action="close-modal" aria-label="Fechar">×</button></div><form id="${formId}"><div class="modal-body">${body}</div><div class="modal-foot"><button type="button" class="button ghost" data-action="close-modal">Cancelar</button><button type="submit" class="button primary">Salvar registro</button></div></form></div></div>`;
  $('.modal input:not([type=hidden]), .modal textarea, .modal select')?.focus();
}
function closeModal() { $('#dialog-root').innerHTML = ''; }
function patientForm(p) {
  modal(p?'Editar paciente':'Novo paciente',patientFormBody(p||{},today()),'patient-form');
}
function assessmentForm(id) {
  modal('Nova avaliação',`<input type="hidden" name="patientId" value="${esc(id)}"><div class="form-grid">${input('Data *','date','date',today(),'required')}${select('Tipo','type',[['Inicial','Inicial'],['Reavaliação','Reavaliação'],['Objetiva','Objetiva']])}${input('Dor referida (0–10)','pain','number','','min="0" max="10" step="1"')}</div>${area('Queixa / objetivo relatado','complaint','','Descreva apenas o que foi avaliado')}${area('Achados registrados','findings','','Exame e observações sob supervisão')}${area('Função relatada','function','','Atividades e limitações relatadas')}`,'assessment-form');
}
function clinicalAssessmentForm(id) {
  modal('Avaliação fisioterapêutica',clinicalAssessmentBody(id,today()),'clinical-assessment-form');
  $('.modal')?.classList.add('workflow-modal');
}
function gaitField(label,name,options) {
  return select(label,name,options);
}
function gaitAssessmentForm(id) {
  const testCards = gaitTestGuide.map(test=>`<label class="gait-test"><input type="checkbox" name="selectedTest" value="${esc(test.id)}"><span><strong>${esc(test.name)}</strong><b>${esc(test.question)}</b><small>${esc(test.note)}</small></span></label>`).join('');
  const checklist = gaitChecklist.map(item=>`<div class="gait-check-row"><label><input type="checkbox" name="gaitFinding" value="${esc(item.id)}"><span>${esc(item.label)}</span></label>${item.sideApplicable?select('Lado',`gaitSide-${item.id}`,[['','Não definido'],['Direito','Direito'],['Esquerdo','Esquerdo'],['Bilateral','Bilateral']]):''}</div>`).join('');
  modal('Avaliação guiada da marcha',`<input type="hidden" name="patientId" value="${esc(id)}"><input type="hidden" name="type" value="Marcha">
    <div class="gait-intro"><strong>Observe em 3 passadas</strong><ol><li>Segurança e padrão global.</li><li>Apoio: contato, tempo, pelve, joelho e tronco.</li><li>Balanço, liberação do pé, braços e virada.</li></ol><p>Marque apenas o que você realmente observou. “Sem alteração evidente” não significa normalidade nem exclui alterações fora do plano observado.</p></div>
    <section class="gait-step"><div class="gait-step-head"><span>1</span><div><strong>Condições e segurança</strong><small>Use o dispositivo habitual e permaneça próximo se houver risco de queda.</small></div></div><div class="form-grid">${input('Data *','date','date',today(),'required')}${input('Dor referida (0–10)','pain','number','','min="0" max="10" step="1"')}${input('Ambiente / superfície','environment','text','','placeholder="Ex.: corredor plano, 8 m" maxlength="100"')}${input('Calçado','footwear','text','','placeholder="Ex.: tênis habitual" maxlength="80"')}${input('Dispositivo auxiliar','device','text','','placeholder="Ex.: sem dispositivo, bengala" maxlength="100"')}${select('Nível de assistência','assistance',[['','Não registrado'],['independente','Independente'],['supervisao','Supervisão próxima'],['contato','Assistência por contato'],['minima','Assistência mínima'],['moderada','Assistência moderada'],['maxima','Assistência máxima']])}</div>${area('Sintomas e resposta durante a tarefa','symptoms','','Dor, tontura, dispneia, fadiga, medo ou mudança do padrão')}${area('Segurança / intercorrências','safetyNotes','','Quase queda, apoio em móveis, necessidade de interromper ou outro fato observado')}</section>
    <section class="gait-step"><div class="gait-step-head"><span>2</span><div><strong>Padrão global e fase de apoio</strong><small>Observe de frente, de costas e de lado, sem tentar preencher tudo de uma vez.</small></div></div><div class="gait-grid">${gaitField('Ritmo','pace',gaitSelects.pace)}${gaitField('Simetria / passo','symmetry',gaitSelects.symmetry)}${gaitField('Base de suporte','base',gaitSelects.base)}${gaitField('Contato inicial','initialContact',gaitSelects.initialContact)}${gaitField('Tempo de apoio','stanceTime',gaitSelects.stanceTime)}${gaitField('Controle da pelve','pelvis',gaitSelects.pelvis)}${gaitField('Joelho no apoio','knee',gaitSelects.knee)}${gaitField('Tronco','trunk',gaitSelects.trunk)}</div></section>
    <section class="gait-step"><div class="gait-step-head"><span>3</span><div><strong>Balanço, braços e virada</strong><small>Procure liberação do pé e mudanças de estabilidade ao virar.</small></div></div><div class="gait-grid">${gaitField('Liberação do pé','clearance',gaitSelects.clearance)}${gaitField('Joelho no balanço','swingKnee',gaitSelects.swingKnee)}${gaitField('Balanço dos braços','armSwing',gaitSelects.armSwing)}${gaitField('Virada','turn',gaitSelects.turn)}</div><div class="form-grid">${input('Distância observada','distance','text','','placeholder="Ex.: 10 m" maxlength="40"')}${input('Tempo, se cronometrado','time','text','','placeholder="Ex.: 12,4 s" maxlength="40"')}${input('Número de passos, se contado','steps','text','','placeholder="Ex.: 18" maxlength="40"')}</div>${area('Outras observações','notes','','Descreva fatos observáveis; evite concluir a causa sem completar o exame')}</section>
    <section class="gait-step"><div class="gait-step-head"><span>4</span><div><strong>Checklist de achados</strong><small>Marque somente o observado e informe o lado quando aplicável.</small></div></div><div class="gait-checklist">${checklist}</div>${input('Outro achado','otherGaitFinding','text','','maxlength="160"')}</section>
    <section class="gait-step"><div class="gait-step-head"><span>5</span><div><strong>Qual medida responde à sua dúvida?</strong><small>Escolha pela pergunta clínica e pelo perfil da pessoa; não é necessário aplicar todas.</small></div></div><div class="gait-tests">${testCards}</div>${area('Resultados e protocolo usado','testResults','','Ex.: TUG, 11,8 s, com bengala habitual e supervisão próxima. Registre adaptações e motivo de interrupção.')}</section>
    <div class="gait-source"><strong>Importante</strong><p>Este roteiro organiza a observação; não identifica sozinho a causa da alteração e não substitui exame neurológico, musculoesquelético, cardiorrespiratório, análise do risco de queda ou protocolo institucional. Discuta achados novos, instabilidade ou sintomas preocupantes com a supervisão.</p><p>Referências de apoio: <a href="https://www.cdc.gov/steadi/hcp/clinical-resources/index.html" target="_blank" rel="noreferrer">CDC STEADI</a> e <a href="https://www.sralab.org/rehabilitation-measures/10-meter-walk-test" target="_blank" rel="noreferrer">Rehabilitation Measures Database</a>.</p></div>`,'gait-assessment-form');
  $('.modal')?.classList.add('gait-modal');
}
function planForm(id) {
  modal('Diagnóstico, objetivos e plano',planFormBody(state,id,today()),'plan-form');
  $('.modal')?.classList.add('workflow-modal');
}
function sessionForm(id) {
  const options = [['','Nenhum selecionado'],...[...catalog,...state.exercises].map(e=>[e.id,e.name])];
  modal('Registrar sessão',`<input type="hidden" name="patientId" value="${esc(id)}"><div class="form-grid">${input('Data *','date','date',today(),'required')}${input('Dor antes (0–10)','painBefore','number','','min="0" max="10" step="1"')}${input('Dor depois (0–10)','painAfter','number','','min="0" max="10" step="1"')}${select('Exercício registrado','exerciseId',options)}</div>${input('Resumo *','summary','text','','required maxlength="120"')}${area('Intervenções / atividades','interventions','','Registre o que de fato ocorreu')}${area('Resposta observada','response','','Resposta da pessoa e decisão supervisionada')}`,'session-form');
}
function exerciseForm() {
  modal('Adicionar exercício',`<div class="form-grid">${input('Nome *','name','text','','required maxlength="100"')}${select('Categoria','category',[['Tronco e coluna','Tronco e coluna'],['Membros inferiores','Membros inferiores'],['Membros superiores','Membros superiores'],['Mobilidade','Mobilidade'],['Equilíbrio','Equilíbrio'],['Marcha','Marcha'],['Outro','Outro']])}${input('Região','region','text','','maxlength="80"')}${input('Articulação','joint','text','','maxlength="80"')}${input('Grupo muscular','primaryMuscles','text','','placeholder="Separe por vírgulas" maxlength="180"')}${input('Equipamento','equipment','text','','placeholder="Separe por vírgulas" maxlength="180"')}${select('Lado','side',[['A definir','A definir'],['Direito','Direito'],['Esquerdo','Esquerdo'],['Bilateral','Bilateral']])}${select('Nível','difficulty',[['A definir','A definir'],['Inicial','Inicial'],['Intermediário','Intermediário'],['Avançado','Avançado']])}</div>${area('Objetivo','objective','','O que se pretende trabalhar')}${area('Como fazer / execução *','steps','','Uma etapa por linha')}<div class="form-grid">${input('Dose inicial editável','exampleDose','text','','placeholder="Ex.: 2 x 10, manter 5 s" maxlength="120"')}${input('Descanso','rest','text','','maxlength="80"')}${input('Vídeo ou link demonstrativo','videoUrl','url','','placeholder="https://..." maxlength="300"')}</div>${area('Indicações','indications','','Uma por linha')}${area('Cuidados','care','','Condições para adaptar, interromper ou reavaliar')}${area('Progressões','progressions','','Uma por linha; nunca serão aplicadas automaticamente')}${area('Regressões','regressions','','Uma por linha')}${area('Observações','notes','','Registro próprio e ajustes supervisionados')}${input('Fonte / referência / proveniência *','source','text','','required maxlength="300"')}`,'exercise-form');
  $('.modal')?.classList.add('workflow-modal');
}

function repertoireForm(existing){
  const items=existing?(existing.items||[]).map(key=>({key,found:lookupItem(key)})).filter(x=>x.found):[];
  const itemEditor=items.length?`<fieldset class="repertoire-editor"><legend>Itens do grupo</legend><p>Desmarque um item para removê-lo ao salvar.</p>${items.map(({key,found})=>`<label><input type="checkbox" name="keepItem" value="${esc(key)}" checked><span>${esc(found.item.name)}</span></label>`).join('')}</fieldset>`:'';
  modal(existing?'Editar grupo':'Novo grupo',`${input('Nome do grupo *','name','text',existing?.name||'','required maxlength="100"')}${area('Descrição ou observações','notes',existing?.notes||'','Ex.: critérios ensinados pelo supervisor')}${itemEditor}${existing?`<input type="hidden" name="id" value="${existing.id}">`:''}`,'repertoire-form');
}
function addRepertoireForm(kind,id){
  if(!state.repertoires.length){repertoireForm();toast('Crie um grupo antes de adicionar itens.');return;}
  modal('Adicionar ao repertório',`${select('Grupo','repertoireId',state.repertoires.map(r=>[r.id,r.name]))}<input type="hidden" name="itemKey" value="${esc(favoriteKey(kind,id))}"><p class="form-hint">O item será mantido no grupo escolhido para acesso rápido.</p>`,'add-repertoire-form');
}
function gonioForm(id){
  const g=goniometry.find(x=>x.id===id);if(!g)return;
  modal(`Registrar ${g.joint} — ${g.movement}`,`${input('Data *','date','date',today(),'required')}${input('Paciente / código (opcional)','patientCode','text','','maxlength="60"')}${input('Lado','side','text','','maxlength="30"')}${input('Valor medido *','value','number','','required step="0.1"')}${area('Observações','notes','','Posição, sintomas ou variações do método')}<input type="hidden" name="goniometryId" value="${g.id}"><p class="form-hint">O app não compara com valores normativos. Registre unidade e método de forma consistente.</p>`,'goniometry-form');
}
function patientGonioForm(patientId){
  const options=goniometry.map(item=>[item.id,`${item.joint} — ${item.movement}`]);
  modal('Registrar goniometria',`<input type="hidden" name="patientId" value="${esc(patientId)}"><div class="form-grid">${input('Data *','date','date',today(),'required')}${select('Articulação e movimento','goniometryId',options)}${select('Lado','side',[['Direito','Direito'],['Esquerdo','Esquerdo'],['Bilateral','Bilateral']])}${input('Graus *','value','number','','required step="0.1"')}${input('Método','method','text','Goniômetro universal','maxlength="80"')}</div>${area('Observações','notes','','Posição, sintomas, compensações ou variações do método')}`,'patient-goniometry-form');
}
function choosePatientForSession(exerciseId){
  if(!state.patients.filter(p=>!p.archived).length){toast('Cadastre um paciente para montar uma sessão.',true);location.hash='pacientes';return;}
  modal('Adicionar à sessão',`${select('Paciente','patientId',state.patients.filter(p=>!p.archived).map(p=>[p.id,p.code]))}<input type="hidden" name="exerciseId" value="${esc(exerciseId||'')}"><p class="form-hint">A seleção abre o gerador. Parâmetros e status serão definidos na sessão.</p>`,'choose-session-form');
}
function sessionFromForm(form){
  return sessionPayloadFromForm(form,id=>allExercises().find(item=>item.id===id));
}

function updateSessionTotal(){
  const total=[...document.querySelectorAll('[name^="minutes-"]')].reduce((sum,field)=>sum+(Number(field.value)||0),0);
  const output=$('#session-total');if(output)output.textContent=`${total} min`;
}

function formValues(form) { return Object.fromEntries(new FormData(form).entries()); }
function inRange(value) { return value === '' || (Number.isInteger(Number(value)) && Number(value)>=0 && Number(value)<=10); }
document.addEventListener('submit', event => {
  const form=event.target;if(!form.id?.endsWith('-form'))return;event.preventDefault();
  if(form.id==='session-builder-form'){
    try{const payload=sessionFromForm(form);addRecord(state,'sessions',payload);sessionDrafts.delete(payload.patientId);saveState(state);toast('Sessão concluída e evolução gerada.');location.hash=`pacientes/${payload.patientId}`;}catch(error){toast(error.message,true);}return;
  }
  const values=formValues(form);
  if(form.id==='clinical-assessment-form'){
    const clinical=clinicalAssessmentFromForm(new FormData(form));
    if(!inRange(values.pain)){toast('Informe dor entre 0 e 10.',true);return;}
    if(!assessmentHasContent(clinical)&&!values.complaint?.trim()){toast('Registre ao menos um achado ou uma queixa avaliada.',true);return;}
    const payload={patientId:values.patientId,date:values.date,type:values.type||'Estruturada',pain:values.pain,complaint:values.complaint||'',function:values.function||'',clinical,findings:buildAssessmentSummary(clinical)};
    try{addRecord(state,'assessments',payload);closeModal();saved();}catch(error){toast(error.message,true);}
    return;
  }
  if(form.id==='gait-assessment-form'){
    const gaitData=new FormData(form);
    const selectedTests=gaitData.getAll('selectedTest');
    const checklist=gaitData.getAll('gaitFinding').map(findingId=>({id:findingId,side:gaitData.get(`gaitSide-${findingId}`)||''}));
    if(!inRange(values.pain)){toast('Informe dor entre 0 e 10.',true);return;}
    if(!gaitHasObservation(values)&&!selectedTests.length&&!checklist.length&&!values.otherGaitFinding?.trim()){toast('Registre ao menos uma observação, achado ou medida selecionada.',true);return;}
    values.gait={...values,selectedTests,checklist};
    values.findings=buildGaitSummary(values,selectedTests,checklist);
    delete values.selectedTest;
    try{addRecord(state,'assessments',values);closeModal();saved();}catch(error){toast(error.message,true);}
    return;
  }
  if(form.id==='case-discussion-form'){if(!values.caseCode.trim()){toast('Informe um código desidentificado.',true);return;}addRecord(state,'caseDiscussions',values);saveState(state);toast('Roteiro de discussão salvo.');render();return;}
  if(form.id==='repertoire-form'){if(!values.name.trim()){toast('Informe o nome do grupo.',true);return;}if(values.id){const r=state.repertoires.find(x=>x.id===values.id);if(r)Object.assign(r,{name:values.name,notes:values.notes,items:new FormData(form).getAll('keepItem')});}else addRecord(state,'repertoires',{name:values.name,notes:values.notes,items:[]});closeModal();saved();return;}
  if(form.id==='add-repertoire-form'){try{addToRepertoire(state,values.repertoireId,values.itemKey);closeModal();saved();}catch(error){toast(error.message,true);}return;}
  if(form.id==='goniometry-form'){addRecord(state,'goniometryRecords',values);closeModal();saved();return;}
  if(form.id==='patient-goniometry-form'){
    const reference=goniometry.find(item=>item.id===values.goniometryId);
    const patient=state.patients.find(item=>item.id===values.patientId);
    addRecord(state,'goniometryRecords',{...values,patientCode:patientLabel(patient),joint:reference?.joint||'',movement:reference?.movement||'',source:'manual'});
    closeModal();saved();return;
  }
  if(form.id==='choose-session-form'){const draft=sessionDrafts.get(values.patientId)||{selected:[],query:''};if(values.exerciseId&&!draft.selected.includes(values.exerciseId))draft.selected.push(values.exerciseId);sessionDrafts.set(values.patientId,draft);closeModal();location.hash=`sessao/${values.patientId}`;return;}
  if(['assessment-form','session-form'].includes(form.id)&&!['pain','painBefore','painAfter'].every(k=>!(k in values)||inRange(values[k]))){toast('Informe dor entre 0 e 10.',true);return;}
  if(form.id==='patient-form'){
    if(!values.code?.trim()&&!values.name?.trim()){toast('Informe ao menos o nome ou um código/apelido.',true);return;}
    if(values.id){updateRecord(state,'patients',values.id,values);}else{const p=addRecord(state,'patients',values);location.hash=`pacientes/${p.id}`;}
  }else{
    const collection=({'assessment-form':'assessments','plan-form':'plans','session-form':'sessions','exercise-form':'exercises'})[form.id];
    if(collection==='plans'&&!values.title?.trim()){toast('Informe um título para o plano.',true);return;}
    if(collection==='exercises'){
      values.custom=true;
      values.steps=values.steps.split(/\r?\n/).map(item=>item.trim()).filter(Boolean);
      values.primaryMuscles=values.primaryMuscles.split(',').map(item=>item.trim()).filter(Boolean);
      values.equipment=values.equipment.split(',').map(item=>item.trim()).filter(Boolean);
      values.indications=values.indications.split(/\r?\n/).map(item=>item.trim()).filter(Boolean);
      values.progressions=values.progressions.split(/\r?\n/).map(item=>item.trim()).filter(Boolean);
      values.regressions=values.regressions.split(/\r?\n/).map(item=>item.trim()).filter(Boolean);
      if(values.videoUrl&&!/^https?:\/\//i.test(values.videoUrl)){toast('O link demonstrativo deve começar com http:// ou https://.',true);return;}
    }
    try{addRecord(state,collection,values);}catch(error){toast(error.message,true);return;}
  }
  closeModal();saved();
});
document.addEventListener('click',event=>{
  const target=event.target.closest('[data-action]');if(!target)return;
  const action=target.dataset.action,id=target.dataset.id;
  if(action==='close-modal'){if(event.target===target||target.tagName==='BUTTON')closeModal();return;}
  if(action==='new-patient')patientForm();
  if(action==='edit-patient')patientForm(state.patients.find(p=>p.id===id));
  if(action==='archive-patient'){const p=state.patients.find(x=>x.id===id);if(p){p.archived=!p.archived;saved();}}
  if(action==='new-assessment')assessmentForm(id);
  if(action==='new-clinical-assessment')clinicalAssessmentForm(id);
  if(action==='new-gait-assessment')gaitAssessmentForm(id);
  if(action==='new-patient-gonio')patientGonioForm(id);
  if(action==='new-plan')planForm(id);
  if(action==='new-session')sessionForm(id);
  if(action==='build-session')location.hash=`sessao/${id}`;
  if(action==='new-exercise')exerciseForm();
  if(action==='go-patients')location.hash='pacientes';
  if(action==='go-quick')location.hash='consulta';
  if(action==='quick-term'){quickQuery=target.dataset.term||'';render();}
  if(action==='toggle-archived'){filter=filter==='arquivados'?'':'arquivados';render();}
  if(action==='toggle-favorite'){const added=toggleFavorite(state,favoriteKey(target.dataset.kind,id));saveState(state);toast(added?'Adicionado aos favoritos.':'Removido dos favoritos.');render();}
  if(action==='new-repertoire')repertoireForm();
  if(action==='edit-repertoire')repertoireForm(state.repertoires.find(x=>x.id===id));
  if(action==='add-repertoire')addRepertoireForm(target.dataset.kind,id);
  if(action==='add-session')choosePatientForSession(id);
  if(action==='record-gonio')gonioForm(id);
  if(action==='delete-case'){state.caseDiscussions=state.caseDiscussions.filter(x=>x.id!==id);saveState(state);toast('Roteiro excluído.');render();}
  if(action==='session-add-exercise'){const [,patientId]=route();const draft=sessionDrafts.get(patientId)||{selected:[],query:''};if(!draft.selected.includes(id))draft.selected.push(id);sessionDrafts.set(patientId,draft);render();}
  if(action==='session-remove-exercise'){const [,patientId]=route();const draft=sessionDrafts.get(patientId);if(draft)draft.selected=draft.selected.filter(x=>x!==id);render();}
  if(action==='session-move-up'||action==='session-move-down'){
    const [,patientId]=route();const draft=sessionDrafts.get(patientId);const index=draft?.selected.indexOf(id)??-1;
    const next=action==='session-move-up'?index-1:index+1;
    if(draft&&index>=0&&next>=0&&next<draft.selected.length){[draft.selected[index],draft.selected[next]]=[draft.selected[next],draft.selected[index]];render();}
  }
  if(action==='generate-evolution'){
    const form=target.closest('form');const field=form?.elements.evolution;if(!form||!field)return;
    const previous=field.value;field.value='';
    try{field.value=sessionFromForm(form).evolutionDetailed;field.focus();toast('Sugestão gerada. Revise antes de salvar.');}catch(error){field.value=previous;toast(error.message,true);}
  }
  if(action==='add-assessment-row'){const group=target.dataset.group;target.closest('.repeat-section')?.querySelector('[data-repeat-group]')?.insertAdjacentHTML('beforeend',assessmentRow(group));}
  if(action==='remove-row')target.closest('[data-repeat-row]')?.remove();
  if(action==='append-goal'){const field=document.querySelector(`[name="${target.dataset.target}"]`);if(field){field.value+=(field.value?'\n':'')+(target.dataset.text||'');field.focus();}}
  if(action==='delete-record'){
    const collection=target.dataset.collection;
    if(confirm('Excluir este registro deste dispositivo?')){removeRecord(state,collection,id);saved();}
  }
  if(action==='print-page')window.print();
  if(['copy-evolution','share-evolution','export-evolution'].includes(action)){
    const session=state.sessions.find(item=>item.id===id);const content=session?.evolutionDetailed||session?.evolutionShort||session?.interventions||'';
    if(!content){toast('Não há texto de evolução neste registro.',true);return;}
    if(action==='copy-evolution')navigator.clipboard.writeText(content).then(()=>toast('Evolução copiada.')).catch(()=>toast('Não foi possível copiar.',true));
    if(action==='share-evolution'){
      if(navigator.share)navigator.share({title:'Evolução fisioterapêutica',text:content}).catch(()=>{});
      else navigator.clipboard.writeText(content).then(()=>toast('Compartilhamento indisponível; texto copiado.'));
    }
    if(action==='export-evolution'){const blob=new Blob([content],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`evolucao-${session.date||today()}.txt`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  }
  if(action==='export-data'){
    const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download=`fisio-clinico-backup-${today()}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
});
function rerenderField(id,position){render();const field=$(id);field?.focus();if(field&&typeof position==='number')field.setSelectionRange(position,position);}
document.addEventListener('input',event=>{
  const pos=event.target.selectionStart;
  if(event.target.id==='patient-search'){filter=event.target.value;rerenderField('#patient-search',pos);}
  if(event.target.id==='quick-search'){quickQuery=event.target.value;rerenderField('#quick-search',pos);}
  if(event.target.id==='library-search'){libraryQuery=event.target.value;rerenderField('#library-search',pos);}
  if(event.target.id==='session-search'){const [,patientId]=route();const draft=sessionDrafts.get(patientId);if(draft){draft.query=event.target.value;rerenderField('#session-search',pos);}}
  if(event.target.id==='global-search'){quickQuery=event.target.value;if(location.hash!=='#consulta')location.hash='consulta';else render();}
  if(event.target.name?.startsWith('minutes-'))updateSessionTotal();
});
document.addEventListener('change',async event=>{
  if(event.target.id==='library-category'){libraryCategory=event.target.value;render();return;}
  if(event.target.name==='neuroObjective'||event.target.name==='neuroPosition'||event.target.name==='neuroAssistance'){const key=event.target.name.replace('neuro','');neuroFilters[key.charAt(0).toLowerCase()+key.slice(1)]=event.target.value;render();return;}
  if(event.target.id!=='import-file'||!event.target.files?.[0])return;
  try{const {validateState}=await import('./store.js');const next=validateState(JSON.parse(await event.target.files[0].text()));if(!confirm('Substituir todos os dados locais pelos dados do arquivo selecionado?'))return;state=next;saveState(state);toast('Backup importado.');render();}catch(error){toast(`Arquivo inválido: ${error.message}`,true);}
});
window.addEventListener('hashchange',render);
window.addEventListener('online',updateNetwork);
window.addEventListener('offline',updateNetwork);
function updateNetwork(){ $('#network-status').textContent=navigator.onLine?'Disponível offline':'Modo offline'; }
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstall=event;$('#install-button').hidden=false;});
$('#install-button').addEventListener('click',async()=>{if(deferredInstall){deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=undefined;$('#install-button').hidden=true;}});
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});
updateNetwork();render();
