<script setup lang="ts">
defineProps<{
  color: string
  pressed: boolean
}>()
</script>

<template>
  <button
    @click="$emit('click')"
    class="py-2 px-6 rounded border-b-4"
    v-bind:class="[
      {
        'border-none shadow-inner shadow-black brightness-75': pressed,
      },
      `bg-${color}-600`,
      `border-${color}-700`,
    ]"
  >
    <slot></slot>
  </button>
</template>
