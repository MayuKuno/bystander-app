<template>
  <div class="admin-login">
    <h1 class="page-title">管理画面ログイン</h1>
    <p class="page-subtitle">シナリオを管理するには、管理者パスワードを入力してください。</p>

    <form class="admin-login-form" @submit.prevent="submit">
      <label class="admin-field">
        <span class="admin-field-label">パスワード</span>
        <input v-model="password" type="password" class="admin-input" autofocus autocomplete="current-password" />
      </label>
      <p v-if="error" class="admin-error">{{ error }}</p>
      <button type="submit" class="btn btn-primary" :disabled="!password || submitting">
        {{ submitting ? 'ログイン中…' : 'ログイン' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const password = ref('')
const error = ref('')
const submitting = ref(false)

async function submit() {
  error.value = ''
  submitting.value = true
  try {
    await $fetch('/api/admin/login', { method: 'POST', body: { password: password.value } })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/admin'
    await navigateTo(redirect)
  } catch {
    error.value = 'パスワードが違います。'
  } finally {
    submitting.value = false
  }
}
</script>
