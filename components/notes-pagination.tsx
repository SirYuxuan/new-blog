"use client"

import { useState, useEffect, useRef } from "react"
import { getPaginatedNotesAction } from "@/app/actions/notes"
import { NoteCard } from "./note-card"

export function NotesPagination({ initialNotes, initialTotal }: { 
  initialNotes: any[],
  initialTotal: number,
}) {
  const [notes, setNotes] = useState(initialNotes)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(notes.length < initialTotal)
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreNotes()
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current)
      }
    }
  }, [hasMore, loading])

  const loadMoreNotes = async () => {
    if (loading) return
    
    setLoading(true)
    try {
      const nextPage = page + 1
      const { notes: newNotes, total } = await getPaginatedNotesAction(nextPage, 5)
      
      // 使用 Set 来去重
      setNotes((prevNotes) => {
        const uniqueNotes = Array.from(
          new Set([...prevNotes, ...newNotes].map(note => JSON.stringify(note)))
        ).map(str => JSON.parse(str));
        
        setHasMore(uniqueNotes.length < total)
        return uniqueNotes
      })
      setPage(nextPage)
    } catch (error) {
      console.error('Error fetching more notes:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="space-y-3">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="border-b border-zinc-100 dark:border-zinc-800 pb-6 last:border-0 last:pb-0">
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
          <div ref={observerTarget} className="h-4" />
        )}
      </div>
    </>
  )
}