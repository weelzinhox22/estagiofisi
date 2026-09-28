import test from 'node:test';import assert from 'node:assert/strict';
import { downloadMaterials } from '../src/downloads-data.js';
import { downloadsPage } from '../src/downloads-ui.js';
import { morePage } from '../src/v06-ui.js';
test('lista todos os links únicos fornecidos',()=>{assert.equal(downloadMaterials.length,33);assert.equal(new Set(downloadMaterials.map(item=>item.id)).size,33);assert.ok(downloadMaterials.every(item=>item.viewUrl.includes(item.id)&&item.downloadUrl.includes(item.id)));});
test('busca e categoria filtram os materiais',()=>{const html=downloadsPage('Kisner','Exercício terapêutico');assert.match(html,/Fundamentos e Técnicas/);assert.doesNotMatch(html,/Fisiopatologia Pulmonar/);});
test('Downloads ganha destaque e Mais usa navegação agrupada',()=>{const downloads=downloadsPage();const more=morePage();assert.match(downloads,/downloads-hero/);assert.match(more,/more-download-banner/);assert.match(more,/Estudo e consulta/);assert.match(more,/href="#aprender"/);});
