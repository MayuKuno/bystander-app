/**
 * Route guard for /admin/** pages (applied via definePageMeta({ middleware: 'admin' })
 * on every admin page except login). The actual security boundary is the server-side
 * admin-guard middleware on /api/admin/** — this just gives a clean redirect instead
 * of a broken page when that boundary rejects the request.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  try {
    // On the server, $fetch to a relative URL is a fresh internal request that doesn't
    // automatically carry the browser's cookies — without forwarding it explicitly, a
    // hard page load (not client-side nav) always looks logged-out during SSR.
    await $fetch('/api/admin/me', {
      headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined
    })
  } catch {
    return navigateTo(`/admin/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
