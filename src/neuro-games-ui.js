import { neuroGameChapters } from './neuro-games-data.js';

const artRoot='/public/neurogames';
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
let activeCleanup=null;

export function cleanupNeuroGames(){activeCleanup?.();activeCleanup=null;}

export function neuroGamesPage(){
  return `<div class="neuro-games-page">
    <section class="neuro-games-hero" aria-labelledby="neuro-games-title">
      <div class="neuro-games-hero-copy">
        <span class="neuro-games-eyebrow"><i></i> LABORATÓRIO DE APRENDIZAGEM</span>
        <h1 id="neuro-games-title">Conhecimento em movimento.</h1>
        <p>Investigue pistas, reconheça territórios e conecte neurologia à função em uma expedição criada para aprender jogando.</p>
        <div class="neuro-games-meta"><span>06 CAPÍTULOS</span><span>AVENTURA 2D</span><span>JOGO DENTRO DO FISIO CLÍNICO</span></div>
        <button class="neuro-games-cta" type="button" data-ng-action="scroll">ENTRAR NA EXPEDIÇÃO <span aria-hidden="true">↓</span></button>
      </div>
      <div class="neuro-games-hero-mark" aria-hidden="true"><span>NQ</span><b>07</b><i></i></div>
    </section>
    <section class="neuro-native-game" id="neuro-native-game" aria-label="Expedição NeuroQuest">
      <header class="ng-topbar">
        <a class="ng-back" href="#mais"><span aria-hidden="true">←</span> MAIS RECURSOS</a>
        <span class="ng-wordmark"><i></i> NEUROQUEST <small>EXPEDIÇÃO CLÍNICA</small></span>
        <div class="ng-actions">
          <button type="button" class="ng-icon-button" data-ng-action="sound" aria-label="Ativar efeitos sonoros" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4h4l5 4V6l-5 4H4Z"/><path d="M17 9a5 5 0 0 1 0 6M19 6a9 9 0 0 1 0 12"/></svg></button>
          <button type="button" class="ng-fullscreen" data-ng-action="fullscreen" aria-label="Abrir jogo em tela cheia" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M8 3H4a1 1 0 0 0-1 1v4m13-5h4a1 1 0 0 1 1 1v4M3 16v4a1 1 0 0 0 1 1h4m13-5v4a1 1 0 0 1-1 1h-4"/></svg><span>TELA CHEIA</span></button>
          <button type="button" class="ng-reset" data-ng-action="reset">REINICIAR</button>
        </div>
      </header>
      <div class="ng-hud">
        <div class="ng-chapter-title"><small id="ng-region"></small><h2 id="ng-title"></h2></div>
        <div class="ng-score"><span>PONTOS DE DESCOBERTA</span><b id="ng-score">000</b></div>
      </div>
      <div class="ng-progress" role="progressbar" aria-label="Progresso da expedição" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i id="ng-progress-fill"></i></div>
      <div class="ng-game-hint" id="ng-hint" aria-live="polite">Inicie a expedição e procure os três sinais na cena.</div>
      <section class="ng-scene" id="ng-scene" data-area="arteries" aria-label="Cena interativa">
        <div class="ng-scene-atmosphere"></div>
        <div class="ng-scene-caption"><small id="ng-scene-region"></small><b id="ng-scene-title"></b></div>
        <button type="button" class="ng-clue ng-clue-a" data-ng-action="clue" data-index="0" aria-label="Examinar primeiro ponto" disabled><span>01</span><i></i><small>EXAMINAR</small></button>
        <button type="button" class="ng-clue ng-clue-b" data-ng-action="clue" data-index="1" aria-label="Examinar segundo ponto" disabled><span>02</span><i></i><small>EXAMINAR</small></button>
        <button type="button" class="ng-clue ng-clue-c" data-ng-action="clue" data-index="2" aria-label="Examinar terceiro ponto" disabled><span>03</span><i></i><small>EXAMINAR</small></button>
        <button class="ng-gate" type="button" data-ng-action="quiz" disabled><i></i><span>PORTAL</span><small>3 PISTAS</small></button>
        <div class="ng-intro" id="ng-intro"><div class="ng-intro-copy"><span class="ng-overline">SEIS TERRITÓRIOS · UMA EXPEDIÇÃO</span><h3>Leia as pistas.<br>Reconstrua a função.</h3><p>Cada cena guarda três observações. Encontre-as, abra o portal e conecte estrutura, sinal e movimento.</p><button type="button" data-ng-action="start">COMEÇAR A JORNADA <span aria-hidden="true">→</span></button></div><span class="ng-intro-stamp">NEURO<br>QUEST <b>07</b></span></div>
      </section>
      <section class="ng-journal" aria-labelledby="ng-journal-title">
        <div class="ng-journal-header"><div><small>CADERNO DE CAMPO</small><h3 id="ng-journal-title">Pistas desta área</h3></div><span class="ng-clue-count"><b id="ng-found">0</b><i>/ 3</i></span></div>
        <div class="ng-notes" id="ng-notes"></div>
        <div class="ng-detail" id="ng-detail" aria-live="polite"><span class="ng-detail-sigil">NQ</span><p>Toque em um sinal da cena para registrar sua primeira pista.</p></div>
      </section>
      <footer class="ng-footer"><span>NEUROANATOMIA · FUNÇÃO · AVALIAÇÃO</span><span id="ng-chapter-count">CAPÍTULO 01 / 06</span></footer>
      <div class="ng-modal" id="ng-modal" hidden>
        <section class="ng-modal-card" role="dialog" aria-modal="true" aria-labelledby="ng-question">
          <button type="button" class="ng-modal-close" data-ng-action="close-quiz" aria-label="Fechar pergunta">×</button>
          <small id="ng-modal-label">PORTAL DE CONHECIMENTO</small><h3 id="ng-question"></h3>
          <div class="ng-answers" id="ng-answers"></div>
          <p class="ng-feedback" id="ng-feedback" aria-live="polite"></p>
          <button type="button" class="ng-next" id="ng-next" data-ng-action="next" hidden>PRÓXIMA ÁREA <span aria-hidden="true">→</span></button>
        </section>
      </div>
    </section>
    <aside class="neuro-games-notice"><span class="neuro-games-notice-mark" aria-hidden="true">i</span><p><strong>Área educacional.</strong> As cenas são fictícias. O jogo não acessa nem grava dados de pacientes e não substitui avaliação, diagnóstico ou julgamento profissional.</p></aside>
  </div>`;
}

export function mountNeuroGames(main){
  cleanupNeuroGames();
  const game=main.querySelector('#neuro-native-game');
  if(!game)return;
  const $=selector=>game.querySelector(selector.startsWith("#")||selector.startsWith(".")?selector:`#${selector}`),controller=new AbortController(),{signal}=controller;
  let chapterIndex=0,score=0,found=new Set(),started=false,solved=false,sound=false,audio=null,placeholder=null,completed=false;
  const chapter=()=>neuroGameChapters[chapterIndex];
  const cue=kind=>{if(!sound)return;try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const tones=kind==='right'?[523,659,784]:kind==='wrong'?[190,160]:[440,587];tones.forEach((hz,i)=>{const osc=audio.createOscillator(),gain=audio.createGain(),time=audio.currentTime+i*.06;osc.type='sine';osc.frequency.setValueAtTime(hz,time);gain.gain.setValueAtTime(.0001,time);gain.gain.exponentialRampToValueAtTime(.035,time+.02);gain.gain.exponentialRampToValueAtTime(.0001,time+.2);osc.connect(gain);gain.connect(audio.destination);osc.start(time);osc.stop(time+.21);});}catch{}};
  const updateProgress=()=>{const percent=((chapterIndex+found.size/3)/neuroGameChapters.length)*100;$('#ng-progress-fill').style.width=`${percent}%`;$('.ng-progress').setAttribute('aria-valuenow',String(Math.round(percent)));$('#ng-found').textContent=String(found.size);$('#ng-score').textContent=String(score).padStart(3,'0');$('#ng-chapter-count').textContent=`CAPÍTULO ${String(chapterIndex+1).padStart(2,'0')} / ${String(neuroGameChapters.length).padStart(2,'0')}`;};
  const showDetail=(index)=>{const c=chapter();$('#ng-detail').innerHTML=`<span class="ng-detail-sigil ng-sprite-${c.sprite}" aria-hidden="true"></span><div><small>PISTA 0${index+1} · ${escapeHtml(c.area)}</small><p>${escapeHtml(c.clues[index])}</p></div>`;};
  const renderNotes=()=>{const c=chapter();$('#ng-notes').innerHTML=c.clues.map((clue,index)=>`<button type="button" class="ng-note ${found.has(index)?'is-found':'is-locked'}" data-ng-action="note" data-index="${index}" ${found.has(index)?'':'disabled'}><span class="ng-note-art ng-sprite-${c.sprite}" aria-hidden="true"></span><span class="ng-note-copy"><small>FRAGMENTO 0${index+1}</small><b>${found.has(index)?escapeHtml(clue):'Aguardando descoberta'}</b></span><span class="ng-note-mark">${found.has(index)?'✓':'·'}</span></button>`).join('');};
  const loadChapter=()=>{const c=chapter();found=new Set();solved=false;game.dataset.area=c.accent;$('#ng-region').textContent=`${String(chapterIndex+1).padStart(2,'0')} · ${c.region}`;$('#ng-title').textContent=c.title;$('#ng-scene-region').textContent=`CADERNO DE CAMPO · ${String(chapterIndex+1).padStart(2,'0')}`;$('#ng-scene-title').textContent=c.title;$('#ng-hint').textContent=started?'Investigue os três pontos luminosos para abrir o portal.':'Inicie a expedição e procure os três sinais na cena.';$('.ng-clue-count');game.querySelectorAll('[data-ng-action="clue"]').forEach(button=>{button.disabled=!started;button.classList.remove('is-found')});$('.ng-gate').disabled=true;$('#ng-intro').hidden=started;$('#ng-modal').hidden=true;renderNotes();updateProgress();};
  const inspect=index=>{if(!started||found.has(index))return;found.add(index);score+=10;cue('discover');game.querySelector(`[data-ng-action="clue"][data-index="${index}"]`)?.classList.add('is-found');renderNotes();showDetail(index);updateProgress();if(found.size===neuroGameChapters[chapterIndex].clues.length){$('.ng-gate').disabled=false;$('#ng-hint').textContent='Pistas reunidas. Abra o portal para resolver a conexão.';}};
  const openQuiz=()=>{if(found.size<3)return;const c=chapter();$('#ng-modal-label').textContent=`PORTAL · ${c.area.toUpperCase()}`;$('#ng-question').textContent=c.question;$('#ng-feedback').textContent='';$('#ng-feedback').className='ng-feedback';$('#ng-next').hidden=true;$('#ng-next').innerHTML='PRÓXIMA ÁREA <span aria-hidden="true">→</span>';$('#ng-answers').hidden=false;$('#ng-answers').innerHTML=c.choices.map((choice,index)=>`<button type="button" data-ng-action="answer" data-index="${index}"><span>${String.fromCharCode(65+index)}</span>${escapeHtml(choice)}</button>`).join('');$('#ng-modal').hidden=false;game.querySelector('.ng-modal-close').focus({preventScroll:true});};
  const answer=index=>{if(solved)return;const c=chapter();if(index===c.answerIndex){solved=true;score+=50;cue('right');$('#ng-feedback').className='ng-feedback is-correct';$('#ng-feedback').textContent=c.explanation;$('#ng-next').hidden=false;updateProgress();}else{cue('wrong');$('#ng-feedback').className='ng-feedback is-incorrect';$('#ng-feedback').textContent='Essa hipótese ainda não explica todas as pistas. Releia o caderno e tente outra resposta.';}};
  const next=()=>{if(completed){chapterIndex=0;score=0;started=false;completed=false;loadChapter();return;}if(chapterIndex===neuroGameChapters.length-1){completed=true;$('#ng-modal-label').textContent='EXPEDIÇÃO CONCLUÍDA';$('#ng-question').textContent='Você reconstruiu as conexões.';$('#ng-answers').hidden=true;$('#ng-feedback').className='ng-feedback is-correct';$('#ng-feedback').textContent=`Seis áreas exploradas · ${score} pontos de descoberta. Continue revisando as relações entre território, sinal e função.`;$('#ng-next').innerHTML='JOGAR NOVAMENTE <span aria-hidden="true">↻</span>';return;}chapterIndex++;loadChapter();game.scrollIntoView({behavior:'smooth',block:'start'});};
  const syncFullscreen=()=>{const on=document.fullscreenElement===game||game.classList.contains('is-fullscreen');const button=$('.ng-fullscreen');button.setAttribute('aria-pressed',String(on));button.setAttribute('aria-label',on?'Sair da tela cheia':'Abrir jogo em tela cheia');button.querySelector('span').textContent=on?'SAIR':'TELA CHEIA';};
  const leaveFallback=()=>{game.classList.remove('is-fullscreen');if(placeholder){placeholder.replaceWith(game);placeholder=null;}syncFullscreen();};
  const enterFallback=()=>{if(!placeholder){placeholder=document.createElement('div');placeholder.className='ng-fullscreen-placeholder';game.before(placeholder);document.body.append(game);}game.classList.add('is-fullscreen');syncFullscreen();};
  const toggleFullscreen=async()=>{if(document.fullscreenElement===game){await document.exitFullscreen();return;}if(game.classList.contains('is-fullscreen')){leaveFallback();return;}if(game.requestFullscreen){try{await game.requestFullscreen();}catch{enterFallback();}}else enterFallback();syncFullscreen();};
  const click=event=>{const button=event.target.closest('[data-ng-action]');if(!button||!game.contains(button))return;const action=button.dataset.ngAction;switch(action){case 'scroll':game.scrollIntoView({behavior:'smooth',block:'start'});break;case 'start':started=true;cue('discover');loadChapter();game.querySelector('.ng-clue:not(:disabled)')?.focus({preventScroll:true});break;case 'clue':inspect(Number(button.dataset.index));break;case 'note':if(found.has(Number(button.dataset.index)))showDetail(Number(button.dataset.index));break;case 'quiz':cue('discover');openQuiz();break;case 'answer':answer(Number(button.dataset.index));break;case 'next':next();break;case 'close-quiz':$('#ng-modal').hidden=true;break;case 'reset':chapterIndex=0;score=0;started=false;completed=false;loadChapter();break;case 'sound':sound=!sound;button.setAttribute('aria-pressed',String(sound));button.setAttribute('aria-label',sound?'Desativar efeitos sonoros':'Ativar efeitos sonoros');button.classList.toggle('is-muted',!sound);if(sound)cue('discover');break;case 'fullscreen':toggleFullscreen();break;}};
  const keydown=event=>{if(event.key==='Escape'&&!$('#ng-modal').hidden){$('#ng-modal').hidden=true;return;}if(event.key==='Escape'&&game.classList.contains('is-fullscreen'))leaveFallback();};
  game.addEventListener('click',click,{signal});document.addEventListener('keydown',keydown,{signal});document.addEventListener('fullscreenchange',syncFullscreen,{signal});
  activeCleanup=()=>{controller.abort();if(document.fullscreenElement===game)document.exitFullscreen().catch(()=>{});if(game.classList.contains('is-fullscreen')||placeholder)leaveFallback();};
  loadChapter();
}
