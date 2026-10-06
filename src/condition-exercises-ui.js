import { conditionPrograms, exercisesForCondition } from './condition-exercises-data.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const normalized = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function conditionLibraryPage(exercises, query = '', active = 'todas') {
  const needle = normalized(query);
  const selectedProgram = active !== 'todas' ? conditionPrograms.find(p => p.id === active) : null;

  // Se o usuário selecionou uma patologia específica (ex: #biblioteca/condicoes?c=manguito-rotador)
  if (selectedProgram) {
    const programExercises = exercises.filter(e => e.conditions?.includes(selectedProgram.id) && (!needle || normalized(`${e.name} ${e.objective} ${e.startPosition} ${e.therapistCue || ''} ${e.goals?.join(' ') || ''}`).includes(needle)));

    return `
      <div class="condition-detail-view">
        <div class="condition-detail-nav">
          <button type="button" class="button ghost small" data-action="condition-back">← Voltar para todas as patologias</button>
        </div>

        <section class="condition-detail-hero">
          <span class="pathology-badge">${esc(selectedProgram.region)}</span>
          <h1>${esc(selectedProgram.name)}</h1>
          <p class="condition-focus">${esc(selectedProgram.focus)}</p>

          <div class="condition-quick-stats">
            <span><strong>${programExercises.length}</strong> exercícios estruturados</span>
            <button type="button" class="button primary small" data-action="condition-start" data-condition="${selectedProgram.id}">
              ＋ Montar sessão com esta patologia
            </button>
          </div>
        </section>

        <section class="condition-safety-box">
          <div class="safety-icon">⚠️</div>
          <div>
            <strong>Critérios de Segurança e Cuidados Clínicos</strong>
            <p>${esc(selectedProgram.caution)}</p>
            <small><b>Atenção:</b> Esta ferramenta apoia a consulta e o raciocínio clínico supervisionado. Não substitui avaliação individualizada.</small>
          </div>
        </section>

        <div class="condition-search-sub">
          <label class="search">
            <span>⌕</span>
            <input id="condition-search" type="search" value="${esc(query)}" placeholder="Filtrar exercícios desta patologia (ex.: isometria, cadeira, toalha)...">
          </label>
        </div>

        <div class="condition-exercises-expanded">
          <div class="section-title">
            <h2>Acervo de Exercícios Passo a Passo</h2>
            <span class="group-count">${programExercises.length} disponíveis</span>
          </div>

          ${programExercises.length ? programExercises.map((e, index) => `
            <article class="clinical-exercise-card" id="card-${esc(e.id)}">
              <header class="clinical-card-head">
                <div>
                  <span class="exercise-num">${String(index + 1).padStart(2, '0')}</span>
                  <div class="exercise-title-group">
                    <h3>${esc(e.name)}</h3>
                    <div class="exercise-meta-pills">
                      <span class="meta-pill category">${esc(e.category || e.region)}</span>
                      <span class="meta-pill difficulty">${esc(e.difficulty || 'Básica')}</span>
                      ${e.phase ? `<span class="meta-pill phase">${esc(e.phase)}</span>` : ''}
                    </div>
                  </div>
                </div>
                <div class="clinical-card-actions">
                  <button type="button" class="button secondary small" data-action="add-session" data-id="${esc(e.id)}">
                    ＋ Adicionar à sessão
                  </button>
                  <a href="#exercicio/${encodeURIComponent(e.id)}" class="button ghost small" title="Ver ficha completa">
                    Ver ficha <i>→</i>
                  </a>
                </div>
              </header>

              <div class="clinical-card-objective">
                <strong>🎯 Objetivo Clínico:</strong>
                <span>${esc(e.objective)}</span>
              </div>

              <div class="clinical-grid-blocks">
                <!-- 1. Posicionamento do Paciente -->
                <div class="clinical-block patient-pos">
                  <div class="block-title">
                    <span class="block-icon">👤</span>
                    <h4>Como posicionar o paciente</h4>
                  </div>
                  <p>${esc(e.startPosition || 'Posição confortável e estável conforme avaliação.')}</p>
                </div>

                <!-- 2. Posicionamento do Terapeuta & Comandos -->
                <div class="clinical-block therapist-cue">
                  <div class="block-title">
                    <span class="block-icon">👨‍⚕️</span>
                    <h4>Terapeuta & Comandos Verbais</h4>
                  </div>
                  <p>${esc(e.therapistCue || 'Posicionar-se garantindo alinhamento postural, estabilização proximal e controle respiratório.')}</p>
                </div>

                <!-- 3. Passo a Passo Minucioso -->
                <div class="clinical-block steps-flow">
                  <div class="block-title">
                    <span class="block-icon">📋</span>
                    <h4>Passo a passo de execução</h4>
                  </div>
                  <ol>
                    ${(e.steps || []).map(step => `<li>${esc(step)}</li>`).join('')}
                  </ol>
                </div>

                <!-- 4. O que usar para adaptar -->
                <div class="clinical-block adaptations">
                  <div class="block-title">
                    <span class="block-icon">🛠️</span>
                    <h4>O que usar para adaptar</h4>
                  </div>
                  <div class="adapt-sub">
                    <div>
                      <strong>🏠 Em casa / Improvisado:</strong>
                      <span>${esc(e.homeAdaptations || 'Cadeira firme, toalha de banho ou garrafa d’água.')}</span>
                    </div>
                    <div>
                      <strong>🏥 Na clínica:</strong>
                      <span>${esc(e.clinicAdaptations || (e.equipment?.length ? e.equipment.join(', ') : 'Faixa elástica, colchonete ou degrau.'))}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Regressão, Progressão e Compensações -->
              <div class="clinical-card-footer">
                <div class="reg-prog-box">
                  <div class="reg-box">
                    <strong>⬇️ Se o paciente tiver dor (Regressão):</strong>
                    <p>${esc(e.regressions?.[0] || 'Reduzir amplitude ou retirar resistência externa.')}</p>
                  </div>
                  <div class="prog-box">
                    <strong>⬆️ Quando estiver fácil (Progressão):</strong>
                    <p>${esc(e.progressions?.[0] || 'Aumentar carga, repetições ou velocidade controlada.')}</p>
                  </div>
                </div>
                ${e.commonCompensations?.length ? `
                  <div class="compensation-box">
                    <strong>⚠️ Compensações a evitar:</strong>
                    <span>${esc(e.commonCompensations.join(' '))}</span>
                  </div>
                ` : ''}
              </div>
            </article>
          `).join('') : `
            <div class="empty">
              <h3>Nenhum exercício encontrado para esta busca</h3>
              <p>Tente buscar por termos mais genéricos como "força", "isometria" ou limpe a busca.</p>
            </div>
          `}
        </div>

        <div class="condition-bottom-action">
          <button type="button" class="button primary large" data-action="condition-start" data-condition="${selectedProgram.id}">
            ＋ Montar checklist de sessão com ${esc(selectedProgram.name)}
          </button>
        </div>
      </div>
    `;
  }

  // Visualização Geral: Catálogo de todas as patologias
  const programs = conditionPrograms.filter(program => {
    if (!needle) return true;
    const matchesName = normalized(`${program.name} ${program.region} ${program.focus}`).includes(needle);
    const matchesExercises = exercisesForCondition(program.id).some(e => normalized(`${e.name} ${e.objective} ${e.goals?.join(' ') || ''}`).includes(needle));
    return matchesName || matchesExercises;
  });

  return `
    <section class="condition-hero">
      <div>
        <span class="eyebrow">ACERVO CLÍNICO DE EXERCÍCIOS</span>
        <h2>Guia de Exercícios por Patologia</h2>
        <p>Pesquise a patologia ou queixa do paciente para consultar o arsenal completo: passo a passo, posicionamento exato, comandos do fisioterapeuta e materiais para adaptar na clínica ou em casa.</p>
      </div>
      <strong>
        <b>${conditionPrograms.length}</b> patologias
        <small>${exercises.filter(item => item.conditionLibrary).length} exercícios</small>
      </strong>
    </section>

    <div class="condition-safety">
      <b>Consulta e Raciocínio Clínico:</b>
      <span>Confirme o diagnóstico fisioterapêutico, fase tecidual, tolerância à dor e objetivos da pessoa. Em pós-operatórios e fraturas, respeite as restrições da equipe responsável.</span>
    </div>

    <div class="condition-toolbar">
      <label class="search">
        <span>⌕</span>
        <input id="condition-search" type="search" value="${esc(query)}" placeholder="Buscar patologia (ex.: manguito, hérnia, joelho, AVC, fascite, tornozelo)...">
      </label>
      <select id="condition-filter" aria-label="Filtrar patologia">
        <option value="todas">Todas as patologias (${conditionPrograms.length})</option>
        ${conditionPrograms.map(program => `<option value="${program.id}" ${program.id === active ? 'selected' : ''}>${esc(program.name)}</option>`).join('')}
      </select>
    </div>

    <div class="condition-grid">
      ${programs.map(program => {
        const rows = exercises.filter(exercise => exercise.conditions?.includes(program.id) && (!needle || normalized(`${exercise.name} ${exercise.objective} ${exercise.goals?.join(' ') || ''}`).includes(needle)));
        return `
          <article class="condition-card">
            <header>
              <span>${esc(program.region)}</span>
              <h3>${esc(program.name)}</h3>
              <p>${esc(program.focus)}</p>
            </header>
            <div class="condition-exercise-list">
              ${rows.slice(0, 5).map(exercise => `
                <a href="#exercicio/${encodeURIComponent(exercise.id)}">
                  <span>
                    <b>${esc(exercise.name)}</b>
                    <small>${esc(exercise.objective)}</small>
                  </span>
                  <i>→</i>
                </a>
              `).join('')}
              ${rows.length > 5 ? `<div class="more-exercises-hint">＋ Mais ${rows.length - 5} exercícios neste protocolo</div>` : ''}
            </div>
            <footer>
              <small>${rows.length} possibilidades</small>
              <div class="card-btn-group">
                <button type="button" class="button secondary small" data-action="condition-open" data-condition="${program.id}">
                  Ver protocolo
                </button>
                <button type="button" class="button primary small" data-action="condition-start" data-condition="${program.id}">
                  Montar checklist
                </button>
              </div>
            </footer>
            <details>
              <summary>Critérios de segurança</summary>
              <p>${esc(program.caution)}</p>
            </details>
          </article>
        `;
      }).join('')}
    </div>
    ${programs.length ? '' : '<div class="empty"><h3>Nenhuma patologia encontrada</h3><p>Tente buscar por outro termo ou remova os filtros.</p></div>'}
  `;
}

export function conditionPicker(active = '') {
  return `
    <section class="session-condition-picker">
      <div>
        <span class="eyebrow">ATALHO POR PATOLOGIA</span>
        <h2>Escolha a patologia do paciente</h2>
        <p>Carrega todos os exercícios recomendados no checklist da sessão. Remova o que não for pertinente.</p>
      </div>
      <div class="condition-chips">
        <button type="button" data-action="session-condition" data-condition="" class="${active ? '' : 'active'}">Todos</button>
        ${conditionPrograms.map(program => `
          <button type="button" data-action="session-condition" data-condition="${program.id}" class="${active === program.id ? 'active' : ''}">${esc(program.name)}</button>
        `).join('')}
      </div>
      ${active ? `<button type="button" class="button secondary" data-action="session-add-condition" data-condition="${active}">＋ Adicionar todos os exercícios ao checklist</button>` : ''}
    </section>
  `;
}
