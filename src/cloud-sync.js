import { rest, sessionUser } from './supabase-client.js';

let timer=0;
const ignored=new Set(['patients','syncConflicts']);
const stamp=row=>Date.parse(row?.updatedAt||row?.createdAt||0)||0;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const conflictId=(collection,id)=>`${collection}:${id}`;
function rememberConflict(state,collection,patientId,local,cloud,winner){
  state.syncConflicts||=[];const id=conflictId(collection,local.id||cloud.id);if(state.syncConflicts.some(row=>row.id===id))return;
  state.syncConflicts.push({id,collection,patientId:patientId||'',recordId:local.id||cloud.id,local,cloud,winner,createdAt:new Date().toISOString()});
}
function mergeRecordArray(state,key,remoteRows=[],patientId=''){
  if(!Array.isArray(state[key])||!Array.isArray(remoteRows))return;
  for(const cloud of remoteRows){const index=state[key].findIndex(local=>local.id===cloud.id);if(index<0){state[key].push(cloud);continue;}const local=state[key][index];if(same(local,cloud))continue;const cloudWins=stamp(cloud)>stamp(local);rememberConflict(state,key,patientId,local,cloud,cloudWins?'cloud':'local');if(cloudWins)state[key][index]=cloud;}
}
const patientSnapshot=(state,patient)=>({patient,collections:Object.fromEntries(Object.entries(state).filter(([key,value])=>!ignored.has(key)&&Array.isArray(value)).map(([key,value])=>[key,value.filter(row=>row&&typeof row==='object'&&row.patientId===patient.id)]))});
const workspaceSnapshot=state=>({collections:Object.fromEntries(Object.entries(state).filter(([key,value])=>!ignored.has(key)&&Array.isArray(value)).map(([key,value])=>[key,key==='favorites'?value:value.filter(row=>row&&typeof row==='object'&&!row.patientId)]))});

export async function syncAllPatients(state,session){
  if(!session?.access_token||!navigator.onLine)return {synced:0};const owner=sessionUser(session).sub;if(!owner)return {synced:0};
  const rows=state.patients.map(patient=>({owner_id:owner,local_patient_id:patient.id,patient_code:patient.code||patient.name||'Paciente',snapshot:patientSnapshot(state,patient),updated_at:new Date().toISOString()}));
  if(rows.length)await rest('patient_snapshots?on_conflict=owner_id,local_patient_id',{method:'POST',body:rows,session,prefer:'resolution=merge-duplicates,return=minimal'});
  await rest('user_workspaces?on_conflict=owner_id',{method:'POST',body:{owner_id:owner,snapshot:workspaceSnapshot(state),updated_at:new Date().toISOString()},session,prefer:'resolution=merge-duplicates,return=minimal'});
  return {synced:rows.length,workspace:true};
}
export function scheduleCloudSync(state,session,onError=()=>{}){clearTimeout(timer);timer=setTimeout(()=>syncAllPatients(state,session).catch(onError),800);}
export async function loadCloudSnapshots(session,all=false){const select='id,owner_id,local_patient_id,patient_code,snapshot,updated_at';return rest(`patient_snapshots?select=${select}&order=updated_at.desc${all?'':'&limit=500'}`,{session});}
export async function loadCloudWorkspace(session){const owner=sessionUser(session).sub,rows=await rest(`user_workspaces?owner_id=eq.${encodeURIComponent(owner)}&select=snapshot,updated_at&limit=1`,{session});return rows?.[0]||null;}
export function mergeCloudSnapshots(state,rows=[]){
  state.syncConflicts||=[];
  for(const row of rows){const snapshot=row.snapshot;if(!snapshot?.patient)continue;const cloud={...snapshot.patient,updatedAt:snapshot.patient.updatedAt||row.updated_at},index=state.patients.findIndex(item=>item.id===cloud.id);if(index<0)state.patients.push(cloud);else{const local=state.patients[index];if(!same(local,cloud)){const cloudWins=stamp(cloud)>stamp(local);rememberConflict(state,'patients',cloud.id,local,cloud,cloudWins?'cloud':'local');if(cloudWins)state.patients[index]=cloud;}}for(const [key,records] of Object.entries(snapshot.collections||{}))mergeRecordArray(state,key,records,cloud.id);}
  return state;
}
export function mergeCloudWorkspace(state,row){if(!row?.snapshot?.collections)return state;for(const [key,records] of Object.entries(row.snapshot.collections))if(key==='favorites'&&Array.isArray(records))state.favorites=[...new Set([...state.favorites,...records])];else mergeRecordArray(state,key,records);return state;}
export async function syncCloudState(state,session){mergeCloudSnapshots(state,await loadCloudSnapshots(session));mergeCloudWorkspace(state,await loadCloudWorkspace(session));const result=await syncAllPatients(state,session);return {...result,conflicts:state.syncConflicts?.length||0};}
