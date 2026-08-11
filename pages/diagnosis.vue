<template>
  <div>
    <template v-if="!started">
      <div class="diagnosis-intro">
        <h1 class="page-title">{{ $t('diagnosis.intro.title') }}</h1>
        <p class="diagnosis-intro-lead">{{ $t('diagnosis.intro.lead') }}</p>
        <p>{{ $t('diagnosis.intro.purpose') }}</p>
        <p class="diagnosis-intro-emphasis">{{ $t('diagnosis.intro.emphasis') }}</p>
        <div class="post-answer-actions">
          <button type="button" class="btn btn-primary" @click="started = true">
            {{ $t('diagnosis.intro.start') }} →
          </button>
          <NuxtLink to="/" class="btn btn-secondary">← {{ $t('scenario.backToList') }}</NuxtLink>
        </div>
      </div>
    </template>

    <template v-else-if="!finished">
      <div class="diagnosis-progress">
        <span class="diagnosis-progress-label">
          {{ $t('diagnosis.progress', { current: currentIndex + 1, total: quizLength }) }}
        </span>
        <div class="diagnosis-progress-track">
          <div class="diagnosis-progress-fill" :style="{ width: progressPercent + '%' }" />
        </div>
      </div>
      <NuxtLink to="/" class="diagnosis-exit-link">{{ $t('diagnosis.exit') }}</NuxtLink>

      <div v-if="scenarioPending || !currentScenario" class="loading-state">
        <span class="spinner" aria-hidden="true" />
      </div>

      <div v-else class="scenario-detail">
        <div class="situation-box">
          <p class="situation-eyebrow">{{ $t('scenario.synopsis') }}</p>
          <p>{{ currentScenario.summary[locale] }}</p>
          <p class="situation-your-position">{{ currentScenario.yourPosition[locale] }}</p>
        </div>

        <ScenarioIllustration
          :dialogue1="currentScenario.dialogue1[locale]"
          :dialogue1-speaker="currentScenario.dialogue1Speaker[locale]"
          :dialogue2="currentScenario.dialogue2?.[locale]"
          :dialogue2-speaker="currentScenario.dialogue2Speaker?.[locale]"
          :dialogue3="currentScenario.dialogue3?.[locale]"
          :dialogue3-speaker="currentScenario.dialogue3Speaker?.[locale]"
          :awaiting-choice="!selectedChoiceId"
          :chosen-choice-text="selectedChoice?.text[locale]"
          :chosen-reaction-text="currentAnswer?.reaction?.reactionText[locale]"
          :chosen-reaction-speaker="currentAnswer?.reaction?.speakerName[locale]"
        />

        <h2 v-if="!selectedChoiceId" class="section-heading">{{ $t('scenario.chooseAction') }}</h2>

        <div v-if="!selectedChoiceId" class="choice-list">
          <ChoiceOption
            v-for="(choice, i) in currentScenario.choices"
            :key="choice.id"
            :choice="choice"
            :index="i"
            :is-selected="false"
            :has-answered="false"
            :percentage="null"
            @select="selectChoice"
          />
        </div>

        <template v-if="currentAnswer">
          <h2 class="section-heading">{{ freeTextPrompt(currentAnswer) }}</h2>
          <p v-if="reactionExplainText(currentAnswer)" class="reaction-explain">{{ reactionExplainText(currentAnswer) }}</p>
          <form class="free-response-form" @submit.prevent="submitAndAdvance(currentAnswer)">
            <textarea
              v-model="currentAnswer.freeText"
              class="free-response-textarea"
              :placeholder="freeTextPlaceholder(currentAnswer)"
              :aria-label="freeTextPrompt(currentAnswer)"
            />
            <button
              type="submit"
              class="btn btn-primary free-response-submit"
              :disabled="!currentAnswer.freeText.trim() || currentAnswer.freeTextSubmitting"
            >
              {{ isLastQuestion ? $t('diagnosis.seeResult') : $t('diagnosis.next') }} →
            </button>
          </form>
        </template>
      </div>
    </template>

    <div v-else class="diagnosis-result">
      <h1 class="page-title">{{ $t('diagnosis.resultTitle') }}</h1>
      <p class="page-subtitle">{{ $t('diagnosis.resultIntro') }}</p>

      <div class="diagnosis-framework">
        <h2 class="section-heading">{{ $t('scenario.framework') }}</h2>
        <p class="diagnosis-framework-intro">{{ $t('scenario.frameworkIntro') }}</p>
        <div class="diagnosis-framework-legend">
          <span v-for="s in frameworkStrategies" :key="s" class="strategy-chip">{{ $t(`strategy.${s}`) }}</span>
        </div>
      </div>

      <div class="diagnosis-review-list">
        <div v-for="answer in answers" :key="answer.scenario.id" class="diagnosis-review-item">
          <div class="badge-row">
            <span class="badge">{{ $t(`topic.${answer.scenario.topic}`) }}</span>
          </div>
          <h3 class="diagnosis-review-title">{{ answer.scenario.title[locale] }}</h3>

          <div class="answer-recap">
            <p class="answer-recap-label">{{ $t('scenario.yourAnswerLabel') }}</p>
            <p class="answer-recap-text">{{ answer.choice.text[locale] }}</p>
          </div>

          <FeedbackPanel
            :choice="answer.choice"
            :override-body="answer.reaction?.explanation?.[locale]"
            :show-recommendation="false"
            :show-strategy="false"
            :intro-text="strategyIntroText(answer.choice)"
          >
            <div class="vote-breakdown">
              <p class="vote-breakdown-title">{{ $t('scenario.voteHint') }}</p>
              <div class="vote-breakdown-list vote-breakdown-list--compact">
                <div
                  v-for="(c, i) in answer.scenario.choices"
                  :key="c.id"
                  class="vote-breakdown-row vote-breakdown-row--compact"
                  :class="{ 'vote-breakdown-row--selected': c.id === answer.choice.id }"
                >
                  <span class="vote-breakdown-letter">{{ letters[i] }}</span>
                  <span class="vote-breakdown-strategy">{{ strategyLabel(c) }}</span>
                  <div class="vote-breakdown-meter">
                    <div class="vote-breakdown-track">
                      <div class="vote-breakdown-fill" :style="{ width: (answer.votePercentages[c.id] ?? 0) + '%' }" />
                    </div>
                    <span class="vote-breakdown-value">{{ answer.votePercentages[c.id] ?? 0 }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </FeedbackPanel>

          <div class="answer-recap answer-recap--free">
            <p class="answer-recap-label">{{ $t('scenario.yourFreeResponseLabel') }}</p>
            <p class="answer-recap-text">{{ answer.freeText }}</p>
          </div>
          <AiFeedbackPlaceholder :is-recommended="answer.choice.isRecommended" />
        </div>
      </div>

      <p v-if="topStrategy" class="diagnosis-result-badge">
        {{ $t('diagnosis.resultBadge', { strategy: $t(`strategy.${topStrategy}`) }) }}
      </p>

      <div v-if="resultStrategy.length" class="bar-list">
        <div v-for="row in resultStrategy" :key="row.strategy" class="bar-row">
          <span class="bar-row-label">{{ $t(`strategy.${row.strategy}`) }}</span>
          <div class="bar-row-track">
            <div class="bar-row-fill" :style="{ width: (row.count / resultStrategy[0].count) * 100 + '%' }" />
          </div>
          <span class="bar-row-value">{{ row.count }}</span>
        </div>
      </div>
      <p v-else class="me-empty">{{ $t('diagnosis.resultEmpty') }}</p>

      <div class="post-answer-actions">
        <NuxtLink to="/me" class="btn btn-primary">{{ $t('diagnosis.viewFullTrends') }} →</NuxtLink>
        <NuxtLink to="/" class="btn btn-secondary">← {{ $t('scenario.backToList') }}</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChoiceReaction, ReactionPattern, Scenario, ScenarioChoice, ScenarioStrategy, ScenarioSummary, VoteResponse } from '~/types/scenario'

/** Target quiz length — capped to however many scenarios actually exist, so a small content set doesn't leave the quiz stuck fetching questions that don't exist. */
const MAX_QUIZ_LENGTH = 5
const letters = ['A', 'B', 'C', 'D']
/** The 5 D's, in display order — `'none'` is deliberately excluded, it isn't one of them. */
const frameworkStrategies: ScenarioStrategy[] = ['distract', 'delegate', 'document', 'delay', 'direct']

interface AnsweredQuestion {
  scenario: Scenario
  choice: ScenarioChoice
  votePercentages: Record<string, number>
  reaction: ChoiceReaction | null
  reactionPattern: ReactionPattern | null
  freeText: string
  freeTextSubmitting: boolean
}

const { locale, t } = useI18n()
const { data: allScenarios } = await useFetch<ScenarioSummary[]>('/api/scenarios')

const started = ref(false)
const quizIds = ref<string[]>([])
const currentIndex = ref(0)
const currentScenario = ref<Scenario | null>(null)
const scenarioPending = ref(true)
const selectedChoiceId = ref<string | null>(null)
const currentAnswer = ref<AnsweredQuestion | null>(null)
const answers = ref<AnsweredQuestion[]>([])

const quizLength = computed(() => Math.min(MAX_QUIZ_LENGTH, allScenarios.value?.length ?? MAX_QUIZ_LENGTH))
const finished = computed(() => currentIndex.value >= quizLength.value)
const isLastQuestion = computed(() => currentIndex.value === quizLength.value - 1)
const progressPercent = computed(() => (answers.value.length / quizLength.value) * 100)
const selectedChoice = computed(() => currentScenario.value?.choices.find((c) => c.id === selectedChoiceId.value))

async function loadStep() {
  const id = quizIds.value[currentIndex.value]
  if (!id) return
  scenarioPending.value = true
  selectedChoiceId.value = null
  currentAnswer.value = null
  currentScenario.value = await $fetch<Scenario>(`/api/scenarios/${id}`)
  scenarioPending.value = false
}

watch(started, async (value) => {
  if (!value) return
  const pool = allScenarios.value ?? []
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  quizIds.value = shuffled.slice(0, MAX_QUIZ_LENGTH).map((s) => s.id)
  await loadStep()
})

async function selectChoice(choiceId: string) {
  if (!currentScenario.value) return
  const choice = currentScenario.value.choices.find((c) => c.id === choiceId)
  if (!choice) return

  selectedChoiceId.value = choiceId

  const res = await $fetch<VoteResponse>(`/api/scenarios/${currentScenario.value.id}/vote`, {
    method: 'POST',
    body: { choiceId }
  })

  const answer: AnsweredQuestion = {
    scenario: currentScenario.value,
    choice,
    votePercentages: res.percentages,
    reaction: res.reaction ?? null,
    reactionPattern: res.reactionPattern ?? null,
    freeText: '',
    freeTextSubmitting: false
  }
  currentAnswer.value = answer
  answers.value.push(answer)
}

async function goNext() {
  currentIndex.value += 1
  if (currentIndex.value < quizLength.value) {
    await loadStep()
  }
}

/** Which strategy this answer's choice was — drives which free-text prompt to show. */
function freeTextPrompt(answer: AnsweredQuestion): string {
  switch (answer.choice.strategy) {
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
}

/** For the 'direct' strategy only: explains that the drawn reaction is one of several possible patterns. */
function reactionExplainText(answer: AnsweredQuestion): string | null {
  if (answer.choice.strategy !== 'direct' || !answer.reactionPattern) return null
  return t(`scenario.reactionExplain.${answer.reactionPattern}`)
}

function freeTextPlaceholder(answer: AnsweredQuestion): string {
  switch (answer.choice.strategy) {
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
}

function strategyLabel(choice: ScenarioChoice): string {
  if (!choice.strategy || choice.strategy === 'none') return '–'
  return t(`strategy.${choice.strategy}`)
}

/** Names which of the 5 D's the picked choice was — omitted for the 'none' (do-nothing) choice. Matches ScenarioPlayer's per-answer feedback so the review list reads the same. */
function strategyIntroText(choice: ScenarioChoice): string | null {
  if (!choice.strategy || choice.strategy === 'none') return null
  return t('scenario.strategyIntro', { strategy: t(`strategy.${choice.strategy}`) })
}

/** Submits the free-text response and immediately advances — one action, not two. */
async function submitAndAdvance(answer: AnsweredQuestion) {
  if (!answer.freeText.trim()) return

  answer.freeTextSubmitting = true
  try {
    await $fetch(`/api/scenarios/${answer.scenario.id}/respond`, {
      method: 'POST',
      body: {
        choiceId: answer.choice.id,
        outcomeId: answer.reactionPattern ?? undefined,
        responseText: answer.freeText.trim()
      }
    })
    await goNext()
  } finally {
    answer.freeTextSubmitting = false
  }
}

const resultStrategy = computed(() => {
  const counts = new Map<ScenarioStrategy, number>()
  for (const answer of answers.value) {
    const strategy = answer.choice.strategy ?? 'none'
    if (strategy === 'none') continue
    counts.set(strategy, (counts.get(strategy) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([strategy, count]) => ({ strategy, count }))
    .sort((a, b) => b.count - a.count)
})

const topStrategy = computed(() => resultStrategy.value[0]?.strategy ?? null)
</script>
