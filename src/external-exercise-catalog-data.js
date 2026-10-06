const CHECKED_AT='2026-10-06';

export const externalCatalogSources={
  hep2go:{name:'HEP2go',url:'https://www.hep2go.com/',termsUrl:'https://www.hep2go.com/terms-P.php?userRef=0',license:'Uso no fluxo do próprio serviço; não foi identificada licença geral para redistribuição do catálogo.',attribution:'HEP2go, Inc.',rightsStatus:'nao_confirmado'},
  melbourne:{name:'University of Melbourne — CHESM',url:'https://healthsciences.unimelb.edu.au/departments/physiotherapy/chesm/video-library/videos-de-exercicios-em-portugues',termsUrl:'https://healthsciences.unimelb.edu.au/departments/physiotherapy/chesm/video-library/videos-de-exercicios-em-portugues/termos-de-uso',license:'Direitos autorais reservados; navegação ou impressão para uso pessoal/não comercial. Outros usos exigem permissão prévia por escrito.',attribution:'Centre for Health, Exercise & Sports Medicine, The University of Melbourne.',rightsStatus:'restrito'},
  usp:{name:'e-Aulas USP — Fisioterapia',url:'https://eaulas.usp.br/portal/course.action?course=8070',termsUrl:'https://eaulas.usp.br/portal/usage-policy.action',license:'Conteúdo protegido pela Lei 9.610/1998. A licença é informada individualmente em cada vídeo e não pôde ser confirmada automaticamente para estes itens.',attribution:'Universidade de São Paulo; autores indicados na página original.',rightsStatus:'licenca_por_item_pendente'},
  ouh:{name:'Oxford University Hospitals NHS Foundation Trust',url:'https://www.ouh.nhs.uk/physiotherapy/outpatients/videos/',termsUrl:'https://www.ouh.nhs.uk/help/terms-of-use/',license:'Acesso e download permitidos apenas para pesquisa privada, estudo ou uso interno, salvo indicação diferente no item.',attribution:'Oxford University Hospitals NHS Foundation Trust; filmagem/edição creditadas na página original.',rightsStatus:'restrito'},
  vedius:{name:'Vedius',url:'https://vedius.com.br/app-de-exercicios/',termsUrl:'https://app.vedius.com.br/termos-de-uso',license:'Todos os direitos reservados; nenhuma licença pública de redistribuição do catálogo foi identificada.',attribution:'Vedius Portal de Informação Ltda.',rightsStatus:'nao_confirmado'}
};

const melbourneBase=externalCatalogSources.melbourne.url;
const uspBase='https://eaulas.usp.br/portal/video.action?idItem=';
const ouhUrl=externalCatalogSources.ouh.url;

const melbourne=[
  ['mel-q1-q9','Fortalecimento de quadríceps — opções Q1 a Q9','joelho','fortalecimento','sentado; deitado; em pé','cadeira; faixa elástica; parede; degrau','Osteoartrite do joelho',`${melbourneBase}/portuguese-knee-videos/opoes-de-exercicios-de-fortalecimento-de-quadriceps-q1-q9`],
  ['mel-q10-q17','Fortalecimento de quadríceps — opções Q10 a Q17','joelho','fortalecimento','não informado pela fonte','não informado pela fonte','Osteoartrite do joelho',`${melbourneBase}/portuguese-knee-videos/opoes-de-exercicios-de-fortalecimento-de-quadriceps-q10-q17`],
  ['mel-hip-abductors','Fortalecimento de abdutores de quadril e glúteos','quadril','fortalecimento','não informado pela fonte','não informado pela fonte','Osteoartrite do joelho',`${melbourneBase}/portuguese-knee-videos/opoes-de-fortalecimento-de-abdutores-de-quadrilgluteos`],
  ['mel-hamstrings','Fortalecimento de posteriores de coxa e glúteos','quadril','fortalecimento','não informado pela fonte','não informado pela fonte','Osteoartrite do joelho',`${melbourneBase}/portuguese-knee-videos/opoes-de-exercicios-de-fortalecimento-para-posterioresgluteos`],
  ['mel-calf','Fortalecimento de panturrilha','tornozelo/pé','fortalecimento','não informado pela fonte','não informado pela fonte','Osteoartrite do joelho',`${melbourneBase}/portuguese-knee-videos/opcoes-de-exercicios-de-fortalecimento-de-panturrilha`],
  ['mel-balance','Exercícios de equilíbrio','corpo inteiro','equilíbrio','em pé','apoio estável','Osteoartrite do joelho',`${melbourneBase}/portuguese-knee-videos/exercicios-de-equilibrio`]
];

const usp=[
  ['8071','Auto Cuidado da Dor Lombar — Mobilização 3','coluna','mobilidade'],
  ['8073','Auto Cuidado da Dor Lombar — Alongamento 1','coluna','alongamento'],
  ['8074','Auto Cuidado da Dor Lombar — Alongamento 2','coluna','alongamento'],
  ['8075','Auto Cuidado da Dor Lombar — Alongamento 3','coluna','alongamento'],
  ['8076','Auto Cuidado da Dor Lombar — Alongamento 5','coluna','alongamento'],
  ['8077','Auto Cuidado da Dor Lombar — Alongamento 6','coluna','alongamento'],
  ['8078','Auto Cuidado da Dor Lombar — Alongamento 7','coluna','alongamento'],
  ['8079','Auto Cuidado da Dor Lombar — Alongamento 8','coluna','alongamento'],
  ['8080','Auto Cuidado da Dor Lombar — Fortalecimento 1','coluna','fortalecimento'],
  ['8081','Auto Cuidado da Dor Lombar — Fortalecimento 2','coluna','fortalecimento']
];

const ouh=[
  ['ouh-deltoid','Anterior Deltoid — Short Lever and Long Lever','ombro','fortalecimento','não informado pela fonte','não informado pela fonte'],
  ['ouh-scap-standing-1','Shoulder blade and rotator cuff exercise in standing 1','ombro','controle motor','em pé','não informado pela fonte'],
  ['ouh-scap-standing-2','Shoulder blade and rotator cuff exercise in standing 2','ombro','controle motor','em pé','não informado pela fonte'],
  ['ouh-scap-standing-3','Shoulder blade and rotator cuff exercise in standing 3','ombro','controle motor','em pé','não informado pela fonte'],
  ['ouh-scap-lying-1','Shoulder blade and rotator cuff exercise lying down 1','ombro','controle motor','deitado','não informado pela fonte'],
  ['ouh-scap-lying-2','Shoulder blade and rotator cuff exercise lying down 2','ombro','controle motor','deitado','não informado pela fonte'],
  ['ouh-scap-lying-3','Shoulder blade and rotator cuff exercise lying down 3','ombro','controle motor','deitado','não informado pela fonte'],
  ['ouh-scap-lying-4','Shoulder blade and rotator cuff exercise lying down 4','ombro','controle motor','deitado','não informado pela fonte'],
  ['ouh-scap-lying-5','Shoulder blade and rotator cuff exercise lying down 5','ombro','controle motor','deitado','não informado pela fonte'],
  ['ouh-calf-gastroc','Calf Stretch 1 — Gastrocnemius','tornozelo/pé','alongamento','não informado pela fonte','não informado pela fonte'],
  ['ouh-calf-soleus','Calf Stretch 2 — Soleus','tornozelo/pé','alongamento','não informado pela fonte','não informado pela fonte'],
  ['ouh-glute-med-1','Gluteus Medius Hip Strengthening Level 1','quadril','fortalecimento','não informado pela fonte','não informado pela fonte'],
  ['ouh-glute-med-2','Gluteus Medius Hip Strengthening Level 2','quadril','fortalecimento','não informado pela fonte','não informado pela fonte'],
  ['ouh-glute-med-3','Gluteus Medius Hip Strengthening Level 3','quadril','fortalecimento','não informado pela fonte','não informado pela fonte'],
  ['ouh-thoracic-side-1','Sitting Side Bend 1 — Lower Thoracic Lateral Flexion','coluna','mobilidade','sentado','cadeira'],
  ['ouh-thoracic-side-2','Sitting Side Bend 2 — Upper Thoracic Lateral Flexion','coluna','mobilidade','sentado','cadeira'],
  ['ouh-thoracic-rotation-1','Sitting Rotations 1 — Lower Thoracic Spine','coluna','mobilidade','sentado','cadeira'],
  ['ouh-thoracic-rotation-2','Sitting Rotations 2 — Upper Thoracic Spine','coluna','mobilidade','sentado','cadeira'],
  ['ouh-knee-hug','Knee Hug','coluna','alongamento','não informado pela fonte','sem equipamento'],
  ['ouh-knee-rolling','Knee Rolling Lower Back Stretch','coluna','mobilidade','deitado','sem equipamento'],
  ['ouh-child-pose','Child’s Pose Upper Back Stretch','coluna','alongamento','ajoelhado','sem equipamento'],
  ['ouh-bridge-1','Bridging Level 1','quadril','fortalecimento','deitado','sem equipamento'],
  ['ouh-bridge-2','Bridging Level 2','quadril','fortalecimento','deitado','sem equipamento']
];

const make=(sourceKey,row,overrides={})=>{const source=externalCatalogSources[sourceKey];return {id:row[0],name:row[1],region:row[2]||'não informado pela fonte',objective:row[3]||'não informado pela fonte',position:row[4]||'não informado pela fonte',equipment:row[5]||'não informado pela fonte',clinicalContext:row[6]||'não informado pela fonte',originalUrl:row[7]||source.url,sourceKey,source:source.name,sourceUrl:source.url,termsUrl:source.termsUrl,license:source.license,attribution:source.attribution,rightsStatus:source.rightsStatus,checkedAt:CHECKED_AT,reuseStatus:'somente_link',mediaUrl:'',instructions:[],dosage:'não informado pela fonte',precautions:'não informado pela fonte',...overrides};};

const exerciseLinks=[
  ...melbourne.map(row=>make('melbourne',row,{itemType:'colecao_de_exercicios'})),
  ...usp.map(row=>make('usp',[`usp-${row[0]}`,row[1],row[2],row[3],'não informado pela fonte','não informado pela fonte','Dor lombar',`${uspBase}${row[0]}`],{itemType:'video_de_exercicio'})),
  ...ouh.map(row=>make('ouh',row,{itemType:'video_de_exercicio'}))
];

const directories=[
  make('hep2go',['source-hep2go','HEP2go — construtor de programas','corpo inteiro','não informado pela fonte'],{itemType:'diretorio_externo'}),
  make('vedius',['source-vedius','Vedius — biblioteca de prescrição','corpo inteiro','não informado pela fonte'],{itemType:'diretorio_externo'})
];

export function buildExternalExerciseCatalog(rows=[...exerciseLinks,...directories]){
  const items=[],errors=[],seen=new Set();
  for(const row of rows){
    if(!row?.id||!row?.name||!row?.source||!row?.originalUrl){errors.push({id:row?.id||'sem-id',message:'Item sem identificador, nome, fonte ou link original.'});continue;}
    if(seen.has(row.id)){errors.push({id:row.id,message:'Identificador duplicado; item ignorado.'});continue;}
    seen.add(row.id);items.push(Object.freeze({...row}));
  }
  return {items:Object.freeze(items),errors:Object.freeze(errors)};
}

export const {items:externalExerciseCatalog,errors:externalCatalogErrors}=buildExternalExerciseCatalog();
export const externalCatalogStats=Object.freeze({reusable:externalExerciseCatalog.filter(item=>item.reuseStatus==='reutilizacao_confirmada').length,linkOnly:externalExerciseCatalog.filter(item=>item.reuseStatus==='somente_link').length,exerciseLinks:externalExerciseCatalog.filter(item=>item.itemType!=='diretorio_externo').length,directories:externalExerciseCatalog.filter(item=>item.itemType==='diretorio_externo').length});
