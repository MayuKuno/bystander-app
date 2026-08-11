import type { H3Event } from 'h3'

const GUEST_COOKIE = 'guest_id'
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

/**
 * The only identity in the app — a per-browser anonymous id. Everything
 * (votes, the /me trends page) is keyed on this.
 */
export function getOrCreateGuestId(event: H3Event): string {
  const existing = getCookie(event, GUEST_COOKIE)
  if (existing) return existing

  const id = crypto.randomUUID()
  setCookie(event, GUEST_COOKIE, id, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: ONE_YEAR_SECONDS,
    secure: !import.meta.dev
  })
  return id
}
