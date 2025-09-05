"use client"

import { useState, useMemo } from "react"
import { Book, ReadingStats } from "@/types/reading"
import { getAllBooks, getReadingStats, getBooksByStatus, getBooksByTag } from "@/lib/books"
import { formatDate } from "@/app/lib/utils"
import { Tag } from "@/components/tag"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, CheckCircle, Clock, Star, Calendar, User, Hash } from "lucide-react"

type ReadingContentProps = {
  initialBooks: Book[]
  initialStats: ReadingStats
}

export function ReadingContent({ initialBooks, initialStats }: ReadingContentProps) {
  const [books] = useState<Book[]>(initialBooks)
  const [stats] = useState<ReadingStats>(initialStats)
  const [selectedStatus, setSelectedStatus] = useState<Book['status'] | 'all'>('all')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // 获取所有标签
  const allTags = useMemo(() => {
    const tags = books.flatMap(book => book.tags || [])
    const uniqueTags = Array.from(new Set(tags))
    return uniqueTags.sort()
  }, [books])

  // 筛选书籍
  const filteredBooks = useMemo(() => {
    let filtered = books

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(book => book.status === selectedStatus)
    }

    if (selectedTag) {
      filtered = filtered.filter(book => book.tags?.includes(selectedTag))
    }

    return filtered
  }, [books, selectedStatus, selectedTag])

  // 状态统计
  const statusCounts = useMemo(() => {
    return {
      all: books.length,
      reading: books.filter(book => book.status === 'reading').length,
      completed: books.filter(book => book.status === 'completed').length,
      'want-to-read': books.filter(book => book.status === 'want-to-read').length,
    }
  }, [books])

  const getStatusIcon = (status: Book['status']) => {
    switch (status) {
      case 'reading':
        return <Clock className="w-4 h-4" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'want-to-read':
        return <BookOpen className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: Book['status']) => {
    switch (status) {
      case 'reading':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'want-to-read':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getStatusText = (status: Book['status']) => {
    switch (status) {
      case 'reading':
        return '在读'
      case 'completed':
        return '已读'
      case 'want-to-read':
        return '想读'
    }
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-zinc-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalBooks}</p>
                <p className="text-sm text-zinc-500">总书籍</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.completedBooks}</p>
                <p className="text-sm text-zinc-500">已读</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.readingBooks}</p>
                <p className="text-sm text-zinc-500">在读</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.averageRating}</p>
                <p className="text-sm text-zinc-500">平均评分</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 标签筛选 */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">按标签筛选</h3>
        <div className="flex flex-wrap gap-2">
          <Tag
            tag="全部"
            onClick={() => setSelectedTag(null)}
            interactive={true}
            className={selectedTag === null ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200" : ""}
          />
          {allTags.map((tag) => (
            <Tag
              key={tag}
              tag={tag}
              onClick={() => setSelectedTag(tag)}
              interactive={true}
              className={selectedTag === tag ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200" : ""}
            />
          ))}
        </div>
      </div>

      {/* 书籍列表 */}
      <Tabs value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as Book['status'] | 'all')}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center space-x-1">
            <span>全部</span>
            <Badge variant="outline" className="ml-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">{statusCounts.all}</Badge>
          </TabsTrigger>
          <TabsTrigger value="reading" className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>在读</span>
            <Badge variant="outline" className="ml-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">{statusCounts.reading}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4" />
            <span>已读</span>
            <Badge variant="outline" className="ml-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">{statusCounts.completed}</Badge>
          </TabsTrigger>
          <TabsTrigger value="want-to-read" className="flex items-center space-x-1">
            <BookOpen className="w-4 h-4" />
            <span>想读</span>
            <Badge variant="outline" className="ml-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">{statusCounts['want-to-read']}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedStatus} className="space-y-4">
          {filteredBooks.length > 0 ? (
            <div className="grid gap-4">
              {filteredBooks.map((book) => (
                <Card key={book.title} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      {/* 书籍封面 */}
                      <div className="w-16 h-20 rounded flex-shrink-0 overflow-hidden">
                        {book.cover ? (
                          <img 
                            src={book.cover} 
                            alt={book.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 rounded flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-zinc-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                              {book.title}
                            </h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2 flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              {book.author}
                            </p>
                            {book.description && (
                              <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-3 line-clamp-2">
                                {book.description}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className={`${getStatusColor(book.status)} flex items-center space-x-1 hover:${getStatusColor(book.status)}`}>
                            {getStatusIcon(book.status)}
                            <span>{getStatusText(book.status)}</span>
                          </Badge>
                        </div>

                        {/* 书籍信息 */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                          {book.pages && (
                            <span className="flex items-center">
                              <Hash className="w-3 h-3 mr-1" />
                              {book.pages}页
                            </span>
                          )}
                          {book.publishedYear && (
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {book.publishedYear}年
                            </span>
                          )}
                          {book.rating && (
                            <span className="flex items-center">
                              <Star className="w-3 h-3 mr-1" />
                              {book.rating}/5
                            </span>
                          )}
                        </div>


                        {/* 标签 */}
                        {book.tags && book.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {book.tags.map((tag) => (
                              <Tag key={tag} tag={tag} className="text-xs" />
                            ))}
                          </div>
                        )}

                        {/* 阅读时间 */}
                        {(book.startDate || book.endDate) && (
                          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                            {book.startDate && (
                              <span>开始：{formatDate(book.startDate)}</span>
                            )}
                            {book.startDate && book.endDate && <span className="mx-2">-</span>}
                            {book.endDate && (
                              <span>完成：{formatDate(book.endDate)}</span>
                            )}
                          </div>
                        )}

                        {/* 书评 */}
                        {book.review && (
                          <div className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                            <p className="text-sm text-zinc-700 dark:text-zinc-300 italic">
                              "{book.review}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-500 dark:text-zinc-400">
                {selectedTag ? `没有找到标签为"${selectedTag}"的书籍` : '暂无书籍'}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
