import type { ChoiceReaction, ReactionPattern } from '~/types/scenario'

/** Draws one of the reaction patterns at random (uniformly). */
export function pickReaction(
  reactions: Record<ReactionPattern, ChoiceReaction>
): { pattern: ReactionPattern; reaction: ChoiceReaction } {
  const entries = Object.entries(reactions) as [ReactionPattern, ChoiceReaction][]
  const [pattern, reaction] = entries[Math.floor(Math.random() * entries.length)]
  return { pattern, reaction }
}
