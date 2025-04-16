"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import type { PostsData } from "@/types/post"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { getPaginatedPostsAction, getAllTagsAction } from "@/app/actions/posts"
import { Button } from "@/components/ui/button"
import { formatDate, delay } from "@/app/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { List } from "lucide-react"
import { Footer } from "@/components/footer"
import { PaginationButtons } from "@/components/pagination-buttons"
import { HeaderNav } from "@/components/header-nav"
import { Tags } from "@/components/tag"
import { Tag } from "@/components/tag"
import { Header } from "@/components/header"

interface HomeContentProps {
  initialData: {
    posts: PostsData;
    tags: Array<{ tag: string; count: number }>;
  };
}

// 自定义 hook 用于处理标签逻辑
function useTags(initialTags: Array<{ tag: string; count: number }>) {
  const [allTags, setAllTags] = useState(initialTags);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleTagClick = useCallback(async (tag: string | null) => {
    setIsTransitioning(true);
    setSelectedTag(tag);
    await delay(300);
    setIsTransitioning(false);
  }, []);

  return {
    allTags,
    selectedTag,
    isTransitioning,
    handleTagClick
  };
}

// 自定义 hook 用于处理文章列表逻辑
function usePosts(initialPosts: PostsData, selectedTag: string | null) {
  const [currentPage, setCurrentPage] = useState(1);
  const [postsData, setPostsData] = useState(initialPosts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const posts = await getPaginatedPostsAction(currentPage, 10, selectedTag);
        setPostsData(posts as PostsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('加载文章失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    // 当 selectedTag 为 null 时，也重新获取数据
    fetchData();
  }, [currentPage, selectedTag]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return {
    currentPage,
    postsData,
    loading,
    error,
    handlePageChange
  };
}

export function HomeContent({ initialData }: HomeContentProps) {
  const { allTags, selectedTag, isTransitioning, handleTagClick } = useTags(initialData.tags);
  const { currentPage, postsData, loading, error, handlePageChange } = usePosts(initialData.posts, selectedTag);

  // 使用 useMemo 优化标签渲染
  const tagElements = useMemo(() => (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2">
        <Tag
          tag="全部"
          onClick={() => handleTagClick(null)}
          interactive={true}
          className={selectedTag === null ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200' : ''}
        />
        {allTags.map(({ tag }) => (
          <Tag
            key={tag}
            tag={tag}
            onClick={() => handleTagClick(tag)}
            interactive={true}
            className={selectedTag === tag ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200' : ''}
          />
        ))}
      </div>
    </div>
  ), [allTags, selectedTag, handleTagClick]);

  // 使用 useMemo 优化文章列表渲染
  const postElements = useMemo(() => (
    <div className={`space-y-4 transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
      {loading ? (
        <>
          {Array.from({ length: 10 }).map((_, index) => (
            <article key={index} className="border-b border-zinc-100 dark:border-zinc-800 pb-4 last:border-0 last:pb-0">
              <div className="space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </article>
          ))}
        </>
      ) : error ? (
        <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
      ) : postsData.posts.length > 0 ? (
        postsData.posts.map((post) => (
          <article
            key={post.id}
            className="border-b border-zinc-100 dark:border-zinc-800 pb-4 last:border-0 last:pb-0"
          >
            <Link href={`/posts/${post.id}`} className="group block">
              <h2 className="text-base font-normal text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors duration-300">
                {post.title}
              </h2>
              <time className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 block">
                {formatDate(post.date)}
              </time>
            </Link>
          </article>
        ))
      ) : (
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          暂无文章。
        </p>
      )}
    </div>
  ), [loading, error, postsData.posts, isTransitioning]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Header isHome={true} />

      <main>
        {/* 标签云区域 */}
        {allTags.length > 0 && tagElements}

        {/* 文章列表 */}
        {postElements}

        {/* 分页控制 */}
        {!loading && !error && postsData.totalPages > 1 && (
          <div className="mt-8">
            <PaginationButtons 
              currentPage={currentPage} 
              totalPages={postsData.totalPages} 
              onPageChange={handlePageChange} 
              className="animate-in fade-in duration-300"
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
} 