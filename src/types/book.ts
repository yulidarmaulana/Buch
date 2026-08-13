// Status membaca buku
export type BookStatus = 'reading' | 'completed' | 'wishlist';

// Interface utama untuk data buku yang tersimpan di Database (Firestore)
export interface Book {
    id: string;               // Unique Document ID dari Firestore
    googleBooksId?: string;   // ID referensi dari Google Books API (opsional)
    title: string;            // Judul buku
    authors: string[];        // Penulis (bisa lebih dari satu)
    coverUrl: string;         // URL gambar sampul buku
    totalPages: number;       // Total halaman buku
    currentPage: number;      // Halaman yang sedang/terakhir dibaca
    status: BookStatus;       // Status bacaan
    rating?: number;          // Rating pribadi (1 - 5 bintang, opsional)
    review?: string;          // Catatan / Ulasan pribadi (opsional)
    startedAt?: string;       // Tanggal mulai membaca (Format ISO string: YYYY-MM-DD)
    finishedAt?: string;      // Tanggal selesai membaca (Format ISO string: YYYY-MM-DD)
    createdAt: string;        // Timestamp pembuatan data
    updatedAt?: string;       // Timestamp update data
}

// Interface untuk hasil pencarian dari Google Books API
export interface GoogleBookSearchResult {
    id: string;
    title: string;
    authors: string[];
    coverUrl: string;
    totalPages: number;
    description?: string;
    publishedDate?: string;
}