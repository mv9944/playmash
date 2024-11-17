<script setup lang="ts">
import { type CategoryOption } from '../stores/categories'

defineProps<{
  title: string
  options: CategoryOption[]
  pointer: number
}>()
</script>

<script lang="ts"></script>

<template>
  <div class="bg-zinc-800 p-4 m-4 rounded w-80 text-white border border-zinc-600 mx-auto">
    <input class="bg-zinc-800 text-purple-300 text-xl p-2" :value="title" />
    <div
      v-for="(item, index) in options"
      :key="index"
      class="list-none px-6 py-3 flex flex-row overflow-hidden"
    >
      <span :class="{ invisible: index !== pointer }" class="mr-2">
        <span v-if="item.state === 'discarded'">❌</span>
        <span v-else>👉</span>
      </span>
      <input
        :class="[
          {
            'text-teal-500 font-bold text-xl': item.state === 'chosen',
            'line-through decoration-2 decoration-pink-500 text-sm text-zinc-500':
              item.state === 'discarded',
          },
          'bg-zinc-800',
          'h-7',
        ]"
        v-model="item.title"
        :disabled="item.state !== 'waiting'"
      />
    </div>
  </div>
</template>
