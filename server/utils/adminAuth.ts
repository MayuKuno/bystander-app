import type { H3Event } from 'h3'
import { createHmac, timingSafeEqual } from 'node:crypto'

const ADMIN_COOKIE = 'admin_session'
const SESSION_TTL_SECONDS = 60 * 60 * 8

/**
 * Single shared-password admin login — there's exactly one operator, so a
 * users table would be overkill. The cookie carries a signed expiry rather
 * than the password itself, so it can't be replayed once it expires and
 * never exposes the password to the browser.
 */
function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex')
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB)
}

export function checkAdminPassword(password: string): boolean {
  const expected = useRuntimeConfig().adminPassword
  if (!expected) return false
  return timingSafeStringEqual(password, expected)
}

export function setAdminSession(event: H3Event): void {
  const secret = useRuntimeConfig().adminPassword
  const expiresAt = String(Date.now() + SESSION_TTL_SECONDS * 1000)
  const token = `${expiresAt}.${sign(expiresAt, secret)}`
  setCookie(event, ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: !import.meta.dev,
    maxAge: SESSION_TTL_SECONDS,
    path: '/'
  })
}

export function isAdminAuthenticated(event: H3Event): boolean {
  const secret = useRuntimeConfig().adminPassword
  if (!secret) return false

  const token = getCookie(event, ADMIN_COOKIE)
  if (!token) return false

  const [expiresAt, signature] = token.split('.')
  if (!expiresAt || !signature) return false
  if (!timingSafeStringEqual(signature, sign(expiresAt, secret))) return false

  return Number(expiresAt) > Date.now()
}

export function clearAdminSession(event: H3Event): void {
  deleteCookie(event, ADMIN_COOKIE, { path: '/' })
}
