/**
 * GET /api/scenarios/:id
 * Returns the full scenario, including choices and feedback.
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const scenario = id ? await getScenarioById(id) : undefined

  if (!scenario) {
    throw createError({ statusCode: 404, statusMessage: 'Scenario not found' })
  }

  return scenario
})
