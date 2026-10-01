# CODEX_IMPORT.md - instruções de integração

## Destino padrão no projeto
Se existir `public/`:
```text
public/assets/exercicios/             <- copiar o conteúdo de `images/`
src/data/exercicios/exercicios.json  <- copiar `data/exercicios.json`
src/data/exercicios/manifest.json    <- copiar `manifest.json`
docs/exercicios/                      <- copiar `README.md`, `CODEX_IMPORT.md` e `categorias/`
```
Depois, no JSON, troque apenas o prefixo `images/` por `/assets/exercicios/` no campo `imagem`.

Se não existir `public/`, detecte o padrão do projeto (`assets/`, `src/assets/` etc.), mantenha as subpastas por categoria e ajuste só o prefixo de `imagem`. Não altere `id`, `categoria`, `figura`, `pagina_pdf` ou nomes dos arquivos.

## UI/integração
- filtros por `categoria` e `tipo`;
- busca por `nome`;
- miniatura + imagem completa;
- exibir `para_que_serve`, `como_realizar`, `posicionamento_paciente`, `posicionamento_fisioterapeuta`;
- campo para dose real executada;
- gerar evolução com `modelo_dose_evolucao`, `modelo_evolucao` e `objetivo_para_evolucao`;
- exibir fonte (capítulo, página PDF e figura).

## Regras para Codex
- Nunca inventar dose quando `dose_fonte_identificada` for `null`; pedir/preencher a dose clínica real.
- Não deduplicar por nome: existem variações de posicionamento e execução.
- Preservar acentos no texto e caminhos dos arquivos.
- Fazer lazy loading das imagens.
- Se já existir schema de exercícios, criar adapter.

## Tipo TypeScript sugerido
```ts
export type ExercicioTerapeutico = {
  id: string; nome: string; categoria: string; tipo: string;
  capitulo: number | null; capitulo_titulo: string; pagina_pdf: number; figura: string | null;
  imagem: string; para_que_serve: string; como_realizar: string;
  posicionamento_paciente: string; posicionamento_fisioterapeuta: string;
  dose_fonte_identificada: string[] | null; modelo_dose_evolucao: string;
  modelo_evolucao: string; objetivo_para_evolucao: string;
};
```

## Checklist
1. Validar todos os caminhos de imagem.
2. Conferir contagem com `manifest.json`.
3. Testar busca por ombro, lombar, joelho, quadril, tornozelo e punho/mão.
4. Abrir 10 itens aleatórios e conferir imagem + nome + fonte.
5. A UI deve exigir a dose real quando ela não estiver informada.
