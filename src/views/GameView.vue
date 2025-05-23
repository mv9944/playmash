<script setup lang="ts">
import { ref } from 'vue';
import { useCategoriesStore, defaultCategories } from '../stores/categories';
import { useGameStateStore } from '../stores/gameState';

import CategoryItem from '../components/CategoryItem.vue';
import GameButton from '../components/GameButton.vue';
import MashNumber from '../components/MashNumber.vue';
import RandomNumberModal from '../components/RandomNumberModal.vue';

const state = useGameStateStore();
const categoriesStore = useCategoriesStore();
const speed = ref(500);
const timeoutId = ref<number>(-1);
const randomNumberModal = ref<InstanceType<typeof RandomNumberModal> | null>(null);

const overallGameThemeForAI = ref('');
const aiThemeInput = ref('');

function play() {
  if (timeoutId.value !== -1 && timeoutId.value !== undefined) {
    return;
  }
  ;(function performNext() {
    const step = state.next();

    if (step === 'finished') {
      timeoutId.value = -1;
      return;
    }

    if (step === 'step') {
      click.play();
    }

    if (step === 'strike') {
      discard.play();
    }
    timeoutId.value = setTimeout(
      performNext,
      step === 'strike' ? speed.value * 4 : speed.value,
    ) as unknown as number;
  })();
}

function stop() {
  clearTimeout(timeoutId.value);
  timeoutId.value = -1;
}

function resetGameAndState() {
  stop();
  state.reset();
}

function selectDefault(event: Event) {
  const selectedTheme = (event.target as HTMLSelectElement).value;
  if (selectedTheme) {
    resetGameAndState();
    categoriesStore.useDefault(selectedTheme);
    overallGameThemeForAI.value = selectedTheme;
    aiThemeInput.value = selectedTheme;
  }
}

async function generateAICategoryTitles() {
  if (aiThemeInput.value.trim()) {
    resetGameAndState();
    overallGameThemeForAI.value = aiThemeInput.value.trim();
    await categoriesStore.fetchCategoriesByTheme(overallGameThemeForAI.value);
  } else {
    alert("Please enter a theme for the AI to generate categories.");
  }
}

function emojiForSpeed(speedValue: number) {
  const speedMap: { [key: number]: string } = {
    150: '⚡️⚡️⚡️⚡️⚡️⚡️⚡️', 200: '⚡️⚡️⚡️⚡️⚡️⚡️', 250: '⚡️⚡️⚡️⚡️⚡️',
    300: '⚡️⚡️⚡️⚡️', 350: '⚡️⚡️⚡️️', 400: '⚡️⚡️', 450: '️⚡️',
    500: '️ ', 550: '️🐌', 600: '️🐌🐌', 650: '🐌🐌🐌️',
    700: '🐌🐌🐌️', 750: '🐌🐌🐌🐌️', 800: '🐌🐌🐌🐌🐌',
    850: '🐌🐌️🐌🐌🐌🐌',
  };
  return speedMap[speedValue] || ' ';
}

const click = new Audio('/click.wav');
const discard = new Audio('/discard.wav');
</script>

<template>
  <RandomNumberModal ref="randomNumberModal" @close="play" />

  <div class="w-full flex items-center justify-center my-4">
    <button
      v-if="state.pointer[0] === -1 && state.mashNumber > 0"
      style="font-family: Modak"
      class="text-4xl text-pink-500 hover:text-pink-400"
      @click="resetGameAndState"
    >
      Restart?
    </button>
    <button
      v-else-if="state.mashNumber < 0"
      style="font-family: Modak"
      class="text-6xl text-violet-500 hover:text-violet-400"
      @click="randomNumberModal?.open()"
      :class="{ invisible: categoriesStore.categories.length === 0 }"
    >
      Go!
    </button>
    <div
      v-else-if="state.mashNumber > 0 && state.pointer[0] !== -1"
      class="grid grid-cols-1 w-full place-items-center gap-4 fixed top-0 p-2 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 z-20"
    >
      <MashNumber :currentCount="state.currentCount" :mashNumber="state.mashNumber" />
    </div>
  </div>

  <div v-if="state.mashNumber < 0" class="grid grid-cols-1 w-full place-items-center gap-6 p-4">
    <div class="w-full max-w-sm">
      <label for="default-select" class="block text-sm font-medium text-gray-300 mb-1">Start with a Template:</label>
      <select
        name="defaults"
        id="default-select"
        class="bg-zinc-800 p-3 rounded text-white w-full border border-zinc-700 focus:ring-indigo-500 focus:border-indigo-500"
        @change="selectDefault"
      >
        <option value="">-- Select a Pre-defined Set --</option>
        <option v-for="(categoryContent, key) in defaultCategories" :value="key" :key="key">
          {{ key }}
        </option>
      </select>
    </div>

    <div class="text-center text-gray-400">OR</div>

    <div class="w-full max-w-sm">
      <label for="ai-theme-input" class="block text-sm font-medium text-gray-300 mb-1">Generate Categories with AI:</label>
      <input
        id="ai-theme-input"
        type="text"
        v-model="aiThemeInput"
        placeholder="Enter a theme (e.g., Pirate Adventure)"
        class="bg-zinc-800 p-3 rounded text-white w-full border border-zinc-700 focus:ring-indigo-500 focus:border-indigo-500 mb-2"
        :disabled="categoriesStore.isLoading"
      />
      <button
        @click="generateAICategoryTitles"
        class="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
        :disabled="categoriesStore.isLoading || !aiThemeInput.trim()"
      >
        <span v-if="categoriesStore.isLoading">Generating...</span>
        <span v-else>Get AI Category Titles</span>
      </button>
      <div v-if="categoriesStore.error" class="mt-2 text-xs text-red-400">
        Error: {{ categoriesStore.error }}
      </div>
    </div>
  </div>

  <div class="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 p-2 justify-center">
    <CategoryItem
      v-for="(category, index) in categoriesStore.categories"
      :key="category.title + '-' + index"
      :title="category.title"
      :options="category.options"
      :group="index"
      :pointer="state.pointer[0] === index ? state.pointer[1] : -1"
      :editable="state.mashNumber < 0"
      :gameThemeForAI="overallGameThemeForAI"
      @update:title="newTitle => categoriesStore.categories[index].title = newTitle"
      @update:optionTitle="(optionIndex, newTitle) => categoriesStore.categories[index].options[optionIndex].title = newTitle"
      @addOption="() => categoriesStore.addOptionToCategory(categoriesStore.categories[index], { title: '', state: 'waiting' })"
      @removeOption="optionIndex => categoriesStore.removeOptionFromCategory(categoriesStore.categories[index], optionIndex)"
      @removeCategory="() => categoriesStore.removeCategory(categoriesStore.categories[index])"
    />
    <button
      @click="
        categoriesStore.addOptionToCategory(
          categoriesStore.addCategory({ title: 'New category ' + (categoriesStore.categories.length + 1), options: [] }),
          { title: '', state: 'waiting' },
        )
      "
      v-if="state.mashNumber < 0"
      class="border border-zinc-600 rounded w-full sm:w-80 h-32 mx-auto my-4 flex items-center justify-center text-2xl text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
      title="Add New Category Manually"
    >
      +
    </button>
  </div>
  <div class="h-32"></div>

  <div
    v-if="state.pointer[0] !== -1 && state.mashNumber > 0"
    class="grid grid-cols-1 w-full place-items-center gap-4 p-4 z-10 fixed bottom-0 bg-zinc-900/90 backdrop-blur-sm"
  >
    <div class="flex gap-4">
      <GameButton :color="'teal'" :pressed="timeoutId > 0 && timeoutId !== -1" @click="play()">▶ Play</GameButton>
      <GameButton :color="'pink'" :pressed="timeoutId === -1 || timeoutId === undefined" @click="stop()">■ Stop</GameButton>
      <GameButton :color="'blue'" @click="state.next(); if(state.pointer[0] === -1) stop();">⇢ Next</GameButton>
    </div>
    <div class="flex flex-col gap-2 text-center w-full max-w-md">
      <label for="speed-control" class="text-sm text-gray-300">{{ emojiForSpeed(speed) }} Speed</label>
      <input
        id="speed-control"
        v-model.number="speed"
        type="range"
        min="150"
        max="850"
        step="50"
        style="direction: rtl"
        class="w-full"
      />
    </div>
  </div>
</template>
