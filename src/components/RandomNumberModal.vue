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

function open() {
  isOpen.value = true
  generateNumber()
}

function close() {
  isOpen.value = false
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
    <div class="absolute w-full h-full bg-zinc-900 opacity-70"></div>

    <div class="absolute w-80 select-none">
      <div class="bg-zinc-800 overflow-hidden rounded flex flex-col p-4">
        <div
          style="font-family: Modak"
          class="border border-zinc-600 rounded cursor-move h-72 flex flex-col justify-center items-center text-violet-500 text-8xl"
          @click="close"
          @mousemove="generateNumber"
        >
          {{ state.mashNumber }}
        </div>
        <div class="flex flex-row">
          <div class="text-center w-full mt-4">
            <button @click="close" class="text-white bg-teal-500 py-2 px-4 rounded cursor-pointer">
              I'm ready!
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
