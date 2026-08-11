<template>
  <div>
    <h1 class="page-title">シナリオを新規作成</h1>
    <AdminScenarioForm :submitting="submitting" :error="error" @submit="create" />
  </div>
</template>

<script setup lang="ts">
import type { Scenario } from '~/types/scenario'

definePageMeta({ middleware: 'admin' })

const submitting = ref(false)
const error = ref<string | null>(null)

async function create(scenario: Scenario) {
  submitting.value = true
  error.value = null
  try {
    await $fetch('/api/admin/scenarios', { method: 'POST', body: scenario })
    await navigateTo('/admin')
  } catch (e) {
    error.value = extractErrorMessage(e)
  } finally {
    submitting.value = false
  }
}
</script>
