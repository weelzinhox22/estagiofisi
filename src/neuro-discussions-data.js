export const neuroDiscussionTopics = [
  {
    id:'avaliacao-transferencias', number:'01', icon:'◫', accent:'teal',
    title:'Avaliação neurofuncional e transferências',
    subtitle:'Do exame por sistemas à tarefa real, sem confundir alteração corporal com incapacidade funcional.',
    overview:'Uma avaliação neurofuncional útil conecta estado clínico, funções corporais, atividade e participação. Transferir-se não é apenas “ter força”: exige compreensão da tarefa, controle de tronco, apoio dos pés, estratégia de movimento, capacidade de sustentar carga, equilíbrio, percepção, comunicação e ambiente adequado.',
    studyPoints:[
      {title:'Comece pelo contexto',text:'Registre diagnóstico informado, fase, precauções, nível prévio de função, dispositivos, ambiente, ajuda habitual, fadiga, dor e objetivo da pessoa. Não deduza o diagnóstico a partir do padrão motor.'},
      {title:'Exame por domínios',text:'Observe consciência e comunicação, sensibilidade, força, tônus descrito por segmento, coordenação, controle seletivo, amplitude, controle de tronco, equilíbrio, função manual, ortostatismo e marcha. Separe o que foi testado do que não foi avaliado.'},
      {title:'Analise a transferência',text:'Descreva origem e destino, altura e estabilidade das superfícies, direção, dispositivo, preparação dos pés e mãos, sequência, assistência realmente fornecida, número de tentativas e resposta.'},
      {title:'Meça para acompanhar',text:'Medidas padronizadas ajudam a quantificar mudança. A diretriz de medidas neurofuncionais inclui equilíbrio, confiança, marcha, distância e sentar-levantar; a escolha deve combinar objetivo, condição e utilidade clínica.'}
    ],
    assessment:['Sinais vitais e tolerância ortostática quando pertinentes','Compreensão de comandos e comunicação','Controle de cabeça e tronco','Base de suporte, apoio dos pés e simetria funcional','Estratégia usada para iniciar e concluir a tarefa','Assistência: supervisão, mínima, moderada ou máxima — com definição local','Dispositivo e características do ambiente','Qualidade, segurança, tempo e fadiga, sem reduzir a avaliação apenas ao tempo'],
    example:{title:'Exemplo para discussão',context:'Pessoa após AVE, clinicamente estável, precisa passar da cadeira para a maca. Consegue sentar sem apoio, mas demora para iniciar e descarrega pouco peso no membro inferior mais afetado.',findings:['Compreende comandos simples','Pés estavam distantes antes da primeira tentativa','Inclina pouco o tronco à frente','Precisa de ajuda no início da elevação, mas mantém ortostatismo com contato leve'],questions:['O principal limitador observado foi preparação, geração de força, equilíbrio, percepção ou medo?','Qual modificação ambiental tornaria a tarefa mais informativa e segura?','Como registrar a assistência sem afirmar independência que não foi observada?'],reasoning:'Uma boa discussão diferencia hipóteses dos fatos: reposicionar os pés pode testar a contribuição da preparação, mas a resposta precisa ser observada e registrada; não deve ser antecipada como resultado.'},
    pitfalls:['Usar “independente” quando houve contato físico ou pistas essenciais','Somar achados de dias diferentes como se fossem da mesma sessão','Escolher uma escala sem relação com o objetivo funcional','Treinar uma transferência sem registrar origem, destino e assistência'],
    references:[
      {label:'Diretriz — medidas neurofuncionais',citation:'Moore JL et al. J Neurol Phys Ther. 2018.',url:'https://pubmed.ncbi.nlm.nih.gov/29901487/',note:'Diretriz de conjunto central de medidas para adultos com condições neurológicas.'},
      {label:'Diretriz — reabilitação pós-AVE',citation:'AHA/ASA. Guideline for Adult Stroke Rehabilitation and Recovery. 2026.',url:'https://pubmed.ncbi.nlm.nih.gov/42657476/',note:'Atualização ampla sobre avaliação, segurança, participação e recuperação após AVE.'}
    ]
  },
  {
    id:'willis-avc', number:'02', icon:'◎', accent:'red',
    title:'Polígono de Willis, territórios vasculares e AVE',
    subtitle:'Anatomia aplicada para formular hipóteses — não para localizar uma lesão apenas pelo comportamento motor.',
    overview:'O polígono de Willis conecta as circulações anterior e posterior e pode oferecer vias colaterais quando uma rota principal perde fluxo. Variações anatômicas são comuns. O território comprometido, a extensão da lesão, a circulação colateral e o tempo até reperfusão influenciam a apresentação, mas o exame funcional e os dados médicos continuam indispensáveis.',
    studyPoints:[
      {title:'Mapa essencial',text:'As carótidas internas alimentam a circulação anterior; as vertebrais convergem para a basilar na circulação posterior. Comunicantes anterior e posteriores conectam essas rotas no anel arterial.'},
      {title:'Território não é destino',text:'Artéria cerebral média, anterior e posterior têm padrões clínicos clássicos, porém variações, lesões múltiplas e redes individuais impedem uma correspondência perfeita entre artéria e função.'},
      {title:'Colaterais importam',text:'A integridade do polígono e de outras vias colaterais pode modificar quanto tecido permanece perfundido. Isso ajuda a compreender por que o mesmo local de oclusão não produz exatamente o mesmo quadro em todas as pessoas.'},
      {title:'Aplicação fisioterapêutica',text:'Use a anatomia para organizar hipóteses sobre força, sensibilidade, campo visual, linguagem, atenção e coordenação; confirme com avaliação, imagem e diagnóstico da equipe. A fisioterapia não determina mecanismo vascular.'}
    ],
    assessment:['Lado e distribuição dos achados motores e sensitivos','Comunicação, compreensão e possível negligência','Campo visual informado/avaliado pela equipe','Coordenação e controle postural','Função real: alcance, transferências, marcha e participação','Sinais novos ou piora súbita exigem interrupção e fluxo de urgência local'],
    example:{title:'Exemplo para discussão',context:'Pessoa com AVE isquêmico informado em território de artéria cerebral média apresenta paresia à direita, dificuldade de expressão e necessidade de pistas durante tarefas.',findings:['A descrição vascular é informação da equipe médica','A paresia e a linguagem afetam a forma de instruir e medir a tarefa','A segurança da transferência depende mais do desempenho observado do que do nome da artéria'],questions:['Como adaptar comandos sem confundir dificuldade de expressão com falta de compreensão?','Quais funções precisam ser medidas diretamente?','Que mudança súbita faria interromper a sessão e acionar o protocolo local?'],reasoning:'O território ajuda a preparar a avaliação, mas não substitui a observação. A conduta deve nascer do problema funcional confirmado e dos objetivos compartilhados.'},
    pitfalls:['Apresentar o polígono de Willis como proteção garantida contra isquemia','Concluir o território arterial apenas pelo padrão motor','Tratar “AVC” como quadro homogêneo','Ignorar linguagem, visão, percepção e cognição ao analisar mobilidade'],
    references:[
      {label:'Revisão — configuração do polígono e desfechos',citation:'Katsanos et al. 2023.',url:'https://pubmed.ncbi.nlm.nih.gov/38138218/',note:'Revisão sobre configuração do polígono, localização do trombo e desfechos no AVE isquêmico.'},
      {label:'Diretriz — reabilitação motora pós-AVE',citation:'European Stroke Organisation. 2025.',url:'https://pubmed.ncbi.nlm.nih.gov/40401760/',note:'Diretriz recente sobre dose, treino de marcha, membro superior e sentar-levantar.'}
    ]
  },
  {
    id:'marcha-neuro', number:'03', icon:'⌁', accent:'blue',
    title:'Biomecânica da marcha aplicada à neurologia',
    subtitle:'Leia fases, exigências e compensações antes de escolher o que treinar.',
    overview:'A marcha resulta da interação entre progressão, estabilidade, avanço do membro e adaptação ao ambiente. Em neurologia, velocidade e simetria sozinhas não explicam o desempenho: é preciso observar fase, tarefa, superfície, assistência, capacidade cardiovascular, atenção e estratégia compensatória.',
    studyPoints:[
      {title:'Organize por fases',text:'Na fase de apoio, observe aceitação de peso, progressão sobre o pé e estabilidade. No balanço, observe liberação do pé, avanço e preparação para o contato. Descreva o evento em vez de usar rótulos vagos.'},
      {title:'Impairment versus estratégia',text:'Um movimento diferente pode refletir fraqueza, limitação articular, déficit sensorial, espasticidade, dor, medo ou uma compensação útil. Testes direcionados ajudam a separar hipóteses.'},
      {title:'Variáveis que mudam a leitura',text:'Velocidade, dispositivo, assistência, calçado, superfície, dupla tarefa, fadiga e estado medicamentoso podem alterar o padrão. Registre o contexto de cada observação.'},
      {title:'Evidência com população definida',text:'A diretriz locomotora apoia treino de marcha específico e de maior intensidade em pessoas ambulatoriais crônicas com AVE, lesão medular incompleta ou TCE; ela alerta que os resultados não se generalizam automaticamente a quem precisa de assistência física substancial.'}
    ],
    assessment:['Velocidade e distância quando seguras e pertinentes','Eventos de contato, apoio médio, retirada e balanço','Clearance do pé e comprimento do passo','Controle de tronco e pelve','Dispositivo, órtese e assistência','Capacidade de virar, iniciar, parar e contornar obstáculos','Resposta cardiovascular, fadiga e sintomas','Desempenho em tarefa simples versus dupla tarefa'],
    example:{title:'Exemplo para discussão',context:'Pessoa pós-TCE caminha com supervisão e reduz a velocidade quando precisa carregar um objeto leve.',findings:['Sem o objeto, mantém trajetória previsível','Na dupla tarefa, encurta passos e olha continuamente para as mãos','O diagnóstico não explica sozinho se o limite é motor, atencional ou ambos'],questions:['Qual tarefa simples serve como comparação?','O que muda primeiro: velocidade, trajetória, apoio ou necessidade de pistas?','A dupla tarefa é apropriada e segura neste momento?'],reasoning:'Comparar condições com apenas uma variável alterada ajuda a discutir custo da dupla tarefa. A progressão depende da segurança e da resposta observada, não de uma sequência automática.'},
    pitfalls:['Chamar toda assimetria de erro a ser eliminado','Analisar vídeo sem informar velocidade, apoio ou dispositivo','Aplicar recomendações de pacientes ambulatoriais a pessoas não ambulatoriais','Confundir mais passos com melhor qualidade ou participação'],
    references:[
      {label:'Diretriz — função locomotora',citation:'Hornby TG et al. J Neurol Phys Ther. 2020.',url:'https://pubmed.ncbi.nlm.nih.gov/31834165/',note:'Diretriz para pessoas ambulatoriais crônicas com AVE, lesão medular incompleta e lesão cerebral.'},
      {label:'Diretriz — medidas de marcha e equilíbrio',citation:'Moore JL et al. J Neurol Phys Ther. 2018.',url:'https://pubmed.ncbi.nlm.nih.gov/29901487/',note:'Discute medidas como 10MWT, 6MWT, FGA, Berg e 5x Sit-to-Stand.'}
    ]
  },
  {
    id:'fes-neuro', number:'04', icon:'ϟ', accent:'amber',
    title:'Estimulação elétrica funcional aplicada à neurologia',
    subtitle:'FES é uma estratégia funcional vinculada a uma tarefa, não apenas “corrente para contrair músculo”.',
    overview:'Na FES, a estimulação elétrica é sincronizada a uma ação funcional, como dorsiflexão durante a marcha, preensão ou pedalada. A seleção depende do objetivo, integridade do sistema neuromuscular periférico, sensibilidade, pele, tolerância, equipamento e avaliação profissional. Parâmetros não devem ser copiados de um exemplo sem considerar o dispositivo e a pessoa.',
    studyPoints:[
      {title:'Diferencie os termos',text:'TENS é geralmente associada a modulação sensorial; NMES busca contração neuromuscular; FES usa a contração como parte de uma tarefa funcional. Equipamentos e literatura nem sempre usam os termos do mesmo modo.'},
      {title:'Efeito com dispositivo e efeito terapêutico',text:'Uma mudança enquanto a estimulação está ligada pode ser um efeito ortótico imediato; mudança que permanece desligada é uma pergunta terapêutica diferente. Registre qual foi avaliada.'},
      {title:'Pós-AVE',text:'Diretriz específica indica que FES e órtese tornozelo-pé podem melhorar desfechos após AVE em pessoas com controle reduzido do membro inferior; escolha e acompanhamento precisam ser individualizados.'},
      {title:'Lesão medular',text:'FES-cycling e outras modalidades foram estudadas para diferentes objetivos, mas protocolos, níveis de lesão e qualidade da evidência variam. Resultados de uma modalidade não devem ser transferidos automaticamente para outra.'}
    ],
    assessment:['Objetivo funcional observável','Pele, sensibilidade e capacidade de relatar desconforto','Resposta motora e qualidade do movimento','Amplitude disponível e alinhamento articular','Dispositivos implantados e precauções do fabricante/protocolo','Estado cardiovascular e risco autonômico quando aplicável','Fadiga durante e após a tarefa','Efeito com o estímulo ligado e desempenho sem estímulo, quando for a pergunta clínica'],
    example:{title:'Exemplo para discussão',context:'Pessoa pós-AVE apresenta redução do clearance do pé durante o balanço. A equipe considera FES para dorsiflexores durante treino de marcha.',findings:['O problema funcional foi observado durante marcha','É necessário confirmar resposta motora, pele, sensação e compatibilidade do equipamento','Velocidade, assistência e dispositivo devem ser mantidos comparáveis ao avaliar resposta'],questions:['O objetivo é assistência imediata, aprendizagem/treino ou ambos?','Qual desfecho mostrará se a estratégia ajudou?','Quais precauções do equipamento precisam ser verificadas antes?'],reasoning:'A discussão começa pelo problema e pelo desfecho, não pelo aparelho. A decisão e os parâmetros pertencem ao profissional treinado e ao protocolo do dispositivo.'},
    pitfalls:['Confundir FES com qualquer eletroestimulação','Copiar frequência, largura de pulso ou intensidade sem protocolo específico','Avaliar apenas a contração isolada e concluir melhora funcional','Ignorar pele, sensibilidade, fadiga e resposta autonômica'],
    references:[
      {label:'Diretriz — FES e AFO após AVE',citation:'Johnston TE et al. J Neurol Phys Ther. 2021.',url:'https://pubmed.ncbi.nlm.nih.gov/33675603/',note:'Diretriz de órtese tornozelo-pé e FES para mobilidade pós-AVE.'},
      {label:'Revisão — FES cycling após lesão medular',citation:'Johnston et al. 2021.',url:'https://pubmed.ncbi.nlm.nih.gov/34118958/',note:'Revisão de desfechos de saúde e aptidão do FES-cycling em adultos com lesão medular.'}
    ]
  },
  {
    id:'paralisia-facial', number:'05', icon:'◡', accent:'violet',
    title:'Paralisia facial e feedback facial',
    subtitle:'Diferencie apresentação central e periférica, proteja funções essenciais e use feedback com objetivo claro.',
    overview:'Paralisia facial descreve perda ou alteração do movimento facial, mas a causa e a distribuição importam. A avaliação observa repouso, movimento voluntário, simetria dinâmica, fechamento ocular, fala, alimentação, sincinesia, dor e impacto psicossocial. Exercícios genéricos ou força máxima repetida podem não ser apropriados para todos os estágios.',
    studyPoints:[
      {title:'Central versus periférica',text:'A distribuição do déficit ajuda na discussão, mas não substitui diagnóstico médico. Início súbito associado a outros sinais neurológicos exige fluxo urgente local.'},
      {title:'Função antes da estética',text:'Fechamento ocular, proteção da córnea, competência oral, alimentação, fala e comunicação expressiva têm prioridade. Alterações oculares precisam de avaliação e orientação da equipe responsável.'},
      {title:'Feedback facial',text:'Espelho, vídeo ou feedback tátil podem apoiar consciência e controle quando usados com tarefa e alvo definidos. Mais esforço não significa necessariamente melhor coordenação.'},
      {title:'Evidência heterogênea',text:'Revisões relatam resultados favoráveis para exercícios faciais, mas protocolos, causas, fases e medidas variam. A evidência para paralisia central permanece especialmente limitada e heterogênea.'}
    ],
    assessment:['Causa e diagnóstico informados pela equipe','Tempo de início e evolução','Face em repouso e em movimentos selecionados','Fechamento ocular e sintomas oculares','Competência labial, fala e alimentação','Presença de sincinesia ou movimento em massa','Dor, sensibilidade e impacto psicossocial','Escala validada quando houver treinamento para aplicá-la'],
    example:{title:'Exemplo para discussão',context:'Pessoa com paralisia facial periférica informada consegue iniciar sorriso, mas fecha parcialmente o olho ao esforço e relata desconforto ocular.',findings:['A queixa ocular exige prioridade e comunicação à equipe','Movimento associado precisa ser descrito, não tratado apenas como “fraqueza”','O feedback pode ser usado para observar qualidade com esforço reduzido'],questions:['Quais funções estão comprometidas além da simetria?','Há sinais oculares que exigem conduta médica/oftalmológica?','O exercício aumenta seletividade ou aumenta movimento associado?'],reasoning:'O exemplo pede coordenação com a equipe e proteção ocular. A intervenção não deve ser determinada pelo aplicativo nem reduzida a uma lista de caretas.'},
    pitfalls:['Prescrever o mesmo programa para paralisia central e periférica','Ignorar proteção ocular','Estimular força máxima diante de sincinesia sem avaliação específica','Prometer recuperação baseada apenas na simetria observada em foto'],
    references:[
      {label:'Revisão — exercício facial',citation:'Khan AJ et al. Clin Rehabil. 2022.',url:'https://pubmed.ncbi.nlm.nih.gov/35787015/',note:'Revisão atualizada de terapia por exercícios na paralisia facial periférica.'},
      {label:'Revisão — reabilitação da paralisia facial central',citation:'Vaughan A et al. Front Neurol. 2020.',url:'https://pubmed.ncbi.nlm.nih.gov/32296385/',note:'Encontrou evidência global de baixa qualidade e grande heterogeneidade.'}
    ]
  },
  {
    id:'trm-asia', number:'06', icon:'↕', accent:'slate',
    title:'Traumatismo raquimedular e classificação ISNCSCI/ASIA',
    subtitle:'Classifique comprometimento neurológico com método padronizado; não use AIS como sinônimo de independência.',
    overview:'O ISNCSCI padroniza exame sensitivo e motor e gera níveis sensitivos, motores, nível neurológico da lesão, escores, completude, AIS e zonas de preservação parcial quando aplicáveis. A classificação exige treinamento, posicionamento e regras próprias. Ela caracteriza comprometimento neurológico, mas não resume função, participação, dor, respiração, autonomia ou risco de lesão por pressão.',
    studyPoints:[
      {title:'Componentes',text:'O exame inclui pontos sensitivos para toque leve e picada e funções musculares-chave. Registros “não testável” e alterações não relacionadas à lesão medular precisam ser documentados conforme o padrão.'},
      {title:'Nível neurológico',text:'Níveis sensitivo e motor são definidos em cada lado. O nível neurológico único resulta da combinação mais rostral pertinente; por isso, guardar os níveis separados evita perder informação funcional.'},
      {title:'Completude e preservação sacral',text:'A distinção completa/incompleta depende de preservação sensitiva ou motora nos segmentos sacrais mais caudais, seguindo os critérios do ISNCSCI — não da capacidade de caminhar.'},
      {title:'AIS A–E',text:'AIS descreve gravidade do comprometimento segundo regras motoras e sensitivas. Mudança de AIS precisa resultar de exame válido; não deve ser inferida de melhora funcional isolada.'}
    ],
    assessment:['Condições clínicas e estabilidade para o exame','Sensibilidade nos pontos-chave conforme protocolo','Funções musculares-chave e fatores que limitam o teste','Preservação sacral conforme competência e protocolo do serviço','Níveis direito e esquerdo antes da classificação final','Respiração, pele, dor, tônus, função autonômica e amplitude como avaliação complementar','Transferências, cadeira de rodas, autocuidado e participação com medidas próprias'],
    example:{title:'Exemplo para discussão',context:'Pessoa com lesão medular traumática tem força variável abaixo do nível informado e uma fratura no membro superior que impede testar uma função-chave.',findings:['A limitação ortopédica deve ser registrada como condição não relacionada à lesão medular','“Não testável” pode impedir parte da classificação','A capacidade de transferir-se não resolve a classificação neurológica'],questions:['Quais componentes podem ser examinados com validade agora?','O que deve ficar como não determinável?','Que medidas funcionais complementam a AIS?'],reasoning:'É mais seguro registrar incerteza do que preencher a classificação por suposição. O ISNCSCI não substitui o exame funcional e o treinamento oficial.'},
    pitfalls:['Chamar AIS de escala funcional','Determinar lesão completa sem aplicar os critérios de preservação sacral','Somar escores ou preencher músculos não testados por estimativa','Ignorar condições concomitantes que alteram o exame'],
    references:[
      {label:'Padrão oficial — ISNCSCI 2019',citation:'ASIA/International Standards Committee. 2019 revision.',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC8152171/',note:'Oitava edição do padrão de exame e classificação.'},
      {label:'Casos e dúvidas de classificação',citation:'International Standards Committee. 2025.',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC12376160/',note:'Discussão de questões reais e casos ilustrativos de classificação.'}
    ]
  },
  {
    id:'membro-superior-paretico', number:'07', icon:'✋', accent:'rose',
    title:'Membro superior parético: espelho e contenção induzida',
    subtitle:'Selecione a estratégia pelo perfil motor, objetivo e capacidade de prática — não pelo nome da técnica.',
    overview:'A reabilitação do membro superior após AVE combina análise de dor, alinhamento, movimento seletivo, sensibilidade, percepção, destreza, uso espontâneo e tarefas significativas. Terapia do espelho e terapia por contenção induzida são abordagens diferentes e exigem seleção. Nenhuma delas substitui prática orientada à tarefa e monitoramento da transferência para a vida diária.',
    studyPoints:[
      {title:'Avalie o braço em contexto',text:'Diferencie capacidade no teste e uso real. Observe escápula e ombro, alcance, preensão, liberação, manipulação, sensibilidade, negligência, dor, edema e impacto nas atividades escolhidas pela pessoa.'},
      {title:'Terapia do espelho',text:'Cria feedback visual do membro menos afetado como se fosse o afetado. Revisões sugerem possível benefício motor em alguns contextos, mas resultados variam por protocolo, fase e desenho unilateral/bilateral.'},
      {title:'Contenção induzida',text:'Combina prática intensiva do membro mais afetado, restrição planejada do menos afetado e estratégias de transferência. Estudos normalmente exigem movimento ativo residual e capacidade de participar; não é simplesmente imobilizar a mão melhor.'},
      {title:'Proteja sem desuso',text:'Dor e subluxação exigem posicionamento, manuseio e investigação. Evite tração pelo braço. Proteção não deve apagar oportunidades seguras de uso funcional.'}
    ],
    assessment:['Dor, alinhamento e integridade do ombro','Movimento ativo seletivo de ombro, cotovelo, punho e dedos','Sensibilidade e propriocepção','Negligência, visão e compreensão da tarefa','Capacidade de alcançar, segurar, soltar e manipular','Uso espontâneo em tarefas significativas','Fadiga, tolerância e possibilidade de prática supervisionada','Meta funcional definida com a pessoa'],
    example:{title:'Exemplo para discussão',context:'Pessoa pós-AVE abre parcialmente a mão e alcança um copo vazio na mesa, mas usa quase sempre o outro braço em casa.',findings:['Existe alguma capacidade observável no membro mais afetado','Uso espontâneo parece menor que a capacidade demonstrada','Dor, segurança e demandas da tarefa ainda precisam ser avaliadas'],questions:['Que tarefa significativa permite medir capacidade e uso?','Os critérios do protocolo de contenção considerado são atendidos?','Como verificar se a melhora no treino aparece fora da sessão?'],reasoning:'A escolha entre prática bilateral, espelho, contenção modificada ou outra estratégia depende do perfil e do objetivo. O exemplo não autoriza prescrição automática.'},
    pitfalls:['Usar contenção sem critérios, monitoramento ou pacote de transferência','Puxar o membro parético durante transferências','Confundir movimento compensatório com recuperação seletiva sem descrevê-lo','Prometer que feedback visual produz reorganização funcional em todos os pacientes'],
    references:[
      {label:'Revisão — contenção induzida versus dose equivalente',citation:'Stevenson T et al. Physiother Can. 2012.',url:'https://pubmed.ncbi.nlm.nih.gov/23997396/',note:'Revisão com meta-análise em adultos após AVE com movimento residual.'},
      {label:'Revisão — terapia do espelho',citation:'Boening A et al. J Physiother. 2026.',url:'https://pubmed.ncbi.nlm.nih.gov/41423382/',note:'Compara terapia unilateral e bilateral e explicita a certeza da evidência.'}
    ]
  },
  {
    id:'parkinson', number:'08', icon:'✦', accent:'green',
    title:'Doença de Parkinson e condutas fisioterapêuticas',
    subtitle:'Integre estado medicamentoso, pistas, tarefa, exercício e participação.',
    overview:'A doença de Parkinson combina manifestações motoras e não motoras que variam ao longo do dia e entre pessoas. Bradicinesia, rigidez, tremor, instabilidade postural e freezing podem coexistir com fadiga, alterações cognitivas, autonômicas, de sono e humor. A sessão precisa registrar estado ON/OFF, quedas, ambiente, prioridades e resposta.',
    studyPoints:[
      {title:'Avalie variabilidade',text:'Pergunte horário e resposta à medicação, episódios de freezing, quedas, flutuações, fadiga e tarefas difíceis. Compare o desempenho em condições relevantes, sem tratar uma observação isolada como padrão fixo.'},
      {title:'Pistas externas',text:'Pistas visuais, auditivas ou somatossensoriais podem apoiar amplitude, ritmo e início da marcha. A diretriz sustenta cueing para marcha e freezing, mas a pista deve ser testada e individualizada.'},
      {title:'Treino e exercício',text:'A diretriz APTA apoia exercício aeróbico, resistência, equilíbrio, treino de marcha e treino orientado à tarefa, além de cuidado integrado. Intensidade e segurança dependem de avaliação e comorbidades.'},
      {title:'Dupla tarefa com critério',text:'Dupla tarefa pode revelar limitações e ser treinada em alguns contextos, mas aumentar complexidade diante de instabilidade ou freezing não é progressão automática. Primeiro estabeleça segurança e objetivo.'}
    ],
    assessment:['Estado ON/OFF e horário da medicação','Quedas, quase-quedas e medo de cair','Início, parada, giros, passagem estreita e freezing','Comprimento do passo, velocidade e mobilidade funcional','Equilíbrio antecipatório, reativo e sensorial','Força, capacidade aeróbica e flexibilidade','Cognição, dupla tarefa e comunicação','Sintomas autonômicos, fadiga e participação'],
    example:{title:'Exemplo para discussão',context:'Pessoa com Parkinson relata travar ao atravessar portas e ao girar para sentar. Em corredor aberto, caminha sem ajuda física.',findings:['O freezing é dependente do contexto relatado','Giros e portas precisam ser observados com proteção adequada','Uma pista útil no corredor pode não funcionar na porta'],questions:['Qual gatilho aparece primeiro: aproximação, mudança de direção ou pressa?','Que pista pode ser testada de forma segura e mensurável?','Como registrar efeito imediato sem prometer generalização?'],reasoning:'Teste uma variável por vez e compare. O efeito deve ser documentado no contexto em que ocorreu; a estratégia é selecionada pelo fisioterapeuta com a pessoa.'},
    pitfalls:['Aplicar a mesma pista para todas as pessoas','Ignorar estado ON/OFF ao comparar sessões','Usar dupla tarefa como regra de progressão','Reduzir Parkinson a tremor e marcha, ignorando sintomas não motores e participação'],
    references:[
      {label:'Diretriz APTA — Parkinson',citation:'Osborne JA et al. Phys Ther. 2022.',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC9046970/',note:'Diretriz aberta com recomendações e força da evidência para exercício, pistas, marcha e tarefa.'},
      {label:'Diretriz — medidas neurofuncionais',citation:'Moore JL et al. J Neurol Phys Ther. 2018.',url:'https://pubmed.ncbi.nlm.nih.gov/29901487/',note:'Medidas transdiagnósticas para equilíbrio, marcha, transferências e metas.'}
    ]
  }
];

export const neuroReviewQuestions = [
  'Qual diferença existe entre comprometimento corporal, limitação de atividade e restrição de participação no caso discutido?',
  'Que fato foi realmente observado e o que ainda é apenas hipótese?',
  'Qual medida ou tarefa responde melhor à pergunta clínica formulada?',
  'A evidência citada corresponde à mesma população, fase e capacidade funcional?',
  'Que condição de segurança faria pausar a avaliação ou acionar o protocolo local?',
  'Como o resultado será registrado para permitir comparação futura?'
];

export const neuroResearchMeta = {
  reviewedAt:'14/10/2026',
  scope:'Síntese narrativa educacional de diretrizes, padrões internacionais e revisões selecionadas. Não é revisão sistemática e não define conduta individual.',
  audience:'Estudantes e profissionais de fisioterapia em prática supervisionada.'
};
