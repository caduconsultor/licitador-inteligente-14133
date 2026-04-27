CREATE TABLE `item_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`parentCategoryId` int,
	`isActive` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `item_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `item_embeddings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`tenderId` int,
	`itemName` text NOT NULL,
	`itemDescription` longtext,
	`category` varchar(255),
	`embedding` json NOT NULL,
	`similarityScore` float DEFAULT 0,
	`isNormalized` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `item_embeddings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `search_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`query` text NOT NULL,
	`queryEmbedding` json,
	`results` json,
	`selectedResult` int,
	`proposalCreated` int DEFAULT 0,
	`proposalWon` int DEFAULT 0,
	`relevanceRating` int,
	`notes` longtext,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `search_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `itemCategories_companyId_idx` ON `item_categories` (`companyId`);--> statement-breakpoint
CREATE INDEX `itemCategories_parentCategoryId_idx` ON `item_categories` (`parentCategoryId`);--> statement-breakpoint
CREATE INDEX `itemEmbeddings_companyId_idx` ON `item_embeddings` (`companyId`);--> statement-breakpoint
CREATE INDEX `itemEmbeddings_tenderId_idx` ON `item_embeddings` (`tenderId`);--> statement-breakpoint
CREATE INDEX `itemEmbeddings_category_idx` ON `item_embeddings` (`category`);--> statement-breakpoint
CREATE INDEX `searchHistory_companyId_idx` ON `search_history` (`companyId`);--> statement-breakpoint
CREATE INDEX `searchHistory_createdAt_idx` ON `search_history` (`createdAt`);