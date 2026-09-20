import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');
const pkg=JSON.parse(await readFile(resolve(root,'package.json'),'utf8'));
await writeFile(resolve(root,'src/version.js'),`// Gerado de package.json. Não editar manualmente.\nexport const APP_VERSION='${pkg.version}';\n`,'utf8');
