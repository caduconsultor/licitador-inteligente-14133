ALTER TABLE `tenders` MODIFY COLUMN `title` text NOT NULL;--> statement-breakpoint
ALTER TABLE `tenders` MODIFY COLUMN `description` longtext;--> statement-breakpoint
ALTER TABLE `tenders` MODIFY COLUMN `fileType` varchar(50);