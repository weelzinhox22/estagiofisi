import { neuroDiscussionTopics, neuroClinicalPrinciples, neuroResearchMeta } from './neuro-discussions-data.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const list=rows=>`<ul>${rows.map(row=>`<li>${esc(row)}</li>`).join('')}</ul>`;

function references(rows){
  return `<div class="discussion-references">${rows.map(row=>`<a href="${esc(row.url)}" target="_blank" rel="noopener noreferrer"><span>FONTE ORIGINAL ↗</span><strong>${esc(row.label)}</strong><small>${esc(row.citation)}</small><p>${esc(row.note)}</p></a>`).join('')}</div>`;
}

function topicCard(topic){
  return `<a class="discussion-topic-card accent-${topic.accent}" href="#discussoes/${topic.id}"><span class="discussion-topic-number">${topic.number}</span><i aria-hidden="true">${topic.icon}</i><div class="discussion-tags">${topic.tags.map(tag=>`<small>${esc(tag)}</small>`).join('')}</div><strong>${esc(topic.title)}</strong><p>${esc(topic.subtitle)}</p><b>Abrir página clínica →</b></a>`;
}

export function discussionsPage(){
  const sourceCount=neuroDiscussionTopics.reduce((sum,topic)=>sum+topic.references.length,0);
  return `<section class="discussions-hero"><div><span class="eyebrow">BIBLIOTECA ESPECIALIZADA</span><h1>Neurofisioterapia clínica</h1><p>Conteúdo aprofundado para avaliação, intervenção, segurança e acompanhamento funcional de adultos com condições neurológicas.</p><div><span><strong>${neuroDiscussionTopics.length}</strong> páginas clínicas</span><span><strong>${sourceCount}</strong> fontes científicas</span><span><strong>${neuroResearchMeta.reviewedAt}</strong> atualização</span></div></div><aside><b>Em cada tema</b><ul><li>Fundamentos aplicados à fisioterapia</li><li>Avaliação e medidas de desfecho</li><li>Intervenções e limites da evidência</li><li>Segurança e aplicação clínica</li></ul></aside></section>
  <section class="discussion-scope"><strong>Escopo profissional</strong><p>${esc(neuroResearchMeta.scope)} O conteúdo apoia estudo e prática profissional, mas não substitui avaliação individual, protocolo do serviço ou decisão compartilhada com a equipe e a pessoa atendida.</p></section>
  <div class="discussion-catalog-heading"><div><span class="eyebrow">CONDIÇÕES, FUNÇÕES E TECNOLOGIAS</span><h2>Escolha um tema</h2></div><p>As páginas podem ser consultadas em qualquer ordem e mantêm links diretos para as fontes.</p></div>
  <nav class="discussion-topic-grid" aria-label="Páginas de neurofisioterapia">${neuroDiscussionTopics.map(topicCard).join('')}</nav>
  <section class="discussion-review"><span class="eyebrow">BASE DA PRÁTICA</span><h2>Princípios que atravessam todos os temas</h2><div class="discussion-principles">${neuroClinicalPrinciples.map((item,index)=>`<article><b>${String(index+1).padStart(2,'0')}</b><div><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></div></article>`).join('')}</div></section>`;
}

function quickFacts(topic){
  return `<div class="discussion-quick-facts" aria-label="Resumo clínico">${topic.quickFacts.map(([label,value])=>`<div><small>${esc(label)}</small><strong>${esc(value)}</strong></div>`).join('')}</div>`;
}

function measures(rows){
  return `<div class="discussion-measures">${rows.map(row=>`<article><h3>${esc(row.name)}</h3><p>${esc(row.use)}</p><small><b>Ao aplicar:</b> ${esc(row.note)}</small></article>`).join('')}</div>`;
}

function interventions(rows){
  return `<div class="discussion-interventions">${rows.map((row,index)=>`<article><span>${String(index+1).padStart(2,'0')}</span><div><h3>${esc(row.title)}</h3><p>${esc(row.text)}</p><small><b>Limite:</b> ${esc(row.limit)}</small></div></article>`).join('')}</div>`;
}

export function discussionDetailPage(id){
  const topic=neuroDiscussionTopics.find(item=>item.id===id);
  if(!topic)return `<div class="empty"><h3>Tema não encontrado</h3><p>Escolha uma página disponível na biblioteca de neurofisioterapia.</p><a class="button secondary" href="#discussoes">Ver biblioteca</a></div>`;
  const index=neuroDiscussionTopics.indexOf(topic),previous=neuroDiscussionTopics[index-1],next=neuroDiscussionTopics[index+1];
  return `<article class="discussion-detail accent-${topic.accent}">
    <header><a href="#discussoes">← Biblioteca de neurofisioterapia</a><div><span>${topic.number}</span><i aria-hidden="true">${topic.icon}</i></div><small>REFERÊNCIA CLÍNICA</small><h1>${esc(topic.title)}</h1><p>${esc(topic.subtitle)}</p>${quickFacts(topic)}</header>
    <nav class="discussion-on-page" aria-label="Nesta página"><a href="#discussoes/${topic.id}?sec=fundamentos">Fundamentos</a><a href="#discussoes/${topic.id}?sec=avaliacao">Avaliação</a><a href="#discussoes/${topic.id}?sec=medidas">Medidas</a><a href="#discussoes/${topic.id}?sec=intervencoes">Intervenções</a><a href="#discussoes/${topic.id}?sec=seguranca">Segurança</a><a href="#discussoes/${topic.id}?sec=aplicacao">Aplicação</a><a href="#discussoes/${topic.id}?sec=evidencias">Evidências</a></nav>
    <section class="discussion-overview"><strong>Visão clínica</strong><p>${esc(topic.overview)}</p></section>
    <section id="fundamentos"><div class="discussion-section-title"><span>01</span><div><small>FUNDAMENTOS</small><h2>O que sustenta a prática</h2></div></div><div class="discussion-study-grid">${topic.studyPoints.map(point=>`<article><h3>${esc(point.title)}</h3><p>${esc(point.text)}</p></article>`).join('')}</div></section>
    <section id="avaliacao"><div class="discussion-section-title"><span>02</span><div><small>AVALIAÇÃO FISIOTERAPÊUTICA</small><h2>O que observar e registrar</h2></div></div><div class="discussion-checklist">${topic.assessment.map((item,itemIndex)=>`<div><b>${String(itemIndex+1).padStart(2,'0')}</b><span>${esc(item)}</span></div>`).join('')}</div></section>
    <section id="medidas"><div class="discussion-section-title"><span>03</span><div><small>ACOMPANHAMENTO</small><h2>Medidas e instrumentos úteis</h2></div></div><p class="discussion-section-lead">A escolha depende da pergunta clínica, população, fase, treinamento e condições de aplicação. Nenhuma medida isolada resume a pessoa.</p>${measures(topic.outcomes)}</section>
    <section id="intervencoes"><div class="discussion-section-title"><span>04</span><div><small>REABILITAÇÃO</small><h2>Possibilidades fisioterapêuticas</h2></div></div><p class="discussion-section-lead">São caminhos apoiados pelo tema e pelas fontes, não uma prescrição automática. Objetivos, dose e progressão exigem avaliação.</p>${interventions(topic.interventions)}</section>
    <section id="seguranca" class="discussion-safety"><div class="discussion-section-title"><span>05</span><div><small>SEGURANÇA</small><h2>Antes e durante o atendimento</h2></div></div>${list(topic.safety)}<p>Diante de sinal novo, deterioração ou possível urgência, interrompa a atividade e siga o protocolo local.</p></section>
    <section id="aplicacao" class="discussion-case"><div class="discussion-section-title"><span>06</span><div><small>APLICAÇÃO CLÍNICA</small><h2>Exemplo prático</h2></div></div><p class="case-context">${esc(topic.example.context)}</p><div class="discussion-case-columns"><div><h3>Dados disponíveis</h3>${list(topic.example.findings)}</div><div><h3>Leitura fisioterapêutica</h3><p>${esc(topic.application.interpretation)}</p></div></div><div class="discussion-application-plan"><h3>Prioridades de avaliação e cuidado</h3>${list(topic.application.priorities)}</div><div class="discussion-documentation"><strong>Exemplo de registro</strong><p>${esc(topic.application.documentation)}</p><small>Modelo educacional. Ajuste ao que foi realmente observado e às regras do prontuário.</small></div></section>
    <section><div class="discussion-section-title"><span>07</span><div><small>LIMITES E QUALIDADE</small><h2>Erros frequentes a evitar</h2></div></div><div class="discussion-pitfalls">${topic.pitfalls.map(item=>`<p><span aria-hidden="true">!</span>${esc(item)}</p>`).join('')}</div></section>
    <section id="evidencias"><div class="discussion-section-title"><span>08</span><div><small>EVIDÊNCIA CIENTÍFICA</small><h2>Fontes para aprofundamento</h2></div></div>${references(topic.references)}<p class="discussion-evidence-note">A síntese desta página é educacional. Antes de aplicar uma recomendação, confira no texto original a população, fase clínica, intervenção, comparador, desfechos, certeza e limitações.</p></section>
    <nav class="discussion-pagination" aria-label="Navegação entre páginas">${previous?`<a href="#discussoes/${previous.id}"><small>← ANTERIOR</small><strong>${esc(previous.title)}</strong></a>`:'<span></span>'}${next?`<a href="#discussoes/${next.id}"><small>PRÓXIMO →</small><strong>${esc(next.title)}</strong></a>`:`<a href="#discussoes"><small>CONCLUIR</small><strong>Voltar à biblioteca</strong></a>`}</nav>
  </article>`;
}
