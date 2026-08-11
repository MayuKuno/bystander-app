import { eq } from 'drizzle-orm'
import { scenarios } from '~/db/schema'
import type { Scenario, ScenarioSummary } from '~/types/scenario'

function toScenario(row: typeof scenarios.$inferSelect): Scenario {
  return {
    id: row.id,
    topic: row.topic,
    situation: row.situation,
    title: row.title,
    summary: row.summary,
    yourPosition: row.yourPosition,
    dialogue1: row.dialogue1,
    dialogue1Speaker: row.dialogue1Speaker,
    dialogue2: row.dialogue2 ?? undefined,
    dialogue2Speaker: row.dialogue2Speaker ?? undefined,
    dialogue3: row.dialogue3 ?? undefined,
    dialogue3Speaker: row.dialogue3Speaker ?? undefined,
    choices: row.choices
  }
}

/** GET /api/scenarios — summaries only, no choices/feedback (see that route for why). */
export async function getScenarioSummaries(): Promise<ScenarioSummary[]> {
  return db
    .select({
      id: scenarios.id,
      topic: scenarios.topic,
      situation: scenarios.situation,
      title: scenarios.title,
      summary: scenarios.summary
    })
    .from(scenarios)
}

export async function getScenarioById(id: string): Promise<Scenario | undefined> {
  const [row] = await db.select().from(scenarios).where(eq(scenarios.id, id))
  return row ? toScenario(row) : undefined
}

/** /admin scenario list — full rows, since the admin table shows more than the public summary does. */
export async function listScenariosForAdmin(): Promise<Scenario[]> {
  const rows = await db.select().from(scenarios)
  return rows.map(toScenario)
}

export async function scenarioExists(id: string): Promise<boolean> {
  const [row] = await db.select({ id: scenarios.id }).from(scenarios).where(eq(scenarios.id, id))
  return !!row
}

export async function createScenario(input: Scenario): Promise<Scenario> {
  const now = Date.now()
  await db.insert(scenarios).values({
    id: input.id,
    topic: input.topic,
    situation: input.situation,
    title: input.title,
    summary: input.summary,
    yourPosition: input.yourPosition,
    dialogue1: input.dialogue1,
    dialogue1Speaker: input.dialogue1Speaker,
    dialogue2: input.dialogue2 ?? null,
    dialogue2Speaker: input.dialogue2Speaker ?? null,
    dialogue3: input.dialogue3 ?? null,
    dialogue3Speaker: input.dialogue3Speaker ?? null,
    choices: input.choices,
    createdAt: now,
    updatedAt: now
  })
  return input
}

export async function updateScenario(id: string, input: Scenario): Promise<Scenario | undefined> {
  const [row] = await db
    .update(scenarios)
    .set({
      topic: input.topic,
      situation: input.situation,
      title: input.title,
      summary: input.summary,
      yourPosition: input.yourPosition,
      dialogue1: input.dialogue1,
      dialogue1Speaker: input.dialogue1Speaker,
      dialogue2: input.dialogue2 ?? null,
      dialogue2Speaker: input.dialogue2Speaker ?? null,
      dialogue3: input.dialogue3 ?? null,
      dialogue3Speaker: input.dialogue3Speaker ?? null,
      choices: input.choices,
      updatedAt: Date.now()
    })
    .where(eq(scenarios.id, id))
    .returning()
  return row ? toScenario(row) : undefined
}

/** Leaves any existing votes/free-responses referencing this id in place as orphaned
 *  history — server/api/me/stats.get.ts already skips votes whose scenario is gone. */
export async function deleteScenario(id: string): Promise<boolean> {
  const result = await db.delete(scenarios).where(eq(scenarios.id, id)).returning({ id: scenarios.id })
  return result.length > 0
}
