<template>
  <div class="dialogue-card">
    <div class="dialogue-row">
      <div class="dialogue-figure-wrap">
        <svg class="dialogue-figure" viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="21" r="13" fill="url(#figure-grad-main)" />
          <path d="M10 60c0-19.5 9.4-29 22-29s22 9.5 22 29" fill="url(#figure-grad-main)" />
        </svg>
        <span class="speech-role-tag">{{ dialogue1Speaker }}</span>
      </div>
      <div class="dialogue-bubble">
        <p class="dialogue-line">{{ dialogue1 }}</p>
      </div>
    </div>

    <div v-if="dialogue2" class="dialogue-row dialogue-row--reaction">
      <div class="dialogue-figure-wrap">
        <svg class="dialogue-figure dialogue-figure--muted" viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="21" r="13" fill="url(#figure-grad-muted)" />
          <path d="M10 60c0-19.5 9.4-29 22-29s22 9.5 22 29" fill="url(#figure-grad-muted)" />
        </svg>
        <span class="speech-role-tag speech-role-tag--muted">{{ dialogue2Speaker }}</span>
      </div>
      <div class="dialogue-bubble dialogue-bubble--reaction">
        <p class="dialogue-line dialogue-line--reaction">{{ dialogue2 }}</p>
      </div>
    </div>

    <div v-if="dialogue3" class="dialogue-row dialogue-row--reaction">
      <div class="dialogue-figure-wrap">
        <svg class="dialogue-figure dialogue-figure--muted" viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="21" r="13" fill="url(#figure-grad-muted)" />
          <path d="M10 60c0-19.5 9.4-29 22-29s22 9.5 22 29" fill="url(#figure-grad-muted)" />
        </svg>
        <span class="speech-role-tag speech-role-tag--muted">{{ dialogue3Speaker }}</span>
      </div>
      <div class="dialogue-bubble dialogue-bubble--reaction">
        <p class="dialogue-line dialogue-line--reaction">{{ dialogue3 }}</p>
      </div>
    </div>

    <!--
      Continues the same script once the player picks a choice: their line, then the drawn reaction to it.
      Before they've picked (when this scenario has a deep-dive to lead into), a placeholder "..." bubble
      sits in the "you" slot so the conversation visibly waits on the player, then fills in with their
      actual choice text the moment they pick.
    -->
    <Transition name="feedback-fade">
      <div v-if="awaitingChoice || chosenChoiceText" class="dialogue-row">
        <div class="dialogue-figure-wrap">
          <svg class="dialogue-figure dialogue-figure--you" viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="21" r="13" fill="url(#figure-grad-you)" />
            <path d="M10 60c0-19.5 9.4-29 22-29s22 9.5 22 29" fill="url(#figure-grad-you)" />
          </svg>
          <span class="speech-role-tag speech-role-tag--you">{{ $t('scenario.you') }}</span>
        </div>
        <div class="dialogue-bubble">
          <span v-if="awaitingChoice" class="typing-indicator" aria-hidden="true">
            <span class="typing-dot" /><span class="typing-dot" /><span class="typing-dot" />
          </span>
          <p v-else class="dialogue-line">{{ chosenChoiceText }}</p>
        </div>
      </div>
    </Transition>

    <Transition name="feedback-fade">
      <div v-if="chosenReactionText" class="dialogue-row dialogue-row--reaction">
        <div class="dialogue-figure-wrap">
          <svg class="dialogue-figure dialogue-figure--muted" viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="21" r="13" fill="url(#figure-grad-muted)" />
            <path d="M10 60c0-19.5 9.4-29 22-29s22 9.5 22 29" fill="url(#figure-grad-muted)" />
          </svg>
          <span class="speech-role-tag speech-role-tag--muted">{{ chosenReactionSpeaker }}</span>
        </div>
        <div class="dialogue-bubble dialogue-bubble--reaction">
          <p class="dialogue-line dialogue-line--reaction">{{ chosenReactionText }}</p>
        </div>
      </div>
    </Transition>

    <svg width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="figure-grad-main" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#7bb2a3" />
          <stop offset="100%" stop-color="#2f5c52" />
        </linearGradient>
        <linearGradient id="figure-grad-muted" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#aabdb8" />
          <stop offset="100%" stop-color="#7c928d" />
        </linearGradient>
        <linearGradient id="figure-grad-you" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#a9c766" />
          <stop offset="100%" stop-color="#5c7a2b" />
        </linearGradient>
      </defs>
    </svg>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  dialogue1: string
  dialogue1Speaker: string
  dialogue2?: string
  dialogue2Speaker?: string
  dialogue3?: string
  dialogue3Speaker?: string
  /** True when this scenario leads into a deep-dive but no choice has been picked yet — shows a "..." placeholder in the "you" slot. */
  awaitingChoice?: boolean
  /** The text of whichever choice the player just picked — shown as their own line, continuing the script. */
  chosenChoiceText?: string
  /** The reaction drawn for that choice — shown as the next line in the same continuing exchange. */
  chosenReactionText?: string
  chosenReactionSpeaker?: string
}>()
</script>
