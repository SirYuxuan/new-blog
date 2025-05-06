"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import type { PostsByYear } from "@/types/post"
import Link from "next/link"
import { getPostsByYearAction} from "@/app/actions/posts"
import { delay } from "@/app/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Footer } from "@/components/footer"
import { Tag } from "@/components/tag"
import { Header } from "@/components/header"
import type { ArchiveContentProps } from "@/types/archive"


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
function usePosts(initialPosts: PostsByYear, selectedTag: string | null) {
  const [postsByYear, setPostsByYear] = useState(initialPosts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const posts = await getPostsByYearAction(selectedTag);
        setPostsByYear(posts);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('加载文章失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    // 当 selectedTag 为 null 时，也重新获取数据
    fetchData();
  }, [selectedTag]);

  return {
    postsByYear,
    loading,
    error
  };
}

export function ArchiveContent({ initialData }: ArchiveContentProps) {
  const { allTags, selectedTag, isTransitioning, handleTagClick } = useTags(initialData.tags);
  const { postsByYear, loading, error } = usePosts(initialData.postsByYear, selectedTag);

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
    <div className={`space-y-6 transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
      {loading ? (
        <>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="h-6 w-20" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      ) : error ? (
        <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
      ) : Object.entries(postsByYear).length > 0 ? (
        Object.entries(postsByYear).map(([year, posts]) => (
          <div key={year} className="space-y-4">
            <h2 className="text-lg font-medium">{year}</h2>
            <div className="space-y-2">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="flex items-center justify-between group"
                >
                  <span className="text-base font-normal group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors duration-200 truncate mr-4">
                    {post.title}
                  </span>
                  <time className="text-xs text-zinc-400 dark:text-zinc-500 flex-shrink-0">
                    {new Date(post.date).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                  </time>
                </Link>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          暂无文章。
        </p>
      )}
    </div>
  ), [loading, error, postsByYear, isTransitioning]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Header showBackButton={true} title="归档" />

      <main>
        {/* 标签云区域 */}
        {allTags.length > 0 && tagElements}

        {/* 文章列表 */}
        {postElements}
      </main>

      <Footer />
    </div>
  )
}