# Biblioteca de exercícios terapêuticos - pacote para Codex

Gerado a partir do PDF fornecido: **Exercícios Terapêuticos: Fundamentos e Técnicas, 7ª edição** (Kisner, Colby e Borstad).

## Processamento
- O PDF completo foi varrido: **1945 páginas**.
- Foram selecionadas e extraídas **479 figuras práticas de exercícios, alongamentos, mobilizações, estabilização, neurodinâmica e treino funcional**.
- Diagramas puramente anatômicos, radiografias, gráficos e equipamentos sem demonstração prática foram excluídos.
- Cada item contém nome, categoria, tipo, finalidade, modo de realização, posição do paciente, posição do fisioterapeuta, modelo de dose/evolução, objetivo e referência de página/figura.

## Estrutura
```text
Kisner_Exercicios_Codex/
├── README.md
├── CODEX_IMPORT.md
├── manifest.json
├── data/exercicios.json
├── data/exercicios.csv
├── categorias/*.md
└── images/<categoria>/*
```

## Categorias
- **aquatico**: 3
- **assoalho_pelvico**: 4
- **coluna_cervical**: 16
- **coluna_lombar_core**: 42
- **coluna_toracica**: 14
- **cotovelo_antebraco**: 27
- **equilibrio**: 11
- **fortalecimento_geral**: 13
- **funcional**: 32
- **geral**: 23
- **idoso**: 1
- **joelho**: 46
- **linfatico**: 7
- **ombro**: 95
- **punho_mao**: 67
- **quadril**: 29
- **terapia_manual**: 16
- **tornozelo_pe**: 33

## Evolução
Use `modelo_dose_evolucao`, preencha a dose realmente executada e use `objetivo_para_evolucao`. Ex.: `Extensão de joelho — 2 séries × 10 repetições; carga: 2 kg.`

A prescrição e a progressão devem ser individualizadas após avaliação e reavaliação.

## Direitos autorais
As imagens e o conteúdo-fonte pertencem aos respectivos autores/editora. Este pacote foi organizado a partir do arquivo fornecido pelo usuário para consulta/estudo; mantenha a atribuição de origem.
