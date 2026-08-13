import type { GoogleBookSearchResult } from '../types/book'

const OPEN_LIBRARY_API_URL = 'https://openlibrary.org/search.json'

/**
 * Memformat URL gambar sampul dari OpenLibrary berdasarkan cover_i
 */
const formatCoverUrl = (coverId?: number): string => {
    if (!coverId) return ''
    return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
}

/**
 * Mencari buku berdasarkan kata kunci.
 * Catatan: Menggunakan OpenLibrary API sebagai pengganti Google Books API 
 * untuk menghindari masalah "Quota Exceeded" (429) pada versi gratis tanpa API Key.
 * 
 * @param query Kata kunci pencarian (contoh: "Atomic Habits", "Henry Manampiring")
 * @param maxResults Jumlah hasil maksimal (default: 15)
 */
export const searchGoogleBooks = async (
    query: string,
    maxResults = 15
): Promise<GoogleBookSearchResult[]> => {
    const cleanQuery = query.trim()
    if (!cleanQuery) return []

    try {
        const response = await fetch(
            `${OPEN_LIBRARY_API_URL}?q=${encodeURIComponent(cleanQuery)}&limit=${maxResults}`
        )

        if (!response.ok) {
            console.error(`OpenLibrary API HTTP Error: ${response.status} ${response.statusText}`)
            return []
        }

        const data = await response.json()

        if (!data.docs || !Array.isArray(data.docs)) {
            return []
        }

        // Mapping respons dari OpenLibrary API ke format GoogleBookSearchResult
        return data.docs.map((item: any): GoogleBookSearchResult => {
            return {
                id: item.key?.replace('/works/', '') || Math.random().toString(36).substr(2, 9),
                title: item.title || 'Judul Tidak Diketahui',
                authors: item.author_name || ['Penulis Tidak Diketahui'],
                coverUrl: formatCoverUrl(item.cover_i),
                totalPages: item.number_of_pages_median || 0,
                description: item.first_sentence ? (item.first_sentence[0] || item.first_sentence) : '',
                publishedDate: item.first_publish_year ? item.first_publish_year.toString() : ''
            }
        })
    } catch (error) {
        console.error('Gagal mengambil data dari OpenLibrary API:', error)
        return []
    }
}