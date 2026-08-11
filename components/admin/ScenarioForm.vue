<template>
  <div>
    <div class="admin-mode-toggle">
      <button type="button" class="btn" :class="mode === 'edit' ? 'btn-primary' : 'btn-secondary'" @click="mode = 'edit'">編集</button>
      <button type="button" class="btn" :class="mode === 'preview' ? 'btn-primary' : 'btn-secondary'" @click="mode = 'preview'">プレビュー</button>
    </div>

    <ScenarioPreview v-if="mode === 'preview'" :scenario="form" />

    <div v-show="mode === 'edit'" class="admin-form">
    <section class="admin-form-section">
      <h2 class="admin-form-section-title">基本情報</h2>

      <label class="admin-field">
        <span class="admin-field-label">ID（URLに使われるスラッグ。半角小文字・数字・ハイフンのみ）</span>
        <input v-model="form.id" class="admin-input" :disabled="!isNew" placeholder="e.g. partner-gender-assumption" />
      </label>

      <div class="admin-field-row">
        <label class="admin-field">
          <span class="admin-field-label">トピック</span>
          <select v-model="form.topic" class="admin-input">
            <option v-for="t in topicOptions" :key="t" :value="t">{{ $t(`topic.${t}`) }}</option>
          </select>
        </label>
        <label class="admin-field">
          <span class="admin-field-label">シチュエーション</span>
          <select v-model="form.situation" class="admin-input">
            <option v-for="r in situationOptions" :key="r" :value="r">{{ $t(`relationship.${r}`) }}</option>
          </select>
        </label>
      </div>
    </section>

    <section class="admin-form-section">
      <h2 class="admin-form-section-title">タイトル・あらすじ</h2>
      <LocalizedField v-model="form.title" label="タイトル" />
      <LocalizedField v-model="form.summary" label="あらすじ" textarea />
      <LocalizedField v-model="form.yourPosition" label="あなたの立場" textarea />
    </section>

    <section class="admin-form-section">
      <h2 class="admin-form-section-title">セリフ</h2>

      <p class="admin-form-note">セリフ１（問題発言・必須）</p>
      <div class="admin-field-row">
        <LocalizedField v-model="form.dialogue1Speaker" label="話者" />
      </div>
      <LocalizedField v-model="form.dialogue1" label="セリフ" textarea />

      <label class="admin-checkbox">
        <input type="checkbox" :checked="!!form.dialogue2" @change="toggleDialogue(2, ($event.target as HTMLInputElement).checked)" />
        セリフ２（周囲の反応）を追加する
      </label>
      <template v-if="form.dialogue2">
        <LocalizedField v-model="form.dialogue2Speaker!" label="話者" />
        <LocalizedField v-model="form.dialogue2!" label="セリフ" textarea />
      </template>

      <label class="admin-checkbox">
        <input type="checkbox" :checked="!!form.dialogue3" @change="toggleDialogue(3, ($event.target as HTMLInputElement).checked)" />
        セリフ３（当事者の反応）を追加する
      </label>
      <template v-if="form.dialogue3">
        <LocalizedField v-model="form.dialogue3Speaker!" label="話者" />
        <LocalizedField v-model="form.dialogue3!" label="セリフ" textarea />
      </template>
    </section>

    <section v-for="(choice, i) in form.choices" :key="i" class="admin-form-section">
      <h2 class="admin-form-section-title">選択肢{{ i + 1 }}{{ i === 0 ? '（何もしない・固定）' : '' }}</h2>

      <LocalizedField v-model="choice.text" label="選択肢のテキスト" textarea />
      <LocalizedField v-model="choice.feedback" label="フィードバック" textarea />

      <div class="admin-field-row">
        <label class="admin-field">
          <span class="admin-field-label">5つのD</span>
          <select
            :value="choice.strategy"
            class="admin-input"
            :disabled="i === 0"
            @change="onStrategyChange(choice, ($event.target as HTMLSelectElement).value)"
          >
            <option v-if="i === 0" value="none">none（何もしない）</option>
            <template v-else>
              <option v-for="strat in selectableStrategies" :key="strat" :value="strat">{{ $t(`strategy.${strat}`) }}</option>
            </template>
          </select>
        </label>
        <label class="admin-checkbox admin-checkbox--inline">
          <input v-model="choice.isRecommended" type="checkbox" :disabled="i === 0" />
          推奨される選択肢
        </label>
      </div>

      <template v-if="choice.strategy === 'direct' && choice.reactions">
        <p class="admin-form-note">「その場で伝える」を選んだ場合、相手のリアクション（3パターン）は必須です</p>

        <div class="admin-reactions">
          <div v-for="pattern in reactionPatterns" :key="pattern" class="admin-reaction-block">
            <h3 class="admin-reaction-title">{{ reactionLabels[pattern] }}</h3>
            <LocalizedField v-model="choice.reactions[pattern].speakerName" label="話者" />
            <LocalizedField v-model="choice.reactions[pattern].reactionText" label="リアクション" textarea />
            <LocalizedField v-model="choice.reactions[pattern].explanation" label="解説" textarea />
          </div>
        </div>
      </template>
    </section>
    </div>

    <p v-if="error" class="admin-error">{{ error }}</p>

    <div class="admin-form-actions">
      <button type="button" class="btn btn-primary" :disabled="submitting" @click="submit">{{ submitting ? '保存中…' : '保存する' }}</button>
      <NuxtLink to="/admin" class="btn btn-secondary">キャンセル</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChoiceReaction, LocalizedText, ReactionPattern, Scenario, ScenarioChoice, ScenarioSituation, ScenarioStrategy, ScenarioTopic } from '~/types/scenario'
import LocalizedField from './LocalizedField.vue'
import ScenarioPreview from './ScenarioPreview.vue'

const props = defineProps<{
  initial?: Scenario
  submitting?: boolean
  error?: string | null
}>()

const emit = defineEmits<{ submit: [scenario: Scenario] }>()

const isNew = !props.initial
const mode = ref<'edit' | 'preview'>('edit')

const topicOptions: ScenarioTopic[] = [
  'lgbtq',
  'disability',
  'race',
  'gender',
  'age',
  'religion',
  'nationality',
  'appearance',
  'mental_health',
  'pregnancy_parenting',
  'socioeconomic_class'
]
const situationOptions: ScenarioSituation[] = ['coworker', 'manager', 'friend', 'family', 'stranger']
/** Selectable for choices[1..3] — 'direct' is just one option among these now, not locked to a fixed slot. */
const selectableStrategies: ScenarioStrategy[] = ['distract', 'delegate', 'document', 'delay', 'direct']
const reactionPatterns: ReactionPattern[] = ['defensive', 'confused', 'reflective']
const reactionLabels: Record<ReactionPattern, string> = {
  defensive: 'ディフェンシブ（防御的）',
  confused: 'CONFUSED（戸惑い）',
  reflective: 'REFLECTIVE（受け止める）'
}

function emptyLocalized(): LocalizedText {
  return { ja: '', en: '' }
}

function emptyReaction(): ChoiceReaction {
  return { speakerName: emptyLocalized(), reactionText: emptyLocalized(), explanation: emptyLocalized() }
}

function blankScenario(): Scenario {
  return {
    id: '',
    topic: 'lgbtq',
    situation: 'coworker',
    title: emptyLocalized(),
    summary: emptyLocalized(),
    yourPosition: emptyLocalized(),
    dialogue1: emptyLocalized(),
    dialogue1Speaker: emptyLocalized(),
    choices: [
      { id: '', text: emptyLocalized(), feedback: emptyLocalized(), isRecommended: false, strategy: 'none' },
      { id: '', text: emptyLocalized(), feedback: emptyLocalized(), isRecommended: true, strategy: 'distract' },
      { id: '', text: emptyLocalized(), feedback: emptyLocalized(), isRecommended: true, strategy: 'delegate' },
      { id: '', text: emptyLocalized(), feedback: emptyLocalized(), isRecommended: true, strategy: 'document' }
    ]
  }
}

const form = reactive<Scenario>(props.initial ? structuredClone(toRaw(props.initial)) : blankScenario())

function toggleDialogue(n: 2 | 3, on: boolean) {
  if (n === 2) {
    form.dialogue2 = on ? emptyLocalized() : undefined
    form.dialogue2Speaker = on ? emptyLocalized() : undefined
  } else {
    form.dialogue3 = on ? emptyLocalized() : undefined
    form.dialogue3Speaker = on ? emptyLocalized() : undefined
  }
}

/** Reactions are only ever valid on a 'direct' choice — auto-add/remove them as the strategy changes, since they're required whenever 'direct' is picked, not optional. */
function onStrategyChange(choice: ScenarioChoice, value: string) {
  choice.strategy = value as ScenarioStrategy
  choice.reactions =
    choice.strategy === 'direct' ? (choice.reactions ?? { defensive: emptyReaction(), confused: emptyReaction(), reflective: emptyReaction() }) : undefined
}

function submit() {
  const scenario: Scenario = structuredClone(toRaw(form))
  // Choice ids are just internal keys (votes reference them, but nothing user-facing
  // does) — auto-assign by position instead of making the admin type a slug per choice.
  // Existing choices (edit mode) already have an id from `initial` and keep it, so
  // past votes tied to that id stay valid.
  scenario.choices.forEach((choice: ScenarioChoice, i: number) => {
    if (!choice.id) choice.id = `choice-${i + 1}`
  })
  emit('submit', scenario)
}
</script>
