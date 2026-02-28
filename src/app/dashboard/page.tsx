'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useBoards } from '@/hooks/useBoards'
import { BoardCard } from '@/components/dashboard/BoardCard'
import { BoardGridSkeleton } from '@/components/dashboard/BoardSkeleton'
import { CreateBoardModal } from '@/components/dashboard/CreateBoardModal'
import { DeleteBoardDialog } from '@/components/dashboard/DeleteBoardDialog'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Toaster, useToast } from '@/components/ui/Toast'
import type { Board, ViewMode } from '@/types'

export default function DashboardPage() {
  const { user, profile, signOut } = useAuth()
  const { boards, loading, createBoard, deleteBoard } = useBoards(user?.id)
  const { toasts, addToast, dismiss } = useToast()

  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Board | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = boards.filter((b) => b.title.toLowerCase().includes(search.toLowerCase()))

  async function handleCreate(title: string, color: string, viewMode: ViewMode) {
    const result = await createBoard(title, color, viewMode)
    if (!result) addToast('Failed to create board', 'error')
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    setDeleting(true)
    await deleteBoard(deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
    addToast('Board deleted', 'success')
  }

  const displayName = profile?.display_name ?? user?.email?.split('@')[0] ?? 'there'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top nav */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
              DigiWall
            </span>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-sm hidden sm:block">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search boards…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20"
            />
          </div>

          <div className="flex items-center gap-3">
            <Avatar name={profile?.display_name ?? user?.email} />
            <span className="hidden md:block text-sm text-slate-600 font-medium">{displayName}</span>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-slate-500">
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Welcome + CTA */}
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome back, {displayName} 👋
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {boards.length === 0 ? 'Create your first board to get started' : `You have ${boards.length} board${boards.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="shrink-0 gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New board
          </Button>
        </div>

        {/* Quick tip for new users */}
        {!loading && boards.length === 0 && (
          <div className="mb-8 rounded-2xl border border-violet-100 bg-violet-50 p-6">
            <h3 className="font-semibold text-violet-800 mb-2">Getting started with DigiWall</h3>
            <ul className="text-sm text-violet-700 space-y-1">
              <li>• Create a board and choose a layout (Canvas, Kanban, or Grid)</li>
              <li>• Make it public and share the link with your students</li>
              <li>• Students can add notes, react with emojis, and comment</li>
              <li>• Lock the board when you want to present without edits</li>
            </ul>
          </div>
        )}

        {/* Board grid */}
        {loading ? (
          <BoardGridSkeleton />
        ) : filtered.length === 0 && search ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <p className="text-sm">No boards match &quot;{search}&quot;</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((board) => (
              <BoardCard key={board.id} board={board} onDelete={(id) => {
                const b = boards.find((x) => x.id === id)
                if (b) setDeleteTarget(b)
              }} />
            ))}
            {/* Create new card */}
            <button
              onClick={() => setCreateOpen(true)}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 p-8 text-slate-400 hover:border-violet-400 hover:text-violet-500 transition-colors min-h-[184px]"
            >
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-medium">New board</span>
            </button>
          </div>
        )}
      </main>

      <CreateBoardModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreate} />
      {deleteTarget && (
        <DeleteBoardDialog
          open={!!deleteTarget} boardTitle={deleteTarget.title}
          onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm} loading={deleting}
        />
      )}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
