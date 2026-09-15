/**
 * @typedef {Object} ClinicalAssessment
 * @property {Object} vitals
 * @property {Object} pain
 * @property {Object} inspection
 * @property {Array<Object>} strength
 * @property {Array<Object>} rom
 * @property {Array<Object>} bodyFindings
 * @property {Object} balance
 * @property {Object} functionality
 * @property {Object} safety
 */

export const SESSION_BLOCKS = ['Avaliação inicial','Mobilidade','Ativação','Fortalecimento','Equilíbrio','Treino funcional','Marcha','Reavaliação'];
export const PERFORMED_STATUSES = ['realizado','reduzido','progredido','modificado'];
export const SAFETY_OPTIONS = [
  ['bp','PA requer atenção conforme contexto/protocolo'],
  ['dizziness','Tontura'],
  ['dyspnea','Dispneia'],
  ['intense-pain','Dor intensa ou piora súbita'],
  ['sudden-edema','Edema súbito/importante'],
  ['heat-redness','Calor ou vermelhidão importante'],
  ['fall','Queda ou quase queda'],
  ['instability','Instabilidade importante']
];
export const GOAL_TEMPLATES = {
  short:['Reduzir dor autorrelatada','Reduzir edema observado','Melhorar mobilidade na tarefa prioritária'],
  medium:['Aumentar força muscular','Melhorar equilíbrio','Melhorar desempenho da marcha'],
  long:['Aumentar independência funcional','Melhorar desempenho em AVDs','Aumentar participação funcional']
};

const clean = value => String(value ?? '').trim();
const compact = object => Object.fromEntries(Object.entries(object).filter(([,value]) => clean(value) !== ''));
const title = value => clean(value).replace(/(^|[-_ ])\p{L}/gu, match => match.toUpperCase());

function rows(fd, fields) {
  const columns=fields.map(field=>fd.getAll(field));
  const length=Math.max(0,...columns.map(values=>values.length));
  return Array.from({length},(_,index)=>compact(Object.fromEntries(fields.map((field,column)=>[field,columns[column][index]])))).filter(row=>Object.values(row).some(value=>clean(value)!==''));
}

/** @returns {ClinicalAssessment} */
export function clinicalAssessmentFromForm(fd) {
  return {
    vitals:compact({bp:fd.get('bp'),hr:fd.get('hr'),rr:fd.get('rr'),spo2:fd.get('spo2'),eva:fd.get('pain')}),
    pain:compact({location:fd.get('painLocation'),intensity:fd.get('pain'),rest:fd.get('painRest'),movement:fd.get('painMovement'),worseWith:fd.get('painWorse'),betterWith:fd.get('painBetter')}),
    inspection:{findings:fd.getAll('inspectionFinding'),notes:clean(fd.get('inspectionNotes'))},
    strength:rows(fd,['strengthMovement','strengthSide','strengthGrade']).map(row=>({movement:row.strengthMovement||'',side:row.strengthSide||'',grade:row.strengthGrade||''})),
    rom:rows(fd,['romJoint','romMovement','romSide','romDegrees','romMethod']).map(row=>({joint:row.romJoint||'',movement:row.romMovement||'',side:row.romSide||'',degrees:row.romDegrees||'',method:row.romMethod||''})),
    bodyFindings:rows(fd,['bodyRegion','bodySide','bodyFinding','bodyIntensity','bodyNote']).map(row=>({region:row.bodyRegion||'',side:row.bodySide||'',finding:row.bodyFinding||'',intensity:row.bodyIntensity||'',note:row.bodyNote||''})),
    balance:compact({static:fd.get('balanceStatic'),dynamic:fd.get('balanceDynamic'),romberg:fd.get('romberg'),notes:fd.get('balanceNotes')}),
    functionality:compact({sitToStand:fd.get('sitToStand'),stairs:fd.get('stairs'),ambulation:fd.get('ambulation'),transfers:fd.get('transfers'),adl:fd.get('adl'),device:fd.get('functionalDevice'),notes:fd.get('functionalNotes')}),
    safety:{flags:fd.getAll('safetyFlag'),notes:clean(fd.get('safetyNotes'))}
  };
}

export function assessmentHasContent(assessment) {
  return Boolean(Object.keys(assessment.vitals).length||Object.keys(assessment.pain).length||assessment.inspection.findings.length||assessment.inspection.notes||assessment.strength.length||assessment.rom.length||assessment.bodyFindings.length||Object.keys(assessment.balance).length||Object.keys(assessment.functionality).length||assessment.safety.flags.length||assessment.safety.notes);
}

export function buildAssessmentSummary(assessment) {
  const parts=[];
  const vitals=[assessment.vitals.bp&&`PA ${assessment.vitals.bp}`,assessment.vitals.hr&&`FC ${assessment.vitals.hr} bpm`,assessment.vitals.rr&&`FR ${assessment.vitals.rr} irpm`,assessment.vitals.spo2&&`SpO₂ ${assessment.vitals.spo2}%`,assessment.vitals.eva&&`EVA ${assessment.vitals.eva}/10`].filter(Boolean);
  if(vitals.length)parts.push(`Sinais vitais/autorrelato: ${vitals.join('; ')}.`);
  const pain=[assessment.pain.location&&`localização: ${assessment.pain.location}`,assessment.pain.rest&&`repouso: ${assessment.pain.rest}`,assessment.pain.movement&&`movimento: ${assessment.pain.movement}`,assessment.pain.worseWith&&`piora com: ${assessment.pain.worseWith}`,assessment.pain.betterWith&&`alivia com: ${assessment.pain.betterWith}`].filter(Boolean);
  if(pain.length)parts.push(`Dor: ${pain.join('; ')}.`);
  if(assessment.inspection.findings.length||assessment.inspection.notes)parts.push(`Inspeção: ${[...assessment.inspection.findings.map(title),assessment.inspection.notes].filter(Boolean).join('; ')}.`);
  if(assessment.strength.length)parts.push(`Força: ${assessment.strength.map(row=>`${row.movement||'movimento não informado'}${row.side?` (${row.side})`:''}${row.grade?`: ${row.grade}/5`:''}`).join('; ')}.`);
  if(assessment.rom.length)parts.push(`ADM: ${assessment.rom.map(row=>`${[row.joint,row.movement,row.side].filter(Boolean).join(' · ')}${row.degrees?`: ${row.degrees}°`:''}${row.method?` (${row.method})`:''}`).join('; ')}.`);
  if(Object.keys(assessment.balance).length)parts.push(`Equilíbrio: ${Object.entries(assessment.balance).map(([key,value])=>`${({static:'estático',dynamic:'dinâmico',romberg:'Romberg',notes:'observações'})[key]}: ${value}`).join('; ')}.`);
  if(Object.keys(assessment.functionality).length)parts.push(`Funcionalidade: ${Object.entries(assessment.functionality).map(([key,value])=>`${({sitToStand:'sentar/levantar',stairs:'escadas',ambulation:'deambulação',transfers:'transferências',adl:'AVDs',device:'dispositivo',notes:'observações'})[key]}: ${value}`).join('; ')}.`);
  if(assessment.bodyFindings.length)parts.push(`Mapa corporal: ${assessment.bodyFindings.map(row=>`${row.region||'região não informada'}${row.side?` (${row.side})`:''}: ${row.finding||'achado'}${row.intensity?` — ${row.intensity}`:''}${row.note?` — ${row.note}`:''}`).join('; ')}.`);
  return parts.join(' ');
}

export function safetyMessages(assessment) {
  const labels=new Map(SAFETY_OPTIONS);
  return assessment.safety.flags.map(id=>labels.get(id)).filter(Boolean);
}

export function suggestPhysioDiagnosis(assessment, hasGait=false) {
  const findings=[];
  if(assessment.pain.intensity||assessment.pain.location)findings.push('dor registrada');
  if(assessment.strength.some(row=>row.grade!==''))findings.push('alteração de força muscular registrada');
  if(assessment.rom.some(row=>row.degrees!==''))findings.push('limitação de amplitude de movimento registrada');
  if(Object.keys(assessment.balance).length)findings.push('alteração de equilíbrio descrita');
  if(hasGait||assessment.functionality.ambulation)findings.push('alteração de marcha/deambulação descrita');
  if(Object.keys(assessment.functionality).length)findings.push('limitação funcional registrada');
  if(!findings.length)return '';
  return `Déficit cinético-funcional a revisar, caracterizado por ${findings.join(', ')}, conforme os dados registrados e sua relação com as atividades prioritárias.`;
}

export function isPerformed(item) { return PERFORMED_STATUSES.includes(item.status); }

export function buildEvolution(values, items, exerciseLookup) {
  const parts=[];
  if(clean(values.generalState))parts.push(`Paciente apresenta-se ${clean(values.generalState)}.`);
  if(clean(values.orientation))parts.push(`Orientação: ${clean(values.orientation)}.`);
  const initial=[values.painBefore!==''&&values.painBefore!=null&&`EVA inicial ${values.painBefore}/10`,clean(values.bpInitial)&&`PA inicial ${clean(values.bpInitial)}`,clean(values.hrInitial)&&`FC inicial ${clean(values.hrInitial)} bpm`].filter(Boolean);
  if(initial.length)parts.push(`${initial.join('; ')}.`);
  const done=items.filter(isPerformed);
  if(done.length)parts.push(`Realizados ${done.map(item=>{const exercise=exerciseLookup(item.exerciseId);const dose=[item.actualSets&&`${item.actualSets} séries`,item.actualReps&&`${item.actualReps} repetições`,item.actualTime,item.actualLoad&&`carga ${item.actualLoad}`,item.actualSide&&`lado ${item.actualSide}`].filter(Boolean).join(', ');return `${exercise?.name||'atividade registrada'}${dose?` (${dose})`:''}`;}).join('; ')}${clean(values.objective)?`, visando ${clean(values.objective)}`:''}.`);
  const interrupted=items.filter(item=>item.status==='interrompido');
  if(interrupted.length)parts.push(`Atividades interrompidas: ${interrupted.map(item=>`${exerciseLookup(item.exerciseId)?.name||'atividade'}${item.stopReason?` — motivo: ${item.stopReason}`:''}`).join('; ')}.`);
  const final=[values.painAfter!==''&&values.painAfter!=null&&`EVA final ${values.painAfter}/10`,clean(values.bpFinal)&&`PA final ${clean(values.bpFinal)}`,clean(values.hrFinal)&&`FC final ${clean(values.hrFinal)} bpm`].filter(Boolean);
  if(final.length)parts.push(`${final.join('; ')}.`);
  if(clean(values.response))parts.push(`Resposta durante/após a sessão: ${clean(values.response)}.`);
  if(clean(values.incidents))parts.push(`Intercorrências confirmadas: ${clean(values.incidents)}.`);
  return parts.join(' ');
}

export function patientLabel(patient) { return clean(patient.name)||clean(patient.code)||'Paciente sem identificação'; }
export function patientInitials(patient) { return patientLabel(patient).split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase()||'P'; }

export function comparisonData(state,patientId) {
  const assessments=state.assessments.filter(row=>row.patientId===patientId&&row.clinical).sort((a,b)=>a.date.localeCompare(b.date));
  const sessions=state.sessions.filter(row=>row.patientId===patientId).sort((a,b)=>a.date.localeCompare(b.date));
  const group=(rows,keyOf,valueOf)=>{const map=new Map();for(const row of rows){for(const item of row.clinical?.[keyOf.collection]||[]){const key=keyOf.item(item);if(!key||clean(valueOf(item))==='')continue;if(!map.has(key))map.set(key,[]);map.get(key).push({date:row.date,value:valueOf(item)});}}return [...map.entries()].map(([label,values])=>({label,values}));};
  return {
    pain:sessions.filter(row=>row.painBefore!==''&&row.painBefore!=null).map(row=>({date:row.date,value:`${row.painBefore}${row.painAfter!==''&&row.painAfter!=null?` → ${row.painAfter}`:''}/10`})),
    rom:group(assessments,{collection:'rom',item:item=>[item.joint,item.movement,item.side].filter(Boolean).join(' · ')},item=>item.degrees&&`${item.degrees}°`),
    strength:group(assessments,{collection:'strength',item:item=>[item.movement,item.side].filter(Boolean).join(' · ')},item=>item.grade&&`${item.grade}/5`)
  };
}

export function timelineRecords(state,patientId) {
  const typed=(collection,type,label)=>state[collection].filter(row=>row.patientId===patientId).map(row=>({...row,_type:type,_label:label}));
  return [...typed('assessments','assessment','Avaliação'),...typed('plans','plan','Plano'),...typed('sessions','session','Sessão'),...typed('goniometryRecords','rom','Goniometria')].sort((a,b)=>`${b.date||''}${b.createdAt||''}`.localeCompare(`${a.date||''}${a.createdAt||''}`));
}
