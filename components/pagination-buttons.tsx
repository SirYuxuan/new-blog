"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PaginationButtonsProps } from '@/types/pagination'

export function PaginationButtons({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationButtonsProps) {
  return (
    <div className={cn("flex items-center justify-center gap-3", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full transition-all duration-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 disabled:opacity-40 group"
      >
        <ChevronLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
        <span className="text-sm font-medium">上一页</span>
      </Button>
      
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalPages }).map((_, index) => {
          const pageNumber = index + 1;
          // 只显示当前页附近的页码和首尾页
          const shouldShow = 
            pageNumber === 1 || 
            pageNumber === totalPages || 
            Math.abs(pageNumber - currentPage) <= 1;
          
          // 显示省略号
          if (!shouldShow) {
            // 只在需要的位置显示省略号
            if ((pageNumber === 2 && currentPage > 3) || 
                (pageNumber === totalPages - 1 && currentPage < totalPages - 2)) {
              return (
                <span 
                  key={`ellipsis-${pageNumber}`}
                  className="flex h-8 w-8 items-center justify-center text-xs text-zinc-400 dark:text-zinc-500"
                >
                  •••
                </span>
              );
            }
            return null;
          }
          
          return (
            <Button
              key={pageNumber}
              variant={currentPage === pageNumber ? "default" : "ghost"}
              size="sm"
              onClick={() => onPageChange(pageNumber)}
              className={cn(
                "h-8 w-8 p-0 text-xs font-medium rounded-full transition-all duration-300",
                currentPage === pageNumber
                  ? "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm"
                  : "hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80"
              )}
            >
              {pageNumber}
            </Button>
          );
        })}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full transition-all duration-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 disabled:opacity-40 group"
      >
        <span className="text-sm font-medium">下一页</span>
        <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
      </Button>
    </div>
  )
}