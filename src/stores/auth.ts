import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from 'firebase/auth'
import { loginWithGoogle, logoutAdmin, subscribeAuthState } from '../services/firebase'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null)
    const isLoading = ref<boolean>(true)

    // Status apakah admin sedang login
    const isAuthenticated = computed(() => user.value !== null)

    // Daftar email yang diizinkan sebagai Admin
    const ADMIN_EMAILS = [
        'saputraivanmaulana@gmail.com'
    ]

    // Inisialisasi Listener Firebase Auth
    const initAuth = (): Promise<User | null> => {
        return new Promise((resolve) => {
            subscribeAuthState(async (currentUser) => {
                if (currentUser && currentUser.email && ADMIN_EMAILS.includes(currentUser.email)) {
                    user.value = currentUser
                } else if (currentUser) {
                    // Jika bukan admin, logout otomatis
                    await logoutAdmin()
                    user.value = null
                } else {
                    user.value = null
                }
                isLoading.value = false
                resolve(user.value)
            })
        })
    }

    // Fungsi Login dengan Google
    const login = async (): Promise<boolean> => {
        isLoading.value = true
        const loggedInUser = await loginWithGoogle()
        
        if (loggedInUser && loggedInUser.email && ADMIN_EMAILS.includes(loggedInUser.email)) {
            user.value = loggedInUser
            isLoading.value = false
            return true
        } else if (loggedInUser) {
            await logoutAdmin()
            user.value = null
            isLoading.value = false
            return false
        }
        
        isLoading.value = false
        return false
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