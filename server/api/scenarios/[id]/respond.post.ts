/**
 * POST /api/scenarios/:id/respond
 * Body: { choiceId: string; outcomeId?: string; responseText: string }
 * Records the free-text second answer in the deep-dive flow (choice -> reaction ->
 * free text -> AI feedback). Same guest_id scoping as /vote; re-answering overwrites.
 */
export default defineEventHandler(async (event): Promise<{ ok: true }> => {
  const id = getRouterParam(event, 'id')
  const scenario = id ? await getScenarioById(id) : undefined

  if (!scenario) {
    throw createError({ statusCode: 404, statusMessage: 'Scenario not found' })
  }

  const body = await readBody<{ choiceId?: string; outcomeId?: string; responseText?: string }>(event)
  const choice = body?.choiceId ? scenario.choices.find((c) => c.id === body.choiceId) : undefined

  if (!choice) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid choiceId' })
  }

  const outcomeId = body?.outcomeId
  const isValidOutcome = !outcomeId || Object.keys(choice.reactions ?? {}).includes(outcomeId)
  if (!isValidOutcome) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid outcomeId' })
  }

  const responseText = body?.responseText?.trim()
  if (!responseText) {
    throw createError({ statusCode: 400, statusMessage: 'responseText is required' })
  }

  const guestId = getOrCreateGuestId(event)
  await recordFreeResponse(guestId, scenario.id, choice.id, outcomeId, responseText)

  return { ok: true }
})
