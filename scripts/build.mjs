import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import './validate.mjs';

const root=resolve(import.meta.dirname,'..');
const output=resolve(root,'dist');
if(!output.startsWith(root+sep)) throw new Error('Destino de build fora do projeto.');
await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});
for(const item of ['index.html','manifest.webmanifest','sw.js','icons','src','public','LICENSE','THIRD_PARTY_NOTICES.md']) await cp(resolve(root,item),resolve(output,item),{recursive:true});
await rm(resolve(output,'public','fisio-clinico-mobile-kit'),{recursive:true,force:true});
await cp(resolve(root,'public','videos'),resolve(output,'videos'),{recursive:true});
await cp(resolve(root,'public','anatomy3d'),resolve(output,'anatomy3d'),{recursive:true});
console.log(`Build estático criado em ${output}`);
