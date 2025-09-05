import { Metadata } from 'next'
import { Layout } from "@/components/layout"
import { ReadingContent } from "@/components/reading-content"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { getAllBooks, getReadingStats } from "@/lib/books"

export const dynamic = 'force-static'
export const revalidate = false

export const metadata: Metadata = {
  title: '读书',
  description: '我的读书笔记和书单分享',
  openGraph: {
    title: '读书 | 雨轩博客',
    description: '我的读书笔记和书单分享',
  },
}

export default function ReadingPage() {
  const books = getAllBooks()
  const stats = getReadingStats(books)

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Header showBackButton={true} title="读书" />

        <main>
          <ReadingContent 
            initialBooks={books}
            initialStats={stats}
          />
        </main>

        <Footer />
      </div>
    </Layout>
  )
}
