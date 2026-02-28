'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { Board } from '@/types'

const VIEW_ICONS: Record<string, string> = { canvas: '🖼️', kanban: '📋', grid: '🔲' }

interface BoardCardProps {
  board: Board
  onDelete: (id: string) => void
}

export function BoardCard({ board, onDelete }: BoardCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const date = new Date(board.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="group relative flex flex-col rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all">
      {/* Preview area */}
      <Link href={`/board/${board.id}`} className="block relative h-32 overflow-hidden" style={{ backgroundColor: board.background_color }}>
        {/* Decorative note previews */}
        <div className="absolute inset-0 p-3 flex flex-wrap gap-2 pointer-events-none opacity-60">
          {['#fef08a','#86efac','#93c5fd','#f9a8d4'].map((c, i) => (
            <div key={i} className="h-8 rounded-lg shadow-sm" style={{ backgroundColor: c, width: 48 + i * 8 }} />
          ))}
        </div>
        {/* View mode badge */}
        <span className="absolute top-2 right-2 rounded-full bg-white/80 backdrop-blur-sm px-2 py-0.5 text-xs font-medium text-slate-600">
          {VIEW_ICONS[board.view_mode]} {board.view_mode}
        </span>
        {board.is_locked && (
          <span className="absolute top-2 left-2 rounded-full bg-amber-100/90 px-2 py-0.5 text-xs font-medium text-amber-700">🔒</span>
        )}
        {board.is_public && (
          <span className="absolute bottom-2 left-2 rounded-full bg-emerald-100/90 px-2 py-0.5 text-xs font-medium text-emerald-700">🌐 Public</span>
        )}
      </Link>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-800 text-sm">{board.title}</p>
          <p className="text-xs text-slate-400 mt-0.5">{date}</p>
        </div>

        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-white py-1 shadow-lg border border-slate-100 z-10">
              <Link href={`/board/${board.id}`} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Open</Link>
              <button onClick={() => onDelete(board.id)} className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">Delete</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
