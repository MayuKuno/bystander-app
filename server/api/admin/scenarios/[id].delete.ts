/** DELETE /api/admin/scenarios/:id */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'id is required' })
  }

  const deleted = await deleteScenario(id)
  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Scenario not found' })
  }

  return { ok: true }
})
