# Catálogo externo de exercícios

Última revisão das fontes: 2026-10-06.

## Regra de inclusão

O catálogo em `src/external-exercise-catalog-data.js` guarda somente metadados factuais, links e informações de direitos. Vídeos, imagens, instruções, doses e precauções não são copiados enquanto não houver licença pública compatível ou autorização documentada para este uso.

Cada item deve possuir:

- `id` estável e único;
- nome publicado pela fonte;
- região, objetivo, posição, equipamento e contexto apenas quando explícitos;
- `originalUrl`, `sourceUrl` e `termsUrl`;
- condição de uso, atribuição, status de direitos e data da consulta;
- `reuseStatus`, normalmente `somente_link`;
- campos clínicos ausentes marcados como `não informado pela fonte`.

## Como atualizar

1. Abra a página oficial e os termos de uso da fonte.
2. Verifique também a licença individual do item, quando existir.
3. Não use login, paywall, CAPTCHA ou URL de mídia para extrair conteúdo.
4. Atualize ou acrescente o item em `external-exercise-catalog-data.js` mantendo o mesmo `id` para itens já existentes. Isso torna a atualização idempotente e impede duplicações.
5. Atualize `checkedAt`, licença, atribuição e status de direitos.
6. Só altere `reuseStatus` para `reutilizacao_confirmada` quando a licença ou autorização permitir explicitamente a reutilização pretendida. Registre a prova no campo de licença e mantenha o link dos termos.
7. Rode `npm run check`. A validação rejeita identificadores duplicados e itens sem nome, fonte ou link original.

## Fontes revisadas

- HEP2go: uso do conteúdo vinculado ao serviço; licença geral de redistribuição não confirmada.
- University of Melbourne / CHESM: direitos reservados; uso pessoal/não comercial e impressão, com permissão prévia exigida para outros usos.
- e-Aulas USP: conteúdo protegido; licença varia por vídeo e precisa ser conferida individualmente.
- Oxford University Hospitals: download para pesquisa privada, estudo ou uso interno, salvo indicação específica.
- Vedius: todos os direitos reservados; licença pública de redistribuição não identificada.

Esta revisão organiza evidências de licença e não constitui parecer jurídico.
