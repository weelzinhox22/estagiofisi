const GAME_ROOT='/public/neurogames';
const GAME_URL=`${GAME_ROOT}/neuroquest_2_mapa_cartas_biblioteca.html`;

export function neuroGamesPage(){
  return `<div class="neuro-games-page">
    <section class="neuro-games-hero" aria-labelledby="neuro-games-title">
      <div class="neuro-games-hero-copy">
        <span class="neuro-games-eyebrow"><i></i> LABORATÓRIO DE APRENDIZAGEM</span>
        <h1 id="neuro-games-title">Conhecimento em movimento.</h1>
        <p>Explore territórios vasculares, descubra pistas e conecte neuroanatomia a função em uma aventura interativa.</p>
        <div class="neuro-games-meta"><span>6 CAPÍTULOS</span><span>AVENTURA 2D</span><span>PROGRESSO NO PRÓPRIO JOGO</span></div>
      </div>
      <div class="neuro-games-hero-art" aria-hidden="true"><span>NEUROQUEST</span><b>07</b><i></i></div>
    </section>
    <section class="neuro-games-entry" aria-label="Jogo disponível">
      <div class="neuro-games-entry-head"><div><span class="neuro-games-section-tag">SALA DE JOGOS</span><h2>Expedição NeuroQuest</h2><p>Uma sala de descobertas para estudar neurologia no seu ritmo.</p></div><a class="neuro-games-open" href="${GAME_URL}" target="_blank" rel="noopener noreferrer">Abrir em nova aba <span aria-hidden="true">↗</span></a></div>
      <div class="neuro-games-frame-wrap"><div class="neuro-games-frame-top"><span><i></i> JOGO INTERATIVO</span><span>TOQUE NOS PONTOS PARA EXPLORAR</span></div><iframe class="neuro-games-frame" src="${GAME_URL}" title="Expedição NeuroQuest: jogo educacional de neurofisioterapia" sandbox="allow-scripts allow-modals" allow="fullscreen" allowfullscreen loading="eager" referrerpolicy="no-referrer"></iframe></div>
    </section>
    <aside class="neuro-games-notice"><span class="neuro-games-notice-mark" aria-hidden="true">i</span><p><strong>Área educacional.</strong> O jogo usa cenários fictícios, não acessa prontuários nem importa dados de pacientes. As situações clínicas são pistas de estudo, não diagnósticos ou recomendações terapêuticas.</p></aside>
  </div>`;
}
