import { Metadata } from 'next'
import { Layout } from "@/components/layout"
import { FriendsContent } from "@/components/friends-content"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { getAllFriends } from "@/lib/friends"

export const dynamic = 'force-static'
export const revalidate = false

export const metadata: Metadata = {
  title: '友链',
  description: '一些有趣的博客和网站',
  openGraph: {
    title: '友链 | 雨轩博客',
    description: '一些有趣的博客和网站',
  },
}

export default async function FriendsPage() {
  const friends = await getAllFriends()

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Header showBackButton={true} title="友链" />

        <main>
          <FriendsContent 
            initialFriends={friends}
          />
        </main>

        <Footer />
      </div>
    </Layout>
  )
}
