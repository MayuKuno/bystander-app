import type { Scenario } from '~/types/scenario'

/** POST /api/admin/scenarios — body: a full Scenario (see validateScenario.ts for the shape it must match). */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const error = validateScenarioInput(body)
  if (error) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const input = body as Scenario
  if (await scenarioExists(input.id)) {
    throw createError({ statusCode: 409, statusMessage: `A scenario with id "${input.id}" already exists` })
  }

  return createScenario(input)
})
