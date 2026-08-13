<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { BookOpen, BookmarkCheck, Heart, Loader2, RefreshCw } from '@lucide/vue'
import BookCard from '../components/books/BookCard.vue'
import { getBooksByStatus } from '../services/firebase'
import type { Book, BookStatus } from '../types/book'

const route = useRoute()

// State Data Real-Time
const booksList = ref<Book[]>([])
const isLoading = ref(true)

// Mendapatkan tab aktif dari Query URL (?tab=reading, ?tab=completed, ?tab=wishlist)
const currentTab = computed<BookStatus>(() => {
  const tab = route.query.tab as string
  if (tab === 'completed' || tab === 'wishlist') {
    return tab
  }
  return 'reading'
})

// Fungsi untuk mengambil data buku asli dari Firestore
const fetchBooks = async () => {
  isLoading.value = true
  booksList.value = await getBooksByStatus(currentTab.value)
  isLoading.value = false
}

// Ambil data pertama kali saat halaman dimuat
onMounted(() => {
  fetchBooks()
})

// Watcher: Ambil data ulang dari Firestore saat pengguna berpindah tab navigasi bawah
watch(currentTab, () => {
  fetchBooks()
})

// Metadata Tampilan Header sesuai Tab
const tabInfo = computed(() => {
  switch (currentTab.value) {
    case 'completed':
      return {
        title: 'Selesai Dibaca',
        description: 'Buku-buku yang telah selesai Anda tamatkan.',
        icon: BookmarkCheck,
        badgeColor: 'bg-green-100 text-green-700'
      }
    case 'wishlist':
      return {
        title: 'Wishlist Buku',
        description: 'Daftar buku yang ingin Anda baca di masa depan.',
        icon: Heart,
        badgeColor: 'bg-rose-100 text-rose-700'
      }
    case 'reading':
    default:
      return {
        title: 'Sedang Dibaca',
        description: 'Buku-buku yang saat ini sedang Anda nikmati.',
        icon: BookOpen,
        badgeColor: 'bg-indigo-100 text-indigo-700'
      }
  }
})
</script>

<template>
  <div class="px-4 pt-6 pb-4 max-w-md mx-auto">
    <!-- Header Halaman -->
    <header class="mb-5 flex items-start justify-between">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="p-2 rounded-xl" :class="tabInfo.badgeColor">
            <component :is="tabInfo.icon" class="w-5 h-5" />
          </span>
          <h1 class="text-xl font-bold tracking-tight text-gray-900">{{ tabInfo.title }}</h1>
        </div>
        <p class="text-xs text-gray-500 pl-1">{{ tabInfo.description }}</p>
      </div>

      <!-- Tombol Refresh Data -->
      <button 
        @click="fetchBooks"
        :disabled="isLoading"
        class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors active:rotate-180"
        title="Muat Ulang"
      >
        <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
      </button>
    </header>

    <!-- State Loading -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-16 text-gray-400">
      <Loader2 class="w-7 h-7 animate-spin text-indigo-600 mb-2" />
      <span class="text-xs">Mengambil rak buku dari Firestore...</span>
    </div>

    <!-- State Berhasil: Daftar Kartu Buku -->
    <div v-else-if="booksList.length > 0" class="flex flex-col gap-3">
      <BookCard 
        v-for="book in booksList" 
        :key="book.id" 
        :book="book" 
      />
    </div>

    <!-- State Kosong (Empty State) -->
    <div v-else class="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-xs mt-2">
      <div class="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
        <component :is="tabInfo.icon" class="w-6 h-6 text-gray-400" />
      </div>
      <h3 class="text-sm font-semibold text-gray-700">Belum Ada Buku</h3>
      <p class="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
        Koleksi buku pada kategori <span class="font-medium text-gray-600">{{ tabInfo.title }}</span> belum ditambahkan di database.
      </p>
    </div>
  </div>
</template>