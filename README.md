# 📚 Buch - Reading Tracker

Buch adalah aplikasi web *Reading Tracker* (Pelacak Bacaan) berdesain modern dan *mobile-first*. Aplikasi ini dirancang untuk membantu Anda melacak progres membaca buku, mencatat ulasan pribadi, dan menyusun daftar keinginan buku (*wishlist*).

Aplikasi ini memiliki dua sisi: tampilan publik bagi siapa saja untuk melihat koleksi buku Anda, dan portal admin (terlindungi) untuk mengelola data koleksi Anda sendiri.

---

## ✨ Fitur Utama

- **Manajemen Koleksi**: Kategorikan buku ke dalam "Sedang Dibaca", "Selesai", atau "Wishlist".
- **Detail & Progres**: Lacak persentase halaman yang dibaca, beri rating bintang, dan tulis ulasan pribadi.
- **Pencarian Otomatis (Auto-fill)**: Integrasi dengan **OpenLibrary API** untuk mencari buku dan mengisi metadata (judul, penulis, sampul) secara otomatis tanpa perlu mengetik manual.
- **Admin Dashboard Terlindungi**: Area manajemen khusus admin yang dilindungi oleh autentikasi Google.
- **Desain UI/UX Modern**: Tampilan ramah seluler (*mobile-first*) yang dilengkapi dengan efek *glassmorphism* dan transisi yang halus.

---

## 🛠️ Tech Stack

- **Frontend**: [Vue 3](https://vuejs.org/) (Composition API), [Vite](https://vitejs.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Backend (BaaS)**: Firebase (Firestore Database & Authentication)
- **Eksternal API**: OpenLibrary Search API

---

## 🚀 Panduan Instalasi (Lokal)

Jika Anda ingin menjalankan atau mengembangkan proyek ini di komputer lokal, ikuti langkah-langkah berikut:

### 1. Prasyarat
Pastikan Anda telah menginstal [Node.js](https://nodejs.org/) (disarankan versi 18+) dan `npm` (atau `pnpm`).

### 2. Kloning Repositori
```bash
git clone https://github.com/username/buch.git
cd buch
```

### 3. Instalasi Dependensi
```bash
npm install
```

### 4. Konfigurasi Firebase
Aplikasi ini memerlukan layanan Firebase untuk autentikasi dan database. Anda perlu membuat proyek Firebase milik Anda sendiri:
1. Buat proyek di [Firebase Console](https://console.firebase.google.com/).
2. Aktifkan **Firestore Database** dan **Authentication** (Pilih metode masuk *Google*).
3. Buat file bernama `.env.local` di *root* direktori proyek, lalu masukkan konfigurasi Firebase Anda ke dalam format berikut:

```env
VITE_FIREBASE_API_KEY="kunci-api-firebase-anda"
VITE_FIREBASE_AUTH_DOMAIN="id-proyek-anda.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="id-proyek-anda"
VITE_FIREBASE_STORAGE_BUCKET="id-proyek-anda.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="angka-sender-id-anda"
VITE_FIREBASE_APP_ID="app-id-anda"
```

> **Penting**: File `.env.local` bersifat rahasia dan sudah dimasukkan ke dalam `.gitignore` sehingga kredensial Anda tidak akan terunggah ke repositori publik.

### 5. Atur Aturan Keamanan (Rules) Firestore
Pastikan data koleksi Anda aman, namun tetap dapat dibaca oleh pengunjung publik:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /books/{bookId} {
      // Pengunjung publik hanya bisa membaca
      allow read: if true;
      // Hanya Admin (yang login) yang bisa mengubah/menambah data
      allow write: if request.auth != null;
    }
  }
}
```

### 6. Jalankan Server Pengembangan
```bash
npm run dev
```
Aplikasi akan berjalan di `http://localhost:5173`.
