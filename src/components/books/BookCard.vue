<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Star, BookOpen, CheckCircle2, Bookmark } from '@lucide/vue'
import type { Book } from '../../types/book'

const props = defineProps<{
  book: Book
}>()

const router = useRouter()

// Menghitung persentase progres membaca
const progressPercentage = computed(() => {
  if (!props.book.totalPages || props.book.totalPages === 0) return 0
  const percentage = Math.round((props.book.currentPage / props.book.totalPages) * 100)
  return Math.min(percentage, 100)
})

// Fungsi navigasi ke halaman detail buku
const goToDetail = () => {
  router.push(`/book/${props.book.id}`)
}
</script>

<template>
  <div 
    @click="goToDetail"
    class="bg-white dark:bg-gray-900 rounded-2xl p-3 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer flex gap-3.5 items-stretch relative overflow-hidden select-none"
  >
    <!-- Gambar Sampul Buku -->
    <div class="relative w-20 h-28 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm">
      <img 
        v-if="book.coverUrl" 
        :src="book.coverUrl" 
        :alt="book.title"
        class="w-full h-full object-cover"
        loading="lazy"
      />
      <!-- Fallback jika tidak ada cover -->
      <div v-else class="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
        <BookOpen class="w-6 h-6 mb-1 opacity-60" />
        <span class="text-[9px] leading-tight line-clamp-2">No Cover</span>
      </div>

      <!-- Badge Status (Di Atas Cover) -->
      <div class="absolute top-1 left-1">
        <span 
          v-if="book.status === 'completed'" 
          class="p-1 rounded-lg bg-green-500/90 backdrop-blur-xs text-white flex items-center shadow-xs"
          title="Selesai"
        >
          <CheckCircle2 class="w-3 h-3" />
        </span>
        <span 
          v-else-if="book.status === 'reading'" 
          class="p-1 rounded-lg bg-indigo-500/90 backdrop-blur-xs text-white flex items-center shadow-xs"
          title="Sedang Dibaca"
        >
          <BookOpen class="w-3 h-3" />
        </span>
        <span 
          v-else-if="book.status === 'wishlist'" 
          class="p-1 rounded-lg bg-rose-500/90 backdrop-blur-xs text-white flex items-center shadow-xs"
          title="Wishlist"
        >
          <Bookmark class="w-3 h-3" />
        </span>
      </div>
    </div>

    <!-- Informasi Detail Buku -->
    <div class="flex flex-col justify-between flex-1 min-w-0 py-0.5">
      <div>
        <!-- Judul Buku -->
        <h3 class="text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug truncate pr-2">
          {{ book.title }}
        </h3>

        <!-- Penulis -->
        <p class="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
          {{ book.authors.join(', ') || 'Penulis Tidak Diketahui' }}
        </p>

        <!-- Rating Bintang (Jika ada) -->
        <div v-if="book.rating && book.rating > 0" class="flex items-center gap-1 mt-1.5">
          <div class="flex items-center text-amber-400">
            <Star 
              v-for="star in 5" 
              :key="star" 
              class="w-3 h-3"
              :class="star <= book.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-gray-700 fill-gray-200 dark:fill-gray-700'"
            />
          </div>
          <span class="text-[10px] font-semibold text-gray-600 dark:text-gray-400 ml-0.5">
            {{ book.rating.toFixed(1) }}
          </span>
        </div>
      </div>

      <!-- Bagian Bawah: Progress Bar / Status Halaman -->
      <div class="mt-2">
        <template v-if="book.status === 'reading'">
          <div class="flex justify-between items-center text-[10px] text-gray-500 dark:text-gray-400 mb-1">
            <span class="font-medium text-indigo-600 dark:text-indigo-400">{{ progressPercentage }}% selesai</span>
            <span>Hal {{ book.currentPage }} / {{ book.totalPages }}</span>
          </div>
          <!-- Progress Bar -->
          <div class="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              class="h-full bg-indigo-600 rounded-full transition-all duration-300"
              :style="{ width: `${progressPercentage}%` }"
            ></div>
          </div>
        </template>

        <template v-else-if="book.status === 'completed'">
          <p class="text-[10px] text-green-600 font-medium flex items-center gap-1">
            <CheckCircle2 class="w-3 h-3" />
            Telah tamat ({{ book.totalPages }} hal)
          </p>
        </template>

        <template v-else-if="book.status === 'wishlist'">
          <p class="text-[10px] text-gray-400">
            Total {{ book.totalPages }} halaman
          </p>
        </template>
      </div>
    </div>
  </div>
</template>