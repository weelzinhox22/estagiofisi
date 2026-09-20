# Fisio Clínico 0.6

Aplicação web responsiva e PWA instalável para apoiar consulta, documentação e estudo durante a prática de fisioterapia supervisionada.

## Funcionalidades

- pacientes identificados por código ou apelido;
- avaliações, planos, objetivos e histórico de sessões;
- avaliação guiada da marcha em três passadas, com registro estruturado, resumo observacional e apoio para escolher medidas funcionais;
- 166 exercícios e atividades com ficha clínica educacional completa;
- consulta por 22 músculos/grupos, 25 testes clínicos, 24 movimentos de goniometria, 8 reflexos e 6 escalas simples;
- 21 problemas funcionais ligados a possibilidades de consulta;
- filtros Neuro por objetivo, posição e assistência;
- favoritos e grupos editáveis em “Meu repertório”;
- gerador de sessão com parâmetros e status por exercício;
- rascunhos de evolução curta e detalhada, sem completar dados ausentes;
- gráfico de dor autorrelatada antes/depois;
- busca global fixa e modo Consulta rápida sem paciente;
- goniometria assistida por câmera com MediaPipe em 10 modos: articulações, movimentos funcionais, inclinação do tronco e marcação manual de três pontos;
- enquadramento guiado, congelamento, tela cheia, gráfico angular, mínimo/máximo, amplitude observada, registro por código e contador configurável de ciclos;
- área Fisioterapia Geral com 9 encontros de discussão e 10 fichas de queixas comuns, incluindo lombalgia, cervicalgia, dor no ombro, joelho, tornozelo, quedas, marcha e dor persistente;
- organizador local e desidentificado de discussões de caso;
- biblioteca com 21 fichas de conduta e raciocínio: metas, educação, carga, mobilidade, fortalecimento, condicionamento, equilíbrio, marcha, transferências, cardiorrespiratória, mobilização, recursos, tecnologia assistiva e reavaliação;
- 44 novas atividades nas áreas Cardiorrespiratória, Condicionamento, Funcional e cotidiano e Mobilidade no leito;
- funcionamento offline após a primeira visita;
- exportação e importação de backup JSON;
- layout para Android e desktop, pronto para futura adoção pelo Capacitor.

## Executar

Requer Node.js 20 ou superior e não exige instalar dependências.

```powershell
cd E:\fisioprojeto\fisio-clinico
npm start
```

Acesse `http://localhost:4173`. Para validar:

```powershell
npm run check
```

O comando executa lint, validação estrutural do catálogo, testes automatizados e build. O build estático é criado em `dist/`.

## Privacidade e uso clínico

Esta versão armazena dados apenas no navegador, sem autenticação, criptografia ou servidor. Use códigos/apelidos e informações desidentificadas. Antes de usar dados reais, observe as regras da instituição, a legislação aplicável e a orientação do supervisor.

O Fisio Clínico é uma ferramenta educacional e de apoio à documentação. Não substitui avaliação fisioterapêutica, diagnóstico, supervisão ou julgamento profissional.

A câmera processa o vídeo localmente e não grava imagens. Em navegador, o acesso exige HTTPS ou localhost. O modelo fica disponível offline depois do primeiro carregamento bem-sucedido.

Consulte [docs/SOURCE_AUDIT.md](docs/SOURCE_AUDIT.md) para decisões de licença e proveniência, [docs/CLINICAL_CONTENT.md](docs/CLINICAL_CONTENT.md) para os critérios editoriais e [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) para atribuições.


## Hospedagem no Vercel

Importe o repositório no Vercel. O arquivo vercel.json define npm ci, npm run build e saída dist. A implantação HTTPS permite solicitar a câmera no Android. O PWA pode ser instalado pelo menu do navegador após carregar a página. Os registros permanecem apenas no armazenamento local de cada dispositivo e não sincronizam entre celular e desktop; use exportação/importação de backup para transferi-los.

## Assistente de Avaliação — 0.6

A versão 0.6 acrescenta um fluxo local e offline de **caso → achados confirmados → pergunta clínica → medida → execução → registro → comparação**. O texto livre identifica apenas possibilidades, que precisam ser confirmadas pelo usuário. O motor determinístico explica cada sugestão e não produz diagnóstico ou prescrição.

A área **Testes e medidas** inclui executores estruturados para TUG, 10MWT, cadência, 2MWT, 6MWT, 5xSTS, 30-Second Chair Stand, Functional Reach, Romberg, apoio unipodal, escala de dor e MRC. Os registros guardam contexto, histórico, resumo para evolução, repetição de protocolo e diferença absoluta. 10MWT, cadência e Functional Reach têm cálculo local validado. O modo sem paciente permite consulta e cálculo sem persistir dados.

SPADI, QuickDASH, NDI, ODI, KOOS e Berg aparecem somente como instrumentos externos: o app não reproduz seus itens e solicita versão autorizada, resultado, unidade e observações. Não há pontos de corte, valores normativos, MCID ou MDC universais.
## Ditado por voz com Groq

Campos clínicos longos exibem o botão **Ditar**: caso do Assistente, queixa, história, achados, sintomas, observações, discussão de caso, evolução e relatório. A gravação dura no máximo 90 segundos, pode ser interrompida manualmente e a transcrição é inserida no cursor sem salvar o áudio no estado local. O texto precisa ser revisado antes de salvar.

A transcrição usa `whisper-large-v3-turbo`, idioma `pt`, através do proxy local `/api/transcribe`. A chave nunca é enviada ao navegador. Configure uma chave nova:

```powershell
Copy-Item .env.example .env.local
# Edite .env.local e preencha GROQ_API_KEY
npm start
```

No Vercel, cadastre `GROQ_API_KEY` nas variáveis de ambiente do projeto. Não use prefixos públicos e não coloque a chave em `src/`, `index.html` ou commits. O arquivo `.env.local` é ignorado pelo Git.

A aplicação mostra um aviso antes do primeiro envio. O áudio é transmitido à Groq e exige internet; as demais funcionalidades continuam locais/offline. Não dite nome, documento, contato ou outro identificador. Consulte a política institucional e, quando aplicável, configure Zero Data Retention na conta Groq.
## Supabase e contas

1. No SQL Editor do projeto Supabase, execute `supabase/migrations/20260920_auth_cloud.sql`.
2. Crie a primeira conta pelo aplicativo.
3. Para promover uma conta a administrador, execute a instrução comentada no fim da migração com o e-mail correto.

A chave publicável fica no cliente. As permissões reais são impostas por RLS. A opção “manter conectado” persiste somente a sessão, nunca a senha.
