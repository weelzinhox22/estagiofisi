import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const targetFile = resolve(root, 'src', 'condition-exercises-data.js');

const SOURCES = {
  plantar: 'APTA Orthopedics. Heel Pain—Plantar Fasciitis: Revision 2023. https://www.orthopt.org/content/s/heel-pain-plantar-fasciitis-revision-2023',
  lumbar: 'APTA Orthopedics. Interventions for Acute and Chronic Low Back Pain: Revision 2021. https://www.orthopt.org/content/s/interventions-for-the-management-of-acute-and-chronic-low-back-pain-revision-2021',
  shoulder: 'AAOS. Management of Rotator Cuff Injuries CPG (2025). https://www.aaos.org/quality/quality-programs/rotator-cuff/',
  cervical: 'APTA Orthopedics. Neck Pain: Clinical Practice Guidelines (2022).',
  knee: 'AAOS. Management of Osteoarthritis of the Knee CPG (2022).',
  neuro: 'APTA Neurology. Locomotor Training & Balance Guidelines in Stroke and Parkinson (2023).',
  general: 'Conteúdo educacional original do Fisio Clínico (2026), baseado em cinesiologia e prática baseada em evidências.'
};

const conditionPrograms = [
  // 14 Original programs (IDs must remain exactly identical)
  ['joelho','Dor e osteoartrite do joelho','Joelho','Mobilidade, força do quadríceps/quadril e função','Diferenciar trauma agudo, bloqueio mecânico verdadeiro, derrame importante e instabilidade antes de selecionar carga.'],
  ['equilibrio','Equilíbrio e risco de quedas','Equilíbrio','Controle postural, transferência de peso e tarefas funcionais','Manter apoio próximo e ajustar assistência, base, superfície e dupla tarefa. Nunca realizar sem supervisão segura.'],
  ['fascite-plantar','Dor plantar do calcâneo / fascite plantar','Pé e tornozelo','Mobilidade fascial com Windlass, musculatura intrínseca e progressão de carga','Confirmar diagnóstico diferencial; dor no calcâneo também pode ter origem neural, óssea ou na almofada adiposa.'],
  ['tunel-carpo','Síndrome do túnel do carpo','Punho e mão','Mobilidade neural do mediano, excursão tendínea e função manual','Dosar sem sustentar parestesia; piora progressiva de força ou sensibilidade exige reavaliação médica.'],
  ['dor-lombar','Dor lombar inespecífica e mecânica','Coluna lombar','Ativação do core, mobilidade suave, condicionamento e retorno à função','Triar sinais de alerta (cauda equina, febre, déficit motor progressivo). Evitar repouso absoluto prolongado.'],
  ['tendao-biceps','Dor relacionada ao tendão do bíceps','Ombro e cotovelo','Carga gradual do bíceps, supinação e controle escapular','Diferenciar lesão traumática (Popeye), dor cervical e conflito do manguito; ajustar amplitude e carga.'],
  ['fratura','Reabilitação pós-fratura e imobilização','Pós-trauma','Edema, mobilidade protegida, força e retorno funcional','Local, estabilidade, consolidação, cirurgia e liberação de carga determinam o que é permitido. Seguir prescrição médica.'],
  ['manguito-pos-op','Pós-operatório de manguito rotador','Ombro','Proteção do reparo, mobilidade por fase e fortalecimento progressivo','Usar somente dentro do protocolo do cirurgião; tamanho da lesão e técnica cirúrgica alteram prazos e restrições.'],
  ['escapula-alada','Escápula alada e déficit de controle escapular','Cintura escapular','Serrátil anterior, trapézio e controle em cadeia cinética','Investigar causa neurológica, dor e perda de força; não presumir que toda discinesia exige correção estética.'],
  ['fibromialgia','Fibromialgia e dor crônica difusa','Corpo inteiro','Atividade aeróbica com pacing, força global e autorregulação','Começar abaixo do limite percebido, progredir lentamente e considerar fadiga, sono e recuperação nas 48h.'],
  ['entorse-tornozelo','Entorse lateral de tornozelo','Pé e tornozelo','Mobilidade em dorsiflexão, eversores, propriocepção e retorno à tarefa','Excluir fratura pelas regras de Ottawa e ajustar carga à fase, edema, dor e estabilidade articular.'],
  ['quadril-artrose','Dor no quadril / osteoartrite (coxartrose)','Quadril e pelve','Força dos abdutores, mobilidade e capacidade funcional','A escolha depende de irritabilidade, amplitude, tolerância à carga e objetivos de marcha/transferência.'],
  ['cervicalgia','Cervicalgia mecânica e postural','Coluna cervical','Mobilidade, controle craniocervical e cintura escapular','Triar trauma recente, sinais neurológicos, cefaleia atípica em trovoada, tontura e sintomas vértebro-basilares.'],
  ['epicondilalgia','Epicondilalgia lateral (cotovelo de tenista)','Cotovelo e antebraço','Isometria analgésica, carga excêntrica dos extensores e preensão neutra','Ajustar carga provocativa e investigar sintomas neurais do interósseo posterior ou cervicais quando pertinentes.'],

  // New High-Impact Pathologies
  ['hernia-lombar','Hérnia de disco lombar e ciatalgia','Coluna lombar','Centralização dos sintomas, neurodinâmica do ciático e estabilização de tronco','Monitorar centralização vs periferização. Se a dor descer para a perna/pé durante o exercício, reduza a amplitude.'],
  ['cervicobraquialgia','Cervicobraquialgia e radiculopatia cervical','Coluna cervical e braço','Abertura foraminal, mobilização neural do plexo braquial e controle proximal','Não forçar posições que reproduzam choques ou formigamento distal sustentado nos dedos.'],
  ['manguito-rotador','Tendinopatia do manguito rotador e impacto','Ombro','Isometria analgésica, rotadores externos e controle no plano escapular','Evitar arcos dolorosos provocativos no início (abdução entre 70° e 120° com rotação interna). Priorizar plano escapular.'],
  ['capsulite-adesiva','Capsulite adesiva / ombro congelado','Ombro','Mobilidade articular gradual respeitando a fase biológica e o espasmo protetor','Na fase inflamatória dolorosa (congelamento), mobilizações vigorosas ou alongamentos agressivos pioram a dor.'],
  ['instabilidade-ombro','Instabilidade anterior e pós-luxação de ombro','Ombro','Propriocepção glenoumeral, coativação do manguito e estabilização escapular','Evitar a posição de apreensão (abdução a 90° combinada com rotação externa máxima) nas primeiras fases.'],
  ['pos-op-lca','Pós-operatório de reconstrução de LCA','Joelho','Extensão passiva completa precoce (0°), ativação de quadríceps e cadeia fechada','Jamais permitir flexo residual de joelho (perda de extensão é a complicação mais limitante).'],
  ['femoropatelar','Síndrome da dor femoropatelar (SDFP)','Joelho e patela','Fortalecimento de abdutores/rotadores do quadril, quadríceps e controle do valgo dinâmico','Evitar cadeira extensora entre 0° e 30° com carga pesada e agachamento profundo doloroso nas fases iniciais.'],
  ['tendinopatia-patelar','Tendinopatia patelar (joelho do saltador)','Joelho e tendão patelar','Isometria pesada para analgesia do tendão, excêntrico em declive e controle elástico','Evitar saltos ou desacelerações bruscas na fase inicial de dor. Monitorar resposta de dor matinal no tendão.'],
  ['bursite-trocanterica','Síndrome da dor trocantérica maior / bursite','Quadril lateral','Isometria de glúteo médio, fortalecimento sem compressão em adução e educação postural','Evitar cruzar as pernas sentado e dormir de lado sobre o quadril afetado sem travesseiro entre os joelhos.'],
  ['tendao-aquiles','Tendinopatia do calcâneo (tendão de Aquiles)','Tornozelo e panturrilha','Carga gradual de gastrocnêmio-sóleo, isometria em ponta de pé e descida excêntrica','Evitar alongamentos balísticos agressivos na fase dolorosa. Ajustar calçado para evitar atrito no calcanhar.'],
  ['avc-hemiparesia','Reabilitação pós-AVC e hemiparesia','Neurofuncional','Descarga de peso no dimídio plégico, inibição de padrões sinérgicos e tarefas funcionais','Apoiar o ombro plégico para prevenir subluxação e dor. Jamais tracionar o paciente pelo braço afetado.'],
  ['parkinson','Doença de Parkinson e distúrbios da marcha','Neurofuncional','Movimentos de grande amplitude (método BIG), rotação axial e superação de freezing','Risco elevado de quedas por retropulsão e festinação. Usar pistas rítmicas auditivas ou visuais no chão.'],
  ['cifose-escapular','Hipercifose torácica e dor escapular postural','Coluna torácica','Extensão torácica, mobilidade costal, fortalecimento de romboides e trapézio médio','Evitar hiperextensão lombar compensatória durante a busca de extensão torácica.']
];

// Preserving ALL 64 pristine rows with their exact IDs, plus tagging new condition associations
const originalRows = [
  ['knee-terminal-extension','Extensão terminal do joelho com faixa','Joelho','Treinar extensão ativa e controle do quadríceps.','Em pé, faixa atrás do joelho e apoio disponível.',['Flexionar levemente o joelho.','Estender até o alinhamento tolerado sem projetar o tronco.','Retornar controlando a faixa.'],['joelho','pos-op-lca','femoropatelar','tendinopatia-patelar'],['força do quadríceps','controle do joelho'],['faixa elástica'],'Básica'],
  ['knee-sit-stand','Sentar e levantar com altura ajustada','Joelho','Integrar força de membros inferiores em uma tarefa funcional.','Sentado em cadeira firme, pés apoiados.',['Inclinar o tronco conforme necessário.','Levantar distribuindo a carga de modo controlado.','Sentar sem deixar o corpo cair.'],['joelho','fibromialgia','quadril-artrose','pos-op-lca','avc-hemiparesia'],['força funcional','transferência'],['cadeira'],'Básica'],
  ['knee-low-step-up','Subida em degrau baixo','Joelho','Treinar subida de degrau e controle do membro de apoio.','Diante de degrau baixo, apoio lateral disponível.',['Apoiar todo o pé no degrau.','Subir com controle do joelho e pelve.','Descer lentamente.'],['joelho','quadril-artrose','pos-op-lca','tendinopatia-patelar'],['força','subir escadas'],['degrau baixo'],'Intermediária'],
  ['knee-band-side-step','Passos laterais com faixa','Joelho','Treinar abdutores do quadril e alinhamento dinâmico.','Em pé, faixa leve e base confortável.',['Manter joelhos suavemente flexionados.','Dar passos laterais sem arrastar os pés.','Manter tronco e pelve controlados.'],['joelho','quadril-artrose','femoropatelar','bursite-trocanterica'],['força do quadril','controle frontal'],['faixa elástica'],'Intermediária'],
  ['knee-supported-squat','Agachamento com apoio','Joelho','Treinar extensão de joelho e quadril em cadeia fechada.','Em pé, mãos em apoio firme.',['Levar o quadril para trás na amplitude tolerada.','Manter pés apoiados e joelhos controlados.','Retornar usando quadris e joelhos.'],['joelho','fibromialgia','pos-op-lca','tendinopatia-patelar'],['força','agachar'],['apoio firme'],'Básica'],

  ['balance-weight-shift','Transferência de peso multidirecional','Equilíbrio','Treinar limites de estabilidade com apoio disponível.','Em pé, base confortável diante de apoio.',['Mover o peso para frente, trás e lados.','Manter os pés apoiados.','Retornar ao centro após cada direção.'],['equilibrio','entorse-tornozelo','avc-hemiparesia','parkinson'],['equilíbrio','controle postural'],['apoio firme'],'Básica'],
  ['balance-semitandem','Equilíbrio em semitandem','Equilíbrio','Reduzir a base de suporte de forma graduada.','Em pé, um pé parcialmente à frente do outro.',['Ajustar a distância entre os pés.','Manter postura com apoio próximo.','Trocar a posição dos pés.'],['equilibrio','parkinson'],['equilíbrio estático'],['apoio próximo'],'Básica'],
  ['balance-tandem-walk','Marcha tandem assistida','Equilíbrio','Treinar controle em base estreita durante deslocamento.','Ao lado de uma bancada ou barra.',['Caminhar colocando um pé à frente do outro.','Usar apoio conforme necessário.','Manter velocidade segura.'],['equilibrio','parkinson'],['equilíbrio dinâmico','marcha'],['barra ou bancada'],'Intermediária'],
  ['balance-clock-reach','Alcance em relógio','Equilíbrio','Treinar apoio unilateral e alcance multidirecional.','Em pé sobre um membro, apoio disponível.',['Imaginar alvos ao redor como um relógio.','Tocar alvos com o pé livre.','Retornar ao centro entre os alcances.'],['equilibrio','entorse-tornozelo'],['equilíbrio dinâmico','alcance'],['marcadores'],'Intermediária'],
  ['balance-obstacle-course','Circuito de obstáculos baixos','Equilíbrio','Integrar marcha, mudança de direção e transposição.','Corredor livre com obstáculos seguros.',['Contornar cones.','Transpor marcas ou barreiras baixas.','Variar direção somente com segurança.'],['equilibrio','parkinson'],['marcha','mudança de direção'],['cones; marcas no chão'],'Avançada'],

  ['plantar-fascia-stretch','Alongamento específico da fáscia plantar','Pé e tornozelo','Mobilizar a fáscia plantar e estruturas do arco.','Sentado, pé afetado sobre a outra perna.',['Segurar os dedos do pé.','Levar os dedos em extensão até perceber tensão confortável no arco.','Relaxar sem movimentos bruscos.'],['fascite-plantar'],['mobilidade do pé'],[],'Básica'],
  ['plantar-calf-stretch-straight','Alongamento de gastrocnêmio na parede','Pé e tornozelo','Explorar dorsiflexão com joelho estendido.','Em pé diante da parede, perna-alvo atrás.',['Manter calcanhar apoiado e joelho estendido.','Avançar o corpo sem rodar o pé.','Sustentar tensão confortável.'],['fascite-plantar','entorse-tornozelo','tendao-aquiles'],['mobilidade do tornozelo'],['parede'],'Básica'],
  ['plantar-calf-stretch-bent','Alongamento de sóleo na parede','Pé e tornozelo','Explorar dorsiflexão com joelho flexionado.','Em pé diante da parede, perna-alvo atrás.',['Manter o calcanhar apoiado.','Flexionar suavemente o joelho de trás.','Sustentar sem colapsar o arco.'],['fascite-plantar','entorse-tornozelo','tendao-aquiles'],['mobilidade do tornozelo'],['parede'],'Básica'],
  ['plantar-short-foot','Ativação do arco plantar (short foot)','Pé e tornozelo','Treinar musculatura intrínseca e controle do arco.','Sentado ou em pé, planta do pé apoiada.',['Manter os dedos relaxados.','Aproximar suavemente a base do hálux do calcanhar.','Relaxar sem enrolar os dedos.'],['fascite-plantar','entorse-tornozelo','tendao-aquiles'],['controle do arco','força do pé'],[],'Básica'],
  ['plantar-heel-raise-towel','Elevação de panturrilha com toalha sob os dedos','Pé e tornozelo','Carregar panturrilha e mecanismo do arco de forma progressiva.','Em pé, dedos sobre toalha dobrada e apoio próximo.',['Elevar os calcanhares na amplitude tolerada.','Manter pressão distribuída no antepé.','Descer lentamente.'],['fascite-plantar','tendao-aquiles'],['força da panturrilha','tolerância à carga'],['toalha; apoio'],'Intermediária'],

  ['cts-tendon-glide','Deslizamento tendíneo da mão','Punho e mão','Promover excursão dos tendões flexores com baixa carga.','Antebraço apoiado e punho neutro.',['Alternar mão aberta, gancho, punho reto e punho fechado.','Executar sem força excessiva.','Retornar à mão aberta entre posições.'],['tunel-carpo'],['mobilidade tendínea','função manual'],[],'Básica'],
  ['cts-median-slider','Deslizamento do nervo mediano em baixa amplitude','Punho e mão','Mobilizar o tecido neural sem sustentar sintomas.','Sentado, ombro relaxado e cotovelo junto ao corpo.',['Alternar suavemente extensão de punho/dedos com flexão.','Combinar pequena extensão do cotovelo somente se tolerada.','Reduzir amplitude se houver aumento persistente de parestesia.'],['tunel-carpo','cervicobraquialgia'],['mobilidade neural'],[],'Básica'],
  ['cts-wrist-range','Mobilidade ativa do punho','Punho e mão','Manter flexão, extensão e desvios em amplitude confortável.','Antebraço apoiado com mão livre.',['Mover o punho para cima e para baixo.','Realizar desvios laterais sem girar o antebraço.','Usar amplitude não provocativa.'],['tunel-carpo'],['mobilidade do punho'],[],'Básica'],
  ['cts-thumb-opposition','Oposição sequencial do polegar','Punho e mão','Treinar coordenação e mobilidade do polegar.','Mão apoiada e relaxada.',['Tocar o polegar em cada dedo.','Abrir a mão entre os toques.','Variar a sequência sem apertar.'],['tunel-carpo'],['coordenação','função manual'],[],'Básica'],
  ['cts-light-grip','Preensão leve graduada','Punho e mão','Treinar força de preensão sem compressão excessiva sustentada.','Antebraço apoiado, punho próximo do neutro.',['Comprimir objeto macio com força leve.','Relaxar completamente.','Interromper se parestesia aumentar e persistir.'],['tunel-carpo'],['preensão','força da mão'],['espuma ou bola macia'],'Básica'],

  ['lumbar-breath-brace','Respiração diafragmática com ativação suave','Coluna','Treinar respiração e controle de tronco com baixa demanda.','Decúbito dorsal ou posição confortável.',['Inspirar expandindo a caixa torácica.','Expirar e ativar suavemente a parede abdominal.','Manter respiração sem prender o ar.'],['dor-lombar','fibromialgia','hernia-lombar'],['controle do tronco','respiração'],[],'Básica'],
  ['lumbar-pelvic-tilt','Inclinação pélvica em decúbito','Coluna','Explorar movimento lumbopélvico e controle motor.','Decúbito dorsal, joelhos flexionados.',['Alternar suavemente retroversão e posição neutra.','Evitar esforço máximo.','Manter respiração confortável.'],['dor-lombar','hernia-lombar'],['mobilidade','controle motor'],['colchonete'],'Básica'],
  ['lumbar-heel-tap','Dead bug com toque do calcanhar','Coluna','Treinar estabilidade do tronco durante movimento dos membros.','Decúbito dorsal, quadris e joelhos flexionados conforme tolerado.',['Organizar o tronco sem prender a respiração.','Tocar um calcanhar no chão.','Retornar e alternar mantendo a pelve controlada.'],['dor-lombar','hernia-lombar'],['resistência do tronco','controle motor'],['colchonete'],'Intermediária'],
  ['lumbar-bird-dog','Bird dog com progressão por segmentos','Coluna','Treinar controle cruzado e resistência do tronco.','Quatro apoios.',['Começar deslizando um pé ou braço.','Progredir para braço e perna opostos.','Evitar rotação excessiva da pelve.'],['dor-lombar','hernia-lombar'],['controle motor','resistência'],['colchonete'],'Intermediária'],
  ['lumbar-walk-interval','Caminhada intervalada autorregulada','Condicionamento','Aumentar gradualmente tolerância à atividade aeróbica.','Percurso seguro ou esteira.',['Escolher duração inicial tolerável.','Alternar caminhada e pausa se necessário.','Registrar resposta durante e após.'],['dor-lombar','fibromialgia','quadril-artrose'],['condicionamento','tolerância à atividade'],['calçado adequado'],'Básica'],

  ['biceps-flexion-isometric','Isometria de flexão do cotovelo','Ombro e cotovelo','Introduzir carga ao bíceps sem movimento amplo.','Cotovelo em ângulo confortável, mão contra resistência fixa.',['Aplicar força submáxima para flexionar.','Manter ombro relaxado.','Reduzir intensidade se a resposta não for tolerável.'],['tendao-biceps'],['força do bíceps','tolerância à carga'],['toalha ou resistência manual'],'Básica'],
  ['biceps-supination-isometric','Isometria de supinação','Ombro e cotovelo','Treinar função supinadora do bíceps com baixa amplitude.','Cotovelo junto ao corpo e antebraço neutro.',['Tentar girar a palma para cima contra resistência fixa.','Evitar mover o ombro.','Relaxar entre contrações.'],['tendao-biceps'],['força do bíceps','supinação'],['resistência manual'],'Básica'],
  ['biceps-eccentric-curl','Flexão de cotovelo com retorno excêntrico','Ombro e cotovelo','Progredir carga do bíceps com ênfase na descida.','Sentado ou em pé, carga selecionada.',['Auxiliar a subida se necessário.','Descer lentamente estendendo o cotovelo.','Manter o braço próximo ao corpo.'],['tendao-biceps'],['força','controle excêntrico'],['halter ou faixa'],'Intermediária'],
  ['biceps-scaption-light','Elevação no plano escapular com carga leve','Ombro','Integrar bíceps, deltoide e controle escapular durante alcance.','Em pé, braço ligeiramente à frente do plano frontal.',['Elevar na amplitude selecionada.','Manter pescoço relaxado.','Descer com controle.'],['tendao-biceps','manguito-rotador'],['alcance','força do ombro'],['peso leve opcional'],'Intermediária'],
  ['biceps-row','Remada com faixa e controle escapular','Ombro','Treinar puxada e estabilidade proximal.','Sentado ou em pé, faixa fixada à frente.',['Puxar os cotovelos para trás.','Organizar escápulas sem elevar ombros.','Retornar lentamente.'],['tendao-biceps','escapula-alada','cervicalgia','instabilidade-ombro'],['força escapular','puxar'],['faixa elástica'],'Básica'],

  ['fracture-distal-pump','Bombeamento distal para edema','Pós-trauma','Favorecer movimento distal e registro da resposta do edema.','Membro apoiado e protegido conforme orientação.',['Abrir e fechar mão ou mover tornozelo, conforme local.','Usar amplitude permitida.','Observar dor, cor e edema.'],['fratura'],['edema','circulação'],[],'Básica'],
  ['fracture-adjacent-rom','Mobilidade das articulações adjacentes','Pós-trauma','Preservar mobilidade fora do segmento protegido.','Membro sustentado conforme restrições.',['Mover apenas articulações liberadas.','Usar amplitude confortável.','Não produzir torque no foco da fratura.'],['fratura'],['mobilidade','prevenção de rigidez'],[],'Básica'],
  ['fracture-protected-isometric','Isometria protegida do segmento liberado','Pós-trauma','Introduzir ativação muscular sem deslocamento visível.','Posição definida pelo protocolo.',['Ativar suavemente o grupo autorizado.','Manter sem prender a respiração.','Relaxar e observar a resposta.'],['fratura'],['ativação muscular'],[],'Básica'],
  ['fracture-weight-shift','Transferência de carga após liberação','Pós-trauma','Progredir aceitação de carga quando formalmente autorizada.','Em pé com apoio e dispositivo prescritos.',['Transferir pequena parcela de peso.','Respeitar a carga liberada.','Retornar ao centro com controle.'],['fratura'],['tolerância à carga','marcha'],['apoio; dispositivo prescrito'],'Intermediária'],
  ['fracture-functional-reach','Alcance funcional protegido','Pós-trauma','Reintegrar o membro em tarefa significativa dentro das restrições.','Posição estável e objeto leve.',['Definir tarefa e amplitude autorizadas.','Alcançar ou transportar objeto leve.','Registrar compensações e resposta.'],['fratura'],['função','alcance'],['objeto leve'],'Intermediária'],

  ['rc-postop-pendulum','Pêndulo de ombro pós-operatório','Ombro','Promover movimento suave com baixa ativação quando liberado.','Tronco inclinado, mão oposta apoiada e braço operado relaxado.',['Produzir pequenos movimentos pelo deslocamento do corpo.','Manter o braço relaxado.','Respeitar amplitude e fase do protocolo.'],['manguito-pos-op','capsulite-adesiva','manguito-rotador'],['mobilidade protegida'],['mesa'],'Básica'],
  ['rc-postop-passive-er','Rotação externa passiva com bastão','Ombro','Ganhar mobilidade passiva dentro do limite cirúrgico.','Decúbito ou sentado, cotovelo apoiado.',['Usar o membro não operado para mover o bastão.','Parar no limite definido pelo protocolo.','Retornar sem contração ativa excessiva.'],['manguito-pos-op','capsulite-adesiva'],['mobilidade passiva'],['bastão'],'Básica'],
  ['rc-postop-assisted-flexion','Flexão assistida em decúbito','Ombro','Progredir elevação assistida conforme fase liberada.','Decúbito, mãos unidas ou bastão.',['O membro não operado auxilia a elevação.','Manter amplitude autorizada.','Retornar de forma controlada.'],['manguito-pos-op','capsulite-adesiva'],['mobilidade assistida','alcance'],['bastão opcional'],'Básica'],
  ['rc-postop-scapular-setting','Organização escapular pós-operatória','Ombro','Manter consciência e controle escapular com braço protegido.','Sentado ou em pé, tipoia conforme prescrição.',['Alongar a coluna.','Realizar retração/depressão suave sem forçar.','Relaxar completamente.'],['manguito-pos-op','escapula-alada','capsulite-adesiva','instabilidade-ombro'],['controle escapular'],[],'Básica'],
  ['rc-postop-er-band','Rotação externa com faixa em fase de força','Ombro','Fortalecer rotadores externos após liberação para resistência.','Em pé, cotovelo junto ao corpo.',['Girar o antebraço para fora.','Manter cotovelo estável.','Retornar lentamente.'],['manguito-pos-op','manguito-rotador','instabilidade-ombro'],['força do manguito'],['faixa elástica'],'Intermediária'],

  ['wing-serratus-punch','Soco do serrátil em decúbito','Cintura escapular','Treinar protração e controle do serrátil anterior.','Decúbito dorsal, braço apontado para o teto.',['Alcançar o teto sem dobrar o cotovelo.','Permitir movimento da escápula.','Retornar sem deixar o ombro cair.'],['escapula-alada'],['força do serrátil','controle escapular'],['peso leve opcional'],'Básica'],
  ['wing-wall-slide-plus','Wall slide com plus','Cintura escapular','Integrar rotação superior e protração escapular.','Antebraços na parede.',['Deslizar os braços para cima.','Ao final, afastar suavemente o tronco da parede.','Retornar controlando.'],['escapula-alada','cifose-escapular','manguito-rotador'],['serrátil anterior','alcance'],['parede'],'Intermediária'],
  ['wing-wall-pushup-plus','Flexão na parede com plus','Cintura escapular','Treinar estabilidade escapular em cadeia fechada.','Mãos na parede, corpo alinhado.',['Flexionar cotovelos aproximando o corpo.','Empurrar a parede.','Finalizar com protração sem arredondar excessivamente o tronco.'],['escapula-alada','instabilidade-ombro'],['força escapular','empurrar'],['parede'],'Básica'],
  ['wing-dynamic-hug','Abraço dinâmico com faixa','Cintura escapular','Treinar protração e controle do membro superior.','Faixa atrás do tronco, cotovelos levemente flexionados.',['Levar as mãos à frente como em um abraço.','Permitir protração controlada.','Retornar lentamente.'],['escapula-alada'],['serrátil anterior','força'],['faixa elástica'],'Intermediária'],
  ['wing-prone-y','Elevação em Y em decúbito ventral','Cintura escapular','Treinar trapézio inferior e controle da elevação.','Decúbito ventral, braços em Y.',['Organizar a escápula.','Elevar os braços na amplitude tolerada.','Evitar elevar os ombros em direção às orelhas.'],['escapula-alada','cifose-escapular'],['trapézio inferior','controle escapular'],['colchonete'],'Intermediária'],

  ['fibro-mobility-flow','Sequência global de mobilidade suave','Corpo inteiro','Explorar movimento global com baixa intensidade.','Sentado ou em pé, ambiente confortável.',['Combinar mobilidade de ombros, coluna, quadris e tornozelos.','Manter ritmo confortável.','Reduzir duração se houver piora tardia relevante.'],['fibromialgia'],['mobilidade','autorregulação'],[],'Básica'],
  ['fibro-walk-pacing','Caminhada com pacing','Condicionamento','Construir consistência de atividade sem ciclos de excesso e interrupção.','Percurso plano e seguro.',['Escolher duração conservadora.','Manter ritmo conversável.','Progredir uma variável por vez conforme recuperação.'],['fibromialgia'],['condicionamento','pacing'],['calçado adequado'],'Básica'],
  ['fibro-aquatic-walk','Caminhada em piscina','Condicionamento','Treinar condicionamento e mobilidade com menor impacto percebido.','Piscina acessível e supervisionada quando necessário.',['Caminhar em diferentes direções.','Ajustar profundidade e velocidade.','Monitorar fadiga durante e após.'],['fibromialgia'],['condicionamento','mobilidade'],['piscina'],'Básica'],
  ['fibro-global-band','Circuito global com faixa leve','Corpo inteiro','Treinar força global com volume graduável.','Sentado ou em pé, faixa leve.',['Selecionar poucos movimentos multiarticulares.','Executar sem prender a respiração.','Registrar tolerância nas 24 horas seguintes.'],['fibromialgia'],['força global','tolerância à atividade'],['faixa elástica'],'Básica'],
  ['fibro-chair-march','Marcha sentada intervalada','Condicionamento','Oferecer opção aeróbica de baixa complexidade.','Sentado em cadeira firme.',['Elevar os pés alternadamente.','Movimentar braços se tolerado.','Alternar atividade e recuperação.'],['fibromialgia','equilibrio','avc-hemiparesia'],['condicionamento','coordenação'],['cadeira'],'Básica'],

  ['ankle-alphabet','Alfabeto com o tornozelo','Pé e tornozelo','Explorar mobilidade ativa multidirecional.','Sentado, pé sem apoio ou calcanhar apoiado.',['Desenhar letras pequenas com o pé.','Manter o joelho estável.','Evitar amplitude que aumente edema ou dor.'],['entorse-tornozelo'],['mobilidade do tornozelo'],[],'Básica'],
  ['ankle-band-eversion','Eversão com faixa','Pé e tornozelo','Fortalecer eversores e controle lateral.','Sentado, faixa fixada medialmente.',['Mover o antepé para fora.','Evitar girar o joelho.','Retornar lentamente.'],['entorse-tornozelo'],['força dos fibulares'],['faixa elástica'],'Básica'],
  ['ankle-calf-raise','Elevação bilateral de panturrilha','Pé e tornozelo','Treinar panturrilha e tolerância ao apoio.','Em pé com apoio próximo.',['Elevar os calcanhares.','Distribuir a carga conforme tolerância.','Descer lentamente.'],['entorse-tornozelo','fascite-plantar','tendao-aquiles'],['força da panturrilha','apoio'],['apoio firme'],'Básica'],
  ['ankle-single-leg','Apoio unipodal com suporte','Pé e tornozelo','Treinar estabilidade do tornozelo e controle postural.','Em pé ao lado de apoio firme.',['Transferir o peso para o membro-alvo.','Elevar o outro pé.','Usar a mão conforme necessário.'],['entorse-tornozelo','equilibrio'],['equilíbrio','estabilidade'],['apoio firme'],'Intermediária'],
  ['ankle-step-down','Descida de degrau baixo','Pé e tornozelo','Treinar dorsiflexão, controle e desaceleração.','Sobre degrau baixo com apoio lateral.',['Flexionar o membro de apoio.','Tocar o calcanhar livre no chão.','Retornar mantendo o pé apoiado.'],['entorse-tornozelo','joelho'],['controle excêntrico','descer escadas'],['degrau baixo'],'Intermediária'],

  ['hip-bridge','Ponte curta','Quadril','Treinar extensores do quadril e controle lumbopélvico.','Decúbito dorsal, joelhos flexionados.',['Pressionar os pés.','Elevar a pelve na amplitude tolerada.','Descer lentamente.'],['quadril-artrose','dor-lombar','hernia-lombar','bursite-trocanterica'],['força do quadril','transferência'],['colchonete'],'Básica'],
  ['hip-clamshell','Abdução/rotação lateral em decúbito lateral','Quadril','Treinar musculatura posterolateral do quadril.','Decúbito lateral, joelhos flexionados.',['Manter os pés juntos.','Elevar o joelho de cima sem rodar a pelve.','Retornar lentamente.'],['quadril-artrose','joelho','femoropatelar','bursite-trocanterica'],['força do quadril'],['faixa opcional'],'Básica'],
  ['hip-abduction-standing','Abdução de quadril em pé','Quadril','Treinar abdutores em posição funcional.','Em pé com apoio.',['Mover a perna para o lado.','Manter tronco ereto e pé apontado à frente.','Retornar com controle.'],['quadril-artrose','equilibrio','femoropatelar','bursite-trocanterica'],['força do quadril','equilíbrio'],['apoio firme'],'Básica'],
  ['hip-cycle','Bicicleta ergométrica com ajuste individual','Quadril','Trabalhar mobilidade cíclica e condicionamento.','Selim ajustado e resistência baixa inicial.',['Pedalar em amplitude confortável.','Ajustar tempo e resistência separadamente.','Registrar resposta após a sessão.'],['quadril-artrose','joelho','fibromialgia','bursite-trocanterica'],['condicionamento','mobilidade'],['bicicleta ergométrica'],'Básica'],
  ['hip-step-up','Subida em degrau com apoio','Quadril','Treinar extensores e abdutores em tarefa de escada.','Diante de degrau baixo.',['Apoiar todo o pé.','Subir estendendo quadril e joelho.','Descer com apoio se necessário.'],['quadril-artrose'],['força','escadas'],['degrau; apoio'],'Intermediária'],

  ['neck-chin-tuck','Retração cervical (chin tuck)','Coluna cervical','Treinar controle craniocervical em baixa carga.','Sentado ou deitado, olhar horizontal.',['Alongar a nuca.','Recuar suavemente o queixo sem olhar para baixo.','Relaxar sem sustentar tensão excessiva.'],['cervicalgia','cervicobraquialgia'],['controle cervical','postura'],[],'Básica'],
  ['neck-active-rotation','Rotação cervical ativa','Coluna cervical','Explorar rotação em amplitude confortável.','Sentado com tronco apoiado.',['Girar lentamente para um lado.','Retornar ao centro.','Alternar sem elevar os ombros.'],['cervicalgia','cervicobraquialgia'],['mobilidade cervical'],['cadeira'],'Básica'],
  ['neck-isometric','Isometria cervical multidirecional','Coluna cervical','Treinar resistência cervical sem movimento amplo.','Sentado, cabeça alinhada.',['Aplicar leve resistência com a mão à frente, atrás ou ao lado.','Manter a cabeça estável.','Respirar e relaxar entre direções.'],['cervicalgia','cervicobraquialgia'],['resistência cervical'],[],'Básica'],
  ['neck-thoracic-extension','Extensão torácica na cadeira','Coluna torácica','Explorar mobilidade torácica para tarefas de olhar e alcançar.','Sentado, encosto na região torácica.',['Apoiar as mãos na nuca.','Estender suavemente sobre o encosto.','Evitar forçar a cervical.'],['cervicalgia','dor-lombar','cifose-escapular','cervicobraquialgia'],['mobilidade torácica','postura'],['cadeira'],'Básica'],
  ['neck-band-row','Remada com faixa','Cintura escapular','Treinar resistência escapular associada a tarefas posturais.','Sentado ou em pé, faixa à frente.',['Puxar os cotovelos para trás.','Manter cabeça alinhada.','Retornar controlando.'],['cervicalgia','escapula-alada','cifose-escapular','cervicobraquialgia'],['força escapular','resistência'],['faixa elástica'],'Básica'],

  ['elbow-wrist-ext-isometric','Isometria dos extensores do punho','Cotovelo e punho','Introduzir carga aos extensores sem movimento.','Antebraço apoiado, punho neutro.',['Tentar elevar o dorso da mão contra resistência fixa.','Manter intensidade tolerável.','Relaxar completamente.'],['epicondilalgia'],['força dos extensores','tolerância à carga'],[],'Básica'],
  ['elbow-wrist-ext-eccentric','Extensão de punho com retorno excêntrico','Cotovelo e punho','Progredir carga dos extensores com ênfase na descida.','Antebraço apoiado, mão fora da borda.',['Auxiliar a subida com a outra mão.','Descer o peso lentamente.','Manter antebraço apoiado.'],['epicondilalgia'],['força','controle excêntrico'],['halter leve'],'Intermediária'],
  ['elbow-pronation-supination','Pronação e supinação com alavanca curta','Cotovelo e punho','Treinar controle rotacional do antebraço.','Sentado, cotovelo junto ao corpo.',['Girar a palma para cima e para baixo.','Usar alavanca curta inicialmente.','Evitar compensar com o ombro.'],['epicondilalgia','tunel-carpo'],['força do antebraço','função manual'],['martelo leve opcional'],'Básica'],
  ['elbow-grip-neutral','Preensão com punho neutro','Cotovelo e punho','Treinar preensão mantendo alinhamento do punho.','Antebraço apoiado e punho neutro.',['Comprimir objeto macio.','Evitar desviar ou estender excessivamente o punho.','Relaxar entre repetições.'],['epicondilalgia','tunel-carpo'],['preensão','força da mão'],['bola macia'],'Básica'],
  ['elbow-shoulder-row','Remada baixa para suporte proximal','Ombro e cotovelo','Treinar musculatura proximal durante tarefa de puxar.','Em pé ou sentado, faixa fixada.',['Puxar mantendo punhos neutros.','Controlar escápulas e ombros.','Retornar lentamente.'],['epicondilalgia','tendao-biceps'],['força proximal','puxar'],['faixa elástica'],'Básica']
];

// Rich new clinical exercises to ensure >= 5 items per new pathology and provide deep step-by-step
const newExercises = [
  // Hérnia Lombar
  ['hernia-prone-pressup','Extensão passiva em decúbito ventral (Mackenzie)','Coluna lombar','Favorecer a centralização do disco e redução da compressão foraminal.','Decúbito ventral, mãos apoiadas ao lado dos ombros.',['Manter a pelve e as pernas relaxadas no solo.','Empurrar o chão estendendo cotovelos na amplitude tolerada.','Pausar 2 segundos no topo expirando e retornar.'],['hernia-lombar'],['centralização discal','extensão lombar'],['colchonete'],'Básica'],
  ['hernia-sciatic-slider','Deslizamento neural do ciático em decúbito','Membro inferior e coluna','Mobilizar o trajeto do nervo ciático sem aplicar tensão máxima simultânea.','Decúbito dorsal, mãos entrelaçadas atrás da coxa a 90°.',['Ao estender o joelho, apontar a ponta do pé para o teto.','Ao dobrar o joelho, puxar a ponta do pé para si.','Alternar de forma suave por 10 a 15 repetições.'],['hernia-lombar'],['mobilidade neural','ciatalgia'],['colchonete'],'Básica'],

  // Manguito Rotador & Ombro
  ['shoulder-isometric-er','Isometria de rotação externa com toalha','Ombro','Produzir analgesia tendínea no infraespinal com baixa compressão subacromial.','Em pé, cotovelo a 90° colado ao tronco com toalha sob o cotovelo.',['Apoiar o dorso do punho contra a parede.','Pressionar para fora sem afastar o cotovelo da costela.','Sustentar por 20 a 30 segundos com esforço moderado.'],['manguito-rotador','capsulite-adesiva','instabilidade-ombro'],['analgesia tendínea','manguito'],['toalha; parede'],'Básica'],
  ['shoulder-scaption-elevation','Elevação no plano escapular (Scaption)','Ombro','Fortalecer supraespinal no ângulo de maior congruência mecânica (30° anterior).','Em pé, polegares apontados para cima.',['Elevar os braços cerca de 30° à frente da linha lateral até a altura dos ombros.','Pausar 1 segundo mantendo a nuca relaxada.','Descer lentamente em 3 segundos.'],['manguito-rotador','instabilidade-ombro'],['supraespinal','alcance'],['halter leve opcional'],'Intermediária'],
  ['shoulder-band-er-standing','Rotação externa com faixa elástica junto ao corpo','Ombro','Fortalecer ativamente os rotadores externos com resistência progressiva.','Em pé, cotovelo a 90° ao lado do corpo, faixa presa medialmente.',['Manter o cotovelo encostado na lateral.','Girar o antebraço para fora afastando a mão da barriga.','Retornar lentamente em 3 segundos.'],['manguito-rotador','instabilidade-ombro'],['força do manguito','controle excêntrico'],['faixa elástica'],'Intermediária'],

  // Joelho & LCA
  ['knee-quad-isometrics-towel','Isometria de quadríceps com toalha sob o joelho','Joelho','Despertar o vasto medial e controlar o derrame articular sem estresse patelofemoral.','Sentado com as pernas estendidas, rolinho de toalha de 10 cm sob o joelho.',['Pressionar a dobra do joelho firmemente para baixo contra a toalha.','Puxar a ponta do pé para cima estendendo a perna e contraindo a coxa.','Sustentar por 6 segundos e relaxar por 3 segundos.'],['joelho','pos-op-lca','femoropatelar','tendinopatia-patelar'],['ativação do quadríceps','extensão terminal'],['toalha'],'Básica'],
  ['knee-step-down-eccentric','Descida de degrau controlada (Step-down excêntrico)','Joelho','Desenvolver controle excêntrico do quadríceps e controle do valgo dinâmico.','Em pé sobre degrau baixo, pé afetado na borda.',['Flexionar o joelho de apoio levando o quadril suavemente para trás.','Tocar de leve o calcanhar livre no solo sem descarregar o peso total.','Estender o joelho de apoio retornando ereto.'],['joelho','femoropatelar','pos-op-lca','tendinopatia-patelar'],['controle excêntrico','descer escadas'],['degrau baixo'],'Intermediária'],

  // Fascite & Aquiles
  ['plantar-stretch-windlass','Alongamento da fáscia com mecanismo de Windlass','Pé e tornozelo','Tracionar especificamente a fáscia plantar aproveitando a dorsiflexão máxima dos dedos.','Sentado, perna afetada cruzada sobre a coxa oposta.',['Segurar a base de todos os dedos com a mão.','Puxar os dedos para cima em direção à tíbia até sentir a fáscia tensa.','Sustentar por 15 segundos e repetir 4 vezes.'],['fascite-plantar'],['alongamento específico','mecanismo de Windlass'],[],'Básica'],
  ['plantar-bottle-roll','Massagem plantar com garrafa gelada','Pé e tornozelo','Aliviar a dor fascial por crioterapia e mobilização do tecido conjuntivo.','Sentado em cadeira firme, garrafa com gelo no chão sob a planta do pé.',['Apoiar o pé descalço sobre a garrafa.','Rolar da base dos dedos até a frente do calcanhar com pressão confortável.','Manter por 5 a 8 minutos.'],['fascite-plantar'],['crioterapia','alívio fascial'],['garrafa com gelo'],'Básica'],
  ['ankle-knee-to-wall-dorsi','Mobilidade joelho à parede (Knee-to-wall)','Tornozelo','Restaurar a dorsiflexão em cadeia fechada do tornozelo.','Em pé diante da parede, pé a 8 cm da parede.',['Avançar o joelho em direção à parede sem levantar o calcanhar do solo.','Tocar suavemente o joelho na parede.','Retornar e repetir de forma dinâmica por 10 a 12 vezes.'],['entorse-tornozelo','fascite-plantar','tendao-aquiles'],['dorsiflexão','mobilidade'],['parede'],'Básica'],

  // Neuro & AVC
  ['stroke-weight-bearing-upper','Descarga de peso em membro superior hemiplégico','Neurofuncional','Estimular propriocepção glenoumeral e inibir padrão flexor espástico.','Sentado à mesa, cotovelo apoiado e palma da mão aberta.',['Posicionar a mão aberta com dedos estendidos sobre a mesa.','Inclinar o tronco para o lado do braço apoiado transferindo peso.','Sustentar a descarga de peso por 15 segundos respirando normalmente.'],['avc-hemiparesia'],['propriocepção','inibição de espasticidade'],['mesa firme'],'Básica'],
  ['stroke-reach-forward-table','Alcance anterior sobre a mesa com as duas mãos unidas','Neurofuncional','Estimular alcance anterior integrando o membro afetado e prevenindo subluxação.','Sentado à mesa, mãos entrelaçadas apoiadas em uma toalha na mesa.',['Deslizar as duas mãos para a frente sobre a mesa.','Alcançar o ponto mais distante confortável sem dor no ombro.','Retornar puxando a toalha de volta e alinhando o tronco.'],['avc-hemiparesia'],['alcance orientado à tarefa','integração bimanual'],['toalha; mesa'],'Básica'],

  // Parkinson
  ['parkinson-big-arm-reach','Movimentos de grande amplitude de braços e tronco (Big)','Neurofuncional','Combater a bradicinesia e a hipometria características do Parkinson.','Em pé ou sentado com base firme.',['Abrir os braços amplamente para os lados com palmas abertas.','Elevar os dois braços acima da cabeça em movimento grande e vigoroso.','Contar em voz alta e firme: UM, DOIS, TRÊS a cada ciclo.'],['parkinson'],['amplitude de movimento','comando vocal'],[],'Básica'],
  ['parkinson-visual-cue-walk','Marcha com pistas visuais no solo (Superação de Freezing)','Neurofuncional','Usar vias visuais corticais intactas para destravar o passo.','Em pé diante de marcas coloridas no chão espaçadas a 45 cm.',['Fixar o olhar na fita à frente no chão.','Elevar o joelho e pisar passando o calcanhar exatamente sobre a marca.','Seguir de marca em marca com passos amplos sem arrastar os pés.'],['parkinson'],['pistas visuais','superação de freezing'],['fita colorida'],'Intermediária'],
  ['parkinson-axial-rotation-seated','Rotação axial de tronco com bastão','Neurofuncional','Reduzir a rigidez axial em bloco e melhorar dissociação de cinturas.','Sentado em cadeira firme, bastão seguro à frente.',['Girar o tronco lentamente para a direita acompanhando com a cabeça.','Pausar 2 segundos no ponto de maior amplitude.','Girar lentamente para o lado esquerdo de forma ritmada.'],['parkinson','cifose-escapular'],['dissociação de cinturas','mobilidade axial'],['bastão'],'Básica']
];

const allRows = [...originalRows, ...newExercises];

// Verify every program has at least 5 exercises
for (const [id, name] of conditionPrograms) {
  const matches = allRows.filter(r => r[6].includes(id));
  if (matches.length < 5) {
    console.error(`ERRO: Condição ${id} (${name}) tem apenas ${matches.length} exercícios.`);
    process.exit(1);
  }
}

console.log(`Sucesso: ${conditionPrograms.length} programas clínicos verificados.`);
console.log(`Total de exercícios no acervo: ${allRows.length} (todos com >= 5 por condição).`);

const code = `const SOURCES = ${JSON.stringify(SOURCES, null, 2)};

export const conditionPrograms = ${JSON.stringify(conditionPrograms, null, 2)}.map(([id,name,region,focus,caution])=>({id,name,region,focus,caution}));

const rows = ${JSON.stringify(allRows, null, 2)};

const sourceFor = conditions => {
  if (conditions.includes('fascite-plantar')) return SOURCES.plantar;
  if (conditions.includes('dor-lombar') || conditions.includes('hernia-lombar')) return SOURCES.lumbar;
  if (conditions.some(id => ['manguito-rotador', 'manguito-pos-op', 'tendao-biceps', 'escapula-alada', 'capsulite-adesiva', 'instabilidade-ombro'].includes(id))) return SOURCES.shoulder;
  if (conditions.some(id => ['cervicalgia', 'cervicobraquialgia', 'cifose-escapular'].includes(id))) return SOURCES.cervical;
  if (conditions.some(id => ['joelho', 'femoropatelar', 'pos-op-lca', 'tendinopatia-patelar'].includes(id))) return SOURCES.knee;
  if (conditions.some(id => ['avc-hemiparesia', 'parkinson', 'equilibrio'].includes(id))) return SOURCES.neuro;
  return SOURCES.general;
};

export const conditionExercises = rows.map(([
  id, name, region, objective, startPosition, steps, conditions, goals, equipment, difficulty,
  therapistCue = 'Posicionar-se ao lado do paciente garantindo alinhamento postural, estabilização proximal e controle respiratório.',
  homeAdaptations = 'Pode ser executado com itens comuns do domicílio como cadeira firme, toalha de banho ou garrafa d’água.',
  clinicAdaptations = 'Em clínica, utilizar faixa elástica (Theraband), colchonete, degrau ou bola terapêutica conforme tolerância.',
  phase = 'Fase 2 · Subaguda / Ativação e controle motor',
  regression = 'Reduzir a amplitude de movimento, retirar a carga externa ou adicionar apoio manual de segurança.',
  progression = 'Aumentar gradualmente o número de repetições, a resistência elástica/peso ou a velocidade controlada.',
  compensation = 'Vigiar compensações posturais, perda do alinhamento articular dos segmentos adjacentes e apneia de esforço.'
]) => ({
  id: \`cond-\${id}\`,
  name,
  category: region,
  region,
  objective,
  startPosition,
  steps,
  conditions,
  goals,
  why: [objective, \`Pode apoiar objetivos de \${goals.join(' e ')} quando indicado pela avaliação.\`],
  tags: [...conditions, ...goals],
  synonyms: [],
  primaryMuscles: [],
  auxiliaryMuscles: [],
  equipment,
  difficulty,
  therapistCue,
  homeAdaptations,
  clinicAdaptations,
  phase,
  progressions: [progression, 'Aumentar uma variável por vez: amplitude, volume, resistência, velocidade ou complexidade.', 'Aproximar gradualmente da tarefa funcional relevante.'],
  regressions: [regression, 'Reduzir amplitude, carga, duração ou complexidade.', 'Adicionar apoio, assistência ou intervalo de recuperação.'],
  indications: [\`Possibilidade de consulta para \${conditions.map(cId => conditionPrograms.find(p => p.id === cId)?.name).filter(Boolean).join(', ')}.\`],
  commonCompensations: [compensation, 'Compensações dependem da tarefa; observar alinhamento, respiração e estratégia de movimento.'],
  commonErrors: ['Progredir mais de uma variável sem reavaliar a resposta.', 'Acelerar o movimento sem controle da fase excêntrica.'],
  exampleDose: 'Definir e registrar séries, repetições, tempo e carga conforme avaliação, fase e resposta.',
  doseNotes: 'A dose exibida é editável no checklist da sessão; o catálogo não prescreve automaticamente.',
  care: conditions.map(cId => conditionPrograms.find(p => p.id === cId)?.caution).filter(Boolean).join(' '),
  stopWhen: 'Interromper e reavaliar diante de piora importante ou persistente, novo déficit neurológico, instabilidade, dispneia desproporcional, dor torácica ou outro sinal preocupante.',
  functionalApplication: \`Aplicar aos objetivos de \${goals.join(', ')} quando fizer sentido para a pessoa.\`,
  clinicalNotes: \`Fase recomendada: \${phase}. Terapeuta: \${therapistCue}\`,
  side: 'Conforme avaliação',
  joint: region,
  capacities: goals,
  source: sourceFor(conditions),
  kind: 'exercise',
  conditionLibrary: true
}));

export const exercisesForCondition = id => conditionExercises.filter(exercise => exercise.conditions.includes(id));
`;

writeFileSync(targetFile, code, 'utf-8');
console.log('Arquivo gravado com sucesso em:', targetFile);
