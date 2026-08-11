import type { Scenario } from '~/types/scenario'

/** PUT /api/admin/scenarios/:id — body: a full Scenario (id in the body must match the route param). */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'id is required' })
  }

  const body = await readBody(event)
  const error = validateScenarioInput(body)
  if (error) {
    throw createError({ statusCode: 400, statusMessage: error })
  }

  const input = body as Scenario
  if (input.id !== id) {
    throw createError({ statusCode: 400, statusMessage: 'id cannot be changed on update' })
  }

  const updated = await updateScenario(id, input)
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Scenario not found' })
  }

  return updated
})
