<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ArrowLeft, 
  Star, 
  BookOpen, 
  CheckCircle2, 
  Bookmark, 
  Calendar, 
  Quote, 
  Share2,
  Loader2,
  AlertCircle
} from '@lucide/vue'
import { getBookById } from '../services/firebase'
import type { Book } from '../types/book'

const route = useRoute()
const router = useRouter()

const isLoading = ref(true)
const book = ref<Book | null>(null)

// Mengambil detail data buku berdasarkan ID dari Firestore
const fetchBookDetail = async () => {
  isLoading.value = true
  const bookId = route.params.id as string
  if (bookId) {
    book.value = await getBookById(bookId)
  }
  isLoading.value = false
}

onMounted(() => {
  fetchBookDetail()
})

// Watcher untuk update data jika berpindah dari satu buku ke buku lain
watch(() => route.params.id, (newId) => {
  if (newId) fetchBookDetail()
})

// Persentase Progres Membaca
const progressPercentage = computed(() => {
  if (!book.value || !book.value.totalPages) return 0
  const percentage = Math.round((book.value.currentPage / book.value.totalPages) * 100)
  return Math.min(percentage, 100)
})

const goBack = () => {
  router.back()
}

// Fitur Bagikan (Web Share API)
const handleShare = async () => {
  if (navigator.share && book.value) {
    try {
      await navigator.share({
        title: book.value.title,
        text: `Ulasan buku ${book.value.title} oleh ${book.value.authors.join(', ')}`,
        url: window.location.href,
      })
    } catch {
      // User membatalkan dialog share
    }
  } else {
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('Tautan ulasan buku berhasil disalin!')
    } catch {
      alert('Gagal menyalin tautan.')
    }
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 max-w-md mx-auto transition-colors">
    <!-- State Loading -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-24 text-gray-400">
      <Loader2 class="w-8 h-8 animate-spin text-indigo-600 mb-2" />
      <span class="text-xs">Memuat detail buku dari database...</span>
    </div>

    <!-- State Tidak Ditemukan -->
    <div v-else-if="!book" class="p-8 text-center">
      <div class="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-3">
        <AlertCircle class="w-6 h-6" />
      </div>
      <h2 class="text-sm font-bold text-gray-900 dark:text-gray-100">Buku Tidak Ditemukan</h2>
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">
        Data buku mungkin telah dihapus atau tautan tidak valid.
      </p>
      <button 
        @click="goBack" 
        class="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl text-xs font-semibold"
      >
        Kembali ke Rak Buku
      </button>
    </div>

    <!-- State Berhasil Memuat Data -->
    <template v-else>
      <!-- Navigasi Atas -->
      <div class="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <button 
          @click="goBack" 
          class="p-2 -ml-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Detail Buku</span>
        <button 
          @click="handleShare" 
          class="p-2 -mr-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Share2 class="w-4 h-4" />
        </button>
      </div>

      <!-- Hero Header (Cover Blur + Image) -->
      <div class="relative overflow-hidden bg-gray-900 dark:bg-gray-950 pt-8 pb-10 px-4 flex flex-col items-center">
        <div 
          v-if="book.coverUrl"
          class="absolute inset-0 bg-cover bg-center blur-2xl opacity-30 scale-125"
          :style="{ backgroundImage: `url(${book.coverUrl})` }"
        ></div>

        <div class="relative z-10 w-32 h-48 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 mb-4 bg-gray-800 flex items-center justify-center">
          <img 
            v-if="book.coverUrl"
            :src="book.coverUrl" 
            :alt="book.title" 
            class="w-full h-full object-cover"
          />
          <BookOpen v-else class="w-8 h-8 text-gray-500" />
        </div>

        <div class="relative z-10 text-center max-w-xs">
          <h1 class="text-lg font-bold text-white leading-tight mb-1">{{ book.title }}</h1>
          <p class="text-xs text-gray-300 font-medium">
            {{ book.authors.length > 0 ? book.authors.join(', ') : 'Penulis Tidak Diketahui' }}
          </p>
        </div>
      </div>

      <!-- Detail Card Section -->
      <div class="px-4 -mt-4 relative z-20 space-y-4">
        
        <!-- Quick Stats -->
        <div class="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs flex items-center justify-around text-center">
          <!-- Rating -->
          <div>
            <span class="text-[10px] text-gray-400 dark:text-gray-500 block mb-0.5">Rating</span>
            <div class="flex items-center justify-center gap-1 text-amber-500">
              <Star class="w-4 h-4 fill-amber-400" />
              <span class="text-sm font-bold text-gray-900 dark:text-gray-100">
                {{ book.rating ? book.rating.toFixed(1) : '-' }}
              </span>
            </div>
          </div>

          <div class="w-px h-8 bg-gray-100 dark:bg-gray-800"></div>

          <!-- Total Halaman -->
          <div>
            <span class="text-[10px] text-gray-400 dark:text-gray-500 block mb-0.5">Halaman</span>
            <span class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ book.totalPages || 0 }} hal</span>
          </div>

          <div class="w-px h-8 bg-gray-100 dark:bg-gray-800"></div>

          <!-- Status -->
          <div>
            <span class="text-[10px] text-gray-400 dark:text-gray-500 block mb-0.5">Status</span>
            <span 
              class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
              :class="{
                'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400': book.status === 'reading',
                'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400': book.status === 'completed',
                'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400': book.status === 'wishlist'
              }"
            >
              <BookOpen v-if="book.status === 'reading'" class="w-3 h-3" />
              <CheckCircle2 v-else-if="book.status === 'completed'" class="w-3 h-3" />
              <Bookmark v-else class="w-3 h-3" />
              {{ book.status === 'reading' ? 'Dibaca' : book.status === 'completed' ? 'Tamat' : 'Wishlist' }}
            </span>
          </div>
        </div>

        <!-- Progress bar (jika status reading) -->
        <div v-if="book.status === 'reading'" class="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs">
          <div class="flex justify-between items-center text-xs text-gray-600 dark:text-gray-300 mb-2">
            <span class="font-semibold text-indigo-600 dark:text-indigo-400">Progres Membaca</span>
            <span class="font-medium">{{ book.currentPage || 0 }} dari {{ book.totalPages || 0 }} hal ({{ progressPercentage }}%)</span>
          </div>
          <div class="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              class="h-full bg-indigo-600 rounded-full transition-all duration-300"
              :style="{ width: `${progressPercentage}%` }"
            ></div>
          </div>
        </div>

        <!-- Ulasan / Catatan -->
        <div class="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs">
          <div class="flex items-center gap-2 mb-3">
            <Quote class="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 class="text-sm font-bold text-gray-900 dark:text-gray-100">Catatan & Ulasan Pribadi</h2>
          </div>

          <div v-if="book.review" class="text-xs text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800 p-3.5 rounded-xl border border-gray-100 dark:border-gray-700 whitespace-pre-line">
            "{{ book.review }}"
          </div>

          <p v-else class="text-xs text-gray-400 italic">
            Belum ada ulasan atau catatan pribadi yang ditambahkan untuk buku ini.
          </p>

          <div v-if="book.startedAt || book.finishedAt" class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500">
            <span v-if="book.startedAt" class="flex items-center gap-1">
              <Calendar class="w-3 h-3" />
              Mulai: {{ book.startedAt }}
            </span>
            <span v-if="book.finishedAt" class="flex items-center gap-1">
              <CheckCircle2 class="w-3 h-3 text-green-500" />
              Selesai: {{ book.finishedAt }}
            </span>
          </div>
        </div>

      </div>
    </template>
  </div>
</template>