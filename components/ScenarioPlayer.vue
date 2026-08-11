<template>
  <div class="scenario-detail">
    <div class="situation-box">
      <p class="situation-eyebrow">{{ $t('scenario.synopsis') }}</p>
      <p>{{ scenario.summary[locale] }}</p>
      <p class="situation-your-position">{{ scenario.yourPosition[locale] }}</p>
    </div>

    <div ref="feedbackRef">
      <ScenarioIllustration
        :dialogue1="scenario.dialogue1[locale]"
        :dialogue1-speaker="scenario.dialogue1Speaker[locale]"
        :dialogue2="scenario.dialogue2?.[locale]"
        :dialogue2-speaker="scenario.dialogue2Speaker?.[locale]"
        :dialogue3="scenario.dialogue3?.[locale]"
        :dialogue3-speaker="scenario.dialogue3Speaker?.[locale]"
        :awaiting-choice="!selectedChoiceId"
        :chosen-choice-text="selectedChoice?.text[locale]"
        :chosen-reaction-text="reaction?.reactionText[locale]"
        :chosen-reaction-speaker="reaction?.speakerName[locale]"
      />
    </div>

    <h2 v-if="!selectedChoiceId" class="section-heading">{{ $t('scenario.chooseAction') }}</h2>

    <div v-if="!selectedChoiceId" class="choice-list">
      <ChoiceOption
        v-for="(choice, i) in scenario.choices"
        :key="choice.id"
        :choice="choice"
        :index="i"
        :is-selected="false"
        :has-answered="false"
        :percentage="null"
        @select="selectChoice"
      />
    </div>

    <template v-if="selectedChoice && !freeTextSubmitted">
      <h2 class="section-heading">{{ freeTextPrompt }}</h2>
      <p v-if="reactionExplainText" class="reaction-explain">{{ reactionExplainText }}</p>
      <Transition name="feedback-fade">
        <form class="free-response-form" @submit.prevent="submitFreeResponse">
          <textarea
            v-model="freeText"
            class="free-response-textarea"
            :placeholder="freeTextPlaceholder"
            :aria-label="freeTextPrompt"
          />
          <button type="submit" class="btn btn-primary free-response-submit" :disabled="!freeText.trim() || freeTextSubmitting">
            {{ $t('scenario.submitResponse') }}
          </button>
        </form>
      </Transition>
    </template>

    <Transition name="feedback-fade">
      <div v-if="selectedChoice && freeTextSubmitted" class="feedback-section">
        <div class="answer-recap">
          <p class="answer-recap-label">{{ $t('scenario.yourAnswerLabel') }}</p>
          <p class="answer-recap-text">{{ selectedChoice.text[locale] }}</p>
        </div>
        <FeedbackPanel
          :choice="selectedChoice"
          :override-body="reaction?.explanation?.[locale]"
          :show-recommendation="false"
          :show-strategy="false"
          :intro-text="strategyIntroText"
        >
          <div v-if="votePercentages" class="vote-breakdown">
            <p class="vote-breakdown-title">{{ $t('scenario.voteHint') }}</p>
            <div class="vote-breakdown-list vote-breakdown-list--compact">
              <div
                v-for="(c, i) in scenario.choices"
                :key="c.id"
                class="vote-breakdown-row vote-breakdown-row--compact"
                :class="{ 'vote-breakdown-row--selected': c.id === selectedChoiceId }"
              >
                <span class="vote-breakdown-letter">{{ letters[i] }}</span>
                <span class="vote-breakdown-strategy">{{ strategyLabel(c) }}</span>
                <div class="vote-breakdown-meter">
                  <div class="vote-breakdown-track">
                    <div class="vote-breakdown-fill" :style="{ width: (votePercentages[c.id] ?? 0) + '%' }" />
                  </div>
                  <span class="vote-breakdown-value">{{ votePercentages[c.id] ?? 0 }}%</span>
                </div>
              </div>
            </div>
          </div>
        </FeedbackPanel>

        <div class="answer-recap answer-recap--free">
          <p class="answer-recap-label">{{ $t('scenario.yourFreeResponseLabel') }}</p>
          <p class="answer-recap-text">{{ freeText }}</p>
        </div>
        <AiFeedbackPlaceholder :is-recommended="selectedChoice.isRecommended" />
      </div>
    </Transition>

    <slot name="actions" :can-advance="canAdvance" />
  </div>
</template>

<script setup lang="ts">
import type { ChoiceReaction, ReactionPattern, Scenario, ScenarioChoice, VoteResponse } from '~/types/scenario'

const letters = ['A', 'B', 'C', 'D']

const props = defineProps<{ scenario: Scenario }>()

const { locale, t } = useI18n()

const selectedChoiceId = ref<string | null>(null)
const feedbackRef = ref<HTMLElement | null>(null)
const votePercentages = ref<Record<string, number> | null>(null)
const reaction = ref<ChoiceReaction | null>(null)
const reactionPattern = ref<ReactionPattern | null>(null)
const freeText = ref('')
const freeTextSubmitting = ref(false)
const freeTextSubmitted = ref(false)

watch(
  () => props.scenario.id,
  () => {
    selectedChoiceId.value = null
    votePercentages.value = null
    reaction.value = null
    reactionPattern.value = null
    freeText.value = ''
    freeTextSubmitting.value = false
    freeTextSubmitted.value = false
  }
)

const selectedChoice = computed(() => props.scenario.choices.find((c) => c.id === selectedChoiceId.value))
const canAdvance = computed(() => !!selectedChoiceId.value && freeTextSubmitted.value)

/** Which strategy the picked choice was — drives which free-text prompt to show. */
const freeTextPrompt = computed(() => {
  switch (selectedChoice.value?.strategy) {
    case 'direct':
      return t('scenario.yourNextMove')
    case 'delay':
      return t('scenario.laterFollowUpPrompt')
    case 'distract':
      return t('scenario.reasoningPrompt')
    case 'document':
      return t('scenario.documentPrompt')
    case 'delegate':
      return t('scenario.delegatePrompt')
    default:
      return t('scenario.impressionPrompt')
  }
})

/** For the 'direct' strategy only: explains that the drawn reaction is one of several possible patterns. */
const reactionExplainText = computed(() => {
  if (selectedChoice.value?.strategy !== 'direct' || !reactionPattern.value) return null
  return t(`scenario.reactionExplain.${reactionPattern.value}`)
})

/** Names which of the 5 D's the picked choice was, once answered — omitted for the 'none' (do-nothing) choice. */
const strategyIntroText = computed(() => {
  const strategy = selectedChoice.value?.strategy
  if (!strategy || strategy === 'none') return null
  return t('scenario.strategyIntro', { strategy: t(`strategy.${strategy}`) })
})

const freeTextPlaceholder = computed(() => {
  switch (selectedChoice.value?.strategy) {
    case 'direct':
    case 'delay':
    case 'document':
    case 'delegate':
      return t('scenario.yourNextMovePlaceholder')
    case 'distract':
      return t('scenario.reasoningPlaceholder')
    default:
      return t('scenario.impressionPlaceholder')
  }
})

function strategyLabel(choice: ScenarioChoice): string {
  if (!choice.strategy || choice.strategy === 'none') return '–'
  return t(`strategy.${choice.strategy}`)
}

async function selectChoice(id: string) {
  selectedChoiceId.value = id
  nextTick(() => {
    feedbackRef.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  })

  const res = await $fetch<VoteResponse>(`/api/scenarios/${props.scenario.id}/vote`, {
    method: 'POST',
    body: { choiceId: id }
  })
  votePercentages.value = res.percentages
  reaction.value = res.reaction ?? null
  reactionPattern.value = res.reactionPattern ?? null
}

async function submitFreeResponse() {
  if (!freeText.value.trim() || !selectedChoiceId.value) return

  freeTextSubmitting.value = true
  try {
    await $fetch(`/api/scenarios/${props.scenario.id}/respond`, {
      method: 'POST',
      body: {
        choiceId: selectedChoiceId.value,
        outcomeId: reactionPattern.value ?? undefined,
        responseText: freeText.value.trim()
      }
    })
    freeTextSubmitted.value = true
  } finally {
    freeTextSubmitting.value = false
  }
}
</script>
