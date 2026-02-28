'use client'

import { useRef, useState } from 'react'
import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { Post } from '@/types'
import { StickyNote } from './StickyNote'
import { AddNoteButton } from './AddNoteButton'

const CANVAS_WIDTH = 3000
const CANVAS_HEIGHT = 2000

interface BoardCanvasProps {
  boardId: string
  backgroundColor: string
  posts: Post[]
  userId: string | undefined
  pendingUpdates: React.MutableRefObject<Set<string>>
  onAddNote: () => Promise<void>
  onUpdatePost: (
    postId: string,
    updates: Partial<Pick<Post, 'content' | 'color' | 'pos_x' | 'pos_y' | 'z_index'>>,
    pendingRef: React.MutableRefObject<Set<string>>
  ) => Promise<void>
  onDeletePost: (postId: string) => Promise<void>
}

export function BoardCanvas({
  backgroundColor,
  posts,
  pendingUpdates,
  onAddNote,
  onUpdatePost,
  onDeletePost,
}: BoardCanvasProps) {
  const [addingNote, setAddingNote] = useState(false)
  const maxZIndex = useRef(Math.max(0, ...posts.map((p) => p.z_index)))

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, delta } = event
    const postId = active.id as string
    const post = posts.find((p) => p.id === postId)
    if (!post) return

    const newX = Math.max(0, post.pos_x + Math.round(delta.x))
    const newY = Math.max(0, post.pos_y + Math.round(delta.y))

    await onUpdatePost(postId, { pos_x: newX, pos_y: newY }, pendingUpdates)
  }

  function bringToFront(postId: string) {
    maxZIndex.current += 1
    onUpdatePost(postId, { z_index: maxZIndex.current }, pendingUpdates)
  }

  async function handleAddNote() {
    setAddingNote(true)
    await onAddNote()
    setAddingNote(false)
  }

  return (
    <>
      <div
        className="overflow-auto h-[calc(100vh-57px)]"
        style={{ background: backgroundColor }}
      >
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div
            className="relative"
            style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
          >
            {posts.map((post) => (
              <StickyNote
                key={post.id}
                post={post}
                onPointerDown={() => bringToFront(post.id)}
                onUpdate={(updates) => onUpdatePost(post.id, updates, pendingUpdates)}
                onDelete={() => onDeletePost(post.id)}
              />
            ))}
          </div>
        </DndContext>
      </div>

      <AddNoteButton onClick={handleAddNote} loading={addingNote} />
    </>
  )
}
