<template>
  <div>
    <div v-if="pending" class="loading-state">
      <span class="spinner" aria-hidden="true" />
    </div>

    <template v-else-if="scenario">
      <div class="badge-row">
        <span class="badge">{{ $t(`topic.${scenario.topic}`) }}</span>
        <span class="badge badge-relationship">{{ $t(`relationship.${scenario.situation}`) }}</span>
      </div>
      <h1 class="page-title">{{ scenario.title[locale] }}</h1>

      <ScenarioPlayer :scenario="scenario">
        <template #actions="{ canAdvance }">
          <div v-if="canAdvance" class="post-answer-actions">
            <NuxtLink v-if="nextScenarioId" :to="`/scenario/${nextScenarioId}`" class="btn btn-primary">
              {{ $t('scenario.nextScenario') }} →
            </NuxtLink>
            <NuxtLink to="/" class="btn btn-secondary">← {{ $t('scenario.backToList') }}</NuxtLink>
          </div>
        </template>
      </ScenarioPlayer>

      <NuxtLink to="/" class="back-link">← {{ $t('scenario.backToList') }}</NuxtLink>
    </template>

    <div v-else class="not-found">
      <p>Scenario not found.</p>
      <NuxtLink to="/" class="back-link">← {{ $t('scenario.backToList') }}</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Scenario, ScenarioSummary } from '~/types/scenario'

const route = useRoute()
const { locale } = useI18n()
const scenarioId = route.params.id as string

const { data: scenario, pending } = await useFetch<Scenario>(`/api/scenarios/${scenarioId}`)
const { data: allScenarios } = await useFetch<ScenarioSummary[]>('/api/scenarios')

const nextScenarioId = computed(() => {
  const list = allScenarios.value
  if (!list || !scenario.value) return null
  const currentIndex = list.findIndex((s) => s.id === scenario.value!.id)
  if (currentIndex === -1 || currentIndex === list.length - 1) return null
  return list[currentIndex + 1].id
})
</script>
