import { Metadata } from 'next'
import { Suspense } from 'react'
import { HomeContent } from "@/components/home-content"
import { getPaginatedPostsAction, getAllTagsAction } from "@/app/actions/posts"
import { getCachedData } from '@/lib/cache'
import Loading from '@/app/loading'

export const metadata: Metadata = {
  title: '首页',
  description: '书写，思考，生活',
  openGraph: {
    title: 'Jimmy Blog',
    description: '书写，思考，生活',
  },
}

export const dynamic = 'force-static'
export const revalidate = 3600 // 1小时重新验证

// 预加载数据
export async function generateStaticParams() {
  return [
    { page: "1" },
    { page: "2" },
    { page: "3" }
  ]
}

// 预加载初始数据
async function getInitialData() {
  try {
    const [posts, tags] = await Promise.all([
      getCachedData('posts', () => getPaginatedPostsAction(1, 10, null)),
      getCachedData('tags', getAllTagsAction)
    ])
    return { posts, tags }
  } catch (error) {
    console.error('Error fetching initial data:', error)
    return { posts: { posts: [], total: 0, totalPages: 0 }, tags: [] }
  }
}

export default async function Home() {
  const initialData = await getInitialData()
  
  return (
    <Suspense fallback={<Loading />}>
      <HomeContent initialData={initialData} />
    </Suspense>
  )
}

