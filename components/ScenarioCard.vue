<template>
  <NuxtLink :to="`/scenario/${scenario.id}`" class="scenario-card">
    <div class="badge-row">
      <span class="badge">{{ $t(`topic.${scenario.topic}`) }}</span>
      <span class="badge badge-relationship">{{ $t(`relationship.${scenario.situation}`) }}</span>
    </div>
    <h3>{{ scenario.title[locale] }}</h3>
    <p>{{ truncate(scenario.summary[locale]) }}</p>
    <span class="scenario-card-cta" aria-hidden="true">→</span>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { ScenarioSummary } from '~/types/scenario'

const props = defineProps<{ scenario: ScenarioSummary }>()
const { locale } = useI18n()

function truncate(text: string, max = 80) {
  return text.length > max ? `${text.slice(0, max)}…` : text
}
</script>
