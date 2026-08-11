CREATE TABLE `scenarios` (
	`id` text PRIMARY KEY NOT NULL,
	`topic` text NOT NULL,
	`situation` text NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`your_position` text NOT NULL,
	`dialogue1` text NOT NULL,
	`dialogue1_speaker` text NOT NULL,
	`dialogue2` text,
	`dialogue2_speaker` text,
	`dialogue3` text,
	`dialogue3_speaker` text,
	`choices` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
