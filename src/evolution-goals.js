const clean=value=>String(value??'').trim();
const normalized=value=>clean(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const lowerFirst=value=>{const text=clean(value).replace(/[.;,:]+$/,'');return text?text.charAt(0).toLowerCase()+text.slice(1):'';};
const tokens=value=>normalized(value)
  .replace(/\b\d+(?:[.,]\d+)?\s*(?:x|s|seg(?:undos?)?|min(?:utos?)?|rep(?:eti[cç][oõ]es?)?|kg|lb)?\b/g,' ')
  .replace(/[^a-z0-9]+/g,' ')
  .split(/\s+/)
  .filter(word=>word.length>2&&!['com','sem','para','por','dos','das','uma','realizado','realizada','series','serie','repeticoes','repeticao'].includes(word));

const RULES=[
  [/sentar.*levantar|agach|squat|step.?up|subida.*degrau/,['fortalecer quadríceps e glúteos','melhorar o desempenho nas transferências e em tarefas com suporte de peso']],
  [/panturr|calf.?raise|flex[aã]o plantar|eleva[cç][aã]o.*calcanhar/,['fortalecer a musculatura da panturrilha','favorecer a propulsão e o controle do tornozelo durante a marcha']],
  [/ponte|bridge/,['fortalecer os extensores do quadril','melhorar o controle lumbopélvico']],
  [/clam|concha|abdu[cç][aã]o.*quadril|caminhada lateral/,['fortalecer os abdutores do quadril','melhorar a estabilidade pélvica em apoio e marcha']],
  [/extens[aã]o.*joelho|quadr[ií]ceps|cadeira extensora|tke/,['fortalecer o quadríceps','melhorar o controle do joelho em transferências, marcha e escadas']],
  [/flex[aã]o.*joelho|hamstring|isquiotib/,['fortalecer os flexores do joelho','melhorar o controle do membro inferior durante a marcha']],
  [/marcha|caminhada|deambula|obst[aá]culo/,['treinar a marcha e a transferência de peso','melhorar a tolerância ao deslocamento funcional']],
  [/equil[ií]brio|apoio unipodal|tandem|romberg/,['melhorar o equilíbrio e o controle postural','treinar estratégias de estabilidade durante tarefas funcionais']],
  [/mobilidade|mobiliza[cç][aã]o|amplitude|\badm\b|alongamento|deslizamento/,['favorecer a mobilidade articular e a execução do movimento em amplitude tolerada']],
  [/ombro|escap|manguito|rota[cç][aã]o externa/,['melhorar a mobilidade e o controle do complexo do ombro','favorecer o desempenho funcional do membro superior']],
  [/core|tronco|lomb|abdominal|prancha|bird.?dog/,['melhorar o controle motor e a resistência da musculatura do tronco','favorecer a estabilidade durante tarefas funcionais']],
  [/respira|ventilat|diafragma/,['melhorar o controle ventilatório e a coordenação respiratória']],
  [/coordena[cç][aã]o|dupla tarefa/,['treinar a coordenação e a organização do movimento em tarefa funcional']],
  [/preens[aã]o|punho|m[aã]o|dedos?/,['melhorar a força e o controle da função manual','favorecer tarefas de preensão e manipulação']]
];

function searchable(exercise){return [exercise?.name,exercise?.synonyms?.join?.(' '),exercise?.tags?.join?.(' '),exercise?.category,exercise?.region,exercise?.joint,exercise?.primaryMuscles?.join?.(' '),exercise?.objective].filter(Boolean).join(' ');}

export function findEvolutionExercise(entry,exercises=[]){
  const entryText=normalized(entry),entryTokens=new Set(tokens(entry));
  if(!entryTokens.size)return null;
  let best=null,bestScore=0;
  for(const exercise of exercises){
    const name=normalized(exercise?.name),synonyms=(exercise?.synonyms||[]).map(normalized),haystack=normalized(searchable(exercise));
    let score=0;
    if(name&&entryText.includes(name))score+=18;
    if(name&&name.includes(entryText)&&entryText.length>4)score+=12;
    if(synonyms.some(item=>item&&entryText.includes(item)))score+=14;
    for(const token of entryTokens){if(name.split(/\s+/).includes(token))score+=4;else if(synonyms.some(item=>item.split(/\s+/).includes(token)))score+=3;else if(haystack.split(/\s+/).includes(token))score+=1;}
    const nameTokens=tokens(name);if(nameTokens.length&&nameTokens.every(token=>entryTokens.has(token)))score+=8;
    if(score>bestScore){best=exercise;bestScore=score;}
  }
  return bestScore>=5?best:null;
}

function catalogGoals(exercise){
  if(!exercise)return[];
  const goals=[];
  const objective=lowerFirst(exercise.objective||exercise.purpose||exercise.function||exercise.para_que_serve);
  if(objective)goals.push(objective);
  const application=lowerFirst(exercise.functionalApplication);
  if(application&&normalized(application)!==normalized(objective))goals.push(`favorecer o desempenho funcional relacionado a ${application}`);
  return goals;
}

function inferredGoals(text){
  const value=normalized(text),goals=[];
  for(const [pattern,suggestions] of RULES)if(pattern.test(value))goals.push(...suggestions);
  return goals;
}

function dedupe(goals,limit=6){
  const result=[];
  for(const goal of goals.map(lowerFirst).filter(Boolean)){
    const key=normalized(goal).replace(/\b(o|a|os|as|de|da|do|e|em|ao|aos)\b/g,' ').replace(/\s+/g,' ').trim();
    if(result.some(item=>{const other=normalized(item).replace(/\b(o|a|os|as|de|da|do|e|em|ao|aos)\b/g,' ').replace(/\s+/g,' ').trim();return other===key||other.includes(key)||key.includes(other);}))continue;
    result.push(goal);if(result.length>=limit)break;
  }
  return result;
}

export function evolutionGoalsFromEntries(entries,exercises=[]){
  const goals=[];
  for(const entry of entries){
    const match=findEvolutionExercise(entry,exercises),catalog=catalogGoals(match),inferred=inferredGoals(entry);
    if(!inferred.length)inferred.push(...inferredGoals(searchable(match)));
    if(catalog[0])goals.push(catalog[0]);
    if(inferred[0]&&normalized(inferred[0])!==normalized(catalog[0]))goals.push(inferred[0]);
    if(!catalog.length&&!inferred.length)continue;
  }
  return dedupe(goals);
}

export function evolutionGoalsFromPerformed(items,exerciseLookup){
  const goals=[];
  for(const item of items){
    const exercise=exerciseLookup(item.exerciseId)||{},catalog=catalogGoals(exercise),inferred=inferredGoals(exercise.name);
    if(!inferred.length)inferred.push(...inferredGoals(searchable(exercise)));
    if(catalog[0])goals.push(catalog[0]);
    if(inferred[0]&&normalized(inferred[0])!==normalized(catalog[0]))goals.push(inferred[0]);
  }
  return dedupe(goals);
}

export function goalsSentence(goals,fallback='favorecer força, mobilidade e funcionalidade conforme os objetivos terapêuticos da sessão'){
  const values=dedupe(goals);
  if(!values.length)return fallback;
  if(values.length===1)return values[0];
  return `${values.slice(0,-1).join('; ')}; e ${values.at(-1)}`;
}
