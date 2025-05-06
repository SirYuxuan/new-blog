import { HomeContent } from "@/components/home-content"
import { getPaginatedPostsAction, getAllTagsAction } from "@/app/actions/posts"


export const dynamic = 'force-static'
export const revalidate = false

// 预加载数据
export async function generateStaticParams() {
  return [
    { page: "1" },
    { page: "2" },
    { page: "3" }
  ]
}

// 预加载初始数据
async function getInitialData() {
  try {
    const [posts, tags] = await Promise.all([
      getPaginatedPostsAction(1, 10, null),
      getAllTagsAction()
    ])
    return { posts, tags }
  } catch (error) {
    console.error('Error fetching initial data:', error)
    return { posts: { posts: [], total: 0, totalPages: 0 }, tags: [] }
  }
}

export default async function Home() {
  const initialData = await getInitialData()
  return <HomeContent initialData={initialData} />
}

