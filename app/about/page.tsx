import { Metadata } from 'next'
import { AboutContent } from "@/components/about-content"
import { getAllPosts } from "@/app/lib/posts"
import { getAllNotesMeta } from "@/app/lib/cache"

export const dynamic = 'force-static'
export const revalidate = false // 禁用重新验证，因为内容是静态的

export const metadata: Metadata = {
  title: '关于',
  description: '关于 Sir丶雨轩 的个人介绍和联系方式',
  openGraph: {
    title: '关于 | 雨轩博客',
    description: '关于 Sir丶雨轩 的个人介绍和联系方式',
  },
}

export default function AboutPage() {
  const posts = getAllPosts()
  const notes = getAllNotesMeta()
  const tags = new Set(posts.flatMap(post => post.tags || []))
  return <AboutContent initialStats={{
    posts: posts.length,
    notes: notes.length,
    tags: tags.size
  }} />
}

