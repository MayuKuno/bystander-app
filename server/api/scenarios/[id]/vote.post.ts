import type { VoteResponse } from '~/types/scenario'

/**
 * POST /api/scenarios/:id/vote
 * Body: { choiceId: string }
 * Records which choice the visitor picked and returns the running tally
 * (counts + percentages) for every choice in the scenario, plus — when the
 * picked choice has `reactions` — one drawn at random for the deep-dive flow.
 */
export default defineEventHandler(async (event): Promise<VoteResponse> => {
  const id = getRouterParam(event, 'id')
  const scenario = id ? await getScenarioById(id) : undefined

  if (!scenario) {
    throw createError({ statusCode: 404, statusMessage: 'Scenario not found' })
  }

  const body = await readBody<{ choiceId?: string }>(event)
  const choiceId = body?.choiceId
  const choice = choiceId ? scenario.choices.find((c) => c.id === choiceId) : undefined

  if (!choice) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid choiceId' })
  }

  const guestId = getOrCreateGuestId(event)
  const tally = await recordVote(guestId, scenario.id, choice.id)
  const picked = choice.reactions && Object.keys(choice.reactions).length ? pickReaction(choice.reactions) : undefined

  return { ...tally, reactionPattern: picked?.pattern, reaction: picked?.reaction }
})
