/**
 * POST /api/admin/login
 * Body: { password: string }
 * The one and only /api/admin/** route the guard middleware lets through
 * unauthenticated. See server/utils/adminAuth.ts for the session mechanism.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ password?: string }>(event)

  if (!body?.password || !checkAdminPassword(body.password)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid password' })
  }

  setAdminSession(event)
  return { ok: true }
})
