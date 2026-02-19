ALTER TABLE `tenders` MODIFY COLUMN `title` text NOT NULL DEFAULT ('Edital');--> statement-breakpoint
ALTER TABLE `tenders` MODIFY COLUMN `description` longtext DEFAULT '';--> statement-breakpoint
ALTER TABLE `tenders` MODIFY COLUMN `fileType` varchar(50) DEFAULT 'pdf';