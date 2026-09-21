import test from 'node:test';import assert from 'node:assert/strict';
import { normalizeLearningMode } from '../scripts/learning-tools.mjs';
import { learningToolPage } from '../src/learning-lab-ui.js';
const state={patients:[]};
test('nomes de ferramentas em português são aceitos pelo servidor',()=>{assert.equal(normalizeLearningMode('escrita'),'writing');assert.equal(normalizeLearningMode('agora'),'next');assert.equal(normalizeLearningMode('raciocinio'),'reasoning');assert.equal(normalizeLearningMode('primeira-sessao'),'session');assert.equal(normalizeLearningMode('tradutor'),'translate');});
test('interface envia modos reconhecidos e não exige confirmação repetitiva',()=>{const html=learningToolPage(state,'escrita',{});assert.match(html,/name="mode" value="writing"/);assert.doesNotMatch(html,/aiConsent|Groq/);});
