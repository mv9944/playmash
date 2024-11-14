import { ref } from 'vue'
import { defineStore } from 'pinia'

export type Category = {
  title: string
  options: CategoryOption[]
}

export function categoryComplete(category: Category): boolean {
  return category.options.every((option) => option.state !== 'waiting')
}

export function allCategoriesComplete(categories: Category[]): boolean {
  return categories.every((category) => categoryComplete(category))
}

export type CategoryOption = {
  title: string
  state: 'waiting' | 'chosen' | 'discarded'
}

function defaultCategories(): Category[] {
  return [
    {
      title: 'Job',
      options: [
        { title: 'Developer', state: 'waiting' },
        { title: 'Designer', state: 'waiting' },
        { title: 'Manager', state: 'waiting' },
        { title: 'Architect', state: 'waiting' },
      ],
    },
    {
      title: 'Hobby',
      options: [
        { title: 'Guitar', state: 'waiting' },
        { title: 'Piano', state: 'waiting' },
        { title: 'Violin', state: 'waiting' },
        { title: 'Drums', state: 'waiting' },
      ],
    },
  ]
}

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref<Category[]>(defaultCategories())

  function addCategory(category: Category) {
    categories.value.push(category)
  }

  function addOptionToCategory(category: Category, option: CategoryOption) {
    category.options.push(option)
  }

  return {
    categories,
    addCategory,
    addOptionToCategory,
  }
})
