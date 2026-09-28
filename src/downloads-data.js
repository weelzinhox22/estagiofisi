const drive=(id,name,category,restricted=false)=>({id,name,category,restricted,viewUrl:`https://drive.google.com/file/d/${id}/view`,downloadUrl:`https://drive.google.com/uc?export=download&id=${id}`});

export const downloadMaterials=[
  drive('1yq1jOkQ7YHMq-XlcqvAICw3_ST7VXnOS','Apostila de Músculos','Anatomia'),
  drive('1kDBc2n_UL0Ze0gJE1bmTX8cVkDePADmC','Dermatologia','Dermatologia'),
  drive('1h8wdddn6iHryZX0m0-KYMUyadnlMGOAu','Exercícios Terapêuticos — Fundamentos e Técnicas (Kisner)','Exercício terapêutico'),
  drive('1mcBik8Hvyi95OSJWGAknbHaTCHWvcyUr','Exercícios Terapêuticos','Exercício terapêutico'),
  drive('1J322xtntmUMlIv305Duwrr-d9i-S-sEX','Fisiologia do Esporte e do Exercício — 7ª edição','Fisiologia e esporte'),
  drive('1yGB0XUqY6wpDNQ0IGvjgQqg1K0mCF-Zg','Fisiopatologia Pulmonar — Princípios Básicos','Cardiorrespiratória'),
  drive('1NtupvoV6JrVc3vQcl1c_aa4ikcFJ1LAy','Fisiopatologia Pulmonar — West, 8ª edição','Cardiorrespiratória'),
  drive('1KmTemhCI_nWaT5Xe9ZsptXAkSjUxLzU8','Fisioterapia Aplicada à Saúde da Mulher — Elza Baracho','Saúde da mulher'),
  drive('1iRw5qtOBluxuxTnPM6snxSkM9P02ren3','Fisioterapia na Prática Esportiva','Fisiologia e esporte'),
  drive('1qdZg2VXkLILynSYU5Z7CmLRtlEBDE_VK','Intervenções para Crianças e Adolescentes com Paralisia Cerebral','Pediatria e neuro'),
  drive('1plkeUz1fb2jC9m9L_Oul8EkC4LqKQGAN','Lesões no Esporte — Uma Abordagem Anatômica','Fisiologia e esporte'),
  drive('13gAUg74R14bUW-q4xsDWOQ6oA_C8DFFR','Pilates — Bolas e Faixas','Exercício terapêutico'),
  drive('1P2c__VfKuc1EoSDO-B0cwQ-gxRy3HAV4','PNF — Facilitação Neuromuscular Proprioceptiva','Pediatria e neuro'),
  drive('1MEIQrF-jaidYFOwEguT8CQsohvKrBsbw','Princípios de Anatomia Humana — 14ª edição','Anatomia'),
  drive('1hVzil5GrZ44lCP5tJRrWqlIqBU0TB4L7','Tratado de Pediatria — 4ª edição','Pediatria e neuro'),
  drive('10KODuNe7DpTJqzTQ6nh8vAsR-3IhZT80','Anatomia Humana Sobotta — Volume 1','Atlas e anatomia'),
  drive('1-FRIoD57dRWla-_jw4ewIjWoKx_9-DRb','Anatomia Humana Sobotta — Volume 2','Atlas e anatomia'),
  drive('1CgHZvRptO396T7N4C8Q2wBGDdyPI-P-G','Anatomia para Colorir — Netter','Atlas e anatomia'),
  drive('1MR_lmpSL-mxIXxkWDio4V6e7mBShu0mV','Atlas de Anatomia e Preenchimento Global da Face','Atlas e anatomia'),
  drive('12ByTTLmEoif-3gNQw7vg6uSMWX5eAMLG','Atlas Colorido de Anatomia Humana — Abrahams e McMinn, 8ª edição','Atlas e anatomia'),
  drive('1ID7qEpFaZIKDJoTSktzKwSICR87J79jV','Atlas do Membro Superior','Atlas e anatomia'),
  drive('1K688tudmcWCrLe1q20OYBxOFX7C7SVHA','Atlas de Anatomia Humana','Atlas e anatomia'),
  drive('1KzRsHzzC2-CpCEX3qlHNE3O9D7w3iGmB','Atlas de Anatomia Palpatória — Pescoço, Tronco e Membro Superior','Anatomia palpatória'),
  drive('1NUPf2ze0c2dM47YaqIXUa3JPI5fF8M7z','Atlas de Anatomia Palpatória','Anatomia palpatória'),
  drive('1OLqsr6fhnfTwyx541X6EwtLLunIJ2VGF','Atlas de Anatomia Humana Sobotta — Volumes 1 e 2','Atlas e anatomia'),
  drive('1PBxVPYldOp2i2NXiya6hu4FQFePW0n5o','Atlas de Neuroanatomia — Lombardi','Pediatria e neuro'),
  drive('1SnWv4uGmtcXTwAVAN0RLlYAiJeuxV25x','Atlas de Anatomia Humana em Imagem — 4ª edição','Atlas e anatomia'),
  drive('1XP3FlO98rj7e_WfK4T-lF2Ciw4SX4XIm','Atlas Fotográfico de Anatomia Humana — Yokochi, 7ª edição','Atlas e anatomia'),
  drive('1_TWaN3o0wzVZJ0EN8fAs48oLW1X7Wzc8','Atlas de Anatomia do Membro Inferior','Atlas e anatomia'),
  drive('1bUu-suUSR_5nbSlY4ElsfCUwhyMOUMcT','Atlas de Anatomia Humana Sobotta — Cabeça e Pescoço, 21ª edição','Atlas e anatomia'),
  drive('1f9uUFrcJgBWZ_3k1excFuo3erdesRSdi','Atlas de Anatomia Palpatória I','Anatomia palpatória'),
  drive('1lY1-_41FmeFr5Sl2eNb-GiRqt19z3EUz','Atlas de Anatomia Seccional','Atlas e anatomia'),
  drive('1v7Epm_3biRz5ziLNAHckm7IR2iK_Q0_s','Atlas de Anatomia Palpatória II','Anatomia palpatória')
];

export const downloadCategories=['Todos',...new Set(downloadMaterials.map(item=>item.category))];
