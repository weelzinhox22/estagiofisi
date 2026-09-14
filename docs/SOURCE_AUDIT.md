# Auditoria de fontes

Auditoria realizada em 14 de setembro de 2026 sobre os repositórios presentes em `E:\fisioprojeto`. A classificação abaixo é técnica e conservadora; não constitui parecer jurídico. Os repositórios originais permaneceram sem modificações.

| Repositório | Tecnologia | Funcionalidades observadas | Licença | Possibilidade de reutilização | Componentes aproveitados | Componentes reimplementados |
|---|---|---|---|---|---|---|
| `AI-Physio-Real-Time-Rehabilitation-Pose-Assessment-System` | Python, Flask, OpenCV, MediaPipe, SQLite, JavaScript e Chart.js | Rastreamento local de pose, ângulos articulares, contagem de repetições, feedback, 24 exercícios e histórico | MIT, copyright Karthik Aljapur (2026) | Código e conteúdo podem ser reutilizados com aviso de copyright e licença. Nesta versão, optou-se por uso mínimo e rastreável | Nomes comuns de exercícios ajudaram o inventário inicial; a atribuição histórica foi mantida em `THIRD_PARTY_NOTICES.md` | O catálogo ampliado, suas 112 fichas, o modelo de dados e toda a interface foram escritos do zero. Nenhum limiar angular, instrução, dose, asset, serviço Python ou código de câmera foi copiado |
| `fisio-app` | Next.js, React, TypeScript, Express, Prisma, PostgreSQL, Zod | Pacientes, anamnese, avaliação objetiva, planos, metas, sessões, métricas e relatórios | Nenhuma licença localizada no topo, subpastas, `package.json` ou README | Sem permissão explícita para copiar, modificar ou redistribuir; usado apenas como referência conceitual | Nenhum código, dado ou asset | Fluxo local de paciente → avaliação → plano → sessão → evolução, com estruturas, nomes de campos, interface e lógica próprios |
| `RehabTrainerHub` | Next.js/React, Vite, TypeScript, jsPsych, Cloudflare, MediaPipe/TensorFlow | Treinos de movimento, visão, cognição e oralidade; PWA por jogo; exportação CSV; segurança de conteúdo | AGPL-3.0-only. Há licenças próprias de dependências e jogos legados em subdiretórios | A incorporação direta exigiria compatibilidade com AGPL e cumprimento do copyleft. Para manter o novo projeto MIT independente, nenhum código ou asset foi incorporado | Nenhum código, texto clínico, jogo ou asset | PWA offline, aviso de finalidade, navegação responsiva e controles de dados foram projetados e implementados do zero |

## Decisões de proveniência

- Todo exercício contém `source` e a tela sempre mostra esse campo.
- O catálogo ampliado contém texto original. A dose é identificada como exemplo educacional e não como regra universal.
- Exercícios adicionados pelo usuário exigem uma fonte/referência/proveniência antes de serem salvos.
- Conteúdo clínico livre registrado pelo usuário é tratado como observação local; o aplicativo não gera diagnóstico ou conduta.
- O projeto usa caracteres e formas CSS/SVG próprios. Nenhum logotipo, fotografia, ilustração ou asset dos repositórios-fonte foi copiado.

## Limites desta auditoria

A auditoria abrange os três diretórios encontrados e seus arquivos de licença, manifestos, READMEs e estruturas relevantes. Dependências transitivas não são distribuídas neste protótipo, que não possui dependências npm de runtime. Uma futura incorporação de bibliotecas, assets ou conteúdo clínico exige nova verificação de licença e fonte.


## Dependência adicionada na versão 0.3

| Dependência | Uso | Licença | Decisão |
|---|---|---|---|
| @mediapipe/tasks-vision 0.10.35 e Pose Landmarker Lite oficial | Detecção local de 33 pontos corporais na câmera | Apache-2.0 | Distribuído em public/vendor/mediapipe, com licença integral e aviso em THIRD_PARTY_NOTICES.md. O cálculo angular, a interface, o contador e a persistência são código original do Fisio Clínico. |
