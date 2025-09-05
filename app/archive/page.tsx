import { Metadata } from 'next'
import { Suspense } from "react"
import { ArchiveContent } from "@/components/archive-content"
import { getAllPostsMeta, getTagsFromPosts } from "@/app/lib/cache"
import type { Post, PostsByYear } from '@/types/post'

export const metadata: Metadata = {
  title: '归档',
  description: '按年份和标签归档的所有文章',
  openGraph: {
    title: '归档 | 雨轩博客',
    description: '按年份和标签归档的所有文章',
  },
}

export const dynamic = 'force-static'
export const revalidate = false

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

export default function Archive() {
  const posts = getAllPostsMeta()
  const tags = getTagsFromPosts(posts)
  const postsByYear = groupPostsByYear(posts)
  return (
    <Suspense>
      <ArchiveContent initialData={{ postsByYear, tags }} />
    </Suspense>
  )
}

