import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { videoLibraryPage } from '../src/video-library-ui.js';

const root=resolve(import.meta.dirname,'..');
const catalog=JSON.parse(await readFile(resolve(root,'public/videos/catalogo.json'),'utf8'));

test('catálogo referencia 50 vídeos existentes',async()=>{
  assert.equal(catalog.length,50);
  assert.equal(new Set(catalog.map(item=>item.id)).size,50);
  for(const item of catalog){const info=await stat(resolve(root,'public',item.arquivo));assert.ok(info.size>1000,`${item.arquivo} está vazio`);}
});

test('material complementar fica separado dos exercícios',()=>{
  const html=videoLibraryPage(catalog);
  assert.match(html,/Material complementar/);
  assert.equal(catalog.filter(item=>item.tipo_conteudo==='material_complementar_educativo').length,1);
});

test('players são acessíveis, responsivos e não usam autoplay',()=>{
  const html=videoLibraryPage(catalog,'quadríceps','Todas');
  assert.match(html,/<video controls playsinline preload="none"/);
  assert.match(html,/aria-label="Demonstração em vídeo:/);
  assert.doesNotMatch(html,/autoplay|video_de_origem|trecho_de_origem_segundos/);
});

test('busca e categoria restringem os vídeos exibidos',()=>{
  const html=videoLibraryPage(catalog,'rotação','Ombro');
  assert.match(html,/Rotação externa do ombro com faixa/);
  assert.match(html,/Rotação interna e externa do ombro/);
  assert.doesNotMatch(html,/Marcha com transposição de cones/);
  assert.doesNotMatch(html,/Rotação interna do quadril/);
});
