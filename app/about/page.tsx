import { Metadata } from 'next'
import { AboutContent } from "@/components/about-content"
import { getAllPosts } from "@/app/lib/posts"
import { getPaginatedNotesAction } from "@/app/actions/notes"
import { getCachedData } from '@/lib/cache'

// 设置为完全静态生成
export const dynamic = 'force-static'
export const revalidate = false // 禁用重新验证，因为内容是静态的

export const metadata: Metadata = {
  title: '关于',
  description: '关于 Jimmy 的个人介绍和联系方式',
  openGraph: {
    title: '关于 | Jimmy Blog',
    description: '关于 Jimmy 的个人介绍和联系方式',
  },
}

// 获取统计数据
async function getStats() {
  return getCachedData('about-stats', async () => {
    // 获取文章数量
    const posts = await getAllPosts()
    
    // 获取随笔数量
    const { total: notesTotal } = await getPaginatedNotesAction(1, 1)
    
    // 获取标签数量
    const tags = new Set<string>()
    posts.forEach(post => {
      if (post.tags) {
        post.tags.forEach((tag: string) => tags.add(tag))
      }
    })

    return {
      posts: posts.length,
      notes: notesTotal,
      tags: tags.size
    }
  }, 24 * 60 * 60 * 1000) // 缓存24小时
}

export default async function AboutPage() {
  const stats = await getStats()
  return <AboutContent initialStats={stats} />
}

