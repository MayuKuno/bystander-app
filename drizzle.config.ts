import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  // 'turso' dialect covers libSQL, whether local file (dev, today) or a remote
  // Turso database (if/when a serverless deploy target needs it — same driver,
  // just swap the url/authToken).
  dialect: 'turso',
  dbCredentials: {
    url: 'file:./.data/app.db'
  }
})
