import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { HeaderNav } from "@/components/header-nav"
import type { HeaderProps } from "@/types/header"

export function Header({ showBackButton = false, backButtonHref = "/", showNav = true, isHome = false, title }: HeaderProps) {
  if (isHome) {
    return (
      <header className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img
            src="/cat.jpg"  
            alt="Jimmy's avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
          <h1 
            className="text-xl font-medium tracking-tight hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors cursor-pointer"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
            }}
          >
            Jimmy's Blog
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <nav className="flex items-center space-x-4 text-sm">
            <HeaderNav />
            <ThemeToggle />
          </nav>
        </div>
      </header>
    )
  }

  return (
    <header className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        {showBackButton && (
          <>
            <Link 
              href={backButtonHref} 
              className="w-10 h-10 flex items-center justify-center rounded-full transition-colors
                bg-zinc-100/50 dark:bg-zinc-800/50
                hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50
                border border-zinc-200/50 dark:border-zinc-700/50
                hover:border-zinc-300/50 dark:hover:border-zinc-600/50
                text-zinc-600 dark:text-zinc-400
                hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            {title && (
              <h1 className="text-lg font-medium tracking-tight text-zinc-900 dark:text-zinc-100 md:hidden">
                {title}
              </h1>
            )}
          </>
        )}
      </div>
      <div className="flex items-center gap-4">
        {showNav && <HeaderNav />}
        <ThemeToggle />
      </div>
    </header>
  )
}