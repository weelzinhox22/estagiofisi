import { loadState, saveState as saveLocalState, addRecord, updateRecord, removeRecord, patientRecords, painSeries, catalog, today, toggleFavorite, addToRepertoire, emptyState } from './store.js';
import { muscles, clinicalTests, goniometry, reflexes, scales, functionalProblems } from './reference-data.js';
import { cameraPage, mountCamera, cleanupCamera } from './camera.js';
import { generalLibraryPage, meetingPage, complaintPage, casesPage, generalSearch } from './general-physio-ui.js';
import { reasoningLibraryPage, reasoningDetailPage, reasoningSearch } from './clinical-reasoning-ui.js';
import { gaitSelects, gaitTestGuide, gaitChecklist, buildGaitSummary, gaitHasObservation } from './gait-assessment.js';
import { buildEvolution, clinicalAssessmentFromForm, assessmentHasContent, buildAssessmentSummary, patientInitials, patientLabel, SESSION_BLOCKS } from './clinical-workflow.js';
import { assessmentRow, clinicalAssessmentBody, patientFormBody, patientWorkflowPage, planFormBody, printPatientPage } from './patient-workflow-ui.js';
import { sessionBuilderPage, sessionPayloadFromForm } from './session-workflow-ui.js';
import { APP_VERSION } from './version.js';
import { buildDischargeReport } from './v06-core.js';
import { dischargePage, functionalModelPage, homeProgramPage, morePage, neuroPage, pediatricsPage, reassessmentPage, toolsPage } from './v06-ui.js';
import { assessmentMeasures } from './assessment-measures-data.js';
import { buildTestSummary, calculateMeasureResult, detectPossibleFindings, suggestionEngine } from './assessment-assistant.js';
import { assessmentAssistantPage, measureDetailPage, measureExecutorPage, measuresLibraryPage } from './assessment-assistant-ui.js';
import { enhanceVoiceInputs, stopVoiceDictation } from './voice-dictation.js';
import { authPage, accountPage } from './auth-ui.js';
import { adminPage } from './admin-ui.js';
import { signUp, signIn, signOut, restoreSession, persistSession, changePassword, requestPasswordReset, getProfile, sessionUser } from './supabase-client.js';
import { scheduleCloudSync, syncCloudState, loadCloudSnapshots, loadCloudWorkspace, mergeCloudSnapshots, mergeCloudWorkspace } from './cloud-sync.js';
import { structureTranscript, voiceStructurePreview } from './voice-structure.js';
import { rapidCarePage, buildRapidEvolution } from './rapid-care-ui.js';
import { clinicalMentorPage } from './clinical-mentor-ui.js';
import { learningHub, learningToolPage } from './learning-lab-ui.js';
import { downloadsPage } from './downloads-ui.js';
import { videoLibraryPage } from './video-library-ui.js';
import { exerciseVisual } from './exercise-visuals.js';
import { palpationGuides } from './palpation-data.js';
import { orthopedicCases, orthopedicVideoResources } from './orthopedic-pathways-data.js';
import { scientificSearchPage } from './scientific-search-ui.js';
import { mountMentorChat, openMentorChatWithPrompt, unmountMentorChat } from './mentor-chat-ui-v2.js';
import { loadKisnerCatalog, kisnerLibraryPage, kisnerDetailPage } from './kisner-library-ui.js';
import { loadPalpatoryAtlas, palpatoryAtlasPage, palpatoryAtlasDetail } from './palpatory-atlas-ui.js';
import { exerciseVideoUploadPanel, analyzeExerciseVideo, publishExerciseVideo, loadExerciseVideos, deleteExerciseVideo } from './exercise-video-upload.js';
import { evolutionGoalsFromEntries, goalsSentence } from './evolution-goals.js';
import { conditionExercises } from './condition-exercises-data.js';
import { conditionLibraryPage } from './condition-exercises-ui.js';
import { saveFormDraft, restoreDrafts, clearFormDraft, saveSessionPlan, loadSessionPlan, clearSessionPlan } from './draft-persistence.js';

let state=emptyState(),currentStorage=localStorage;
let authState={ready:false,session:null,profile:null,message:''},adminRows=null,voiceStructureDraft=null,mentorDraft={},learningDraft={tool:'',history:[]};
const rapidTimers=new Map();
const activeUserId=()=>authState.session?sessionUser(authState.session).sub:'anonymous';
let filter = '';
let quickQuery = '';
const QUICK_HISTORY_KEY='fisio-clinico-quick-history';
let quickHistory=(()=>{try{return JSON.parse(localStorage.getItem(QUICK_HISTORY_KEY)||'[]').filter(Boolean).slice(0,6);}catch{return[];}})();
let libraryQuery = '';
let libraryCategory = 'Todas';
let conditionQuery = '';
let conditionFilter = 'todas';
let downloadsQuery='',downloadsCategory='Todos';
let videoCatalog=null,videoCatalogError='',videoCatalogPromise=null;
let videoQuery='',videoCategory='Todas';
let videoUploadDraft={file:null,previewUrl:'',analysis:null,loading:false,publishing:false,error:''};
let articleDraft={query:'',year:new Date().getFullYear()-5,openAccess:true,results:[],searched:false};
const articleMemoryKey=()=>authState.session?`fisio-clinico:article-memory:${sessionUser(authState.session).sub}`:'fisio-clinico:article-memory:guest';
function loadArticleMemory(){let legacy=[];try{const rows=JSON.parse(localStorage.getItem(articleMemoryKey())||'[]');legacy=Array.isArray(rows)?rows:[];}catch{}const synced=Array.isArray(state.articleMemory)?state.articleMemory:[];return [...synced,...legacy].filter((item,index,all)=>all.findIndex(other=>(other.doi||other.id||other.title)===(item.doi||item.id||item.title))===index);}
function saveArticlesToMemory(rows){const existing=loadArticleMemory(),merged=[...rows,...existing].filter((item,index,all)=>all.findIndex(other=>(other.doi||other.id||other.title)===(item.doi||item.id||item.title))===index).slice(0,200).map(item=>({...item,id:String(item.id||item.doi||crypto.randomUUID()),rememberedAt:item.rememberedAt||new Date().toISOString()}));state.articleMemory=merged;localStorage.removeItem(articleMemoryKey());saveState(state);return merged.length-existing.length;}
function enhanceArticleMemoryControls(){if(mainRoute()!=='artigos')return;const memory=loadArticleMemory(),heading=document.querySelector('.article-results__heading');if(heading&&!heading.querySelector('[data-action="remember-article-results"]'))heading.insertAdjacentHTML('beforeend',`<button class="article-memory-all" type="button" data-action="remember-article-results">＋ Incorporar resultados à memória</button>`);document.querySelectorAll('.article-card').forEach((card,index)=>{const row=articleDraft.results[index],actions=card.querySelector('.article-card__actions');if(!row||!actions||actions.querySelector('[data-action="remember-article"]'))return;const remembered=memory.some(item=>(item.doi||item.id||item.title)===(row.doi||row.id||row.title));actions.insertAdjacentHTML('beforeend',`<button class="article-memory-one ${remembered?'is-remembered':''}" type="button" data-action="remember-article" data-index="${index}" ${remembered?'disabled':''}>${remembered?'Memorizado ✓':'＋ Ensinar ao app'}</button>`);});const page=document.querySelector('.articles-page'),hero=document.querySelector('.articles-hero>div:nth-child(2)');if(hero&&memory.length)hero.insertAdjacentHTML('beforeend',`<small class="article-memory-status">Memória científica sincronizada: ${memory.length} artigo${memory.length===1?'':'s'}</small>`);if(page&&memory.length&&!page.querySelector('.article-memory-manager'))page.querySelector('.articles-hero')?.insertAdjacentHTML('afterend',`<details class="article-memory-manager"><summary><span><b>Memória científica do Chat</b><small>${memory.length} fonte${memory.length===1?'':'s'} disponível${memory.length===1?'':'is'} para futuras conversas</small></span><em>Gerenciar</em></summary><div>${memory.slice(0,30).map((item,index)=>`<article><span><strong>${esc(item.title||'Artigo sem título')}</strong><small>${esc(item.source||item.year||'Fonte científica')}</small></span><button type="button" data-action="remove-article-memory" data-index="${index}" aria-label="Remover artigo da memória">×</button></article>`).join('')}${memory.length>30?`<p>Mais ${memory.length-30} artigos estão memorizados.</p>`:''}<button class="clear-article-memory" type="button" data-action="clear-article-memory">Limpar toda a memória</button></div></details>`);}
function mainRoute(){return route()[0];}
let kisnerCatalog=null,kisnerError='',kisnerPromise=null,kisnerQuery='',kisnerCategory='Todas',kisnerType='Todos',kisnerLimit=60;
let palpatoryAtlas=null,palpatoryAtlasError='',palpatoryAtlasPromise=null,atlasQuery='',atlasRegion='Todas',atlasCategory='Todas',atlasLimit=48;
const neuroFilters = { objective:'', position:'', assistance:'' };
const sessionDrafts = new Map();
let deferredInstall;
let testTimer={elapsed:0,started:0,handle:0};
let toolTimer={elapsed:0,started:0,handle:0,laps:[]};
let countdownHandle=0,metronomeHandle=0,manualReps=0,manualLaps=0;
let assistantDraft={findings:[],detected:[]},measurePreview=null;
let homeEditing=false,homeDragId='';
const $ = selector => document.querySelector(selector);
let lastRenderedRoute='';
function scrollPageTop(){window.scrollTo({top:0,left:0,behavior:'auto'});document.documentElement.scrollTop=0;document.body.scrollTop=0;$('#main')?.scrollTo?.({top:0,left:0,behavior:'auto'});}
function enterPage(main,routeKey){if(routeKey===lastRenderedRoute)return;lastRenderedRoute=routeKey;scrollPageTop();main.classList.remove('route-enter');requestAnimationFrame(()=>{main.classList.add('route-enter');main.focus({preventScroll:true});requestAnimationFrame(scrollPageTop);});}
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const formatDate = value => value ? new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR') : '—';
const short = (text, len=92) => String(text || '').length > len ? `${String(text).slice(0,len)}…` : String(text || '');
const saveState=(nextState)=>{saveLocalState(nextState,currentStorage);if(authState.session)scheduleCloudSync(nextState,authState.session,error=>toast(`Salvo localmente; sincronização pendente: ${error.message}`,true));};
const saved = () => { try { saveState(state); toast('Salvo e sincronização agendada.'); render(); } catch { toast('Não foi possível salvar. Verifique o espaço do navegador.', true); } };
const toast = (message, error=false) => { const el = $('#toast'); el.textContent = message; el.className = error ? 'show error' : 'show'; clearTimeout(toast.timer); toast.timer = setTimeout(() => el.className = '', 3500); };
const input = (label,name,type='text',value='',attrs='') => `<label class="field"><span>${label}</span><input name="${name}" type="${type}" value="${esc(value)}" ${attrs}></label>`;
const area = (label,name,value='',placeholder='') => `<label class="field"><span>${label}</span><textarea name="${name}" rows="3" placeholder="${esc(placeholder)}">${esc(value)}</textarea></label>`;
const select = (label,name,options,value='') => `<label class="field"><span>${label}</span><select name="${name}">${options.map(([v,t])=>`<option value="${esc(v)}" ${v===value?'selected':''}>${esc(t)}</option>`).join('')}</select></label>`;
const empty = (title,desc,action='') => `<div class="empty"><div class="empty-icon">✳</div><h3>${title}</h3><p>${desc}</p>${action}</div>`;
const button = (label,action,cls='primary',extra='') => `<button type="button" class="button ${cls}" data-action="${action}" ${extra}>${label}</button>`;
const badge = (text,kind='') => `<span class="badge ${kind}">${esc(text)}</span>`;
const patientAvatarIndex=patient=>[...String(patient?.id||patient?.code||patient?.name||'paciente')].reduce((sum,char)=>sum+char.charCodeAt(0),0)%6;
const patientAvatar=patient=>`<span class="avatar patient-chibi chibi-${patientAvatarIndex(patient)}" role="img" aria-label="Avatar ilustrado de ${esc(patientLabel(patient))}"><span>${esc(patientInitials(patient))}</span></span>`;
const pageHeader = (eyebrow,title,desc,action='') => `<div class="page-head"><div><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${desc}</p></div>${action}</div>`;
const advisory = `<div class="advisory"><span class="advisory-icon">ⓘ</span><div><strong>Uso educacional e apoio clínico supervisionado</strong><p>Registros e exercícios exigem avaliação e decisão individual do profissional responsável. Não substitui diagnóstico ou julgamento clínico.</p></div></div>`;

const navItems = [['inicio','Visão geral','◫'],['atendimento-rapido','Atendimento rápido','⚡'],['evolucao','Criar evolução','✎'],['consulta','Consulta rápida','⌕'],['pacientes','Pacientes','♧'],['aprender','Aprender','✺'],['assistente','Assistente','✦'],['biblioteca','Biblioteca','◇'],['artigos','Buscar artigos','⌕'],['repertorio','Meu repertório','★'],['mais','Mais','☰'],['downloads','Downloads','⇩'],['conta','Conta','●']];
function route() { return decodeURIComponent((location.hash.slice(1) || 'inicio').split('?')[0]).split('/'); }
function routeQuery() { return new URLSearchParams((location.hash.split('?')[1]||'')); }
function renderNav(section) {
  const activeSection = section==='mentor'?'aprender':['camera','encontro','queixa','casos','conduta','testes-funcionais','medidas'].includes(section) ? 'biblioteca' : ['reavaliacao','alta','modelo-funcional','neuro','pediatria','domiciliar','ferramentas'].includes(section)?'mais':section;
  const items=authState.profile?.role==='admin'?[...navItems,['admin','Admin','◆']]:navItems;
  const iconNames={inicio:'home','atendimento-rapido':'plusCircle',evolucao:'edit',consulta:'search',pacientes:'users',aprender:'learn',assistente:'bolt',biblioteca:'book',repertorio:'clipboard',mais:'dots',downloads:'download',conta:'user',admin:'shield'};
  const itemHtml=([id,label,icon],selected=activeSection)=>`<a href="#${id}" class="nav-item nav-${id} ${selected===id?'active':''}" ${selected===id?'aria-current="page"':''}><span aria-hidden="true">${iconNames[id]?homeIcon(iconNames[id]):icon}</span><span>${label}</span></a>`;
  $('#desktop-nav').innerHTML = items.map(itemHtml).join('');
  const mobileOrder=['inicio','atendimento-rapido','pacientes','biblioteca','mais'];
  const moreSections=new Set(['evolucao','aprender','assistente','artigos','repertorio','downloads','mais','dados','conta','admin']);
  const mobileActive=moreSections.has(activeSection)?'mais':activeSection;
  $('#mobile-nav').innerHTML = mobileOrder.map(id=>items.find(([itemId])=>itemId===id)).filter(Boolean).map(([id,label,icon])=>itemHtml([id,({inicio:'Início','atendimento-rapido':'Atender',pacientes:'Pacientes',biblioteca:'Biblioteca',mais:'Mais'})[id]||label,icon],mobileActive)).join('');
  $('#breadcrumb').textContent = section==='inicio'?'Fisio Clínico':items.find(([id]) => id === activeSection)?.[1] || 'Visão geral';
}
function render() {
  stopVoiceDictation();
  cleanupCamera();
  const [section,id,tab] = route(),routeKey=[section,id,tab].filter(Boolean).join('/');
  const main = $('#main');
  main.dataset.route=section;
  if(!authState.ready){unmountMentorChat();document.body.classList.add('app-booting');$('#desktop-nav').innerHTML=$('#mobile-nav').innerHTML='';main.innerHTML='<div class="app-start-skeleton" aria-label="Preparando aplicativo"><div class="boot-brand"><img src="/icons/brand-mark.svg" alt=""><span><strong>Fisio Clínico</strong><small>PRÁTICA SUPERVISIONADA</small></span></div><div class="skeleton-hero"></div><div class="skeleton-grid"><i></i><i></i><i></i><i></i></div><div class="skeleton-line"></div><div class="skeleton-card"></div></div>';return;}
  document.body.classList.remove('app-booting');
  if(!authState.session){unmountMentorChat();$('#desktop-nav').innerHTML=$('#mobile-nav').innerHTML='';$('#breadcrumb').textContent='Conta';main.innerHTML=authPage(['cadastro','recuperar'].includes(section)?section:'login',authState.message);queueMicrotask(()=>enhanceVoiceInputs(main));return;}
  if(['login','cadastro','recuperar'].includes(section)){location.hash='inicio';return;}
  renderNav(section);
  if(section==='conta') main.innerHTML=accountPage(authState.profile,state.syncConflicts||[]);
  else if(section==='admin'){if(authState.profile?.role!=='admin')main.innerHTML=empty('Acesso restrito','Esta área está disponível apenas para administradores autorizados.');else{main.innerHTML=adminPage(adminRows||[],adminRows===null);if(adminRows===null)loadAdminCases();}}
  else if(section==='atendimento-rapido'){const query=routeQuery(),a=query.get('a')||'',b=query.get('b')||'';main.innerHTML=rapidCarePage(state,a,b,query.get('mode')||(b?'duplo':'individual'));}
  else if(section==='mentor') main.innerHTML=clinicalMentorPage(state,{...mentorDraft,patientId:routeQuery().get('patient')||mentorDraft.patientId||''});
  else if(section==='aprender'){if(id&&learningDraft.tool!==id)learningDraft={tool:id,history:[]};main.innerHTML=id?learningToolPage(state,id,learningDraft):learningHub();}
  else if(section==='downloads') main.innerHTML=downloadsPage(downloadsQuery,downloadsCategory);
  else if(section==='artigos') main.innerHTML=scientificSearchPage(articleDraft);
  else if(section==='evolucao') main.innerHTML=expressEvolutionHub();
  else if(section==='kisner'&&id){if(!kisnerCatalog&&!kisnerError)queueMicrotask(ensureKisnerCatalog);main.innerHTML=kisnerDetailPage(kisnerCatalog?.find(item=>item.id===id));}
  else if(section==='atlas'&&id){if(!palpatoryAtlas&&!palpatoryAtlasError)queueMicrotask(ensurePalpatoryAtlas);main.innerHTML=palpatoryAtlasDetail(palpatoryAtlas?.tutoriais?.find(item=>item.id===id));}
  else if (section === 'camera') { main.innerHTML = cameraPage(state.patients,routeQuery().get('patient')); queueMicrotask(() => mountCamera({onCapture:detail => { addRecord(state,'goniometryRecords',detail); saveState(state); toast('Medida estimada registrada.'); }})); }
  else if (section === 'assistente') main.innerHTML=assessmentAssistantPage(state,{...assistantDraft,patientId:routeQuery().get('patient')||assistantDraft.patientId||''});
  else if (section === 'medidas' && id) main.innerHTML=measureDetailPage(id);
  else if (section === 'medidas') main.innerHTML=measuresLibraryPage(routeQuery().get('filter')||'todos');
  else if (section === 'testes-funcionais' && id) main.innerHTML=measureExecutorPage(state,id,routeQuery().get('patient')||tab||'',routeQuery().get('repeat')||'',measurePreview?.measureId===id?measurePreview:null);
  else if (section === 'testes-funcionais') main.innerHTML=measuresLibraryPage('todos');
  else if (section === 'reavaliacao') main.innerHTML=reassessmentPage(state,id);
  else if (section === 'alta') main.innerHTML=dischargePage(state,id);
  else if (section === 'modelo-funcional') main.innerHTML=functionalModelPage(state,id);
  else if (section === 'neuro') main.innerHTML=neuroPage(state,id);
  else if (section === 'pediatria') main.innerHTML=pediatricsPage(state,id);
  else if (section === 'domiciliar') main.innerHTML=homeProgramPage(state,allExercises(),id);
  else if (section === 'ferramentas') main.innerHTML=toolsPage();
  else if (section === 'mais') main.innerHTML=morePage();
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
    const draft=sessionDrafts.get(id)||loadSessionPlan(activeUserId(),id)||{selected:[],query:''};
    sessionDrafts.set(id,draft);
    main.innerHTML=patient?sessionBuilderPage({patient,draft,exercises:allExercises(),goals:state.goals.filter(goal=>goal.patientId===id&&!['atingido','suspenso'].includes(goal.status)),today:today()}):empty('Paciente não encontrado','Selecione um paciente para montar a sessão.');
  }
  else if (section === 'consulta') main.innerHTML = quickPage();
  else if (section === 'biblioteca' || section === 'exercicios') main.innerHTML = libraryPage(section==='exercicios'?'exercicios':id||'inicio');
  else if (section === 'repertorio') main.innerHTML = repertoirePage();
  else if (section === 'pacientes' && id) main.innerHTML = patientWorkflowPage(state,id,tab,allExercises());
  else if (section === 'pacientes') main.innerHTML = patientsPage();
  else if (section === 'dados') main.innerHTML = dataPage();
  else main.innerHTML = homePage();
  enterPage(main,routeKey);
  queueMicrotask(()=>{restoreDrafts(main,activeUserId(),location.hash);enhanceVoiceInputs(main);updateSessionTotal();});
  document.title = `${$('#breadcrumb').textContent} · Fisio Clínico`;
  const version=$('#app-version');if(version)version.textContent=`VERSÃO ${APP_VERSION} · OFFLINE`;
  if(!palpatoryAtlas&&!palpatoryAtlasError)queueMicrotask(ensurePalpatoryAtlas);
  if(!kisnerCatalog&&!kisnerError)queueMicrotask(ensureKisnerCatalog);
  const chatExercises=[...allExercises(),...(kisnerCatalog||[]).map(item=>({id:`kisner-${item.id}`,name:item.nome,objective:item.para_que_serve,como_realizar:item.como_realizar,startPosition:item.posicionamento_paciente,care:item.observacao,source:item.fonte?.obra}))];
  mountMentorChat({userId:sessionUser(authState.session).sub,token:authState.session.access_token,articles:articleDraft.results||[],remembered:loadArticleMemory(),articleQuery:articleDraft.query||'',articleSource:articleDraft.source||'',atlas:palpatoryAtlas?.tutoriais||[],exercises:chatExercises});
  enhanceArticleMemoryControls();
}
    function homeIcon(name){
  const paths={
    brand:'<path d="M12 1.8v20.4M1.8 12h20.4M4.8 4.8l14.4 14.4M19.2 4.8 4.8 19.2"/><circle cx="12" cy="12" r="3.1"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',
    arrow:'<path d="M5 12h14M14 7l5 5-5 5"/>',
    user:'<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-4 3.2-6 7-6s6.2 2 7 6"/>',
    clipboard:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5V3h6v1.5M12 10v6M9 13h6"/>',
    users:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3.5 20c.6-4 2.5-6 5.5-6s5 2 5.5 6M14.5 15c3.2-.7 5.3 1 6 4"/>',
    book:'<path d="M3 5.5c3.4-.8 6.4 0 9 2.2v12c-2.6-2.2-5.6-3-9-2.2zM21 5.5c-3.4-.8-6.4 0-9 2.2v12c2.6-2.2 5.6-3 9-2.2z"/>',
    bolt:'<path d="m13.5 2-8 11h6l-1 9 8-12h-6z"/>',
    learn:'<path d="M4 9a8 8 0 0 1 16 0c0 3-1.7 4.8-3.2 6.1-.8.7-1.3 1.4-1.3 2.4h-7c0-1-.5-1.7-1.3-2.4C5.7 13.8 4 12 4 9Z"/><path d="M9 21h6M9 7.8c1.8-1.5 4.2-1.5 6 0"/>',
    pain:'<path d="M13 2 6 13h6l-1 9 7-12h-6z"/>',
    mobility:'<path d="M4 19 19 4M6 8V4h4M14 20h6v-6"/><path d="M7 17c3 2 7 2 10-1"/>',
    strength:'<path d="M3 9v6M6 7v10M9 10h6M18 7v10M21 9v6"/>',
    balance:'<path d="M4 19h16M12 5v14M6 9h12M7 9l-3 6h6zM17 9l-3 6h6z"/>',
    gait:'<circle cx="13" cy="4" r="2"/><path d="m11 7-3 7 5 3 2 5M9 11l7 2 4-3M8 14l-5 7"/>',
    neuro:'<path d="M8 4c-4 1-5 7-2 9-2 4 2 8 6 6V5C11 3 9 3 8 4ZM16 4c4 1 5 7 2 9 2 4-2 8-6 6V5c1-2 3-2 4-1Z"/><path d="M8 9h4M12 14h5"/>',
    respiratory:'<path d="M11 5v7c-3-5-7-4-8 1-1 5 3 8 8 7M13 5v7c3-5 7-4 8 1 1 5-3 8-8 7"/>',
    function:'<circle cx="12" cy="5" r="2"/><path d="m12 8-3 5 3 3 3-3-3-5ZM9 13l-5 7M15 13l5 7"/>',
    home:'<path d="m3 11 9-8 9 8v10h-6v-6H9v6H3z"/>',
    plusCircle:'<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
    dots:'<circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"/>',
    download:'<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
    edit:'<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16zM13.5 6.5l4 4"/>',
    folder:'<path d="M3 6h7l2 2h9v11H3z"/>',
    shield:'<path d="M12 2 4 5v6c0 5 3.4 9 8 11 4.6-2 8-6 8-11V5z"/><path d="m8.5 12 2.2 2.2 4.8-5"/>'
  };
  return `<svg class="app-icon app-icon-${name}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name]||''}</svg>`;
}
function patientFocusIcon(patient){
  const text=normalized([patient?.chiefComplaint,patient?.focus,patient?.clinicalDiagnosis].filter(Boolean).join(' '));
  let kind='person',path='<circle cx="32" cy="22" r="8"/><path d="M15 55c2-15 8-22 17-22s15 7 17 22"/>';
  if(/joelho|patel|menisc/.test(text)){kind='knee';path='<path d="M24 7c3 12 2 19-2 27-3 6-1 15 5 23M42 7c-2 10-1 17 3 24 4 7 2 17-5 26"/><path d="M23 31c7-5 15-5 22 0M25 39c6 4 12 4 18 0"/>';}
  else if(/lomb|coluna|cervic|dors/.test(text)){kind='spine';path='<path d="M32 6c-5 6 5 9 0 14s5 9 0 14 5 9 0 14 5 7 0 11"/><path d="M23 11h18M24 22h16M23 34h18M24 46h16M26 56h12"/>';}
  else if(/ombro|manguito|escap/.test(text)){kind='shoulder';path='<path d="M11 51c4-23 14-34 29-32 8 1 12 7 13 16M18 30c10 0 17 6 20 18"/><circle cx="41" cy="27" r="7"/>';}
  else if(/quadril|pelve|glute/.test(text)){kind='hip';path='<path d="M17 11c-4 12 0 22 10 28l-5 19M47 11c4 12 0 22-10 28l5 19"/><path d="M17 25c9 7 21 7 30 0M27 39h10"/>';}
  else if(/marcha|andar|caminh|equil/.test(text)){kind='gait';path='<circle cx="35" cy="10" r="5"/><path d="m31 18-6 15 11 7 4 18M28 27l14 6 8-5M25 33l-9 18"/>';}
  return `<svg class="patient-focus-icon patient-focus-${kind}" viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}
const HOME_ITEMS=[
  {id:'novo',label:'Novo atendimento',description:'Avaliação e plano de tratamento',icon:'clipboard',action:'new-patient'},
  {id:'evolucao',label:'Criar evolução',description:'Exercícios, doses e texto clínico',icon:'edit',href:'#evolucao'},
  {id:'pacientes',label:'Pacientes',description:'Acompanhe seus atendimentos',icon:'users',href:'#pacientes'},
  {id:'biblioteca',label:'Biblioteca',description:'Exercícios, testes e recursos',icon:'book',href:'#biblioteca'},
  {id:'consulta',label:'Consulta rápida',description:'Guias e raciocínio clínico',icon:'bolt',href:'#consulta'},
  {id:'atlas',label:'Atlas palpatório',description:'Técnicas e referências anatômicas',icon:'function',href:'#biblioteca/atlas'},
  {id:'artigos',label:'Buscar artigos',description:'Literatura científica para estudar',icon:'search',href:'#artigos'},
  {id:'aprender',label:'Aprender',description:'Escrita, casos e prova prática',icon:'learn',href:'#aprender'},
  {id:'downloads',label:'Downloads',description:'Livros e materiais de apoio',icon:'download',href:'#downloads'}
];
const HOME_FEATURES=[
  {eyebrow:'REGISTRO CLÍNICO',title:'Evolução pronta para revisar',description:'Registre exercícios e doses; o app organiza nomes, objetivos, sinais vitais e resposta.',href:'#evolucao',icon:'edit'},
  {eyebrow:'ATENDIMENTO',title:'Dois pacientes, sem misturar dados',description:'Acompanhe duas sessões, timers e respostas em uma tela dividida.',href:'#atendimento-rapido?mode=duplo',icon:'users'},
  {eyebrow:'ESTUDO PRÁTICO',title:'Atlas de anatomia palpatória',description:'Consulte imagens, posicionamento, sequência de palpação e confirmação.',href:'#biblioteca/atlas',icon:'function'},
  {eyebrow:'EVIDÊNCIAS',title:'Busque e discuta artigos',description:'Encontre estudos e leve os resultados diretamente para o Chat clínico.',href:'#artigos',icon:'search'},
  {eyebrow:'EXERCÍCIOS',title:'Kisner ilustrado',description:'Veja imagens, execução, objetivos e gere um rascunho para evolução.',href:'#biblioteca/kisner',icon:'book'},
  {eyebrow:'APRENDIZADO',title:'Professor de escrita clínica',description:'Treine SOAP, avaliação, evolução e apresentação de caso sem acrescentar fatos.',href:'#aprender/escrita',icon:'learn'}
];
function homePrefs(){const saved=state.homePreferences?.find(item=>item.id==='home-layout');const ids=HOME_ITEMS.map(item=>item.id),order=[...(saved?.order||[]).filter(id=>ids.includes(id)),...ids.filter(id=>!saved?.order?.includes(id))];return {id:'home-layout',order,hidden:Array.isArray(saved?.hidden)?saved.hidden:[],links:Array.isArray(saved?.links)?saved.links:[],folders:Array.isArray(saved?.folders)?saved.folders:[]};}
function saveHomePrefs(next){state.homePreferences||=[];const index=state.homePreferences.findIndex(item=>item.id==='home-layout'),row={...next,id:'home-layout',updatedAt:new Date().toISOString(),createdAt:state.homePreferences[index]?.createdAt||new Date().toISOString()};if(index<0)state.homePreferences.push(row);else state.homePreferences[index]=row;saveState(state);}
function homeCard(item){const icon=item.icon==='users'?homeIcon('users'):item.icon==='clipboard'?homeIcon('clipboard'):homeIcon(item.icon),controls=homeEditing?`<span class="home-card-controls"><span class="home-drag-grip" aria-hidden="true">⠿</span><button type="button" data-action="home-hide" data-id="${esc(item.id)}" aria-label="Ocultar">×</button></span>`:'';const inside=`<i>${icon}</i><span><strong>${esc(item.label)}</strong><small>${esc(item.description)}</small></span><b>›</b>${controls}`;if(homeEditing)return `<div class="home-custom-card" draggable="true" data-home-id="${esc(item.id)}">${inside}</div>`;if(item.action)return `<button type="button" data-action="${item.action}">${inside}</button>`;if(item.id==='biblioteca')return `<a href="#biblioteca">${inside}</a>`;return `<a href="${esc(item.href)}">${inside}</a>`;}
function homeFolders(prefs){if(!prefs.folders.length&&!homeEditing)return'';return `<section class="home-folders"><div class="mobile-home-section-title"><strong>MINHAS PASTAS</strong>${homeEditing?'<button type="button" data-action="new-home-folder">＋ Nova pasta</button>':''}</div><div>${prefs.folders.map(folder=>{const items=(folder.itemIds||[]).map(id=>HOME_ITEMS.find(item=>item.id===id)).filter(Boolean);return `<details><summary><i>${homeIcon('folder')}</i><span><strong>${esc(folder.name)}</strong><small>${items.length} ${items.length===1?'atalho':'atalhos'}</small></span><b>⌄</b></summary><div>${items.map(item=>item.action?`<button type="button" data-action="${item.action}"><i>${homeIcon(item.icon)}</i><span>${esc(item.label)}</span></button>`:`<a href="${esc(item.href||'#inicio')}"><i>${homeIcon(item.icon)}</i><span>${esc(item.label)}</span></a>`).join('')}${homeEditing?`<button class="delete-folder" type="button" data-action="delete-home-folder" data-id="${esc(folder.id)}">Excluir pasta</button>`:''}</div></details>`}).join('')}${homeEditing&&!prefs.folders.length?'<p>Crie pastas como Estágio, Joelho, Supervisor ou Casos para estudar.</p>':''}</div></section>`;}
const featureCarousel=()=>`<section class="home-discovery"><div class="mobile-home-section-title"><strong>DESCUBRA O APP</strong><small>Deslize para explorar →</small></div><div>${HOME_FEATURES.map((item,index)=>`<a href="${item.href}"><i>${homeIcon(item.icon)}</i><span><small>${item.eyebrow}</small><strong>${item.title}</strong><p>${item.description}</p><em>Conhecer função →</em></span><b>${String(index+1).padStart(2,'0')}</b></a>`).join('')}</div></section>`;
function expressEvolutionHub(){
  return `${pageHeader('EVOLUÇÃO EXPRESSA','Escreva só o que realizou','Sem selecionar paciente e sem preencher uma ficha inteira. Informe exercícios e doses; o app organiza o registro.')}<section class="express-evolution-card"><div class="express-evolution-intro"><span>⚡</span><div><strong>Você registra o essencial</strong><small>O texto padrão já vem pronto. Revise antes de usar no prontuário.</small></div></div><form id="express-evolution-form"><label class="express-main-field"><span>Exercícios e doses realizados</span><textarea name="exercises" rows="7" required placeholder="Um por linha ou separados por ponto e vírgula.\nEx.: Sentar e levantar 3x10\nElevação de panturrilha 3x10\nMarcha com obstáculos 5 min"></textarea></label><div class="express-vitals"><label><span>PA inicial <small>(opcional)</small></span><input name="bpInitial" inputmode="numeric" placeholder="120/80"></label><label><span>PA final <small>(opcional)</small></span><input name="bpFinal" inputmode="numeric" placeholder="118/78"></label></div><details><summary>Ajustar texto padrão</summary><label><span>Apresentação</span><input name="presentation" value="lúcida, orientada e colaborativa"></label><label><span>Finalização</span><input name="ending" value="Sessão finalizada sem intercorrências."></label></details><button class="button primary express-generate" type="submit">Gerar evolução</button><label class="express-output"><span>Texto gerado</span><textarea id="express-evolution-output" rows="10" readonly placeholder="Sua evolução aparecerá aqui."></textarea></label><div class="express-actions"><button type="button" data-action="copy-express-evolution">Copiar evolução</button><button type="button" data-action="express-evolution-chat">Revisar no Chat</button></div></form></section><details class="evolution-complete-mode"><summary>Precisa do atendimento completo com paciente?</summary>${evolutionHub()}</details>`;
}
function dailyTipCard(){const enabled=localStorage.getItem('fisio-daily-tips')==='1';return `<section class="daily-tip-card"><span>✦</span><div><strong>Dica científica diária</strong><small>${enabled?'Ativada neste dispositivo.':'Receba uma curiosidade baseada em artigo e um lembrete para estudar.'}</small></div><button type="button" data-action="enable-daily-tips">${enabled?'Ativada ✓':'Ativar'}</button></section>`;}
function homePage() {
  const active = state.patients.filter(p => !p.archived);
  const sessions = [...state.sessions].sort((a,b) => b.date.localeCompare(a.date));
  const recent = active.slice().sort((a,b) => b.createdAt.localeCompare(a.createdAt)).slice(0,4);
  const firstName=String(authState.profile?.display_name||'').trim().split(/\s+/)[0]||'';
  const current=recent[0];
  const mobileRecent=current?`<a class="mobile-home-patient" href="#pacientes/${encodeURIComponent(current.id)}"><span class="mobile-home-patient-icon">${patientFocusIcon(current)}</span><span><small>${esc(current.code||'PACIENTE')}</small><strong>${esc(current.chiefComplaint||current.focus||patientLabel(current))}</strong><em>Último registro disponível</em></span><span class="mobile-home-status">Em acompanhamento</span><b>›</b></a>`:`<button class="mobile-home-empty" type="button" data-action="new-patient"><strong>Cadastre seu primeiro paciente</strong><span>Toque para começar um acompanhamento</span></button>`;
  const prefs=homePrefs(),visible=prefs.order.filter(id=>homeEditing||!prefs.hidden.includes(id)).map(id=>HOME_ITEMS.find(item=>item.id===id)).filter(Boolean),customLinks=prefs.links.filter(link=>homeEditing||!link.hidden);
  const customize=`<section class="home-customize"><div><strong>${homeEditing?'Organize sua Home':'Sua Home, do seu jeito'}</strong><small>${homeEditing?'Pressione e arraste qualquer card. As mudanças são salvas na conta.':'Arraste atalhos, crie pastas e adicione seus próprios links.'}</small></div><button type="button" data-action="toggle-home-edit">${homeEditing?'✓ Concluir':'✎ Personalizar'}</button></section>`;
  const hidden=homeEditing&&prefs.hidden.length?`<section class="home-hidden"><strong>Atalhos ocultos</strong><div>${prefs.hidden.map(id=>HOME_ITEMS.find(item=>item.id===id)).filter(Boolean).map(item=>`<button type="button" data-action="home-show" data-id="${item.id}">＋ ${esc(item.label)}</button>`).join('')}</div></section>`:'';
  const links=customLinks.length||homeEditing?`<section class="home-links"><div class="mobile-home-section-title"><strong>MEUS LINKS</strong>${homeEditing?'<button type="button" data-action="new-home-link">＋ Adicionar</button>':''}</div><div>${customLinks.map((link,index)=>`<article draggable="${homeEditing}" data-home-link-id="${esc(link.id)}"><a href="${esc(link.url)}" target="_blank" rel="noopener noreferrer"><i>↗</i><span><strong>${esc(link.label)}</strong><small>${esc(link.description||new URL(link.url).hostname)}</small></span></a>${homeEditing?`<button type="button" data-action="delete-home-link" data-id="${esc(link.id)}">Excluir</button>`:''}</article>`).join('')}${homeEditing&&!customLinks.length?'<p>Adicione protocolos, sites, formulários ou materiais que você usa no estágio.</p>':''}</div></section>`:'';
  const folders=homeFolders(prefs),discovery=featureCarousel()+dailyTipCard();
  const mobile=`<section class="mobile-home-shell"><header class="mobile-home-hero"><div class="mobile-home-brand"><img class="mobile-home-symbol" src="/icons/brand-mark.svg" alt=""><span><strong>Fisio Clínico</strong><small>FISIOTERAPIA BASEADA<br>EM EVIDÊNCIAS</small></span><a href="#conta" aria-label="Abrir conta">${homeIcon('user')}</a></div><div class="mobile-home-welcome"><h1>Olá${firstName?', '+esc(firstName):''}</h1><p>Como posso ajudar no seu atendimento?</p></div><a class="mobile-home-search" href="#consulta"><span>${homeIcon('search')}</span><strong>O que você precisa agora?</strong><b>${homeIcon('arrow')}</b></a></header><div class="mobile-home-body">${customize}<nav class="mobile-home-grid ${homeEditing?'is-editing':''}" aria-label="Ações principais">${visible.map((item,index)=>homeCard(item,index,visible.length)).join('')}</nav>${hidden}${folders}${links}${discovery}<div class="mobile-home-section-title"><strong>ATENDIMENTO EM ANDAMENTO</strong><a href="#pacientes">Ver todos ›</a></div>${mobileRecent}</div></section>`;
  const desktop=`<div class="desktop-home"><section class="hero"><div class="hero-copy"><span class="hero-label">ESPAÇO DE TRABALHO</span><h1>Cuide do registro.<br><em>Concentre-se na pessoa.</em></h1><p>Organize observações, planejamento e evolução em um só lugar, durante a prática supervisionada.</p><div class="hero-actions">${button('＋ Novo paciente','new-patient','light')}${button('Criar evolução →','go-evolution','outline-light')}</div></div><div class="hero-art" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="hero-flower">✳</div></div></section>${customize}<nav class="desktop-home-custom mobile-home-grid ${homeEditing?'is-editing':''}">${visible.map((item,index)=>homeCard(item,index,visible.length)).join('')}</nav>${hidden}${folders}${links}${discovery}${advisory}<section class="stats"><div class="stat"><span>Pacientes ativos</span><strong>${active.length}</strong></div><div class="stat"><span>Sessões registradas</span><strong>${sessions.length}</strong></div><div class="stat"><span>Planos criados</span><strong>${state.plans.length}</strong></div></section></div>`;
  return mobile+desktop;
}
function evolutionHub(){const patients=state.patients.filter(patient=>!patient.archived),recent=[...state.sessions].filter(row=>row.evolutionDetailed||row.evolutionShort||row.evolution).sort((a,b)=>`${b.date||''}${b.createdAt||''}`.localeCompare(`${a.date||''}${a.createdAt||''}`)).slice(0,8);return `${pageHeader('EVOLUÇÃO CLÍNICA','Criar evolução','Escolha o paciente, registre o que realmente foi realizado e gere um texto clínico editável.')}<section class="evolution-start-guide"><div><b>1</b><span><strong>Selecione o paciente</strong><small>O app abre a sessão sem misturar prontuários.</small></span></div><div><b>2</b><span><strong>Marque o que foi realizado</strong><small>Inclua dose, PA, dor, resposta e intercorrências.</small></span></div><div><b>3</b><span><strong>Gere e revise</strong><small>Os objetivos vêm do catálogo; nenhum achado é inventado.</small></span></div></section><section class="panel"><div class="section-title"><div><span class="eyebrow">COMEÇAR AGORA</span><h2>Para quem é a evolução?</h2></div>${button('＋ Novo paciente','new-patient','small')}</div>${patients.length?`<div class="evolution-patient-list">${patients.map(patient=>`<a href="#sessao/${encodeURIComponent(patient.id)}">${patientAvatar(patient)}<span><small>${esc(patient.code||'PACIENTE')}</small><strong>${esc(patientLabel(patient))}</strong><em>${esc(patient.chiefComplaint||patient.focus||'Foco não registrado')}</em></span><b>Começar →</b></a>`).join('')}</div>`:empty('Nenhum paciente ativo','Cadastre um paciente para criar a evolução.',button('＋ Cadastrar paciente','new-patient','secondary'))}</section>${recent.length?`<section class="panel evolution-recent"><div class="section-title"><div><span class="eyebrow">COMANDOS RÁPIDOS</span><h2>Evoluções recentes</h2></div></div><div>${recent.map(row=>{const patient=state.patients.find(item=>item.id===row.patientId),text=row.evolutionDetailed||row.evolutionShort||row.evolution;return `<article><header><span><small>${formatDate(row.date)}</small><strong>${esc(patientLabel(patient))}</strong></span><em>${row.items?.length||0} exercícios</em></header><p>${esc(short(text,210))}</p><footer><button type="button" data-action="copy-evolution" data-id="${esc(row.id)}">Copiar evolução</button><button type="button" data-action="continue-session" data-id="${esc(row.id)}">Continuar atendimento</button><button type="button" data-action="reuse-session" data-id="${esc(row.id)}">Usar como base</button></footer></article>`}).join('')}</div></section>`:''}<section class="evolution-example"><span>MODELO GERADO</span><p><strong>Data:</strong> 01/10/2026. Paciente compareceu lúcida, orientada e colaborativa. PA inicial: 120/80 mmHg. Iniciada a sessão realizando sentar e levantar — 3 séries de 10 repetições; elevação de panturrilha — 3 séries de 10 repetições. Exercícios realizados visando fortalecimento dos membros inferiores e melhora do desempenho funcional. PA final: 118/78 mmHg. Sessão finalizada sem intercorrências registradas.</p><small>O exemplo demonstra a estrutura. O texto real usa somente os dados preenchidos.</small></section>`;}
function patientsPage() {
  const rows = state.patients.filter(p => (p.archived ? filter === 'arquivados' : filter !== 'arquivados') && (filter === 'arquivados' || `${p.code||''} ${p.name||''} ${p.focus||''} ${p.chiefComplaint||''}`.toLocaleLowerCase('pt-BR').includes(filter.toLocaleLowerCase('pt-BR')))).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  return `${pageHeader('ACOMPANHAMENTO','Pacientes','Use códigos ou apelidos. Evite nomes completos e outros dados identificáveis.',button('＋ Novo paciente','new-patient'))}
  <div class="toolbar"><label class="search"><span>⌕</span><input id="patient-search" type="search" placeholder="Buscar por código ou foco..." value="${esc(filter === 'arquivados'?'':filter)}" aria-label="Buscar pacientes"></label><button class="button ghost" data-action="toggle-archived">${filter==='arquivados'?'Ver ativos':'Ver arquivados'}</button></div>
  <div class="panel list-panel">${rows.length ? `<div class="patient-table"><div class="table-head"><span>Paciente</span><span>Queixa principal</span><span>Cadastro</span><span></span></div>${rows.map(p=>`<a class="patient-row" href="#pacientes/${encodeURIComponent(p.id)}">${patientAvatar(p)}<span class="patient-row-copy"><small>${esc(p.code||'PACIENTE')}</small><strong>${esc(patientLabel(p))}</strong><span>${esc(p.chiefComplaint||p.focus||'Foco não registrado')}</span><em>Atualizado em ${formatDate((p.updatedAt||p.createdAt||p.startDate||today()).slice(0,10))}</em></span><span class="patient-status-pill">${p.archived?'Arquivado':'Em acompanhamento'}</span><b>›</b></a>`).join('')}</div>` : empty('Nenhum registro encontrado',filter==='arquivados'?'Não há pacientes arquivados.':'Cadastre o primeiro paciente ou ajuste a busca.',filter==='arquivados'?'':button('＋ Novo paciente','new-patient','secondary'))}</div>`;
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
const quickTokens=value=>normalized(value).split(/\s+/).filter(token=>token.length>2&&!['para','com','uma','que','como','paciente','sente','quando','quero'].includes(token));
const quickMatches=(text,query)=>{const haystack=normalized(text),tokens=quickTokens(query);return haystack.includes(normalized(query))||tokens.some(token=>haystack.includes(token));};
const allExercises = () => [...catalog, ...conditionExercises, ...state.exercises.map(e=>({id:e.id,name:e.name,category:e.category||'Pessoal',region:e.region||e.category||'Pessoal',objective:e.objective||e.notes||'Exercício registrado pelo usuário.',why:[e.objective||e.notes||'Item do repertório pessoal.'],tags:e.tags?String(e.tags).split(','):['pessoal'],source:e.source,primaryMuscles:Array.isArray(e.primaryMuscles)?e.primaryMuscles:e.primaryMuscles?String(e.primaryMuscles).split(','):[],auxiliaryMuscles:[],steps:Array.isArray(e.steps)?e.steps:e.steps?[e.steps]:['Consulte as anotações próprias e a orientação do supervisor.'],equipment:Array.isArray(e.equipment)?e.equipment:[],progressions:Array.isArray(e.progressions)?e.progressions:[],regressions:Array.isArray(e.regressions)?e.regressions:[],indications:Array.isArray(e.indications)?e.indications:[],commonCompensations:[],commonErrors:[],exampleDose:e.exampleDose||'Definir conforme avaliação e orientação supervisionada.',doseNotes:[e.rest&&`Descanso: ${e.rest}`,'Registro pessoal; revisar antes do uso.'].filter(Boolean).join(' '),care:e.care||'Confirmar adequação, ambiente e resposta individual.',stopWhen:'Interromper diante de resposta preocupante e reavaliar.',functionalApplication:e.functionalApplication||'',clinicalNotes:e.notes||'',difficulty:e.difficulty||'A definir',side:e.side||'A definir',joint:e.joint||'A definir',videoUrl:e.videoUrl||'',capacities:[],custom:true,kind:'exercise'}))];
const favoriteKey = (kind,id) => `${kind}:${id}`;
const isFavorite = (kind,id) => state.favorites.includes(favoriteKey(kind,id));
const favoriteButton = (kind,id,label='Favoritar') => button(isFavorite(kind,id)?'★ Favorito':`☆ ${label}`,'toggle-favorite',isFavorite(kind,id)?'secondary':'ghost',`data-kind="${kind}" data-id="${esc(id)}"`);
const matchExercise = (exercise,query) => quickMatches([exercise.name,exercise.synonyms?.join(' '),exercise.category,exercise.region,exercise.joint,exercise.primaryMuscles?.join(' '),exercise.auxiliaryMuscles?.join(' '),exercise.tags?.join(' '),exercise.problems?.join(' '),exercise.conditions?.join(' '),exercise.goals?.join(' '),exercise.objective].join(' '),query);
const lookupItem = key => {
  const [kind,id]=String(key).split(':');
  const source=kind==='exercise'?allExercises():kind==='muscle'?muscles:kind==='test'?clinicalTests:kind==='scale'?scales:[];
  const item=source.find(x=>x.id===id);
  return item?{kind,item}:null;
};
const librarySections=[
  ['exercicios','Exercícios','↗','Catálogo completo com execução e cuidados','pratica'],['condicoes','Por condições','☑','Joelho, lombar, equilíbrio, pós-operatório e mais','pratica'],['kisner','Kisner ilustrado','▧','Consulta por região e objetivo terapêutico','pratica'],['ortopedia','Ortopedia','✚','Casos, caminhos clínicos e recursos','pratica'],['ombro','Ombro','◉','Avaliação e discussão do manguito','pratica'],['videos','Vídeos','▶','Demonstrações organizadas por região','pratica'],
  ['atlas','Atlas palpatório','☝','Guias de localização e palpação','avaliacao'],['palpacao3d','Palpação 3D','◎','Estruturas superficiais em modelo interativo','avaliacao'],['anatomia3d','Anatomia 3D','◎','Explore músculos, ossos e relações','avaliacao'],['musculos','Músculos','◉','Ações, função e exercícios relacionados','avaliacao'],['testes','Testes clínicos','✓','Objetivo, execução e registro','avaliacao'],['goniometria','Goniometria','∠','Posições, eixos e registros','avaliacao'],['reflexos','Reflexos','⌁','Raízes, respostas e escala de registro','avaliacao'],['escalas','Escalas','≋','Instrumentos e medidas funcionais','avaliacao'],
  ['neuro','Neuro','✦','Atividades filtradas por tarefa e assistência','raciocinio'],['problemas','Problemas funcionais','◇','Possibilidades ligadas à função','raciocinio'],['geral','Fisio Geral','＋','Encontros e queixas comuns','raciocinio'],['condutas','Condutas','→','Raciocínio, metas e reavaliação','raciocinio']
];
const libraryGroups=[['pratica','Exercícios e tratamento'],['avaliacao','Anatomia e avaliação'],['raciocinio','Raciocínio clínico']];
const tabs = active => `<nav class="library-tabs library-directory" aria-label="Todas as áreas da biblioteca">${libraryGroups.map(([group,title])=>`<section><h2>${title}</h2><div>${librarySections.filter(item=>item[4]===group).map(([id,label,icon,description])=>`<a class="${active===id?'active':''}" href="#biblioteca/${id}" ${active===id?'aria-current="page"':''}><i aria-hidden="true">${icon}</i><span><strong>${label}</strong><small>${description}</small></span><b aria-hidden="true">›</b></a>`).join('')}</div></section>`).join('')}</nav>`;
const libraryHero=()=>`<section class="library-native-hero"><span class="eyebrow">CONHECIMENTO CLÍNICO</span><h1>Biblioteca prática</h1><p>Escolha uma área para abrir diretamente o conteúdo.</p><div class="library-hero-stats"><span><strong>${allExercises().length}</strong><small>exercícios</small></span><span><strong>50</strong><small>vídeos</small></span><span><strong>${clinicalTests.length}</strong><small>testes</small></span><button type="button" data-action="go-quick">⌕ <span>Consulta rápida</span></button></div></section>`;
const librarySectionHeader=active=>{const section=librarySections.find(([id])=>id===active)||librarySections[0],label=section[1],icon=section[2],description=section[3];return `<header class="library-subpage-head"><a href="#biblioteca" class="library-back">← Todas as áreas</a><div><i aria-hidden="true">${icon}</i><span><small>BIBLIOTECA</small><h1>${esc(label)}</h1><p>${esc(description)}</p></span></div></header>`;};
const exerciseCard = e => {const visual=exerciseVisual(e);return `<article class="exercise-card rich-card"><a class="exercise-card-visual" href="#exercicio/${encodeURIComponent(e.id)}"><img src="${visual.url}" alt="${esc(visual.alt)}" loading="lazy"><span>${esc(e.category)}</span></a><div class="exercise-card-content"><div class="card-actions"><span class="source-label">${esc(e.region||e.category)}</span><button class="star-button ${isFavorite('exercise',e.id)?'active':''}" data-action="toggle-favorite" data-kind="exercise" data-id="${esc(e.id)}" aria-label="Favoritar">${isFavorite('exercise',e.id)?'★':'☆'}</button></div><h3><a href="#exercicio/${encodeURIComponent(e.id)}">${esc(e.name)}</a></h3><p class="card-objective">${esc(e.objective)}</p><div class="tag-row">${(e.tags||[]).slice(0,3).map(t=>`<span>${esc(t)}</span>`).join('')}</div><a class="text-link" href="#exercicio/${encodeURIComponent(e.id)}">Ver execução e objetivo <b>›</b></a></div></article>`;};

function ensureVideoCatalog(){
  if(videoCatalog||videoCatalogPromise)return;
  videoCatalogError='';
  videoCatalogPromise=Promise.all([fetch('/videos/catalogo.json').then(response=>{if(!response.ok)throw new Error('O catálogo de vídeos não foi encontrado.');return response.json();}),loadExerciseVideos(authState.session)]).then(([rows,uploaded])=>{if(!Array.isArray(rows)||rows.length!==50)throw new Error('O catálogo de vídeos está incompleto.');videoCatalog=[...uploaded,...rows];}).catch(error=>{videoCatalogError=error.message;}).finally(()=>{videoCatalogPromise=null;const [section,id]=route();if(section==='biblioteca'&&id==='videos')render();});
}

function quickResults(query) {
  if (!query.trim()) return '';
  const terms=[query,...quickTokens(query)],unique=rows=>[...new Map(rows.map(item=>[item.id,item])).values()];
  const ex=allExercises().filter(x=>matchExercise(x,query)).slice(0,8);
  const mu=muscles.filter(x=>quickMatches([x.name,x.action,x.function].join(' '),query)).slice(0,5);
  const te=clinicalTests.filter(x=>quickMatches([x.name,x.region,x.objective,x.structure].join(' '),query)).slice(0,5);
  const sc=scales.filter(x=>quickMatches([x.name,x.purpose].join(' '),query)).slice(0,4);
  const ne=allExercises().filter(x=>x.kind==='neuro'&&matchExercise(x,query)).slice(0,5);
  const measures=assessmentMeasures.filter(x=>quickMatches([x.name,x.shortName,x.clinicalQuestion,x.domain,...x.tags].join(' '),query)).slice(0,6);
  const general={complaints:unique(terms.flatMap(term=>generalSearch(term).complaints)).slice(0,5),meetings:unique(terms.flatMap(term=>generalSearch(term).meetings)).slice(0,5)};
  const conduct=unique(terms.flatMap(reasoningSearch)).slice(0,7);
  const groups=[['Testes e medidas',measures,x=>`#medidas/${x.id}`],['Exercícios',ex,x=>`#exercicio/${x.id}`],['Músculos',mu,x=>`#musculo/${x.id}`],['Testes',te,x=>`#teste/${x.id}`],['Escalas',sc,x=>`#biblioteca/escalas`],['Neuro',ne,x=>`#exercicio/${x.id}`],['Queixas comuns',general.complaints,x=>`#queixa/${x.id}`],['Encontros',general.meetings,x=>`#encontro/${x.id}`],['Condutas',conduct,x=>`#conduta/${x.id}`]];
  const total=groups.reduce((n,g)=>n+g[1].length,0);
  return total?`<div class="quick-results-head"><div><small>RESULTADOS PARA</small><h2>“${esc(query)}”</h2></div><span>${total} encontrados</span></div><div class="result-groups quick-result-groups">${groups.filter(g=>g[1].length).map(([title,items,href])=>`<section class="result-group"><h2>${title} <span>${items.length}</span></h2>${items.map(item=>`<a class="quick-result-item" href="${href(item)}"><span class="quick-result-type">${esc(title)}</span><strong>${esc(item.name||item.title)}</strong><small>${esc(item.objective||item.function||item.purpose||item.summary||item.region||'Ficha de consulta')}</small><em>Ver ficha</em><b>→</b></a>`).join('')}</section>`).join('')}</div>`:empty('Nenhum resultado','Tente descrever de outra forma ou use uma das categorias abaixo.');
}
function ensureKisnerCatalog(){
  if(kisnerCatalog||kisnerPromise)return;kisnerError='';
  kisnerPromise=loadKisnerCatalog().then(rows=>{kisnerCatalog=rows;}).catch(error=>{kisnerError=error.message;}).finally(()=>{kisnerPromise=null;const [section,id]=route();if((section==='biblioteca'&&id==='kisner')||section==='kisner')render();});
}
function ensurePalpatoryAtlas(){
  if(palpatoryAtlas||palpatoryAtlasPromise)return;palpatoryAtlasError='';
  palpatoryAtlasPromise=loadPalpatoryAtlas().then(data=>{palpatoryAtlas=data;}).catch(error=>{palpatoryAtlasError=error.message;}).finally(()=>{palpatoryAtlasPromise=null;const [section,id]=route();if((section==='biblioteca'&&id==='atlas')||section==='atlas')render();});
}
function rememberQuickQuery(value){const clean=String(value||'').trim();if(clean.length<2)return;quickHistory=[clean,...quickHistory.filter(item=>normalized(item)!==normalized(clean))].slice(0,6);localStorage.setItem(QUICK_HISTORY_KEY,JSON.stringify(quickHistory));}
function quickPage() {
  const intents=[['search','Quero avaliar','testes funcionais'],['clipboard','Escolher um teste','equilíbrio'],['learn','Entender um achado','marcha'],['strength','Encontrar exercício','fortalecimento'],['book','Documentar','evolução clínica'],['pain','Sinais de atenção','alertas']];
  const categories=[['pain','Dor e sintomas','dor'],['mobility','Mobilidade e ADM','mobilidade'],['strength','Força','força'],['balance','Equilíbrio','equilíbrio'],['gait','Marcha','marcha'],['neuro','Neurologia','neuro'],['respiratory','Respiratória','respiração'],['function','Funcionalidade','funcionalidade']];
  const history=quickHistory.length?`<section class="quick-history"><div class="quick-section-title"><h2>Consultas recentes</h2><button type="button" data-action="clear-quick-history">Limpar</button></div><div>${quickHistory.map(item=>`<button type="button" data-action="quick-term" data-term="${esc(item)}"><span>↻</span>${esc(item)}</button>`).join('')}</div></section>`:'';
  return `<section class="quick-consult-hero"><span class="eyebrow">CONSULTA DURANTE O ATENDIMENTO</span><h1>O que você precisa agora?</h1><p>Descreva com suas palavras, mesmo sem saber o termo técnico.</p><label class="quick-search"><span>${homeIcon('search')}</span><input id="quick-search" name="quickQuery" type="text" value="${esc(quickQuery)}" placeholder="Ex.: paciente manca e sente dor ao apoiar" autocomplete="off"><b>${homeIcon('arrow')}</b></label></section>${quickQuery?quickResults(quickQuery):`<section class="quick-intents"><div class="quick-section-title"><h2>Como posso ajudar?</h2></div><div>${intents.map(([icon,label,term])=>`<button type="button" data-action="quick-term" data-term="${term}"><i>${homeIcon(icon)}</i><span>${label}</span><b>›</b></button>`).join('')}</div></section>${history}<section class="quick-categories"><div class="quick-section-title"><h2>Explore por área</h2></div><div>${categories.map(([icon,label,term])=>`<button type="button" data-action="quick-term" data-term="${term}"><i>${homeIcon(icon)}</i><span>${label}</span></button>`).join('')}</div></section><div class="quick-education-note"><strong>Consulta educacional</strong><p>Os resultados ajudam a encontrar conteúdo do app. Não definem diagnóstico ou prescrição.</p><a href="#mentor">Precisa discutir um caso completo? Abrir Mentor Clínico →</a></div>`}`;
}
function libraryPage(active='inicio') {
  if(active==='inicio')return `${libraryHero()}${tabs('')}`;
  const header=librarySectionHeader(active);
  if(active==='videos'){if(!videoCatalog&&!videoCatalogError)queueMicrotask(ensureVideoCatalog);return header+exerciseVideoUploadPanel(videoUploadDraft)+videoLibraryPage(videoCatalog||[],videoQuery,videoCategory,{loading:!videoCatalog&&!videoCatalogError,error:videoCatalogError});}
  if(active==='condicoes') return header+conditionLibraryPage(allExercises(),conditionQuery,conditionFilter);
  if(active==='kisner'){if(!kisnerCatalog&&!kisnerError)queueMicrotask(ensureKisnerCatalog);return header+kisnerLibraryPage({rows:kisnerCatalog||[],loading:!kisnerCatalog&&!kisnerError,error:kisnerError,query:kisnerQuery,category:kisnerCategory,type:kisnerType,limit:kisnerLimit});}
  if(active==='atlas'){if(!palpatoryAtlas&&!palpatoryAtlasError)queueMicrotask(ensurePalpatoryAtlas);return header+palpatoryAtlasPage({data:palpatoryAtlas,loading:!palpatoryAtlas&&!palpatoryAtlasError,error:palpatoryAtlasError,query:atlasQuery,region:atlasRegion,category:atlasCategory,limit:atlasLimit});}
  if(active==='ortopedia') return header+orthopedicLibrary();
  if(active==='ombro') return header+shoulderDiscussionLibrary();
  if(active==='palpacao3d') return header+palpation3dLibrary();
  if(active==='anatomia3d') return header+anatomy3dLibrary();
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
  return header+`<div class="library-feature-strip"><span>ILUSTRAÇÕES OFFLINE</span><strong>Veja o movimento antes de abrir a ficha</strong><p>As imagens ajudam a reconhecer o exercício; execução e adaptação continuam dependentes da avaliação.</p></div><div class="library-toolbar"><label class="search"><span>⌕</span><input id="library-search" type="search" value="${esc(libraryQuery)}" placeholder="Buscar exercício, região ou objetivo..."></label><select id="library-category" aria-label="Filtrar categoria">${categories.map(c=>`<option ${c===libraryCategory?'selected':''}>${esc(c)}</option>`).join('')}</select>${button('＋ Criar exercício','new-exercise','ghost')}</div><div class="library-result-head"><span><strong>${rows.length}</strong> exercícios encontrados</span><small>Toque em um card para ver objetivo, execução e cuidados.</small></div><div class="exercise-grid visual-exercise-grid">${rows.map(exerciseCard).join('')}</div><p class="exercise-visual-credit">Ilustrações: Workout Guide / Bryl Lim e Everkinetic · CC BY-SA 4.0.</p>`;
}
function anatomy3dLibrary(){
  const cards=palpationGuides.map(item=>`<details class="palpation-card"><summary><span><small>${esc(item.region)}</small><strong>${esc(item.name)}</strong></span><b>＋</b></summary><div><dl><dt>Posição</dt><dd>${esc(item.position)}</dd><dt>Referências</dt><dd>${esc(item.landmarks)}</dd><dt>Confirmar pelo movimento</dt><dd>${esc(item.confirmation)}</dd><dt>Palpação</dt><dd>${esc(item.palpation)}</dd></dl><p><strong>Cuidado:</strong> ${esc(item.caution)}</p></div></details>`).join('');
  return `<section class="anatomy3d-hero"><div><span class="eyebrow">ATLAS INTERATIVO</span><h2>Explore músculos e ossos em 3D</h2><p>Gire o modelo, aproxime com pinça ou roda do mouse e toque em uma estrutura para identificá-la.</p></div><div class="anatomy3d-tips"><span>↻ Arraste para girar</span><span>⌕ Pinça para aproximar</span><span>☝ Toque para identificar</span></div></section><div class="anatomy3d-viewer"><iframe src="/anatomy3d/public/index.html" title="Atlas anatômico tridimensional interativo" loading="lazy" allowfullscreen></iframe><div class="anatomy3d-credit">Modelo Z-Anatomy · visualizador hpfrei · CC BY-SA 4.0</div></div><section class="palpation-guide"><div class="palpation-head"><span><small>ANATOMIA PALPATÓRIA</small><h2>Guias rápidos de localização</h2><p>Use referências ósseas e confirmação pelo movimento. Compare lados quando fizer sentido e sempre obtenha consentimento.</p></span><strong>${palpationGuides.length}<small>guias</small></strong></div><div class="palpation-list">${cards}</div><div class="anatomy-safety"><strong>Referência educacional</strong><p>O modelo e os guias ajudam a estudar localização. Eles não substituem aula prática, supervisão, avaliação clínica nem treinamento de segurança e consentimento.</p></div></section>`;
}
function palpation3dLibrary(){return `<section class="palp3d-hero"><div><span class="eyebrow">SUPERFÍCIE → ESTRUTURA</span><h2>Boneco 3D para anatomia palpatória</h2><p>Gire, aproxime, selecione e isole músculos ou ossos. Depois abra a técnica palpatória correspondente no Atlas.</p></div><a href="#biblioteca/atlas">Abrir guias de palpação →</a></section><div class="palp3d-layout"><section class="palp3d-viewer"><iframe src="https://open-anatomy-atlas.vercel.app" title="Atlas anatômico 3D interativo para estudo palpatório" loading="lazy" allowfullscreen></iframe></section><aside><h3>Como estudar palpação em 3D</h3><ol><li>Selecione a região e deixe pele/estruturas superficiais como referência.</li><li>Isole o osso ou músculo procurado.</li><li>Observe relações, direção das fibras e marcos vizinhos.</li><li>Abra o guia palpatório do app e siga posicionamento e confirmação.</li><li>Pratique somente com consentimento e supervisão.</li></ol><div><strong>Modelo novo</strong><p>Open Anatomy Atlas, construído sobre Z-Anatomy/BodyParts3D. Uso educacional; não substitui prática presencial.</p></div></aside></div>`;}
function shoulderDiscussionLibrary(){const sections=[['1. Entender o problema',['Diferencie dor relacionada ao manguito, tendinopatia calcária, instabilidade, rigidez capsular, lesão traumática e dor referida cervical.','Pergunte início, mecanismo, irritabilidade, dor noturna, perda súbita de força, estalido, luxação, cirurgia, trabalho, esporte e objetivos funcionais.']],['2. Triagem e segurança',['Trauma com deformidade, incapacidade de elevar o braço, febre, vermelhidão importante, dor torácica, perda neurológica progressiva ou suspeita de fratura exigem discussão/encaminhamento.','Observe cervical, escápula e sintomas abaixo do cotovelo quando pertinente.']],['3. Avaliação objetiva',['ADM ativa e passiva: flexão, abdução, rotações e alcance funcional.','Força/isometria: abdução, rotação externa e interna, sempre registrando dor e desempenho.','Use testes provocativos em conjunto; nenhum teste isolado confirma tendinopatia.','Meça função com instrumento autorizado, como SPADI ou QuickDASH, sem reproduzir itens protegidos.']],['4. Reabilitação conservadora',['Educação e ajuste temporário de carga, mantendo atividade tolerável.','Exercício progressivo do manguito e musculatura escapular conforme irritabilidade e resposta.','Recuperação de mobilidade quando limitada e treino de tarefas significativas.','Progredir amplitude, resistência, velocidade e especificidade; reavaliar dor, função e capacidade.']],['5. Discussão do caso',['Qual é a principal limitação funcional?','Quais achados mudariam a conduta?','Que medida será repetida?','Como a dose será ajustada pela resposta?','Quando discutir investigação adicional ou encaminhamento?']]];return `<section class="shoulder-class"><header><span>DISCUSSÃO · 02/10</span><h2>Tendinopatias e lesões do ombro</h2><p>Avaliação e reabilitação conservadora para organizar a discussão com o supervisor.</p></header><nav>${sections.map((section,index)=>`<a href="#shoulder-${index}">${section[0]}</a>`).join('')}</nav>${sections.map((section,index)=>`<section id="shoulder-${index}"><h3>${section[0]}</h3><ul>${section[1].map(text=>`<li>${text}</li>`).join('')}</ul></section>`).join('')}<footer><strong>Princípio central</strong><p>O diagnóstico clínico não deve ser reduzido a um teste especial. Combine história, função, carga, ADM, força, resposta dos sintomas e evolução ao longo do tempo.</p></footer></section>`;}
function muscleLibrary(){
  const regionOf=name=>/quadr|isquio|glute|ilio|adutor/.test(normalized(name))?'Quadril e coxa':/gastro|soleo|tibial|fibular/.test(normalized(name))?'Perna e pé':/delto|supra|infra|subesc|serrat|trapez/.test(normalized(name))?'Ombro e escápula':/biceps|triceps|punho|mao/.test(normalized(name))?'Braço e mão':'Tronco';
  const iconOf=name=>{const n=normalized(name);if(/quadr|joelho/.test(n))return 'M8 5c3 5 4 9 2 14m7-14c-2 5-2 9 1 14M10 12h7';if(/glute|quadril|adutor|ilio/.test(n))return 'M6 5c1 5 3 7 6 8 3-1 5-3 6-8M9 13l-2 7m8-7 2 7';if(/gastro|soleo|tibial|fibular/.test(n))return 'M8 4c4 4 5 8 3 16m5-16c-2 6-1 11 2 16M11 14h6';if(/delto|supra|infra|subesc|serrat|trapez/.test(n))return 'M4 9c4-5 12-5 16 0M8 7l-2 13m10-13 2 13M8 12h8';if(/biceps|triceps|punho|mao/.test(n))return 'M5 8c4 0 5 2 7 5m0 0c3-2 5-5 7-8M12 13l-2 7m2-7 4 7';return 'M12 3v18M7 6c2 3 2 9 0 12m10-12c-2 3-2 9 0 12M7 12h10';};
  const groups=['Quadril e coxa','Perna e pé','Ombro e escápula','Braço e mão','Tronco'];
  const cards=groups.map(region=>`<section class="muscle-region"><div class="muscle-region-head"><span>${region}</span><small>${muscles.filter(m=>regionOf(m.name)===region).length} grupos</small></div><div class="muscle-card-grid">${muscles.filter(m=>regionOf(m.name)===region).map(m=>`<article class="muscle-card"><a class="muscle-card-art" href="#musculo/${m.id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="${iconOf(m.name)}"/></svg><span>${esc(region)}</span></a><div><div class="card-actions"><small>ANATOMIA FUNCIONAL</small><button class="star-button ${isFavorite('muscle',m.id)?'active':''}" data-action="toggle-favorite" data-kind="muscle" data-id="${m.id}" aria-label="Favoritar ${esc(m.name)}">${isFavorite('muscle',m.id)?'★':'☆'}</button></div><h3><a href="#musculo/${m.id}">${esc(m.name)}</a></h3><p>${esc(m.action)}</p><span class="muscle-function">${esc(m.function)}</span><a class="text-link" href="#musculo/${m.id}">Função e exercícios <b>›</b></a></div></article>`).join('')}</div></section>`).join('');
  return `<section class="muscle-intro"><div><span class="eyebrow">ANATOMIA APLICADA</span><h2>Entenda o músculo pela função</h2><p>Explore ação, função prática e exercícios relacionados. Use a divisão por região para consultar durante a avaliação.</p></div><a href="#biblioteca/anatomia3d"><b>◎</b><span><strong>Abrir corpo em 3D</strong><small>Músculos, ossos e palpação</small></span><i>→</i></a></section><nav class="muscle-region-nav">${groups.map(region=>`<a href="#muscle-${normalized(region).replace(/\s+/g,'-')}">${region}</a>`).join('')}</nav>${cards}`;
}

function orthopedicLibrary(){
  const findExercise=name=>allExercises().find(e=>normalized(e.name)===normalized(name))||allExercises().find(e=>normalized(e.name).includes(normalized(name)));
  const caseCards=orthopedicCases.map(item=>{const exercises=item.exerciseNames.map(findExercise).filter(Boolean);return `<details class="ortho-case" id="ortho-${item.id}"><summary><b>${item.icon}</b><span><small>${esc(item.region)}</small><strong>${esc(item.title)}</strong><em>${esc(item.short)}</em></span><i>＋</i></summary><div class="ortho-case-body"><section><h3>Confirmar antes de escolher</h3><ul>${item.confirm.map(text=>`<li>${esc(text)}</li>`).join('')}</ul></section><section><h3>Objetivos possíveis por fase</h3><ul>${item.goals.map(text=>`<li>${esc(text)}</li>`).join('')}</ul></section><div class="ortho-alert"><b>Atenção</b><p>${esc(item.alert)}</p></div><div class="ortho-case-exercises"><div><strong>Exercícios para consultar</strong><small>${exercises.length} fichas relacionadas</small></div><div class="exercise-grid visual-exercise-grid">${exercises.map(exerciseCard).join('')}</div></div></div></details>`}).join('');
  const attendance=`<article class="ortho-attendance-flow"><div><small>ROTEIRO DE ATENDIMENTO ORTOPÉDICO</small><h3>Do acolhimento à evolução</h3></div><ol><li><b>1</b><span><strong>Triagem</strong><small>Trauma, cirurgia, carga, sinais de atenção e restrições.</small></span></li><li><b>2</b><span><strong>Função</strong><small>O que a pessoa não consegue fazer e o que deseja recuperar.</small></span></li><li><b>3</b><span><strong>Medidas</strong><small>Dor, edema, ADM, força, marcha e teste pertinente.</small></span></li><li><b>4</b><span><strong>Conduta testada</strong><small>Registrar exercício, assistência, dose realmente feita e resposta.</small></span></li><li><b>5</b><span><strong>Reavaliar</strong><small>Comparar a mesma medida e levar dúvidas objetivas ao supervisor.</small></span></li></ol></article>`;
  const videos=attendance+orthopedicVideoResources.map(item=>`<a class="ortho-video-card" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer"><b>▶</b><span><small>${esc(item.provider)}</small><strong>${esc(item.title)}</strong><p>${esc(item.topics)}</p></span><i>↗</i></a>`).join('');
  return `<section class="ortho-hero"><div><span class="eyebrow">ORTOPEDIA E TRAUMATOLOGIA</span><h2>Condutas por situação clínica</h2><p>Consulte o que confirmar, objetivos por fase e exercícios relacionados sem transformar o diagnóstico em uma prescrição automática.</p></div><div class="ortho-body-map" aria-hidden="true"><span>OMBRO</span><span>COLUNA</span><span>MÃO</span><span>JOELHO</span><span>TÍBIA</span></div></section><nav class="ortho-case-nav">${orthopedicCases.map(item=>`<a href="#ortho-${item.id}"><b>${item.icon}</b><span>${esc(item.short)}</span></a>`).join('')}</nav><div class="ortho-note"><b>Escolha por fase</b><p>Em pós-operatório e fraturas, confirme procedimento, consolidação, carga, amplitude permitida, órtese e protocolo da equipe antes de usar qualquer ficha.</p></div><section class="ortho-cases"><div class="ortho-section-title"><span><small>GUIAS RÁPIDOS</small><h2>Situações frequentes no estágio</h2></span><strong>${orthopedicCases.length} casos</strong></div>${caseCards}</section><section class="ortho-videos"><div class="ortho-section-title"><span><small>FONTES EXTERNAS</small><h2>Vídeos clínicos institucionais</h2><p>Abra a fonte oficial para assistir. Os vídeos não foram copiados porque pertencem às instituições responsáveis.</p></span></div><div>${videos}</div></section>`;
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
  return `${pageHeader('CONTROLE LOCAL','Dados e privacidade','Controle seus registros e faça cópias de segurança.')}${advisory}<div class="section-grid"><section class="panel settings-card"><div class="settings-icon">⇩</div><h2>Exportar backup v${state.version}</h2><p>Baixe um JSON versionado com todos os registros locais, inclusive testes, reavaliações e programas.</p>${button('Exportar dados','export-data')}</section><section class="panel settings-card"><div class="settings-icon">⇧</div><h2>Importar backup</h2><p>A importação valida a versão e substitui os dados locais atuais. Exporte uma cópia antes.</p><label class="button secondary import-label">Selecionar arquivo<input id="import-file" type="file" accept="application/json,.json" hidden></label></section></div><section class="panel privacy"><span class="eyebrow">PRIVACIDADE</span><h2>Local-first, sincronizado e desidentificado</h2><p>Registros concluídos são salvos neste dispositivo e têm sincronização com a conta quando há conexão. Formulários ainda não concluídos ficam como rascunhos automáticos somente neste dispositivo, separados por conta e paciente, por até 30 dias.</p><p>Prefira “paciente de estudo”, códigos como IL-01 e somente informações necessárias. Não registre CPF, RG ou documentos. Rascunhos e registros locais dependem do armazenamento do navegador; mantenha backups periódicos.</p><p>O arquivo de backup não é criptografado: guarde-o de forma segura.</p><div class="data-count">${state.patients.length} pacientes · ${state.assessments.length} avaliações · ${state.functionalTestResults.length} testes funcionais · ${state.sessions.length} sessões</div></section>`;
}
function modal(title,body,formId) {
  $('#dialog-root').innerHTML = `<div class="modal-backdrop" data-action="close-modal"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-head"><div><span class="eyebrow">FISIO CLÍNICO</span><h2 id="modal-title">${title}</h2></div><button type="button" class="icon-button close" data-action="close-modal" aria-label="Fechar">×</button></div><form id="${formId}"><div class="modal-body">${body}</div><div class="modal-foot"><button type="button" class="button ghost" data-action="close-modal">Cancelar</button><button type="submit" class="button primary">Salvar registro</button></div></form></div></div>`;
  restoreDrafts($('#dialog-root'),activeUserId(),location.hash);
  $('.modal input:not([type=hidden]), .modal textarea, .modal select')?.focus();
}
function closeModal() { $('#dialog-root').innerHTML = ''; }
function patientForm(p) {
  modal(p?'Editar paciente':'Novo paciente',patientFormBody(p||{},today()),'patient-form');
  $('.modal')?.classList.add('patient-form-modal');
  const submit=$('#patient-form .modal-foot .button.primary');
  if(submit)submit.innerHTML=`<span aria-hidden="true">✓</span> ${p?'Salvar alterações':'Criar paciente'}`;
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
function choosePatientForCondition(conditionId){
  if(!state.patients.filter(p=>!p.archived).length){toast('Cadastre um paciente para montar uma sessão.',true);location.hash='pacientes';return;}
  modal('Montar checklist por condição',`${select('Paciente','patientId',state.patients.filter(p=>!p.archived).map(p=>[p.id,patientLabel(p)]))}<input type="hidden" name="conditionId" value="${esc(conditionId)}"><p class="form-hint">O grupo abre como filtro. Revise as possibilidades e adicione somente o que fizer sentido para a avaliação e a fase clínica.</p>`,'choose-condition-form');
}
function sessionFromForm(form){
  return sessionPayloadFromForm(form,id=>allExercises().find(item=>item.id===id),id=>state.goals.find(goal=>goal.id===id));
}

const clockText=milliseconds=>{const total=Math.max(0,Math.floor(milliseconds)),minutes=Math.floor(total/60000),seconds=Math.floor(total%60000/1000),hundredths=Math.floor(total%1000/10);return `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}.${String(hundredths).padStart(2,'0')}`;};
function runClock(timer,selector){if(timer.handle)return;timer.started=performance.now();timer.handle=setInterval(()=>{const element=$(selector);if(element)element.textContent=clockText(timer.elapsed+performance.now()-timer.started);},50);}
function pauseClock(timer,selector){if(timer.handle){timer.elapsed+=performance.now()-timer.started;clearInterval(timer.handle);timer.handle=0;}const element=$(selector);if(element)element.textContent=clockText(timer.elapsed);}
function resetClock(timer,selector){if(timer.handle)clearInterval(timer.handle);Object.assign(timer,{elapsed:0,started:0,handle:0});const element=$(selector);if(element)element.textContent='00:00.00';}
function runTestClock(){
  if(testTimer.handle)return;const box=document.querySelector('.integrated-timer'),mode=box?.dataset.mode||'stopwatch',duration=(Number(box?.dataset.seconds)||0)*1000;testTimer.started=performance.now();testTimer.mode=mode;testTimer.duration=duration;
  testTimer.handle=setInterval(()=>{const elapsed=testTimer.elapsed+performance.now()-testTimer.started,shown=mode==='countdown'?Math.max(0,duration-elapsed):elapsed;const output=$('#test-timer');if(output)output.textContent=clockText(shown);if(mode==='countdown'&&shown<=0)pauseTestClock();},50);
}
function pauseTestClock(){if(testTimer.handle){testTimer.elapsed+=performance.now()-testTimer.started;clearInterval(testTimer.handle);testTimer.handle=0;}const shown=testTimer.mode==='countdown'?Math.max(0,testTimer.duration-testTimer.elapsed):testTimer.elapsed;const output=$('#test-timer');if(output)output.textContent=clockText(shown);const time=document.querySelector('#functional-test-form [name="time"]');if(time&&!time.value&&testTimer.mode==='stopwatch')time.value=(testTimer.elapsed/1000).toFixed(2);}
function resetTestClock(){if(testTimer.handle)clearInterval(testTimer.handle);const box=document.querySelector('.integrated-timer'),duration=(Number(box?.dataset.seconds)||0)*1000;Object.assign(testTimer,{elapsed:0,started:0,handle:0,duration,mode:box?.dataset.mode||'stopwatch'});const output=$('#test-timer');if(output)output.textContent=clockText(testTimer.mode==='countdown'?duration:0);}

function updateSessionTotal(){
  const total=[...document.querySelectorAll('[name^="minutes-"]')].reduce((sum,field)=>sum+(Number(field.value)||0),0);
  const output=$('#session-total');if(output)output.textContent=`${total} min`;
}

function formValues(form) { return Object.fromEntries(new FormData(form).entries()); }
function commitDraft(form){clearFormDraft(form,activeUserId(),location.hash);}
function rapidCareHasContent(form){const data=new FormData(form);return ['focus','painScore','exercise','responseKind','response','observation','pain','vitals','rom','strength','balance','gait','test'].some(name=>String(data.get(name)||'').trim());}
function persistRapidCareForm(form){const payload=formValues(form),rapidData=new FormData(form);payload.painRegions=rapidData.getAll('painRegion');payload.painCharacteristics=rapidData.getAll('painCharacteristic');payload.evolutionDetailed=buildRapidEvolution(payload);if(payload.painRegions.length||payload.pain?.trim())addRecord(state,'painMaps',{patientId:payload.patientId,date:payload.date,regions:payload.painRegions,characteristics:payload.painCharacteristics,irradiationChange:payload.irradiationChange||'',notes:payload.pain||''});addRecord(state,'quickCareSessions',payload);addRecord(state,'sessions',{patientId:payload.patientId,date:payload.date,summary:payload.focus||'Atendimento',interventions:payload.exercise||'',response:[payload.responseKind,payload.response].filter(Boolean).join(' — '),evolutionDetailed:payload.evolutionDetailed});if(payload.supervisorQuestion?.trim())addRecord(state,'supervisorQuestions',{patientId:payload.patientId,date:payload.date,question:payload.supervisorQuestion,status:'Pendente'});return payload;}
function inRange(value) { return value === '' || (Number.isInteger(Number(value)) && Number(value)>=0 && Number(value)<=10); }
document.addEventListener('submit', async event => {
  const form=event.target;if(!form.id?.endsWith('-form')&&!form.id?.startsWith('rapid-care-form-'))return;event.preventDefault();
  if(form.id==='mentor-chat-form')return;
  const authValues=formValues(form);
  if(form.id==='exercise-video-analyze-form'){const file=form.elements.video.files?.[0];if(!file){toast('Selecione um vídeo.',true);return;}videoUploadDraft={file,previewUrl:URL.createObjectURL(file),analysis:null,loading:true,publishing:false,error:''};render();try{const analysis=await analyzeExerciseVideo(file,authState.session.access_token,authValues.context);videoUploadDraft={...videoUploadDraft,analysis,loading:false};render();}catch(error){videoUploadDraft={...videoUploadDraft,loading:false,error:error.message};render();}return;}
  if(form.id==='exercise-video-publish-form'){if(!videoUploadDraft.file){toast('Selecione o vídeo novamente.',true);return;}videoUploadDraft={...videoUploadDraft,publishing:true,error:''};render();try{const analysis={nome:authValues.nome,regiao_ou_categoria:authValues.regiao_ou_categoria,descricao:authValues.descricao,objetivos:authValues.objetivos,orientacoes:authValues.orientacoes,musculos:authValues.musculos,equipamentos:authValues.equipamentos,dosagem_mencionada_no_video:authValues.dosagem_mencionada_no_video,cuidados:authValues.cuidados};await publishExerciseVideo({file:videoUploadDraft.file,analysis,session:authState.session});if(videoUploadDraft.previewUrl)URL.revokeObjectURL(videoUploadDraft.previewUrl);videoUploadDraft={file:null,previewUrl:'',analysis:null,loading:false,publishing:false,error:''};videoCatalog=null;toast('Vídeo publicado na sua biblioteca.');ensureVideoCatalog();render();}catch(error){videoUploadDraft={...videoUploadDraft,publishing:false,error:error.message};render();}return;}
  if(form.id==='express-evolution-form'){
    const entries=String(authValues.exercises||'').split(/\n|;/).map(item=>item.trim().replace(/[.;]+$/,'')).filter(Boolean);
    if(!entries.length){toast('Informe ao menos um exercício e a dose realizada.',true);return;}
    const date=new Date().toLocaleDateString('pt-BR'),presentation=String(authValues.presentation||'lúcida, orientada e colaborativa').trim(),ending=String(authValues.ending||'Sessão finalizada sem intercorrências.').trim();
    const initial=String(authValues.bpInitial||'').trim(),final=String(authValues.bpFinal||'').trim(),goals=evolutionGoalsFromEntries(entries,allExercises());
    const text=`${date}. Paciente compareceu ${presentation}. ${initial?`PA inicial: ${initial} mmHg. `:''}Iniciada a sessão realizando ${entries.join('; ')}. Exercícios realizados visando ${goalsSentence(goals)}. ${final?`PA final: ${final} mmHg. `:''}${ending}`.replace(/\s+/g,' ').trim();
    const output=form.querySelector('#express-evolution-output');if(output){output.value=text;output.focus();output.scrollIntoView({behavior:'smooth',block:'center'});}return;
  }
  if(form.id==='login-form'){try{authState.message='';await activateSession(await signIn({email:authValues.email,password:authValues.password,remember:form.elements.remember.checked}));location.hash='inicio';}catch(error){authState.message=error.message;render();}return;}
  if(form.id==='signup-form'){if(authValues.password!==authValues.passwordConfirm){authState.message='As senhas não coincidem.';render();return;}try{const result=await signUp({email:authValues.email,password:authValues.password,displayName:authValues.displayName});if(result.access_token){await activateSession(persistSession(result,true));location.hash='inicio';}else{authState.message='Conta criada. Confirme o e-mail antes de entrar.';location.hash='login';render();}}catch(error){authState.message=error.message;render();}return;}
  if(form.id==='password-reset-form'){try{await requestPasswordReset(authValues.email);authState.message='Confira seu e-mail para redefinir a senha.';location.hash='login';render();}catch(error){authState.message=error.message;render();}return;}
  if(form.id==='change-password-form'){if(authValues.password!==authValues.passwordConfirm){toast('As senhas não coincidem.',true);return;}try{await changePassword(authState.session,authValues.password);form.reset();toast('Senha alterada com segurança.');}catch(error){toast(error.message,true);}return;}
  if(form.id==='home-link-form'){const label=String(authValues.label||'').trim(),url=String(authValues.url||'').trim();if(!label){toast('Informe um nome para o link.',true);return;}if(!/^https?:\/\//i.test(url)){toast('O endereço deve começar com http:// ou https://.',true);return;}const prefs=homePrefs();prefs.links.push({id:crypto.randomUUID?.()||`link-${Date.now()}`,label,url,description:String(authValues.description||'').trim()});saveHomePrefs(prefs);closeModal();render();toast('Link adicionado à Home.');return;}
  if(form.id==='home-folder-form'){const data=new FormData(form),name=String(data.get('name')||'').trim(),itemIds=data.getAll('itemIds').filter(id=>HOME_ITEMS.some(item=>item.id===id));if(!name){toast('Informe um nome para a pasta.',true);return;}if(!itemIds.length){toast('Selecione ao menos um atalho para a pasta.',true);return;}const prefs=homePrefs();prefs.folders.push({id:crypto.randomUUID?.()||`folder-${Date.now()}`,name,itemIds});saveHomePrefs(prefs);closeModal();render();toast('Pasta adicionada à Home.');return;}
  if(form.id==='voice-structure-form'){const selected=new FormData(form).getAll('structuredField'),fields={};for(const name of selected){const el=form.querySelector(`[data-structured-name="${CSS.escape(name)}"]`);fields[name]={...voiceStructureDraft.fields[name],value:el?.value.trim()||''};const targetField=document.querySelector(`#main [name="${CSS.escape(name)}"]`);if(targetField&&el?.value.trim())targetField.value+=(targetField.value?'\n':'')+el.value.trim();}const patientId=document.querySelector('#main [name="patientId"]')?.value||'';addRecord(state,'voiceStructuredRecords',{patientId,sourceText:voiceStructureDraft.sourceText,fields});saveState(state);closeModal();toast('Ficha estruturada confirmada e salva.');return;}
  if(form.id==='article-search-form'){const query=String(authValues.query||'').trim(),year=Number(authValues.year)||new Date().getFullYear()-5,openAccess=form.elements.openAccess.checked;articleDraft={query,year,openAccess,results:[],searched:false,loading:true};render();try{const params=new URLSearchParams({q:query,year:String(year),oa:openAccess?'1':'0'}),response=await fetch(`/api/articles?${params}`,{headers:{Authorization:`Bearer ${authState.session.access_token}`}}),contentType=response.headers.get('content-type')||'',payload=contentType.includes('application/json')?await response.json():{};if(!response.ok||!Array.isArray(payload.results))throw new Error(payload.error||'A busca científica não está disponível nesta versão publicada.');articleDraft={query,year,openAccess,results:payload.results,total:payload.total||0,source:payload.source||'',searched:true,loading:false};render();}catch(error){articleDraft={query,year,openAccess,results:[],searched:true,loading:false,error:error.message};render();}return;}
  if(form.id==='learning-tool-form'){const tool=authValues.tool,mode=authValues.mode,raw=Object.fromEntries(Object.entries(authValues).filter(([key])=>!['tool','mode','patientId','aiConsent'].includes(key))),input=JSON.stringify(raw);try{const history=[...(learningDraft.history||[])];if(mode==='simulation-reply'&&learningDraft.result?.primaryOutput)history.push({role:'assistant',content:learningDraft.result.primaryOutput});learningDraft={...learningDraft,tool,patientId:authValues.patientId,input:raw.input||'',loading:true,history};render();const response=await fetch('/api/learning-tool',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${authState.session.access_token}`},body:JSON.stringify({mode,input,memory:learningDraft.memory||'',history})}),payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error(payload.error||'Não foi possível gerar a atividade.');if(mode==='simulation-reply')history.push({role:'user',content:raw.input||''});const finished=mode==='simulation-feedback'||mode==='exam-grade';learningDraft={...learningDraft,loading:false,result:payload.result,memory:payload.result.memory||learningDraft.memory||'',history,finished};addRecord(state,'learningToolRecords',{patientId:authValues.patientId||'',tool,mode,input:raw,result:payload.result});saveState(state);render();toast('Resultado salvo para uso offline.');}catch(error){learningDraft.loading=false;toast(error.message,true);render();}return;}
  if(form.id==='clinical-mentor-form'){const intent=event.submitter?.value||'analyze';if(intent==='save'){if(!authValues.patientId){toast('Selecione um paciente para salvar a análise.',true);return;}if(!mentorDraft.result){toast('Gere a análise antes de salvar.',true);return;}addRecord(state,'clinicalMentorCases',{patientId:authValues.patientId,caseText:mentorDraft.caseText,goal:mentorDraft.goal,result:mentorDraft.result});saveState(state);toast('Análise educacional salva no paciente.');return;}try{mentorDraft={patientId:authValues.patientId,caseText:authValues.caseText,goal:authValues.goal,loading:true};render();const response=await fetch('/api/clinical-mentor',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${authState.session.access_token}`},body:JSON.stringify({caseText:authValues.caseText,goal:authValues.goal})}),payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error(payload.error||'Não foi possível analisar o caso.');mentorDraft={...mentorDraft,loading:false,result:payload.result};render();}catch(error){mentorDraft.loading=false;toast(error.message,true);render();}return;}
  if(form.id.startsWith('rapid-care-form-')){if(!rapidCareHasContent(form)){toast('Registre ao menos uma informação clínica antes de salvar.',true);return;}persistRapidCareForm(form);clearFormDraft(form,activeUserId(),location.hash);saveState(state);toast('Atendimento salvo e evolução gerada sem acrescentar dados.');render();return;}
  if(form.id==='session-builder-form'){
    try{const payload=sessionFromForm(form);addRecord(state,'sessions',payload);sessionDrafts.delete(payload.patientId);clearFormDraft(form,activeUserId(),location.hash);clearSessionPlan(activeUserId(),payload.patientId);saveState(state);toast('Sessão concluída e evolução gerada.');location.hash=`pacientes/${payload.patientId}`;}catch(error){toast(error.message,true);}return;
  }
  const values=formValues(form);
  if(form.id==='assessment-assistant-form'){
    const data=new FormData(form),intent=event.submitter?.value||'analyze';values.findings=data.getAll('findings');assistantDraft={...assistantDraft,...values,findings:values.findings};
    if(intent==='detect'){assistantDraft.detected=detectPossibleFindings(values.caseText).map(item=>item.findingId);assistantDraft.analysis=null;render();return;}
    assistantDraft.analysis=suggestionEngine(values);
    if(intent==='save'){if(!values.patientId){toast('Selecione um paciente para salvar; o modo sem paciente continua disponível para consulta.',true);render();return;}addRecord(state,'assessmentAssistantCases',{...values,detected:assistantDraft.detected,questions:assistantDraft.analysis.questions,suggestions:assistantDraft.analysis.suggestions.map(item=>item.measureId)});commitDraft(form);saveState(state);toast('Caso e achados confirmados salvos neste dispositivo.');}
    render();return;
  }
  if(form.id==='functional-test-form'){
    const data=new FormData(form),safetyFlags=data.getAll('safetyFlags');if(safetyFlags.length&&!data.get('safetyReviewed')){toast('Revise a informação de segurança e confirme avaliação/supervisão antes de prosseguir.',true);return;}
    try{const measure=assessmentMeasures.find(item=>item.id===values.testId);const calculation=calculateMeasureResult(values.testId,values);const payload={...values,...calculation,safetyFlags,safetyReviewed:data.get('safetyReviewed')||'',summary:buildTestSummary(measure,values,calculation),contextSnapshot:Object.fromEntries(['pace','timedDistance','device','assistance','side','chairHeight','footwear'].map(key=>[key,values[key]||'']))};if(values.patientId){addRecord(state,'functionalTestResults',payload);measurePreview=null;commitDraft(form);saveState(state);toast('Resultado salvo neste dispositivo.');location.hash=`testes-funcionais/${values.testId}?patient=${values.patientId}`;}else{measurePreview={measureId:values.testId,...payload};toast('Resultado calculado. Selecione um paciente para salvar.');render();}}catch(error){toast(error.message,true);}return;
  }
  if(form.id==='goal-form'){addRecord(state,'goals',values);commitDraft(form);saved();return;}
  if(form.id==='discharge-form'){if(!values.report?.trim())values.report=buildDischargeReport(values);addRecord(state,'discharges',values);commitDraft(form);saved();return;}
  if(form.id==='functional-model-form'){addRecord(state,'functionalModels',values);commitDraft(form);saved();return;}
  if(form.id==='neuro-assessment-form'){addRecord(state,'neuroAssessments',values);commitDraft(form);saved();return;}
  if(form.id==='pediatric-assessment-form'){addRecord(state,'pediatricAssessments',values);commitDraft(form);saved();return;}
  if(form.id==='home-program-form'){
    const fd=new FormData(form),ids=fd.getAll('exerciseIds');if(!ids.length){toast('Selecione ao menos um exercício.',true);return;}
    values.items=ids.map(exerciseId=>{const exercise=allExercises().find(item=>item.id===exerciseId);return {exerciseId,name:exercise?.name||'Exercício'};});
    addRecord(state,'homePrograms',values);commitDraft(form);saved();return;
  }
  if(form.id==='clinical-assessment-form'){
    const clinical=clinicalAssessmentFromForm(new FormData(form));
    if(!inRange(values.pain)){toast('Informe dor entre 0 e 10.',true);return;}
    if(!assessmentHasContent(clinical)&&!values.complaint?.trim()){toast('Registre ao menos um achado ou uma queixa avaliada.',true);return;}
    const payload={patientId:values.patientId,date:values.date,type:values.type||'Estruturada',pain:values.pain,complaint:values.complaint||'',function:values.function||'',clinical,findings:buildAssessmentSummary(clinical)};
    try{addRecord(state,'assessments',payload);commitDraft(form);closeModal();saved();}catch(error){toast(error.message,true);}
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
    try{addRecord(state,'assessments',values);commitDraft(form);closeModal();saved();}catch(error){toast(error.message,true);}
    return;
  }
  if(form.id==='case-discussion-form'){if(!values.caseCode.trim()){toast('Informe um código desidentificado.',true);return;}addRecord(state,'caseDiscussions',values);commitDraft(form);saveState(state);toast('Roteiro de discussão salvo.');render();return;}
  if(form.id==='repertoire-form'){if(!values.name.trim()){toast('Informe o nome do grupo.',true);return;}if(values.id){const r=state.repertoires.find(x=>x.id===values.id);if(r)Object.assign(r,{name:values.name,notes:values.notes,items:new FormData(form).getAll('keepItem')});}else addRecord(state,'repertoires',{name:values.name,notes:values.notes,items:[]});commitDraft(form);closeModal();saved();return;}
  if(form.id==='add-repertoire-form'){try{addToRepertoire(state,values.repertoireId,values.itemKey);closeModal();saved();}catch(error){toast(error.message,true);}return;}
  if(form.id==='goniometry-form'){addRecord(state,'goniometryRecords',values);commitDraft(form);closeModal();saved();return;}
  if(form.id==='patient-goniometry-form'){
    const reference=goniometry.find(item=>item.id===values.goniometryId);
    const patient=state.patients.find(item=>item.id===values.patientId);
    addRecord(state,'goniometryRecords',{...values,patientCode:patientLabel(patient),joint:reference?.joint||'',movement:reference?.movement||'',source:'manual'});
    commitDraft(form);closeModal();saved();return;
  }
  if(form.id==='choose-session-form'){const draft=sessionDrafts.get(values.patientId)||{selected:[],query:''};if(values.exerciseId&&!draft.selected.includes(values.exerciseId))draft.selected.push(values.exerciseId);sessionDrafts.set(values.patientId,draft);closeModal();location.hash=`sessao/${values.patientId}`;return;}
  if(form.id==='choose-condition-form'){const draft={selected:[],query:'',conditionId:values.conditionId};sessionDrafts.set(values.patientId,draft);saveSessionPlan(activeUserId(),values.patientId,draft);closeModal();location.hash=`sessao/${values.patientId}`;return;}
  if(['assessment-form','session-form'].includes(form.id)&&!['pain','painBefore','painAfter'].every(k=>!(k in values)||inRange(values[k]))){toast('Informe dor entre 0 e 10.',true);return;}
  if(form.id==='patient-form'){
    values.studyPatient=form.elements.studyPatient?.checked?'sim':'';
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
  commitDraft(form);closeModal();saved();
});
document.addEventListener('click',event=>{const link=event.target.closest('.muscle-region-nav a,.ortho-quick-nav a,.ortho-case-nav a');if(!link)return;event.preventDefault();let target=null;if(link.closest('.ortho-quick-nav,.ortho-case-nav'))target=document.querySelector(link.getAttribute('href'));else target=[...document.querySelectorAll('.muscle-region')].find(section=>section.querySelector('.muscle-region-head span')?.textContent===link.textContent);if(target?.tagName==='DETAILS')target.open=true;target?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});});
document.addEventListener('dragstart',event=>{const card=event.target.closest('[data-home-id]');if(!card||!homeEditing)return;homeDragId=card.dataset.homeId;card.classList.add('is-dragging');event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',homeDragId);});
document.addEventListener('dragend',event=>{event.target.closest('[data-home-id]')?.classList.remove('is-dragging');homeDragId='';document.querySelectorAll('.is-drag-over').forEach(item=>item.classList.remove('is-drag-over'));});
document.addEventListener('dragover',event=>{const card=event.target.closest('[data-home-id]');if(!card||!homeEditing||card.dataset.homeId===homeDragId)return;event.preventDefault();card.classList.add('is-drag-over');});
document.addEventListener('dragleave',event=>event.target.closest('[data-home-id]')?.classList.remove('is-drag-over'));
document.addEventListener('drop',event=>{const card=event.target.closest('[data-home-id]');if(!card||!homeEditing)return;event.preventDefault();const source=homeDragId||event.dataTransfer.getData('text/plain'),destination=card.dataset.homeId,prefs=homePrefs(),from=prefs.order.indexOf(source),to=prefs.order.indexOf(destination);if(from>=0&&to>=0&&from!==to){prefs.order.splice(to,0,prefs.order.splice(from,1)[0]);saveHomePrefs(prefs);render();}});
let homePointerDrag=null;
document.addEventListener('pointerdown',event=>{const card=event.target.closest('[data-home-id]');if(!card||!homeEditing||event.target.closest('button'))return;homePointerDrag={source:card.dataset.homeId,target:card.dataset.homeId,x:event.clientX,y:event.clientY,card};card.setPointerCapture?.(event.pointerId);});
document.addEventListener('pointermove',event=>{if(!homePointerDrag)return;if(Math.hypot(event.clientX-homePointerDrag.x,event.clientY-homePointerDrag.y)<8)return;event.preventDefault();homePointerDrag.card.classList.add('is-dragging');document.querySelectorAll('.is-drag-over').forEach(item=>item.classList.remove('is-drag-over'));const card=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-home-id]');if(card&&card.dataset.homeId!==homePointerDrag.source){homePointerDrag.target=card.dataset.homeId;card.classList.add('is-drag-over');}});
document.addEventListener('pointerup',()=>{if(!homePointerDrag)return;const {source,target}=homePointerDrag;homePointerDrag.card.classList.remove('is-dragging');document.querySelectorAll('.is-drag-over').forEach(item=>item.classList.remove('is-drag-over'));homePointerDrag=null;if(source===target)return;const prefs=homePrefs(),from=prefs.order.indexOf(source),to=prefs.order.indexOf(target);if(from>=0&&to>=0){prefs.order.splice(to,0,prefs.order.splice(from,1)[0]);saveHomePrefs(prefs);render();}});
document.addEventListener('click',async event=>{
  const target=event.target.closest('[data-action]');if(!target)return;
  const action=target.dataset.action,id=target.dataset.id;
  if(action==='download-category'){downloadsCategory=target.dataset.category||'Todos';render();return;}
  if(action==='article-example'){articleDraft={...articleDraft,query:target.dataset.query||''};render();queueMicrotask(()=>$('#article-search-form input[name="query"]')?.focus());return;}
  if(action==='cancel-video-analysis'){if(videoUploadDraft.previewUrl)URL.revokeObjectURL(videoUploadDraft.previewUrl);videoUploadDraft={file:null,previewUrl:'',analysis:null,loading:false,publishing:false,error:''};render();return;}
  if(action==='video-to-chat'){openMentorChatWithPrompt(`Quero discutir este exercício do catálogo:\n\nNome: ${target.dataset.name||''}\nObjetivo catalogado: ${target.dataset.objective||''}\nOrientações catalogadas: ${target.dataset.guidance||''}\n\nExplique quando ele pode ser considerado, o que avaliar antes, principais cuidados, regressões e progressões, sem prescrever automaticamente.`);return;}
  if(action==='delete-uploaded-video'){const row=videoCatalog?.find(item=>item.id===id);if(!row||!confirm(`Excluir o vídeo “${row.nome}”?`))return;try{await deleteExerciseVideo(row,authState.session);videoCatalog=videoCatalog.filter(item=>item.id!==id);render();toast('Vídeo excluído da sua biblioteca.');}catch(error){toast(error.message,true);}return;}
  if(action==='remember-article'){const row=articleDraft.results?.[Number(target.dataset.index)];if(!row)return;const added=saveArticlesToMemory([row]);render();toast(added?'Artigo incorporado à memória do Chat.':'Este artigo já estava na memória.');return;}
  if(action==='remember-article-results'){const added=saveArticlesToMemory(articleDraft.results||[]);render();toast(added?`${added} artigo(s) incorporado(s) à memória do Chat.`:'Todos estes artigos já estavam na memória.');return;}
  if(action==='remove-article-memory'){const memory=loadArticleMemory(),row=memory[Number(target.dataset.index)];if(!row)return;state.articleMemory=memory.filter(item=>(item.doi||item.id||item.title)!==(row.doi||row.id||row.title));localStorage.removeItem(articleMemoryKey());saveState(state);render();toast('Artigo removido da memória.');return;}
  if(action==='clear-article-memory'){if(!confirm('Limpar todos os artigos usados como memória pelo Chat?'))return;state.articleMemory=[];localStorage.removeItem(articleMemoryKey());saveState(state);render();toast('Memória científica limpa.');return;}
  if(action==='enable-daily-tips'){if(!('Notification'in window)){toast('Este navegador não oferece notificações.',true);return;}const permission=await Notification.requestPermission();if(permission!=='granted'){toast('Permissão de notificações não concedida.',true);return;}localStorage.setItem('fisio-daily-tips','1');await showDailyTip(true);render();toast('Dicas diárias ativadas neste dispositivo.');return;}
  if(action==='copy-express-evolution'){const text=$('#express-evolution-output')?.value.trim();if(!text){toast('Gere a evolução primeiro.',true);return;}navigator.clipboard.writeText(text).then(()=>toast('Evolução copiada.')).catch(()=>toast('Não foi possível copiar.',true));return;}
  if(action==='express-evolution-chat'){const text=$('#express-evolution-output')?.value.trim(),raw=$('#express-evolution-form [name="exercises"]')?.value.trim();openMentorChatWithPrompt(`Revise esta evolução sem inventar informações e mantenha linguagem clínica objetiva:\n\n${text||raw||''}`);return;}
  if(action==='toggle-home-edit'){homeEditing=!homeEditing;render();return;}
  if(action==='new-home-link'){modal('Adicionar link à Home',`${input('Nome do atalho *','label','text','','required maxlength="50"')}${input('Endereço *','url','url','','required placeholder="https://..."')}${input('Descrição','description','text','','maxlength="90"')}`,'home-link-form');return;}
  if(action==='new-home-folder'){modal('Criar pasta na Home',`${input('Nome da pasta *','name','text','','required maxlength="40"')}<fieldset class="home-folder-options"><legend>Atalhos dentro da pasta</legend>${HOME_ITEMS.map(item=>`<label><input type="checkbox" name="itemIds" value="${item.id}"><span>${homeIcon(item.icon)} ${esc(item.label)}</span></label>`).join('')}</fieldset>`,'home-folder-form');return;}
  if(action==='home-hide'){const prefs=homePrefs();if(!prefs.hidden.includes(id))prefs.hidden.push(id);saveHomePrefs(prefs);render();return;}
  if(action==='home-show'){const prefs=homePrefs();prefs.hidden=prefs.hidden.filter(item=>item!==id);saveHomePrefs(prefs);render();return;}
  if(action==='home-move'){const prefs=homePrefs(),index=prefs.order.indexOf(id),next=target.dataset.direction==='up'?index-1:index+1;if(index>=0&&next>=0&&next<prefs.order.length){[prefs.order[index],prefs.order[next]]=[prefs.order[next],prefs.order[index]];saveHomePrefs(prefs);render();}return;}
  if(action==='delete-home-link'){const prefs=homePrefs();prefs.links=prefs.links.filter(link=>link.id!==id);saveHomePrefs(prefs);render();return;}
  if(action==='delete-home-folder'){const prefs=homePrefs();prefs.folders=prefs.folders.filter(folder=>folder.id!==id);saveHomePrefs(prefs);render();return;}
  if(action==='continue-session'||action==='reuse-session'){const row=state.sessions.find(item=>item.id===id);if(!row?.patientId){toast('Não foi possível localizar o paciente desta evolução.',true);return;}const items=Array.isArray(row.items)?row.items:[];if(!items.length){location.hash=`sessao/${row.patientId}`;toast('Sessão antiga aberta sem exercícios para reutilizar.');return;}const selected=items.map(item=>item.exerciseId).filter(exerciseId=>allExercises().some(exercise=>exercise.id===exerciseId)),draft={selected,query:''};if(action==='reuse-session')draft.prefill=Object.fromEntries(items.map(item=>[item.exerciseId,{block:item.block,plannedSets:item.actualSets||item.plannedSets,plannedReps:item.actualReps||item.plannedReps,plannedTime:item.actualTime||item.plannedTime,plannedLoad:item.actualLoad||item.plannedLoad,plannedRest:item.plannedRest,plannedSide:item.actualSide||item.plannedSide,minutes:item.minutes}]));sessionDrafts.set(row.patientId,draft);saveSessionPlan(activeUserId(),row.patientId,draft);location.hash=`sessao/${row.patientId}`;toast(action==='reuse-session'?'Última sessão usada como base. Revise tudo antes de registrar.':'Atendimento reaberto com os mesmos exercícios e doses em branco.');return;}
  if(action==='kisner-more'){kisnerLimit+=60;render();return;}
  if(action==='atlas-more'){atlasLimit+=48;render();return;}
  if(action==='atlas-region'){atlasRegion=target.dataset.region||'Todas';atlasLimit=48;render();return;}
  if(action==='kisner-evolution'){const dose=$('#kisner-dose-value')?.value.trim(),output=$('#kisner-evolution-output');if(!dose){toast('Registre a dose realmente executada antes de gerar o rascunho.',true);$('#kisner-dose-value')?.focus();return;}if(output){output.value=String(target.dataset.template||'Realizado exercício (dose executada: ___).').replace(/___/g,dose);output.focus();}return;}
  if(action==='evolution-to-chat'){const form=target.closest('form'),field=form?.elements.evolution;if(!form||!field)return;let draft;try{draft=sessionFromForm(form).evolutionDetailed;}catch(error){toast(error.message,true);return;}field.value=draft;openMentorChatWithPrompt(`Revise esta evolução fisioterapêutica sem inventar fatos. Preserve os nomes, doses, sinais vitais, respostas e intercorrências. Relacione benefícios somente quando constarem no catálogo de exercícios do app:\n\n${draft}`);toast('Rascunho preparado no Chat. Revise os dados antes de enviar.');return;}
  if(action==='reset-learning-tool'){learningDraft={tool:route()[1]||'',history:[]};render();return;}
  if(action==='learning-example'){const field=$('#learning-tool-form [name="input"]');if(field){field.value=target.dataset.example||'';field.focus();field.dispatchEvent(new Event('input',{bubbles:true}));}return;}
  if(action==='finish-simulation'){const form=$('#learning-tool-form'),input=form?.elements.input;if(input)input.value='Encerrar entrevista e receber feedback.';if(form?.elements.mode)form.elements.mode.value='simulation-feedback';form?.requestSubmit();return;}
  if(action==='copy-learning-result'){const result=learningDraft.result,text=[result?.primaryOutput,...(result?.sections||[]).flatMap(s=>[s.title,s.content,...s.items])].filter(Boolean).join('\n\n');navigator.clipboard.writeText(text).then(()=>toast('Resultado copiado.')).catch(()=>toast('Não foi possível copiar.',true));return;}
  if(action==='copy-mentor-writing'){const text=mentorDraft.result?.clinicalWritingDraft||'';navigator.clipboard.writeText(text).then(()=>toast('Rascunho copiado.')).catch(()=>toast('Não foi possível copiar.',true));return;}
  if(action==='resolve-sync-conflict'){const conflict=state.syncConflicts.find(row=>row.id===id),choice=target.dataset.choice;if(!conflict)return;const selected=choice==='cloud'?conflict.cloud:conflict.local,rows=state[conflict.collection];if(Array.isArray(rows)){const index=rows.findIndex(row=>row.id===conflict.recordId);if(index>=0)rows[index]=selected;else rows.push(selected);}state.syncConflicts=state.syncConflicts.filter(row=>row.id!==id);saved();return;}
  if(action==='logout'){await signOut(authState.session);authState={ready:true,session:null,profile:null,message:''};state=emptyState();currentStorage=localStorage;location.hash='login';render();return;}
  if(action==='sync-cloud'){try{const result=await syncCloudState(state,authState.session);saveLocalState(state,currentStorage);toast(`${result.synced} paciente(s) sincronizado(s)${result.conflicts?` · ${result.conflicts} conflito(s) para revisar`:''}.`);render();}catch(error){toast(error.message,true);}return;}
  if(action==='open-rapid-patients'){const a=$('#rapid-a')?.value||'',b=$('#rapid-b')?.value||'',mode=target.dataset.mode||'individual';if(!a){toast('Selecione ao menos o paciente A.',true);return;}if(mode==='duplo'&&a===b){toast('Selecione pacientes diferentes para os registros A e B.',true);return;}location.hash=`atendimento-rapido?mode=${mode}&a=${encodeURIComponent(a)}${mode==='duplo'&&b?`&b=${encodeURIComponent(b)}`:''}`;return;}
  if(action==='save-rapid-all'){const forms=[...document.querySelectorAll('.rapid-pane')].filter(rapidCareHasContent);if(!forms.length){toast('Preencha ao menos um dos registros antes de salvar.',true);return;}forms.forEach(form=>{persistRapidCareForm(form);clearFormDraft(form,activeUserId(),location.hash);});saveState(state);toast(`${forms.length} registro(s) preenchidos foram salvos.`);render();return;}
  if(action==='rapid-conduct'){const field=target.closest('form')?.elements.exercise,value=target.dataset.value;if(field){const selected=target.classList.toggle('selected'),parts=field.value.split(';').map(item=>item.trim()).filter(Boolean),next=selected?[...parts.filter(item=>item!==value),value]:parts.filter(item=>item!==value);field.value=next.join('; ');target.setAttribute('aria-pressed',String(selected));field.dispatchEvent(new Event('input',{bubbles:true}));field.focus();}return;}
  if(action==='rapid-preset'){const field=target.closest('form')?.elements[target.dataset.target];field?.focus();return;}
  if(action==='rapid-timer'){const form=target.closest('form'),output=form?.querySelector('.rapid-timer-output'),key=form?.dataset.patient;clearInterval(rapidTimers.get(key));let remaining=Number(target.dataset.seconds)*1000,last=performance.now();const handle=setInterval(()=>{const now=performance.now();remaining=Math.max(0,remaining-(now-last));last=now;if(output){const total=Math.ceil(remaining/1000);output.textContent=`${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;}if(!remaining){clearInterval(handle);rapidTimers.delete(key);}},200);rapidTimers.set(key,handle);return;}
  if(action==='route-patient'){const patient=document.querySelector('[name="routePatient"]')?.value;if(!patient){toast('Selecione o paciente.',true);return;}location.hash=`${target.dataset.route}/${patient}`;return;}
  if(action==='test-timer-start'){runTestClock();return;}
  if(action==='test-timer-pause'||action==='test-timer-finish'){pauseTestClock();return;}
  if(action==='test-timer-reset'){resetTestClock();return;}
  if(action==='copy-test-summary'){const row=state.functionalTestResults.find(item=>item.id===id);if(!row?.summary){toast('Resumo indisponível.',true);return;}navigator.clipboard.writeText(row.summary).then(()=>toast('Resumo copiado para apoiar a evolução.')).catch(()=>toast('Não foi possível copiar.',true));return;}
  if(action==='tool-start'){runClock(toolTimer,'#tool-stopwatch');return;}
  if(action==='tool-pause'){pauseClock(toolTimer,'#tool-stopwatch');return;}
  if(action==='tool-reset'){resetClock(toolTimer,'#tool-stopwatch');toolTimer.laps=[];const list=$('#tool-laps');if(list)list.innerHTML='';return;}
  if(action==='tool-lap'){const elapsed=toolTimer.elapsed+(toolTimer.handle?performance.now()-toolTimer.started:0);toolTimer.laps.push(elapsed);const list=$('#tool-laps');if(list)list.innerHTML=toolTimer.laps.map((lap,index)=>`<li>Volta ${index+1}: ${clockText(lap)}</li>`).join('');return;}
  if(action==='timer-preset'){const field=document.querySelector('[name="timerSeconds"]');if(field)field.value=target.dataset.seconds;const output=$('#tool-countdown');if(output)output.textContent=clockText(Number(target.dataset.seconds)*1000).slice(0,5);return;}
  if(action==='timer-start'){clearInterval(countdownHandle);let remaining=Math.max(1,Number(document.querySelector('[name="timerSeconds"]')?.value)||30)*1000,last=performance.now();const output=$('#tool-countdown');countdownHandle=setInterval(()=>{const now=performance.now();remaining=Math.max(0,remaining-(now-last));last=now;if(output)output.textContent=clockText(remaining).slice(0,5);if(remaining<=0)clearInterval(countdownHandle);},100);return;}
  if(action==='metronome-toggle'){if(metronomeHandle){clearInterval(metronomeHandle);metronomeHandle=0;$('#metronome-beat')?.classList.remove('active');return;}const bpm=Math.max(30,Math.min(240,Number(document.querySelector('[name="metronomeBpm"]')?.value)||80));const beat=()=>{const dot=$('#metronome-beat');dot?.classList.add('active');setTimeout(()=>dot?.classList.remove('active'),80);try{const context=new AudioContext(),osc=context.createOscillator(),gain=context.createGain();gain.gain.value=.03;osc.frequency.value=880;osc.connect(gain).connect(context.destination);osc.start();osc.stop(context.currentTime+.04);}catch{}};beat();metronomeHandle=setInterval(beat,60000/bpm);return;}
  if(action==='count-rep'){manualReps++;const output=$('#manual-reps');if(output)output.textContent=manualReps;return;}
  if(action==='count-lap'){manualLaps++;const output=$('#manual-laps');if(output)output.textContent=manualLaps;return;}
  if(action==='count-reset'){manualReps=manualLaps=0;if($('#manual-reps'))$('#manual-reps').textContent='0';if($('#manual-laps'))$('#manual-laps').textContent='0';return;}
  if(action==='generate-discharge'){const form=target.closest('form'),report=form?.elements.report;if(report)report.value=buildDischargeReport(formValues(form));return;}
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
  if(action==='go-evolution')location.hash='evolucao';
  if(action==='quick-term'){quickQuery=target.dataset.term||'';rememberQuickQuery(quickQuery);render();}
  if(action==='clear-quick-history'){quickHistory=[];localStorage.removeItem(QUICK_HISTORY_KEY);render();return;}
  if(action==='toggle-archived'){filter=filter==='arquivados'?'':'arquivados';render();}
  if(action==='toggle-favorite'){const added=toggleFavorite(state,favoriteKey(target.dataset.kind,id));saveState(state);toast(added?'Adicionado aos favoritos.':'Removido dos favoritos.');render();}
  if(action==='new-repertoire')repertoireForm();
  if(action==='edit-repertoire')repertoireForm(state.repertoires.find(x=>x.id===id));
  if(action==='add-repertoire')addRepertoireForm(target.dataset.kind,id);
  if(action==='add-session')choosePatientForSession(id);
  if(action==='condition-start'){choosePatientForCondition(target.dataset.condition);return;}
  if(action==='record-gonio')gonioForm(id);
  if(action==='delete-case'){state.caseDiscussions=state.caseDiscussions.filter(x=>x.id!==id);saveState(state);toast('Roteiro excluído.');render();}
  if(action==='session-add-exercise'){const [,patientId]=route();const draft=sessionDrafts.get(patientId)||{selected:[],query:''};if(!draft.selected.includes(id))draft.selected.push(id);sessionDrafts.set(patientId,draft);saveSessionPlan(activeUserId(),patientId,draft);render();}
  if(action==='session-condition'){const [,patientId]=route();const draft=sessionDrafts.get(patientId)||{selected:[],query:''};draft.conditionId=target.dataset.condition||'';draft.query='';sessionDrafts.set(patientId,draft);saveSessionPlan(activeUserId(),patientId,draft);render();return;}
  if(action==='session-add-condition'){const [,patientId]=route(),conditionId=target.dataset.condition,draft=sessionDrafts.get(patientId)||{selected:[],query:'',conditionId};for(const exercise of conditionExercises.filter(item=>item.conditions.includes(conditionId)))if(!draft.selected.includes(exercise.id))draft.selected.push(exercise.id);draft.conditionId=conditionId;sessionDrafts.set(patientId,draft);saveSessionPlan(activeUserId(),patientId,draft);render();toast('Grupo adicionado. Remova o que não for pertinente.');return;}
  if(action==='session-remove-exercise'){const [,patientId]=route();const draft=sessionDrafts.get(patientId);if(draft){draft.selected=draft.selected.filter(x=>x!==id);saveSessionPlan(activeUserId(),patientId,draft);}render();}
  if(action==='session-move-up'||action==='session-move-down'){
    const [,patientId]=route();const draft=sessionDrafts.get(patientId);const index=draft?.selected.indexOf(id)??-1;
    const next=action==='session-move-up'?index-1:index+1;
    if(draft&&index>=0&&next>=0&&next<draft.selected.length){[draft.selected[index],draft.selected[next]]=[draft.selected[next],draft.selected[index]];saveSessionPlan(activeUserId(),patientId,draft);render();}
  }
  if(action==='generate-evolution'){
    const form=target.closest('form');const field=form?.elements.evolution;if(!form||!field)return;
    const previous=field.value;field.value='';
    try{const payload=sessionFromForm(form);field.value=payload.evolutionDetailed;const evidence=form.querySelector('#evolution-evidence');if(evidence){const facts=payload.evolutionEvidence.facts.map(item=>`<li>${esc(item)}</li>`).join(''),missing=payload.evolutionEvidence.missing.map(item=>`<li>${esc(item)}</li>`).join('');evidence.innerHTML=`<section><strong>Fatos usados</strong><ul>${facts||'<li>Nenhum fato de execução confirmado.</li>'}</ul></section><section><strong>Campos ausentes</strong><ul>${missing||'<li>Nenhuma ausência essencial detectada.</li>'}</ul></section><p><b>Rascunho pendente de revisão profissional.</b></p>`;}field.focus();saveFormDraft(form,activeUserId(),location.hash);toast('Rascunho gerado. Revise antes de salvar.');}catch(error){field.value=previous;toast(error.message,true);}
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
  if(event.target.form)saveFormDraft(event.target.form,activeUserId(),location.hash);
  if(event.target.id==='patient-search'){filter=event.target.value;rerenderField('#patient-search',pos);}
  if(event.target.id==='quick-search'){quickQuery=event.target.value;rerenderField('#quick-search',pos);}
  if(event.target.id==='library-search'){libraryQuery=event.target.value;rerenderField('#library-search',pos);}
  if(event.target.id==='condition-search'){conditionQuery=event.target.value;rerenderField('#condition-search',pos);}
  if(event.target.id==='downloads-search'){downloadsQuery=event.target.value;rerenderField('#downloads-search',pos);}
  if(event.target.id==='video-search'){videoQuery=event.target.value;rerenderField('#video-search',pos);}
  if(event.target.id==='kisner-search'){kisnerQuery=event.target.value;kisnerLimit=60;rerenderField('#kisner-search',pos);}
  if(event.target.id==='atlas-search'){atlasQuery=event.target.value;atlasLimit=48;rerenderField('#atlas-search',pos);}
  if(event.target.id==='session-search'){const [,patientId]=route();const draft=sessionDrafts.get(patientId);if(draft){draft.query=event.target.value;saveSessionPlan(activeUserId(),patientId,draft);rerenderField('#session-search',pos);}}
  if(event.target.id==='global-search'){quickQuery=event.target.value;if(location.hash!=='#consulta')location.hash='consulta';else render();}
  if(event.target.name?.startsWith('minutes-'))updateSessionTotal();
});
document.addEventListener('change',async event=>{
  if(event.target.form)saveFormDraft(event.target.form,activeUserId(),location.hash);
  if(event.target.id==='quick-search'){rememberQuickQuery(event.target.value);return;}
  if(event.target.id==='library-category'){libraryCategory=event.target.value;render();return;}
  if(event.target.id==='condition-filter'){conditionFilter=event.target.value;render();return;}
  if(event.target.matches('[data-session-done]')){const form=event.target.closest('form'),id=event.target.dataset.id,status=form?.elements[`status-${id}`],card=event.target.closest('.session-exercise');if(status)status.value=event.target.checked?'realizado':'nao_avaliado';card?.classList.toggle('is-done',event.target.checked);saveFormDraft(form,activeUserId(),location.hash);return;}
  if(event.target.name?.startsWith('status-')){const form=event.target.form,id=event.target.name.slice(7),check=event.target.closest('.session-exercise')?.querySelector('[data-session-done]'),done=['realizado','parcial'].includes(event.target.value);if(check)check.checked=event.target.value==='realizado';event.target.closest('.session-exercise')?.classList.toggle('is-done',done);saveFormDraft(form,activeUserId(),location.hash);return;}
  if(event.target.id==='downloads-category'){downloadsCategory=event.target.value;render();return;}
  if(event.target.id==='video-category'){videoCategory=event.target.value;render();return;}
  if(event.target.id==='kisner-category'){kisnerCategory=event.target.value;kisnerLimit=60;render();return;}
  if(event.target.id==='kisner-type'){kisnerType=event.target.value;kisnerLimit=60;render();return;}
  if(event.target.id==='atlas-category'){atlasCategory=event.target.value;atlasLimit=48;render();return;}
  if(event.target.name==='neuroObjective'||event.target.name==='neuroPosition'||event.target.name==='neuroAssistance'){const key=event.target.name.replace('neuro','');neuroFilters[key.charAt(0).toLowerCase()+key.slice(1)]=event.target.value;render();return;}
  if(event.target.id!=='import-file'||!event.target.files?.[0])return;
  try{const {validateState}=await import('./store.js');const next=validateState(JSON.parse(await event.target.files[0].text()));if(!confirm('Substituir todos os dados locais pelos dados do arquivo selecionado?'))return;state=next;saveState(state);toast('Backup importado.');render();}catch(error){toast(`Arquivo inválido: ${error.message}`,true);}
});
document.addEventListener('voice-transcribed',event=>{if(event.detail?.fieldName==='quickQuery'){rememberQuickQuery(event.detail.text);return;}voiceStructureDraft=structureTranscript(event.detail?.text||'');$('#dialog-root').innerHTML=voiceStructurePreview(voiceStructureDraft);});
window.addEventListener('hashchange',()=>{scrollPageTop();render();});
window.addEventListener('online',async()=>{updateNetwork();if(authState.session)try{await syncCloudState(state,authState.session);saveLocalState(state,currentStorage);render();toast('Dados atualizados e disponíveis offline.');}catch(error){toast(`Sincronização pendente: ${error.message}`,true);}});
window.addEventListener('offline',updateNetwork);
function updateNetwork(){ $('#network-status').textContent=navigator.onLine?'Disponível offline':'Modo offline'; }
async function showDailyTip(force=false){if(localStorage.getItem('fisio-daily-tips')!=='1'||Notification.permission!=='granted'||!authState.session)return;const date=new Date().toISOString().slice(0,10);if(!force&&localStorage.getItem('fisio-daily-tip-date')===date)return;try{const response=await fetch('/api/daily-tip',{headers:{Authorization:`Bearer ${authState.session.access_token}`}}),tip=await response.json();if(!response.ok)return;const registration=await navigator.serviceWorker?.ready;const options={body:tip.body,icon:'/icons/icon-192.png',badge:'/icons/icon-192.png',data:{url:'#artigos'},tag:`fisio-tip-${date}`};if(registration)await registration.showNotification(tip.title,options);else new Notification(tip.title,options);localStorage.setItem('fisio-daily-tip-date',date);}catch{}}
const INSTALL_REMIND_KEY='fisio-install-remind-after';
const isStandalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
function closeInstallInvite(remind=true){document.querySelector('.install-invite')?.remove();if(remind)localStorage.setItem(INSTALL_REMIND_KEY,String(Date.now()+7*24*60*60*1000));}
function showInstallInvite(force=false){
  if(isStandalone()||document.querySelector('.install-invite'))return;
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent),canInstall=Boolean(deferredInstall);
  if(!force&&!canInstall&&!ios)return;
  if(!force&&Date.now()<Number(localStorage.getItem(INSTALL_REMIND_KEY)||0))return;
  const modal=document.createElement('div');modal.className='install-invite';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','install-title');
  modal.innerHTML=`<div class="install-invite-card"><button class="install-close" type="button" aria-label="Fechar">×</button><div class="install-app-icon"><img src="/icons/icon-192.png" alt=""></div><span>USE COMO APLICATIVO</span><h2 id="install-title">Instale o Fisio Clínico</h2><p>Acesse mais rápido pela tela inicial, use em tela cheia e mantenha recursos disponíveis mesmo com conexão instável.</p><div class="install-benefits"><span>✓ Abre como app</span><span>✓ Acesso rápido</span><span>✓ Conteúdo offline</span></div>${ios?'<div class="ios-install-guide"><b>No iPhone ou iPad:</b><span>1. Toque em Compartilhar <strong>⇧</strong></span><span>2. Escolha “Adicionar à Tela de Início”</span></div>':'<button class="install-primary" type="button">Baixar e instalar agora</button>'}<button class="install-later" type="button">Agora não</button></div>`;
  document.body.append(modal);requestAnimationFrame(()=>modal.classList.add('show'));
  modal.querySelector('.install-close').onclick=()=>closeInstallInvite();modal.querySelector('.install-later').onclick=()=>closeInstallInvite();
  const primary=modal.querySelector('.install-primary');if(primary)primary.onclick=async()=>{if(!deferredInstall)return;deferredInstall.prompt();const result=await deferredInstall.userChoice;if(result.outcome==='accepted')closeInstallInvite(false);else closeInstallInvite();deferredInstall=undefined;$('#install-button').hidden=true;};
}
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstall=event;$('#install-button').hidden=false;setTimeout(()=>showInstallInvite(),1800);});
window.addEventListener('appinstalled',()=>{closeInstallInvite(false);deferredInstall=undefined;$('#install-button').hidden=true;});
$('#install-button').addEventListener('click',()=>showInstallInvite(true));
function showUpdate(registration){if(document.querySelector('.update-banner'))return;const banner=document.createElement('div');banner.className='update-banner';banner.innerHTML='<span>Nova versão disponível</span><button class="button light" type="button">Atualizar agora</button>';banner.querySelector('button').onclick=()=>registration.waiting?.postMessage({type:'SKIP_WAITING'});document.body.append(banner);}
if('serviceWorker'in navigator)navigator.serviceWorker.register('/sw.js').then(registration=>{if(registration.waiting)showUpdate(registration);registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)showUpdate(registration);});});navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload());}).catch(()=>{});
function accountStorage(session){const id=sessionUser(session).sub;return {getItem:key=>localStorage.getItem(`${key}:${id}`),setItem:(key,value)=>localStorage.setItem(`${key}:${id}`,value),removeItem:key=>localStorage.removeItem(`${key}:${id}`)};}
async function requestPersistentStorage(){try{if(navigator.storage?.persist)await navigator.storage.persist();}catch{}}
async function activateSession(session){authState.session=session;currentStorage=accountStorage(session);state=loadState(currentStorage);authState.ready=true;requestPersistentStorage();render();showDailyTip();const [profile,snapshots,workspace]=await Promise.all([getProfile(session),loadCloudSnapshots(session),loadCloudWorkspace(session)]);authState.profile=profile;mergeCloudSnapshots(state,snapshots);mergeCloudWorkspace(state,workspace);saveLocalState(state,currentStorage);render();}
async function initializeAccount(){try{const session=await restoreSession();if(session)await activateSession(session);else{authState.ready=true;render();}}catch(error){authState={ready:true,session:null,profile:null,message:`Não foi possível restaurar a sessão: ${error.message}`};render();}}
async function loadAdminCases(){adminRows=[];try{adminRows=await loadCloudSnapshots(authState.session,true);}catch(error){toast(error.message,true);}render();}
if('scrollRestoration'in history)history.scrollRestoration='manual';
scrollPageTop();updateNetwork();render();initializeAccount();setTimeout(()=>showInstallInvite(),2600);
setInterval(()=>showDailyTip(),60*60*1000);
