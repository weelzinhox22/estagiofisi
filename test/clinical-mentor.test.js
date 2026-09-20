import test from 'node:test';
import assert from 'node:assert/strict';
import { handleClinicalMentor } from '../scripts/clinical-mentor.mjs';

const response=()=>({status:0,payload:null,writeHead(status){this.status=status;return this;},end(body){this.payload=JSON.parse(body);}});
test('mentor exige sessão autenticada',async()=>{const res=response();await handleClinicalMentor({method:'POST',headers:{},socket:{}},res,{env:{},fetchImpl:async()=>({ok:false})});assert.equal(res.status,401);});
test('mentor não aceita relato curto',async()=>{const res=response(),req={method:'POST',headers:{authorization:'Bearer token'},socket:{},async *[Symbol.asyncIterator](){yield Buffer.from('{"caseText":"dor"}');}};await handleClinicalMentor(req,res,{env:{SUPABASE_URL:'https://example.test',SUPABASE_PUBLISHABLE_KEY:'public',GROQ_API_KEY:'secret'},fetchImpl:async url=>url.includes('/auth/')?{ok:true,json:async()=>({id:'u1'})}:{ok:true,json:async()=>({})}});assert.equal(res.status,400);});
