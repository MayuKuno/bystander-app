<template>
  <div class="app-shell">
    <header class="app-header">
      <NuxtLink to="/" class="logo">
        <span class="logo-mark" aria-hidden="true">◐</span>
        <span>{{ $t('app.titlePre') }}<span class="logo-emphasis">{{ $t('app.titleEmphasis') }}</span>{{ $t('app.titlePost') }}</span>
      </NuxtLink>
      <div class="header-right">
        <nav class="auth-nav">
          <NuxtLink to="/me" class="auth-nav-link">{{ $t('nav.myPage') }}</NuxtLink>
        </nav>
        <div class="locale-switch" role="group" aria-label="Language">
          <button
            v-for="loc in availableLocales"
            :key="loc.code"
            type="button"
            :class="{ active: locale === loc.code }"
            :aria-pressed="locale === loc.code"
            @click="setLocale(loc.code as 'ja' | 'en')"
          >
            {{ loc.name }}
          </button>
        </div>
      </div>
    </header>
    <main>
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()
const availableLocales = computed(() => locales.value)
</script>

<style>
@import '~/assets/css/main.css';
</style>
