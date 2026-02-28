'use client'

import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Post } from '@/types'
import { NoteEditor } from './NoteEditor'
import { ColorPicker } from './ColorPicker'

interface StickyNoteProps {
  post: Post
  onUpdate: (updates: Partial<Pick<Post, 'content' | 'color'>>) => void
  onDelete: () => void
  onPointerDown: () => void
}

export function StickyNote({ post, onUpdate, onDelete, onPointerDown }: StickyNoteProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: post.id,
  })

  const style = {
    position: 'absolute' as const,
    left: post.pos_x,
    top: post.pos_y,
    zIndex: isDragging ? 9999 : post.z_index,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.9 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, backgroundColor: post.color }}
      className="w-48 rounded-xl shadow-md flex flex-col select-none group"
      onPointerDown={onPointerDown}
    >
      {/* Drag handle bar */}
      <div
        {...listeners}
        {...attributes}
        className="flex items-center justify-between rounded-t-xl px-2 py-1.5 cursor-grab active:cursor-grabbing"
        style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
      >
        <svg className="h-3 w-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 4a1 1 0 110-2 1 1 0 010 2zM7 10a1 1 0 110-2 1 1 0 010 2zM7 16a1 1 0 110-2 1 1 0 010 2zM13 4a1 1 0 110-2 1 1 0 010 2zM13 10a1 1 0 110-2 1 1 0 010 2zM13 16a1 1 0 110-2 1 1 0 010 2z" />
        </svg>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowColorPicker((v) => !v)}
            className="rounded p-0.5 hover:bg-black/10"
            title="Change color"
          >
            <svg className="h-3.5 w-3.5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="rounded p-0.5 hover:bg-red-100"
            title="Delete note"
          >
            <svg className="h-3.5 w-3.5 text-gray-600 hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Color picker dropdown */}
      {showColorPicker && (
        <div className="px-3 py-2 border-b border-black/5">
          <ColorPicker
            value={post.color}
            onChange={(color) => {
              onUpdate({ color })
              setShowColorPicker(false)
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="p-3 flex flex-col gap-1">
        <NoteEditor
          initialContent={post.content}
          onSave={(content) => onUpdate({ content })}
        />
      </div>
    </div>
  )
}
