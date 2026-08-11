<template>
  <div>
    <div class="admin-header-row">
      <div>
        <h1 class="page-title">シナリオ管理</h1>
        <p class="page-subtitle">{{ scenarios?.length ?? 0 }} 件のシナリオ</p>
      </div>
      <div class="admin-header-actions">
        <NuxtLink to="/admin/new" class="btn btn-primary">+ 新規作成</NuxtLink>
        <button type="button" class="btn btn-secondary" @click="logout">ログアウト</button>
      </div>
    </div>

    <div v-if="pending" class="loading-state">
      <span class="spinner" aria-hidden="true" />
    </div>

    <p v-else-if="!scenarios?.length" class="me-empty">まだシナリオがありません。「+ 新規作成」から追加してください。</p>

    <div v-else class="admin-scenario-list">
      <div v-for="s in scenarios" :key="s.id" class="admin-scenario-row">
        <div class="admin-scenario-row-info">
          <div class="badge-row">
            <span class="badge">{{ $t(`topic.${s.topic}`) }}</span>
            <span class="badge badge-relationship">{{ $t(`relationship.${s.situation}`) }}</span>
          </div>
          <p class="admin-scenario-row-title">{{ s.title.ja }}</p>
          <p class="admin-scenario-row-id">{{ s.id }}</p>
        </div>
        <div class="admin-scenario-row-actions">
          <NuxtLink :to="`/admin/${s.id}`" class="btn btn-secondary">編集</NuxtLink>
          <button type="button" class="btn btn-danger" :disabled="deletingId === s.id" @click="remove(s)">
            {{ deletingId === s.id ? '削除中…' : '削除' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Scenario } from '~/types/scenario'

definePageMeta({ middleware: 'admin' })

const { data: scenarios, pending, refresh } = await useFetch<Scenario[]>('/api/admin/scenarios')
const deletingId = ref<string | null>(null)

async function remove(scenario: Scenario) {
  if (!confirm(`「${scenario.title.ja}」を削除しますか？この操作は取り消せません。`)) return

  deletingId.value = scenario.id
  try {
    await $fetch(`/api/admin/scenarios/${scenario.id}`, { method: 'DELETE' })
    await refresh()
  } finally {
    deletingId.value = null
  }
}

async function logout() {
  await $fetch('/api/admin/logout', { method: 'POST' })
  await navigateTo('/admin/login')
}
</script>
