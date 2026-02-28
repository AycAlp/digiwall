'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) { setError(error.message); setLoading(false) }
    else { setSuccess(true); setLoading(false) }
  }

  if (success) {
    return (
      <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-6 text-center">
        <div className="text-3xl mb-3">📬</div>
        <p className="font-semibold text-emerald-800">Check your inbox!</p>
        <p className="mt-1 text-sm text-emerald-600">
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Your name" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Ms. Johnson" autoComplete="name" />
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder="you@school.edu" required autoComplete="email" />
      <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
        placeholder="8+ characters" required minLength={8} autoComplete="new-password" />

      {error && <p className="rounded-xl bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-600">{error}</p>}

      <Button type="submit" loading={loading} className="w-full mt-1">Create account</Button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/auth/login" className="font-semibold text-violet-600 hover:text-violet-700">Sign in</Link>
      </p>
    </form>
  )
}
