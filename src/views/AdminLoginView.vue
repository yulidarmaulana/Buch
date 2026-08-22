<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToast } from '../composables/useToast'
import { ShieldCheck, Loader2, ArrowLeft } from '@lucide/vue'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const handleGoogleLogin = async () => {
  const success = await authStore.login()
  if (success) {
    toast.success('Berhasil login sebagai Admin!')
    router.push('/admin/dashboard')
  } else {
    toast.error('Gagal melakukan login. Pastikan akun Google Anda terhubung.')
  }
}

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-[85vh] flex flex-col justify-between px-4 pt-6 pb-8">
    <!-- Header Back -->
    <div>
      <button 
        @click="goHome" 
        class="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors mb-6"
      >
        <ArrowLeft class="w-4 h-4 mr-1" />
        Kembali ke Rak Buku
      </button>

      <!-- Branding / Logo -->
      <div class="text-center mt-8">
        <div class="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xs">
          <ShieldCheck class="w-8 h-8" />
        </div>
        <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Portal Khusus Admin</h1>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
          Silakan masuk menggunakan akun Google Anda untuk mengelola koleksi buku dan ulasan.
        </p>
      </div>
    </div>

    <!-- Container Tombol Login -->
    <div class="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
      <button 
        @click="handleGoogleLogin"
        :disabled="authStore.isLoading"
        class="w-full py-3 bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-50"
      >
        <Loader2 v-if="authStore.isLoading" class="w-4 h-4 animate-spin" />
        <template v-else>
          <!-- SVG Logo Google -->
          <svg class="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/>
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
            <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-1.9z"/>
            <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
          </svg>
          Masuk dengan Google
        </template>
      </button>

      <p class="text-[10px] text-center text-gray-400 dark:text-gray-500 leading-normal">
        Pengunjung umum tidak perlu login untuk melihat ulasan & daftar buku.
      </p>
    </div>
  </div>
</template>