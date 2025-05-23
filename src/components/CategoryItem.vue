<!-- src/components/CategoryItem.vue -->
<template>
  <div class="p-4 border rounded-lg shadow-md bg-white flex flex-col h-full">
    <input
      type="text"
      name="title"
      :value="title"
      @input="$emit('update:title', $event.target.value)"
      class="text-xl font-semibold mb-3 p-2 border-b-2 border-gray-300 focus:border-indigo-500 outline-none"
      placeholder="Category Title"
      :disabled="!editable"
    />
    <div class="flex-grow">
      <div v-for="(option, index) in options" :key="index" class="flex items-center mb-2">
        <span
          name="pointer"
          class="w-3 h-3 mr-3 rounded-full transition-all duration-300 ease-in-out"
          :class="{
            'bg-indigo-500 animate-pulse': pointer === index && option.state === 'waiting',
            'bg-green-500': option.state === 'chosen',
            'bg-red-500 opacity-50 line-through': option.state === 'discarded',
            'bg-gray-300': pointer !== index && option.state === 'waiting',
            'invisible': pointer === -1 && option.state === 'waiting',
          }"
        ></span>
        <input
          type="text"
          name="option"
          :value="option.title"
          @input="$emit('update:optionTitle', index, $event.target.value)"
          class="flex-grow p-2 border border-gray-200 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Option"
          :disabled="!editable || option.state !== 'waiting'"
          :class="{
            'text-gray-400 line-through': option.state === 'discarded',
            'font-bold text-green-700': option.state === 'chosen',
          }"
        />
        <button
          v-if="editable && options.length > 1 && option.state === 'waiting'"
          @click="$emit('removeOption', index)"
          class="ml-2 text-red-500 hover:text-red-700 p-1"
          title="Remove option"
        >
          ×
        </button>
      </div>
    </div>

    <div class="mt-auto pt-3">
      <button
        v-if="editable"
        @click="$emit('addOption')"
        class="w-full text-sm text-indigo-600 hover:text-indigo-800 py-2 mb-2 border border-indigo-200 rounded hover:bg-indigo-50 transition-colors"
      >
        + Add Option Manually
      </button>

      <!-- DEV_COMMENT: New button to trigger AI option generation for this specific category. -->
      <button
        v-if="editable"
        @click="generateAIOptions"
        :disabled="isThisItemLoadingAIOptions || !gameThemeForAI.trim() || !title.trim()"
        class="w-full text-sm text-purple-600 hover:text-purple-800 py-2 border border-purple-200 rounded hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <!-- DEV_COMMENT: Loading indicator specific to this button/category. -->
        <span v-if="isThisItemLoadingAIOptions">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-purple-600 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Options...
        </span>
        <span v-else>✨ Gen Options with AI</span>
      </button>
      <!-- DEV_COMMENT: Helper text if theme or title is missing, preventing AI option generation. -->
      <p v-if="editable && (!gameThemeForAI.trim() || !title.trim()) && !isThisItemLoadingAIOptions" class="text-xs text-gray-500 mt-1 text-center">
        (Ensure overall game theme & category title are set to enable AI options)
      </p>
       <!-- DEV_COMMENT: Display error specific to this category's AI option generation attempt. -->
       <div v-if="aiOptionsErrorForThisCategory" class="mt-2 text-xs text-red-500 text-center p-1 bg-red-50 rounded-md">
        AI Error: {{ aiOptionsErrorForThisCategory }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from 'vue';
import { useCategoriesStore } from '@/stores/categories';
import type { CategoryOption } from '@/stores/categories';

const props = defineProps<{
  title: string;
  options: CategoryOption[];
  group: number; // Index of this category in the main categories array
  pointer: number;
  editable: boolean;
  // DEV_COMMENT: New prop to receive the overall game theme from the parent (GameView).
  // This is needed as context for the AI when generating options.
  gameThemeForAI: string;
}>();

const emit = defineEmits(['update:title', 'update:optionTitle', 'addOption', 'removeOption']);

const categoriesStore = useCategoriesStore();
// DEV_COMMENT: Local loading state for this specific CategoryItem's AI option generation.
// This prevents all "Gen Options with AI" buttons from showing loading if only one is active.
const isThisItemLoadingAIOptions = ref(false);
// DEV_COMMENT: Local error message for this specific CategoryItem.
const aiOptionsErrorForThisCategory = ref<string | null>(null);

// DEV_COMMENT: Method to call the store action for generating AI options.
const generateAIOptions = async () => {
  if (!props.gameThemeForAI.trim()) {
    aiOptionsErrorForThisCategory.value = "Overall game theme must be set.";
    return;
  }
  if (!props.title.trim()) {
    aiOptionsErrorForThisCategory.value = "Category title cannot be empty.";
    return;
  }

  isThisItemLoadingAIOptions.value = true;
  aiOptionsErrorForThisCategory.value = null; // Clear previous local error

  // DEV_COMMENT: Call the store action, passing the category's index (props.group),
  // its current title, and the overall game theme.
  await categoriesStore.fetchAndSetOptionsForCategory(props.group, props.title, props.gameThemeForAI);

  // DEV_COMMENT: After the store action completes, check the store's optionsError.
  // If an error occurred during the call initiated by this item, display it.
  // This is a bit indirect; a more robust solution might involve the store action returning a status or error.
  if (categoriesStore.optionsError) {
    // DEV_COMMENT: We assume if an error is present in the store immediately after our call, it's related.
    // This could be improved if the store action returned a specific error for the call.
    aiOptionsErrorForThisCategory.value = categoriesStore.optionsError;
  } else {
    aiOptionsErrorForThisCategory.value = null; // Clear local error if store has no error (implies success for this call)
  }
  isThisItemLoadingAIOptions.value = false;
};

// DEV_COMMENT: Watch the global `isGeneratingOptions` from the store.
// If it becomes false (meaning an AI option generation process somewhere finished)
// and this item thought it was loading, we should also ensure this item's loading state is false.
// This helps if the error was caught globally and reset the global loading flag.
watch(() => categoriesStore.isGeneratingOptions, (newGlobalLoadingState) => {
  if (!newGlobalLoadingState && isThisItemLoadingAIOptions.value) {
    isThisItemLoadingAIOptions.value = false;
    // If a global error is set, reflect it, otherwise clear local.
    // This helps sync up if the error was set and cleared quickly in the store.
    aiOptionsErrorForThisCategory.value = categoriesStore.optionsError;
  }
});

// DEV_COMMENT: When the component is about to be unmounted or props.group changes (less likely for group),
// clear any local error if it matches the global one, to prevent stale errors on other items.
// This is a bit of a workaround for the global error state.
// A better approach might be for the store action to return success/failure or for errors to be event-based.
watch(() => props.group, () => {
  if (aiOptionsErrorForThisCategory.value === categoriesStore.optionsError) {
    aiOptionsErrorForThisCategory.value = null;
  }
});

</script>
