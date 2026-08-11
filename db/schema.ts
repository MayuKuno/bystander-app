import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'
import type { LocalizedText, ScenarioChoice, ScenarioSituation, ScenarioTopic } from '~/types/scenario'

/**
 * Scenario content — managed entirely through /admin (see server/api/admin/**).
 * `topic`/`situation` are plain text rather than a DB-level enum so new values
 * (added by widening the TS union, per CLAUDE.md) never require a migration.
 * `choices` is stored as one JSON blob rather than normalized into separate
 * tables — it mirrors the `ScenarioChoice[]` shape 1:1, including the optional
 * `reactions` on the 'direct' choice, and is only ever read/written whole.
 */
export const scenarios = sqliteTable('scenarios', {
  id: text('id').primaryKey(),
  topic: text('topic').notNull().$type<ScenarioTopic>(),
  situation: text('situation').notNull().$type<ScenarioSituation>(),
  title: text('title', { mode: 'json' }).notNull().$type<LocalizedText>(),
  summary: text('summary', { mode: 'json' }).notNull().$type<LocalizedText>(),
  yourPosition: text('your_position', { mode: 'json' }).notNull().$type<LocalizedText>(),
  dialogue1: text('dialogue1', { mode: 'json' }).notNull().$type<LocalizedText>(),
  dialogue1Speaker: text('dialogue1_speaker', { mode: 'json' }).notNull().$type<LocalizedText>(),
  dialogue2: text('dialogue2', { mode: 'json' }).$type<LocalizedText>(),
  dialogue2Speaker: text('dialogue2_speaker', { mode: 'json' }).$type<LocalizedText>(),
  dialogue3: text('dialogue3', { mode: 'json' }).$type<LocalizedText>(),
  dialogue3Speaker: text('dialogue3_speaker', { mode: 'json' }).$type<LocalizedText>(),
  choices: text('choices', { mode: 'json' }).notNull().$type<ScenarioChoice[]>(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull()
})

/**
 * No accounts — every visitor is identified only by the guest_id cookie
 * (see server/utils/guest.ts). Votes are keyed on that value directly,
 * which is also what powers the personal trends on /me.
 */
export const votes = sqliteTable(
  'votes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    guestId: text('guest_id').notNull(),
    scenarioId: text('scenario_id').notNull(),
    choiceId: text('choice_id').notNull(),
    createdAt: integer('created_at').notNull()
  },
  (table) => ({
    guestScenarioUnique: uniqueIndex('votes_guest_scenario_unique').on(table.guestId, table.scenarioId)
  })
)

/**
 * The free-text second answer in the deep-dive flow (choice -> reaction -> free text ->
 * AI feedback). Same guest_id-only scoping as `votes`; re-answering overwrites, it
 * doesn't accumulate. `outcomeId` is null for choices without a `reactions` deep-dive.
 */
export const freeResponses = sqliteTable(
  'free_responses',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    guestId: text('guest_id').notNull(),
    scenarioId: text('scenario_id').notNull(),
    choiceId: text('choice_id').notNull(),
    outcomeId: text('outcome_id'),
    responseText: text('response_text').notNull(),
    createdAt: integer('created_at').notNull()
  },
  (table) => ({
    guestScenarioUnique: uniqueIndex('free_responses_guest_scenario_unique').on(table.guestId, table.scenarioId)
  })
)
