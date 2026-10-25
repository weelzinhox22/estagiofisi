export const neuroGameChapters = [
  {
    region: 'CIDADE VASCULAR', title: 'O mapa das artérias', area: 'Polígono de Willis', accent: 'arteries', sprite: 2,
    clues: [
      'A face medial frontal e parietal representa uma parte importante do membro inferior.',
      'A artéria cerebral anterior irriga parte desse território medial; a lesão pode causar fraqueza contralateral predominante na perna e dificultar a marcha.',
      'O círculo de Willis oferece conexões colaterais, mas não garante proteção contra isquemia.'
    ],
    question: 'Fraqueza súbita predominante na perna direita orienta a investigar qual território?',
    choices: ['ACA esquerda', 'ACM direita', 'ACP esquerda', 'Artéria basilar'], answerIndex: 0,
    explanation: 'A ACA esquerda pode comprometer a representação medial da perna direita. Dificuldade na marcha pode ocorrer, dependendo da localização e extensão da lesão; esse padrão é uma pista, não um diagnóstico.'
  },
  {
    region: 'CENTRAL DE AVC', title: 'O alarme do fluxo', area: 'Acidente vascular cerebral', accent: 'stroke', sprite: 3,
    clues: [
      'No AVC isquêmico, uma artéria é obstruída ou o fluxo fica insuficiente para a região.',
      'No AVC hemorrágico, um vaso se rompe e há extravasamento de sangue.',
      'Os sintomas não diferenciam com segurança os tipos; a neuroimagem orienta a avaliação aguda.'
    ],
    question: 'O que permite diferenciar isquemia de hemorragia na avaliação aguda?',
    choices: ['Neuroimagem', 'Teste de força isolado', 'Observação da marcha', 'Escala de dor'], answerIndex: 0,
    explanation: 'A neuroimagem, interpretada pela equipe responsável, é essencial para identificar o tipo de AVC e orientar o cuidado. Não se deve concluir o tipo apenas pelos sintomas.'
  },
  {
    region: 'LABORATÓRIO MOTOR', title: 'A oficina da marcha', area: 'Marcha e músculos', accent: 'gait', sprite: 6,
    clues: [
      'Tibial anterior e outros dorsiflexores elevam o antepé durante o balanço e ajudam no contato inicial.',
      'Quadríceps controla o joelho na aceitação de carga; fraqueza pode reduzir a estabilidade e favorecer recurvato ou colapso, conforme o padrão.',
      'Glúteo médio auxilia a estabilizar a pelve no apoio unipodal; déficit pode aparecer como queda pélvica contralateral ou compensações do tronco.'
    ],
    question: 'Fraqueza de qual músculo pode reduzir a dorsiflexão e favorecer pé caído?',
    choices: ['Tibial anterior', 'Sóleo', 'Glúteo médio', 'Isquiotibiais'], answerIndex: 0,
    explanation: 'O tibial anterior dorsiflete o tornozelo e contribui para a liberação do pé no balanço. Lesão neurológica, dor, restrição articular e outras causas também podem alterar a dorsiflexão.'
  },
  {
    region: 'ARQUIVO DO NERVO FACIAL', title: 'O rosto em duas metades', area: 'Paralisia facial', accent: 'face', sprite: 7,
    clues: [
      'Uma lesão supranuclear costuma enfraquecer mais a porção inferior contralateral da face.',
      'A testa pode ficar relativamente poupada no padrão central por receber inervação cortical bilateral.',
      'Uma lesão periférica do VII pode afetar testa, fechamento do olho e boca da mesma hemiface.'
    ],
    question: 'Fraqueza facial inferior contralateral, com testa relativamente preservada, sugere qual padrão?',
    choices: ['Central', 'Periférico do VII', 'Nervo oculomotor', 'Cerebelar'], answerIndex: 0,
    explanation: 'Esse conjunto é compatível com padrão central. O exame deve considerar toda a face, início, sintomas associados e contexto; a testa, isoladamente, não fecha diagnóstico.'
  },
  {
    region: 'JARDIM DOS CIRCUITOS', title: 'A trilha da dopamina', area: 'Doença de Parkinson', accent: 'parkinson', sprite: 8,
    clues: [
      'Bradicinesia é lentidão associada à redução da amplitude ou velocidade em movimentos repetidos.',
      'Rigidez e tremor de repouso são sinais motores que podem acompanhar o quadro.',
      'Freezing pode surgir ao iniciar a marcha, virar ou atravessar passagens estreitas.'
    ],
    question: 'Lentidão com redução progressiva da amplitude em movimentos repetidos é chamada de quê?',
    choices: ['Bradicinesia', 'Ataxia', 'Espasticidade', 'Apraxia'], answerIndex: 0,
    explanation: 'Bradicinesia é um componente motor central do parkinsonismo. Deve ser interpretada junto dos demais achados e da história clínica, sem reduzir a avaliação a um único sinal.'
  },
  {
    region: 'NÚCLEO DE REAVALIAÇÃO', title: 'A sala da avaliação', area: 'Avaliação neurológica', accent: 'assessment', sprite: 9,
    clues: [
      'Na escala MRC, grau 0 indica ausência de contração visível ou palpável.',
      'Grau 2 corresponde a movimento completo com a gravidade minimizada.',
      'Grau 3 corresponde a movimento completo contra a gravidade, sem resistência adicional.'
    ],
    question: 'Na escala MRC, o grau 3 representa qual desempenho?',
    choices: ['Movimento contra a gravidade', 'Contração sem movimento', 'Movimento apenas com gravidade minimizada', 'Força normal'], answerIndex: 0,
    explanation: 'MRC 3 significa movimento contra a gravidade, sem resistência adicional. Registre posição, segmento, lado, amplitude, dor e condições do teste para dar contexto ao achado.'
  }
];
