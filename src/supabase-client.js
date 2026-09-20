export const SUPABASE_URL='https://hvpbouaonwolixgedjaf.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY='sb_publishable_sjn1b4UydL65F4OXdsekqg_-DU0PW6m';
const SESSION_KEY='fisio-clinico:supabase-session';

const decode=value=>{try{return JSON.parse(atob(value.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));}catch{return {};}};
export const sessionUser=session=>decode(session?.access_token||'');
function storageFor(remember){return remember?localStorage:sessionStorage;}
function clearStored(){localStorage.removeItem(SESSION_KEY);sessionStorage.removeItem(SESSION_KEY);}
export function persistSession(session,remember=true){clearStored();if(session)storageFor(remember).setItem(SESSION_KEY,JSON.stringify({...session,_remember:remember}));return session;}

async function request(path,{method='GET',body,token,headers={}}={}){
  const response=await fetch(`${SUPABASE_URL}${path}`,{method,headers:{apikey:SUPABASE_PUBLISHABLE_KEY,'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{...{Authorization:`Bearer ${SUPABASE_PUBLISHABLE_KEY}`}}),...headers},body:body===undefined?undefined:JSON.stringify(body)});
  const payload=await response.json().catch(()=>null);if(!response.ok)throw new Error(payload?.msg||payload?.message||payload?.error_description||payload?.error||'Falha na comunicação com o banco de dados.');return payload;
}
export async function signUp({email,password,displayName}){return request('/auth/v1/signup',{method:'POST',body:{email,password,data:{display_name:displayName,privacy_notice_accepted_at:new Date().toISOString()}}});}
export async function signIn({email,password,remember}){const session=await request('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password}});return persistSession(session,remember);}
export async function refreshSession(session){const next=await request('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:session.refresh_token}});return persistSession(next,session._remember!==false);}
export async function restoreSession(){
  const raw=localStorage.getItem(SESSION_KEY)||sessionStorage.getItem(SESSION_KEY);if(!raw)return null;
  try{const session=JSON.parse(raw),claims=sessionUser(session);if(!session.refresh_token)return null;if((claims.exp||0)*1000-Date.now()<120000)return await refreshSession(session);return session;}catch{clearStored();return null;}
}
export async function signOut(session){try{if(session?.access_token)await request('/auth/v1/logout',{method:'POST',token:session.access_token});}finally{clearStored();}}
export async function changePassword(session,password){return request('/auth/v1/user',{method:'PUT',token:session.access_token,body:{password}});}
export async function requestPasswordReset(email,redirectTo=location.origin){return request('/auth/v1/recover',{method:'POST',body:{email,redirect_to:redirectTo}});}
export async function getProfile(session){const id=sessionUser(session).sub;if(!id)return null;const rows=await request(`/rest/v1/profiles?id=eq.${encodeURIComponent(id)}&select=id,display_name,role,privacy_notice_accepted_at`,{token:session.access_token});return rows?.[0]||null;}
export async function rest(path,{method='GET',body,session,prefer}={}){return request(`/rest/v1/${path}`,{method,body,token:session.access_token,headers:prefer?{Prefer:prefer}:{}});}
