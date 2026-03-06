ALTER TABLE `declarations` MODIFY COLUMN `title` varchar(512) NOT NULL;--> statement-breakpoint
ALTER TABLE `proposals` MODIFY COLUMN `title` varchar(512) NOT NULL;--> statement-breakpoint
ALTER TABLE `tenders` MODIFY COLUMN `title` varchar(512) NOT NULL;