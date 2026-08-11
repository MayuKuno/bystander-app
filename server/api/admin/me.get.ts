/** GET /api/admin/me — reaching this handler at all means admin-guard already approved the session. */
export default defineEventHandler(() => {
  return { ok: true }
})
