import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

async function files(dir) { return (await readdir(dir,{withFileTypes:true})).flatMap(entry => entry.isDirectory() ? [] : [join(dir,entry.name)]); }
const js = [...await files('src'), ...await files('scripts'), ...await files('test'), 'server.mjs', 'sw.js'].filter(x => /\.(m?js)$/.test(x));
const errors=[];
for (const file of js) {
  const text=await readFile(file,'utf8');
  if (/\t/.test(text)) errors.push(`${file}: contém tabulação`);
  if (/[ \t]+$/m.test(text)) errors.push(`${file}: contém espaço no fim da linha`);
  const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  if (result.status) errors.push(`${file}: ${result.stderr.trim()}`);
}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`${js.length} arquivos JavaScript verificados.`);
