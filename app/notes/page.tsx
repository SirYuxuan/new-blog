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
  const { totalPages } = await getPaginatedNotesAction(1, 15)
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
  const { notes, total, totalPages } = await getPaginatedNotesAction(currentPage, 15)
  const posts = await getAllPosts()

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Header showBackButton={true} title="随笔" />

        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 via-purple-50/20 to-pink-50/20 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-pink-900/10 blur-3xl" />
          <div className="relative flex items-center gap-4 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm">
            <div className="relative">
              <img
                src="/cat.jpg"
                alt="Jimmy's avatar"
                className="relative w-12 h-12 rounded-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-medium bg-gradient-to-br from-zinc-800 to-zinc-600 dark:from-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">Jimmy</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#d0d7cd] text-[#2c332b] dark:bg-[#2e3b34] dark:text-[#b7c2b6]">写作中</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#d6d3da] text-[#2a2631] dark:bg-[#322f36] dark:text-[#c2beca]">开发中</span>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">在这里记录生活的点点滴滴，分享一些有趣的想法和感受</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-zinc-400 dark:text-zinc-500">
                <div className="flex items-center gap-1">
                  <span>✍️</span>
                  <span>{total} 篇随笔</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>📚</span>
                  <span>{posts.length} 篇文章</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>📅</span>
                  <span>持续记录中</span>
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