import { mkdirSync } from 'node:fs'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '~/db/schema'

const config = useRuntimeConfig()

// Remote Turso DB when configured (Vercel deploy), local file DB otherwise
// (dev). Schema and queries are unchanged either way — only the client differs.
const client = config.tursoDatabaseUrl
  ? createClient({
      url: config.tursoDatabaseUrl,
      authToken: config.tursoAuthToken
    })
  : createClient({
      url: (() => {
        mkdirSync('.data', { recursive: true })
        return 'file:./.data/app.db'
      })()
    })

export const db = drizzle(client, { schema })
