# Jornada clínica integrada — Fisio Clínico 1.0

## Fluxo principal

O Painel Clínico é a entrada principal do aplicativo e organiza cada acompanhamento nesta ordem:

1. avaliação registrada;
2. objetivos funcionais definidos pelo profissional;
3. plano de tratamento revisado;
4. sessão planejada e executada;
5. evolução revisada pelo fisioterapeuta;
6. orientação domiciliar, quando aplicável.

O percentual exibido representa somente a presença desses registros estruturais. Ele não mede melhora, prognóstico, qualidade do atendimento nem adesão.

## Alertas

Os alertas são derivados de lacunas objetivas: ausência de avaliação, objetivo ou plano; evolução sem revisão; prazo de objetivo vencido; ou longo intervalo desde a última sessão. Eles não são recomendações clínicas e não selecionam condutas.

## Sessão e evolução

- Planejamento e execução permanecem separados.
- O checklist usa os estados `realizado`, `parcial`, `nao_realizado`, `contraindicado_na_sessao` e `nao_avaliado`.
- A evolução usa apenas exercícios realizados ou parciais e os fatos preenchidos.
- O salvamento final exige identificação do profissional responsável e confirmação de revisão.
- A confirmação gera um evento de auditoria sem duplicar o texto clínico.

## Modo paciente

O modo paciente funciona dentro da conta autenticada. Ele não cria um link público nem expõe o prontuário.

Os registros são armazenados como `relato_do_paciente`, com status `aguardando_revisao_profissional`. Eles aparecem separados das observações e medições feitas pelo fisioterapeuta.

## Persistência

- Formulários ativos usam rascunho automático local.
- Sessões em montagem mantêm um plano separado por conta e paciente.
- Registros concluídos são persistidos no estado local e entram na sincronização já existente quando a conta está conectada.
- `patientCheckins` guarda relatos domiciliares.
- `auditEvents` guarda eventos mínimos de criação, revisão e envio, sem replicar o conteúdo clínico completo.

## Limites clínicos

O aplicativo não escolhe exercícios, dose, carga, diagnóstico ou progressão. Modelos por condição são pontos de consulta e sempre exigem avaliação individual e revisão profissional.
