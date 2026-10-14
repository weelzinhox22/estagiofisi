const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const normalized=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const videoUrl=item=>/^https?:\/\//i.test(item.arquivo||'')?item.arquivo:`/${String(item.arquivo||'').replace(/^\/+/, '')}`;
const valueList=value=>Array.isArray(value)?value.filter(Boolean):value?[value]:[];
const section=(title,content,kind='')=>content?`<section class="video-detail-section ${kind}"><h4>${esc(title)}</h4>${content}</section>`:'';
const paragraphs=value=>value?`<p>${esc(value)}</p>`:'';
const bullets=value=>{const rows=valueList(value);return rows.length?`<ul>${rows.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`:'';};
const itemText=item=>normalized([item.nome,item.regiao_ou_categoria,item.categoria_original,item.regiao_corporal,item.descricao,item.objetivos,item.orientacoes,item.como_fazer,item.materiais,item.cuidados,item.adaptacoes_progressao,item.observacao_video,item.packageLabel].flat().join(' '));

const FUNCTION_META={
  'Marcha':['⌁','blue'],'Equilíbrio':['⚖','teal'],'Coordenação':['✣','violet'],'Transferências':['↕','amber'],
  'Controle motor':['◎','green'],'Fortalecimento':['◇','red'],'Mobilidade':['↔','sky'],'Membros superiores':['✋','rose'],
  'Membros inferiores':['⌄','indigo'],'Motricidade fina':['✦','purple'],'Terapia manual':['◌','slate'],'Educação em saúde':['ⓘ','mint'],'Outros':['＋','gray']
};
const CONTEXT_META={'Neurofuncional geral':['✦','teal'],'Parkinson / freezing':['⌁','green'],'AVE / AVC':['◐','red'],'TCE':['◎','amber']};

function functionalTags(item){
  const text=itemText(item),tags=[];
  if(/marcha|passo|caminh|deambul/.test(text))tags.push('Marcha');
  if(/equilibr|apoio|ortostat|obstaculo/.test(text))tags.push('Equilíbrio');
  if(/coorden|dupla tarefa|ritmo/.test(text))tags.push('Coordenação');
  if(/transfer|sentar|levantar|funcionalidade/.test(text))tags.push('Transferências');
  if(/controle motor|tronco|seletiv/.test(text))tags.push('Controle motor');
  if(/fortalec|resistencia|forca/.test(text))tags.push('Fortalecimento');
  if(/mobilidade|amplitude|along|flexo|extensao/.test(text))tags.push('Mobilidade');
  if(/membro superior|mmss|ombro|cotovelo|punho|braco/.test(text))tags.push('Membros superiores');
  if(/membro inferior|mmii|quadril|joelho|tornozelo|pe\b|perna/.test(text))tags.push('Membros inferiores');
  if(/mao|dedo|destreza|motricidade fina|manipul/.test(text))tags.push('Motricidade fina');
  if(/terapia manual|manuseio|mobilizacao/.test(text))tags.push('Terapia manual');
  if(/educacao em saude/.test(text))tags.push('Educação em saúde');
  return [...new Set(tags.length?tags:['Outros'])];
}

function clinicalContexts(item){
  const text=itemText(item),contexts=[];
  if(item.packageId==='neuro-lote-2'||/neurolog|neurofuncional|manuseio/.test(text))contexts.push('Neurofuncional geral');
  if(/parkinson|freezing/.test(text))contexts.push('Parkinson / freezing');
  if(/\bavc\b|\bave\b|pos.?avc|p[oó]s.?avc/.test(text))contexts.push('AVE / AVC');
  if(/\btce\b|traumatismo cranio|lesao cerebral traumatica/.test(text))contexts.push('TCE');
  return [...new Set(contexts)];
}

function filterButton(value,selected,kind,meta){
  const [icon,tone]=meta[value]||['＋','gray'];
  return `<button type="button" class="video-filter-chip tone-${tone} ${value===selected?'active':''}" data-action="video-${kind}-filter" data-value="${esc(value)}" aria-pressed="${value===selected}"><i aria-hidden="true">${icon}</i><span>${esc(value)}</span></button>`;
}

function legacyDetails(item){
  return `${section('Objetivos terapêuticos',paragraphs(item.objetivos))}${section('Orientações',paragraphs(item.orientacoes))}${item.dosagem_mencionada_no_video?section('Dosagem informada',paragraphs(item.dosagem_mencionada_no_video),'dose'):''}`;
}

function extendedDetails(item){
  return `${section('Identificação',`<dl><div><dt>Categoria</dt><dd>${esc(item.regiao_ou_categoria)}</dd></div>${item.regiao_corporal?`<div><dt>Região corporal</dt><dd>${esc(item.regiao_corporal)}</dd></div>`:''}<div><dt>Pacote</dt><dd>${esc(item.packageLabel)}</dd></div></dl>`)}${section('Objetivos terapêuticos',bullets(item.objetivos_lista||item.objetivos))}${section('Como realizar',`<ol>${valueList(item.como_fazer).map(step=>`<li>${esc(step)}</li>`).join('')}</ol>`)}${section('Posicionamento do paciente',paragraphs(item.posicionamento_paciente))}${section('Posicionamento do fisioterapeuta',paragraphs(item.posicionamento_fisioterapeuta))}${section('Dicas clínicas',bullets(item.dicas_fisioterapeuta))}${section('Adaptações e progressão',paragraphs(item.adaptacoes_progressao))}${section('Materiais',bullets(item.materiais))}${item.dosagem_mencionada_no_video?section('Dosagem informada pela fonte',paragraphs(item.dosagem_mencionada_no_video),'dose'):''}${section('Cuidados e precauções',paragraphs(item.cuidados),'care')}${item.observacao_video?section('Observação do vídeo',paragraphs(item.observacao_video)):''}`;
}

function videoCard(item){
  const extended=item.tipo_conteudo==='exercicio_catalogado_local',poster=item.poster||'',contexts=clinicalContexts(item);
  return `<details class="video-library-card ${extended?'extended':''}" data-video-card><summary><figure>${poster?`<img src="${esc(poster)}" alt="Miniatura do exercício ${esc(item.nome)}" loading="lazy">`:'<span class="video-poster-fallback" aria-hidden="true">▶</span>'}<span class="video-play-badge" aria-hidden="true">▶</span></figure><div class="video-library-copy"><span>${esc(item.regiao_ou_categoria)}</span><h3>${esc(item.nome)}</h3><p>${esc(item.descricao)}</p>${contexts.length?`<div class="video-context-tags">${contexts.map(value=>`<small>${esc(value)}</small>`).join('')}</div>`:item.regiao_corporal?`<small>${esc(item.regiao_corporal)}</small>`:''}<b class="video-open-label">Assistir e ver ficha <i aria-hidden="true">＋</i></b></div></summary><div class="video-card-expanded" data-video-expanded><video controls playsinline preload="none" src="${esc(videoUrl(item))}" ${poster?`poster="${esc(poster)}"`:''} aria-label="Demonstração em vídeo: ${esc(item.nome)}">Seu navegador não oferece suporte à reprodução deste vídeo.</video><div class="video-detail-grid">${extended?extendedDetails(item):legacyDetails(item)}</div>${item.rightsStatus==='pendente'?`<div class="video-rights-warning"><strong>Direitos de uso pendentes</strong><p>${esc(item.rightsNotice)}</p></div>`:''}<footer class="video-provenance"><span><strong>Fonte</strong>${esc(item.fonte||item.video_de_origem||item.packageLabel||'Catálogo do projeto')}</span>${item.originalId?`<span><strong>ID original</strong>${esc(item.originalId)}</span>`:''}</footer><button class="video-chat-action" type="button" data-action="video-to-chat" data-name="${esc(item.nome)}" data-objective="${esc(item.objetivos)}" data-guidance="${esc(item.orientacoes)}">Conversar sobre este exercício →</button>${item.tipo_conteudo==='exercicio_usuario'?`<button class="video-delete-action" type="button" data-action="delete-uploaded-video" data-id="${esc(item.id)}">Excluir meu vídeo</button>`:''}</div></details>`;
}

export function videoLibraryPage(items=[],query='',category='Todas',context='Todos',status={}){
  if(status.loading)return `<section class="video-library-hero"><span aria-hidden="true">▶</span><div><small>BIBLIOTECA VISUAL</small><h2>Vídeos de exercícios</h2><p>Carregando catálogo de demonstrações…</p></div></section><div class="video-loading" role="status">Preparando os vídeos e as categorias.</div>`;
  if(status.error&&!items.length)return `<section class="video-library-hero"><span aria-hidden="true">!</span><div><small>BIBLIOTECA VISUAL</small><h2>Vídeos indisponíveis</h2><p>${esc(status.error)}</p></div></section><div class="empty"><h3>Não foi possível abrir o catálogo</h3><p>Verifique os arquivos locais e recarregue a página.</p></div>`;
  const available=items.filter(item=>item.tipo_conteudo!=='material_complementar_educativo');
  const functions=[...new Set(available.flatMap(functionalTags))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  const contexts=[...new Set(available.flatMap(clinicalContexts))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  const needle=normalized(query);
  const rows=available.filter(item=>(category==='Todas'||functionalTags(item).includes(category))&&(context==='Todos'||clinicalContexts(item).includes(context))&&itemText(item).includes(needle));
  const groups=[...new Set(rows.map(item=>item.regiao_ou_categoria))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  const packaged=available.filter(item=>item.tipo_conteudo==='exercicio_catalogado_local').length;
  return `<section class="video-library-hero"><span aria-hidden="true">▶</span><div><small>BIBLIOTECA VISUAL</small><h2>Vídeos de exercícios</h2><p>Toque na miniatura: o player será aberto e trazido para a tela automaticamente.</p></div><strong><b>${available.length}</b> vídeos<small>${packaged} novos</small></strong></section>${status.error?`<div class="video-catalog-warning" role="alert"><strong>Uma fonte não pôde ser carregada</strong><p>${esc(status.error)}</p></div>`:''}<div class="video-library-toolbar"><label class="search"><span>⌕</span><input id="video-search" type="search" value="${esc(query)}" placeholder="Buscar equilíbrio, marcha, ombro…" aria-label="Buscar vídeos"></label></div><section class="video-flat-filters" aria-label="Filtros da biblioteca"><div><header><span>01</span><div><strong>Objetivo funcional</strong><small>Escolha uma opção ou pesquise acima</small></div></header><div class="video-filter-row">${filterButton('Todas',category,'functional',{'Todas':['✦','dark']})}${functions.map(value=>filterButton(value,category,'functional',FUNCTION_META)).join('')}</div></div>${contexts.length?`<div><header><span>02</span><div><strong>Contexto clínico documentado</strong><small>Associação descrita na fonte, não indicação automática</small></div></header><div class="video-filter-row">${filterButton('Todos',context,'context',{'Todos':['◎','dark']})}${contexts.map(value=>filterButton(value,context,'context',CONTEXT_META)).join('')}</div></div>`:''}</section><p class="video-result-count"><strong>${rows.length}</strong> ${rows.length===1?'resultado':'resultados'}${category!=='Todas'||context!=='Todos'?` <span>· ${esc(category)}${context!=='Todos'?` · ${esc(context)}`:''}</span>`:''}</p>${groups.map(group=>{const groupItems=rows.filter(item=>item.regiao_ou_categoria===group);return `<section class="video-category-section"><div class="section-title"><h2>${esc(group)}</h2><span class="group-count">${groupItems.length}</span></div><div class="video-library-grid">${groupItems.map(videoCard).join('')}</div></section>`;}).join('')}${!rows.length?'<div class="empty"><div class="empty-icon">⌕</div><h3>Nenhum vídeo encontrado</h3><p>Tente outro termo ou escolha “Todas” e “Todos”.</p><div class="empty-filter-actions"><button type="button" data-action="video-functional-filter" data-value="Todas">Todas as funções</button><button type="button" data-action="video-context-filter" data-value="Todos">Todos os contextos</button></div></div>':''}<div class="video-library-note"><strong>Uso educacional e supervisionado</strong><p>Filtros clínicos refletem somente menções nos metadados. A escolha do exercício, amplitude, resistência, assistência e dosagem depende da avaliação e da decisão do fisioterapeuta.</p></div>`;
}
