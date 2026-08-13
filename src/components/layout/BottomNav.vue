<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { BookOpen, BookmarkCheck, Heart, ShieldCheck } from '@lucide/vue'

const route = useRoute()

// Daftar menu navigasi bawah
const navItems = [
  {
    name: 'Read',
    path: '/',
    icon: BookOpen,
    // Aktif jika di halaman home dan tidak ada query tab khusus atau query tab = reading
    isActive: (currentPath: string, currentQuery: string) => 
      currentPath === '/' && (currentQuery === 'reading' || !currentQuery)
  },
  {
    name: 'Finished',
    path: '/?tab=completed',
    icon: BookmarkCheck,
    isActive: (currentPath: string, currentQuery: string) => 
      currentPath === '/' && currentQuery === 'completed'
  },
  {
    name: 'Wishlist',
    path: '/?tab=wishlist',
    icon: Heart,
    isActive: (currentPath: string, currentQuery: string) => 
      currentPath === '/' && currentQuery === 'wishlist'
  },
  {
    name: 'Admin',
    path: '/admin/dashboard',
    icon: ShieldCheck,
    isActive: (currentPath: string) => currentPath.startsWith('/admin')
  }
]

// Mengecek query 'tab' dari URL saat ini
const currentTabQuery = computed(() => (route.query.tab as string) || '')
</script>

<template>
  <nav 
    class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[400px] bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-[2rem] px-2 py-1.5"
  >
    <div class="flex justify-between items-center h-14">
      <router-link
        v-for="item in navItems"
        :key="item.name"
        :to="item.path"
        class="flex flex-col items-center justify-center flex-1 h-full rounded-full transition-all duration-300 select-none mx-0.5"
        :class="[
          item.isActive(route.path, currentTabQuery)
            ? 'text-[#96522A] bg-[#F2EFE8] font-medium'
            : 'text-gray-500 hover:text-gray-800 font-normal'
        ]"
      >
        <component 
          :is="item.icon" 
          class="w-[22px] h-[22px] mb-1 transition-transform duration-300"
          :class="{ 'stroke-[2.5px] scale-105': item.isActive(route.path, currentTabQuery) }"
        />
        <span class="text-[10px] tracking-tight">{{ item.name }}</span>
      </router-link>
    </div>
  </nav>
</template>

<style scoped>
/* Menangani ruang bawah khusus untuk smartphone berlayar poni / notch */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 1.5rem);
}
</style>