<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search, X, BookOpen, Loader2, Plus } from '@lucide/vue'
import { searchGoogleBooks } from '../../services/openLibrary'
import type { GoogleBookSearchResult } from '../../types/book'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', book: GoogleBookSearchResult): void
}>()

const searchQuery = ref('')
const searchResults = ref<GoogleBookSearchResult[]>([])
const isLoading = ref(false)
const hasSearched = ref(false)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

// Fungsi pencarian dengan Debounce (300ms)
const handleSearch = () => {
  if (debounceTimer) clearTimeout(debounceTimer)

  if (!searchQuery.value.trim()) {
    searchResults.value = []
    isLoading.value = false
    hasSearched.value = false
    return
  }

  isLoading.value = true
  debounceTimer = setTimeout(async () => {
    searchResults.value = await searchGoogleBooks(searchQuery.value)
    isLoading.value = false
    hasSearched.value = true
  }, 300)
}

// Watcher untuk reset state saat modal ditutup/dibuka
watch(() => props.isOpen, (newVal) => {
  if (!newVal) {
    searchQuery.value = ''
    searchResults.value = []
    hasSearched.value = false
  }
})

// Memilih buku dan menutup modal
const selectBook = (book: GoogleBookSearchResult) => {
  emit('select', book)
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop Overlay -->
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity duration-300"
      @click.self="emit('close')"
    >
      <!-- Sheet/Modal Container (Bottom Sheet Style untuk HP) -->
      <div 
        class="bg-white w-full max-w-md h-[85vh] sm:h-[600px] rounded-t-3xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-slide-up"
      >
        <!-- Modal Header -->
        <div class="px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 class="text-sm font-bold text-gray-900">Cari Buku Online</h2>
            <p class="text-[11px] text-gray-500">Integrasi data otomatis dari Google Books</p>
          </div>
          <button 
            @click="emit('close')"
            class="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Search Bar Input -->
        <div class="p-4 border-b border-gray-100 bg-gray-50">
          <div class="relative flex items-center">
            <Search class="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
            <input 
              v-model="searchQuery"
              @input="handleSearch"
              type="text" 
              placeholder="Ketik judul buku atau nama penulis..."
              class="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              autofocus
            />
            <button 
              v-if="searchQuery" 
              @click="searchQuery = ''; handleSearch()"
              class="absolute right-3 text-gray-400 hover:text-gray-600"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- Search Results List -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <!-- Loading State -->
          <div v-if="isLoading" class="flex flex-col items-center justify-center py-12 text-gray-400">
            <Loader2 class="w-6 h-6 animate-spin text-indigo-600 mb-2" />
            <span class="text-xs">Mencari di katalog Google Books...</span>
          </div>

          <!-- Empty Search Query State -->
          <div v-else-if="!searchQuery.trim()" class="text-center py-12 text-gray-400">
            <Search class="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p class="text-xs">Mulai ketik judul buku untuk menampilkan hasil pencarian.</p>
          </div>

          <!-- No Results Found State -->
          <div v-else-if="hasSearched && searchResults.length === 0" class="text-center py-12 text-gray-400">
            <BookOpen class="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p class="text-xs font-medium text-gray-600">Buku tidak ditemukan</p>
            <p class="text-[11px] mt-1">Coba gunakan kata kunci lain atau penulis yang berbeda.</p>
          </div>

          <!-- Results Items -->
          <template v-else>
            <div 
              v-for="book in searchResults" 
              :key="book.id"
              class="bg-white p-3 rounded-xl border border-gray-100 shadow-2xs hover:border-indigo-200 flex gap-3 items-center justify-between"
            >
              <!-- Cover Image -->
              <div class="w-12 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                <img 
                  v-if="book.coverUrl" 
                  :src="book.coverUrl" 
                  :alt="book.title"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
                  <BookOpen class="w-5 h-5" />
                </div>
              </div>

              <!-- Title & Meta -->
              <div class="flex-1 min-w-0">
                <h4 class="text-xs font-bold text-gray-900 truncate leading-snug">{{ book.title }}</h4>
                <p class="text-[11px] text-gray-500 truncate mt-0.5">{{ book.authors.join(', ') }}</p>
                <span class="inline-block text-[10px] text-gray-400 mt-1">
                  {{ book.totalPages > 0 ? `${book.totalPages} hal` : 'Jumlah hal. n/a' }}
                </span>
              </div>

              <!-- Action Button -->
              <button 
                @click="selectBook(book)"
                class="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 flex-shrink-0"
              >
                <Plus class="w-3.5 h-3.5" />
                Pilih
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>