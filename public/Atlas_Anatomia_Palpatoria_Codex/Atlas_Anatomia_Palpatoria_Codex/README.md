# Atlas de Anatomia Palpatória — pacote para Codex

Fonte: **Atlas de Anatomia Palpatória do pescoço, do tronco e do membro superior**, Serge Tixa, vol. 1, 2ª edição.

## Resultado

- PDF analisado: **242 páginas**
- Tutoriais estruturados: **106**
- Recortes visuais: **442**
- Regiões: pescoço, tronco/sacro, ombro, braço, cotovelo, antebraço, punho/mão

## Arquivo principal para o site

`data/site_content.json`

`data/tutoriais.json` contém também `source_note`, usado somente para rastreabilidade. Ele pode carregar imperfeições do OCR e **não deve ser exibido diretamente**.

## Estrutura

```text
content/       # textos em Markdown
data/          # JSON para a aplicação
images/        # recortes das fotos/ilustrações por região
qa/            # folhas de contato para conferência
CODEX_IMPORT.md
PROMPT_CODEX.txt
manifest.json
```

## Regra de integração

**Não redesenhar o site.** A nova área deve herdar os componentes, tipografia, cores, espaçamentos, bordas, sombras, navegação e responsividade já existentes.
