# AI Context & Coding Guidelines

## 1. Project Overview
Aplikasi web *reading tracker* (pencatat daftar buku yang dibaca) berkonsep **Public Reading Portfolio / Personal Showcase**.
- **Public View:** Pengunjung umum dapat melihat daftar buku, statistik bacaan, rating, dan ulasan secara *read-only*.
- **Admin View:** Pemilik web dapat login untuk menambah, mengedit, dan menghapus data buku.
- **Mobile-First Design:** Dioptimalkan untuk layar *smartphone* dengan navigasi bawah (*Bottom Navigation Bar*) dan dukungan PWA via `@vite-pwa/vue`.

---

## 2. Tech Stack
- **Build Tool / Framework:** Vite + Vue 3 (Script Setup / Composition API)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Lucide Vue (Icons)
- **State Management:** Pinia (Opsional, untuk menyimpan state User/Auth)
- **Routing:** Vue Router
- **Database & Auth:** Firebase (Cloud Firestore & Firebase Auth)
- **External API:** Google Books API (untuk pencarian data buku)
- **Deployment:** Vercel atau Netlify

---

## 3. Project Structure
├── src/
│   ├── assets/            # CSS, logo, dll
│   ├── components/        # Komponen UI
│   │   ├── BottomNav.vue
│   │   ├── BookCard.vue
│   │   └── BookSearchModal.vue
│   ├── views/             # Halaman utama (Routed)
│   │   ├── HomeView.vue   # Halaman Publik (Rak Buku)
│   │   ├── BookDetailView.vue
│   │   └── AdminView.vue  # Halaman Login/Manage Admin
│   ├── router/
│   │   └── index.ts       # Konfigurasi Vue Router
│   ├── services/
│   │   ├── firebase.ts    # Inisialisasi Firebase
│   │   └── googleBooks.ts # Fetcher Google Books API
│   ├── types/
│   │   └── book.ts        # TypeScript interfaces
│   ├── App.vue
│   └── main.ts
├── index.html
└── vite.config.ts