import { rest, sessionUser } from './supabase-client.js';

let timer=0;
const patientSnapshot=(state,patient)=>({patient,collections:Object.fromEntries(Object.entries(state).filter(([,value])=>Array.isArray(value)).map(([key,value])=>[key,value.filter(row=>row.patientId===patient.id)]))});
export async function syncAllPatients(state,session){
  if(!session?.access_token||!navigator.onLine)return {synced:0};const owner=sessionUser(session).sub;if(!owner)return {synced:0};
  const rows=state.patients.map(patient=>({owner_id:owner,local_patient_id:patient.id,patient_code:patient.code||patient.name||'Paciente',snapshot:patientSnapshot(state,patient),updated_at:new Date().toISOString()}));
  if(rows.length)await rest('patient_snapshots?on_conflict=owner_id,local_patient_id',{method:'POST',body:rows,session,prefer:'resolution=merge-duplicates,return=minimal'});return {synced:rows.length};
}
export function scheduleCloudSync(state,session,onError=()=>{}){clearTimeout(timer);timer=setTimeout(()=>syncAllPatients(state,session).catch(onError),800);}
export async function loadCloudSnapshots(session,all=false){const select='id,owner_id,local_patient_id,patient_code,snapshot,updated_at';return rest(`patient_snapshots?select=${select}&order=updated_at.desc${all?'':'&limit=500'}`,{session});}
export function mergeCloudSnapshots(state,rows=[]){
  for(const row of rows){const snapshot=row.snapshot;if(!snapshot?.patient)continue;const index=state.patients.findIndex(item=>item.id===snapshot.patient.id);if(index>=0)state.patients[index]=snapshot.patient;else state.patients.push(snapshot.patient);for(const [key,records] of Object.entries(snapshot.collections||{})){if(!Array.isArray(state[key])||!Array.isArray(records))continue;const foreign=state[key].filter(item=>item.patientId!==snapshot.patient.id);state[key]=[...foreign,...records];}}
  return state;
}
