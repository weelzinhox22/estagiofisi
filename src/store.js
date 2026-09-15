import { exercises as clinicalExercises } from './clinical-data.js';

export const STORAGE_KEY = 'fisio-clinico:v2';
export const LEGACY_KEY = 'fisio-clinico:v1';
export const SOURCE = 'Conteúdo educacional original do Fisio Clínico (2026).';
export const catalog = clinicalExercises;
export const emptyState = () => ({ version:4, patients:[], assessments:[], plans:[], sessions:[], exercises:[], favorites:[], repertoires:[], goniometryRecords:[], caseDiscussions:[] });
export const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const today = () => new Date().toLocaleDateString('sv-SE');

function validRow(row) { return row && typeof row === 'object' && !Array.isArray(row) && typeof row.id === 'string'; }
export function validateState(value) {
  if (!value || ![1,2,3,4].includes(value.version)) throw new Error('Arquivo de backup incompatível.');
  const state = emptyState();
  for (const key of ['patients','assessments','plans','sessions','exercises']) {
    if (!Array.isArray(value[key]) || !value[key].every(validRow)) throw new Error(`Dados inválidos: ${key}.`);
    state[key] = value[key];
  }
  if (state.exercises.some(ex => !ex.name || !ex.source)) throw new Error('Todos os exercícios precisam de nome e fonte.');
  if (value.version >= 2) {
    for (const key of ['repertoires','goniometryRecords']) {
      if (!Array.isArray(value[key]) || !value[key].every(validRow)) throw new Error(`Dados inválidos: ${key}.`);
      state[key] = value[key];
    }
    if (!Array.isArray(value.favorites) || !value.favorites.every(x => typeof x === 'string')) throw new Error('Dados inválidos: favoritos.');
    state.favorites = [...new Set(value.favorites)];
  }
  if (value.version >= 3) {
    if (!Array.isArray(value.caseDiscussions) || !value.caseDiscussions.every(validRow)) throw new Error('Dados inválidos: discussões de caso.');
    state.caseDiscussions = value.caseDiscussions;
  }
  state.version = 4;
  return state;
}
export function loadState(storage = globalThis.localStorage) {
  try {
    const current = storage.getItem(STORAGE_KEY);
    if (current) return validateState(JSON.parse(current));
    const legacy = storage.getItem(LEGACY_KEY);
    if (legacy) { const migrated = validateState(JSON.parse(legacy)); saveState(migrated, storage); return migrated; }
    return emptyState();
  } catch { return emptyState(); }
}
export function saveState(state, storage = globalThis.localStorage) { storage.setItem(STORAGE_KEY, JSON.stringify(validateState(state))); }
export function addRecord(state, collection, payload) {
  if (!['patients','assessments','plans','sessions','exercises','repertoires','goniometryRecords','caseDiscussions'].includes(collection)) throw new Error('Coleção inválida.');
  if (collection === 'exercises' && (!payload.name?.trim() || !payload.source?.trim())) throw new Error('Informe nome e fonte do exercício.');
  const row = { ...payload, id:uid(), createdAt:new Date().toISOString() };
  state[collection].push(row);
  return row;
}
export function updateRecord(state, collection, id, payload) {
  if (!['patients','assessments','plans','sessions','exercises','repertoires','goniometryRecords','caseDiscussions'].includes(collection)) throw new Error('Coleção inválida.');
  const row=state[collection].find(item=>item.id===id);
  if(!row)throw new Error('Registro não encontrado.');
  Object.assign(row,payload,{id:row.id,updatedAt:new Date().toISOString()});
  return row;
}
export function removeRecord(state, collection, id) {
  if (!['assessments','plans','sessions','goniometryRecords'].includes(collection)) throw new Error('Coleção inválida para exclusão.');
  const index=state[collection].findIndex(item=>item.id===id);
  if(index<0)throw new Error('Registro não encontrado.');
  return state[collection].splice(index,1)[0];
}
export function toggleFavorite(state, key) {
  const index = state.favorites.indexOf(key);
  if (index >= 0) state.favorites.splice(index, 1); else state.favorites.push(key);
  return index < 0;
}
export function addToRepertoire(state, repertoireId, itemKey) {
  const repertoire = state.repertoires.find(x => x.id === repertoireId);
  if (!repertoire) throw new Error('Repertório não encontrado.');
  repertoire.items ||= [];
  if (!repertoire.items.includes(itemKey)) repertoire.items.push(itemKey);
}
export function patientRecords(state, patientId) {
  return { assessments:state.assessments.filter(x => x.patientId === patientId), plans:state.plans.filter(x => x.patientId === patientId), sessions:state.sessions.filter(x => x.patientId === patientId), goniometryRecords:state.goniometryRecords.filter(x => x.patientId === patientId) };
}
export function painSeries(sessions) {
  return sessions.filter(s => s.painBefore !== '' && s.painBefore != null).sort((a,b) => a.date.localeCompare(b.date)).map(s => ({date:s.date, before:Number(s.painBefore), after:s.painAfter === '' || s.painAfter == null ? null : Number(s.painAfter)}));
}


