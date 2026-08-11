CREATE TABLE `free_responses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`guest_id` text NOT NULL,
	`scenario_id` text NOT NULL,
	`choice_id` text NOT NULL,
	`outcome_id` text,
	`response_text` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `free_responses_guest_scenario_unique` ON `free_responses` (`guest_id`,`scenario_id`);