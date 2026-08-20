import { initializeApp } from 'firebase/app'
import {
    getFirestore,
    collection,
    getDocs,
    getDoc,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
} from 'firebase/firestore'
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    type User
} from 'firebase/auth'
import type { Book, BookStatus } from '../types/book'

// Helper untuk membersihkan tanda kutip (quotes) atau spasi yang tidak sengaja terbawa dari GitHub Secrets
const cleanEnv = (val?: string) => (val || '').replace(/^["']|["']$/g, '').trim()

// 1. Konfigurasi Firebase dari File Environment Variable (.env.local / GitHub Secrets)
const firebaseConfig = {
    apiKey: cleanEnv(import.meta.env.VITE_FIREBASE_API_KEY),
    authDomain: cleanEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
    projectId: cleanEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID),
    storageBucket: cleanEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: cleanEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
    appId: cleanEnv(import.meta.env.VITE_FIREBASE_APP_ID),
}

// Inisialisasi Firebase App, Firestore DB, dan Auth
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

// Reference Koleksi Firestore
const BOOKS_COLLECTION = 'books'

// ==========================================
// A. HELPER FIRESTORE (CRUD DATA BUKU)
// ==========================================

/**
 * Mengambil daftar buku dari Firestore berdasarkan status (reading / completed / wishlist / all)
 */
export const getBooksByStatus = async (status: BookStatus | 'all'): Promise<Book[]> => {
    try {
        // Hapus orderBy('createdAt', 'desc') dari query Firebase 
        // untuk menghindari error "Query requires an index".
        let q;
        if (status === 'all') {
            q = query(collection(db, BOOKS_COLLECTION))
        } else {
            q = query(
                collection(db, BOOKS_COLLECTION),
                where('status', '==', status)
            )
        }
        const querySnapshot = await getDocs(q)

        // Sorting dilakukan di sisi client (JavaScript)
        const books = querySnapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
        } as Book))

        // Urutkan dari yang terbaru (descending)
        return books.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime()
            const dateB = new Date(b.createdAt || 0).getTime()
            return dateB - dateA
        })
    } catch (error) {
        console.error('Gagal mengambil data buku:', error)
        return []
    }
}

/**
 * Mengambil rincian detail 1 buku berdasarkan ID
 */
export const getBookById = async (id: string): Promise<Book | null> => {
    try {
        const docRef = doc(db, BOOKS_COLLECTION, id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Book
        }
        return null
    } catch (error) {
        console.error('Gagal mengambil detail buku:', error)
        return null
    }
}

/**
 * Menambahkan buku baru ke database
 */
export const addBook = async (bookData: Omit<Book, 'id'>): Promise<string | null> => {
    try {
        const docRef = await addDoc(collection(db, BOOKS_COLLECTION), {
            ...bookData,
            createdAt: new Date().toISOString()
        })
        return docRef.id
    } catch (error) {
        console.error('Gagal menambah buku:', error)
        return null
    }
}

/**
 * Memperbarui data buku yang ada (misal: update halaman, ulasan, atau status)
 */
export const updateBook = async (id: string, updatedData: Partial<Book>): Promise<boolean> => {
    try {
        const docRef = doc(db, BOOKS_COLLECTION, id)
        await updateDoc(docRef, {
            ...updatedData,
            updatedAt: new Date().toISOString()
        })
        return true
    } catch (error) {
        console.error('Gagal mengedit buku:', error)
        return false
    }
}

/**
 * Menghapus data buku
 */
export const deleteBook = async (id: string): Promise<boolean> => {
    try {
        const docRef = doc(db, BOOKS_COLLECTION, id)
        await deleteDoc(docRef)
        return true
    } catch (error) {
        console.error('Gagal menghapus buku:', error)
        return false
    }
}

// ==========================================
// B. HELPER FIREBASE AUTHENTICATION (ADMIN)
// ==========================================

/**
 * Login Admin menggunakan Google Sign-In
 */
export const loginWithGoogle = async (): Promise<User | null> => {
    try {
        const result = await signInWithPopup(auth, googleProvider)
        return result.user
    } catch (error) {
        console.error('Gagal Login dengan Google:', error)
        return null
    }
}

/**
 * Logout Admin
 */
export const logoutAdmin = async (): Promise<boolean> => {
    try {
        await signOut(auth)
        return true
    } catch (error) {
        console.error('Gagal Logout:', error)
        return false
    }
}

/**
 * Observer untuk mendeteksi perubahan status login (LoggedIn / LoggedOut)
 */
export const subscribeAuthState = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback)
}