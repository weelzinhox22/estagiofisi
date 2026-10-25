# NeuroQuest integrado

Este diretório contém a versão web autocontida do jogo educacional NeuroQuest. O Fisio Clínico a incorpora em `#neurojogos` por iframe, sem compartilhar registros, pacientes ou estado clínico com o jogo.

## Arquivos

- `neuroquest_2_mapa_cartas_biblioteca.html`: aplicação interativa original, com aventura, mistério e jogos de revisão.
- `neuroquest.css`: estilos do jogo, mantidos separados do HTML.
- `neuroquest-2d-expedition-keyart.webp` e `neuroquest-mystery-room.png`: artes do jogo.
- `neuroquest-2d-sprites.svg` e `neuroquest-illustration-sprite.png`: sprites e ilustrações locais.

A integração serve esses arquivos como conteúdo estático e os inclui no cache do service worker. O jogo apresenta cenários fictícios para estudo; não oferece diagnóstico nem recomenda condutas a pacientes.
