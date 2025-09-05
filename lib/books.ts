import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Book, ReadingStats } from "@/types/reading"

const booksDirectory = path.join(process.cwd(), 'content/books');

export async function getAllBooks(): Promise<Book[]> {
  const fileNames = fs.readdirSync(booksDirectory);
  const allBooks = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const fullPath = path.join(booksDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);
      
      // 转换中文状态为英文状态
      const statusMap: Record<string, Book['status']> = {
        '在读': 'reading',
        '已读': 'completed',
        '想读': 'want-to-read'
      }
      
      return {
        title: data.title || '',
        author: data.author || '',
        status: statusMap[data.status] || 'want-to-read',
        rating: data.rating || undefined,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
        progress: data.progress || undefined,
        review: data.review || undefined,
        tags: data.tags || [],
        description: data.description || '',
        isbn: data.isbn || undefined,
        pages: data.pages || undefined,
        publisher: data.publisher || undefined,
        publishedYear: data.publishedYear || undefined,
        cover: data.cover || undefined
      } as Book;
    })
    .filter(book => book.title); // 过滤掉无效的书籍

  return allBooks;
}

// 计算阅读统计
export function getReadingStats(books: Book[]): ReadingStats {
  const totalBooks = books.length
  const completedBooks = books.filter(book => book.status === 'completed').length
  const readingBooks = books.filter(book => book.status === 'reading').length
  const wantToReadBooks = books.filter(book => book.status === 'want-to-read').length
  
  const ratedBooks = books.filter(book => book.rating && book.rating > 0)
  const averageRating = ratedBooks.length > 0 
    ? ratedBooks.reduce((sum, book) => sum + (book.rating || 0), 0) / ratedBooks.length 
    : 0
  
  const totalPages = books
    .filter(book => book.pages && book.status === 'completed')
    .reduce((sum, book) => sum + (book.pages || 0), 0)
  
  // 计算最喜欢的标签
  const tagCounts = books
    .flatMap(book => book.tags || [])
    .reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  
  const favoriteGenre = Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0]
  
  return {
    totalBooks,
    completedBooks,
    readingBooks,
    wantToReadBooks,
    averageRating: Math.round(averageRating * 10) / 10,
    totalPages,
    favoriteGenre
  }
}

// 根据状态筛选书籍
export function getBooksByStatus(books: Book[], status: Book['status']): Book[] {
  return books.filter(book => book.status === status)
}

// 根据标签筛选书籍
export function getBooksByTag(books: Book[], tag: string): Book[] {
  return books.filter(book => book.tags?.includes(tag))
}
