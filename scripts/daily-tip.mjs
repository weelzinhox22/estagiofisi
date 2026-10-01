let cached={date:'',payload:null};
function send(res,status,payload){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, max-age=1800'}).end(JSON.stringify(payload));}
async function account(req,fetchImpl,env){const token=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');if(!token||!env.SUPABASE_URL||!env.SUPABASE_PUBLISHABLE_KEY)return null;const response=await fetchImpl(`${env.SUPABASE_URL}/auth/v1/user`,{headers:{apikey:env.SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${token}`}});return response.ok?response.json():null;}
export async function handleDailyTip(req,res,{fetchImpl=fetch,env=process.env}={}){
  try{
    if(!await account(req,fetchImpl,env)){send(res,401,{error:'Entre novamente para receber a dica.'});return;}
    const date=new Date().toISOString().slice(0,10);if(cached.date===date&&cached.payload){send(res,200,cached.payload);return;}
    const query=encodeURIComponent('physiotherapy rehabilitation exercise OPEN_ACCESS:Y');
    const literature=await fetchImpl(`https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${query}&format=json&pageSize=5&sort=FIRST_PDATE_D`),data=await literature.json(),article=data.resultList?.result?.[0]||{};
    let tip=`Curiosidade do dia: estudos recentes em fisioterapia reforçam a importância de medir função e resposta ao exercício. Abra o Fisio Clínico para explorar a evidência.`;
    if(env.GROQ_API_KEY&&article.title){const response=await fetchImpl('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${env.GROQ_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:env.GROQ_MODEL||'llama-3.3-70b-versatile',temperature:.25,max_tokens:130,messages:[{role:'system',content:'Escreva em português brasileiro uma dica educacional de fisioterapia com até 220 caracteres baseada somente no título fornecido. Não prescreva e não exagere conclusões. Termine convidando a abrir o app.'},{role:'user',content:article.title}]})});const generated=await response.json().catch(()=>({}));tip=generated.choices?.[0]?.message?.content?.trim()||tip;}
    cached={date,payload:{title:'Dica diária do Fisio Clínico',body:tip,article:{title:article.title||'',url:article.doi?`https://doi.org/${article.doi}`:`https://europepmc.org/article/${article.source||'MED'}/${article.id||''}`}}};send(res,200,cached.payload);
  }catch(error){send(res,502,{error:error.message||'Não foi possível preparar a dica diária.'});}
}
