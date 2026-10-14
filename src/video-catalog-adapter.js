const PACKAGES=[
  {id:'fisio-organizado',label:'Exercícios de Fisioterapia Organizados',base:'/videos/Exercicios_Fisioterapia_Organizados',catalog:'/videos/Exercicios_Fisioterapia_Organizados/exercicios.json',expected:25},
  {id:'neuro-lote-2',label:'Fisioterapia Neurológica — Lote 2',base:'/videos/Fisioterapia_Neurologica_Lote_2',catalog:'/videos/Fisioterapia_Neurologica_Lote_2/exercicios.json',expected:18}
];

const list=value=>Array.isArray(value)?value.filter(Boolean):value?[String(value)]:[];
const text=value=>list(value).join(' ');
const publicPath=(base,value)=>`${base}/${String(value||'').replace(/^\.?\//,'')}`.replace(/\\/g,'/');
const plain=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

function canonicalCategory(value=''){
  const key=plain(value);
  if(key.includes('manuseio'))return 'Manuseio e mobilização neurológica';
  if(key.includes('mao')||key.includes('maos')||key.includes('destreza')||key.includes('motricidade fina'))return 'Motricidade fina e destreza manual';
  if(key.includes('tornozelo')||key.includes('pes'))return 'Mobilidade de tornozelo e pés';
  if(key.includes('transfer')||key.includes('funcionalidade'))return 'Transferências e atividades funcionais';
  if(key.includes('tronco'))return 'Controle motor e mobilidade de tronco';
  if(key.includes('marcha')||key.includes('equilibrio')||key.includes('obstaculo'))return 'Marcha e equilíbrio';
  if(key.includes('coordenacao')||key.includes('dupla tarefa'))return 'Coordenação motora e dupla tarefa';
  if(key.includes('membros inferiores')||key.includes('mmii'))return 'Fortalecimento de membros inferiores';
  if(key.includes('membros superiores')||key.includes('mmss')||key.includes('ombro'))return 'Mobilidade e fortalecimento de membros superiores';
  return String(value||'Outras atividades');
}

function normalizeFirst(row,pkg){
  return {id:`${pkg.id}:${row.id}`,originalId:row.id,packageId:pkg.id,packageLabel:pkg.label,nome:row.nome,regiao_ou_categoria:canonicalCategory(`${row.funcionalidade||''} ${row.categoria||''}`),categoria_original:row.funcionalidade||row.categoria||'',regiao_corporal:row.regiao_corporal||'',descricao:row.para_que_serve||'',objetivos:row.para_que_serve||'',objetivos_lista:list(row.para_que_serve),orientacoes:row.orientacao_fisioterapeuta||'',como_fazer:list(row.como_fazer),posicionamento_paciente:row.posicionamento_paciente||'',posicionamento_fisioterapeuta:row.orientacao_fisioterapeuta||'',dicas_fisioterapeuta:[],adaptacoes_progressao:row.cuidados_e_adaptacoes||'',cuidados:row.cuidados_e_adaptacoes||'',materiais:[],dosagem_mencionada_no_video:null,arquivo:publicPath(pkg.base,row.arquivo_video),poster:publicPath(pkg.base,row.miniatura),fonte:row.origem?.arquivo||'Fonte original não informada',trecho_inicio:row.origem?.inicio_seg,trecho_fim:row.origem?.fim_seg,observacao_video:row.observacao_visual||'',tipo_conteudo:'exercicio_catalogado_local',rightsStatus:'confirmado_pelo_responsavel',rightsNotice:'Direitos de publicação e redistribuição declarados pelo responsável pelo projeto em 14/10/2026.',sourceCatalog:pkg.catalog};
}

function normalizeSecond(row,pkg){
  return {id:`${pkg.id}:${row.id}`,originalId:row.id,packageId:pkg.id,packageLabel:pkg.label,nome:row.nome,regiao_ou_categoria:canonicalCategory(row.categoria),categoria_original:row.categoria||'',regiao_corporal:row.categoria||'',descricao:row.para_que_serve||'',objetivos:text(row.objetivos),objetivos_lista:list(row.objetivos),orientacoes:text(row.dicas_fisioterapeuta),como_fazer:list(row.como_fazer),posicionamento_paciente:row.posicionamento_paciente||'',posicionamento_fisioterapeuta:row.posicionamento_fisioterapeuta||'',dicas_fisioterapeuta:list(row.dicas_fisioterapeuta),adaptacoes_progressao:row.adaptacoes_progressao||'',cuidados:row.cuidados||'',materiais:list(row.materiais),dosagem_mencionada_no_video:row.dosagem||null,arquivo:publicPath(pkg.base,row.arquivo_video),poster:publicPath(pkg.base,row.miniatura),fonte:row.fonte||'Fonte original não informada',trecho_inicio:row.inicio_s,trecho_fim:row.fim_s,observacao_video:row.observacao_video||'',tipo_conteudo:'exercicio_catalogado_local',rightsStatus:'confirmado_pelo_responsavel',rightsNotice:'Direitos de publicação e redistribuição declarados pelo responsável pelo projeto em 14/10/2026.',sourceCatalog:pkg.catalog};
}

async function loadPackage(pkg){
  const response=await fetch(pkg.catalog);
  if(!response.ok)throw new Error(`${pkg.label}: catálogo indisponível (${response.status}).`);
  const payload=await response.json();
  const rows=Array.isArray(payload)?payload:payload.exercicios;
  if(!Array.isArray(rows))throw new Error(`${pkg.label}: formato de catálogo inválido.`);
  if(rows.length!==pkg.expected)throw new Error(`${pkg.label}: esperados ${pkg.expected} registros, encontrados ${rows.length}.`);
  const normalize=pkg.id==='fisio-organizado'?normalizeFirst:normalizeSecond;
  return rows.map(row=>normalize(row,pkg));
}

export async function loadPackagedVideoCatalog(){
  const results=await Promise.allSettled(PACKAGES.map(loadPackage));
  const items=results.flatMap(result=>result.status==='fulfilled'?result.value:[]);
  const errors=results.flatMap((result,index)=>result.status==='rejected'?[`${PACKAGES[index].label}: ${result.reason?.message||'erro desconhecido'}`]:[]);
  return {items,errors};
}

export const packagedVideoSources=PACKAGES.map(({id,label,catalog,expected})=>({id,label,catalog,expected}));
