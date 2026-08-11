import type { LocalizedText, ScenarioStrategy, ScenarioTopic } from '~/types/scenario'

export interface StrategyStats {
  strategy: ScenarioStrategy
  count: number
}

/** One scenario the requester has already answered, for the "answered scenarios" list on /me. */
export interface AnsweredScenario {
  id: string
  title: LocalizedText
  topic: ScenarioTopic
}

/** Personal answer-history summary, resolved strictly from the requester's own guest_id. */
export interface PersonalStats {
  totalAnswered: number
  byStrategy: StrategyStats[]
  /** Most recently answered first. */
  answeredScenarios: AnsweredScenario[]
}
