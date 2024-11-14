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
  <div class="bg-zinc-700 p-4 m-4 rounded w-80 text-white">
    <h2 class="text-zinc-400 text-xl p-2">{{ title }}</h2>
    <li v-for="(item, index) in options" :key="index" class="list-none px-6 py-3">
      <span :class="{ invisible: index !== pointer }" class="mr-2">
        <span v-if="item.state === 'discarded'">❌</span>
        <span v-else>👉</span>
      </span>
      <span
        :class="{
          'text-teal-400 font-bold': item.state === 'chosen',
          'line-through decoration-4 decoration-red-500': item.state === 'discarded',
        }"
      >
        {{ item.title }}
      </span>
    </li>
  </div>
</template>
