import { notFound } from "next/navigation"
import { HomeContent } from "@/components/home-content"
import { getAllPostsMeta, getTagsFromPosts, getAllNotesMeta } from "@/app/lib/cache"
import { CalendarHeatmap } from "@/components/calendar-heatmap"

const PAGE_SIZE = 10

export const dynamic = 'force-static'

export async function generateStaticParams() {
  const posts = getAllPostsMeta()
  const totalPages = Math.ceil(posts.length / PAGE_SIZE)
  return Array.from({ length: totalPages - 1 }, (_, i) => ({
    page: (i + 2).toString(), // 从2开始
  }))
}

export default function Page({ params }: { params: { page: string } }) {
  const page = parseInt(params.page, 10)
  const posts = getAllPostsMeta()
  const notes = getAllNotesMeta()
  const tags = getTagsFromPosts(posts).map(t => ({ tag: t.tag, count: Number(t.count) }))
  const totalPages = Math.ceil(posts.length / PAGE_SIZE)
  if (isNaN(page) || page < 2 || page > totalPages) return notFound()
  const paginatedPosts = posts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  return (
    <>
      {/* 悬浮日历热力图，不影响主内容布局 */}
      <div className="fixed left-10 top-20 z-40 hidden md:block select-none">
        <div className="rounded-xl bg-white/60 dark:bg-zinc-900/60 shadow-lg border border-zinc-200 dark:border-zinc-700 p-4 backdrop-blur-md backdrop-saturate-150">
          <CalendarHeatmap posts={posts} notes={notes} />
        </div>
      </div>
      <HomeContent
        posts={paginatedPosts}
        allPosts={posts}
        tags={tags}
        currentPage={page}
        totalPages={totalPages}
      />
    </>
  )
} 