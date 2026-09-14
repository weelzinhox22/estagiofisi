const RUNTIME = '/public/vendor/mediapipe';
const MODEL = `${RUNTIME}/models/pose_landmarker_lite.task`;

export const ANGLE_OPTIONS = {
  elbow:{ label:'Cotovelo', points:[11,13,15], rightPoints:[12,14,16], vertex:1 },
  shoulder:{ label:'Ombro', points:[13,11,23], rightPoints:[14,12,24], vertex:1 },
  hip:{ label:'Quadril', points:[11,23,25], rightPoints:[12,24,26], vertex:1 },
  knee:{ label:'Joelho', points:[23,25,27], rightPoints:[24,26,28], vertex:1 },
  ankle:{ label:'Tornozelo', points:[25,27,31], rightPoints:[26,28,32], vertex:1 }
};

const CONNECTIONS = [[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[27,29],[29,31],[27,31],[24,26],[26,28],[28,30],[30,32],[28,32]];
let stream;
let landmarker;
let frameHandle;
let running = false;

export function calculateAngle(a,b,c,aspectRatio=1) {
  if (![a,b,c].every(p => p && Number.isFinite(p.x) && Number.isFinite(p.y))) return null;
  const ab={x:(a.x-b.x)*aspectRatio,y:a.y-b.y};
  const cb={x:(c.x-b.x)*aspectRatio,y:c.y-b.y};
  const denominator=Math.hypot(ab.x,ab.y)*Math.hypot(cb.x,cb.y);
  if (!denominator) return null;
  const cosine=Math.max(-1,Math.min(1,(ab.x*cb.x+ab.y*cb.y)/denominator));
  return Math.acos(cosine)*180/Math.PI;
}

export function selectedPoints(landmarks,joint,side) {
  const option=ANGLE_OPTIONS[joint];
  if (!option || !landmarks) return [];
  return (side==='right'?option.rightPoints:option.points).map(index=>landmarks[index]);
}

export function updateRepCounter(counter,angle,low,high) {
  if (!Number.isFinite(angle) || !Number.isFinite(low) || !Number.isFinite(high) || low>=high) return counter;
  const next={...counter};
  if (angle<=low) next.phase='low';
  if (angle>=high && next.phase==='low') { next.count+=1; next.phase='high'; }
  return next;
}

function cameraMarkup() {
  return `<div class="back"><a href="#biblioteca/goniometria">← Goniometria</a></div>
  <div class="page-head camera-heading"><div><span class="eyebrow">ANÁLISE DE MOVIMENTO</span><h1>Goniometria por câmera</h1><p>Estimativa angular bidimensional com processamento local no dispositivo.</p></div><span class="privacy-pill">◉ Vídeo não armazenado</span></div>
  <div class="camera-warning"><strong>Medida assistiva, não goniometria clínica validada</strong><p>A perspectiva, o posicionamento, roupas, oclusões e a detecção dos pontos alteram o resultado. Compare com avaliação e instrumento apropriado. Não use isoladamente para diagnóstico, liberação funcional ou decisão clínica.</p></div>
  <section class="camera-controls panel"><div class="camera-control-grid"><label class="field"><span>Articulação</span><select id="camera-joint">${Object.entries(ANGLE_OPTIONS).map(([id,x])=>`<option value="${id}">${x.label}</option>`).join('')}</select></label><label class="field"><span>Lado anatômico</span><select id="camera-side"><option value="left">Esquerdo</option><option value="right">Direito</option></select></label><label class="field"><span>Câmera</span><select id="camera-facing"><option value="user">Frontal</option><option value="environment">Traseira</option></select></label><div class="camera-start"><button class="button primary" id="camera-start" type="button">Iniciar câmera</button><button class="button ghost" id="camera-stop" type="button" disabled>Parar</button></div></div><p id="camera-status" class="camera-status" role="status">A câmera só será acessada após tocar em “Iniciar câmera”.</p></section>
  <div class="camera-layout"><section class="camera-stage panel"><div class="video-wrap"><video id="camera-video" playsinline muted></video><canvas id="camera-canvas"></canvas><div id="camera-placeholder"><span>◎</span><strong>Câmera desligada</strong><small>Posicione o corpo inteiro ou o segmento avaliado no enquadramento.</small></div></div><div class="live-measure"><span>Ângulo geométrico</span><strong id="camera-angle">—°</strong><small id="camera-confidence">Aguardando detecção</small></div></section>
  <aside class="camera-data panel"><span class="eyebrow">OBSERVAÇÃO ATUAL</span><div class="camera-metrics"><div><span>Mínimo</span><strong id="camera-min">—°</strong></div><div><span>Máximo</span><strong id="camera-max">—°</strong></div><div><span>Amplitude observada</span><strong id="camera-range">—°</strong></div></div><button class="button secondary full" id="camera-capture" type="button" disabled>Capturar medida</button><button class="button ghost full" id="camera-reset" type="button">Zerar observação</button><hr><span class="eyebrow">CONTADOR DE CICLOS</span><p class="microcopy">Conta uma passagem do limiar baixo ao alto. É um contador de movimento, não de qualidade ou execução correta.</p><div class="threshold-grid"><label class="field"><span>Limiar baixo</span><input id="camera-low" type="number" value="70" min="0" max="180"></label><label class="field"><span>Limiar alto</span><input id="camera-high" type="number" value="150" min="0" max="180"></label></div><div class="rep-count"><span>Ciclos</span><strong id="camera-reps">0</strong></div></aside></div>
  <section class="panel camera-guide"><h2>Como obter uma estimativa mais consistente</h2><ol><li>Use boa iluminação e mantenha os três pontos articulares visíveis.</li><li>Posicione a câmera aproximadamente perpendicular ao plano do movimento.</li><li>Evite mover a câmera durante a observação e mantenha distância suficiente.</li><li>Repita a medida nas mesmas condições e registre lado, posição e contexto.</li></ol><p>A medição usa as coordenadas normalizadas dos pontos detectados pelo MediaPipe Pose Landmarker e calcula o ângulo interno entre três pontos na imagem.</p></section>`;
}

export function cameraPage() { return cameraMarkup(); }

function setStatus(message,error=false) {
  const element=document.querySelector('#camera-status');
  if(element){element.textContent=message;element.classList.toggle('error',error);}
}

function drawPose(canvas,video,landmarks,selected) {
  const context=canvas.getContext('2d');
  const width=video.videoWidth||640,height=video.videoHeight||480;
  if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
  context.clearRect(0,0,width,height);
  context.lineWidth=Math.max(2,width/240);context.lineCap='round';
  context.strokeStyle='rgba(128,201,179,.72)';
  for(const [from,to] of CONNECTIONS){const a=landmarks[from],b=landmarks[to];if(!a||!b||(a.visibility??1)<.45||(b.visibility??1)<.45)continue;context.beginPath();context.moveTo(a.x*width,a.y*height);context.lineTo(b.x*width,b.y*height);context.stroke();}
  landmarks.forEach(point=>{if((point.visibility??1)<.45)return;context.beginPath();context.arc(point.x*width,point.y*height,Math.max(3,width/180),0,Math.PI*2);context.fillStyle='rgba(255,255,255,.85)';context.fill();});
  if(selected.length===3){context.strokeStyle='#e9b661';context.lineWidth=Math.max(4,width/150);context.beginPath();context.moveTo(selected[0].x*width,selected[0].y*height);context.lineTo(selected[1].x*width,selected[1].y*height);context.lineTo(selected[2].x*width,selected[2].y*height);context.stroke();for(const point of selected){context.beginPath();context.arc(point.x*width,point.y*height,Math.max(6,width/100),0,Math.PI*2);context.fillStyle='#e9b661';context.fill();}}
}

export async function mountCamera({onCapture}={}) {
  const video=document.querySelector('#camera-video');
  if(!video)return;
  const canvas=document.querySelector('#camera-canvas');
  const startButton=document.querySelector('#camera-start');
  const stopButton=document.querySelector('#camera-stop');
  const captureButton=document.querySelector('#camera-capture');
  const placeholder=document.querySelector('#camera-placeholder');
  let latest=null,min=Infinity,max=-Infinity,lastVideoTime=-1,counter={count:0,phase:'high'};
  const updateMetrics=()=>{document.querySelector('#camera-min').textContent=Number.isFinite(min)?`${Math.round(min)}°`:'—°';document.querySelector('#camera-max').textContent=Number.isFinite(max)?`${Math.round(max)}°`:'—°';document.querySelector('#camera-range').textContent=Number.isFinite(min)&&Number.isFinite(max)?`${Math.round(max-min)}°`:'—°';document.querySelector('#camera-reps').textContent=String(counter.count);};
  const reset=()=>{latest=null;min=Infinity;max=-Infinity;counter={count:0,phase:'high'};document.querySelector('#camera-angle').textContent='—°';document.querySelector('#camera-confidence').textContent='Aguardando detecção';captureButton.disabled=true;updateMetrics();};
  document.querySelector('#camera-reset').onclick=reset;
  async function initializeModel(){
    if(landmarker)return;
    setStatus('Carregando o modelo de pose no dispositivo…');
    const {FilesetResolver,PoseLandmarker}=await import(`${RUNTIME}/vision_bundle.mjs`);
    const vision=await FilesetResolver.forVisionTasks(`${RUNTIME}/wasm`);
    const options={runningMode:'VIDEO',numPoses:1,minPoseDetectionConfidence:.5,minPosePresenceConfidence:.5,minTrackingConfidence:.5};
    try{landmarker=await PoseLandmarker.createFromOptions(vision,{...options,baseOptions:{modelAssetPath:MODEL,delegate:'GPU'}});}catch{landmarker=await PoseLandmarker.createFromOptions(vision,{...options,baseOptions:{modelAssetPath:MODEL,delegate:'CPU'}});}
  }
  async function loop(){
    if(!running)return;
    if(video.readyState>=2&&video.currentTime!==lastVideoTime){
      lastVideoTime=video.currentTime;
      try{
        const result=landmarker.detectForVideo(video,performance.now());
        const landmarks=result.landmarks?.[0];
        if(landmarks){
          const joint=document.querySelector('#camera-joint').value,side=document.querySelector('#camera-side').value;
          const points=selectedPoints(landmarks,joint,side);drawPose(canvas,video,landmarks,points);
          const visibility=Math.min(...points.map(p=>p?.visibility??0));
          const angle=visibility>=.45?calculateAngle(...points,video.videoWidth/video.videoHeight):null;
          if(angle!=null){latest={angle,joint,side,visibility};min=Math.min(min,angle);max=Math.max(max,angle);document.querySelector('#camera-angle').textContent=`${Math.round(angle)}°`;document.querySelector('#camera-confidence').textContent=`Pontos visíveis · confiança mínima ${Math.round(visibility*100)}%`;captureButton.disabled=false;const low=Number(document.querySelector('#camera-low').value),high=Number(document.querySelector('#camera-high').value);counter=updateRepCounter(counter,angle,low,high);updateMetrics();}else{document.querySelector('#camera-confidence').textContent='Mantenha os três pontos selecionados visíveis';captureButton.disabled=true;}
        }else{canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);document.querySelector('#camera-confidence').textContent='Nenhuma postura detectada';captureButton.disabled=true;}
      }catch(error){setStatus(`Falha ao analisar quadro: ${error.message}`,true);}
    }
    frameHandle=requestAnimationFrame(loop);
  }
  startButton.onclick=async()=>{
    try{
      if(!navigator.mediaDevices?.getUserMedia)throw new Error('Acesso à câmera indisponível. Use HTTPS ou localhost e um navegador compatível.');
      startButton.disabled=true;await initializeModel();
      const facingMode=document.querySelector('#camera-facing').value;
      video.closest('.video-wrap')?.classList.toggle('mirrored',facingMode==='user');
      stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:facingMode},width:{ideal:1280},height:{ideal:720}},audio:false});
      video.srcObject=stream;await video.play();running=true;placeholder.hidden=true;stopButton.disabled=false;setStatus('Câmera ativa. O vídeo é processado localmente e não é gravado.');loop();
    }catch(error){startButton.disabled=false;setStatus(error.name==='NotAllowedError'?'Permissão de câmera negada. Libere o acesso nas configurações do navegador.':error.message,true);}
  };
  stopButton.onclick=()=>cleanupCamera();
  captureButton.onclick=()=>{
    if(!latest)return;
    const detail={date:new Date().toLocaleDateString('sv-SE'),value:String(Math.round(latest.angle*10)/10),side:latest.side==='left'?'Esquerdo':'Direito',joint:ANGLE_OPTIONS[latest.joint].label,goniometryId:`camera-${latest.joint}`,notes:`Estimativa 2D por câmera; confiança mínima dos pontos: ${Math.round(latest.visibility*100)}%; mínimo ${Math.round(min)}°, máximo ${Math.round(max)}°, amplitude observada ${Math.round(max-min)}°; ciclos ${counter.count}.`,source:'MediaPipe Pose Landmarker 0.10.35; cálculo angular original do Fisio Clínico.'};
    onCapture?.(detail);
  };
}

export function cleanupCamera() {
  running=false;
  if(frameHandle)cancelAnimationFrame(frameHandle);
  frameHandle=undefined;
  if(stream){stream.getTracks().forEach(track=>track.stop());stream=undefined;}
  const video=document.querySelector('#camera-video');if(video)video.srcObject=null;const canvas=document.querySelector('#camera-canvas');if(canvas)canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);
  const start=document.querySelector('#camera-start'),stop=document.querySelector('#camera-stop'),placeholder=document.querySelector('#camera-placeholder');
  if(start)start.disabled=false;if(stop)stop.disabled=true;if(placeholder)placeholder.hidden=false;
  setStatus('Câmera desligada.');
}
