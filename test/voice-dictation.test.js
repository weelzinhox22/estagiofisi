import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { appendTranscript, enhanceVoiceInputs, VOICE_FIELD_NAMES } from '../src/voice-dictation.js';
import { handleTranscription, transcriptionConfig, validAudioContentType } from '../scripts/transcription-proxy.mjs';

function responseRecorder(){return {status:0,headers:{},body:'',writeHead(status,headers){this.status=status;this.headers=headers;return this;},end(body=''){this.body=body;return this;}};}
function request(body='audio'){const req=Readable.from([Buffer.from(body)]);req.method='POST';req.headers={'content-type':'multipart/form-data; boundary=qa','content-length':String(body.length),'x-forwarded-for':'qa-test'};req.socket={remoteAddress:'qa-test'};return req;}

test('insere transcrição na posição do cursor sem apagar o texto existente',()=>{
  assert.equal(appendTranscript('Dor no joelho.','Marcha com apoio.',14,14),'Dor no joelho. Marcha com apoio.');
  assert.equal(appendTranscript('Antes depois','durante',6,6),'Antes durante depois');
  assert.ok(['caseText','complaint','evolution','notes','report'].every(name=>VOICE_FIELD_NAMES.has(name)));
});

test('injeta controle de ditado nos campos clínicos elegíveis',()=>{
  const OriginalTextArea=globalThis.HTMLTextAreaElement,OriginalInput=globalThis.HTMLInputElement,OriginalDocument=globalThis.document;
  class FakeTextArea{} class FakeInput{}
  globalThis.HTMLTextAreaElement=FakeTextArea;globalThis.HTMLInputElement=FakeInput;
  const field=new FakeTextArea();Object.assign(field,{dataset:{},name:'notes',insertAdjacentElement(position,button){this.position=position;this.button=button;}});
  globalThis.document={createElement(){return {dataset:{},setAttribute(){},addEventListener(){}};}};
  try{enhanceVoiceInputs({querySelectorAll:()=>[field]});assert.equal(field.dataset.voiceEnhanced,'true');assert.equal(field.position,'afterend');assert.equal(field.button.textContent,'🎙 Ditar');}
  finally{globalThis.HTMLTextAreaElement=OriginalTextArea;globalThis.HTMLInputElement=OriginalInput;globalThis.document=OriginalDocument;}
});
test('proxy exige multipart e configuração somente no servidor',async()=>{
  assert.equal(validAudioContentType('multipart/form-data; boundary=x'),true);
  assert.equal(validAudioContentType('application/json'),false);
  assert.equal(transcriptionConfig({}).apiKey,'');
  const req=request(),res=responseRecorder();req.headers['content-type']='application/json';
  await handleTranscription(req,res,{env:{GROQ_API_KEY:'test'}});assert.equal(res.status,415);
});

test('proxy encaminha áudio e devolve somente o texto transcrito',async()=>{
  const req=request(),res=responseRecorder();let authorization='';
  const fetchImpl=async(url,options)=>{authorization=options.headers.Authorization;assert.match(url,/audio\/transcriptions$/);assert.ok(Buffer.isBuffer(options.body));return {ok:true,status:200,json:async()=>({text:'Paciente relata melhora na caminhada.'})};};
  await handleTranscription(req,res,{env:{GROQ_API_KEY:'server-secret'},fetchImpl});
  assert.equal(res.status,200);assert.equal(JSON.parse(res.body).text,'Paciente relata melhora na caminhada.');assert.equal(authorization,'Bearer server-secret');assert.doesNotMatch(res.body,/server-secret/);
});

test('proxy não inicia sem chave configurada',async()=>{
  const res=responseRecorder();await handleTranscription(request(),res,{env:{}});assert.equal(res.status,503);assert.match(res.body,/não foi configurada/);
});
