'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else window.location.href = '/dashboard'
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder="you@school.edu" required autoComplete="email" />
      <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••" required autoComplete="current-password" />

      {error && <p className="rounded-xl bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-600">{error}</p>}

      <Button type="submit" loading={loading} className="w-full mt-1">Sign in</Button>

      <p className="text-center text-sm text-slate-500">
        No account?{' '}
        <Link href="/auth/signup" className="font-semibold text-violet-600 hover:text-violet-700">Sign up free</Link>
      </p>
    </form>
  )
}
