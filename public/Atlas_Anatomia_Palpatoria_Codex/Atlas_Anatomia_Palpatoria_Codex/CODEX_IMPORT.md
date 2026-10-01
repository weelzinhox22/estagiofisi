# Instruções para o Codex — integração no site

## Objetivo

Adicionar uma área de **Anatomia Palpatória** usando os textos e imagens deste pacote.

## REGRA ABSOLUTA: preservar a estética atual

Antes de editar qualquer tela, inspecione o projeto e identifique framework, roteamento, design tokens, CSS, componentes, grid, cards, botões, tipografia, ícones e breakpoints. **Reutilize o que já existe. Não crie uma identidade visual nova.**

Se houver conflito entre estas sugestões e a arquitetura atual, a arquitetura/estética atual vence.

## Fonte principal

Use `data/site_content.json` (conteúdo limpo para interface). `data/tutoriais_site_clean.json` contém a mesma lista em formato direto. Não renderize `source_note` de `data/tutoriais.json`.

## Navegação sugerida

Sem mudar o padrão visual existente, permita navegar por região e, se fizer sentido no projeto, filtrar por:
- Osteologia
- Miologia / estruturas musculotendinosas
- Nervos e vasos

Pode haver busca por nome da estrutura, mas somente se isso se integrar naturalmente ao site.

## Ordem do conteúdo do tutorial

1. título
2. resumo_site
3. para_que_serve
4. posicionamento_paciente
5. posicionamento_profissional
6. passos
7. confirmacao
8. anatomia_chave
9. observacao
10. imagens

Não mostre campos vazios.

## Imagens

Copie `images/` para a pasta pública/assets equivalente do projeto. Se houver `public/`, uma opção é `public/assets/anatomia-palpatoria/`, preservando as subpastas por região. Ajuste os paths no carregamento sem mudar o JSON original, se preferir.

- usar imagem relacionada ao tutorial;
- lazy loading quando compatível;
- alt baseado no título;
- respeitar proporção;
- usar a mesma borda/raio/moldura já presente no site;
- mobile sem overflow;
- não usar scans inteiros quando há recorte.

## Conteúdo

Os Markdown em `content/` são documentação e alternativa de consumo. Se o projeto já usa MD/MDX, aproveite o pipeline existente. Caso contrário, **não instale um sistema novo** só por causa deste pacote: consuma o JSON.

## Não fazer

- não redesenhar header/sidebar/footer;
- não trocar cores, fontes ou tokens;
- não instalar biblioteca de UI sem necessidade;
- não despejar todos os tutoriais numa única tela longa;
- não renderizar `source_note`;
- não criar informações clínicas novas;
- não remover conteúdo existente.

## Fluxo de implementação

1. inventariar arquitetura e componentes atuais;
2. decidir o ponto de entrada da área de Anatomia Palpatória;
3. copiar assets;
4. integrar `site_content.json`;
5. reutilizar componentes;
6. testar desktop/mobile;
7. executar lint/test/build existentes;
8. corrigir somente problemas relacionados à integração;
9. relatar arquivos alterados.

## Critério de pronto

A seção deve parecer nativa do site, navegar bem por região, carregar as imagens corretas, ocultar campos vazios e não quebrar nenhuma funcionalidade existente.
