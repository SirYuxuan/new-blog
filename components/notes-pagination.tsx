"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { getPaginatedNotesAction } from "@/app/actions/notes"
import { NoteCard } from "./note-card"
import type { NotesPaginationProps } from "@/types/notes"

export function NotesPagination({ 
  initialNotes, 
  initialTotal,
  initialPage,
  totalPages
}: NotesPaginationProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [page, setPage] = useState(initialPage)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(page < totalPages)
  const [error, setError] = useState<string | null>(null)
  const observerTarget = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)
  const loadedPages = useRef(new Set<number>([initialPage]))

  // 预加载下一页
  const preloadNextPage = useCallback(async () => {
    if (page >= totalPages || loadedPages.current.has(page + 1)) return
    try {
      await getPaginatedNotesAction(page + 1, 10)
    } catch {}
  }, [page, totalPages])

  // 加载下一页
  const loadNextPage = useCallback(async () => {
    if (loadingRef.current || !hasMore || loadedPages.current.has(page + 1)) return
    loadingRef.current = true
    setLoading(true)
    setError(null)
    try {
      const { notes: newNotes } = await getPaginatedNotesAction(page + 1, 10)
      setNotes(prev => {
        const seen = new Set(prev.map(n => n.id))
        const unique = [...prev, ...newNotes.filter(n => !seen.has(n.id))]
        return unique
      })
      setPage(prev => prev + 1)
      loadedPages.current.add(page + 1)
      setHasMore(page + 1 < totalPages)
      // 预加载下下页
      if (page + 1 < totalPages) preloadNextPage()
    } catch (err) {
      setError("加载失败，请重试")
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [page, hasMore, totalPages, preloadNextPage])

  // IntersectionObserver 自动加载
  useEffect(() => {
    if (!hasMore) return
    const options = { threshold: 0.5, rootMargin: '100px' }
    const observer = new window.IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadNextPage()
      }
    }, options)
    const target = observerTarget.current
    if (target) observer.observe(target)
    return () => { if (target) observer.unobserve(target) }
  }, [hasMore, loadNextPage])

  return (
    <div className="relative min-h-[200px] overscroll-contain touch-pan-y">
      <div className="space-y-3">
        {notes.map((note, index) => (
          <NoteCard key={note.id} note={note} isLast={index === notes.length - 1} />
        ))}

        {loading && (
          <div className="space-y-3 transition-opacity duration-300">
            {Array.from({ length: 2 }).map((_, index) => (
              <div 
                key={index}
                className="group relative pb-3 animate-pulse"
              >
                {index !== 1 && (
                  <div className="absolute left-5 top-0 w-px bottom-[-12px] bg-zinc-200 dark:bg-zinc-700 opacity-40" />
                )}
                <div className="relative flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 shadow border border-zinc-200 dark:border-zinc-700" />
                  </div>
                  <div className="flex-1 pt-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <div className="h-4 w-20 bg-zinc-100 dark:bg-zinc-800 rounded" />
                      <div className="h-3 w-16 bg-zinc-100 dark:bg-zinc-800 rounded" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-4/5 bg-zinc-100 dark:bg-zinc-800 rounded" />
                      <div className="h-4 w-3/5 bg-zinc-100 dark:bg-zinc-800 rounded" />
                      <div className="h-3 w-2/5 bg-zinc-100 dark:bg-zinc-800 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 dark:text-red-400 py-4">
            {error}
            <button
              className="ml-4 px-3 py-1 rounded bg-zinc-200 dark:bg-zinc-700"
              onClick={loadNextPage}
            >
              重试
            </button>
          </div>
        )}

        {!loading && notes.length === 0 && (
          <p className="text-center text-zinc-500 dark:text-zinc-400 py-8">
            还没有随笔内容...
          </p>
        )}

        {hasMore && (
          <>
            <div ref={observerTarget} className="h-20" />
            <div className="flex justify-center">
              <button
                className="mt-2 px-4 py-2 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                onClick={loadNextPage}
                disabled={loading}
              >
                {loading ? "加载中..." : "加载更多"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}