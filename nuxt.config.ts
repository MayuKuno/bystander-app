// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  devtools: { enabled: true },

  modules: ['@nuxtjs/i18n'],

  i18n: {
    locales: [
      { code: 'ja', name: '日本語', file: 'ja.json' },
      { code: 'en', name: 'English', file: 'en.json' }
    ],
    defaultLocale: 'ja',
    langDir: 'i18n/locales/',
    strategy: 'no_prefix',
    // ヘッダーに常時表示の言語切替ボタンがあるため、ブラウザ言語による自動切り替えは無効化する。
    // 有効のままだと setLocale() で切り替えても、ブラウザの言語設定側に引き戻されてしまう。
    detectBrowserLanguage: false
  },

  typescript: {
    strict: true
  },

  runtimeConfig: {
    // NUXT_ADMIN_PASSWORD env var. Empty by default so admin login fails closed
    // (not just "unset locally") if it's ever forgotten in a deploy target.
    adminPassword: '',
    // NUXT_TURSO_DATABASE_URL / NUXT_TURSO_AUTH_TOKEN. Empty by default so
    // server/utils/db.ts falls back to the local file DB when unset.
    tursoDatabaseUrl: '',
    tursoAuthToken: ''
  },

  css: ['~/assets/css/main.css']
})
