import { migrate } from 'drizzle-orm/libsql/migrator'
import { scenarios } from '~/db/schema'
import { scenarioSeed } from '~/server/utils/scenarioSeed'

/** Applies db/migrations on server startup so `npm run dev` / a fresh deploy never needs a manual migrate step. */
export default defineNitroPlugin(async () => {
  await migrate(db, { migrationsFolder: './db/migrations' })
  await seedScenariosIfEmpty()
})

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
