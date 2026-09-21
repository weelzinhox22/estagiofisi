export const VOICE_FIELD_NAMES=new Set([
  'caseText','complaint','functionalGoal','procedureContext','notes','symptoms','turnQuality','movementQuality','painLimitation',
  'response','incidents','nextNotes','evolution','findings','problems','goals','conduct','questions','context','report','initialCondition',
  'currentCondition','achieved','partial','notAchieved','initialResults','finalResults','guidance','homeExercises','followUp','instructions',
  'care','bodyFunctions','activity','participation','environment','personal','mainProblem','hypotheses','patientGoal','therapyGoals','outcomes',
  'interventions','progression','regression','reassessment','clinicalHistory','chiefComplaint','comorbidities','medications','painWorse','painBetter',
  'inspectionNotes','balanceStatic','balanceDynamic','balanceNotes','sitToStand','stairs','ambulation','transfers','adl','functionalNotes','safetyNotes',
  'shortGoals','mediumGoals','longGoals','measurableGoals','treatmentPlan','objective','generalState','orientation','otherGaitFinding','testResults'
]);

const MAX_RECORDING_MS=10*60*1000;
let active=null;

const eligible=field=>field instanceof HTMLTextAreaElement||(field instanceof HTMLInputElement&&field.type==='text'&&VOICE_FIELD_NAMES.has(field.name));
export function appendTranscript(current,transcript,start=current.length,end=start){
  const before=current.slice(0,start),after=current.slice(end),clean=String(transcript||'').trim(),separatorBefore=before&&!/\s$/.test(before)?' ':'',separatorAfter=after&&!/^\s/.test(after)?' ':'';
  return `${before}${separatorBefore}${clean}${separatorAfter}${after}`;
}

function preferredMime(){return ['audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus','audio/ogg'].find(type=>globalThis.MediaRecorder?.isTypeSupported?.(type))||'';}
function announce(message,error=false){
  let status=document.querySelector('#voice-dictation-status');
  if(!status){status=document.createElement('div');status.id='voice-dictation-status';status.className='voice-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');document.body.append(status);}
  status.textContent=message;status.classList.toggle('error',error);status.classList.add('show');clearTimeout(announce.timer);announce.timer=setTimeout(()=>status.classList.remove('show'),5000);
}
function setButton(button,state){button.dataset.state=state;button.textContent=state==='recording'?'■ Parar':state==='sending'?'… Transcrevendo':'🎙 Ditar';button.disabled=state==='sending';button.setAttribute('aria-pressed',String(state==='recording'));}

async function transcribe(blob,mime){
  const extension=mime.includes('ogg')?'ogg':'webm',form=new FormData();
  form.append('file',blob,`ditado.${extension}`);form.append('model','whisper-large-v3-turbo');form.append('language','pt');form.append('response_format','json');form.append('temperature','0');
  const response=await fetch('/api/transcribe',{method:'POST',body:form,headers:{'X-Fisio-Voice':'1'}});
  const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error(payload.error||'Não foi possível transcrever o áudio.');return String(payload.text||'').trim();
}

async function start(field,button){
  if(active){active.recorder.stop();return;}
  if(!navigator.onLine){announce('A transcrição de voz precisa de conexão com a internet.',true);return;}
  if(!navigator.mediaDevices?.getUserMedia||!globalThis.MediaRecorder){announce('Este navegador não oferece gravação de voz compatível.',true);return;}
  try{
    const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false}),mime=preferredMime(),chunks=[];
    const recorder=new MediaRecorder(stream,mime?{mimeType:mime}:undefined),selection={start:field.selectionStart??field.value.length,end:field.selectionEnd??field.value.length};
    active={recorder,stream,button,field,selection,timeout:setTimeout(()=>recorder.state==='recording'&&recorder.stop(),MAX_RECORDING_MS)};
    recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};
    recorder.onerror=()=>{announce('A gravação foi interrompida pelo navegador.',true);cleanup();};
    recorder.onstop=async()=>{
      const session=active;cleanup();if(!chunks.length){announce('Nenhum áudio foi capturado.',true);return;}setButton(button,'sending');
      try{const text=await transcribe(new Blob(chunks,{type:recorder.mimeType||mime||'audio/webm'}),recorder.mimeType||mime||'audio/webm');if(!text)throw new Error('A transcrição voltou vazia.');const next=appendTranscript(field.value,text,selection.start,selection.end);field.value=field.maxLength>0?next.slice(0,field.maxLength):next;field.dispatchEvent(new Event('input',{bubbles:true}));field.dispatchEvent(new Event('change',{bubbles:true}));document.dispatchEvent(new CustomEvent('voice-transcribed',{detail:{text,fieldName:field.name||''}}));field.focus();announce('Transcrição inserida. Revise a ficha sugerida antes de salvar.');}catch(error){announce(error.message,true);}finally{setButton(button,'idle');}
    };
    recorder.start(250);setButton(button,'recording');announce('Gravando por até 10 minutos. Toque em “Parar” ao terminar.');
  }catch(error){announce(error.name==='NotAllowedError'?'Permissão do microfone não concedida.':'Não foi possível iniciar o microfone.',true);setButton(button,'idle');}
}
function cleanup(){if(!active)return;clearTimeout(active.timeout);active.stream.getTracks().forEach(track=>track.stop());active=null;}

export function enhanceVoiceInputs(root=document){
  root.querySelectorAll('textarea,input[type="text"]').forEach(field=>{
    if(!eligible(field)||field.dataset.voiceEnhanced)return;field.dataset.voiceEnhanced='true';
    const button=document.createElement('button');button.type='button';button.className='voice-dictation-button';button.textContent='🎙 Ditar';button.setAttribute('aria-label',`Ditar conteúdo para ${field.name||'este campo'}`);button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>start(field,button));field.insertAdjacentElement('afterend',button);
  });
}

export function stopVoiceDictation(){if(active?.recorder?.state==='recording')active.recorder.stop();}
