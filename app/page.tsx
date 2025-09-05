import { Metadata } from 'next'
import { HomeContent } from "@/components/home-content"
import { getAllPostsMeta, getTagsFromPosts, getAllNotesMeta } from "@/app/lib/cache"
import { CalendarHeatmapFloating } from "@/components/calendar-heatmap-floating"

const PAGE_SIZE = 10

export const metadata: Metadata = {
  title: "雨轩博客",
  description: '书写，思考，生活',
  openGraph: {
    title: '雨轩博客',
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
      {/* 悬浮日历热力图，可手动隐藏/显示 */}
      <CalendarHeatmapFloating posts={posts} notes={notes} />
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

