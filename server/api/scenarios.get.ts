/**
 * GET /api/scenarios
 * Returns the list of scenario summaries (no choices/feedback — those are
 * only sent when a single scenario is requested, so the "answer" isn't
 * shipped to the client before the user picks).
 */
export default defineEventHandler(() => {
  return getScenarioSummaries()
})
