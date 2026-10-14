# Biblioteca de exercícios de fisioterapia

**Conteúdo:** 25 clipes de 10 vídeos enviados, separados por funcionalidade, com catálogo JSON, guia de orientação clínica em Markdown e imagens de capa.

## Pastas e arquivos

- `videos/`: cada exercício tem um vídeo `.mp4` nomeado pelo movimento, dentro da categoria funcional.
- `miniaturas/`: imagem `.jpg` por exercício, com mesmo identificador e nome do MP4.
- `exercicios.json`: catálogo completo para sites, aplicativos ou indexação; procure a chave `exercicios`.
- `GUIA_EXERCICIOS.md`: guia legível com objetivo, execução e posicionamento.
- `INDICE.csv`: planilha textual para localizar trechos e arquivos.

## Categorias

- **Marcha_e_Equilibrio** — Treinos de marcha, apoio, passos orientados e adaptação a obstáculos.
- **Coordenacao_e_Dupla_Tarefa** — Tarefas de coordenação entre segmentos, atenção e motricidade.
- **Transferencias_e_Funcionalidade** — Transições posturais, alcance funcional e tarefas cotidianas.
- **Controle_Motor_e_Fortalecimento_MMII** — Controle e fortalecimento progressivo de quadril, joelho e tornozelo.
- **Mobilidade_e_Funcao_MMSS** — Treinos de mobilidade e uso funcional de ombros e braços.
- **Manuseio_Neurologico** — Técnicas de mobilização e facilitação manual que exigem avaliação profissional.

## Como usar no site

Leia `exercicios.json` como UTF-8. Cada item tem `id`, `nome`, `categoria`, `para_que_serve`, `como_fazer`, `posicionamento_paciente`, `orientacao_fisioterapeuta`, `cuidados_e_adaptacoes`, `arquivo_video`, `miniatura` e dados temporais do vídeo `origem`. Os caminhos são relativos à raiz desta pasta.

Os vídeos são H.264/AAC encapsulados em MP4, adequados a `<video>` HTML5 na maioria dos navegadores. Os arquivos originais não são incluídos no ZIP para evitar duplicação de espaço. O áudio original e as marcas do vídeo foram preservados.

## Qualidade da identificação

As atividades foram identificadas por inspeção visual e revisão de trocas de cena. Alguns vídeos mostram **um mesmo exercício contínuo**; nesses casos o vídeo foi mantido como um clipe único. Outros mostram **etapas distintas de circuito ou manuseio terapêutico**; essas etapas foram recortadas e assinaladas em `observacao_visual` e nos tempos de origem. Nomes são descritivos, não nomes oficiais de protocolos.

## Segurança e direitos

O material serve como referência educacional, não como prescrição universal. Adapte a tarefa à avaliação do paciente e ao risco de queda, dor, fadiga ou espasticidade. Não se deve copiar manobras manuais intensas em pessoas com tônus elevado sem avaliação específica.

Os vídeos contêm conteúdo originalmente publicado por terceiros. **A autorização para republicar, espelhar ou distribuir os vídeos não foi verificada.** Antes de publicar em um site, confirme permissões dos detentores e direitos de imagem dos pacientes.
