"use client"

import { useState, useEffect, useRef } from "react"
import { Github,  Mail,  Rss, MessageCircle, User } from "lucide-react"
import { Footer } from "@/components/footer"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { Header } from "@/components/header"

type Post = {
  id: string
  title: string
  date: string
  excerpt: string
  tags?: string[]
  category?: string
  content: string
}

type AboutContentProps = {
  initialStats: {
    posts: number;
    notes: number;
    tags: number;
  };
}

const use3DEffect = (ref: React.RefObject<HTMLDivElement | null>, intensity: number = 10) => {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = (y - centerY) / intensity
    const rotateY = (centerX - x) / intensity

    ref.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.1)`
  }

  const handleMouseLeave = () => {
    if (ref.current) {
      ref.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)'
    }
  }

  return {
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave
  }
}

export function AboutContent({ initialStats }: AboutContentProps) {
  const [copied, setCopied] = useState<'email' | 'wechat' | null>(null)
  const [stats, setStats] = useState(initialStats)
  const imageRef = useRef<HTMLDivElement>(null)
  const { onMouseMove, onMouseLeave } = use3DEffect(imageRef, 8)

  const copyToClipboard = async (text: string, type: 'email' | 'wechat') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error(`Failed to copy ${type}:`, err)
    }
  }

  const copyEmail = () => copyToClipboard("dev@oofo.cc", 'email')
  const copyWechat = () => copyToClipboard("gfh229_", 'wechat')

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Header showBackButton={true} title="关于" />

      <main>
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
          <div 
            ref={imageRef}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            className="w-32 h-32 md:w-48 md:h-48 relative rounded-xl overflow-hidden 
              ring-2 ring-zinc-100/50 dark:ring-zinc-800/50
              border border-zinc-200/50 dark:border-zinc-700/50
              hover:border-zinc-300/50 dark:hover:border-zinc-600/50
              transition-all duration-300 ease-out
              group shrink-0"
          >
            <OptimizedImage
              src="https://img.oofo.cc/v2/ZjtUHmA.jpeg"
              alt="Sir丶雨轩"
              width={192}
              height={192}
              className="object-cover transition-all duration-300 ease-out dark:invert"
              priority
              sizes="(max-width: 768px) 128px, 192px"
              quality={75}
            />
          </div>
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div>
              <h1 className="text-3xl font-bold mb-2">关于</h1>
              <p className="text-lg text-zinc-600 dark:text-zinc-400">编程改变世界!</p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <a
                href="https://github.com/SirYuxuan"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 py-2 rounded-lg 
                  bg-zinc-100/50 dark:bg-zinc-800/50
                  hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50
                  border border-zinc-200/50 dark:border-zinc-700/50
                  hover:border-zinc-300/50 dark:hover:border-zinc-600/50
                  text-zinc-600 dark:text-zinc-400
                  hover:text-zinc-800 dark:hover:text-zinc-200
                  transition-colors"
              >
                <Github className="h-5 w-5 mr-2" />
                <span>GitHub</span>
              </a>
              <button
                onClick={copyEmail}
                className="flex items-center px-4 py-2 rounded-lg 
                  bg-zinc-100/50 dark:bg-zinc-800/50
                  hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50
                  border border-zinc-200/50 dark:border-zinc-700/50
                  hover:border-zinc-300/50 dark:hover:border-zinc-600/50
                  text-zinc-600 dark:text-zinc-400
                  hover:text-zinc-800 dark:hover:text-zinc-200
                  transition-colors group relative"
              >
                <Mail className="h-5 w-5 mr-2" />
                <span>邮箱</span>
                {copied === 'email' && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-white text-xs rounded-md whitespace-nowrap">
                    已复制到剪贴板
                  </div>
                )}
              </button>
              <button
                onClick={copyWechat}
                className="flex items-center px-4 py-2 rounded-lg 
                  bg-zinc-100/50 dark:bg-zinc-800/50
                  hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50
                  border border-zinc-200/50 dark:border-zinc-700/50
                  hover:border-zinc-300/50 dark:hover:border-zinc-600/50
                  text-zinc-600 dark:text-zinc-400
                  hover:text-zinc-800 dark:hover:text-zinc-200
                  transition-colors group relative"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                <span>微信</span>
                {copied === 'wechat' && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-800 text-white text-xs rounded-md whitespace-nowrap">
                    已复制到剪贴板
                  </div>
                )}
              </button>
              <a
                href="/rss.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 py-2 rounded-lg 
                  bg-zinc-100/50 dark:bg-zinc-800/50
                  hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50
                  border border-zinc-200/50 dark:border-zinc-700/50
                  hover:border-zinc-300/50 dark:hover:border-zinc-600/50
                  text-zinc-600 dark:text-zinc-400
                  hover:text-zinc-800 dark:hover:text-zinc-200
                  transition-colors"
              >
                <Rss className="h-5 w-5 mr-2" />
                <span>RSS</span>
              </a>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/10 via-purple-50/10 to-pink-50/10 dark:from-blue-900/5 dark:via-purple-900/5 dark:to-pink-900/5 blur-3xl" />
            <div className="relative p-8 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 backdrop-blur-md backdrop-saturate-150 border border-zinc-200/50 dark:border-zinc-700/50 hover:border-zinc-300/50 dark:hover:border-zinc-600/50 transition-all duration-300">
              <h2 className="text-xl font-semibold mb-4">简介</h2>
              <div className="space-y-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">在这里记录生活的点点滴滴，分享一些有趣的想法和感受</p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/50 
                    hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 
                    border border-zinc-200/50 dark:border-zinc-700/50
                    hover:border-zinc-300/50 dark:hover:border-zinc-600/50
                    transition-colors">
                    <span className="text-xl font-medium text-zinc-800 dark:text-zinc-200 mb-1">{stats.posts}</span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">文章</span>
                  </div>
                  <div className="flex flex-col items-center p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/50 
                    hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 
                    border border-zinc-200/50 dark:border-zinc-700/50
                    hover:border-zinc-300/50 dark:hover:border-zinc-600/50
                    transition-colors">
                    <span className="text-xl font-medium text-zinc-800 dark:text-zinc-200 mb-1">{stats.notes}</span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">随笔</span>
                  </div>
                  <div className="flex flex-col items-center p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/50 
                    hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 
                    border border-zinc-200/50 dark:border-zinc-700/50
                    hover:border-zinc-300/50 dark:hover:border-zinc-600/50
                    transition-colors">
                    <span className="text-xl font-medium text-zinc-800 dark:text-zinc-200 mb-1">{stats.tags}</span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">标签</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-50/50 dark:bg-zinc-800/50 rounded-xl p-6 
            hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 
            border border-zinc-200/50 dark:border-zinc-700/50
            hover:border-zinc-300/50 dark:hover:border-zinc-600/50
            transition-colors">
            <h2 className="text-xl font-semibold mb-4">本站</h2>
            <div className="space-y-3 text-zinc-600 dark:text-zinc-400">
              <p>这个博客使用 Next.js构建，Forked: <a href="https://github.com/Lily-404/blog" target="_blank" rel="noopener noreferrer" className="text-zinc-800 dark:text-zinc-200 hover:underline">Lily-404/blog</a></p>
              <p>同时也会分享一些关于生活、阅读的想法。</p>
            </div>
          </div>

          <div className="bg-zinc-50/50 dark:bg-zinc-800/50 rounded-xl p-6 
            hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 
            border border-zinc-200/50 dark:border-zinc-700/50
            hover:border-zinc-300/50 dark:hover:border-zinc-600/50
            transition-colors">
            <h2 className="text-xl font-semibold mb-4">项目</h2>
          
            <div className="space-y-3 text-zinc-600 dark:text-zinc-400">
              <p>本博客是开源的，感兴趣的话麻烦点个Star，你可以在 GitHub 查看源码：</p>
              <a 
                href="https://github.com/sirYuxuan/new-blog"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 
                  text-zinc-600 dark:text-zinc-400
                  hover:text-zinc-800 dark:hover:text-zinc-200
                  transition-colors"
              >
                <Github className="w-5 h-5" />
                <span>SirYuxuan/new-blog</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}