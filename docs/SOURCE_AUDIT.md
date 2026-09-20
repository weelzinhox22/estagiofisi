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


## Conteúdo clínico adicionado na versão 0.4

A área **Fisioterapia Geral** e as fichas de queixas comuns foram redigidas originalmente para este projeto. O roteiro de nove encontros foi fornecido pelo usuário em imagem e serviu apenas como lista temática; nenhum texto de material didático de terceiros foi transcrito.

Foram consultadas páginas oficiais da Organização Mundial da Saúde, NICE, International Association for the Study of Pain e CDC STEADI. O aplicativo apresenta links para as fontes completas em cada ficha. Os resumos, perguntas e checklists são texto original e não reproduzem tabelas, questionários, algoritmos ou recomendações extensas dessas publicações.

| Fonte | Uso no aplicativo | Conduta de reutilização |
|---|---|---|
| OMS — guideline de lombalgia crônica primária (2023) | Princípios de cuidado centrado na pessoa, educação, atividade e exercício | Referência e síntese original; nenhum texto, tabela ou asset copiado |
| NICE NG59 e NG127 | Estrutura de avaliação de lombalgia e atenção a apresentações que exigem encaminhamento | Links e paráfrases curtas; nenhuma ferramenta protegida reproduzida |
| IASP — terminologia e definição revisada da dor | Encontro sobre dor e ficha de dor persistente | Conceito referenciado e texto original |
| CDC STEADI e NICE NG249 | Discussão sobre quedas e pessoa idosa | Links e estrutura conceitual; nenhum formulário ou algoritmo copiado |
| NICE NG226 e OMS Rehabilitation | Osteoartrite, função, avaliação e reabilitação geral | Síntese original com atribuição |

Os dez exercícios adicionais usam texto original e o mesmo esquema editorial do catálogo. Os itens relacionados à lombalgia registram também a guideline da OMS em seu campo de proveniência. As fichas de queixa organizam consulta e discussão; não oferecem diagnóstico, prescrição automática ou regra de encaminhamento independente dos protocolos locais e da supervisão.


## Expansão de exercícios e raciocínio — versão 0.5

Foram adicionadas 44 atividades com redação original nas categorias Cardiorrespiratória, Condicionamento, Funcional e cotidiano e Mobilidade no leito, além de 21 fichas originais de conduta e raciocínio. Nenhum código, texto clínico, tabela, figura, instrumento ou asset foi copiado de outro repositório.

| Fonte consultada | Tema | Reutilização |
|---|---|---|
| OMS — Package of interventions for rehabilitation, módulos 2, 3 e 4 (2023) | Reabilitação musculoesquelética, neurológica e cardiorrespiratória | Links e síntese conceitual original; nenhum conteúdo tabular reproduzido |
| OMS — Guidelines on physical activity and sedentary behaviour (2020) | Atividade física e condicionamento | Princípios gerais referenciados, sem reprodução de tabelas de recomendação |
| NICE NG115 | Reabilitação pulmonar | Referência institucional para individualização e integração de exercício/educação |
| NICE NG249 | Quedas e fatores multifatoriais | Estrutura conceitual, sem copiar algoritmo ou instrumento |
| OMS/UNICEF — Global report on assistive technology (2022) | Tecnologia assistiva e participação | Conceitos gerais e link para a publicação |
| IASP — terminologia da dor | Dor persistente e retomada de atividade | Conceitos referenciados e redação própria |

As fontes são apresentadas dentro das fichas para aprofundamento. As listas de possibilidades não são transcrições das publicações e não constituem recomendação clínica individual.

## Assistente e medidas — versão 0.6

O catálogo 0.6 usa sínteses originais e links para CDC STEADI, Rehabilitation Measures Database, American Thoracic Society e OMS. Protocolos completos, tabelas, limites e textos extensos não foram copiados. TUG, 10MWT, 2MWT, 6MWT e Chair Stand reaproveitam os IDs e as perguntas já presentes no guia de marcha do projeto; não foram criadas entidades clínicas duplicadas.

| Conteúdo | Fonte de referência | Status de incorporação |
|---|---|---|
| TUG, 30s Chair Stand e triagem funcional | CDC STEADI | `public/simple`; instruções resumidas e originais, sem pontos de corte |
| 10MWT, 2MWT, 5xSTS, Functional Reach, apoio unipodal e registros observacionais | Rehabilitation Measures Database | `public/simple`; links e estrutura de registro, sem copiar protocolos extensos |
| 6MWT | American Thoracic Society e Rehabilitation Measures Database | `public/simple`; exige protocolo/triagem, sem inventar critérios de interrupção |
| Escala numérica de dor, MRC e goniometria | Recursos simples já existentes no app e referências institucionais | `public/simple`; integração sem duplicar o recurso original |
| Berg, SPADI, QuickDASH, NDI, ODI e KOOS | Referência externa | `license-review-required`; itens não reproduzidos, somente resultado informado e versão utilizada |

A classificação é conservadora e não constitui parecer jurídico. Uma versão completa de qualquer instrumento externo só pode ser incorporada após confirmação documentada de licença e versão.
## Serviço externo de transcrição

A transcrição opcional usa a API Groq `POST /openai/v1/audio/transcriptions` com `whisper-large-v3-turbo`. A integração é realizada por proxy do próprio projeto para manter `GROQ_API_KEY` somente no servidor. O navegador envia áudio WebM ou OGG e recebe apenas o texto. O aplicativo não persiste o áudio, não registra a chave e não reutiliza a transcrição para diagnóstico ou prescrição.

Por ser um serviço externo, a funcionalidade exige conexão, autorização institucional e fala desidentificada. A política de retenção e eventual configuração Zero Data Retention pertencem à conta Groq utilizada. Fonte técnica: https://console.groq.com/docs/speech-to-text e https://console.groq.com/docs/your-data.