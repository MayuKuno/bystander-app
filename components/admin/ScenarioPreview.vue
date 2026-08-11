<template>
  <div class="admin-preview">
    <div class="admin-preview-header">
      <p class="admin-form-note">実際のシナリオ画面と同じ見た目でプレビューします（未保存の内容も反映されます）</p>
      <div class="locale-switch" role="group" aria-label="Preview language">
        <button type="button" :class="{ active: previewLocale === 'ja' }" @click="previewLocale = 'ja'">日本語</button>
        <button type="button" :class="{ active: previewLocale === 'en' }" @click="previewLocale = 'en'">English</button>
      </div>
    </div>

    <div class="situation-box">
      <p class="situation-eyebrow">あらすじ</p>
      <p>{{ scenario.summary[previewLocale] || '（未入力）' }}</p>
      <p class="situation-your-position">{{ scenario.yourPosition[previewLocale] || '（未入力）' }}</p>
    </div>

    <ScenarioIllustration
      :dialogue1="scenario.dialogue1[previewLocale] || '（未入力）'"
      :dialogue1-speaker="scenario.dialogue1Speaker[previewLocale] || '（未入力）'"
      :dialogue2="scenario.dialogue2?.[previewLocale]"
      :dialogue2-speaker="scenario.dialogue2Speaker?.[previewLocale]"
      :dialogue3="scenario.dialogue3?.[previewLocale]"
      :dialogue3-speaker="scenario.dialogue3Speaker?.[previewLocale]"
      :awaiting-choice="selectedIndex === null"
      :chosen-choice-text="selectedChoice?.text[previewLocale]"
      :chosen-reaction-text="reaction?.reactionText[previewLocale]"
      :chosen-reaction-speaker="reaction?.speakerName[previewLocale]"
    />

    <div v-if="selectedIndex === null" class="choice-list">
      <button v-for="(choice, i) in scenario.choices" :key="i" type="button" class="choice-button" @click="selectChoice(i)">
        <span class="choice-content">
          <span class="choice-marker">{{ letters[i] }}</span>
          <span class="choice-text">{{ choice.text[previewLocale] || '（未入力）' }}</span>
        </span>
      </button>
    </div>

    <template v-else-if="selectedChoice">
      <div v-if="selectedChoice.reactions" class="admin-preview-pattern-tabs">
        <button
          v-for="p in reactionPatterns"
          :key="p"
          type="button"
          class="chip"
          :class="{ active: selectedPattern === p }"
          @click="selectedPattern = p"
        >
          {{ reactionLabels[p] }}
        </button>
      </div>

      <div class="feedback-section">
        <div class="answer-recap">
          <p class="answer-recap-label">あなたの回答</p>
          <p class="answer-recap-text">{{ selectedChoice.text[previewLocale] || '（未入力）' }}</p>
        </div>
        <FeedbackPanel
          :choice="selectedChoice"
          :override-body="reaction?.explanation?.[previewLocale]"
          :show-recommendation="false"
          :show-strategy="false"
        />
      </div>

      <button type="button" class="btn btn-secondary admin-preview-reset" @click="reset">← 選択肢に戻る</button>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ReactionPattern, Scenario } from '~/types/scenario'

const props = defineProps<{ scenario: Scenario }>()

const letters = ['A', 'B', 'C', 'D']
const reactionPatterns: ReactionPattern[] = ['defensive', 'confused', 'reflective']
const reactionLabels: Record<ReactionPattern, string> = {
  defensive: 'ディフェンシブ',
  confused: 'CONFUSED',
  reflective: 'REFLECTIVE'
}

const previewLocale = ref<'ja' | 'en'>('ja')
const selectedIndex = ref<number | null>(null)
const selectedPattern = ref<ReactionPattern | null>(null)

const selectedChoice = computed(() => (selectedIndex.value !== null ? props.scenario.choices[selectedIndex.value] : undefined))
const reaction = computed(() => {
  if (!selectedChoice.value?.reactions || !selectedPattern.value) return undefined
  return selectedChoice.value.reactions[selectedPattern.value]
})

watch(
  () => props.scenario.id,
  () => reset()
)

function selectChoice(i: number) {
  selectedIndex.value = i
  const choice = props.scenario.choices[i]
  selectedPattern.value = choice.reactions ? 'defensive' : null
}

function reset() {
  selectedIndex.value = null
  selectedPattern.value = null
}
</script>
