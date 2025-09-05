import { Book, ReadingStats } from "@/types/reading"
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

// 从 Markdown 文件读取书籍数据
function getAllBooksFromMarkdown(): Book[] {
  const booksDirectory = path.join(process.cwd(), 'content/books')
  
  if (!fs.existsSync(booksDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(booksDirectory)
  const books = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const id = fileName.replace(/\.md$/, '')
      const fullPath = path.join(booksDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data } = matter(fileContents)
      
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
      } as Book
    })
    .filter(book => book.title) // 过滤掉无效的书籍

  return books
}

// 示例书籍数据（作为备用）
export const sampleBooks: Book[] = [
  {
    title: "深入理解计算机系统",
    author: "Randal E. Bryant, David R. O'Hallaron",
    status: "completed",
    rating: 5,
    startDate: "2024-01-15",
    endDate: "2024-03-20",
    progress: 100,
    review: "经典的系统级编程教材，深入浅出地讲解了计算机系统的各个方面。",
    tags: ["计算机科学", "系统编程", "经典"],
    description: "本书从程序员的角度详细阐述计算机系统的本质概念，并展示这些概念如何实实在在地影响应用程序的正确性、性能和实用性。",
    isbn: "9787111321312",
    pages: 702,
    publisher: "机械工业出版社",
    publishedYear: 2016
  },
  {
    title: "JavaScript高级程序设计",
    author: "Matt Frisbie",
    status: "reading",
    rating: 4,
    startDate: "2024-03-01",
    progress: 65,
    tags: ["JavaScript", "前端开发", "编程"],
    description: "全面介绍JavaScript语言核心的ECMAScript以及DOM、BOM等宿主环境。",
    isbn: "9787115545381",
    pages: 1040,
    publisher: "人民邮电出版社",
    publishedYear: 2020
  },
  {
    title: "设计模式：可复用面向对象软件的基础",
    author: "Gang of Four",
    status: "want-to-read",
    tags: ["设计模式", "面向对象", "软件工程"],
    description: "四位作者合著的经典设计模式书籍，被誉为设计模式领域的圣经。",
    isbn: "9787111075776",
    pages: 254,
    publisher: "机械工业出版社",
    publishedYear: 2000
  },
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    status: "completed",
    rating: 5,
    startDate: "2023-11-01",
    endDate: "2023-12-15",
    progress: 100,
    review: "代码整洁之道的经典之作，每个程序员都应该读一读。",
    tags: ["编程", "代码质量", "最佳实践"],
    description: "本书提出一种观念：代码质量与其整洁度成正比。干净的代码，既在质量上较为可靠，也为后期维护、升级奠定了良好基础。",
    isbn: "9787115216878",
    pages: 388,
    publisher: "人民邮电出版社",
    publishedYear: 2010
  },
  {
    title: "算法导论",
    author: "Thomas H. Cormen, Charles E. Leiserson",
    status: "reading",
    rating: 4,
    startDate: "2024-02-01",
    progress: 30,
    tags: ["算法", "计算机科学", "经典"],
    description: "算法领域的经典教材，全面介绍了各种算法设计和分析方法。",
    isbn: "9787111407010",
    pages: 1312,
    publisher: "机械工业出版社",
    publishedYear: 2012
  }
]

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

// 获取所有书籍
export function getAllBooks(): Book[] {
  try {
    const booksFromMarkdown = getAllBooksFromMarkdown()
    return booksFromMarkdown.length > 0 ? booksFromMarkdown : sampleBooks
  } catch (error) {
    console.warn('Failed to load books from markdown files, using sample data:', error)
    return sampleBooks
  }
}

// 根据状态筛选书籍
export function getBooksByStatus(status: Book['status']): Book[] {
  const books = getAllBooks()
  return books.filter(book => book.status === status)
}

// 根据标签筛选书籍
export function getBooksByTag(tag: string): Book[] {
  const books = getAllBooks()
  return books.filter(book => book.tags?.includes(tag))
}
