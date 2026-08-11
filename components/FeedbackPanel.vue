<template>
  <div
    class="feedback-panel"
    :class="choice.isRecommended ? 'recommended' : 'not-recommended'"
    role="status"
    aria-live="polite"
  >
    <div v-if="showRecommendation || (showStrategy && strategyLabel)" class="feedback-head">
      <template v-if="showRecommendation">
        <svg v-if="choice.isRecommended" class="feedback-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="11" fill="var(--color-success)" />
          <path d="M7 12.5l3 3 7-7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <svg v-else class="feedback-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="11" fill="var(--color-grow)" />
          <path d="M8 13l4-4 4 4M12 9.5V17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </template>
      <div class="feedback-head-text">
        <span v-if="showRecommendation" class="feedback-label">
          {{ choice.isRecommended ? $t('scenario.recommended') : $t('scenario.notRecommended') }}
        </span>
        <span v-if="showStrategy && strategyLabel" class="strategy-chip">{{ strategyLabel }}</span>
      </div>
    </div>
    <p v-if="introText" class="feedback-intro">{{ introText }}</p>
    <p class="feedback-body">{{ overrideBody ?? choice.feedback[locale] }}</p>
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { ScenarioChoice } from '~/types/scenario'

const props = withDefaults(
  defineProps<{
    choice: ScenarioChoice
    overrideBody?: string
    showRecommendation?: boolean
    showStrategy?: boolean
    /** An extra lead line rendered above the feedback body, inside the panel's own tinted frame. */
    introText?: string
  }>(),
  {
    showRecommendation: true,
    showStrategy: true
  }
)
const { locale, t } = useI18n()

const strategyLabel = computed(() => {
  const strategy = props.choice.strategy
  if (!strategy || strategy === 'none') return ''
  return t(`strategy.${strategy}`)
})
</script>
