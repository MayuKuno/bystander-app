<template>
  <div class="ai-feedback-placeholder" :class="isRecommended ? 'recommended' : 'not-recommended'" role="status">
    <span class="ai-feedback-placeholder-icon" aria-hidden="true">✨</span>
    <div>
      <p class="ai-feedback-placeholder-title">{{ $t('scenario.aiFeedbackTitle') }}</p>
      <p class="ai-feedback-placeholder-body">{{ $t('scenario.aiFeedbackComingSoon') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
/** Matches the frame color to the choice's FeedbackPanel above it, so the two answers in one flow read as a pair. */
defineProps<{ isRecommended?: boolean }>()
</script>
