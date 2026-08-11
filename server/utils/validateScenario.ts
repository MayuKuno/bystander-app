import type { Scenario } from '~/types/scenario'

/** Both fields non-empty — the admin form always submits both languages together. */
function isLocalizedText(value: unknown): value is { ja: string; en: string } {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return typeof v.ja === 'string' && v.ja.trim().length > 0 && typeof v.en === 'string' && v.en.trim().length > 0
}

/**
 * Structural validation only — this is the actual data-integrity boundary
 * (the admin form enforces the same shape client-side, but that's just UX).
 * Mirrors the layout documented in CLAUDE.md: exactly 4 choices, choices[0]
 * is always 'none'. Any of choices[1..3] may freely be 'direct' (or not —
 * a scenario doesn't have to have one) — but whichever choice is 'direct'
 * must have `reactions` with all 3 patterns (no partial sets), and no
 * other choice may have `reactions` at all.
 */
export function validateScenarioInput(input: unknown): string | null {
  if (!input || typeof input !== 'object') return 'Invalid scenario payload'
  const s = input as Partial<Scenario>

  if (!s.id || !/^[a-z0-9-]+$/.test(s.id)) return 'id is required and must be lowercase-kebab-case'
  if (!s.topic) return 'topic is required'
  if (!s.situation) return 'situation is required'
  if (!isLocalizedText(s.title)) return 'title requires both ja and en'
  if (!isLocalizedText(s.summary)) return 'summary requires both ja and en'
  if (!isLocalizedText(s.yourPosition)) return 'yourPosition requires both ja and en'
  if (!isLocalizedText(s.dialogue1)) return 'dialogue1 requires both ja and en'
  if (!isLocalizedText(s.dialogue1Speaker)) return 'dialogue1Speaker requires both ja and en'

  if (s.dialogue2 && !isLocalizedText(s.dialogue2)) return 'dialogue2, if set, requires both ja and en'
  if (s.dialogue2 && !isLocalizedText(s.dialogue2Speaker)) return 'dialogue2Speaker is required when dialogue2 is set'
  if (s.dialogue3 && !isLocalizedText(s.dialogue3)) return 'dialogue3, if set, requires both ja and en'
  if (s.dialogue3 && !isLocalizedText(s.dialogue3Speaker)) return 'dialogue3Speaker is required when dialogue3 is set'

  if (!Array.isArray(s.choices) || s.choices.length !== 4) return 'choices must have exactly 4 entries'

  for (const [i, choice] of s.choices.entries()) {
    if (!choice.id || !/^[a-z0-9-]+$/.test(choice.id)) return `choices[${i}].id is required and must be lowercase-kebab-case`
    if (!isLocalizedText(choice.text)) return `choices[${i}].text requires both ja and en`
    if (!isLocalizedText(choice.feedback)) return `choices[${i}].feedback requires both ja and en`
    if (typeof choice.isRecommended !== 'boolean') return `choices[${i}].isRecommended must be true/false`
  }

  if (s.choices[0].strategy !== 'none') return 'choices[0] must be the "none" (do-nothing) option'
  const selectableStrategies = ['distract', 'delegate', 'document', 'delay', 'direct']
  for (const i of [1, 2, 3] as const) {
    if (!selectableStrategies.includes(s.choices[i].strategy ?? '')) {
      return `choices[${i}].strategy must be one of distract/delegate/document/delay/direct`
    }
  }

  const patterns = ['defensive', 'confused', 'reflective'] as const
  for (const [i, choice] of s.choices.entries()) {
    if (choice.strategy === 'direct') {
      if (!choice.reactions) return `choices[${i}].reactions is required — a "direct" choice must have all 3 reaction patterns`
      for (const pattern of patterns) {
        const reaction = choice.reactions[pattern]
        if (!reaction) return `choices[${i}].reactions.${pattern} is required once the choice is "direct"`
        if (!isLocalizedText(reaction.speakerName)) return `choices[${i}].reactions.${pattern}.speakerName requires both ja and en`
        if (!isLocalizedText(reaction.reactionText)) return `choices[${i}].reactions.${pattern}.reactionText requires both ja and en`
        if (!isLocalizedText(reaction.explanation)) return `choices[${i}].reactions.${pattern}.explanation requires both ja and en`
      }
    } else if (choice.reactions) {
      return `choices[${i}].reactions is only valid on a "direct" choice`
    }
  }

  const ids = new Set(s.choices.map((c) => c.id))
  if (ids.size !== 4) return 'choice ids must be unique within a scenario'

  return null
}
