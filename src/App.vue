<script setup lang="ts">
import BottomNav from './components/layout/BottomNav.vue'
</script>

<template>
  <div class="min-h-screen pb-20 max-w-md mx-auto relative">
    <!-- Konten Utama Halaman -->
    <main class="w-full">
      <router-view />
    </main>

    <!-- Navigasi Bawah -->
    <BottomNav />
  </div>
</template>