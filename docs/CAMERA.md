# Goniometria assistida por câmera

## O que faz

A tela **Biblioteca → Goniometria → Abrir câmera** utiliza MediaPipe Pose Landmarker para detectar pontos corporais no vídeo. O Fisio Clínico calcula um ângulo bidimensional entre três pontos, desenha o esqueleto e permite:

- selecionar cotovelo, ombro, quadril, joelho ou tornozelo;
- selecionar o lado anatômico;
- alternar entre câmera frontal e traseira;
- acompanhar ângulo atual, mínimo, máximo e amplitude observada;
- capturar a estimativa no armazenamento local;
- contar ciclos quando o ângulo passa de um limiar baixo para um alto.

## Limites

O resultado é um ângulo geométrico projetado na imagem. Ele pode divergir de uma medida goniométrica presencial por perspectiva, rotação do segmento, posição da câmera, oclusão, roupa, iluminação e erro na localização dos pontos.

Não são aplicadas amplitudes normativas, diagnóstico, classificação de movimento ou aprovação automática da execução. O contador registra ciclos entre limiares definidos pelo usuário; ele não determina se a repetição foi correta.

## Privacidade e funcionamento offline

O vídeo é processado no navegador e não é gravado nem enviado pelo aplicativo. A permissão é solicitada somente ao tocar em **Iniciar câmera**. Os arquivos do modelo e WebAssembly são locais ao projeto. Depois do primeiro carregamento bem-sucedido, o service worker pode reutilizá-los offline.

O acesso à câmera em navegador exige contexto seguro, normalmente HTTPS ou localhost. Em um futuro pacote Capacitor, deve-se declarar e explicar a permissão nativa de câmera.

## Tecnologia e licença

- @mediapipe/tasks-vision 0.10.35;
- modelo oficial pose_landmarker_lite.task;
- MediaPipe sob Apache License 2.0;
- cálculo angular, interface, desenho, estatísticas, contador e persistência escritos para o Fisio Clínico.

Referências: [MediaPipe Pose Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker) e [repositório oficial](https://github.com/google-ai-edge/mediapipe).

