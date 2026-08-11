/** POST /api/admin/logout */
export default defineEventHandler((event) => {
  clearAdminSession(event)
  return { ok: true }
})
