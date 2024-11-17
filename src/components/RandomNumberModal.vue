<script setup lang="ts">
import { useGameStateStore } from '@/stores/gameState'
import { ref } from 'vue'

const state = useGameStateStore()

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['close'])

const isOpen = ref(props.isOpen)

const title = 'Click when ready!'

function open() {
  isOpen.value = true
  generateNumber()

  window.addEventListener('devicemotion', generateNumber)
  window.addEventListener('mousemove', generateNumber)
}

function close() {
  isOpen.value = false

  window.removeEventListener('deviceorientation', generateNumber)
  window.removeEventListener('mousemove', generateNumber)
  emit('close')
}

function generateNumber() {
  state.mashNumber = Math.max(3, Math.floor(Math.random() * 12))
}

defineExpose({
  open,
  close,
})
</script>

<template>
  <div class="fixed w-full h-full top-0 left-0 flex items-center justify-center z-10" v-if="isOpen">
    <div class="absolute w-full h-full bg-zinc-900 opacity-70" @click="close"></div>

    <div class="absolute w-80 cursor-pointer select-none">
      <div class="bg-zinc-800 overflow-hidden rounded flex flex-col">
        <div class="flex flex-row">
          <div class="text-zinc-400 py-5 text-center w-full">{{ title }}</div>
        </div>
        <div
          style="font-family: Modak"
          class="h-72 px-4 py-4 flex flex-col justify-center items-center text-violet-500 text-8xl"
          @click="close"
        >
          {{ state.mashNumber }}
        </div>
      </div>
    </div>
  </div>
</template>
