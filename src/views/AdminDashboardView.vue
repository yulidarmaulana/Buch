<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { 
  addBook, 
  updateBook, 
  deleteBook, 
  getBooksByStatus 
} from '../services/firebase'
import BookSearchModal from '../components/books/BookSearchModal.vue'
import type { Book, BookStatus, GoogleBookSearchResult } from '../types/book'
import { 
  ShieldCheck, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  LogOut, 
  X, 
  Loader2, 
  Star,
  ArrowLeft
} from '@lucide/vue'

import { useToast } from '../composables/useToast'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

// State UI & Form
const isSearchModalOpen = ref(false)
const isLoadingData = ref(false)
const isSubmitting = ref(false)
const activeTabFilter = ref<BookStatus>('reading')
const booksList = ref<Book[]>([])
const editingBookId = ref<string | null>(null)

// Model Form Input Buku
const form = ref<{
  googleBooksId: string
  title: string
  authors: string
  genre: string
  coverUrl: string
  totalPages: number
  currentPage: number
  status: BookStatus
  rating: number
  review: string
  startedAt: string
  finishedAt: string
}>({
  googleBooksId: '',
  title: '',
  authors: '',
  genre: '',
  coverUrl: '',
  totalPages: 0,
  currentPage: 0,
  status: 'reading',
  rating: 5,
  review: '',
  startedAt: new Date().toISOString().split('T')[0],
  finishedAt: ''
})

// Mengambil daftar buku dari Firestore berdasarkan tab aktif
const loadBooks = async () => {
  isLoadingData.value = true
  booksList.value = await getBooksByStatus(activeTabFilter.value)
  isLoadingData.value = false
}

onMounted(() => {
  loadBooks()
})

// Mengisi form dari hasil pencarian Google Books API
const handleSelectGoogleBook = (selected: GoogleBookSearchResult) => {
  form.value.googleBooksId = selected.id
  form.value.title = selected.title
  form.value.authors = selected.authors.join(', ')
  form.value.genre = selected.genre || ''
  form.value.coverUrl = selected.coverUrl
  form.value.totalPages = selected.totalPages || 0
}

// Reset Form Input
const resetForm = () => {
  editingBookId.value = null
  form.value = {
    googleBooksId: '',
    title: '',
    authors: '',
    genre: '',
    coverUrl: '',
    totalPages: 0,
    currentPage: 0,
    status: 'reading',
    rating: 5,
    review: '',
    startedAt: new Date().toISOString().split('T')[0],
    finishedAt: ''
  }
}

// Memuat data buku yang dipilih ke dalam form untuk diedit
const startEdit = (book: Book) => {
  editingBookId.value = book.id
  form.value = {
    googleBooksId: book.googleBooksId || '',
    title: book.title,
    authors: book.authors.join(', '),
    genre: book.genre || '',
    coverUrl: book.coverUrl || '',
    totalPages: book.totalPages || 0,
    currentPage: book.currentPage || 0,
    status: book.status,
    rating: book.rating || 5,
    review: book.review || '',
    startedAt: book.startedAt || '',
    finishedAt: book.finishedAt || ''
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Submit Tambah / Edit Buku ke Firestore
const handleSubmit = async () => {
  if (!form.value.title.trim()) {
    toast.warning('Judul buku tidak boleh kosong!')
    return
  }

  isSubmitting.value = true

  const authorsArray = form.value.authors
    .split(',')
    .map(a => a.trim())
    .filter(a => a.length > 0)

  const payload: Omit<Book, 'id'> = {
    googleBooksId: form.value.googleBooksId,
    title: form.value.title,
    authors: authorsArray,
    genre: form.value.genre.trim(),
    coverUrl: form.value.coverUrl,
    totalPages: Number(form.value.totalPages) || 0,
    currentPage: Number(form.value.currentPage) || 0,
    status: form.value.status,
    rating: Number(form.value.rating) || 0,
    review: form.value.review,
    startedAt: form.value.startedAt,
    finishedAt: form.value.status === 'completed' ? (form.value.finishedAt || new Date().toISOString().split('T')[0]) : '',
    createdAt: new Date().toISOString()
  }

  if (editingBookId.value) {
    // Mode Update Data
    const success = await updateBook(editingBookId.value, payload)
    if (success) {
      toast.success('Data buku berhasil diperbarui!')
      resetForm()
      await loadBooks()
    } else {
      toast.error('Gagal memperbarui data buku.')
    }
  } else {
    // Mode Tambah Data Baru
    const newId = await addBook(payload)
    if (newId) {
      toast.success('Buku baru berhasil ditambahkan ke rak!')
      resetForm()
      await loadBooks()
    } else {
      toast.error('Gagal menambahkan buku ke rak.')
    }
  }

  isSubmitting.value = false
}

// Hapus Buku
const handleDelete = async (id: string, title: string) => {
  const confirmed = await toast.showConfirm({
    title: 'Hapus Buku',
    message: `Apakah Anda yakin ingin menghapus "${title}" dari database?`,
    confirmText: 'Hapus',
    cancelText: 'Batal',
    isDanger: true
  })

  if (confirmed) {
    const success = await deleteBook(id)
    if (success) {
      toast.success(`Buku "${title}" berhasil dihapus.`)
      await loadBooks()
    } else {
      toast.error('Gagal menghapus buku dari database.')
    }
  }
}

// Handler Logout Admin
const handleLogout = async () => {
  const confirmed = await toast.showConfirm({
    title: 'Logout Admin',
    message: 'Apakah Anda yakin ingin keluar dari sesi Admin?',
    confirmText: 'Logout',
    cancelText: 'Batal',
    isDanger: true
  })

  if (confirmed) {
    await authStore.logout()
    toast.info('Berhasil keluar dari akun Admin.')
    router.push('/admin/login')
  }
}

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="px-4 pt-6 pb-24 max-w-md mx-auto">
    <!-- Top Bar Admin Header -->
    <div class="flex items-center justify-between mb-4">
      <button 
        @click="goHome" 
        class="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
      >
        <ArrowLeft class="w-4 h-4 mr-1" />
        Ke Rak Buku
      </button>
      
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
          <ShieldCheck class="w-3 h-3" />
          Admin
        </span>
        <button 
          @click="handleLogout"
          class="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          title="Logout"
        >
          <LogOut class="w-4 h-4" />
        </button>
      </div>
    </div>

    <header class="mb-6">
      <h1 class="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Dashboard Kelola Buku</h1>
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Tambah buku baru atau perbarui progres bacaan Anda.</p>
    </header>

    <!-- FORM INPUT BUKU -->
    <div class="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm mb-8">
      <div class="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
        <h2 class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
          <Edit3 class="w-4 h-4" />
          {{ editingBookId ? 'Edit Data Buku' : 'Tambah Buku Baru' }}
        </h2>
        
        <button 
          v-if="editingBookId"
          @click="resetForm"
          class="text-[11px] text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1"
        >
          <X class="w-3.5 h-3.5" /> Batal Edit
        </button>
      </div>

      <!-- Tombol Pemicu Modal Cari Google Books -->
      <button 
        type="button"
        @click="isSearchModalOpen = true"
        class="w-full mb-4 py-2.5 px-3 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
      >
        <Search class="w-4 h-4" />
        Cari & Auto-fill via Google Books
      </button>

      <form @submit.prevent="handleSubmit" class="space-y-3.5 text-xs">
        <!-- Judul -->
        <div>
          <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Judul Buku *</label>
          <input 
            v-model="form.title" 
            type="text" 
            placeholder="Contoh: Atomic Habits"
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <!-- Penulis -->
        <div>
          <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Penulis (Pisahkan dengan koma)</label>
          <input 
            v-model="form.authors" 
            type="text" 
            placeholder="Contoh: James Clear, John Doe"
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <!-- Genre / Kategori -->
        <div>
          <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori / Genre</label>
          <input 
            v-model="form.genre" 
            type="text" 
            placeholder="Contoh: Self-Help, Fiction, dll."
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <!-- URL Cover & Preview -->
        <div class="grid grid-cols-4 gap-2 items-center">
          <div class="col-span-3">
            <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">URL Gambar Sampul</label>
            <input 
              v-model="form.coverUrl" 
              type="text" 
              placeholder="https://..."
              class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[11px]"
            />
          </div>
          <div class="col-span-1 flex justify-center">
            <div class="w-10 h-14 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 flex items-center justify-center text-[9px] text-gray-400 dark:text-gray-500">
              <img v-if="form.coverUrl" :src="form.coverUrl" class="w-full h-full object-cover" />
              <span v-else>No Cover</span>
            </div>
          </div>
        </div>

        <!-- Status Membaca -->
        <div>
          <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Status Membaca</label>
          <select 
            v-model="form.status"
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="reading">Sedang Dibaca</option>
            <option value="completed">Selesai Dibaca</option>
            <option value="wishlist">Wishlist</option>
          </select>
        </div>

        <!-- Halaman Total & Progress -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Halaman Saat Ini</label>
            <input 
              v-model.number="form.currentPage" 
              type="number" 
              min="0"
              class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Total Halaman</label>
            <input 
              v-model.number="form.totalPages" 
              type="number" 
              min="0"
              class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <!-- Rating Bintang -->
        <div>
          <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Rating Pribadi (1 - 5)</label>
          <div class="flex items-center gap-1.5">
            <button 
              type="button" 
              v-for="star in 5" 
              :key="star"
              @click="form.rating = star"
              class="p-1 focus:outline-none"
            >
              <Star 
                class="w-5 h-5" 
                :class="star <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-700'"
              />
            </button>
            <span class="text-xs font-semibold text-gray-600 dark:text-gray-400 ml-2">{{ form.rating }} Bintang</span>
          </div>
        </div>

        <!-- Catatan / Ulasan -->
        <div>
          <label class="block font-medium text-gray-700 dark:text-gray-300 mb-1">Catatan & Ulasan Pribadi</label>
          <textarea 
            v-model="form.review" 
            rows="3"
            placeholder="Tulis opini, ringkasan, atau kutipan favorit dari buku ini..."
            class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          ></textarea>
        </div>

        <!-- Tombol Submit -->
        <button 
          type="submit" 
          :disabled="isSubmitting"
          class="w-full py-3 bg-orange-500 dark:bg-orange-600 hover:bg-orange-400 dark:hover:bg-orange-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
        >
          <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
          <template v-else>
            <Plus v-if="!editingBookId" class="w-4 h-4" />
            {{ editingBookId ? 'Simpan Perubahan' : 'Tambahkan ke Rak Buku' }}
          </template>
        </button>
      </form>
    </div>

    <!-- DAFTAR KELOLA BUKU TERBAIK -->
    <div class="space-y-3">
      <h3 class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Daftar Buku di Database</h3>

      <!-- Tab Filter -->
      <div class="flex bg-gray-200/60 dark:bg-gray-800/60 p-1 rounded-xl text-xs font-medium">
        <button 
          @click="activeTabFilter = 'reading'; loadBooks()"
          class="flex-1 py-1.5 rounded-lg transition-all"
          :class="activeTabFilter === 'reading' ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-semibold' : 'text-gray-500 dark:text-gray-400'"
        >
          Dibaca
        </button>
        <button 
          @click="activeTabFilter = 'completed'; loadBooks()"
          class="flex-1 py-1.5 rounded-lg transition-all"
          :class="activeTabFilter === 'completed' ? 'bg-white dark:bg-gray-900 text-green-600 dark:text-green-400 shadow-2xs font-semibold' : 'text-gray-500 dark:text-gray-400'"
        >
          Selesai
        </button>
        <button 
          @click="activeTabFilter = 'wishlist'; loadBooks()"
          class="flex-1 py-1.5 rounded-lg transition-all"
          :class="activeTabFilter === 'wishlist' ? 'bg-white dark:bg-gray-900 text-rose-600 dark:text-rose-400 shadow-2xs font-semibold' : 'text-gray-500 dark:text-gray-400'"
        >
          Wishlist
        </button>
      </div>

      <!-- State Loading Data -->
      <div v-if="isLoadingData" class="py-8 text-center text-gray-400">
        <Loader2 class="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-600" />
        <span class="text-xs">Mengambil koleksi dari Firestore...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="booksList.length === 0" class="bg-white dark:bg-gray-900 rounded-2xl p-6 text-center border border-gray-100 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-500">
        Belum ada buku dalam kategori ini.
      </div>

      <!-- List Items -->
      <div v-else class="space-y-2">
        <div 
          v-for="book in booksList" 
          :key="book.id"
          class="bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-800 shadow-2xs flex items-center justify-between gap-3"
        >
          <div class="flex items-center gap-3 min-w-0">
            <img 
              v-if="book.coverUrl" 
              :src="book.coverUrl" 
              class="w-10 h-14 object-cover rounded-md flex-shrink-0 bg-gray-100 dark:bg-gray-800" 
            />
            <div class="min-w-0">
              <h4 class="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">{{ book.title }}</h4>
              <p class="text-[11px] text-gray-500 dark:text-gray-400 truncate">{{ book.authors.join(', ') }}</p>
              <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Hal. {{ book.currentPage }} / {{ book.totalPages }}</p>
            </div>
          </div>

          <!-- Action Buttons Edit & Delete -->
          <div class="flex items-center gap-1">
            <button 
              @click="startEdit(book)"
              class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
              title="Edit Data"
            >
              <Edit3 class="w-4 h-4" />
            </button>
            <button 
              @click="handleDelete(book.id, book.title)"
              class="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
              title="Hapus Buku"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Component Modal Search Google Books -->
    <BookSearchModal 
      :is-open="isSearchModalOpen"
      @close="isSearchModalOpen = false"
      @select="handleSelectGoogleBook"
    />
  </div>
</template>