<script setup lang="ts">
import { useToast } from '../../composables/useToast'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from '@lucide/vue'

const { toasts, removeToast } = useToast()
</script>

<template>
  <div class="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
    <TransitionGroup
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-3 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 -translate-y-2 scale-95"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-center justify-between gap-2.5 px-4 py-3 rounded-2xl shadow-lg border backdrop-blur-md transition-all text-xs font-medium"
        :class="{
          'bg-white/95 dark:bg-gray-900/95 border-emerald-500/20 text-gray-800 dark:text-gray-100 shadow-emerald-500/5': toast.type === 'success',
          'bg-white/95 dark:bg-gray-900/95 border-rose-500/20 text-gray-800 dark:text-gray-100 shadow-rose-500/5': toast.type === 'error',
          'bg-white/95 dark:bg-gray-900/95 border-amber-500/20 text-gray-800 dark:text-gray-100 shadow-amber-500/5': toast.type === 'warning',
          'bg-white/95 dark:bg-gray-900/95 border-indigo-500/20 text-gray-800 dark:text-gray-100 shadow-indigo-500/5': toast.type === 'info',
        }"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <div
            class="p-1 rounded-lg flex-shrink-0"
            :class="{
              'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400': toast.type === 'success',
              'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400': toast.type === 'error',
              'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400': toast.type === 'warning',
              'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400': toast.type === 'info',
            }"
          >
            <CheckCircle2 v-if="toast.type === 'success'" class="w-4 h-4" />
            <AlertCircle v-else-if="toast.type === 'error'" class="w-4 h-4" />
            <AlertTriangle v-else-if="toast.type === 'warning'" class="w-4 h-4" />
            <Info v-else class="w-4 h-4" />
          </div>
          <span class="truncate">{{ toast.message }}</span>
        </div>

        <button
          @click="removeToast(toast.id)"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg transition-colors flex-shrink-0"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
