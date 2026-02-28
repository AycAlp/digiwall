'use client'

import { useState } from 'react'
import type { Post, Reaction } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { ReactionBar } from './ReactionBar'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { LabelPicker } from './LabelPicker'
import { ColorPicker } from './ColorPicker'
import { formatRelativeTime } from '@/lib/utils'

interface GridCardProps {
  post: Post
  userId: string | undefined
  reactions: Reaction[]
  isLocked: boolean
  authorName?: string
  onUpdate: (u: Partial<Post>) => void
  onDelete: () => void
  onCommentClick: () => void
  onReaction: (emoji: string) => void
}

function GridCard({ post, userId, reactions, isLocked, authorName, onUpdate, onDelete, onCommentClick, onReaction }: GridCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [content, setContent] = useState(post.content)
  const isOwn = post.author_id === userId

  function saveContent() {
    if (content !== post.content) onUpdate({ content })
    setExpanded(false)
  }

  return (
    <>
      <div
        className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer"
        onClick={() => setExpanded(true)}
      >
        {/* Top color bar */}
        <div className="h-2 w-full" style={{ backgroundColor: post.color }} />

        <div className="p-4">
          <p className="text-sm text-slate-800 leading-relaxed line-clamp-5 whitespace-pre-wrap">
            {post.content || <span className="text-slate-400 italic text-xs">Empty note</span>}
          </p>

          {post.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {post.labels.map((l) => <Badge key={l} label={l} />)}
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-slate-50">
            <ReactionBar postId={post.id} reactions={reactions} userId={userId} onToggle={onReaction} compact />
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1.5">
              <Avatar name={authorName} className="h-5 w-5 text-[9px]" />
              <span className="text-[10px] text-slate-400 truncate max-w-[100px]">{authorName ?? 'Unknown'}</span>
            </div>
            <span className="text-[10px] text-slate-300">{formatRelativeTime(post.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Expanded modal */}
      <Modal open={expanded} onClose={() => setExpanded(false)}>
        <div className="flex flex-col gap-4">
          <div className="h-1.5 w-full rounded-full -mt-2" style={{ backgroundColor: post.color }} />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={!isOwn || isLocked}
            placeholder="Write something…"
            maxLength={2000}
            rows={6}
            className="w-full resize-none text-sm text-slate-800 leading-relaxed focus:outline-none bg-transparent disabled:cursor-default"
          />

          {isOwn && !isLocked && (
            <>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Color</p>
                <ColorPicker value={post.color} onChange={(color) => onUpdate({ color })} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Labels</p>
                <LabelPicker selected={post.labels} onChange={(labels) => onUpdate({ labels })} />
              </div>
            </>
          )}

          <ReactionBar postId={post.id} reactions={reactions} userId={userId} onToggle={onReaction} />

          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <div className="flex items-center gap-2">
              <Avatar name={authorName} className="h-6 w-6 text-[10px]" />
              <span className="text-xs text-slate-500">{authorName}</span>
              <span className="text-xs text-slate-300">· {formatRelativeTime(post.created_at)}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={onCommentClick} className="text-xs text-slate-500 hover:text-violet-600 flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 3H3a2 2 0 00-2 2v12a2 2 0 002 2h14l4 4V5a2 2 0 00-2-2z" />
                </svg>
                Comments
              </button>
              {isOwn && !isLocked && (
                <button onClick={() => { onDelete(); setExpanded(false) }} className="text-xs text-red-500 hover:text-red-700">
                  Delete
                </button>
              )}
            </div>
          </div>

          {isOwn && !isLocked && content !== post.content && (
            <button onClick={saveContent} className="self-end text-xs font-semibold text-violet-600 hover:text-violet-800">
              Save changes
            </button>
          )}
        </div>
      </Modal>
    </>
  )
}

interface GridViewProps {
  posts: Post[]
  userId: string | undefined
  reactions: Reaction[]
  isLocked: boolean
  backgroundColor: string
  authorNames: Record<string, string>
  pendingUpdates: React.MutableRefObject<Set<string>>
  onUpdatePost: (id: string, u: Partial<Post>, ref: React.MutableRefObject<Set<string>>) => void
  onDeletePost: (id: string) => void
  onCommentClick: (post: Post) => void
  onReaction: (postId: string, emoji: string) => void
}

export function GridView({ posts, userId, reactions, isLocked, backgroundColor, authorNames, pendingUpdates, onUpdatePost, onDeletePost, onCommentClick, onReaction }: GridViewProps) {
  const sorted = [...posts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="flex-1 overflow-auto p-6" style={{ background: backgroundColor }}>
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-slate-400 text-sm">No notes yet. Add the first one!</p>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {sorted.map((post) => (
            <GridCard
              key={post.id} post={post} userId={userId} reactions={reactions} isLocked={isLocked}
              authorName={authorNames[post.author_id]}
              onUpdate={(u) => onUpdatePost(post.id, u, pendingUpdates)}
              onDelete={() => onDeletePost(post.id)}
              onCommentClick={() => onCommentClick(post)}
              onReaction={(e) => onReaction(post.id, e)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
