export const gaitSelects = {
  pace: [['','Não observado'],['habitual','Ritmo habitual, sem alteração evidente'],['lento','Lento'],['rapido','Rápido'],['variavel','Variável']],
  symmetry: [['','Não observado'],['simetrica','Passos aparentemente simétricos'],['menor-direita','Passo menor à direita'],['menor-esquerda','Passo menor à esquerda'],['assimetrica','Assimetria sem lado definido']],
  base: [['','Não observado'],['habitual','Base sem alteração evidente'],['alargada','Base alargada'],['estreita','Base estreita'],['cruzada','Passos cruzando a linha média']],
  initialContact: [['','Não observado'],['calcanhar','Contato inicial com calcanhar'],['planta','Contato com o pé mais plano'],['antepe','Contato inicial com antepé'],['variavel','Contato variável']],
  stanceTime: [['','Não observado'],['semelhante','Tempo de apoio aparentemente semelhante'],['menor-direita','Menor tempo de apoio à direita'],['menor-esquerda','Menor tempo de apoio à esquerda']],
  pelvis: [['','Não observado'],['estavel','Pelve sem queda evidente'],['queda-direita','Queda pélvica à direita'],['queda-esquerda','Queda pélvica à esquerda'],['variavel','Controle pélvico variável']],
  knee: [['','Não observado'],['sem-alteracao','Sem alteração evidente no plano observado'],['flexao-direita','Flexão/cedimento do joelho direito no apoio'],['flexao-esquerda','Flexão/cedimento do joelho esquerdo no apoio'],['hiperextensao-direita','Hiperextensão do joelho direito no apoio'],['hiperextensao-esquerda','Hiperextensão do joelho esquerdo no apoio']],
  trunk: [['','Não observado'],['alinhado','Tronco sem inclinação evidente'],['inclina-direita','Inclinação do tronco à direita'],['inclina-esquerda','Inclinação do tronco à esquerda'],['flexionado','Tronco mantido em flexão']],
  clearance: [['','Não observado'],['adequada','Liberação dos pés sem alteração evidente'],['reduzida-direita','Liberação reduzida/arraste à direita'],['reduzida-esquerda','Liberação reduzida/arraste à esquerda'],['reduzida-bilateral','Liberação reduzida bilateral']],
  swingKnee: [['','Não observado'],['sem-alteracao','Flexão de joelho sem alteração evidente no balanço'],['reduzida-direita','Flexão reduzida do joelho direito'],['reduzida-esquerda','Flexão reduzida do joelho esquerdo'],['reduzida-bilateral','Flexão reduzida bilateral']],
  armSwing: [['','Não observado'],['presente','Balanço de braços presente e aparentemente simétrico'],['reduzido-direita','Reduzido à direita'],['reduzido-esquerda','Reduzido à esquerda'],['reduzido-bilateral','Reduzido bilateralmente']],
  turn: [['','Não observado'],['continua','Virada contínua, sem instabilidade evidente'],['passos-multiplos','Virada com múltiplos passos'],['pausa','Pausa antes ou durante a virada'],['instavel','Instabilidade observada'],['apoio','Buscou apoio externo']]
};

export const gaitTestGuide = [
  {id:'tug', name:'Timed Up and Go (TUG)', question:'Mobilidade funcional: levantar, caminhar, virar e sentar', note:'Cronometre e registre qualidade, dispositivo e assistência. Pontos de corte dependem da população e do protocolo.'},
  {id:'10mwt', name:'Teste de Caminhada de 10 Metros', question:'Velocidade da marcha', note:'Registre distância cronometrada, velocidade confortável ou rápida, dispositivo e assistência.'},
  {id:'2mwt', name:'Teste de Caminhada de 2 Minutos', question:'Tolerância à caminhada quando 6 minutos não são adequados', note:'Use protocolo padronizado e registre distância, pausas, sintomas, dispositivo e assistência.'},
  {id:'6mwt', name:'Teste de Caminhada de 6 Minutos', question:'Capacidade/resistência para caminhar', note:'Exige triagem de segurança, percurso e protocolo padronizados e monitoramento compatível com o contexto.'},
  {id:'4stage', name:'Teste de Equilíbrio em 4 Estágios', question:'Equilíbrio estático e risco de quedas em pessoa idosa', note:'Use apoio próximo e protocolo STEADI; interrompa se não for seguro.'},
  {id:'30cst', name:'Sentar e Levantar em 30 segundos', question:'Força e resistência funcional de membros inferiores', note:'Considere quando levantar da cadeira contribui para a limitação; registre adaptações.'},
  {id:'other', name:'Outra medida definida com a supervisão', question:'A pergunta clínica ou a população exige uma medida específica', note:'Registre nome, protocolo, resultado e justificativa.'}
];

export const gaitChecklist = [
  ['phases-preserved', 'Fases preservadas', false],
  ['short-step', 'Comprimento do passo reduzido', true],
  ['asymmetry', 'Assimetria', true],
  ['limping', 'Claudicação', true],
  ['wide-base', 'Base alargada', false],
  ['slow-speed', 'Redução de velocidade', false],
  ['reduced-dissociation', 'Dissociação MMSS/MMII reduzida', true],
  ['hip-internal-rotation', 'Rotação interna de quadril', true],
  ['hip-external-rotation', 'Rotação externa de quadril', true],
  ['knee-valgus', 'Valgo de joelho', true],
  ['knee-varus', 'Varo de joelho', true],
  ['incomplete-swing', 'Fase de balanço incompleta', true],
  ['trunk-compensation', 'Compensação de tronco', true],
  ['reduced-weight-bearing', 'Descarga de peso reduzida', true],
  ['assistive-device', 'Uso de dispositivo auxiliar', true],
  ['risk-insecurity', 'Risco/insegurança', false],
  ['other', 'Outros', true],
].map(([id, label, sideApplicable]) => ({ id, label, sideApplicable }));

const optionLabel = (group, value) => gaitSelects[group]?.find(([id]) => id === value)?.[1] || '';
const assistanceLabels = {independente:'Independente',supervisao:'Supervisão próxima',contato:'Assistência por contato',minima:'Assistência mínima',moderada:'Assistência moderada',maxima:'Assistência máxima'};

export function buildGaitSummary(values, selectedTests = [], checklist = []) {
  const context = [values.environment && `ambiente: ${values.environment}`, values.footwear && `calçado: ${values.footwear}`, values.device && `dispositivo: ${values.device}`, values.assistance && `assistência: ${assistanceLabels[values.assistance] || values.assistance}`].filter(Boolean);
  const observations = [
    ['pace','ritmo'], ['symmetry','simetria/comprimento do passo'], ['base','base de suporte'],
    ['initialContact','contato inicial'], ['stanceTime','tempo de apoio'], ['pelvis','pelve'],
    ['knee','joelho no apoio'], ['trunk','tronco'], ['clearance','liberação do pé no balanço'],
    ['swingKnee','joelho no balanço'], ['armSwing','balanço dos braços'], ['turn','virada']
  ].map(([key,label]) => optionLabel(key, values[key]) && `${label}: ${optionLabel(key, values[key])}`).filter(Boolean);
  const measures = [values.distance && `distância observada: ${values.distance}`, values.time && `tempo: ${values.time}`, values.steps && `passos: ${values.steps}`].filter(Boolean);
  const tests = selectedTests.map(id => gaitTestGuide.find(test => test.id === id)?.name).filter(Boolean);
  const parts = [];
  if (context.length) parts.push(`Condições — ${context.join('; ')}.`);
  if (observations.length) parts.push(`Observação — ${observations.join('; ')}.`);
  if (measures.length) parts.push(`Medidas — ${measures.join('; ')}.`);
  if (values.symptoms) parts.push(`Sintomas/resposta durante a tarefa — ${values.symptoms}.`);
  if (values.safetyNotes) parts.push(`Segurança/intercorrências — ${values.safetyNotes}.`);
  if (tests.length) parts.push(`Medidas selecionadas — ${tests.join('; ')}.`);
  const checked = checklist.map(item => {
    const finding = gaitChecklist.find(row => row.id === item.id);
    return finding ? finding.label + (item.side ? ' (' + item.side + ')' : '') : '';
  }).filter(Boolean);
  if (checked.length) parts.push('Checklist — ' + checked.join('; ') + '.');
  if (values.otherGaitFinding) parts.push('Outro achado — ' + values.otherGaitFinding + '.');
  if (values.testResults) parts.push(`Resultados — ${values.testResults}.`);
  if (values.notes) parts.push(`Observações adicionais — ${values.notes}.`);
  return parts.join(' ');
}

export function gaitHasObservation(values) {
  return Object.keys(gaitSelects).some(key => Boolean(values[key])) || Boolean(values.notes || values.symptoms || values.testResults);
}
