/**
 * Protects every /api/admin/** route except the login endpoint itself.
 * The admin UI additionally has a client-side route middleware
 * (middleware/admin.ts) that redirects to /admin/login on a 401 from this —
 * that one is for UX, this one is the actual boundary.
 */
export default defineEventHandler((event) => {
  if (!event.path.startsWith('/api/admin')) return
  if (event.path === '/api/admin/login') return

  if (!isAdminAuthenticated(event)) {
    throw createError({ statusCode: 401, statusMessage: 'Admin authentication required' })
  }
})
