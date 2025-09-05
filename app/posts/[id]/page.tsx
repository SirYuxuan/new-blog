import { getAllPostIds, getPostById } from "@/app/lib/posts"
import { formatDate } from "@/app/lib/utils"
import { notFound } from "next/navigation"
import { Footer } from "@/components/footer"
import { Layout } from "@/components/layout"
import { Tags } from "@/components/tag"
import { Header } from "@/components/header"
import { MarkdownContent } from "@/components/markdown-content"

import { Metadata } from 'next'


// 设置为完全静态生成
export const dynamic = 'force-static'
export const revalidate = false // 禁用重新验证，因为数据只在部署时更新

// 生成所有可能的文章路径
export async function generateStaticParams() {
  const posts = await getAllPostIds()
  return posts.map((post) => ({
    id: post.params.id,
  }))
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params)
  const post = await getPostById(resolvedParams.id)
  
  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const description = post.contentHtml.replace(/<[^>]*>/g, '').slice(0, 200)
  const url = `https://blog.oofo.cc/posts/${resolvedParams.id}`

  return {
    title: post.title,
    description,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime: post.date,
      authors: ['Sir丶雨轩'],
      tags: post.tags,
      url,
      siteName: '雨轩博客',
      locale: 'zh_CN',
      images: [
        {
          url: 'https://blog.oofo.cc/og-image.png',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: ['https://blog.oofo.cc/og-image.png'],
    },
  }
}

export default async function Post({ params }: { params: { id: string } }) {
  // 确保 params 是一个对象并且包含 id 属性
  if (!params || typeof params !== 'object' || !('id' in params)) {
    notFound()
  }
  
  // 使用 Promise.resolve 来确保 params 被正确处理
  const resolvedParams = await Promise.resolve(params)
  const id = resolvedParams.id
  
  if (!id) {
    notFound()
  }

  try {
    const post = await getPostById(id)

    if (!post) {
      notFound()
    }

    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Header showBackButton={true} />

          <article>
            <header className="mb-6">
              <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
              <time className="block text-xs text-zinc-400 dark:text-zinc-500">{formatDate(post.date)}</time>
              {post.tags && post.tags.length > 0 && (
                <Tags tags={post.tags} className="mt-2" interactive={false} />
              )}
            </header>
            <MarkdownContent content={post.contentHtml} />
          </article>
          <Footer />
        </div>
      </Layout>
    )
  } catch (error) {
    console.error('Error fetching post:', error)
    notFound()
  }
}

