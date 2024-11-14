<script setup lang="ts">
import { ref } from 'vue'
import CategoryItem from './components/CategoryItem.vue'
import { useCategoriesStore } from './stores/categories'

import { useGameStateStore } from './stores/gameState'

const state = useGameStateStore()
const categories = useCategoriesStore()
const speed = ref(500)

function play() {
  ;(function performNext() {
    const step = state.next()

    if (step === 'finished') {
      return
    }
    setTimeout(performNext, step === 'strike' ? speed.value * 4 : speed.value)
  })()
}
</script>

<style>
@font-face {
  font-family: Modak;
  src: url('./assets/Modak-Regular.ttf');
}
</style>

<template>
  <div
    class="h-screen flex flex-col bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white"
  >
    <header class="w-full text-center text-white p-4 pb-0">
      <p
        class="text-8xl md:text-9xl drop-shadow-[0_35px_35px_rgba(0,0,0,0.25)] font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-pink-500"
        style="font-family: Modak"
      >
        MASH
      </p>
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
      <button @click="play()" class="bg-teal-400 py-2 px-6 rounded border border-teal-300">
        Play
      </button>
      <div class="flex flex-col gap-2">
        <label for="speed-control">Speed: {{ speed }}ms</label>
        <input
          if="speed-control"
          v-model="speed"
          type="range"
          min="50"
          max="950"
          style="direction: rtl"
          class="w-96"
        />
      </div>
    </div>
  </div>
</template>
