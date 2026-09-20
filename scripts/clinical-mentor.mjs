const GROQ_ENDPOINT='https://api.groq.com/openai/v1/chat/completions';
const MAX_INPUT=12000;
const requests=new Map();

function send(res,status,payload){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}).end(JSON.stringify(payload));}
function address(req){return String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'local').split(',')[0].trim();}
function allowed(key,now=Date.now()){const recent=(requests.get(key)||[]).filter(time=>now-time<60000);if(recent.length>=8)return false;recent.push(now);requests.set(key,recent);return true;}
async function readJson(req){if(req.body&&typeof req.body==='object'&&!Buffer.isBuffer(req.body))return req.body;if(typeof req.body==='string')return JSON.parse(req.body||'{}');const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>30000)throw Object.assign(new Error('O relato é muito grande.'),{statusCode:413});chunks.push(chunk);}return JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}');}
async function authenticate(req,fetchImpl,env){
  const token=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
  if(!token)return null;
  const url=env.SUPABASE_URL,key=env.SUPABASE_PUBLISHABLE_KEY;
  if(!url||!key)throw Object.assign(new Error('Autenticação do servidor não configurada.'),{statusCode:503});
  const response=await fetchImpl(`${url}/auth/v1/user`,{headers:{apikey:key,Authorization:`Bearer ${token}`}});
  return response.ok?response.json():null;
}
const item={type:'object',properties:{name:{type:'string'},why:{type:'string'},how:{type:'string'},whatToRecord:{type:'string'}},required:['name','why','how','whatToRecord'],additionalProperties:false};
const exercise={type:'object',properties:{name:{type:'string'},objective:{type:'string'},why:{type:'string'},howTo:{type:'string'},educationalDose:{type:'string'},makeEasier:{type:'string'},makeHarder:{type:'string'},stopAndDiscussIf:{type:'string'}},required:['name','objective','why','howTo','educationalDose','makeEasier','makeHarder','stopAndDiscussIf'],additionalProperties:false};
const schema={type:'object',properties:{caseSummary:{type:'string'},clinicalWritingDraft:{type:'string'},confirmedFacts:{type:'array',items:{type:'string'}},missingInformation:{type:'array',items:{type:'string'}},safetyQuestions:{type:'array',items:{type:'string'}},supervisorQuestions:{type:'array',items:{type:'string'}},suggestedAssessments:{type:'array',items:item},possibleApproaches:{type:'array',items:item},exercises:{type:'array',items:exercise},studyQuestions:{type:'array',items:{type:'string'}},limitations:{type:'string'}},required:['caseSummary','clinicalWritingDraft','confirmedFacts','missingInformation','safetyQuestions','supervisorQuestions','suggestedAssessments','possibleApproaches','exercises','studyQuestions','limitations'],additionalProperties:false};
const SYSTEM=`Você é um tutor educacional de raciocínio clínico para um estagiário iniciante de fisioterapia no Brasil.
Use exclusivamente os fatos fornecidos. Nunca invente exame, diagnóstico, contraindicação, prognóstico, dose individual ou resposta do paciente.
Não confirme diagnóstico. Diferencie fatos confirmados, informação ausente, pergunta de segurança, avaliação possível, conduta possível e exercício possível.
Toda sugestão depende de avaliação presencial, contexto, restrições e supervisão. Se faltarem dados, deixe isso explícito e faça perguntas antes de sugerir progressão.
O rascunho de escrita clínica deve ser objetivo, profissional, desidentificado e não pode acrescentar informação.
Para exercícios, explique objetivo, motivo, execução simples, faixa educacional não prescritiva, regressão, progressão e sinais para interromper e discutir. Prefira itens coerentes com o relato, mas não diga que são indicados ou seguros para aquela pessoa.
Responda em português brasileiro e somente no JSON solicitado.`;

export async function handleClinicalMentor(req,res,{fetchImpl=fetch,env=process.env}={}){
  if(req.method!=='POST'){send(res,405,{error:'Método não permitido.'});return;}
  try{
    const user=await authenticate(req,fetchImpl,env);if(!user){send(res,401,{error:'Entre novamente para usar o Mentor Clínico.'});return;}
    if(!allowed(`${user.id}:${address(req)}`)){send(res,429,{error:'Muitas análises em pouco tempo. Aguarde um minuto.'});return;}
    if(!env.GROQ_API_KEY){send(res,503,{error:'Mentor Clínico ainda não configurado no servidor.'});return;}
    const body=await readJson(req),caseText=String(body.caseText||'').trim().slice(0,MAX_INPUT),goal=String(body.goal||'').trim().slice(0,1000);
    if(caseText.length<20){send(res,400,{error:'Descreva o caso com um pouco mais de detalhe.'});return;}
    const upstream=await fetchImpl(GROQ_ENDPOINT,{method:'POST',headers:{Authorization:`Bearer ${env.GROQ_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:env.GROQ_CLINICAL_MODEL||'openai/gpt-oss-20b',temperature:0.15,max_completion_tokens:5000,messages:[{role:'system',content:SYSTEM},{role:'user',content:`RELATO DESIDENTIFICADO:\n${caseText}\n\nOBJETIVO OU DÚVIDA DO ESTAGIÁRIO:\n${goal||'Não informado.'}`}],response_format:{type:'json_schema',json_schema:{name:'clinical_mentor_response',strict:true,schema}}})});
    const payload=await upstream.json().catch(()=>({}));if(!upstream.ok){send(res,upstream.status===401?503:502,{error:upstream.status===401?'A chave da Groq foi recusada.':'A IA não conseguiu organizar o caso agora.'});return;}
    const content=payload.choices?.[0]?.message?.content;const result=typeof content==='string'?JSON.parse(content):content;if(!result?.caseSummary||!Array.isArray(result.exercises))throw new Error('Resposta clínica incompleta.');
    send(res,200,{result});
  }catch(error){send(res,error.statusCode||502,{error:error.name==='SyntaxError'?'Resposta inválida do serviço de IA.':error.message||'Falha ao analisar o caso.'});}
}
