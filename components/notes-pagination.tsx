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
      const { notes: nextNotes } = await getPaginatedNotesAction(page + 1, 7)
      return nextNotes
    } catch (error) {
      console.error('Error preloading notes:', error)
      return null
    }
  }

  useEffect(() => {
    const options = { 
      threshold: 0.5,
      rootMargin: '100px'
    }

    const handleIntersection = async (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
        loadingRef.current = true
        setLoading(true)
        
        try {
          const nextPage = page + 1
          const { notes: newNotes, total } = await getPaginatedNotesAction(nextPage, 7)
          
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
    }

    const observer = new IntersectionObserver(handleIntersection, options)

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasMore, page, totalPages])

  return (
    <div 
      className="relative min-h-[200px] overscroll-contain touch-pan-y" 
      style={{ 
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: 'smooth'
      }}
    >
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
                className="group relative pb-3"
              >
                {index !== 1 && (
                  <div className="absolute left-5 top-0 w-px bottom-[-12px] bg-zinc-200 dark:bg-zinc-700 opacity-40" />
                )}
                <div className="relative flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                  </div>
                  <div className="flex-1 pt-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <div className="h-4 w-16 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                      <div className="h-3 w-24 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                    </div>
                    <div className="mt-2 space-y-2">
                      <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                      <div className="h-4 w-4/5 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                    </div>
                  </div>
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