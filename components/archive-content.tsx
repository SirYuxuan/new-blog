"use client"

import { useState, useCallback, useMemo } from "react"
import type { PostsByYear, Post } from "@/types/post"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { Tag } from "@/components/tag"
import { Header } from "@/components/header"
import type { ArchiveContentProps } from "@/types/archive"
import { format } from "date-fns"

function groupPostsByYear(posts: Post[]): PostsByYear {
  const grouped: PostsByYear = {}
  posts.forEach(post => {
    const year = new Date(post.date).getFullYear().toString()
    if (!grouped[year]) grouped[year] = []
    grouped[year].push(post)
  })
  // 按年份排序每组
  Object.keys(grouped).forEach(year => {
    grouped[year].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  })
  return grouped
}

export function ArchiveContent({ initialData }: ArchiveContentProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // 标签筛选
  const filteredPosts = useMemo(() => {
    if (!selectedTag) {
      // 全部标签
      return Object.values(initialData.postsByYear).flat()
    }
    return Object.values(initialData.postsByYear).flat().filter(post => post.tags && post.tags.includes(selectedTag))
  }, [initialData.postsByYear, selectedTag])

  // 按年份分组
  const postsByYear = useMemo(() => groupPostsByYear(filteredPosts), [filteredPosts])

  // 标签点击
  const handleTagClick = useCallback((tag: string | null) => {
    setSelectedTag(tag)
  }, [])

  // 标签渲染
  const tagElements = useMemo(() => (
    <div className="mb-5">
      <div className="flex flex-wrap gap-2">
        <Tag
          tag="全部"
          onClick={() => handleTagClick(null)}
          interactive={true}
          className={selectedTag === null ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200' : ''}
        />
        {initialData.tags.map(({ tag }) => (
          <Tag
            key={tag}
            tag={tag}
            onClick={() => handleTagClick(tag)}
            interactive={true}
            className={selectedTag === tag ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200' : ''}
          />
        ))}
      </div>
    </div>
  ), [initialData.tags, selectedTag, handleTagClick])

  // 文章列表渲染
  const postElements = useMemo(() => (
    <div className="space-y-6">
      {Object.entries(postsByYear).length > 0 ? (
        Object.entries(postsByYear)
          .sort((a, b) => Number(b[0]) - Number(a[0]))
          .map(([year, posts]) => (
          <div key={year} className="space-y-4">
            <h2 className="text-2xl font-bold">{year}</h2>
            <div className="space-y-2">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="flex items-center justify-between group"
                >
                  <span className="text-base font-normal group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors duration-200 truncate mr-4">
                    {post.title}
                  </span>
                  <time className="text-xs text-zinc-400 dark:text-zinc-500 flex-shrink-0 font-mono tabular-nums">
                    {format(new Date(post.date), "MM/dd")}
                  </time>
                </Link>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          暂无文章。
        </p>
      )}
    </div>
  ), [postsByYear])

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Header showBackButton={true} title="归档" />
      <main>
        {/* 标签云区域 */}
        {initialData.tags.length > 0 && tagElements}
        {/* 文章列表 */}
        {postElements}
      </main>
      <Footer />
    </div>
  )
}