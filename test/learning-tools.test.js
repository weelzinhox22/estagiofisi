import test from 'node:test';
import assert from 'node:assert/strict';
import { handleLearningTool } from '../scripts/learning-tools.mjs';
const res=()=>({status:0,body:null,writeHead(status){this.status=status;return this;},end(value){this.body=JSON.parse(value);}});
test('ferramentas de aprendizagem exigem conta',async()=>{const output=res();await handleLearningTool({method:'POST',headers:{}},output,{env:{},fetchImpl:async()=>({ok:false})});assert.equal(output.status,401);});
test('modo inexistente é rejeitado antes de chamar a IA',async()=>{const output=res(),req={method:'POST',headers:{authorization:'Bearer x'},body:{mode:'inventado',input:'texto suficiente'}};await handleLearningTool(req,output,{env:{SUPABASE_URL:'https://s.test',SUPABASE_PUBLISHABLE_KEY:'p',GROQ_API_KEY:'g'},fetchImpl:async()=>({ok:true,json:async()=>({id:'u'})})});assert.equal(output.status,400);});
