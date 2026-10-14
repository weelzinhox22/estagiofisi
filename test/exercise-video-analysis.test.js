import test from 'node:test';
import assert from 'node:assert/strict';
import vercelHandler from '../api/analyze-exercise-video.mjs';
import { handleExerciseVideoAnalysis } from '../scripts/exercise-video-analysis.mjs';
import { exerciseVideoUploadPanel, VIDEO_FRAME_RATIOS } from '../src/exercise-video-upload.js';

const response=()=>({status:0,headers:{},payload:null,writeHead(status,headers={}){this.status=status;this.headers=headers;return this;},end(body){this.payload=JSON.parse(body);return this;}});
const jpeg='data:image/jpeg;base64,AAAA';
const env={SUPABASE_URL:'https://supabase.test',SUPABASE_PUBLISHABLE_KEY:'public',GROQ_API_KEY:'secret'};

test('wrapper Vercel da análise existe e rejeita GET',async()=>{
  const res=response();
  await vercelHandler({method:'GET',headers:{}},res);
  assert.equal(res.status,405);
  assert.equal(res.payload.error,'Método não permitido.');
});

test('análise exige sessão antes de configuração externa',async()=>{
  const res=response();let calls=0;
  await handleExerciseVideoAnalysis({method:'POST',headers:{},body:{}},res,{env:{},fetchImpl:async()=>{calls+=1;}});
  assert.equal(res.status,401);
  assert.equal(calls,0);
});

test('envia no máximo cinco quadros ao modelo visual atual',async()=>{
  const res=response(),calls=[];
  const fetchImpl=async(url,options={})=>{calls.push({url,options});if(url.includes('/auth/'))return {ok:true,json:async()=>({id:'u1'})};return {ok:true,status:200,json:async()=>({choices:[{message:{content:JSON.stringify({nome:'Agachamento',descricao:'Movimento observado'})}}]})};};
  await handleExerciseVideoAnalysis({method:'POST',headers:{authorization:'Bearer token'},body:{frames:Array(6).fill(jpeg),context:'teste',duration:10}},res,{env,fetchImpl});
  assert.equal(res.status,200);
  const groqBody=JSON.parse(calls[1].options.body);
  assert.equal(groqBody.model,'qwen/qwen3.6-27b');
  assert.equal(groqBody.response_format.type,'json_object');
  assert.equal(groqBody.messages[0].content.filter(item=>item.type==='image_url').length,5);
  assert.equal(res.payload.meta.frameCount,5);
  assert.equal(res.payload.analysis.equipamentos,'Não informado');
});

test('aceita corpo JSON em string como pode ocorrer no runtime',async()=>{
  const res=response();
  const fetchImpl=async url=>url.includes('/auth/')?{ok:true,json:async()=>({id:'u1'})}:{ok:true,status:200,json:async()=>({choices:[{message:{content:'{"nome":"Marcha"}'}}]})};
  await handleExerciseVideoAnalysis({method:'POST',headers:{authorization:'Bearer token'},body:JSON.stringify({frames:Array(3).fill(jpeg),duration:4})},res,{env,fetchImpl});
  assert.equal(res.status,200);
  assert.equal(res.payload.analysis.nome,'Marcha');
});

test('resposta inválida da IA não vaza detalhes internos',async()=>{
  const res=response();
  const fetchImpl=async url=>url.includes('/auth/')?{ok:true,json:async()=>({id:'u1'})}:{ok:true,status:200,json:async()=>({choices:[{message:{content:'não é json'}}]})};
  await handleExerciseVideoAnalysis({method:'POST',headers:{authorization:'Bearer token'},body:{frames:Array(3).fill(jpeg)}},res,{env,fetchImpl});
  assert.equal(res.status,502);
  assert.match(res.payload.error,/formato válido/);
  assert.doesNotMatch(res.payload.error,/SyntaxError|token|secret/);
});

test('interface mostra consentimento, limite e progresso acessível',()=>{
  assert.equal(VIDEO_FRAME_RATIOS.length,5);
  const html=exerciseVideoUploadPanel({loading:true,progress:44,stage:'Extraindo quadros…',progressDetail:'Quadro 3 de 5'});
  assert.match(html,/Groq/);
  assert.match(html,/cinco quadros reduzidos/);
  assert.match(html,/<progress[^>]+value="44"/);
  assert.match(html,/aria-live="polite"/);
  assert.match(html,/não avalia cada segundo/);
});
