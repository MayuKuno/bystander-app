import { createHash } from 'node:crypto'
import { sql } from 'drizzle-orm'
import { scenarios } from '~/db/schema'
import { scenarioSeed } from '~/server/utils/scenarioSeed'

interface JournalEntry {
  tag: string
  when: number
}

/** Applies db/migrations on server startup so `npm run dev` / a fresh deploy never needs a manual migrate step. */
export default defineNitroPlugin(async () => {
  await runMigrationsWithRetry()
  await seedScenariosIfEmpty()
})

/**
 * Serverless targets cold-start multiple concurrent instances of this plugin against the
 * same DB, so a migration can lose a race mid-way (e.g. two instances both try `CREATE TABLE`
 * for the same migration). runMigrations() wraps the pending migrations in one transaction so
 * a losing instance's attempt rolls back cleanly instead of leaving half-applied tables behind
 * — this retries that instance a few times so it converges once the winner has committed.
 */
async function runMigrationsWithRetry(attempt = 1): Promise<void> {
  try {
    await runMigrations()
  } catch (error) {
    if (attempt >= 8) throw error
    await new Promise((r) => setTimeout(r, 300 * attempt))
    await runMigrationsWithRetry(attempt + 1)
  }
}

/**
 * Reimplements drizzle-orm's own migrate() rather than calling it directly, because that
 * function reads db/migrations off disk at runtime (`migrationsFolder`). That works locally
 * but not on serverless targets like Vercel, where the deployed function has no access to
 * the source tree. `useStorage('assets:migrations')` reads the same files bundled into the
 * server output instead (via nitro.serverAssets in nuxt.config.ts), so this works the same
 * way in dev and in every deploy target. Table name/shape and hash-tracking match drizzle's
 * own migrator so this stays compatible with anything `drizzle-kit` writes to db/migrations.
 */
async function runMigrations() {
  const assets = useStorage('assets:migrations')
  const journalRaw = await assets.getItemRaw('meta:_journal.json')
  const journal = JSON.parse(journalRaw!.toString()) as { entries: JournalEntry[] }

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS __drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at numeric
    )
  `)

  await db.transaction(async (tx) => {
    const [lastMigration] = await tx.all<{ created_at: number }>(
      sql`SELECT created_at FROM __drizzle_migrations ORDER BY created_at DESC LIMIT 1`
    )

    for (const entry of journal.entries) {
      if (lastMigration && Number(lastMigration.created_at) >= entry.when) continue

      const queryRaw = await assets.getItemRaw(`${entry.tag}.sql`)
      const query = queryRaw!.toString()
      const hash = createHash('sha256').update(query).digest('hex')

      for (const statement of query.split('--> statement-breakpoint')) {
        await tx.run(sql.raw(statement))
      }
      await tx.run(sql`INSERT INTO __drizzle_migrations (hash, created_at) VALUES (${hash}, ${entry.when})`)
    }
  })
}

/** Bootstraps a fresh DB with the scenarios this project shipped with — a no-op once /admin has been used. */
async function seedScenariosIfEmpty() {
  const [existing] = await db.select({ id: scenarios.id }).from(scenarios).limit(1)
  if (existing) return

  const now = Date.now()
  await db.insert(scenarios).values(
    scenarioSeed.map((s) => ({
      id: s.id,
      topic: s.topic,
      situation: s.situation,
      title: s.title,
      summary: s.summary,
      yourPosition: s.yourPosition,
      dialogue1: s.dialogue1,
      dialogue1Speaker: s.dialogue1Speaker,
      dialogue2: s.dialogue2 ?? null,
      dialogue2Speaker: s.dialogue2Speaker ?? null,
      dialogue3: s.dialogue3 ?? null,
      dialogue3Speaker: s.dialogue3Speaker ?? null,
      choices: s.choices,
      createdAt: now,
      updatedAt: now
    }))
  )
}
