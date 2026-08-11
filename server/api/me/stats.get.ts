import { desc, eq } from 'drizzle-orm'
import { votes } from '~/db/schema'
import type { AnsweredScenario, PersonalStats, StrategyStats } from '~/types/analytics'
import type { ScenarioStrategy } from '~/types/scenario'

function toStrategyStats(counts: Map<ScenarioStrategy, number>): StrategyStats[] {
  return Array.from(counts.entries())
    .map(([strategy, count]) => ({ strategy, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * GET /api/me/stats
 * No accounts — this is scoped strictly to the requester's own guest_id
 * cookie (see server/utils/guest.ts), so nobody can see anyone else's
 * breakdown. Clearing cookies / switching browsers starts a fresh history.
 */
export default defineEventHandler(async (event): Promise<PersonalStats> => {
  const guestId = getOrCreateGuestId(event)

  const myVotes = await db
    .select()
    .from(votes)
    .where(eq(votes.guestId, guestId))
    .orderBy(desc(votes.createdAt))

  const overallStrategy = new Map<ScenarioStrategy, number>()
  const answeredScenarios: AnsweredScenario[] = []

  for (const vote of myVotes) {
    const scenario = await getScenarioById(vote.scenarioId)
    const choice = scenario?.choices.find((c) => c.id === vote.choiceId)
    if (!scenario || !choice) continue

    answeredScenarios.push({ id: scenario.id, title: scenario.title, topic: scenario.topic })

    if (!choice.strategy || choice.strategy === 'none') continue
    overallStrategy.set(choice.strategy, (overallStrategy.get(choice.strategy) ?? 0) + 1)
  }

  return {
    totalAnswered: myVotes.length,
    byStrategy: toStrategyStats(overallStrategy),
    answeredScenarios
  }
})
