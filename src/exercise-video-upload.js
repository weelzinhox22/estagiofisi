import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, sessionUser } from './supabase-client.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const input=(label,name,value='')=>`<label><span>${label}</span><input name="${name}" value="${esc(value)}" required></label>`;
const formatSize=bytes=>bytes>=1024*1024?`${(bytes/(1024*1024)).toFixed(1)} MB`:`${Math.max(1,Math.round(bytes/1024))} KB`;
export const VIDEO_FRAME_RATIOS=Object.freeze([.08,.29,.5,.71,.92]);

function progressView(draft){
  const progress=Math.max(0,Math.min(100,Number(draft.progress)||0));
  const stage=draft.stage||(draft.publishing?'Enviando vídeo…':'Preparando análise…');
  return `<div class="video-upload-progress" role="status" aria-live="polite" aria-atomic="true"><div><strong id="exercise-video-progress-stage">${esc(stage)}</strong><span id="exercise-video-progress-value">${progress}%</span></div><progress id="exercise-video-progress" max="100" value="${progress}" aria-label="${esc(stage)}">${progress}%</progress><small id="exercise-video-progress-detail">${esc(draft.progressDetail||'Mantenha esta tela aberta até a conclusão.')}</small></div>`;
}

function selectedVideo(draft){
  if(!draft.file)return '';
  return `<div class="video-selected-file">${draft.previewUrl?`<video src="${esc(draft.previewUrl)}" muted playsinline preload="metadata" aria-label="Prévia local do vídeo selecionado"></video>`:'<span aria-hidden="true">▶</span>'}<div><strong>Vídeo selecionado</strong><small>${esc(draft.file.name||'arquivo de vídeo')} · ${formatSize(draft.file.size||0)}</small></div></div>`;
}

export function exerciseVideoUploadPanel(draft={}){
  const a=draft.analysis||{};
  const consent=`<label class="video-ai-consent"><input type="checkbox" name="aiConsent" required ${draft.aiConsent?'checked':''}><span>Autorizo o envio de até cinco quadros reduzidos, sem áudio, e do contexto opcional à Groq exclusivamente para gerar esta ficha. Não inclua pacientes identificáveis, nomes ou números de prontuário.</span></label>`;
  const initialForm=`<form id="exercise-video-analyze-form">${draft.file?selectedVideo(draft):`<label class="video-drop"><input id="exercise-video-file" name="video" type="file" accept="video/mp4,video/webm,video/quicktime" required><b>Selecionar vídeo</b><small>MP4, WebM ou MOV · até 100 MB</small></label>`}<label class="video-context"><span>Contexto opcional</span><textarea name="context" rows="2" placeholder="Ex.: exercício para quadríceps">${esc(draft.context||'')}</textarea></label>${consent}<aside class="video-analysis-limit"><strong>O que a IA realmente vê</strong><p>Cinco imagens distribuídas do início ao fim. Ela não avalia cada segundo, áudio, velocidade contínua, fadiga ou eventos entre os quadros.</p></aside>${draft.loading?progressView(draft):`<button type="submit">${draft.error&&draft.file?'Tentar análise novamente':'Analisar com IA'}</button>`}${draft.file&&!draft.loading?`<button class="video-change-file" type="button" data-action="cancel-video-analysis">Escolher outro vídeo</button>`:''}${draft.error?`<p class="video-upload-error" role="alert">${esc(draft.error)}</p>`:''}</form>`;
  const publishForm=`<form id="exercise-video-publish-form"><div class="video-analysis-preview">${draft.previewUrl?`<video src="${esc(draft.previewUrl)}" controls playsinline></video>`:''}<div><strong>Revise antes de publicar</strong><small>A análise visual é um rascunho e pode estar errada. Todos os campos são editáveis; confirme-os como responsável antes de publicar.</small></div></div><div class="video-analysis-fields">${input('Nome','nome',a.nome)}${input('Região/categoria','regiao_ou_categoria',a.regiao_ou_categoria)}<label class="wide"><span>Descrição</span><textarea name="descricao" rows="3" required>${esc(a.descricao)}</textarea></label><label class="wide"><span>Objetivo educacional possível</span><textarea name="objetivos" rows="3" required>${esc(a.objetivos)}</textarea></label><label class="wide"><span>Execução observável e orientações</span><textarea name="orientacoes" rows="4" required>${esc(a.orientacoes)}</textarea></label>${input('Músculos possivelmente envolvidos','musculos',a.musculos||'Não informado')}${input('Equipamentos visíveis','equipamentos',a.equipamentos||'Não informado')}${input('Dose visível','dosagem_mencionada_no_video',a.dosagem_mencionada_no_video||'Não identificada')}${input('Limitações e cuidados','cuidados',a.cuidados||'Requer revisão profissional.')}</div>${draft.publishing?progressView(draft):`<div class="video-publish-actions"><button type="button" data-action="cancel-video-analysis">Escolher outro</button><button type="submit">Confirmar revisão e publicar</button></div>`}${draft.error?`<p class="video-upload-error" role="alert">${esc(draft.error)}</p>`:''}</form>`;
  return `<section class="exercise-video-uploader"><header><span>＋</span><div><small>MINHA BIBLIOTECA</small><h2>Enviar exercício em vídeo</h2><p>A análise usa cinco quadros reduzidos; o arquivo completo só é enviado ao Supabase após sua confirmação.</p></div></header>${!a.nome?initialForm:publishForm}</section>`;
}

function waitFor(target,event,errorEvent='error',timeout=12000){
  return new Promise((resolve,reject)=>{
    const finish=error=>{clearTimeout(timer);target.removeEventListener(event,onSuccess);target.removeEventListener(errorEvent,onError);error?reject(error):resolve();};
    const onSuccess=()=>finish();
    const onError=()=>finish(new Error('Não foi possível ler este vídeo no navegador. Tente MP4 (H.264).'));
    const timer=setTimeout(()=>finish(new Error('O vídeo demorou demais para responder. Tente outro formato.')),timeout);
    target.addEventListener(event,onSuccess,{once:true});
    target.addEventListener(errorEvent,onError,{once:true});
  });
}

async function frameAt(video,time){
  const safeTime=Math.min(Math.max(0,time),Math.max(0,video.duration-.05));
  if(Math.abs(video.currentTime-safeTime)>.015){const ready=waitFor(video,'seeked');video.currentTime=safeTime;await ready;}
  if(video.readyState<2)await waitFor(video,'loadeddata');
  const longest=Math.max(video.videoWidth,video.videoHeight),scale=Math.min(1,480/Math.max(1,longest));
  const canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(video.videoWidth*scale));
  canvas.height=Math.max(1,Math.round(video.videoHeight*scale));
  const context=canvas.getContext('2d');
  if(!context)throw new Error('O navegador não conseguiu preparar os quadros do vídeo.');
  context.drawImage(video,0,0,canvas.width,canvas.height);
  return canvas.toDataURL('image/jpeg',.62);
}

function requestAnalysis(body,token,onProgress){
  return new Promise((resolve,reject)=>{
    const xhr=new XMLHttpRequest();
    let processingTimer=0,processingProgress=78;
    const stop=()=>{if(processingTimer)clearInterval(processingTimer);};
    const startProcessing=()=>{onProgress?.({progress:processingProgress,stage:'Interpretando os quadros…',progressDetail:'A IA está comparando as cinco imagens. Isso pode levar alguns segundos.'});processingTimer=setInterval(()=>{processingProgress=Math.min(94,processingProgress+1);onProgress?.({progress:processingProgress,stage:'Interpretando os quadros…',progressDetail:'A ficha será exibida para revisão antes da publicação.'});},900);};
    xhr.open('POST','/api/analyze-exercise-video');
    xhr.timeout=90000;
    xhr.setRequestHeader('Content-Type','application/json');
    xhr.setRequestHeader('Authorization',`Bearer ${token}`);
    xhr.upload.onprogress=event=>{if(event.lengthComputable){const value=52+Math.round((event.loaded/event.total)*24);onProgress?.({progress:value,stage:'Enviando quadros protegidos…',progressDetail:`${Math.round((event.loaded/event.total)*100)}% do envio para análise`});}};
    xhr.upload.onload=startProcessing;
    xhr.onerror=()=>{stop();reject(new Error('Sem conexão com o serviço de análise. Verifique a internet e tente novamente.'));};
    xhr.ontimeout=()=>{stop();reject(new Error('A análise excedeu o tempo limite. Tente novamente em instantes.'));};
    xhr.onload=()=>{stop();let payload={};try{payload=JSON.parse(xhr.responseText||'{}');}catch{}if(xhr.status===404){reject(new Error('A análise de vídeo ainda não está disponível nesta publicação.'));return;}if(xhr.status===401){reject(new Error('Sua sessão expirou. Entre novamente para analisar o vídeo.'));return;}if(xhr.status===413){reject(new Error('Os quadros ficaram grandes demais. Tente um vídeo menor ou com resolução mais baixa.'));return;}if(xhr.status<200||xhr.status>=300||!payload.analysis){reject(new Error(payload.error||'O serviço de análise não respondeu corretamente. Tente novamente.'));return;}resolve(payload.analysis);};
    xhr.send(JSON.stringify(body));
  });
}

export async function analyzeExerciseVideo(file,token,context='',onProgress){
  if(!file)throw new Error('Selecione um vídeo.');
  if(file.size>100*1024*1024)throw new Error('O vídeo deve ter no máximo 100 MB.');
  const url=URL.createObjectURL(file),video=document.createElement('video');
  try{
    onProgress?.({progress:3,stage:'Lendo o vídeo…',progressDetail:'Verificando formato, duração e resolução.'});
    video.muted=true;video.playsInline=true;video.preload='metadata';
    const metadata=waitFor(video,'loadedmetadata');video.src=url;video.load();await metadata;
    if(!Number.isFinite(video.duration)||video.duration<=0||!video.videoWidth||!video.videoHeight)throw new Error('O vídeo não informou duração ou resolução válida. Tente MP4 (H.264).');
    const duration=Math.max(.1,video.duration),frames=[];
    for(let index=0;index<VIDEO_FRAME_RATIOS.length;index+=1){frames.push(await frameAt(video,duration*VIDEO_FRAME_RATIOS[index]));onProgress?.({progress:12+(index+1)*8,stage:`Extraindo quadro ${index+1} de ${VIDEO_FRAME_RATIOS.length}…`,progressDetail:'Somente imagens reduzidas, sem áudio, serão enviadas à IA.'});}
    const analysis=await requestAnalysis({frames,context:String(context||'').slice(0,1000),duration},token,onProgress);
    onProgress?.({progress:100,stage:'Análise concluída',progressDetail:'Revise todos os campos antes de publicar.'});
    return analysis;
  }finally{video.removeAttribute('src');video.load();URL.revokeObjectURL(url);}
}

function uploadVideo(file,path,session,onProgress){
  return new Promise((resolve,reject)=>{
    const xhr=new XMLHttpRequest();
    xhr.open('POST',`${SUPABASE_URL}/storage/v1/object/exercise-videos/${path}`);
    xhr.timeout=10*60*1000;
    xhr.setRequestHeader('apikey',SUPABASE_PUBLISHABLE_KEY);
    xhr.setRequestHeader('Authorization',`Bearer ${session.access_token}`);
    xhr.setRequestHeader('Content-Type',file.type||'video/mp4');
    xhr.upload.onprogress=event=>{if(event.lengthComputable){const percent=Math.round((event.loaded/event.total)*100);onProgress?.({progress:Math.round(Math.min(92,Math.max(2,percent*.92))),stage:'Enviando vídeo…',progressDetail:`${percent}% do arquivo enviado`});}};
    xhr.onerror=()=>reject(new Error('A conexão caiu durante o envio do vídeo. Tente novamente.'));
    xhr.ontimeout=()=>reject(new Error('O envio demorou demais. Verifique sua conexão e tente novamente.'));
    xhr.onload=()=>{let data={};try{data=JSON.parse(xhr.responseText||'{}');}catch{}if(xhr.status<200||xhr.status>=300){reject(new Error(data.message||'Não foi possível enviar o vídeo. Verifique a configuração do Storage.'));return;}resolve(data);};
    xhr.send(file);
  });
}

export async function publishExerciseVideo({file,analysis,session,onProgress}){
  const owner=sessionUser(session).sub,extension=(file.name.split('.').pop()||'mp4').replace(/[^a-z0-9]/gi,'').toLowerCase(),path=`${owner}/${crypto.randomUUID()}.${extension}`;
  onProgress?.({progress:1,stage:'Preparando envio…',progressDetail:`Arquivo de ${formatSize(file.size)} pronto para upload.`});
  await uploadVideo(file,path,session,onProgress);
  onProgress?.({progress:95,stage:'Salvando ficha…',progressDetail:'Associando a análise revisada ao vídeo.'});
  const record={owner_id:owner,storage_path:path,...analysis,ai_analysis:{...analysis,analysis_source:'groq_five_sampled_frames',reviewed_by_uploader:true},status:'published'},saved=await fetch(`${SUPABASE_URL}/rest/v1/exercise_videos`,{method:'POST',headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${session.access_token}`,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify(record)}),rows=await saved.json().catch(()=>[]);
  if(!saved.ok)throw new Error(rows.message||'Não foi possível salvar a ficha do vídeo.');
  onProgress?.({progress:100,stage:'Vídeo publicado',progressDetail:'O vídeo já está disponível na sua biblioteca.'});
  return rows[0];
}

async function signedUrl(path,session){const response=await fetch(`${SUPABASE_URL}/storage/v1/object/sign/exercise-videos/${path}`,{method:'POST',headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${session.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({expiresIn:3600})}),data=await response.json().catch(()=>({}));return data.signedURL?`${SUPABASE_URL}/storage/v1${data.signedURL}`:'';}
export async function loadExerciseVideos(session){const response=await fetch(`${SUPABASE_URL}/rest/v1/exercise_videos?status=eq.published&select=*&order=created_at.desc`,{headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${session.access_token}`}}),rows=await response.json().catch(()=>[]);if(!response.ok)return[];return Promise.all(rows.map(async row=>({...row,arquivo:await signedUrl(row.storage_path,session),tipo_conteudo:'exercicio_usuario'})));}
export async function deleteExerciseVideo(item,session){const headers={apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${session.access_token}`},record=await fetch(`${SUPABASE_URL}/rest/v1/exercise_videos?id=eq.${encodeURIComponent(item.id)}`,{method:'DELETE',headers:{...headers,Prefer:'return=minimal'}});if(!record.ok)throw new Error('Não foi possível remover a ficha do vídeo.');const object=await fetch(`${SUPABASE_URL}/storage/v1/object/exercise-videos/${item.storage_path}`,{method:'DELETE',headers});if(!object.ok)throw new Error('A ficha foi removida, mas o arquivo precisa ser limpo no Storage.');}
