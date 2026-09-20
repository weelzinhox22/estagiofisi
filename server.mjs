import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { loadEnvFile } from 'node:process';
import { handleTranscription } from './scripts/transcription-proxy.mjs';

const root = resolve(import.meta.dirname);
try { loadEnvFile(resolve(root,'.env.local')); } catch {}
try { loadEnvFile(resolve(root,'.env')); } catch {}
const port = Number(process.env.PORT || 4173);
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.webmanifest':'application/manifest+json', '.json':'application/json; charset=utf-8', '.wasm':'application/wasm', '.task':'application/octet-stream' };
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === '/api/transcribe') { await handleTranscription(req,res); return; }
    const target = resolve(root, '.' + pathname);
    if (target !== root && !target.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    const file = (await stat(target)).isDirectory() ? resolve(target, 'index.html') : target;
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control':'no-cache', 'X-Content-Type-Options':'nosniff' }).end(body);
  } catch { res.writeHead(404, { 'Content-Type':'text/plain; charset=utf-8' }).end('Não encontrado'); }
}).listen(port, () => console.log(`Fisio Clínico: http://localhost:${port}`));
