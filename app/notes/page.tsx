import { Layout } from "@/components/layout"
import { NotesPagination } from "@/components/notes-pagination"
import { getPaginatedNotesAction } from "@/app/actions/notes"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { getAllPosts } from "@/app/lib/posts"

// 设置为完全静态生成
export const dynamic = 'force-static'
export const revalidate = false // 禁用重新验证，因为数据是静态的

// 预生成首页数据，并指定生成的页数
export async function generateStaticParams() {
  const { totalPages } = await getPaginatedNotesAction(1, 7)
  return Array.from({ length: totalPages }, (_, i) => ({
    page: (i + 1).toString()
  }))
}

export default async function NotesPage({
  searchParams,
}: {
  searchParams?: { page?: string }
}) {
  const currentPage = Number(searchParams?.page) || 1
  const { notes, total, totalPages } = await getPaginatedNotesAction(currentPage, 7)
  const posts = await getAllPosts()

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Header showBackButton={true} title="随笔" />

        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 via-purple-50/20 to-pink-50/20 dark:from-blue-700/10 dark:via-purple-900/10 dark:to-pink-900/10 blur-3xl" />
          <div className="relative flex items-center gap-4 p-6 rounded-3xl bg-zinc-100/10 dark:bg-zinc-900/40 backdrop-blur-md backdrop-saturate-150 border border-zinc-200/50 dark:border-zinc-600/50 hover:border-zinc-300/50 dark:hover:border-zinc-500/50 shadow-[0_1px_3px_0_rgb(0,0,0,0.05)] dark:shadow-[0_1px_3px_0_rgb(0,0,0,0.2)] hover:shadow-[0_5px_15px_0_rgb(0,0,0,0.05)] dark:hover:shadow-[0_5px_15px_0_rgb(0,0,0,0.2)] transition-all duration-300 ease-out">
            <div className="relative">
              <img
                src="/cat.jpg"
                alt="Jimmy's avatar"
                className="relative w-12 h-12 rounded-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-lg sm:text-xl font-medium bg-gradient-to-br from-zinc-800 to-zinc-600 dark:from-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">Jimmy</h1>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-200/80 border border-zinc-200/50 dark:border-zinc-600/50 text-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300 transition-colors">写作中</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-200/80 border border-zinc-200/50 dark:border-zinc-600/50 text-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300 transition-colors">开发中</span>
                </div>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2 sm:line-clamp-none">在这里记录生活的点点滴滴，分享一些有趣的想法和感受</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-1.5 transition-colors hover:text-zinc-800 dark:hover:text-zinc-300">
                  <span className="inline-block">✍️</span>
                  <span>{total} 篇随笔</span>
                </div>
                <div className="flex items-center gap-1.5 transition-colors hover:text-zinc-800 dark:hover:text-zinc-300">
                  <span className="inline-block">📚</span>
                  <span>{posts.length} 篇文章</span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 transition-colors hover:text-zinc-800 dark:hover:text-zinc-300">
                  <span className="inline-block">📅</span>
                  <span>持续记录中</span>
                </div>
                <div className="flex sm:hidden items-center gap-1.5 transition-colors hover:text-zinc-800 dark:hover:text-zinc-300">
                  <span className="inline-block">📅</span>
                  <span>更新中</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main>
          <NotesPagination 
            initialNotes={notes}
            initialTotal={total}
            initialPage={currentPage}
            totalPages={totalPages}
          />
        </main>

        <Footer />
      </div>
    </Layout>
  )
}