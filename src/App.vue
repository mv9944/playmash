<script setup lang="ts">
import { ref } from 'vue'
import CategoryItem from './components/CategoryItem.vue'
import GameButton from './components/GameButton.vue'
import { useCategoriesStore } from './stores/categories'

import { useGameStateStore } from './stores/gameState'
import HeaderImage from './components/HeaderImage.vue'

const state = useGameStateStore()
const categories = useCategoriesStore()
const speed = ref(500)
const timeoutId = ref(-1)

function play() {
  if (timeoutId.value !== -1) {
    return
  }
  ;(function performNext() {
    const step = state.next()

    if (step === 'finished') {
      timeoutId.value = -1
      return
    }
    timeoutId.value = setTimeout(performNext, step === 'strike' ? speed.value * 4 : speed.value)
  })()
}

function stop() {
  clearTimeout(timeoutId.value)
  timeoutId.value = -1
}
</script>

<style>
@font-face {
  font-family: Modak;
  src: url('./assets/Modak-Regular.ttf');
}
</style>

<template>
  <div class="h-full flex flex-col text-white">
    <header class="w-full text-center text-white p-4 pb-0">
      <HeaderImage class="mx-auto m-4 w-72 sm:w-80 md:w-96 animate-wiggle" />
    </header>
    <p class="text-center">Speed: {{ speed }}, pointer: {{ state.pointer }}</p>

    <main class="grid md:grid-cols-2 gap-4 place-items-center">
      <CategoryItem
        v-for="(category, index) in categories.categories"
        :key="category.title"
        :title="category.title"
        :options="category.options"
        :pointer="state.pointer[0] === index ? state.pointer[1] : -1"
      />
    </main>

    <div class="grid grid-cols-1 w-full place-items-center gap-4 p-4">
      <div class="flex gap-4">
        <GameButton :color="'teal'" :pressed="timeoutId > 0" @click="play()">Play</GameButton>
        <GameButton :color="'pink'" :pressed="timeoutId === -1" @click="stop()">Stop</GameButton>
      </div>
      <div class="flex flex-col gap-2">
        <label for="speed-control">Speed: {{ speed }}ms</label>
        <input
          if="speed-control"
          v-model="speed"
          type="range"
          min="150"
          max="850"
          step="50"
          style="direction: rtl"
          class="w-96"
        />
      </div>
    </div>
  </div>
</template>
