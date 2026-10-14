# Biblioteca de exercícios fisioterapêuticos — Lote 2

**5 vídeos originais analisados → 18 clipes de exercícios.**

Este pacote contém recortes em MP4, miniaturas JPEG e documentação clínica em português. Os nomes descrevem as atividades **visíveis**, não diagnósticos nem protocolos validados.

## Estrutura

```text
Fisioterapia_Neurologica_Lote_2/
├── videos/                 # 18 clipes MP4 com nomes descritivos
├── miniaturas/             # JPEG com quadro representativo de cada clipe
├── exercicios.json         # catálogo estruturado, pronto para integração ao site
├── GUIA_EXERCICIOS.md      # como fazer, objetivos, posicionamento e cuidados
├── INDICE.csv              # índice de arquivos, categorias e tempos
└── README.md               # este arquivo
```

## Como usar

- Para assistir, abra a pasta `videos/`. Os prefixos 01, 02 etc. identificam a ordem no catálogo.
- Para o site, leia `exercicios.json`. O campo `arquivo_video` guarda o caminho relativo, e `miniatura` o da imagem correspondente. Texto UTF-8.
- O campo `fonte` contém o nome do vídeo original e `inicio_s`/`fim_s` os pontos de corte naquele arquivo, em segundos.
- Abra `GUIA_EXERCICIOS.md` para orientações clínicas por exercício.
- Consulte `INDICE.csv` para importar um índice simples.

## Classificação por funcionalidade

- **Membros superiores / fortalecimento e controle motor:** 1 exercício(s)
- **Membros superiores / alcance e coordenação:** 1 exercício(s)
- **Marcha / equilíbrio e dupla tarefa:** 1 exercício(s)
- **Transferências / força e função de membros inferiores:** 1 exercício(s)
- **Membros superiores / mobilidade de ombro:** 1 exercício(s)
- **Tronco / mobilidade e controle rotacional:** 1 exercício(s)
- **Tornozelo e pés / mobilidade e sensibilidade:** 1 exercício(s)
- **Membros inferiores / fortalecimento e controle postural:** 1 exercício(s)
- **Equilíbrio / avanço funcional e coordenação:** 1 exercício(s)
- **Marcha / treino de obstáculos e propriocepção:** 1 exercício(s)
- **Membros superiores / coordenação funcional e alcance:** 1 exercício(s)
- **Tronco e membros superiores / alcance bilateral:** 1 exercício(s)
- **Mãos / destreza e motricidade fina:** 1 exercício(s)
- **Membros superiores / mobilidade ativo-assistida:** 1 exercício(s)
- **Membros superiores / movimento cíclico:** 1 exercício(s)
- **Membros superiores / flexão de ombro e amplitude:** 1 exercício(s)
- **Membros superiores / alcance funcional assistido:** 1 exercício(s)
- **Membros inferiores / mobilidade e movimento cíclico:** 1 exercício(s)

## Observações de edição e precisão

Os cortes foram feitos após inspeção visual e análise dos pontos de mudança de cena. Os limites de tempo foram aproximados à precisão de um quadro na transição audiovisual. Duas tomadas de um **mesmo exercício com pedalinho** foram unificadas. Aberturas e telas de encerramento foram excluídas sempre que separáveis dos exercícios.

Alguns movimentos são interpretados a partir da imagem: o nome clínico é **descritivo**, e não confirmação de diagnóstico, técnica terapêutica ou prescrição. As orientações no catálogo são propostas de adaptação profissional, não instruções literalmente narradas nos vídeos.

## Segurança e reutilização

Na fisioterapia neurológica, verificar contraindicações, integridade cutânea, sensibilidade, risco de queda, dor, fadiga, capacidade cognitiva, nível de assistência e dispositivos antes de aplicar qualquer exercício. Dosagem e progressão devem ser definidas após avaliação.

Os vídeos de origem parecem conter marcas d'água de terceiros. **A edição e catalogação não transferem direitos de uso, reprodução ou publicação.** Confirme a permissão/licença individual de cada vídeo antes de incorporá-lo a um site público.
