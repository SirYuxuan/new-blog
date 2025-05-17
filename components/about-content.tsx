"use client"

import { useState, useEffect, useRef } from "react"
import { Github,  Mail,  Rss, MessageCircle } from "lucide-react"
import { Footer } from "@/components/footer"
import Image from "next/image"
import { Header } from "@/components/header"

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

export function AboutContent() {
  const [copied, setCopied] = useState<'email' | 'wechat' | null>(null)
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

  const copyEmail = () => copyToClipboard("sxy1308075897@gmail.com", 'email')
  const copyWechat = () => copyToClipboard("OOIll0", 'wechat')

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
            <Image
              src="/logo2.png"
              alt="Jimmy's photo"
              fill
              className="object-cover transition-all duration-300 ease-out"
              priority
              sizes="(max-width: 768px) 128px, 192px"
              quality={75}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/50 to-transparent 
              opacity-0 dark:opacity-100
              transition-all duration-300 ease-out" />
          </div>
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div>
              <h1 className="text-3xl font-bold mb-2">关于</h1>
              <p className="text-lg text-zinc-600 dark:text-zinc-400">O Captain! My Captain!</p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <a
                href="https://about.jimmy-blog.top/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-6 py-3 rounded-xl
                  bg-gradient-to-r from-[#1e293b] via-[#334155] to-[#0f172a]
                  hover:from-[#334155] hover:via-[#475569] hover:to-[#1e293b]
                  dark:bg-gradient-to-r dark:from-[#232946] dark:via-[#3b3561] dark:to-[#16161a]
                  dark:hover:from-[#353570] dark:hover:via-[#5f4b8b] dark:hover:to-[#232946]
                  text-white
                  hover:text-white
                  transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1)
                  font-medium
                  relative
                  group
                  hover:scale-110 hover:rotate-1
                  before:absolute before:inset-0 before:rounded-xl
                  before:bg-gradient-to-r before:from-[#38BDF8]/30 before:via-[#818CF8]/30 before:to-[#38BDF8]/30
                  dark:before:from-[#5f4b8b]/40 dark:before:via-[#60a5fa]/40 dark:before:to-[#818cf8]/40
                  before:blur-2xl before:opacity-0 before:group-hover:opacity-100
                  before:transition-all before:duration-1000
                  after:absolute after:inset-0 after:rounded-xl
                  after:bg-gradient-to-r after:from-[#38BDF8]/15 after:via-[#818CF8]/15 after:to-[#38BDF8]/15
                  dark:after:from-[#5f4b8b]/25 dark:after:via-[#60a5fa]/25 dark:after:to-[#818cf8]/25
                  after:blur-xl after:opacity-0 after:group-hover:opacity-100
                  after:transition-all after:duration-1000
                  after:delay-150
                  before:-z-10 after:-z-10
                  hover:before:scale-150 hover:after:scale-150
                  hover:before:blur-3xl hover:after:blur-3xl
                  hover:before:translate-x-2 hover:before:translate-y-2
                  hover:after:-translate-x-2 hover:after:-translate-y-2
                  hover:before:rotate-3 hover:after:-rotate-3
                  overflow-hidden
                  [&:before]:animate-[shimmer_3s_infinite]
                  [&:before]:bg-gradient-to-r
                  [&:before]:from-transparent
                  [&:before]:via-[#38BDF8]/15
                  dark:[&:before]:via-[#818cf8]/20
                  [&:before]:to-transparent
                  [&:before]:translate-x-[-200%]
                  [&:before]:skew-x-[-20deg]
                  border border-[#818cf8]/10
                  hover:border-[#818cf8]/20
                  dark:border-[#818cf8]/20
                  dark:hover:border-[#818cf8]/30
                  shadow-[0_0_12px_2px_rgba(93,188,252,0.10)]
                  hover:shadow-[0_0_18px_4px_rgba(93,188,252,0.13)]
                  dark:shadow-[0_0_24px_8px_rgba(93,188,252,0.10),0_0_60px_8px_rgba(130,88,255,0.08)]
                  dark:hover:shadow-[0_0_32px_12px_rgba(93,188,252,0.13),0_0_80px_16px_rgba(130,88,255,0.10)]
                  before:animate-[breath_3s_ease-in-out_infinite]
                  after:animate-[breath_3s_ease-in-out_infinite]"
              >
                <span className="h-5 w-5 mr-2 flex items-center justify-center font-medium animate-[pulse_2s_ease-in-out_infinite] group-hover:animate-[spin_3s_linear_infinite]">✨</span>
                <span className="relative">
                  Portfolio
                  <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"></span>
                </span>
              </a>
              <a
                href="https://github.com/Lily-404"
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
                GitHub
              </a>
              <a
                href="https://okjk.co/ITgDUG"
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
                <span className="h-5 w-5 mr-2 flex items-center justify-center font-medium">J</span>
                即刻
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
                <span className="text-sm">Email</span>
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
                <span className="text-sm">微信</span>
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
                RSS
              </a>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-50/50 dark:bg-zinc-800/50 rounded-xl p-6 
            hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 
            border border-zinc-200/50 dark:border-zinc-700/50
            hover:border-zinc-300/50 dark:hover:border-zinc-600/50
            transition-colors">
            <h2 className="text-xl font-semibold mb-4">个人简介</h2>
            <div className="space-y-3 text-zinc-600 dark:text-zinc-400">
              <p>你好，我是 Jimmy，一名热爱技术和分享的开发者。</p>
              <p>喜欢探索新技术，关注开发体验和工程化，同时也热衷于写作和分享。</p>
            </div>
          </div>

          <div className="bg-zinc-50/50 dark:bg-zinc-800/50 rounded-xl p-6 
            hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 
            border border-zinc-200/50 dark:border-zinc-700/50
            hover:border-zinc-300/50 dark:hover:border-zinc-600/50
            transition-colors">
            <h2 className="text-xl font-semibold mb-4">关于本站</h2>
            <div className="space-y-3 text-zinc-600 dark:text-zinc-400">
              <p>这个博客使用 Next.js构建，主要记录我在技术学习和工作中的心得体会。</p>
              <p>同时也会分享一些关于生活、阅读的想法。</p>
            </div>
          </div>

          <div className="bg-zinc-50/50 dark:bg-zinc-800/50 rounded-xl p-6 
            hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 
            border border-zinc-200/50 dark:border-zinc-700/50
            hover:border-zinc-300/50 dark:hover:border-zinc-600/50
            transition-colors">
            <h2 className="text-xl font-semibold mb-4">开源</h2>
            <div className="space-y-3 text-zinc-600 dark:text-zinc-400">
              <p>本博客是开源的，感兴趣的话麻烦点个Star，你可以在 GitHub 查看源码：</p>
              <a 
                href="https://github.com/Lily-404/blog"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-zinc-800 dark:text-zinc-200 
                  hover:text-zinc-600 dark:hover:text-zinc-400 
                  transition-colors"
              >
                <Github className="w-5 h-5" />
                <span>Lily-404/blog</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}