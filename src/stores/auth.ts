import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from 'firebase/auth'
import { loginWithGoogle, logoutAdmin, subscribeAuthState } from '../services/firebase'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null)
    const isLoading = ref<boolean>(true)

    // Status apakah admin sedang login
    const isAuthenticated = computed(() => user.value !== null)

    // Inisialisasi Listener Firebase Auth
    const initAuth = (): Promise<User | null> => {
        return new Promise((resolve) => {
            subscribeAuthState((currentUser) => {
                user.value = currentUser
                isLoading.value = false
                resolve(currentUser)
            })
        })
    }

    // Fungsi Login dengan Google
    const login = async (): Promise<boolean> => {
        isLoading.value = true
        const loggedInUser = await loginWithGoogle()
        user.value = loggedInUser
        isLoading.value = false
        return loggedInUser !== null
    }

    // Fungsi Logout
    const logout = async (): Promise<boolean> => {
        isLoading.value = true
        const success = await logoutAdmin()
        if (success) {
            user.value = null
        }
        isLoading.value = false
        return success
    }

    return {
        user,
        isLoading,
        isAuthenticated,
        initAuth,
        login,
        logout
    }
})