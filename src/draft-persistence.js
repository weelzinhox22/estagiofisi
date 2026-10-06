const PREFIX='fisio-clinico:draft:v1';
const SESSION_PREFIX='fisio-clinico:session-plan:v1';
const MAX_AGE=1000*60*60*24*30;
const DENIED=new Set(['login-form','signup-form','password-reset-form','change-password-form','article-search-form','exercise-video-analyze-form','exercise-video-publish-form','choose-session-form','choose-condition-form','home-link-form','home-folder-form']);
const ALLOWED=/(session-builder|express-evolution|functional-test|assessment-assistant|clinical-mentor|assessment|goal|discharge|functional-model|neuro-assessment|pediatric-assessment|home-program|clinical-assessment|gait-assessment|case-discussion|patient|plan|session|exercise|goniometry|repertoire)-form$/;

const storageOrDefault=storage=>storage||globalThis.localStorage;
const safe=value=>encodeURIComponent(String(value||'anonymous'));
const routeOf=routeHash=>String(routeHash||globalThis.location?.hash||'#inicio').split('?')[0];
const formKey=(form,userId,routeHash)=>`${PREFIX}:${safe(userId)}:${safe(routeOf(routeHash))}:${safe(form.id)}:${safe(form.elements?.patientId?.value||'global')}`;
const sessionKey=(userId,patientId)=>`${SESSION_PREFIX}:${safe(userId)}:${safe(patientId)}`;

export function isDraftEligible(form){
  if(!form?.id||DENIED.has(form.id)||form.querySelector('input[type="password"]'))return false;
  return form.id.startsWith('rapid-care-form-')||ALLOWED.test(form.id);
}

function snapshot(form){
  const fields={};
  for(const control of form.elements){
    if(!control.name||control.disabled||['password','file','submit','button','hidden'].includes(control.type))continue;
    if(fields[control.name])continue;
    const same=[...form.elements].filter(item=>item.name===control.name);
    if(control.type==='checkbox'||control.type==='radio')fields[control.name]={kind:control.type,values:same.filter(item=>item.checked).map(item=>item.value)};
    else if(control.tagName==='SELECT'&&control.multiple)fields[control.name]={kind:'multiple',values:[...control.selectedOptions].map(item=>item.value)};
    else fields[control.name]={kind:'value',values:[control.value]};
  }
  return {updatedAt:new Date().toISOString(),fields};
}

const meaningful=data=>Object.values(data.fields).some(field=>field.values.some(value=>String(value).trim()&&!/^\d{4}-\d{2}-\d{2}$/.test(String(value))));
const setStatus=(form,text,restored=false,error=false)=>{
  const host=form.querySelector(':scope > .modal-body')||form;let status=host.querySelector(':scope > .draft-persistence-status');
  if(!status){status=document.createElement('div');status.className='draft-persistence-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');host.prepend(status);}
  status.classList.toggle('restored',restored);status.classList.toggle('error',error);status.innerHTML=`<span aria-hidden="true">${error?'!':restored?'↻':'✓'}</span><span>${text}</span>`;
};

export function saveFormDraft(form,userId,routeHash,storage){
  if(!isDraftEligible(form))return false;
  try{const target=storageOrDefault(storage),data=snapshot(form),key=formKey(form,userId,routeHash);if(meaningful(data))target.setItem(key,JSON.stringify(data));else target.removeItem(key);setStatus(form,`Rascunho salvo neste dispositivo às ${new Date(data.updatedAt).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`);return true;}catch{setStatus(form,'Não foi possível salvar o rascunho. Exporte um backup antes de sair.',false,true);return false;}
}

export function restoreFormDraft(form,userId,routeHash,storage){
  if(!isDraftEligible(form))return false;
  try{
    const target=storageOrDefault(storage),key=formKey(form,userId,routeHash),raw=target.getItem(key);
    if(!raw){setStatus(form,'Salvamento automático ativado neste dispositivo');return false;}
    const data=JSON.parse(raw);if(!data?.updatedAt||Date.now()-Date.parse(data.updatedAt)>MAX_AGE){target.removeItem(key);setStatus(form,'Salvamento automático ativado neste dispositivo');return false;}
    for(const [name,field] of Object.entries(data.fields||{})){
      const controls=[...form.elements].filter(item=>item.name===name);if(!controls.length)continue;
      if(['checkbox','radio'].includes(field.kind))for(const control of controls)control.checked=field.values.includes(control.value);
      else if(field.kind==='multiple')for(const option of controls[0].options)option.selected=field.values.includes(option.value);
      else controls[0].value=field.values[0]??'';
    }
    for(const card of form.querySelectorAll('.session-exercise')){const status=card.querySelector('select[name^="status-"]'),check=card.querySelector('[data-session-done]'),done=['realizado','parcial'].includes(status?.value);if(check)check.checked=status?.value==='realizado';card.classList.toggle('is-done',done);}
    setStatus(form,`Rascunho restaurado · salvo ${new Date(data.updatedAt).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'})}`,true);return true;
  }catch{setStatus(form,'O rascunho salvo não pôde ser restaurado.',false,true);return false;}
}

export function restoreDrafts(root,userId,routeHash,storage){for(const form of root?.querySelectorAll?.('form')||[])restoreFormDraft(form,userId,routeHash,storage);}
export function clearFormDraft(form,userId,routeHash,storage){try{storageOrDefault(storage).removeItem(formKey(form,userId,routeHash));return true;}catch{return false;}}

export function saveSessionPlan(userId,patientId,draft,storage){try{storageOrDefault(storage).setItem(sessionKey(userId,patientId),JSON.stringify({updatedAt:new Date().toISOString(),draft}));return true;}catch{return false;}}
export function loadSessionPlan(userId,patientId,storage){try{const target=storageOrDefault(storage),key=sessionKey(userId,patientId),raw=target.getItem(key);if(!raw)return null;const data=JSON.parse(raw);if(!data?.updatedAt||Date.now()-Date.parse(data.updatedAt)>MAX_AGE){target.removeItem(key);return null;}return data.draft||null;}catch{return null;}}
export function clearSessionPlan(userId,patientId,storage){try{storageOrDefault(storage).removeItem(sessionKey(userId,patientId));return true;}catch{return false;}}
