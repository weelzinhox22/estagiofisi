import { patientLabel } from './clinical-workflow.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const date=value=>value?new Date(`${String(value).slice(0,10)}T12:00:00`).toLocaleDateString('pt-BR'):'Não informado';
const isoDay=value=>String(value||'').slice(0,10);
const dayDiff=(from,to=new Date())=>{const start=new Date(`${isoDay(from)}T12:00:00`);return Number.isNaN(start.getTime())?0:Math.floor((to-start)/86400000);};
const latest=(rows=[])=>[...rows].sort((a,b)=>`${b.date||''}${b.createdAt||''}`.localeCompare(`${a.date||''}${a.createdAt||''}`))[0];
const patientRows=(state,key,id)=>state[key].filter(row=>row.patientId===id);

export function patientJourney(state,patient){
  const assessments=patientRows(state,'assessments',patient.id);
  const plans=patientRows(state,'plans',patient.id);
  const goals=patientRows(state,'goals',patient.id);
  const sessions=patientRows(state,'sessions',patient.id);
  const programs=patientRows(state,'homePrograms',patient.id);
  const activeGoals=goals.filter(goal=>!['atingido','suspenso'].includes(goal.status));
  const pendingEvolutions=sessions.filter(session=>(session.evolutionDetailed||session.evolution)&&session.evolutionReviewStatus!=='revisado');
  const lastSession=latest(sessions);
  const steps=[
    {id:'avaliacao',label:'Avaliação',done:assessments.length>0,href:`#pacientes/${patient.id}/avaliacao`},
    {id:'objetivos',label:'Objetivos',done:goals.length>0,href:`#reavaliacao/${patient.id}`},
    {id:'plano',label:'Plano',done:plans.length>0,href:`#pacientes/${patient.id}/plano`},
    {id:'sessao',label:'Sessão',done:sessions.length>0,href:`#sessao/${patient.id}`},
    {id:'evolucao',label:'Evolução revisada',done:sessions.some(row=>row.evolutionReviewStatus==='revisado'),href:`#pacientes/${patient.id}/evolucoes`},
    {id:'domiciliar',label:'Orientação',done:programs.length>0,href:`#domiciliar/${patient.id}`}
  ];
  const alerts=[];
  if(!assessments.length)alerts.push({level:'warning',text:'Avaliação ainda não registrada.',href:`#pacientes/${patient.id}/avaliacao`});
  else if(!goals.length)alerts.push({level:'warning',text:'Faltam objetivos funcionais estruturados.',href:`#reavaliacao/${patient.id}`});
  else if(!plans.length)alerts.push({level:'info',text:'Plano de tratamento ainda não registrado.',href:`#pacientes/${patient.id}/plano`});
  if(pendingEvolutions.length)alerts.push({level:'warning',text:`${pendingEvolutions.length} evolução(ões) aguardando revisão profissional.`,href:`#pacientes/${patient.id}/evolucoes`});
  const overdue=activeGoals.filter(goal=>goal.deadline&&goal.deadline<new Date().toLocaleDateString('sv-SE'));
  if(overdue.length)alerts.push({level:'warning',text:`${overdue.length} objetivo(s) com revisão vencida.`,href:`#reavaliacao/${patient.id}`});
  if(lastSession&&dayDiff(lastSession.date)>30)alerts.push({level:'info',text:`Última sessão registrada há ${dayDiff(lastSession.date)} dias.`,href:`#pacientes/${patient.id}/sessoes`});
  const next=steps.find(step=>!step.done)||steps[3];
  return {assessments,plans,goals,sessions,programs,activeGoals,pendingEvolutions,lastSession,steps,alerts,next,progress:Math.round(steps.filter(step=>step.done).length/steps.length*100)};
}

function journeyStrip(journey){
  return `<ol class="journey-strip" aria-label="Etapas do acompanhamento">${journey.steps.map((step,index)=>`<li class="${step.done?'is-done':step.id===journey.next.id?'is-current':''}"><a href="${step.href}"><span aria-hidden="true">${step.done?'✓':index+1}</span><strong>${esc(step.label)}</strong><small>${step.done?'Registrado':step.id===journey.next.id?'Próxima ação':'Pendente'}</small></a></li>`).join('')}</ol>`;
}

function alertsList(alerts){
  if(!alerts.length)return '<div class="clinical-clear"><span aria-hidden="true">✓</span><div><strong>Fluxo em dia</strong><p>Nenhuma pendência estrutural detectada nos registros.</p></div></div>';
  return `<div class="clinical-alert-list">${alerts.map(item=>`<a class="clinical-alert clinical-alert--${item.level}" href="${item.href}"><span aria-hidden="true">${item.level==='warning'?'!':'i'}</span><strong>${esc(item.text)}</strong><b aria-hidden="true">›</b></a>`).join('')}</div>`;
}

function patientCard(state,patient){
  const journey=patientJourney(state,patient),last=journey.lastSession;
  return `<article class="clinical-patient-card"><header><div><small>${esc(patient.code||'PACIENTE')}</small><h2>${esc(patientLabel(patient))}</h2><p>${esc(patient.chiefComplaint||patient.focus||'Foco não registrado')}</p></div><span class="progress-ring" style="--progress:${journey.progress}" aria-label="${journey.progress}% da jornada estruturada"><b>${journey.progress}%</b></span></header><div class="mini-journey" aria-label="Progresso da jornada">${journey.steps.map(step=>`<span class="${step.done?'done':''}" title="${esc(step.label)}">${step.done?'✓':'•'}</span>`).join('')}</div><dl><div><dt>Objetivos ativos</dt><dd>${journey.activeGoals.length}</dd></div><div><dt>Última sessão</dt><dd>${last?date(last.date):'Nenhuma'}</dd></div><div><dt>Pendências</dt><dd>${journey.alerts.length}</dd></div></dl><footer><a class="button primary small" href="${journey.next.href}">${esc(journey.next.done?'Iniciar sessão':`Continuar: ${journey.next.label}`)}</a><a class="button ghost small" href="#pacientes/${patient.id}">Abrir prontuário</a></footer></article>`;
}

export function clinicalDashboardPage(state,conditionPrograms=[]){
  const patients=state.patients.filter(patient=>!patient.archived);
  const journeys=patients.map(patient=>({patient,journey:patientJourney(state,patient)}));
  const pending=journeys.reduce((sum,row)=>sum+row.journey.alerts.length,0);
  const reviews=journeys.reduce((sum,row)=>sum+row.journey.pendingEvolutions.length,0);
  const activeGoals=journeys.reduce((sum,row)=>sum+row.journey.activeGoals.length,0);
  return `<section class="clinical-dashboard-hero"><div><span class="eyebrow">CENTRAL CLÍNICA</span><h1>Seu atendimento, do início à evolução</h1><p>Veja a próxima ação de cada paciente e mantenha avaliação, objetivos, sessão e reavaliação no mesmo fluxo.</p><div class="hero-actions"><a class="button primary" href="#pacientes">Abrir pacientes</a><button class="button secondary" type="button" data-action="new-patient">＋ Novo acompanhamento</button></div></div><div class="dashboard-summary" aria-label="Resumo do acompanhamento"><article><span>Pacientes ativos</span><strong>${patients.length}</strong></article><article><span>Objetivos ativos</span><strong>${activeGoals}</strong></article><article><span>Evoluções a revisar</span><strong>${reviews}</strong></article><article><span>Pendências do fluxo</span><strong>${pending}</strong></article></div></section>
  <section class="dashboard-primary-grid"><div class="panel"><div class="section-title"><div><span class="eyebrow">CONTINUAR ATENDIMENTOS</span><h2>Próxima ação por paciente</h2></div></div>${patients.length?`<div class="clinical-patient-grid">${patients.map(patient=>patientCard(state,patient)).join('')}</div>`:'<div class="empty"><h3>Nenhum paciente ativo</h3><p>Cadastre um acompanhamento para iniciar a jornada clínica.</p><button class="button primary" data-action="new-patient">Cadastrar paciente</button></div>'}</div>
  <aside class="dashboard-side"><section class="panel"><div class="section-title"><div><span class="eyebrow">ATENÇÃO</span><h2>Pendências</h2></div></div>${alertsList(journeys.flatMap(({patient,journey})=>journey.alerts.map(alert=>({...alert,text:`${patientLabel(patient)}: ${alert.text}`}))).slice(0,8))}</section><section class="panel"><div class="section-title"><div><span class="eyebrow">ATALHOS</span><h2>Rotina clínica</h2></div></div><nav class="clinical-shortcuts"><a href="#evolucao"><span>✎</span><strong>Criar evolução</strong><small>A partir do checklist</small></a><a href="#biblioteca/condicoes"><span>☑</span><strong>Modelos de atendimento</strong><small>${conditionPrograms.length} contextos para revisar</small></a><a href="#reavaliacao"><span>↻</span><strong>Reavaliar</strong><small>Objetivos e medidas</small></a><a href="#domiciliar"><span>⌂</span><strong>Orientação domiciliar</strong><small>Programa revisado</small></a></nav></section></aside></section>`;
}

export function patientJourneyPanel(state,patient){
  const journey=patientJourney(state,patient);
  return `<section class="patient-journey-panel panel"><div class="section-title"><div><span class="eyebrow">JORNADA DO PACIENTE</span><h2>Próximos passos</h2></div><span class="journey-percent">${journey.progress}% estruturado</span></div>${journeyStrip(journey)}<div class="journey-bottom"><div><h3>O que precisa de atenção</h3>${alertsList(journey.alerts)}</div><div class="next-action-card"><span>PRÓXIMA AÇÃO</span><strong>${esc(journey.next.label)}</strong><p>Continue do ponto em que o acompanhamento parou.</p><a class="button primary" href="${journey.next.href}">Continuar jornada</a></div></div></section>`;
}

export function patientPortalPage(state,patientId,exerciseLookup){
  const patient=state.patients.find(row=>row.id===patientId);
  if(!patient)return '<div class="empty"><h3>Paciente não encontrado</h3><a href="#pacientes">Voltar</a></div>';
  const programs=patientRows(state,'homePrograms',patientId).sort((a,b)=>`${b.date||''}${b.createdAt||''}`.localeCompare(`${a.date||''}${a.createdAt||''}`));
  const program=programs[0],checkins=patientRows(state,'patientCheckins',patientId).filter(row=>!program||row.programId===program.id).sort((a,b)=>`${b.date||''}${b.createdAt||''}`.localeCompare(`${a.date||''}${a.createdAt||''}`));
  return `<div class="portal-shell"><header class="portal-header"><a href="#pacientes/${patient.id}">← Voltar ao prontuário</a><span>MODO DO PACIENTE</span><h1>Olá, ${esc(patient.name||patient.code||'paciente')}</h1><p>Marque apenas o que você fez em casa. Este registro não substitui a avaliação do fisioterapeuta.</p></header>${program?`<section class="portal-program"><div class="portal-program-title"><div><span>ORIENTAÇÃO MAIS RECENTE</span><h2>${esc(program.title||'Programa domiciliar')}</h2><p>Orientado em ${date(program.date)}</p></div><a class="button secondary small" href="#domiciliar/${patient.id}">Ver orientação profissional</a></div><form id="patient-checkin-form"><input type="hidden" name="patientId" value="${esc(patient.id)}"><input type="hidden" name="programId" value="${esc(program.id)}"><div class="portal-exercise-list">${(program.items||[]).map((item,index)=>{const exercise=exerciseLookup(item.exerciseId)||item;return `<fieldset class="portal-exercise"><legend><span>${index+1}</span><strong>${esc(exercise.name||item.name||'Exercício')}</strong></legend><p>${esc([program.sets&&`${program.sets} séries`,program.reps&&`${program.reps} repetições`,program.duration,program.frequency].filter(Boolean).join(' · ')||'Dose não informada pelo fisioterapeuta')}</p><div class="portal-statuses"><label><input type="radio" name="status-${esc(item.exerciseId)}" value="realizado"><span>✓ Fiz</span></label><label><input type="radio" name="status-${esc(item.exerciseId)}" value="parcial"><span>◐ Fiz parcialmente</span></label><label><input type="radio" name="status-${esc(item.exerciseId)}" value="nao_realizado"><span>— Não fiz</span></label></div><div class="form-grid"><label class="field"><span>Dificuldade percebida</span><select name="difficulty-${esc(item.exerciseId)}"><option value="">Não informada</option><option>Fácil</option><option>Adequada</option><option>Difícil</option></select></label><label class="field"><span>Dor percebida (0–10)</span><input type="number" name="pain-${esc(item.exerciseId)}" min="0" max="10" step="1"></label></div><label class="field"><span>Comentário opcional</span><input name="note-${esc(item.exerciseId)}" maxlength="180" placeholder="Conte o que aconteceu, sem tentar interpretar"></label></fieldset>`;}).join('')}</div><label class="field"><span>Data do registro</span><input type="date" name="date" value="${new Date().toLocaleDateString('sv-SE')}" required></label><div class="portal-consent"><input type="checkbox" name="confirmReport" required><span>Confirmo que estas respostas são meu relato e serão revisadas pelo fisioterapeuta.</span></div><button class="button primary portal-submit" type="submit">Enviar relato ao fisioterapeuta</button></form></section>`:`<section class="panel portal-empty"><h2>Nenhuma orientação domiciliar disponível</h2><p>O fisioterapeuta ainda não publicou um programa para este acompanhamento.</p><a class="button primary" href="#domiciliar/${patient.id}">Criar orientação</a></section>`}${checkins.length?`<section class="panel portal-history"><div class="section-title"><div><span class="eyebrow">SEUS REGISTROS</span><h2>Relatos enviados</h2></div></div>${checkins.slice(0,12).map(row=>`<article><span>${date(row.date)}</span><strong>${esc(row.exerciseName||'Exercício')}</strong><p>${esc(row.statusLabel||row.status)}${row.difficulty?` · ${esc(row.difficulty)}`:''}${row.pain!==''?` · dor percebida ${esc(row.pain)}/10`:''}</p>${row.note?`<small>${esc(row.note)}</small>`:''}</article>`).join('')}</section>`:''}</div>`;
}
