# IMPLEMENTAR FISIO CLÍNICO 0.6 — ASSISTENTE DE AVALIAÇÃO, TESTES FUNCIONAIS, CALCULADORAS E REAVALIAÇÃO

Trabalhe diretamente no repositório existente:

`weelzinhox22/estagiofisi`

Antes de alterar qualquer arquivo, leia e compreenda a arquitetura atual do projeto.

## CONTEXTO DO PROJETO

O projeto é o **Fisio Clínico**, uma aplicação web/PWA voltada para apoio educacional, consulta, documentação e raciocínio clínico durante estágio supervisionado de Fisioterapia.

A aplicação NÃO deve:

* diagnosticar automaticamente;
* prescrever tratamento automaticamente;
* substituir avaliação fisioterapêutica;
* substituir supervisão;
* afirmar que um teste confirma um diagnóstico;
* usar um ponto de corte como universal;
* produzir condutas obrigatórias a partir de diagnóstico, idade ou região dolorosa.

O objetivo desta atualização é transformar o app em uma ferramenta muito mais útil durante uma avaliação real.

A nova lógica central deve ser:

**CASO / ACHADOS → PERGUNTA CLÍNICA → MEDIDAS POSSÍVEIS → EXECUÇÃO → RESULTADO → REAVALIAÇÃO**

O aplicativo deve ajudar o usuário a responder perguntas como:

* "O que ainda preciso avaliar?"
* "Qual teste pode responder essa pergunta?"
* "Por que esse teste está sendo sugerido?"
* "Como realizar esse teste?"
* "Qual foi o resultado?"
* "Como esse resultado mudou na reavaliação?"

---

# 1. PRIMEIRO: AUDITE O CÓDIGO EXISTENTE

Antes de implementar qualquer coisa, examine pelo menos:

* `src/app.js`
* `src/store.js`
* `src/reference-data.js`
* `src/gait-assessment.js`
* `src/clinical-workflow.js`
* `src/patient-workflow-ui.js`
* `src/clinical-reasoning-data.js`
* `src/clinical-reasoning-ui.js`
* `src/general-physio-data.js`
* `src/general-physio-ui.js`
* `src/styles.css`
* testes existentes em `test/`
* `README.md`
* `docs/CLINICAL_CONTENT.md`
* `docs/SOURCE_AUDIT.md`
* `sw.js`
* `package.json`

IMPORTANTE:

Já existem em `src/gait-assessment.js` guias para:

* TUG;
* Teste de Caminhada de 10 Metros;
* Teste de Caminhada de 2 Minutos;
* Teste de Caminhada de 6 Minutos;
* Teste de Equilíbrio em 4 Estágios;
* Sentar e Levantar em 30 segundos.

NÃO criar versões duplicadas dessas entidades.

Transformar esses itens em medidas funcionais realmente utilizáveis, com formulário, execução, cálculo, armazenamento e reavaliação.

Reutilizar o que já existe sempre que possível.

Não reescrever todo o projeto.

Não migrar o projeto para React, Vue, TypeScript ou outro framework.

Manter a arquitetura atual:

* JavaScript ES Modules;
* HTML/CSS atual;
* armazenamento local;
* PWA;
* sem servidor obrigatório;
* funcionamento offline.

Evitar novas dependências. Adicionar dependência somente se for absolutamente necessária.

---

# 2. OBJETIVO DA VERSÃO 0.6

Criar um novo módulo chamado:

# Assistente de Avaliação

A funcionalidade deve permitir:

1. selecionar um paciente existente OU utilizar o modo sem paciente;
2. inserir/resumir um caso clínico;
3. registrar achados estruturados;
4. detectar possíveis achados em texto livre;
5. transformar achados em perguntas clínicas;
6. sugerir medidas/testes relacionados às perguntas;
7. explicar por que cada teste foi sugerido;
8. permitir executar testes diretamente no app;
9. calcular automaticamente resultados quando houver fórmula objetiva;
10. salvar resultados;
11. comparar avaliação e reavaliação;
12. mostrar possíveis lacunas da avaliação;
13. integrar resultados com os problemas funcionais e conteúdos já existentes;
14. impedir que a sugestão seja apresentada como diagnóstico ou prescrição.

---

# 3. NÃO USAR IA OU API EXTERNA

O sistema de sugestão deve funcionar localmente e offline.

Não usar:

* OpenAI API;
* Gemini;
* Claude;
* serviços externos de NLP;
* backend remoto.

Utilizar regras determinísticas, tags, palavras-chave e dados estruturados.

O resultado precisa ser explicável.

---

# 4. ENTRADA DO ASSISTENTE

Criar uma tela amigável e rápida, especialmente para celular.

O usuário deve poder informar:

## Contexto

* faixa etária;
* população/contexto;
* região principal;
* queixa;
* objetivo funcional;
* dispositivo auxiliar;
* nível de assistência;
* contexto ambulatorial/hospitalar/comunitário, quando relevante.

Sugestões de população:

* adulto;
* pessoa idosa;
* neuro adulto;
* musculoesquelético;
* cardiorrespiratório;
* pós-operatório;
* oncológico;
* hospitalar;
* pediátrico;
* outro.

Não tratar essas opções como diagnóstico.

---

# 5. TEXTO LIVRE DO CASO

Adicionar um campo:

## "Cole ou resuma o caso"

Exemplo:

> Dor nos dois joelhos, pior à esquerda, edema, crepitação, dificuldade para caminhar muito tempo e alteração da marcha.

Outro exemplo:

> Dor em ombro e escápula, dificuldade para pentear o cabelo, cervicalgia, lombalgia, tremor em membro inferior e desequilíbrio.

O sistema deve analisar localmente palavras e expressões.

Criar dicionário de sinônimos/termos em português.

Exemplos:

### Dor

* dor
* doloroso
* dolorosa
* dolorida
* dolorido

### Equilíbrio

* desequilíbrio
* instabilidade
* medo de cair
* queda
* quedas
* quase caiu
* quase queda
* pende
* inclina
* apoio unilateral difícil

### Marcha

* marcha
* caminhar
* caminhada
* anda
* andar
* claudicação
* mancando
* arrasta o pé
* passos
* balanço
* dissociação

### Fraqueza

* fraqueza
* força reduzida
* perda de força
* grau 3
* grau 2
* dificuldade para levantar

### Transferência

* levantar da cadeira
* sentar
* levantar
* transferência
* sair da cama
* levantar da cama

### Resistência/tolerância

* cansa
* cansar
* fadiga
* não aguenta andar
* não aguenta ficar em pé
* baixa tolerância
* dispneia

### Ombro / membro superior

* ombro
* escápula
* braço
* pentear cabelo
* alcançar acima da cabeça
* vestir
* sutiã

### Cervical

* cervical
* pescoço
* cervicalgia

### Lombar

* lombar
* lombalgia
* coluna lombar
* agachar

### Joelho

* joelho
* crepitação
* edema no joelho
* artrose relatada

### Coordenação

* tremor
* coordenação
* dismetria
* movimentos descoordenados

O parser deve ser tolerante a:

* acentos;
* plural;
* maiúsculas;
* minúsculas;
* pequenas variações.

Porém:

## NUNCA transformar automaticamente palavra detectada em fato confirmado.

Mostrar algo como:

> Possíveis achados detectados no texto — confirme antes de continuar.

Exemplo:

[✓ Dor]
[✓ Marcha alterada]
[? Equilíbrio]
[✓ Joelho]
[? Fraqueza]

O usuário precisa poder marcar/desmarcar.

---

# 6. ACHADOS ESTRUTURADOS

Criar um conjunto editável de achados.

Categorias principais:

## Sintomas

* dor;
* edema;
* rigidez;
* parestesia;
* queimação;
* fadiga;
* dispneia;
* tontura.

## Movimento

* ADM reduzida;
* movimento doloroso;
* compensação;
* dificuldade de movimento ativo.

## Força

* força reduzida;
* dificuldade contra gravidade;
* dificuldade em tarefa funcional.

## Equilíbrio

* instabilidade;
* medo de cair;
* queda prévia;
* dificuldade em apoio unilateral;
* busca apoio externo.

## Marcha

* velocidade reduzida;
* assimetria;
* passo curto;
* claudicação;
* base alargada;
* arraste do pé;
* alteração da virada;
* balanço de braços reduzido;
* dissociação MMSS/MMII reduzida.

## Transferência

* dificuldade sentar-levantar;
* dificuldade leito-sedestação;
* dificuldade ortostatismo;
* necessidade de assistência.

## Capacidade funcional

* baixa tolerância à caminhada;
* baixa tolerância ao ortostatismo;
* dificuldade em escadas;
* dificuldade em AVD;
* dificuldade em tarefas domésticas;
* dificuldade para alcançar acima da cabeça.

## Neurológico

* tremor;
* alteração de coordenação;
* alteração de sensibilidade;
* alteração de tônus;
* alteração reflexa.

## Região

Permitir marcar:

* cervical;
* ombro;
* cotovelo;
* punho/mão;
* coluna torácica;
* lombar;
* quadril;
* joelho;
* tornozelo;
* pé;
* membro superior;
* membro inferior.

---

# 7. PERGUNTAS CLÍNICAS

Não usar lógica:

"diagnóstico X → teste Y"

Usar:

"achado X → pergunta clínica → teste que pode ajudar a responder"

Criar domínios como:

* intensidade da dor;
* mobilidade articular;
* força muscular;
* força funcional;
* equilíbrio estático;
* equilíbrio dinâmico;
* mobilidade funcional;
* velocidade da marcha;
* qualidade da marcha;
* tolerância à caminhada;
* transferência;
* coordenação;
* função de membro superior;
* função cervical;
* função lombar;
* função de joelho;
* risco/relato de quedas;
* resistência ao esforço;
* necessidade de assistência.

---

# 8. MOTOR DE SUGESTÃO

Criar um motor determinístico e testável.

Cada regra deve ter:

* `id`;
* achados relacionados;
* contexto/população;
* pergunta clínica;
* teste sugerido;
* peso/relevância;
* justificativas;
* condições de exclusão;
* observações de segurança.

Não usar "certeza".

Não mostrar:

> Teste indicado.

Preferir:

> Pode ser útil para investigar...

ou

> Considere esta medida se a pergunta clínica for...

---

# 9. NÍVEIS DE RELEVÂNCIA

Pode haver três grupos:

## Mais relacionado aos achados

Testes diretamente ligados às perguntas levantadas.

## Pode complementar

Medidas que acrescentariam informação útil.

## Considerar somente se...

Medidas dependentes de objetivo/contexto específico.

Não chamar isso de "risco alto/baixo" nem de diagnóstico.

---

# 10. EXPLICAR POR QUE O TESTE APARECEU

Todo cartão de sugestão deve ter botão:

## "Por que apareceu?"

Exemplo:

### Timed Up and Go

Pode ajudar a observar mobilidade funcional envolvendo:

* levantar;
* caminhar;
* virar;
* sentar.

Foi sugerido porque foram registrados:

* alteração da marcha;
* dificuldade de mobilidade;
* alteração de equilíbrio.

Adicionar:

> Este resultado não confirma isoladamente um diagnóstico.

---

# 11. CATÁLOGO DE MEDIDAS FUNCIONAIS

Criar uma estrutura centralizada para medidas.

Sugestão de arquivo:

`src/assessment-measures-data.js`

ou nome coerente com a arquitetura atual.

Cada medida pode ter estrutura semelhante a:

```js
{
  id,
  name,
  shortName,
  domain,
  clinicalQuestion,
  populations,
  tags,
  purpose,
  requirements,
  instructions,
  recordFields,
  calculator,
  safety,
  interpretationNotes,
  source,
  licenseStatus
}
```

Adaptar ao padrão existente se houver arquitetura melhor.

---

# 12. IMPLEMENTAR/EXPANDIR AS SEGUINTES MEDIDAS

## 12.1 Escala Numérica de Dor

Já existe no app.

Integrar ao Assistente.

Registrar:

* 0–10;
* repouso/movimento;
* atividade relacionada;
* localização;
* data;
* contexto.

Não diagnosticar pela pontuação.

---

# 13. TUG — TIMED UP AND GO

Já existe como guia em `gait-assessment.js`.

REAPROVEITAR.

Transformar em teste executável.

Campos:

* tempo;
* dispositivo auxiliar;
* assistência;
* calçado;
* sintomas;
* qualidade da virada;
* observações;
* data.

Adicionar cronômetro:

* iniciar;
* pausar, se fizer sentido na implementação;
* parar;
* reiniciar.

Exibir o tempo em segundos.

Não aplicar ponto de corte universal.

Não escrever automaticamente:

> alto risco de queda

a menos que exista população claramente selecionada, protocolo validado e fonte específica incorporada.

Por padrão mostrar:

> Interprete o tempo em conjunto com população, protocolo, dispositivo, assistência e observação clínica.

---

# 14. TESTE DE CAMINHADA DE 10 METROS — 10MWT

Já existe como guia.

Transformar em teste executável.

Campos:

* distância total;
* distância cronometrada;
* tempo;
* velocidade confortável ou rápida;
* dispositivo;
* assistência;
* calçado;
* observação.

Calcular:

```text
velocidade = distância cronometrada / tempo
```

Unidade:

`m/s`

Exemplo:

6 metros / 7,42 segundos = aproximadamente 0,81 m/s.

Validar:

* distância > 0;
* tempo > 0;
* números válidos.

Não aplicar classificação universal automática.

---

# 15. CADÊNCIA DA MARCHA

Quando houver número de passos e tempo:

```text
cadência = passos / tempo_em_minutos
```

Resultado:

`passos/min`

Registrar como medida observacional.

Não classificar automaticamente como normal/anormal.

---

# 16. 2-MINUTE WALK TEST

Já existe como guia.

Criar executor.

Cronômetro regressivo:

02:00.

Registrar:

* distância total;
* pausas;
* tempo total parado;
* dispositivo;
* assistência;
* sintomas;
* RPE/esforço quando utilizado;
* dispneia autorrelatada quando utilizada;
* observações.

Não calcular capacidade prevista sem fonte/população específica.

---

# 17. 6-MINUTE WALK TEST

Já existe como guia.

Criar executor.

Cronômetro regressivo:

06:00.

Registrar:

* distância;
* número de pausas;
* duração das pausas;
* sintomas;
* dispositivo;
* assistência;
* percepção de esforço;
* dispneia;
* FC opcional;
* SpO2 opcional;
* PA opcional;
* observações.

Os sinais vitais devem ser opcionais.

Não inventar limites de interrupção.

Se forem incluídos critérios específicos, precisam ter fonte institucional verificável e contexto claramente apresentado.

---

# 18. CHAIR STAND DE 30 SEGUNDOS

Já existe como guia.

Criar execução estruturada.

Cronômetro:

30 segundos.

Registrar:

* repetições completas;
* repetições parciais;
* uso dos braços;
* altura da cadeira, se conhecida;
* assistência;
* sintomas;
* observações.

Não aplicar classificação universal por idade sem fonte adequada.

---

# 19. ADICIONAR 5 TIMES SIT-TO-STAND — 5xSTS

Adicionar ao catálogo.

Objetivo:

quantificar desempenho na transferência sentar-levantar.

Registrar:

* tempo para cinco repetições;
* cadeira/altura;
* uso de braços;
* dispositivo;
* assistência;
* sintomas;
* qualidade do movimento;
* observações.

Adicionar cronômetro.

Não usar ponto de corte universal.

---

# 20. FUNCTIONAL REACH

Adicionar medida de alcance funcional quando apropriado.

Registrar:

* condição padronizada;
* tentativa 1;
* tentativa 2;
* tentativa 3;
* unidade em centímetros;
* melhor resultado;
* média opcional;
* assistência;
* observações.

Se forem utilizados ponto inicial e final:

```text
alcance = posição final - posição inicial
```

Não classificar automaticamente risco de queda sem referência/população.

---

# 21. ROMBERG

Se já existir em `clinicalTests`, reutilizar.

Caso não esteja adequadamente estruturado, melhorar sem duplicar.

Registrar:

* olhos abertos;
* olhos fechados;
* tempo;
* base;
* oscilação observada;
* necessidade de apoio;
* interrupção;
* observações.

Não tratar Romberg como teste genérico de "equilíbrio" sem explicar sua pergunta clínica.

Não escrever:

> Romberg positivo = doença X.

---

# 22. APOIO UNIPODAL

Adicionar medida simples quando apropriado.

Registrar por lado:

* direito;
* esquerdo;
* tempo;
* apoio externo;
* assistência;
* tremor/oscilação;
* interrupção;
* observações.

Não aplicar corte universal.

---

# 23. BERG BALANCE SCALE

IMPORTANTE: verificar licença e permissões antes de reproduzir itens.

Se for possível reproduzir legalmente:

* implementar pontuação dos 14 itens;
* calcular total automaticamente.

Se a licença não estiver claramente compatível:

NÃO copiar os itens/textos protegidos.

Nesse caso implementar apenas:

* nome do instrumento;
* finalidade;
* campo para resultado total informado manualmente;
* intervalo de pontuação quando isso puder ser legalmente apresentado;
* link/fonte oficial;
* aviso para utilizar instrumento autorizado.

Seguir a política conservadora já existente no projeto.

---

# 24. QUESTIONÁRIOS/ESCALAS REGIONAIS

Adicionar suporte para instrumentos relevantes, porém respeitando licença.

Prioridades:

* SPADI;
* QuickDASH;
* NDI;
* ODI;
* KOOS.

ANTES de reproduzir qualquer questionário:

1. verificar licença;
2. verificar `SOURCE_AUDIT.md`;
3. documentar decisão;
4. não copiar conteúdo protegido.

Quando não puder incorporar os itens:

criar um cartão como:

### Neck Disability Index

**Finalidade:** acompanhar incapacidade relacionada à condição cervical.

Campos:

* resultado informado;
* unidade/escala;
* data;
* versão utilizada;
* observações.

Botão:

`Abrir referência oficial`

Não reproduzir perguntas protegidas.

Mesma lógica para:

* ODI;
* SPADI;
* QuickDASH;
* KOOS.

---

# 25. GONIOMETRIA

A goniometria já existe.

Não duplicar.

Integrar o Assistente às opções existentes.

Exemplo:

Achados:

* dor no ombro;
* dificuldade para pentear cabelo;
* dificuldade para elevar o braço.

Sugestão:

> Quantificar mobilidade relevante do ombro.

Ação:

`Abrir goniometria do ombro`

Permitir depois comparar registros anteriores.

---

# 26. FORÇA MUSCULAR

A escala MRC 0–5 já existe.

Integrar ao Assistente.

Permitir registrar:

* músculo/grupo;
* lado;
* grau;
* posição;
* dor/limitação;
* observações.

Não calcular automaticamente "fraqueza causada por X".

---

# 27. COORDENAÇÃO

Criar área de consulta rápida com testes observacionais simples.

Exemplos:

* dedo-nariz;
* calcanhar-joelho;
* movimentos alternados rápidos;
* alvo/toques alternados;
* coordenação durante tarefa funcional.

Para cada um:

* finalidade;
* como fazer;
* lado;
* observação;
* assistência;
* segurança;
* resultado descritivo.

Evitar classificações diagnósticas automáticas.

---

# 28. TESTES ESPECIAIS ≠ MEDIDAS FUNCIONAIS

A interface deve deixar essa diferença clara.

Criar separação visual:

## Medidas funcionais

Exemplos:

* TUG;
* 10MWT;
* 2MWT;
* 6MWT;
* 5xSTS;
* 30s Chair Stand;
* Functional Reach.

## Testes clínicos/especiais

Exemplos já existentes:

* Phalen;
* Tinel;
* Hawkins;
* Jobe;
* Lachman;
* McMurray;
* FABER;
* FADIR;
* Thompson;
* SLR;
* Slump;
* Spurling etc.

Não misturar "teste provocativo" com "medida funcional".

---

# 29. TRIAGEM DE SEGURANÇA

Antes de iniciar teste de desempenho, exibir triagem curta.

Achados que devem gerar atenção especial podem incluir, de forma genérica:

* dor torácica atual;
* dispneia importante não habitual;
* síncope/desmaio recente;
* tontura intensa;
* piora neurológica aguda;
* instabilidade clínica conhecida;
* trauma recente importante;
* suspeita clínica relevante registrada;
* incapacidade de realizar a tarefa com segurança;
* restrição pós-operatória ainda não esclarecida.

NÃO diagnosticar.

Mensagem sugerida:

> Há informação que pode exigir avaliação de segurança antes de um teste de desempenho. Considere revisar o caso e discutir com o supervisor antes de prosseguir.

Botões:

`Voltar e revisar`

`Prosseguir após avaliação/supervisão`

Não bloquear permanentemente o usuário, pois o contexto clínico e a supervisão determinam a decisão.

---

# 30. "O QUE AINDA FALTA AVALIAR?"

Criar uma funcionalidade muito importante.

Analisar dados já existentes no paciente.

Exemplo:

Registrado:

* dor;
* ADM;
* força;
* alteração da marcha.

Não registrado:

* medida objetiva de mobilidade funcional;
* velocidade;
* equilíbrio.

Mostrar:

## Possíveis lacunas

> Há alteração da marcha registrada, mas ainda não existe uma medida objetiva de velocidade da marcha neste acompanhamento.

Sugestão:

`10-Meter Walk Test`

Outro exemplo:

> Há dificuldade para levantar da cadeira, porém ainda não existe uma medida registrada de transferência/força funcional.

Sugestões:

`5x Sit-to-Stand`

`Chair Stand 30 segundos`

Nunca escrever:

> Você esqueceu de fazer.

Usar:

> Ainda não há registro de...

---

# 31. REAVALIAÇÃO

Criar comparação longitudinal.

Tela:

# Avaliação × Reavaliação

Exemplos:

### TUG

Anterior: 18,3 s
Atual: 14,7 s

Diferença:

`-3,6 s`

---

### 10MWT

Anterior: 0,62 m/s
Atual: 0,81 m/s

Diferença absoluta:

`+0,19 m/s`

---

### EVA/NRS

Anterior: 8/10
Atual: 4/10

Diferença:

`-4 pontos`

---

### Flexão de joelho

Anterior: 105°
Atual: 118°

Diferença:

`+13°`

Não escrever automaticamente:

> melhora clinicamente significativa

a menos que exista MCID/MDC adequado para aquela população, instrumento, protocolo e fonte.

Se não houver:

> Mudança observada entre os registros. Interpretar junto ao contexto clínico e às condições de aplicação.

---

# 32. COMPARAÇÃO DE PROTOCOLO

Ao comparar testes, verificar se as condições foram semelhantes.

Por exemplo:

10MWT anterior:

* confortável;
* sem dispositivo;
* 6 m cronometrados.

Atual:

* rápida;
* bengala;
* 10 m cronometrados.

Neste caso mostrar:

> As condições registradas diferem entre as avaliações. A comparação direta deve ser interpretada com cautela.

Fazer isso quando possível para:

* modo confortável/rápido;
* dispositivo;
* assistência;
* distância;
* lado;
* cadeira;
* uso de braços.

---

# 33. MODELO DE DADOS

Adicionar coleção estruturada para resultados.

Sugestão:

```js
testResults: []
```

ou nome equivalente coerente com o projeto.

Cada resultado deve conter algo semelhante a:

```js
{
  id,
  patientId,
  measureId,
  date,
  context: {},
  raw: {},
  derived: {},
  notes,
  createdAt
}
```

Não armazenar somente texto livre quando o dado puder ser estruturado.

---

# 34. MIGRAÇÃO DO STORE

Atualmente o `store.js` utiliza versão 4.

Criar migração segura para a nova versão.

Exemplo:

`version: 5`

Adicionar:

`testResults: []`

ou coleção escolhida.

Requisitos:

* backups antigos v1, v2, v3 e v4 devem continuar carregando;
* nenhum paciente existente pode ser perdido;
* avaliações existentes continuam válidas;
* sessões continuam válidas;
* favoritos continuam válidos;
* goniometria continua válida;
* discussões de caso continuam válidas.

Atualizar:

* `emptyState`;
* `validateState`;
* `addRecord`;
* `updateRecord`;
* `removeRecord`, se necessário;
* `patientRecords`;
* import/export de backup.

Adicionar testes de migração.

---

# 35. ABA NO PACIENTE

Adicionar no fluxo do paciente uma seção/aba coerente com a interface atual:

## Medidas / Testes

Deve mostrar:

* resultados mais recentes;
* domínio;
* data;
* resultado principal;
* botão para abrir histórico;
* botão `Nova medida`;
* botão `Assistente de avaliação`.

Exemplo:

### Mobilidade

TUG
14,7 s
20/09/2026

### Marcha

10MWT
0,81 m/s
20/09/2026

### Dor

NRS
4/10
20/09/2026

---

# 36. HISTÓRICO POR MEDIDA

Ao abrir uma medida:

Exemplo:

# Histórico — TUG

20/09 — 14,7 s
14/09 — 18,3 s

Mostrar gráfico somente quando fizer sentido.

Não usar gráfico para informação nominal/descritiva.

Para:

* tempo;
* velocidade;
* dor;
* ADM;
* distância;
* repetições;

um gráfico longitudinal simples pode ser útil.

Reutilizar estilo do gráfico de dor existente.

---

# 37. INTEGRAÇÃO COM PROBLEMAS FUNCIONAIS

O projeto já possui `functionalProblems`.

Não substituir.

Criar ligações.

Exemplo:

Resultado/achado:

> dificuldade para levantar da cadeira

Relacionar a:

`Dificuldade para levantar da cadeira`

Depois disponibilizar:

`Ver possibilidades no repertório`

Mas nunca escrever:

> Faça estes exercícios.

Usar:

> Ver atividades relacionadas para consulta.

---

# 38. INTEGRAÇÃO COM CONDUTAS

Também integrar com `clinical-reasoning-data.js`.

Exemplo:

Alteração de marcha:

`Ver guia: Treino de marcha orientado à tarefa`

Dificuldade de transferência:

`Ver guia: Treinar transferências`

Déficit de equilíbrio:

`Ver guia: Equilíbrio e prevenção de quedas`

Baixa tolerância:

`Ver guia: Condicionamento e tolerância ao esforço`

Isso deve ser um atalho educacional, não uma prescrição automática.

---

# 39. CASO SEM PACIENTE

O módulo deve funcionar também dentro de:

## Consulta rápida

O usuário pode:

* escrever um caso;
* confirmar achados;
* receber sugestões;
* abrir instruções;
* executar cálculo.

Porém:

se não houver paciente selecionado, mostrar:

> Resultado não associado a paciente.

Permitir usar a calculadora sem salvar ou selecionar um paciente para salvar.

---

# 40. EXEMPLOS PARA VALIDAR O MOTOR

Criar testes automatizados utilizando casos DESIDENTIFICADOS.

Não colocar nomes reais dos pacientes nos fixtures.

---

## CASO A — JOELHO + MARCHA + EQUILÍBRIO

Entrada aproximada:

> Pessoa com dor no joelho, redução de força, alteração de equilíbrio e marcha, crepitação e edema, dificuldade funcional.

O sistema deve considerar perguntas relacionadas a:

* dor;
* mobilidade;
* força;
* força funcional;
* equilíbrio;
* mobilidade funcional;
* marcha.

Sugestões possíveis:

* NRS;
* goniometria de joelho;
* MRC;
* TUG;
* 10MWT;
* 5xSTS ou 30s Chair Stand;
* medida de equilíbrio apropriada.

Não é obrigatório que todas apareçam no primeiro nível.

---

## CASO B — DOR BILATERAL EM JOELHOS + TOLERÂNCIA

Entrada:

> Dor nos dois joelhos ao andar muito ou permanecer em pé, pior à esquerda, edema e crepitação, alteração de marcha e baixa tolerância à caminhada.

Esperado:

* dor;
* função do joelho;
* mobilidade;
* marcha;
* força funcional;
* tolerância à caminhada.

Sugestões possíveis:

* NRS;
* goniometria;
* 10MWT;
* TUG;
* 5xSTS/30s Chair Stand;
* 2MWT ou 6MWT se apropriado.

A presença da palavra "artrose" NÃO deve ser o motivo principal da sugestão.

O motivo deve ser o problema funcional.

---

## CASO C — PÓS-MASTECTOMIA + OMBRO/CERVICAL/LOMBAR

Entrada:

> Histórico de mastectomia, dor intensa em ombro e escápula, dificuldade para pentear o cabelo, cervicalgia e lombalgia crônicas, dificuldade para agachar, tremor em membro inferior e desequilíbrio.

O sistema deve reconhecer perguntas sobre:

* função do membro superior;
* mobilidade do ombro;
* cervical;
* lombar;
* equilíbrio;
* mobilidade funcional;
* coordenação.

Possíveis sugestões:

* NRS;
* goniometria do ombro;
* instrumento funcional de membro superior quando disponível/licenciado;
* medida cervical quando disponível/licenciada;
* medida lombar quando disponível/licenciada;
* TUG;
* medida de equilíbrio;
* avaliação de coordenação.

IMPORTANTE:

Não sugerir que:

* dor = recorrência de câncer;
* pós-mastectomia = linfedema;
* tremor = diagnóstico neurológico específico.

---

# 41. REGISTRO DE EDEMA/CIRCUNFERÊNCIA

Adicionar ferramenta opcional:

## Medidas de circunferência

Útil para acompanhamento de membro ou região.

Campos:

* região;
* lado;
* ponto anatômico;
* distância de referência;
* medida em cm;
* data.

Permitir bilateral.

Calcular:

```text
diferença = lado A - lado B
```

Não converter automaticamente diferença em diagnóstico de linfedema ou edema patológico.

Mensagem:

> Diferença de medida registrada. A interpretação depende de técnica, localização, condição clínica e protocolo utilizado.

---

# 42. CALCULADORA DE MUDANÇA

Criar função genérica, testável:

```js
difference(current, previous)
```

Quando matematicamente apropriado.

Também poder calcular:

```text
mudança percentual = ((atual - anterior) / |anterior|) × 100
```

Somente mostrar porcentagem quando fizer sentido e valor anterior não for zero.

Não usar porcentagem para escalas onde isso possa induzir interpretação equivocada sem contexto.

---

# 43. FORMULÁRIOS INTELIGENTES

Não apresentar campos desnecessários.

Exemplo:

No 10MWT:

mostrar distância + tempo.

No TUG:

mostrar tempo + contexto.

No 6MWT:

mostrar distância + pausas + sintomas.

No 5xSTS:

mostrar tempo + cadeira + uso dos braços.

Os formulários devem ser específicos por medida.

---

# 44. CRONÔMETRO CLÍNICO

Criar componente/função reutilizável.

Precisa funcionar para:

* TUG;
* 10MWT;
* 5xSTS;
* apoio unipodal;
* Romberg.

E contagem regressiva para:

* 30s Chair Stand;
* 2MWT;
* 6MWT.

Botões grandes para celular:

`INICIAR`

`PARAR`

`REINICIAR`

Mostrar tempo com boa legibilidade.

Utilizar fonte de tempo confiável do navegador.

Evitar acumulação de erro por simplesmente incrementar contador a cada interval.

Calcular pela diferença entre timestamps.

---

# 45. ACESSIBILIDADE

Garantir:

* botões com labels claros;
* navegação por teclado;
* `aria-live` para cronômetro quando adequado, sem anunciar a cada milissegundo;
* contraste adequado;
* não depender apenas de cor;
* campos com `<label>`;
* mensagens de erro acessíveis;
* tela utilizável em Android.

---

# 46. UX MOBILE

O estágio provavelmente será usado no celular.

Priorizar mobile.

Evitar tabelas gigantes no celular.

Utilizar:

* cards;
* chips;
* accordions/details;
* passos;
* sticky action bar quando fizer sentido;
* botões grandes.

Fluxo ideal:

### Passo 1

Contexto/caso

### Passo 2

Confirmar achados

### Passo 3

Sugestões

### Passo 4

Executar teste

### Passo 5

Salvar

---

# 47. BUSCA DE MEDIDAS

Adicionar as novas medidas à busca global existente.

Pesquisar por:

* nome;
* abreviação;
* pergunta clínica;
* domínio;
* tags.

Exemplos:

`andar`

deve poder encontrar:

* 10MWT;
* TUG;
* 2MWT;
* 6MWT.

`levantar cadeira`

pode encontrar:

* 5xSTS;
* Chair Stand 30s.

`equilíbrio`

pode encontrar:

* Functional Reach;
* Romberg;
* apoio unipodal;
* teste de equilíbrio em 4 estágios;
* outros disponíveis/licenciados.

---

# 48. LICENÇAS E FONTES

Este ponto é obrigatório.

Consultar:

`docs/SOURCE_AUDIT.md`

Para cada nova medida, registrar fonte.

Preferir:

* OMS;
* NICE;
* CDC/STEADI;
* Rehabilitation Measures Database;
* sociedades profissionais;
* instituições acadêmicas;
* fontes originais quando necessário.

Não copiar longos textos.

Não copiar instrumentos protegidos.

Adicionar em cada medida:

* fonte;
* URL;
* status de licença/incorporação.

Possíveis valores:

* `original-app`;
* `public/simple`;
* `external-instrument`;
* `license-review-required`.

Quando houver dúvida:

NÃO reproduzir o instrumento.

---

# 49. INTERPRETAÇÃO DE RESULTADOS

Princípio central:

## resultado não é diagnóstico.

Evitar:

> TUG alterado.

Preferir:

> TUG registrado em 17,2 s nas condições descritas.

Evitar:

> Paciente tem alto risco.

Preferir, quando não houver protocolo/população específico:

> O resultado deve ser interpretado em conjunto com histórico de quedas, observação da marcha, contexto, população e protocolo utilizado.

---

# 50. PONTOS DE CORTE

Não adicionar ponto de corte genérico simplesmente porque está disponível na internet.

Qualquer ponto de corte deve ter:

* instrumento;
* população;
* contexto;
* fonte;
* protocolo;
* unidade.

Estrutura possível:

```js
cutoff: {
  population,
  context,
  value,
  comparator,
  source
}
```

Se a população selecionada não corresponder:

não mostrar.

Por padrão, o módulo pode funcionar perfeitamente sem pontos de corte.

---

# 51. MCID/MDC

Mesma regra.

Não exibir:

> mudança significativa

sem fonte/população apropriada.

Estrutura possível:

```js
measurementProperties: [
  {
    population,
    metric: 'MDC',
    value,
    unit,
    source
  }
]
```

Se não existir dado adequado:

mostrar apenas diferença absoluta.

---

# 52. NÃO INVENTAR VALORES NORMATIVOS

Isso vale para:

* TUG;
* Berg;
* 10MWT;
* 5xSTS;
* 30s Chair Stand;
* Functional Reach;
* 6MWT;
* ADM;
* força;
* qualquer outro teste.

---

# 53. SINAIS VITAIS

Se criar campos de:

* PA;
* FC;
* SpO2;

salvar como dados observados.

Não transformar automaticamente em autorização ou contraindicação ao exercício sem protocolo específico.

---

# 54. PÁGINA "TESTES E MEDIDAS"

Na Biblioteca, criar uma área clara:

# Testes e medidas

Filtros:

* todos;
* dor;
* força;
* mobilidade;
* equilíbrio;
* marcha;
* transferência;
* resistência;
* membro superior;
* coluna;
* membro inferior;
* neurológico;
* cardiorrespiratório.

Separar:

### Medidas de desempenho

### Escalas simples

### Testes especiais

### Instrumentos externos

---

# 55. EVITAR DUPLICAÇÃO

Antes de criar qualquer registro:

pesquisar em:

* `reference-data.js`;
* `gait-assessment.js`;
* `clinical-data.js`;
* `general-physio-data.js`.

Se a entidade já existir:

estender/reutilizar.

Exemplo:

não criar dois TUGs com IDs diferentes.

Ter um ID canônico.

---

# 56. IDs CANÔNICOS

Preferir IDs estáveis e legíveis.

Exemplos:

```text
measure-tug
measure-10mwt
measure-2mwt
measure-6mwt
measure-5xsts
measure-30cst
measure-functional-reach
measure-romberg
measure-single-leg-stance
```

Se já houver IDs utilizados, preservar compatibilidade ou criar mapeamento/migração.

---

# 57. ARQUITETURA SUGERIDA

Pode criar, se combinar com o projeto:

```text
src/
  assessment-measures-data.js
  assessment-assistant.js
  assessment-assistant-ui.js
```

Responsabilidades:

### assessment-measures-data.js

Dados declarativos das medidas.

### assessment-assistant.js

* normalização;
* extração de termos;
* motor de regras;
* cálculos;
* comparação;
* detecção de lacunas.

### assessment-assistant-ui.js

* páginas;
* formulários;
* cards;
* cronômetros;
* resultado;
* comparação.

Porém, adapte se outra organização ficar melhor com a arquitetura existente.

Evite colocar mais milhares de linhas diretamente em `app.js`.

O `app.js` já é grande.

Preferir módulos.

---

# 58. EVENTOS

Seguir o padrão existente de `data-action`.

Integrar corretamente aos listeners já existentes.

Não criar framework paralelo de eventos.

---

# 59. CSS

Reutilizar:

* cards;
* panel;
* buttons;
* badges;
* grid;
* spacing;
* tipografia;
* paleta atual.

Adicionar estilos específicos somente quando necessário.

A nova área deve parecer parte do Fisio Clínico, não um aplicativo diferente.

---

# 60. OFFLINE / PWA

A nova funcionalidade deve continuar funcionando offline depois do primeiro carregamento.

Se novos arquivos precisarem entrar no Service Worker/cache:

atualizar corretamente.

Se houver versão do cache:

incrementar conforme necessário.

Não quebrar instalação PWA.

---

# 61. PRIVACIDADE

Manter princípio atual:

* armazenamento local;
* códigos/apelidos;
* evitar dados identificáveis.

Não enviar texto do paciente para servidor.

O parser do Assistente deve funcionar localmente.

---

# 62. TESTES AUTOMATIZADOS

Criar pelo menos:

```text
test/assessment-assistant.test.js
test/assessment-measures.test.js
```

ou divisão equivalente.

Testar:

## Parser

* acentos;
* plural;
* texto em caixa alta;
* termos equivalentes.

## Sugestão

* marcha → medidas de marcha;
* levantar cadeira → sit-to-stand;
* baixa tolerância → caminhada cronometrada apropriada;
* equilíbrio → medidas de equilíbrio;
* ombro + função → mobilidade/função de membro superior.

## Não diagnóstico

Garantir que saídas do motor não contenham afirmações diagnósticas proibidas.

## 10MWT

```text
distância 6
tempo 7.5
resultado 0.8 m/s
```

aproximadamente.

## Cadência

120 passos em 2 minutos:

60 passos/min.

## Functional Reach

70 cm - 45 cm:

25 cm.

## Comparação

TUG:

18.3 → 14.7

diferença:

-3.6.

## Store

* criar backup v5;
* carregar v4;
* migrar v4 para v5;
* preservar dados anteriores;
* salvar testResults;
* filtrar resultados por paciente.

---

# 63. TESTAR OS TRÊS PERFIS DE CASO

Adicionar fixtures desidentificados.

## Perfil A

Joelho + força + equilíbrio + marcha.

## Perfil B

Joelho bilateral + dor + baixa tolerância à caminhada.

## Perfil C

Ombro + cervical + lombar + tremor + equilíbrio + histórico cirúrgico oncológico.

Testar que as sugestões façam sentido sem inferir diagnóstico.

---

# 64. DOCUMENTAÇÃO

Atualizar:

`README.md`

para:

# Fisio Clínico 0.6

Explicar:

* Assistente de Avaliação;
* testes funcionais executáveis;
* calculadoras;
* histórico;
* reavaliação;
* lacunas da avaliação.

Atualizar:

`docs/CLINICAL_CONTENT.md`

Adicionar seção:

## Assistente de Avaliação e medidas funcionais — versão 0.6

Explicar que:

* sugestão parte da pergunta clínica;
* achados não geram diagnóstico;
* testes precisam de contexto;
* pontos de corte dependem da população;
* instrumentos protegidos não são reproduzidos sem licença.

Atualizar:

`docs/SOURCE_AUDIT.md`

com novas fontes/licenças.

Atualizar `package.json` para versão:

`0.6.0`

se isso estiver coerente com o versionamento atual.

---

# 65. NÃO REMOVER FUNCIONALIDADES EXISTENTES

Garantir que continuem funcionando:

* pacientes;
* avaliações;
* planos;
* sessões;
* exercícios;
* biblioteca;
* busca;
* favoritos;
* repertórios;
* câmera;
* MediaPipe;
* goniometria;
* avaliação da marcha;
* Fisioterapia Geral;
* discussões de caso;
* gerador de sessão;
* evolução;
* backup/importação;
* PWA.

---

# 66. NÃO QUEBRAR A CÂMERA

Não alterar lógica de MediaPipe/goniometria por câmera além do necessário para criar links com o novo Assistente.

Executar os testes existentes da câmera.

---

# 67. VALIDAÇÃO DE CAMPOS

Não permitir:

* tempos negativos;
* distância negativa;
* NaN;
* Infinity;
* divisão por zero;
* valores vazios tratados como zero.

Mensagens em português.

Exemplo:

> Informe um tempo maior que zero.

---

# 68. FORMATAÇÃO NUMÉRICA

Mostrar resultados com precisão adequada.

Exemplo:

10MWT:

`0,81 m/s`

não:

`0,8086253369272237`

Internamente pode manter precisão completa.

Usar apresentação pt-BR.

---

# 69. DATAS

Usar o padrão já existente do projeto.

Não introduzir biblioteca externa somente para datas.

---

# 70. "O QUE ESTE TESTE ME RESPONDE?"

Em todos os testes funcionais mostrar claramente:

### Pergunta clínica

Exemplo TUG:

> Como está o desempenho em uma tarefa que envolve levantar, caminhar, virar e sentar?

Exemplo 10MWT:

> Qual é a velocidade da marcha nas condições padronizadas registradas?

Exemplo 6MWT:

> Qual distância a pessoa consegue percorrer no protocolo utilizado durante seis minutos?

Exemplo 5xSTS:

> Quanto tempo é necessário para completar cinco transferências sentar-levantar nas condições registradas?

---

# 71. "O QUE REGISTRAR?"

Cada teste deve ter checklist.

Exemplo TUG:

* tempo;
* cadeira;
* dispositivo;
* assistência;
* qualidade da virada;
* sintomas;
* observações.

Isso é importante para ensinar o usuário a não registrar apenas o número.

---

# 72. ATALHOS

Na sugestão:

`Como fazer`

`Executar teste`

`Salvar`

`Ver histórico`

`Por que apareceu?`

`Ver fonte`

---

# 73. RESULTADO SEM INTERPRETAÇÃO EXCESSIVA

Ao terminar 10MWT:

mostrar:

# Resultado

**Velocidade registrada:** 0,81 m/s

Condição:

* caminhada confortável;
* distância cronometrada: 6 m;
* sem dispositivo;
* supervisão próxima.

Depois:

> Utilize o resultado para acompanhamento e interpretação no contexto da pessoa e do protocolo aplicado.

---

# 74. CRIAR RESUMO PARA EVOLUÇÃO

Permitir gerar uma frase objetiva a partir de resultado registrado.

Exemplo:

> Realizado TUG em 14,7 s, sem dispositivo auxiliar, sob supervisão, sem intercorrências relatadas durante a tarefa.

10MWT:

> Realizado teste de caminhada de 10 metros, com trecho cronometrado de 6 m em 7,42 s, correspondendo a velocidade de 0,81 m/s, em ritmo confortável.

IMPORTANTE:

Não completar campos ausentes.

Se assistência não foi registrada, não inventar "independente".

---

# 75. INTEGRAÇÃO COM EVOLUÇÃO

Permitir inserir esse resumo como apoio no rascunho da evolução, respeitando o sistema existente.

Não substituir manualmente todo conteúdo da evolução.

---

# 76. SALVAR CONTEXTO

Cada teste deve guardar contexto suficiente para futura comparação.

Por exemplo:

```js
{
  pace: "comfortable",
  timedDistance: 6,
  device: "",
  assistance: "supervision",
  footwear: "habitual"
}
```

---

# 77. BOTÃO "REPETIR PROTOCOLO"

No histórico de uma medida, adicionar:

`Repetir protocolo`

Pré-preencher:

* distância;
* modo;
* lado;
* cadeira;
* dispositivo;
* demais condições adequadas.

Não copiar:

* tempo anterior;
* resultado anterior;
* sintomas anteriores.

---

# 78. FAVORITOS

Se a arquitetura permitir de maneira simples, permitir favoritar medidas/testes usando o sistema já existente.

Exemplo:

`measure:measure-tug`

Não criar segundo sistema de favoritos.

---

# 79. MEU REPERTÓRIO

Permitir, se fizer sentido com a arquitetura atual, adicionar:

* testes;
* medidas;
* exercícios;

ao mesmo repertório ou criar suporte compatível.

Não é prioridade se exigir grande refatoração.

---

# 80. PERFORMANCE

O Assistente deve ser rápido.

O parser não precisa de algoritmos complexos.

Usar estruturas simples.

Evitar processar todo catálogo repetidamente sem necessidade.

---

# 81. MODO SEM JAVASCRIPT EXTERNO

Toda a lógica de sugestão e cálculo deve estar no próprio bundle/projeto.

Não buscar regras clínicas remotamente.

---

# 82. TRATAMENTO DE PEDIATRIA

Não sugerir automaticamente testes funcionais de adulto para pediatria.

Quando contexto pediátrico estiver selecionado:

priorizar aviso:

> A seleção de medidas em pediatria depende de idade, desenvolvimento, condição funcional e instrumento apropriado.

Se instrumentos pediátricos específicos tiverem licença incerta:

mostrar somente referência externa.

Não implementar instrumentos protegidos sem auditoria.

---

# 83. CONTEXTO NEUROLÓGICO

No neuro adulto, considerar perguntas:

* equilíbrio;
* marcha;
* transferência;
* coordenação;
* força;
* tônus;
* sensibilidade;
* assistência;
* velocidade;
* tolerância.

Não inferir:

* AVC;
* Parkinson;
* lesão medular;

a partir dos achados.

Se o diagnóstico estiver registrado pelo usuário, ele pode ser usado como contexto de busca, mas não como prescrição automática.

---

# 84. CONTEXTO CARDIORRESPIRATÓRIO

Considerar:

* tolerância ao esforço;
* dispneia;
* caminhada;
* recuperação;
* sinais vitais quando indicados.

Relacionar com:

* 2MWT;
* 6MWT;
* percepção de esforço;
* guias cardiorrespiratórios existentes.

Manter avisos de segurança.

---

# 85. CONTEXTO PÓS-OPERATÓRIO / ONCOLÓGICO

Não assumir restrições.

Mostrar:

> Confirme procedimento, lado, data, restrições e orientações da equipe antes de selecionar tarefas.

Permitir registrar:

* procedimento;
* lado;
* data;
* restrição conhecida;
* liberação/orientação;
* cicatriz/edema como achados observados.

Não diagnosticar complicações.

---

# 86. DESIGN DO CARTÃO DE SUGESTÃO

Exemplo:

---

### TUG

**Mobilidade funcional**

Pode ajudar a observar desempenho ao levantar, caminhar, virar e sentar.

**Apareceu porque:**

* alteração da marcha;
* desequilíbrio;
* dificuldade de mobilidade.

`Como fazer`
`Executar`
`Por que apareceu?`

---

---

# 87. TELA DE LACUNAS

Exemplo:

# O que ainda pode ser útil avaliar?

✓ Dor registrada
✓ ADM registrada
✓ Força registrada

○ Mobilidade funcional sem medida objetiva
○ Velocidade da marcha sem medida registrada
○ Equilíbrio sem medida registrada

Possibilidades:

`TUG`

`10MWT`

`Functional Reach`

Não exigir que todos sejam realizados.

---

# 88. PRIORIZAÇÃO DO MVP

Se toda esta implementação for grande, PRIORIZE nesta ordem, mas continue implementando o máximo possível:

### Prioridade 1

* arquitetura do Assistente;
* parser de casos;
* achados confirmáveis;
* motor de sugestão.

### Prioridade 2

* TUG;
* 10MWT;
* 5xSTS;
* 30s Chair Stand;
* 2MWT;
* 6MWT.

### Prioridade 3

* Functional Reach;
* Romberg;
* apoio unipodal;
* NRS;
* MRC.

### Prioridade 4

* armazenamento;
* histórico;
* reavaliação;
* comparação.

### Prioridade 5

* lacunas da avaliação;
* integração com problemas funcionais;
* integração com condutas.

### Prioridade 6

* instrumentos externos regionais;
* circunferência;
* refinamentos.

Porém, NÃO entregar código quebrado pela metade.

É melhor implementar uma camada completa e funcional do que deixar dezenas de botões sem funcionamento.

---

# 89. TESTES FINAIS

Ao terminar executar obrigatoriamente:

```bash
npm run check
```

O comando deve finalizar sem erros.

Ele executa:

* lint;
* validação;
* testes;
* build.

Corrigir todos os erros encontrados.

Não responder que "provavelmente funciona".

Validar de fato.

---

# 90. SMOKE TEST MANUAL

Se o ambiente permitir, iniciar:

```bash
npm start
```

Testar pelo menos:

### Desktop

* abrir início;
* abrir paciente;
* Assistente;
* registrar TUG;
* registrar 10MWT;
* visualizar histórico;
* comparar medidas.

### Mobile/responsivo

Verificar:

* botões;
* cronômetro;
* cards;
* formulários;
* navegação;
* textos;
* overflow horizontal.

Também garantir que páginas antigas continuam abrindo.

---

# 91. CRITÉRIOS DE ACEITE

A implementação só está concluída se:

* [ ] existe Assistente de Avaliação;
* [ ] aceita texto livre;
* [ ] detecta possíveis achados;
* [ ] exige confirmação dos achados;
* [ ] sugere medidas por pergunta clínica;
* [ ] explica por que sugeriu;
* [ ] não diagnostica;
* [ ] não prescreve;
* [ ] TUG funciona;
* [ ] 10MWT calcula m/s;
* [ ] 5xSTS funciona;
* [ ] 30s Chair Stand funciona;
* [ ] 2MWT funciona;
* [ ] 6MWT funciona;
* [ ] resultados podem ser salvos;
* [ ] histórico funciona;
* [ ] reavaliação funciona;
* [ ] backup antigo continua compatível;
* [ ] lacunas da avaliação são detectáveis;
* [ ] integra-se aos pacientes;
* [ ] funciona sem paciente na consulta rápida;
* [ ] não duplica testes já existentes;
* [ ] instrumentos protegidos não são copiados;
* [ ] funciona offline;
* [ ] funciona em mobile;
* [ ] `npm run check` passa.

---

# 92. O QUE NÃO FAZER

NÃO:

* reconstruir o projeto do zero;
* instalar React;
* migrar para TypeScript;
* adicionar banco remoto;
* criar autenticação;
* adicionar API;
* enviar dados do paciente para terceiros;
* inserir IA generativa;
* inventar testes;
* inventar pontos de corte;
* inventar MCID/MDC;
* copiar questionários protegidos;
* alterar radicalmente o design;
* remover funcionalidades atuais;
* transformar achado em diagnóstico;
* transformar teste em confirmação de doença;
* prescrever automaticamente exercício.

---

# 93. QUALIDADE DO CÓDIGO

Criar funções pequenas e testáveis.

Evitar lógica clínica espalhada pelo HTML.

Separar:

* dados;
* regras;
* cálculos;
* interface;
* armazenamento.

Comentários somente quando ajudarem a explicar lógica não óbvia.

Não adicionar comentários redundantes.

---

# 94. ENTREGA FINAL

Ao terminar, responda com:

## Implementado

Resumo das funcionalidades concluídas.

## Arquivos criados

Lista.

## Arquivos alterados

Lista.

## Migração

Explique a mudança do estado/backup.

## Medidas implementadas

Lista.

## Instrumentos externos

Indique quais ficaram apenas como referência devido a licença.

## Testes

Informe resultado de:

```bash
npm run check
```

## Limitações

Somente limitações reais que ainda existirem.

Não terminar dizendo apenas "você pode implementar depois".

Implemente efetivamente tudo que for possível dentro desta tarefa.

---

# 95. PRINCÍPIO CENTRAL DA VERSÃO

Sempre mantenha esta regra:

> O aplicativo deve ajudar o estudante a decidir qual pergunta clínica precisa responder e qual medida pode ajudar a respondê-la — não decidir o diagnóstico ou o tratamento pelo estudante.

A experiência ideal deve ser:

**Caso → achados confirmados → pergunta clínica → medida apropriada → execução padronizada → registro → comparação ao longo do tempo.**

Implemente agora a versão 0.6 seguindo esses requisitos, reaproveitando ao máximo a arquitetura existente e preservando compatibilidade com todos os dados e recursos atuais.
