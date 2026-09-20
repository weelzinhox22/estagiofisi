const MAX_AUDIO_BYTES=25*1024*1024;
const WINDOW_MS=60000;
const MAX_REQUESTS_PER_WINDOW=10;
const requestsByAddress=new Map();

export function validAudioContentType(value=''){return /^multipart\/form-data;\s*boundary=/i.test(value);}
export function transcriptionConfig(env=process.env){return {apiKey:env.GROQ_API_KEY||'',endpoint:'https://api.groq.com/openai/v1/audio/transcriptions'};}

function clientAddress(req){return String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'local').split(',')[0].trim();}
function allowed(address,now=Date.now()){
  const recent=(requestsByAddress.get(address)||[]).filter(time=>now-time<WINDOW_MS);if(recent.length>=MAX_REQUESTS_PER_WINDOW)return false;recent.push(now);requestsByAddress.set(address,recent);return true;
}
async function bodyBuffer(req){
  if(Buffer.isBuffer(req.body))return req.body;
  if(typeof req.body==='string')return Buffer.from(req.body);
  const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>MAX_AUDIO_BYTES)throw Object.assign(new Error('Áudio maior que 25 MB.'),{statusCode:413});chunks.push(chunk);}return Buffer.concat(chunks);
}
function json(res,status,payload){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}).end(JSON.stringify(payload));}

export async function handleTranscription(req,res,{fetchImpl=fetch,env=process.env}={}){
  if(req.method!=='POST'){json(res,405,{error:'Método não permitido.'});return;}
  const {apiKey,endpoint}=transcriptionConfig(env);if(!apiKey){json(res,503,{error:'Transcrição por voz ainda não foi configurada no servidor.'});return;}
  const type=String(req.headers['content-type']||'');if(!validAudioContentType(type)){json(res,415,{error:'Envie o áudio como formulário multipart.'});return;}
  const declared=Number(req.headers['content-length']||0);if(declared>MAX_AUDIO_BYTES){json(res,413,{error:'O áudio excede o limite de 25 MB.'});return;}
  if(!allowed(clientAddress(req))){json(res,429,{error:'Muitas transcrições em pouco tempo. Aguarde um minuto.'});return;}
  try{
    const body=await bodyBuffer(req),controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),120000);
    let upstream;try{upstream=await fetchImpl(endpoint,{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':type,Accept:'application/json'},body,signal:controller.signal});}finally{clearTimeout(timeout);}
    const payload=await upstream.json().catch(()=>({}));
    if(!upstream.ok){const message=upstream.status===401?'A chave da Groq foi recusada.':'A Groq não conseguiu transcrever este áudio.';json(res,upstream.status>=500?502:upstream.status,{error:message});return;}
    const text=String(payload.text||'').trim();if(!text){json(res,502,{error:'A Groq retornou uma transcrição vazia.'});return;}json(res,200,{text});
  }catch(error){json(res,error.statusCode||502,{error:error.name==='AbortError'?'A transcrição excedeu o tempo limite.':error.message||'Falha ao processar o áudio.'});}
}
