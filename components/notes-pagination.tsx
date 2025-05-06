"use client"

import { useState, useEffect, useRef } from "react"
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
  const observerTarget = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)

  // 预加载下一页数据
  const preloadNextPage = async () => {
    if (page >= totalPages) return
    try {
      const { notes: nextNotes } = await getPaginatedNotesAction(page + 1, 5)
      return nextNotes
    } catch (error) {
      console.error('Error preloading notes:', error)
      return null
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          loadingRef.current = true
          setLoading(true)
          
          try {
            const nextPage = page + 1
            const { notes: newNotes, total } = await getPaginatedNotesAction(nextPage, 5)
            
            // 使用 Set 来去重，同时保持顺序
            setNotes((prevNotes) => {
              const seen = new Set()
              const uniqueNotes = [...prevNotes, ...newNotes].filter(note => {
                const duplicate = seen.has(note.id)
                seen.add(note.id)
                return !duplicate
              })
              
              setHasMore(nextPage < totalPages)
              return uniqueNotes
            })
            
            setPage(nextPage)
            
            // 预加载下一页
            if (nextPage < totalPages) {
              preloadNextPage()
            }
          } catch (error) {
            console.error('Error fetching more notes:', error)
          } finally {
            setLoading(false)
            loadingRef.current = false
          }
        }
      },
      { 
        threshold: 0.5,
        rootMargin: '100px'
      }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current)
      }
    }
  }, [hasMore, page, totalPages])

  return (
    <div className="relative min-h-[200px]">
      <div className="space-y-3">
        {notes.map((note, index) => (
          <NoteCard 
            key={note.id} 
            note={note} 
            isLast={index === notes.length - 1} 
          />
        ))}

        {loading && (
          <div className="space-y-3 transition-opacity duration-300">
            {Array.from({ length: 2 }).map((_, index) => (
              <div 
                key={index} 
                className="border-b border-zinc-100 dark:border-zinc-800 pb-6 last:border-0 last:pb-0 opacity-60"
              >
                <div className="space-y-2">
                  <div className="h-5 w-2/3 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                  <div className="h-3 w-1/4 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && notes.length === 0 && (
          <p className="text-center text-zinc-500 dark:text-zinc-400 py-8">
            还没有随笔内容...
          </p>
        )}

        {hasMore && (
          <div ref={observerTarget} className="h-20" />
        )}
      </div>
    </div>
  )
}