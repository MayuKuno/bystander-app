<template>
  <div>
    <div v-if="pending" class="loading-state">
      <span class="spinner" aria-hidden="true" />
    </div>
    <div v-else-if="!scenario" class="not-found">シナリオが見つかりませんでした。</div>
    <template v-else>
      <h1 class="page-title">シナリオを編集</h1>
      <AdminScenarioForm :initial="scenario" :submitting="submitting" :error="error" @submit="update" />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Scenario } from '~/types/scenario'

definePageMeta({ middleware: 'admin' })

const route = useRoute()
const id = route.params.id as string

const { data: scenario, pending } = await useFetch<Scenario>(`/api/admin/scenarios/${id}`)

const submitting = ref(false)
const error = ref<string | null>(null)

async function update(updated: Scenario) {
  submitting.value = true
  error.value = null
  try {
    await $fetch(`/api/admin/scenarios/${id}`, { method: 'PUT', body: updated })
    await navigateTo('/admin')
  } catch (e) {
    error.value = extractErrorMessage(e)
  } finally {
    submitting.value = false
  }
}
</script>
