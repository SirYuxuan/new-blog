"use client"

import Link from "next/link"
import { Archive, Info, BookOpen } from "lucide-react"
import { usePathname } from "next/navigation"

export function HeaderNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-4 text-sm">
      <Link 
        href="/notes" 
        className={`flex items-center transition-colors group ${
          pathname === '/notes' 
            ? 'text-zinc-800 dark:text-zinc-300' 
            : 'text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-300'
        }`}
      >
        <BookOpen className={`h-4 w-4 mr-2 ${
          pathname === '/notes' 
            ? 'text-zinc-800 dark:text-zinc-300' 
            : 'group-hover:text-zinc-800 dark:group-hover:text-zinc-300'
        }`} />
        <span className="hidden md:inline">随笔</span>
      </Link>
      <Link 
        href="/archive" 
        className={`flex items-center transition-colors group ${
          pathname === '/archive' 
            ? 'text-zinc-800 dark:text-zinc-300' 
            : 'text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-300'
        }`}
      >
        <Archive className={`h-4 w-4 mr-2 ${
          pathname === '/archive' 
            ? 'text-zinc-800 dark:text-zinc-300' 
            : 'group-hover:text-zinc-800 dark:group-hover:text-zinc-300'
        }`} />
        <span className="hidden md:inline">归档</span>
      </Link>
      <Link 
        href="/about" 
        className={`flex items-center transition-colors group ${
          pathname === '/about' 
            ? 'text-zinc-800 dark:text-zinc-300' 
            : 'text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-300'
        }`}
      >
        <Info className={`h-4 w-4 mr-2 ${
          pathname === '/about' 
            ? 'text-zinc-800 dark:text-zinc-300' 
            : 'group-hover:text-zinc-800 dark:group-hover:text-zinc-300'
        }`} />
        <span className="hidden md:inline">关于</span>
      </Link>
    </nav>
  )
}