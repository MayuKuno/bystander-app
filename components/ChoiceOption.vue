<template>
  <button
    class="choice-button"
    :class="{
      selected: isSelected,
      revealed: hasAnswered
    }"
    :disabled="hasAnswered"
    @click="$emit('select', choice.id)"
  >
    <span
      v-if="hasAnswered && percentage !== null"
      class="choice-fill"
      :style="{ width: percentage + '%' }"
      aria-hidden="true"
    />
    <span class="choice-content">
      <span class="choice-marker">{{ letter }}</span>
      <span class="choice-text">{{ choice.text[locale] }}</span>
      <span v-if="hasAnswered && percentage !== null" class="choice-percentage">{{ percentage }}%</span>
      <span v-if="hasAnswered && isSelected" class="choice-you-badge">{{ $t('scenario.yourChoice') }}</span>
    </span>
  </button>
</template>

<script setup lang="ts">
import type { ScenarioChoice } from '~/types/scenario'

const props = defineProps<{
  choice: ScenarioChoice
  isSelected: boolean
  hasAnswered: boolean
  index: number
  percentage?: number | null
}>()
defineEmits<{ select: [id: string] }>()

const { locale } = useI18n()

const letter = computed(() => String.fromCharCode(65 + props.index))
const percentage = computed(() => props.percentage ?? null)
</script>
