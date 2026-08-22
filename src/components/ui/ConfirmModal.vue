<script setup lang="ts">
import { useToast } from '../../composables/useToast'
import { AlertTriangle, HelpCircle } from '@lucide/vue'

const { isConfirmOpen, confirmData, handleConfirm, handleCancel } = useToast()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isConfirmOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        @click.self="handleCancel"
      >
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            class="w-full max-w-xs bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-2xl border border-gray-100 dark:border-gray-800 text-center"
          >
            <!-- Icon -->
            <div
              class="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
              :class="confirmData.isDanger ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400' : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'"
            >
              <AlertTriangle v-if="confirmData.isDanger" class="w-6 h-6" />
              <HelpCircle v-else class="w-6 h-6" />
            </div>

            <!-- Title & Message -->
            <h3 class="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">
              {{ confirmData.title }}
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-5">
              {{ confirmData.message }}
            </p>

            <!-- Buttons -->
            <div class="grid grid-cols-2 gap-2 text-xs font-semibold">
              <button
                @click="handleCancel"
                class="py-2.5 px-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {{ confirmData.cancelText }}
              </button>
              <button
                @click="handleConfirm"
                class="py-2.5 px-3 rounded-xl text-white transition-all shadow-sm active:scale-[0.98]"
                :class="confirmData.isDanger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'"
              >
                {{ confirmData.confirmText }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
