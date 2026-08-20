import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/HomeView.vue'),
        meta: { title: 'Rak Buku Saya' }
    },
    {
        path: '/book/:id',
        name: 'BookDetail',
        component: () => import('../views/BookDetailView.vue'),
        meta: { title: 'Detail Buku' }
    },
    {
        path: '/admin/login',
        name: 'AdminLogin',
        component: () => import('../views/AdminLoginView.vue'),
        meta: { title: 'Login Admin' }
    },
    {
        path: '/admin/dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/AdminDashboardView.vue'),
        meta: {
            title: 'Dashboard Admin',
            requiresAuth: true // Proteksi khusus Admin
        }
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior() {
        return { top: 0 }
    }
})

// Navigation Guard dengan Pinia Auth Store
router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore()

    // Pastikan status auth Firebase selesai dimuat pertama kali
    if (authStore.isLoading) {
        await authStore.initAuth()
    }

    // Update Judul Halaman Browser
    if (to.meta.title) {
        document.title = `${to.meta.title} - Reading Tracker`
    }

    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

    // Jika halaman butuh Auth dan user belum login -> Tendang ke /admin/login
    if (requiresAuth && !authStore.isAuthenticated) {
        next({ name: 'AdminLogin' })
    }
    // Jika user sudah login dan coba buka halaman login -> Redirection otomatis ke dashboard
    else if (to.name === 'AdminLogin' && authStore.isAuthenticated) {
        next({ name: 'AdminDashboard' })
    }
    else {
        next()
    }
})

export default router