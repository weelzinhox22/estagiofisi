const endpoint='https://api.groq.com/openai/v1/chat/completions';
const fields=['nome','regiao_ou_categoria','descricao','objetivos','orientacoes','musculos','equipamentos','dosagem_mencionada_no_video','cuidados'];

function send(res,status,payload){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}).end(JSON.stringify(payload));}

async function read(req){
  if(req.body!=null){const raw=typeof req.body==='string'?req.body:Buffer.isBuffer(req.body)?req.body.toString('utf8'):JSON.stringify(req.body);if(Buffer.byteLength(raw,'utf8')>4*1024*1024)throw Object.assign(new Error('Os quadros do vídeo excederam o limite seguro de envio.'),{statusCode:413});return typeof req.body==='object'&&!Buffer.isBuffer(req.body)?req.body:JSON.parse(raw||'{}');}
  const chunks=[];let size=0;
  for await(const chunk of req){size+=chunk.length;if(size>4*1024*1024)throw Object.assign(new Error('Os quadros do vídeo excederam o limite seguro de envio.'),{statusCode:413});chunks.push(chunk);}
  return JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}');
}

async function user(req,fetchImpl,env){
  const token=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
  if(!token)return null;
  if(!env.SUPABASE_URL||!env.SUPABASE_PUBLISHABLE_KEY)throw Object.assign(new Error('A autenticação da análise não está configurada no servidor.'),{statusCode:503});
  const response=await fetchImpl(`${env.SUPABASE_URL}/auth/v1/user`,{headers:{apikey:env.SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${token}`}});
  if(!response.ok)return null;
  const value=await response.json().catch(()=>null);
  return value?.id?value:null;
}

function normalizeAnalysis(value){
  if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('A IA devolveu uma ficha inválida. Tente novamente.');
  const analysis={};
  for(const field of fields)analysis[field]=String(value[field]??'Não informado').trim().slice(0,3000)||'Não informado';
  return analysis;
}

export async function handleExerciseVideoAnalysis(req,res,{fetchImpl=fetch,env=process.env}={}){
  try{
    if(req.method!=='POST'){send(res,405,{error:'Método não permitido.'});return;}
    if(!await user(req,fetchImpl,env)){send(res,401,{error:'Entre novamente para analisar o vídeo.'});return;}
    if(!env.GROQ_API_KEY){send(res,503,{error:'A análise por IA não está configurada no servidor.'});return;}
    const body=await read(req);
    const frames=Array.isArray(body.frames)?body.frames.slice(0,5).filter(value=>/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(value)):[];
    if(frames.length<3){send(res,400,{error:'Não foi possível extrair quadros suficientes do vídeo.'});return;}
    const prompt=`Analise estas ${frames.length} imagens amostradas de um possível exercício fisioterapêutico. Elas não representam todos os instantes do vídeo. Contexto fornecido pelo usuário: ${String(body.context||'não informado').slice(0,1000)}. Duração total informada: ${Number(body.duration||0).toFixed(1)} s. Descreva apenas o que é visualmente sustentado. Não diagnostique, não prescreva, não invente dose, benefício, contraindicação, velocidade, fadiga ou eventos entre os quadros. Quando algo não puder ser confirmado, escreva "Não informado". Em cuidados, declare que a análise usa quadros amostrados e exige revisão profissional. Retorne SOMENTE JSON válido com as chaves: ${fields.join(', ')}. Use português brasileiro.`;
    const content=[{type:'text',text:prompt},...frames.map(image=>({type:'image_url',image_url:{url:image}}))];
    const upstream=await fetchImpl(endpoint,{method:'POST',headers:{Authorization:`Bearer ${env.GROQ_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:env.GROQ_VISION_MODEL||'qwen/qwen3.6-27b',temperature:.1,max_completion_tokens:1400,response_format:{type:'json_object'},messages:[{role:'user',content}]})});
    const payload=await upstream.json().catch(()=>({}));
    if(!upstream.ok){const denied=upstream.status===401||upstream.status===403,message=denied?'A chave do serviço de análise foi recusada.':upstream.status===429?'O serviço de análise atingiu o limite temporário. Tente novamente em instantes.':'A IA não conseguiu analisar estes quadros agora.';send(res,denied?503:502,{error:message});return;}
    const raw=String(payload.choices?.[0]?.message?.content||'').replace(/^```json\s*|\s*```$/g,'');
    if(!raw)throw new Error('A IA devolveu uma resposta vazia. Tente novamente.');
    const analysis=normalizeAnalysis(JSON.parse(raw));
    send(res,200,{analysis,meta:{frameCount:frames.length,sampling:'distributed',requiresProfessionalReview:true}});
  }catch(error){const known=error.statusCode?error.message:error.name==='SyntaxError'?'A resposta da análise não veio em formato válido. Tente novamente.':/^A IA devolveu/.test(error.message||'')?error.message:'Falha temporária ao analisar o vídeo. Tente novamente.';send(res,error.statusCode||502,{error:known});}
}
