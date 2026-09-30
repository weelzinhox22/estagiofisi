const GROQ_ENDPOINT='https://api.groq.com/openai/v1/chat/completions';
const requests=new Map();
function send(res,status,payload){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}).end(JSON.stringify(payload));}
function address(req){return String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'local').split(',')[0].trim();}
function allowed(key,now=Date.now()){const recent=(requests.get(key)||[]).filter(time=>now-time<60000);if(recent.length>=14)return false;recent.push(now);requests.set(key,recent);return true;}
async function readJson(req){const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>90000)throw Object.assign(new Error('A conversa é muito grande.'),{statusCode:413});chunks.push(chunk);}return JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}');}
async function authenticate(req,fetchImpl,env){const token=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');if(!token)return null;if(!env.SUPABASE_URL||!env.SUPABASE_PUBLISHABLE_KEY)throw Object.assign(new Error('Autenticação do servidor não configurada.'),{statusCode:503});const response=await fetchImpl(`${env.SUPABASE_URL}/auth/v1/user`,{headers:{apikey:env.SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${token}`}});return response.ok?response.json():null;}
const SYSTEM=`Você é o Mentor do Fisio Clínico, um professor particular de fisioterapia para um estagiário iniciante no Brasil. Responda sempre em português brasileiro, com clareza, acolhimento e rigor.
Ajude a organizar anamnese e avaliação, escolher perguntas e medidas, explicar raciocínio, revisar escrita clínica, produzir rascunhos de evolução ou SOAP e preparar discussões com o supervisor.
Regras obrigatórias:
- Use somente os fatos fornecidos. Nunca invente achados, testes, diagnóstico, dose, resposta, segurança ou conduta realizada.
- Diferencie fato registrado, hipótese a investigar, informação ausente e sugestão educacional.
- Não confirme diagnóstico nem substitua avaliação presencial, supervisão ou decisão do profissional responsável.
- Se houver risco, piora inesperada, sinais sistêmicos, neurológicos progressivos ou trauma relevante, priorize perguntas de segurança e discussão/encaminhamento conforme o contexto.
- Em evolução, SOAP ou avaliação, não preencha lacunas: use “não informado” ou liste o que falta.
- Ao sugerir teste, exercício ou conduta, explique objetivo, execução geral, o que observar, o que responde e o que não permite concluir. Dose é somente faixa educacional para discussão.
- Não solicite nem repita nome, documento, telefone, endereço, foto ou qualquer identificador. Se surgir um identificador evidente, avise para removê-lo e não o reproduza.
- Prefira respostas práticas em próximos passos e termine, quando útil, com perguntas para continuar o raciocínio.`;
function cleanMessages(value){if(!Array.isArray(value))return[];return value.slice(-24).map(item=>({role:item?.role==='assistant'?'assistant':'user',content:String(item?.content||'').trim().slice(0,6000)})).filter(item=>item.content);}
export async function handleMentorChat(req,res,{fetchImpl=fetch,env=process.env}={}){
  if(req.method!=='POST'){send(res,405,{error:'Método não permitido.'});return;}
  try{const user=await authenticate(req,fetchImpl,env);if(!user){send(res,401,{error:'Entre novamente para conversar com o Mentor.'});return;}if(!allowed(`${user.id}:${address(req)}`)){send(res,429,{error:'Muitas mensagens em pouco tempo. Aguarde um minuto.'});return;}if(!env.GROQ_API_KEY){send(res,503,{error:'O Mentor ainda não está configurado no servidor.'});return;}
    const body=await readJson(req),messages=cleanMessages(body.messages);if(!messages.length||messages.at(-1).role!=='user'){send(res,400,{error:'Escreva uma pergunta para o Mentor.'});return;}
    const mode=String(body.mode||'raciocínio e próximos passos').slice(0,60),upstream=await fetchImpl(GROQ_ENDPOINT,{method:'POST',headers:{Authorization:`Bearer ${env.GROQ_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:env.GROQ_CLINICAL_MODEL||'openai/gpt-oss-120b',temperature:.18,max_completion_tokens:3200,messages:[{role:'system',content:`${SYSTEM}\nFOCO DESTA CONVERSA: ${mode}.`},...messages]})}),payload=await upstream.json().catch(()=>({}));
    if(!upstream.ok){send(res,upstream.status===401?503:502,{error:upstream.status===401?'A chave da Groq foi recusada.':'O Mentor não conseguiu responder agora.'});return;}const reply=String(payload.choices?.[0]?.message?.content||'').trim();if(!reply)throw new Error('O Mentor devolveu uma resposta vazia.');send(res,200,{reply});
  }catch(error){send(res,error.statusCode||502,{error:error.name==='SyntaxError'?'Conversa inválida.':error.message||'Falha ao conversar com o Mentor.'});}
}
