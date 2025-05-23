// src/stores/categories.ts
import { ref } from 'vue';
import { defineStore } from 'pinia';

const API_BASE_URL = import.meta.env.VITE_MASH_API_URL || 'http://localhost:3000';

export type CategoryOption = {
  title: string;
  state: 'waiting' | 'chosen' | 'discarded';
};

export type Category = {
  title: string;
  options: CategoryOption[];
};

export function categoryComplete(category: Category): boolean {
  return category.options.every((option) => option.state !== 'waiting');
}

export function allCategoriesComplete(categories: Category[]): boolean {
  return categories.every((category) => categoryComplete(category));
}

export const defaultCategories: { [key: string]: Category[] } = {
  Traditional: [
    {
      title: 'Marry',
      options: [
        { title: 'Robin', state: 'waiting' },
        { title: 'Sammie', state: 'waiting' },
        { title: 'Kris', state: 'waiting' },
        { title: 'Jessie', state: 'waiting' },
      ],
    },
    {
      title: 'Kids',
      options: [
        { title: '1', state: 'waiting' },
        { title: '2', state: 'waiting' },
        { title: '3', state: 'waiting' },
        { title: '8', state: 'waiting' },
      ],
    },
    {
      title: 'Job',
      options: [
        { title: 'Doctor', state: 'waiting' },
        { title: 'Artist', state: 'waiting' },
        { title: 'Politician', state: 'waiting' },
        { title: 'Spy', state: 'waiting' },
      ],
    },
    {
      title: 'Living Arrangement',
      options: [
        { title: 'Mansion', state: 'waiting' },
        { title: 'Apartment', state: 'waiting' },
        { title: 'Shack', state: 'waiting' },
        { title: 'House', state: 'waiting' },
      ],
    },
  ],
  'Software Engineer': [
    {
      title: 'Job Role',
      options: [
        { title: 'Frontend Dev', state: 'waiting' },
        { title: 'Backend Dev', state: 'waiting' },
        { title: 'DevOps Engineer', state: 'waiting' },
        { title: 'Product Manager', state: 'waiting' },
      ],
    },
    {
      title: 'Primary Hobby',
      options: [
        { title: 'Coding Side Projects', state: 'waiting' },
        { title: 'Gaming', state: 'waiting' },
        { title: 'Hiking/Outdoors', state: 'waiting' },
        { title: 'Playing an Instrument', state: 'waiting' },
      ],
    },
    {
      title: 'Dream Salary (Annual)',
      options: [
        { title: '$80,000', state: 'waiting' },
        { title: '$120,000', state: 'waiting' },
        { title: '$180,000', state: 'waiting' },
        { title: '$250,000+', state: 'waiting' },
      ],
    },
    {
      title: 'Work Environment',
      options: [
        { title: 'Chaotic Startup', state: 'waiting' },
        { title: 'Stable Enterprise', state: 'waiting' },
        { title: 'Fully Remote Indie', state: 'waiting' },
        { title: 'Trendy Tech Hub Office', state: 'waiting' },
      ],
    },
  ],
};


export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref<Category[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  // DEV_COMMENT: New loading state specifically for when AI is generating options for a single category.
  const isGeneratingOptions = ref(false);
  // DEV_COMMENT: New error state specifically for errors during AI option generation.
  const optionsError = ref<string | null>(null);


  function addCategory(category: Category) {
    categories.value.push(category);
    return category;
  }

  function removeCategory(categoryToRemove: Category) {
    const index = categories.value.findIndex(c => c.title === categoryToRemove.title && c.options === categoryToRemove.options);
    if (index !== -1) {
      categories.value.splice(index, 1);
    }
  }

  function addOptionToCategory(category: Category, option: CategoryOption) {
    const targetCategory = categories.value.find(c => c.title === category.title);
    if (targetCategory) {
        targetCategory.options.push(option);
    } else {
        console.warn('[CategoriesStore] Attempted to add option to a category not found in store:', category.title);
    }
  }

  function removeOptionFromCategory(category: Category, optionIndex: number) {
    const targetCategory = categories.value.find(c => c.title === category.title);
    if (targetCategory && optionIndex >= 0 && optionIndex < targetCategory.options.length) {
      targetCategory.options.splice(optionIndex, 1);
      if (targetCategory.options.length === 0) {
        targetCategory.options.push({ title: '', state: 'waiting' });
      }
    }
  }

  function useDefault(categorySetName: string) {
    isLoading.value = false;
    error.value = null;
    if (defaultCategories[categorySetName]) {
      categories.value = JSON.parse(JSON.stringify(defaultCategories[categorySetName]));
    } else {
      console.warn(`[CategoriesStore] Default category set "${categorySetName}" not found.`);
      categories.value = [];
    }
  }

  async function fetchCategoriesByTheme(theme: string) {
    isLoading.value = true;
    error.value = null;
    console.log(`[CategoriesStore] Attempting to fetch categories for theme: "${theme}" from ${API_BASE_URL}/api/categories`);

    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.message || responseData.error || `API request failed: ${response.status} ${response.statusText}`;
        console.error('[CategoriesStore] API Error - Status:', response.status, 'Response Data:', responseData);
        throw new Error(errorMessage);
      }

      if (responseData.categories && Array.isArray(responseData.categories)) {
        categories.value = responseData.categories.map((title: string) => ({
          title: title,
          options: [
            { title: '', state: 'waiting' },
            { title: '', state: 'waiting' },
            { title: '', state: 'waiting' },
            { title: '', state: 'waiting' },
          ],
        }));
        console.log('[CategoriesStore] Successfully fetched and mapped categories:', categories.value);
      } else {
        console.error('[CategoriesStore] API returned OK, but data structure is invalid:', responseData);
        throw new Error('Received invalid category data structure from the server.');
      }

    } catch (err: any) {
      console.error('[CategoriesStore] fetchCategoriesByTheme caught an error:', err);
      error.value = err.message || 'An unknown error occurred while fetching categories.';
    } finally {
      isLoading.value = false;
    }
  }

  // DEV_COMMENT: New action to fetch AI-generated options for a specific category.
  // It takes the index of the category in our `categories` ref, its title, and the overall game theme for context.
  async function fetchAndSetOptionsForCategory(categoryIndex: number, categoryTitle: string, currentTheme: string) {
    // DEV_COMMENT: Basic validation for the category index.
    if (categoryIndex < 0 || categoryIndex >= categories.value.length) {
        console.error("[CategoriesStore] Invalid categoryIndex for fetching options:", categoryIndex);
        // DEV_COMMENT: Set a specific error message for option generation failure.
        optionsError.value = "Invalid category specified for generating options.";
        return; // Exit if index is bad.
    }

    // DEV_COMMENT: Set loading state for option generation.
    isGeneratingOptions.value = true;
    // DEV_COMMENT: Clear any previous error related to option generation.
    optionsError.value = null;
    const targetCategory = categories.value[categoryIndex];

    // DEV_COMMENT: Store a deep copy of current options. If AI fails, we can revert.
    const originalOptions = JSON.parse(JSON.stringify(targetCategory.options));

    console.log(`[CategoriesStore] Fetching AI options for category: "${categoryTitle}", theme: "${currentTheme}" from ${API_BASE_URL}/api/categories/options`);

    try {
      // DEV_COMMENT: Call the new backend endpoint for category options.
      const response = await fetch(`${API_BASE_URL}/api/categories/options`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoryTitle, theme: currentTheme }), // Send category title and theme
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.message || responseData.error || `API request for options failed: ${response.status}`;
        console.error('[CategoriesStore] Options API Error:', responseData);
        throw new Error(errorMessage);
      }

      // DEV_COMMENT: Check if the response has the expected 'options' array.
      if (responseData.options && Array.isArray(responseData.options) && responseData.options.length > 0) {
        // DEV_COMMENT: Replace the category's existing options with the new AI-generated ones.
        // Map them to our CategoryOption structure.
        targetCategory.options = responseData.options.map((optTitle: string) => ({
          title: optTitle,
          state: 'waiting', // New options should start in 'waiting' state.
        }));
        console.log('[CategoriesStore] Successfully fetched and set AI options for', categoryTitle, targetCategory.options);
      } else {
        console.error('[CategoriesStore] Invalid options data received from API (but status was OK):', responseData);
        // DEV_COMMENT: If API said OK but data is bad, revert to original options and throw error.
        targetCategory.options = originalOptions;
        throw new Error('Received invalid or empty options data from the server.');
      }
    } catch (err: any) {
      console.error('[CategoriesStore] Error fetching/setting AI options:', err);
      optionsError.value = err.message || 'Failed to generate options with AI.';
      // DEV_COMMENT: On any error during the process, revert to the options the user had before trying AI.
      if (targetCategory) { // Ensure targetCategory is still valid
        targetCategory.options = originalOptions;
      }
    } finally {
      // DEV_COMMENT: Always reset the option-specific loading state.
      isGeneratingOptions.value = false;
    }
  }

  function clearCategories() {
    categories.value = [];
    error.value = null;
    isLoading.value = false;
    optionsError.value = null; // DEV_COMMENT: Also clear optionsError when clearing all categories.
  }


  return {
    categories,
    isLoading,
    error,
    isGeneratingOptions, // DEV_COMMENT: Expose new loading state.
    optionsError,        // DEV_COMMENT: Expose new error state.
    useDefault,
    fetchCategoriesByTheme,
    fetchAndSetOptionsForCategory, // DEV_COMMENT: Expose new action.
    addCategory,
    removeCategory,
    addOptionToCategory,
    removeOptionFromCategory,
    clearCategories,
  };
});
