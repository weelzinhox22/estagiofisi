import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { loadEnvFile } from 'node:process';
import { handleTranscription } from './scripts/transcription-proxy.mjs';
import { handleClinicalMentor } from './scripts/clinical-mentor.mjs';
import { handleLearningTool } from './scripts/learning-tools.mjs';
import { handleArticleSearch } from './scripts/article-search.mjs';
import { handleMentorChat } from './scripts/mentor-chat.mjs';

const root = resolve(import.meta.dirname);
try { loadEnvFile(resolve(root,'.env.local')); } catch {}
try { loadEnvFile(resolve(root,'.env')); } catch {}
const port = Number(process.env.PORT || 4173);
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.mp4':'video/mp4', '.webmanifest':'application/manifest+json', '.json':'application/json; charset=utf-8', '.wasm':'application/wasm', '.task':'application/octet-stream' };
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === '/api/transcribe') { await handleTranscription(req,res); return; }
    if (pathname === '/api/clinical-mentor') { await handleClinicalMentor(req,res); return; }
    if (pathname === '/api/learning-tool') { await handleLearningTool(req,res); return; }
    if (pathname === '/api/articles') { await handleArticleSearch(req,res); return; }
    if (pathname === '/api/mentor-chat') { await handleMentorChat(req,res); return; }
    let target = resolve(root, '.' + pathname);
    if (target !== root && !target.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    let targetStat;
    try { targetStat=await stat(target); }
    catch { target=resolve(root,'public','.'+pathname);if(!target.startsWith(resolve(root,'public')+sep))throw new Error('Caminho inválido');targetStat=await stat(target); }
    const file = targetStat.isDirectory() ? resolve(target, 'index.html') : target;
    const body = await readFile(file);
    const type=types[extname(file)]||'application/octet-stream',range=req.headers.range;
    if(range&&type==='video/mp4'){
      const match=/bytes=(\d*)-(\d*)/.exec(range),start=Number(match?.[1]||0),requestedEnd=match?.[2]?Number(match[2]):body.length-1,end=Math.min(requestedEnd,body.length-1);
      if(!match||start>end||start>=body.length){res.writeHead(416,{'Content-Range':`bytes */${body.length}`}).end();return;}
      const chunk=body.subarray(start,end+1);
      res.writeHead(206,{'Content-Type':type,'Content-Length':chunk.length,'Content-Range':`bytes ${start}-${end}/${body.length}`,'Accept-Ranges':'bytes','Cache-Control':'public, max-age=86400','X-Content-Type-Options':'nosniff'}).end(chunk);return;
    }
    res.writeHead(200, { 'Content-Type':type,'Content-Length':body.length,'Accept-Ranges':type==='video/mp4'?'bytes':'none','Cache-Control':type==='video/mp4'?'public, max-age=86400':'no-cache','X-Content-Type-Options':'nosniff' }).end(body);
  } catch { res.writeHead(404, { 'Content-Type':'text/plain; charset=utf-8' }).end('Não encontrado'); }
}).listen(port, () => console.log(`Fisio Clínico: http://localhost:${port}`));
