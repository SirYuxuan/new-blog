import { Metadata } from 'next'
import { HomeContent } from "@/components/home-content"
import { getAllPostsMeta, getTagsFromPosts, getAllNotesMeta } from "@/app/lib/cache"
import { CalendarHeatmap } from "@/components/calendar-heatmap"

const PAGE_SIZE = 10

export const metadata: Metadata = {
  title: "Jimmy's Blog",
  description: '书写，思考，生活',
  openGraph: {
    title: 'Jimmy Blog',
    description: '书写，思考，生活',
  },
}

export const dynamic = 'force-static'
export const revalidate = 3600 // 1小时重新验证

export default function Home() {
  const posts = getAllPostsMeta()
  const notes = getAllNotesMeta()
  const tags = getTagsFromPosts(posts).map(t => ({ tag: t.tag, count: Number(t.count) }))
  const paginatedPosts = posts.slice(0, PAGE_SIZE)
  const totalPages = Math.ceil(posts.length / PAGE_SIZE)
  return (
    <>
      {/* 悬浮日历热力图*/}
      <div className="fixed left-20 top-20 z-40 hidden md:block select-none">
        <div className="rounded-xl bg-white/60 dark:bg-zinc-900/60 shadow-lg border border-zinc-200 dark:border-zinc-700 p-4 backdrop-blur-md backdrop-saturate-150">
          <CalendarHeatmap posts={posts} notes={notes} />
        </div>
      </div>



      <HomeContent
        posts={paginatedPosts}
        allPosts={posts}
        tags={tags}
        currentPage={1}
        totalPages={totalPages}
      />
    </>
  )
}

