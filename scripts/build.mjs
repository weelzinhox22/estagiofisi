import { access, cp, mkdir, rm } from 'node:fs/promises';
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
await cp(resolve(root,'public','anatomy3d'),resolve(output,'anatomy3d'),{recursive:true});const neuroquestFiles=['src/neuro-games-ui.js','src/neuro-games-data.js','src/neuro-games.css','public/neurogames/neuroquest_2_mapa_cartas_biblioteca.html','public/neurogames/neuroquest.css','public/neurogames/neuroquest-2d-expedition-keyart.webp','public/neurogames/neuroquest-2d-sprites.svg','public/neurogames/neuroquest-illustration-sprite.png','public/neurogames/neuroquest-mystery-room.png'];
for(const file of neuroquestFiles){const target=resolve(output,file);if(!target.startsWith(output+sep))throw new Error(`Asset do NeuroQuest fora do build: ${file}`);try{await access(target);}catch{throw new Error(`Build incompleto: arquivo do NeuroQuest ausente (${file})`);}}
console.log(`Build estático criado em ${output}`);
