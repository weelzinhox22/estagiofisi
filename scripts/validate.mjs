import { exercises } from '../src/clinical-data.js';
import { muscles, clinicalTests, goniometry, reflexes, scales, functionalProblems } from '../src/reference-data.js';

const required = ['name','synonyms','category','region','joint','primaryMuscles','auxiliaryMuscles','startPosition','steps','objective','capacities','functionalApplication','equipment','side','difficulty','exampleDose','doseNotes','progressions','regressions','commonCompensations','commonErrors','care','stopWhen','clinicalNotes','tags','source','why'];
const failures = [];
if (exercises.length < 100) failures.push(`Exercícios: ${exercises.length} < 100`);
if (muscles.length < 20) failures.push(`Músculos: ${muscles.length} < 20`);
if (clinicalTests.length < 20) failures.push(`Testes: ${clinicalTests.length} < 20`);
if (functionalProblems.length < 10) failures.push(`Problemas: ${functionalProblems.length} < 10`);
for (const exercise of exercises) {
  for (const field of required) if (exercise[field] == null || exercise[field] === '' || (Array.isArray(exercise[field]) && !exercise[field].length)) failures.push(`${exercise.id}: campo ${field} vazio`);
  if (!exercise.exampleDose.startsWith('Exemplo educacional:')) failures.push(`${exercise.id}: dose não identificada como exemplo`);
  if (!exercise.source.includes('Conteúdo educacional original')) failures.push(`${exercise.id}: proveniência ausente`);
}
const ids = exercises.map(x => x.id);
if (new Set(ids).size !== ids.length) failures.push('IDs de exercícios duplicados');
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(JSON.stringify({ exercises:exercises.length, muscles:muscles.length, tests:clinicalTests.length, goniometry:goniometry.length, reflexes:reflexes.length, scales:scales.length, neuro:exercises.filter(x=>x.kind==='neuro').length, functionalProblems:functionalProblems.length }, null, 2));
