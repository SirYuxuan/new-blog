export interface Book {
  title: string
  author: string
  cover?: string
  status: 'reading' | 'completed' | 'want-to-read'
  rating?: number
  startDate?: string
  endDate?: string
  progress?: number
  review?: string
  tags?: string[]
  description?: string
  isbn?: string
  pages?: number
  publisher?: string
  publishedYear?: number
}

export interface ReadingStats {
  totalBooks: number
  completedBooks: number
  readingBooks: number
  wantToReadBooks: number
  averageRating: number
  totalPages: number
  favoriteGenre?: string
}
