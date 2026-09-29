const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

const visualRules=[
  [/ponte unilateral|single leg bridge/,'single-leg-glute-bridge'],[/ponte|glute bridge/,'glute-bridge'],[/clam|concha/,'clamshell'],[/abducao.*decubito|elevacao lateral da perna/,'side-lying-hip-abduction'],
  [/monster walk/,'banded-monster-walk'],[/caminhada lateral|passos laterais/,'banded-lateral-walk'],[/step[- ]?up|subida.*degrau/,'step-up'],[/step[- ]?down|descida.*degrau/,'step-down'],
  [/sentar e levantar|sit.to.stand/,'bodyweight-squat'],[/miniagachamento/,'bodyweight-squat'],[/wall sit|isometrico.*parede/,'wall-sit'],[/agachamento|squat/,'squat'],[/avanco|afundo|lunge/,'forward-lunge'],
  [/extensao.*joelho|cadeira extensora/,'leg-extension'],[/flexao.*joelho|hamstring curl/,'leg-curl'],[/perna estendida|straight leg raise|slr/,'lying-leg-raise'],[/heel tap|toque.*calcanhar/,'heel-tap'],
  [/panturrilha.*unilateral/,'single-leg-calf-raise'],[/panturrilha|calf raise|flexao plantar/,'calf-raise'],[/unipodal|um pe/,'single-leg-calf-raise'],[/caminhada|marcha/,'walking'],
  [/pendulo|codman/,'arm-circles'],[/flexao.*ombro|elevacao anterior/,'front-raise'],[/abducao.*ombro|elevacao lateral/,'lateral-raise'],[/remada|rowing/,'banded-row'],[/retracao escapular|pull apart/,'band-pull-apart'],[/wall slide|deslizamento.*parede/,'wall-walk'],
  [/flexao.*cotovelo|biceps|rosca/,'bicep-curl'],[/extensao.*cotovelo|triceps/,'tricep-pushdown'],[/flexao.*punho|wrist curl/,'wrist-curl'],[/extensao.*punho/,'wrist-extension'],[/preensao|apertar bola|carregar/,'farmer-carry'],
  [/bird dog/,'bird-dog'],[/cat.cow|gato.vaca/,'cat-cow-stretch'],[/prancha lateral|side plank/,'side-plank'],[/prancha|plank/,'plank'],[/dead bug/,'dead-bug'],[/rotacao.*tronco|rotacao toracica/,'torso-twist-stretch'],[/extensao.*tronco|superman/,'superman'],
  [/polichinelo|jumping jack/,'jumping-jack'],[/joelho alto|high knees/,'high-knees'],[/bicicleta/,'cycling'],[/corrida/,'running'],[/natacao/,'swimming'],[/corda/,'jump-rope']
];

const fallbackRules=[
  [/ombro|escap|membro superior/,'arm-circles'],[/cotovelo|punho|mao/,'wrist-extension'],[/quadril|pelve|glute/,'glute-bridge'],[/joelho|membro inferior/,'bodyweight-squat'],[/tornozelo|pe|panturrilha/,'calf-raise'],[/coluna|tronco|core|lombar|cervical/,'bird-dog'],[/equilibr|controle postural/,'single-leg-calf-raise'],[/marcha|locomoc/,'walking'],[/neuro|coordenacao|motor/,'dead-bug'],[/pediatr|brincadeira/,'jumping-jack']
];

export function exerciseVisual(exercise={}){
  const text=normalize([exercise.name,exercise.synonyms,exercise.category,exercise.region,exercise.joint,exercise.objective,exercise.tags].flat().join(' '));
  const slug=visualRules.find(([pattern])=>pattern.test(text))?.[1]||fallbackRules.find(([pattern])=>pattern.test(text))?.[1]||'worlds-greatest-stretch';
  return {slug,url:`/icons/exercises/workout-guide/${slug}/frame-2.png`,alt:`Ilustração de referência para ${exercise.name||'exercício'}`};
}
