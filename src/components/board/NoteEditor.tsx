'use client'

import { useEffect, useRef, useState } from 'react'

interface NoteEditorProps {
  initialContent: string
  onSave: (content: string) => void
  placeholder?: string
}

export function NoteEditor({ initialContent, onSave, placeholder = 'Write something...' }: NoteEditorProps) {
  const [content, setContent] = useState(initialContent)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setContent(initialContent)
  }, [initialContent])

  function handleBlur() {
    if (content !== initialContent) {
      onSave(content)
    }
  }

  return (
    <textarea
      ref={textareaRef}
      value={content}
      onChange={(e) => setContent(e.target.value)}
      onBlur={handleBlur}
      placeholder={placeholder}
      maxLength={2000}
      className="w-full flex-1 resize-none bg-transparent text-sm leading-relaxed text-gray-800 placeholder:text-gray-400 focus:outline-none"
      rows={4}
    />
  )
}
