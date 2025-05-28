gerar inserts para as tabelas de despesa e receitas, preenchendo os campos de cada tabela, a conta utilizada tera o id 1, gerar duas a quatro receitas/despesas por mes, começando no mes de novembro/2024 até o dia 27/05/2025

CREATE TABLE `despesas` (
   `id` int NOT NULL AUTO_INCREMENT,
   `categoria` varchar(50) NOT NULL,
   `valor_pago` float NOT NULL,
   `data_pagamento` date NOT NULL,
   `descricao` varchar(250) DEFAULT NULL,
   `forma_pagamento` varchar(50) NOT NULL,
   `conta_id` int NOT NULL,
   `data_criacao` datetime NOT NULL,
   `data_alteracao` datetime DEFAULT NULL,
   PRIMARY KEY (`id`),
   KEY `conta_id` (`conta_id`),
   KEY `ix_despesas_id` (`id`),
   CONSTRAINT `despesas_ibfk_1` FOREIGN KEY (`conta_id`) REFERENCES `contas` (`id`)
 ) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
CREATE TABLE `receitas` (
   `id` int NOT NULL AUTO_INCREMENT,
   `categoria` varchar(50) NOT NULL,
   `valor_recebido` float NOT NULL,
   `data_recebimento` date NOT NULL,
   `descricao` varchar(250) DEFAULT NULL,
   `forma_recebimento` varchar(50) NOT NULL,
   `conta_id` int NOT NULL,
   `data_criacao` datetime NOT NULL,
   `data_alteracao` datetime DEFAULT NULL,
   PRIMARY KEY (`id`),
   KEY `conta_id` (`conta_id`),
   KEY `ix_receitas_id` (`id`),
   CONSTRAINT `receitas_ibfk_1` FOREIGN KEY (`conta_id`) REFERENCES `contas` (`id`)
 ) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci