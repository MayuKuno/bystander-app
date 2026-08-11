<template>
  <div class="home">
    <!-- ヒーローセクション -->
    <section class="hero-bleed">
      <div class="hero-inner">
        <p class="hero-eyebrow">{{ $t('home.heroEyebrow') }}</p>
        <h1 class="hero-title">
          {{ $t('app.titlePre') }}<span class="hero-title-emphasis">{{ $t('app.titleEmphasis') }}</span>{{ $t('app.titlePost') }}
        </h1>
        <p class="hero-text">{{ $t('home.heroText') }}</p>
        <div class="hero-actions">
          <NuxtLink to="/diagnosis" class="btn btn-primary btn-lg">{{ $t('home.ctaExperience') }} →</NuxtLink>
          <a href="#scenario-picker" class="btn btn-secondary btn-lg">{{ $t('home.heroCtaSecondary') }}</a>
        </div>
      </div>
    </section>

    <!-- アクティブバイスタンダーの説明 -->
    <section class="home-section">
      <p class="home-section-eyebrow">{{ $t('home.aboutEyebrow') }}</p>
      <h2 class="home-section-title">{{ $t('home.aboutTitle') }}</h2>
      <p class="home-section-lead">{{ $t('home.aboutLead') }}</p>

      <p class="framework-preview-intro">{{ $t('scenario.frameworkIntro') }}</p>
      <div class="framework-preview">
        <div v-for="s in frameworkStrategies" :key="s" class="framework-preview-card">
          <span class="framework-preview-chip">{{ $t(`strategy.${s}`) }}</span>
          <p class="framework-preview-desc">{{ $t(`home.frameworkPreview.${s}`) }}</p>
        </div>
      </div>
    </section>

    <!-- このロールプレーの意義と使い方 -->
    <section class="home-section home-section--tinted">
      <p class="home-section-eyebrow">{{ $t('home.roleplayEyebrow') }}</p>
      <h2 class="home-section-title">{{ $t('home.roleplayTitle') }}</h2>
      <p class="home-section-lead">{{ $t('home.roleplayLead') }}</p>

      <ol class="how-to-steps">
        <li v-for="(step, i) in howToSteps" :key="step" class="how-to-step">
          <span class="how-to-step-number">{{ i + 1 }}</span>
          <div>
            <p class="how-to-step-title">{{ $t(`home.howTo.${step}.title`) }}</p>
            <p class="how-to-step-body">{{ $t(`home.howTo.${step}.body`) }}</p>
          </div>
        </li>
      </ol>

      <NuxtLink to="/diagnosis" class="btn btn-primary">{{ $t('home.ctaExperience') }} →</NuxtLink>
    </section>

    <!-- シナリオを選ぶ -->
    <section id="scenario-picker" class="home-section">
      <p class="home-section-eyebrow">{{ $t('home.scenarioPickerEyebrow') }}</p>
      <h2 class="home-section-title">{{ $t('home.scenarioPickerTitle') }}</h2>
      <p class="home-section-lead">{{ $t('home.scenarioPickerLead') }}</p>

      <div class="filter-group">
        <button
          type="button"
          class="filter-header"
          :aria-expanded="topicExpanded"
          @click="topicExpanded = !topicExpanded"
        >
          <span class="filter-header-label">
            {{ $t('home.browseByTopic') }}
            <span class="filter-header-value">{{ activeTopic ? $t(`topic.${activeTopic}`) : $t('home.allScenarios') }}</span>
          </span>
          <span class="filter-chevron" :class="{ open: topicExpanded }" aria-hidden="true">▾</span>
        </button>
        <div v-show="topicExpanded" class="filter-chips">
          <button
            type="button"
            class="chip"
            :class="{ active: activeTopic === null }"
            @click="activeTopic = null"
          >
            {{ $t('home.allScenarios') }}
          </button>
          <button
            v-for="t in availableTopics"
            :key="t"
            type="button"
            class="chip"
            :class="{ active: activeTopic === t }"
            @click="toggleTopic(t)"
          >
            {{ $t(`topic.${t}`) }}
          </button>
        </div>
      </div>

      <div class="filter-group">
        <button
          type="button"
          class="filter-header"
          :aria-expanded="relationshipExpanded"
          @click="relationshipExpanded = !relationshipExpanded"
        >
          <span class="filter-header-label">
            {{ $t('home.browseByRelationship') }}
            <span class="filter-header-value">{{ activeRelationship ? $t(`relationship.${activeRelationship}`) : $t('home.allScenarios') }}</span>
          </span>
          <span class="filter-chevron" :class="{ open: relationshipExpanded }" aria-hidden="true">▾</span>
        </button>
        <div v-show="relationshipExpanded" class="filter-chips">
          <button
            type="button"
            class="chip"
            :class="{ active: activeRelationship === null }"
            @click="activeRelationship = null"
          >
            {{ $t('home.allScenarios') }}
          </button>
          <button
            v-for="r in availableRelationships"
            :key="r"
            type="button"
            class="chip"
            :class="{ active: activeRelationship === r }"
            @click="toggleRelationship(r)"
          >
            {{ $t(`relationship.${r}`) }}
          </button>
        </div>
      </div>

      <div v-if="pending" class="loading-state">
        <span class="spinner" aria-hidden="true" />
      </div>
      <div v-else class="scenario-grid">
        <ScenarioCard v-for="s in filteredScenarios" :key="s.id" :scenario="s" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { ScenarioSummary, ScenarioTopic, ScenarioSituation, ScenarioStrategy } from '~/types/scenario'

const { data: scenarios, pending } = await useFetch<ScenarioSummary[]>('/api/scenarios')

const topicOrder: ScenarioTopic[] = [
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
const relationshipOrder: ScenarioSituation[] = ['coworker', 'manager', 'friend', 'family', 'stranger']

/** The 5 D's, in display order — matches the order used in diagnosis.vue's framework legend. */
const frameworkStrategies: ScenarioStrategy[] = ['distract', 'delegate', 'document', 'delay', 'direct']
const howToSteps = ['choose', 'answer', 'reflect'] as const

const activeTopic = ref<ScenarioTopic | null>(null)
const activeRelationship = ref<ScenarioSituation | null>(null)
const topicExpanded = ref(false)
const relationshipExpanded = ref(false)

function toggleTopic(value: ScenarioTopic) {
  activeTopic.value = activeTopic.value === value ? null : value
}

function toggleRelationship(value: ScenarioSituation) {
  activeRelationship.value = activeRelationship.value === value ? null : value
}

const availableTopics = computed(() => {
  if (!scenarios.value) return []
  const present = new Set(scenarios.value.map((s) => s.topic))
  return topicOrder.filter((v) => present.has(v))
})

const availableRelationships = computed(() => {
  if (!scenarios.value) return []
  const present = new Set(scenarios.value.map((s) => s.situation))
  return relationshipOrder.filter((v) => present.has(v))
})

const filteredScenarios = computed(() => {
  if (!scenarios.value) return []
  return scenarios.value.filter(
    (s) =>
      (!activeTopic.value || s.topic === activeTopic.value) &&
      (!activeRelationship.value || s.situation === activeRelationship.value)
  )
})
</script>
