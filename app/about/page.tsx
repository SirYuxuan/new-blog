import { Metadata } from 'next'
import { AboutContent } from "@/components/about-content"
import { getAllPosts } from "@/app/lib/posts"

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

export default function AboutPage() {
  const posts = getAllPosts()
  const tags = new Set(posts.flatMap(post => post.tags || []))
  // notes 统计如有需要可补充
  return <AboutContent initialStats={{
    posts: posts.length,
    notes: 0,
    tags: tags.size
  }} />
}

