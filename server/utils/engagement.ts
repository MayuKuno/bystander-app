import { eq, sql } from 'drizzle-orm'
import { votes } from '~/db/schema'
import type { VoteTally } from '~/types/scenario'

/**
 * Records/updates this guest's answer for a scenario (re-answering
 * overwrites their previous choice) and returns the scenario's current
 * anonymous tally — this aggregate is public and never requires an account.
 */
export async function recordVote(guestId: string, scenarioId: string, choiceId: string): Promise<VoteTally> {
  const now = Date.now()
  await db
    .insert(votes)
    .values({ guestId, scenarioId, choiceId, createdAt: now })
    .onConflictDoUpdate({
      target: [votes.guestId, votes.scenarioId],
      set: { choiceId, createdAt: now }
    })
  return getVoteTally(scenarioId)
}

export async function getVoteTally(scenarioId: string): Promise<VoteTally> {
  const rows = await db
    .select({ choiceId: votes.choiceId, count: sql<number>`count(*)` })
    .from(votes)
    .where(eq(votes.scenarioId, scenarioId))
    .groupBy(votes.choiceId)

  const counts: Record<string, number> = {}
  let total = 0
  for (const row of rows) {
    counts[row.choiceId] = row.count
    total += row.count
  }

  const percentages: Record<string, number> = {}
  for (const [choiceId, count] of Object.entries(counts)) {
    percentages[choiceId] = total === 0 ? 0 : Math.round((count / total) * 100)
  }

  return { counts, total, percentages }
}
