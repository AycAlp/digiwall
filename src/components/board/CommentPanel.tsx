'use client'

import { useState } from 'react'
import { useComments } from '@/hooks/useComments'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { formatRelativeTime } from '@/lib/utils'
import type { Post } from '@/types'

interface CommentPanelProps {
  post: Post | null
  userId: string | undefined
  userDisplayName?: string | null
  onClose: () => void
}

export function CommentPanel({ post, userId, userDisplayName, onClose }: CommentPanelProps) {
  const { comments, loading, addComment, deleteComment } = useComments(post?.id ?? null)
  const [draft, setDraft] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.trim() || !userId) return
    setSubmitting(true)
    await addComment(draft.trim(), userId)
    setDraft('')
    setSubmitting(false)
  }

  return (
    <div className={`fixed inset-y-0 right-0 z-40 flex w-80 flex-col border-l border-slate-200 bg-white shadow-xl transition-transform duration-300 ${post ? 'translate-x-0' : 'translate-x-full'}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-800">Comments</h3>
        <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Note preview */}
      {post && (
        <div className="mx-4 mt-3 rounded-xl border border-slate-100 p-3" style={{ borderLeftWidth: 4, borderLeftColor: post.color }}>
          <p className="text-xs text-slate-500 line-clamp-3">{post.content || <em>Empty note</em>}</p>
        </div>
      )}

      {/* Comments list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {loading ? (
          <p className="text-xs text-slate-400 text-center py-4">Loading…</p>
        ) : comments.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">No comments yet. Be the first!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-2 group">
              <Avatar name={comment.author?.display_name ?? comment.author?.email} className="h-7 w-7 shrink-0 text-[10px]" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-700 truncate">
                    {comment.author?.display_name ?? comment.author?.email ?? 'User'}
                  </span>
                  <span className="text-[10px] text-slate-400 shrink-0">{formatRelativeTime(comment.created_at)}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{comment.content}</p>
                {comment.author_id === userId && (
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="mt-0.5 text-[10px] text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-slate-100 p-3 flex gap-2">
        <Avatar name={userDisplayName} className="h-7 w-7 shrink-0 text-[10px]" />
        <div className="flex-1 flex flex-col gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a comment…"
            rows={2}
            maxLength={1000}
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20"
          />
          <Button type="submit" size="sm" loading={submitting} disabled={!draft.trim()} className="self-end">
            Post
          </Button>
        </div>
      </form>
    </div>
  )
}
