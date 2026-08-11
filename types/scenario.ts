export type Locale = 'ja' | 'en'

export type LocalizedText = Record<Locale, string>

/** Which minority group this scenario is about. */
export type ScenarioTopic =
  | 'lgbtq'
  | 'disability'
  | 'race'
  | 'gender'
  | 'age'
  | 'religion'
  | 'nationality'
  | 'appearance'
  | 'mental_health'
  | 'pregnancy_parenting'
  | 'socioeconomic_class'

/**
 * Independent axis from `topic` — who the people in the scenario are to each other.
 * Named `situation` (rather than `relationship`) to match the スプレッドシート column
 * this content is authored in; the i18n namespace stays `relationship.*` since that's
 * an internal rename only, not a user-visible string change.
 */
export type ScenarioSituation = 'coworker' | 'manager' | 'friend' | 'family' | 'stranger'

/** Which of the "5 D's" a choice maps to, if any. Not a スプレッドシート column — assigned during curation from the choice's content. */
export type ScenarioStrategy = 'distract' | 'delegate' | 'document' | 'delay' | 'direct' | 'none'

/**
 * The ways the other person can react once challenged directly (choice 4 only).
 * `'silent'` was deliberately removed — a silent reaction gives the player nothing
 * to respond to in the free-text follow-up, so it doesn't fit this flow.
 */
export type ReactionPattern = 'defensive' | 'confused' | 'reflective'

/** One of the (up to 3) ways people can react to choice 4 — one is drawn at random when picked. */
export interface ChoiceReaction {
  /** Who says `reactionText` — usually whoever made the remark (`dialogue1Speaker`), but can be the target replying instead (e.g. when the choice redirects a question back to them). */
  speakerName: LocalizedText
  /** What they say in response, shown as a new dialogue bubble. */
  reactionText: LocalizedText
  /** The pedagogical takeaway for this specific reaction — shown in place of `feedback` when present. */
  explanation: LocalizedText
}

export interface ScenarioChoice {
  id: string
  text: LocalizedText
  feedback: LocalizedText
  isRecommended: boolean
  strategy?: ScenarioStrategy
  /**
   * Only present on the 4th ("direct") choice — and required to have all 3 patterns
   * when present (no partial sets). Picking this choice draws one of them at random
   * instead of jumping straight to `feedback` — and reveals a free-text follow-up
   * prompt afterward.
   */
  reactions?: Record<ReactionPattern, ChoiceReaction>
}

export interface Scenario {
  id: string
  topic: ScenarioTopic
  situation: ScenarioSituation
  title: LocalizedText
  /** The scenario's synopsis (あらすじ). */
  summary: LocalizedText
  /** Your own relationship/position in this specific moment — shown as part of the summary, not as a separate UI element. */
  yourPosition: LocalizedText
  /** The problematic remark. Always present. */
  dialogue1: LocalizedText
  /** Label for whoever says `dialogue1` — a name from `summary` if named there, otherwise a short role (e.g. "Their manager"). */
  dialogue1Speaker: LocalizedText
  /** A bystander's reaction to `dialogue1`. Optional — omit when nobody else reacts. */
  dialogue2?: LocalizedText
  dialogue2Speaker?: LocalizedText
  /** The target's own reaction. Optional — omit when the target doesn't visibly react. */
  dialogue3?: LocalizedText
  dialogue3Speaker?: LocalizedText
  choices: ScenarioChoice[]
}

/** Summary shape returned by GET /api/scenarios (no choices, for list views) */
export interface ScenarioSummary {
  id: string
  topic: ScenarioTopic
  situation: ScenarioSituation
  title: LocalizedText
  summary: LocalizedText
}

/** Aggregated results for "which choice did others pick". */
export interface VoteTally {
  /** choiceId -> vote count */
  counts: Record<string, number>
  total: number
  /** choiceId -> rounded percentage of total */
  percentages: Record<string, number>
}

/** Response shape for POST /api/scenarios/:id/vote — the tally plus a drawn reaction, if the choice has any. */
export interface VoteResponse extends VoteTally {
  reactionPattern?: ReactionPattern
  reaction?: ChoiceReaction
}
