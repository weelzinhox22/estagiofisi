# Instruções para integrar esta biblioteca no site

Integre a pasta videos/ e catalogo.json ao projeto do site. Primeiro, identifique o framework e a estrutura existente; mantenha o padrão visual atual e não altere outras páginas sem necessidade.

Leia catalogo.json como fonte dos dados. Crie ou atualize a página/lista de exercícios para apresentar cada item com nome, vídeo, descrição, objetivos, orientações e dosagem mencionada quando não for nula. Use o caminho relativo do campo arquivo como URL do vídeo após copiar videos/ para a pasta pública apropriada do projeto.

Use um elemento de vídeo HTML acessível, com controls, dimensões responsivas, formato MP4 e um texto alternativo/legenda visível com o nome do exercício. Não inicie reprodução automática. Garanta que os controles não sejam cobertos pelo layout. Mantenha os textos em português e os créditos já presentes nos vídeos.

Organize a exibição por regiao_ou_categoria; acrescente uma busca simples por nome e categoria se isso se encaixar no projeto existente. O item com tipo_conteudo: material_complementar_educativo deve aparecer em “Material complementar”, separado da lista de exercícios.

Não transforme descrições gerais em indicação clínica, promessa de resultado ou prescrição universal. Não invente séries e repetições: mostre dosagem_mencionada_no_video apenas quando preenchida, identificando que veio do vídeo. Inclua uma nota curta de que escolha e dosagem dependem da avaliação/orientação do fisioterapeuta.

Depois da implementação, verifique os caminhos dos 50 arquivos de vídeo, a reprodução de pelo menos um arquivo em celular e desktop, a busca/categorias e a acessibilidade básica do controle de vídeo. Informe os arquivos alterados e como testar localmente.
