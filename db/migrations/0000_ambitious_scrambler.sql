CREATE TABLE `relatable_reactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`guest_id` text NOT NULL,
	`scenario_id` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `relatable_guest_scenario_unique` ON `relatable_reactions` (`guest_id`,`scenario_id`);--> statement-breakpoint
CREATE TABLE `votes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`guest_id` text NOT NULL,
	`scenario_id` text NOT NULL,
	`choice_id` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `votes_guest_scenario_unique` ON `votes` (`guest_id`,`scenario_id`);