CREATE TABLE `companies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`cnpj` varchar(18) NOT NULL,
	`companyName` text NOT NULL,
	`legalName` text,
	`taxRegime` enum('simples_nacional','lucro_presumido','lucro_real') NOT NULL,
	`taxPercentage` decimal(5,2) NOT NULL,
	`bankingData` json,
	`legalRepresentative` json,
	`logoUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`),
	CONSTRAINT `companies_cnpj_unique` UNIQUE(`cnpj`)
);
--> statement-breakpoint
CREATE TABLE `declarations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`proposalId` int,
	`title` text NOT NULL,
	`content` longtext NOT NULL,
	`isStandard` boolean DEFAULT false,
	`pdfUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `declarations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`documentType` varchar(100),
	`fileUrl` varchar(512) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`expirationDate` date,
	`daysUntilExpiration` int,
	`isExpired` boolean DEFAULT false,
	`alertSent` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` text NOT NULL,
	`brand` varchar(255),
	`model` varchar(255),
	`unit` varchar(50),
	`cost` decimal(15,2) NOT NULL,
	`supplierId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `proposals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tenderId` int,
	`title` text NOT NULL,
	`proposalType` enum('products','services','works') NOT NULL,
	`processNumber` varchar(100),
	`validityDate` date,
	`paymentDate` date,
	`city` varchar(255),
	`deliveryDeadline` int,
	`items` json,
	`freight` decimal(15,2),
	`totalCost` decimal(15,2),
	`totalSale` decimal(15,2),
	`observations` longtext,
	`pdfUrl` varchar(512),
	`status` enum('draft','ready','submitted','won','lost') DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `proposals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` text NOT NULL,
	`cnpj` varchar(18),
	`phone` varchar(20),
	`whatsapp` varchar(20),
	`email` varchar(320),
	`rating` decimal(3,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `suppliers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` text NOT NULL,
	`description` longtext,
	`fileUrl` varchar(512) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileType` varchar(50),
	`tenderObject` longtext,
	`deadlineSubmission` timestamp,
	`deadlineOpening` timestamp,
	`deadlineAnalysis` timestamp,
	`habilitationRequirements` json,
	`judgmentCriteria` varchar(255),
	`estimatedValue` decimal(15,2),
	`items` json,
	`analysisStatus` enum('pending','analyzing','completed','error') DEFAULT 'pending',
	`analysisResult` longtext,
	`riskLevel` enum('low','medium','high'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tenders_id` PRIMARY KEY(`id`)
);
