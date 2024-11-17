<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { useCategoriesStore, defaultCategories } from './stores/categories'
import { useGameStateStore } from './stores/gameState'

import CategoryItem from './components/CategoryItem.vue'
import GameButton from './components/GameButton.vue'
import HeaderImage from './components/HeaderImage.vue'
import MashNumber from './components/MashNumber.vue'
import RandomNumberModal from './components/RandomNumberModal.vue'

const state = useGameStateStore()
const categories = useCategoriesStore()
const speed = ref(500)
const timeoutId = ref(-1)
const randomNumberModal = useTemplateRef('randomNumberModal')

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

    if (step === 'step') {
      click.play()
    }

    if (step === 'strike') {
      discard.play()
    }
    timeoutId.value = setTimeout(
      performNext,
      step === 'strike' ? speed.value * 4 : speed.value,
    ) as unknown as number
  })()
}

function stop() {
  clearTimeout(timeoutId.value)
  timeoutId.value = -1
}

function reset() {
  state.reset()
}

function selectDefault(event: Event) {
  categories.useDefault((event.target as HTMLInputElement).value)
}

function emojiForSpeed(speed: number) {
  return {
    150: '⚡️⚡️⚡️⚡️⚡️⚡️⚡️',
    200: '⚡️⚡️⚡️⚡️⚡️⚡️',
    250: '⚡️⚡️⚡️⚡️⚡️',
    300: '⚡️⚡️⚡️⚡️',
    350: '⚡️⚡️⚡️️',
    400: '⚡️⚡️',
    450: '️⚡️',
    500: '️ ',
    550: '️🐌',
    600: '️🐌🐌',
    650: '🐌🐌🐌️',
    700: '🐌🐌🐌️',
    750: '🐌🐌🐌🐌️',
    800: '🐌🐌🐌🐌🐌',
    850: '🐌🐌️🐌🐌🐌🐌',
  }[speed]
}

const click = new Audio('./click.wav')
const discard = new Audio('./discard.wav')
</script>

<style>
@font-face {
  font-family: Modak;
  src: url('./assets/Modak-Regular.ttf');
}
</style>

<template>
  <RandomNumberModal ref="randomNumberModal" @close="play" />
  <div class="h-full flex flex-col text-white">
    <header class="w-full text-center text-white p-4 pb-0">
      <HeaderImage class="mx-auto m-4 w-64 sm:w-72 md:w-80 animate-wiggle" />
    </header>

    <main>
      <div class="h-28 w-full flex items-center justify-center">
        <button
          v-if="state.pointer[0] === -1"
          style="font-family: Modak"
          class="text-4xl text-pink-500 hover:text-pink-400"
          @click="reset"
        >
          Restart?
        </button>
        <button
          v-else-if="state.mashNumber < 0"
          style="font-family: Modak"
          class="text-6xl text-violet-500 hover:text-violet-400"
          @click="randomNumberModal?.open"
          :disabled="categories.categories.length === 0"
        >
          Go!
        </button>
        <div v-else-if="state.mashNumber" class="grid grid-cols-1 w-full place-items-center gap-4">
          <MashNumber :currentCount="state.currentCount" :mashNumber="state.mashNumber" />
        </div>
      </div>

      <div v-if="state.mashNumber < 0" class="grid grid-cols-1 w-full place-items-center gap-4 p-4">
        <select
          name="defaults"
          id="default-select"
          class="bg-zinc-800 p-4 rounded text-white"
          @change="selectDefault"
        >
          <option value="">Select a default</option>
          <option v-for="(category, key) in defaultCategories" :value="key" :key="key">
            {{ key }}
          </option>
        </select>
      </div>

      <div class="grid sm:grid-cols-2 xl:grid-cols-4 gap-2 justify-center">
        <CategoryItem
          v-for="(category, index) in categories.categories"
          :key="category.title"
          :title="category.title"
          :options="category.options"
          :group="index"
          :pointer="state.pointer[0] === index ? state.pointer[1] : -1"
        />
      </div>
      <div class="h-32"></div>

      <div
        v-if="state.pointer[0] !== -1 && state.mashNumber > 0"
        class="grid grid-cols-1 w-full place-items-center gap-4 p-4 z-10 fixed bottom-0 bg-zinc-900"
      >
        <div class="flex gap-4">
          <GameButton :color="'teal'" :pressed="timeoutId > 0" @click="play()">▶</GameButton>
          <GameButton :color="'pink'" :pressed="timeoutId === -1" @click="stop()">■</GameButton>
        </div>
        <div class="flex flex-col gap-2 text-center">
          <label for="speed-control">{{ emojiForSpeed(speed) }}</label>
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
    </main>
  </div>
</template>
