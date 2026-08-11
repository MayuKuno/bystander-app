import { freeResponses } from '~/db/schema'

/**
 * Records/updates this guest's free-text answer for a scenario (re-answering
 * overwrites their previous response, same as `recordVote`).
 */
export async function recordFreeResponse(
  guestId: string,
  scenarioId: string,
  choiceId: string,
  outcomeId: string | undefined,
  responseText: string
): Promise<void> {
  const now = Date.now()
  await db
    .insert(freeResponses)
    .values({ guestId, scenarioId, choiceId, outcomeId: outcomeId ?? null, responseText, createdAt: now })
    .onConflictDoUpdate({
      target: [freeResponses.guestId, freeResponses.scenarioId],
      set: { choiceId, outcomeId: outcomeId ?? null, responseText, createdAt: now }
    })
}
