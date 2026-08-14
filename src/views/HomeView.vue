<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { BookOpen, BookmarkCheck, Heart, Loader2, RefreshCw, Library, Search, Moon, Sun } from '@lucide/vue'
import BookCard from '../components/books/BookCard.vue'
import { getBooksByStatus } from '../services/firebase'
import type { Book, BookStatus } from '../types/book'

const route = useRoute()

// State Data Real-Time
const booksList = ref<Book[]>([])
const isLoading = ref(true)

// Mendapatkan tab aktif dari Query URL (?tab=reading, ?tab=completed, ?tab=wishlist)
const currentTab = computed<BookStatus | 'all'>(() => {
  const tab = route.query.tab as string
  if (tab === 'reading' || tab === 'completed' || tab === 'wishlist') {
    return tab as BookStatus
  }
  return 'all'
})

// Fungsi untuk mengambil data buku asli dari Firestore
const fetchBooks = async () => {
  isLoading.value = true
  booksList.value = await getBooksByStatus(currentTab.value)
  isLoading.value = false
}

// State pencarian lokal
const searchQuery = ref('')

// Computed property untuk memfilter daftar buku berdasarkan pencarian
const filteredBooks = computed(() => {
  if (!searchQuery.value.trim()) return booksList.value
  const q = searchQuery.value.toLowerCase()
  return booksList.value.filter(book => 
    book.title.toLowerCase().includes(q) || 
    (book.authors && book.authors.some(author => author.toLowerCase().includes(q)))
  )
})

// Panggil saat komponen dimuat
onMounted(() => {
  fetchBooks()
  
  // Deteksi mode gelap dari localStorage atau preferensi sistem
  if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
  } else {
    isDarkMode.value = false
    document.documentElement.classList.remove('dark')
  }
})

// State untuk Dark Mode
const isDarkMode = ref(false)

// Fungsi toggle dark mode
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

// Watcher: Ambil data ulang dari Firestore saat pengguna berpindah tab navigasi bawah
watch(currentTab, () => {
  searchQuery.value = ''
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
        badgeColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      }
    case 'wishlist':
      return {
        title: 'Wishlist Buku',
        description: 'Daftar buku yang ingin Anda baca di masa depan.',
        icon: Heart,
        badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
      }
    case 'reading':
      return {
        title: 'Sedang Dibaca',
        description: 'Buku-buku yang saat ini sedang Anda nikmati.',
        icon: BookOpen,
        badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
      }
    case 'all':
    default:
      return {
        title: 'Semua Buku',
        description: 'Keseluruhan daftar buku di rak Anda.',
        icon: Library,
        badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
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
          <h1 class="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{{ tabInfo.title }}</h1>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 pl-1">{{ tabInfo.description }}</p>
      </div>

      <!-- Tombol Aksi Header -->
      <div class="flex items-center gap-1">
        <!-- Tombol Toggle Dark Mode -->
        <button 
          @click="toggleDarkMode"
          class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          :title="isDarkMode ? 'Beralih ke Terang' : 'Beralih ke Gelap'"
        >
          <Sun v-if="isDarkMode" class="w-4 h-4" />
          <Moon v-else class="w-4 h-4" />
        </button>

        <!-- Tombol Refresh Data -->
        <button 
          @click="fetchBooks"
          :disabled="isLoading"
          class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors active:rotate-180"
          title="Muat Ulang"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
        </button>
      </div>
    </header>

    <!-- Search Bar Lokal -->
    <div v-if="!isLoading && booksList.length > 0" class="mb-5 relative">
      <Search class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input 
        v-model="searchQuery"
        type="text" 
        placeholder="Cari judul buku atau penulis..."
        class="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
      />
    </div>

    <!-- State Loading -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-16 text-gray-400">
      <Loader2 class="w-7 h-7 animate-spin text-indigo-600 dark:text-indigo-400 mb-2" />
      <span class="text-xs">Mengambil rak buku dari Firestore...</span>
    </div>

    <!-- State Berhasil: Daftar Kartu Buku -->
    <div v-else-if="filteredBooks.length > 0" class="flex flex-col gap-3">
      <BookCard 
        v-for="book in filteredBooks" 
        :key="book.id" 
        :book="book" 
      />
    </div>

    <!-- State Pencarian Kosong -->
    <div v-else-if="searchQuery && filteredBooks.length === 0" class="bg-white dark:bg-gray-900 rounded-2xl p-8 text-center border border-gray-100 dark:border-gray-800 shadow-xs mt-2">
      <div class="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
        <Search class="w-5 h-5 text-gray-400" />
      </div>
      <h3 class="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">Tidak Ditemukan</h3>
      <p class="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
        Buku dengan kata kunci "<span class="font-semibold">{{ searchQuery }}</span>" tidak ada di rak ini.
      </p>
    </div>

    <!-- State Kosong (Empty State) Rak -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border border-gray-100 dark:border-gray-700 shadow-xs mt-2">
      <div class="w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-3">
        <component :is="tabInfo.icon" class="w-6 h-6 text-gray-400" />
      </div>
      <h3 class="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">Rak Masih Kosong</h3>
      <p class="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
        Belum ada buku di kategori ini. Anda bisa menambahkan buku baru melalui menu Admin.
      </p>
    </div>
  </div>
</template>