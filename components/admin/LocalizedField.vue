<template>
  <div class="admin-localized-field">
    <span class="admin-field-label">{{ label }}</span>
    <div class="admin-localized-inputs">
      <label class="admin-localized-input">
        <span class="admin-localized-lang">JA</span>
        <textarea v-if="textarea" v-model="modelValue.ja" class="admin-input" rows="2" />
        <input v-else v-model="modelValue.ja" class="admin-input" />
      </label>
      <label class="admin-localized-input">
        <span class="admin-localized-lang">EN</span>
        <textarea v-if="textarea" v-model="modelValue.en" class="admin-input" rows="2" />
        <input v-else v-model="modelValue.en" class="admin-input" />
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LocalizedText } from '~/types/scenario'

defineProps<{ label: string; textarea?: boolean }>()
const modelValue = defineModel<LocalizedText>({ required: true })
</script>
