import test from 'node:test';import assert from 'node:assert/strict';
import { downloadMaterials } from '../src/downloads-data.js';
import { downloadsPage } from '../src/downloads-ui.js';
import { morePage } from '../src/v06-ui.js';
test('lista todos os links únicos fornecidos',()=>{assert.equal(downloadMaterials.length,40);assert.equal(new Set(downloadMaterials.map(item=>item.id)).size,40);assert.ok(downloadMaterials.every(item=>item.viewUrl.includes(item.id)&&item.downloadUrl.includes(item.id)));});
test('busca e categoria filtram os materiais',()=>{const html=downloadsPage('Kisner','Exercício terapêutico');assert.match(html,/Fundamentos e Técnicas/);assert.doesNotMatch(html,/Fisiopatologia Pulmonar/);});
test('arquivos liberados exibem nomes e categorias reais',()=>{const ids=['1kDBc2n_UL0Ze0gJE1bmTX8cVkDePADmC','1NtupvoV6JrVc3vQcl1c_aa4ikcFJ1LAy','1KmTemhCI_nWaT5Xe9ZsptXAkSjUxLzU8'];const rows=downloadMaterials.filter(item=>ids.includes(item.id));assert.equal(rows.length,3);assert.ok(rows.every(item=>!item.restricted&&!item.name.includes('acesso restrito')));assert.deepEqual(rows.map(item=>item.category),['Dermatologia','Cardiorrespiratória','Saúde da mulher']);});
test('Downloads ganha destaque e Mais usa navegação agrupada',()=>{const downloads=downloadsPage();const more=morePage();assert.match(downloads,/downloads-hero/);assert.match(more,/more-native-hero/);assert.match(more,/more-download-banner/);assert.match(more,/Estudo e consulta/);assert.match(more,/href="#aprender"/);});
