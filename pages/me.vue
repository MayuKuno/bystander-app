<template>
  <div>
    <h1 class="page-title">{{ $t('me.title') }}</h1>
    <p class="page-subtitle">{{ $t('me.subtitle') }}</p>

    <div v-if="pending" class="loading-state">
      <span class="spinner" aria-hidden="true" />
    </div>

    <template v-else-if="stats">
      <div v-if="stats.totalAnswered === 0" class="me-empty">
        {{ $t('me.empty') }}
      </div>

      <template v-else>
        <div class="stat-tile-row">
          <div class="stat-tile">
            <span class="stat-tile-value">{{ stats.totalAnswered }}</span>
            <span class="stat-tile-label">{{ $t('me.totalAnswered') }}</span>
          </div>
        </div>

        <section v-if="stats.byStrategy.length" class="me-section">
          <h2 class="section-heading">{{ $t('me.byStrategy') }}</h2>
          <div class="bar-list">
            <div v-for="row in stats.byStrategy" :key="row.strategy" class="bar-row">
              <span class="bar-row-label">{{ $t(`strategy.${row.strategy}`) }}</span>
              <div class="bar-row-track">
                <div
                  class="bar-row-fill"
                  :style="{ width: (row.count / stats.byStrategy[0].count) * 100 + '%' }"
                />
              </div>
              <span class="bar-row-value">{{ row.count }}</span>
            </div>
          </div>
        </section>

        <section v-if="stats.answeredScenarios.length" class="me-section">
          <h2 class="section-heading">{{ $t('me.answeredScenarios') }}</h2>
          <ul class="answered-list">
            <li v-for="scenario in stats.answeredScenarios" :key="scenario.id" class="answered-item">
              <div class="answered-item-info">
                <span class="badge">{{ $t(`topic.${scenario.topic}`) }}</span>
                <span class="answered-item-title">{{ scenario.title[locale] }}</span>
              </div>
              <NuxtLink :to="`/scenario/${scenario.id}`" class="answered-item-link">
                {{ $t('me.retry') }} →
              </NuxtLink>
            </li>
          </ul>
        </section>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { PersonalStats } from '~/types/analytics'

const { locale } = useI18n()
const { data: stats, pending } = await useFetch<PersonalStats>('/api/me/stats')
</script>
