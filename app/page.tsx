import { Metadata } from 'next'
import { Suspense } from 'react'
import { HomeContent } from "@/components/home-content"
import { getAllPostsMeta, getTagsFromPosts } from "@/app/lib/cache"
import Loading from '@/app/loading'

export const metadata: Metadata = {
  title: "Jimmy's Blog",
  description: '书写，思考，生活',
  openGraph: {
    title: 'Jimmy Blog',
    description: '书写，思考，生活',
  },
}

const PAGE_SIZE = 10

export const dynamic = 'force-static'
export const revalidate = 3600 // 1小时重新验证

export default function Home() {
  const posts = getAllPostsMeta()
  const tags = getTagsFromPosts(posts).map(t => ({ tag: t.tag, count: Number(t.count) }))
  const paginatedPosts = posts.slice(0, PAGE_SIZE)
  const totalPages = Math.ceil(posts.length / PAGE_SIZE)
  return (
    <HomeContent
      posts={paginatedPosts}
      allPosts={posts}
      tags={tags}
      currentPage={1}
      totalPages={totalPages}
    />
  )
}

