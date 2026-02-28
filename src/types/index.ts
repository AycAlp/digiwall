export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Profile {
  id: string
  email: string
  display_name: string | null
  created_at: string
}

export type ViewMode = 'canvas' | 'kanban' | 'grid'

export interface Board {
  id: string
  owner_id: string
  title: string
  background_color: string
  view_mode: ViewMode
  is_locked: boolean
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface Column {
  id: string
  board_id: string
  title: string
  color: string
  position: number
  created_at: string
}

export interface Post {
  id: string
  board_id: string
  author_id: string
  content: string
  color: string
  pos_x: number
  pos_y: number
  z_index: number
  column_id: string | null
  column_position: number
  labels: string[]
  created_at: string
  updated_at: string
}

export interface Reaction {
  id: string
  post_id: string
  user_id: string
  emoji: string
  created_at: string
}

export interface Comment {
  id: string
  post_id: string
  author_id: string
  content: string
  created_at: string
  // joined
  author?: Profile
}

export const REACTION_EMOJIS = ['👍', '❤️', '💡', '🔥', '😮'] as const

export const LABEL_OPTIONS = [
  { label: 'Idea', color: '#7c3aed', bg: '#ede9fe' },
  { label: 'Question', color: '#0369a1', bg: '#e0f2fe' },
  { label: 'Important', color: '#b91c1c', bg: '#fee2e2' },
  { label: 'Done', color: '#15803d', bg: '#dcfce7' },
  { label: 'Revisit', color: '#b45309', bg: '#fef3c7' },
  { label: 'Resource', color: '#be185d', bg: '#fce7f3' },
] as const

export type LabelOption = (typeof LABEL_OPTIONS)[number]
