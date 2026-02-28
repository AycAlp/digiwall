export const runtime = 'edge'
export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { SignupForm } from '@/components/auth/SignupForm'

export const metadata: Metadata = { title: 'Create account' }

export default function SignupPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-violet-700 via-indigo-600 to-blue-600 p-12 text-white">
        <span className="text-3xl font-black tracking-tight">DigiWall</span>
        <div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Engage students<br />like never before.
          </h2>
          <ul className="space-y-3 text-violet-100">
            {[
              ['📌', 'Sticky notes on a free canvas'],
              ['📋', 'Kanban columns for structured thinking'],
              ['🔲', 'Gallery grid for sharing ideas'],
              ['👍', 'Emoji reactions & comments'],
              ['🔒', 'Lock boards during presentations'],
              ['🌐', 'Share with one link — no setup needed'],
            ].map(([icon, text]) => (
              <li key={text} className="flex items-center gap-3 text-sm">
                <span className="text-lg">{icon}</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-violet-300 text-sm">Free for educators. Always.</p>
      </div>

      {/* Right — form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 text-center">
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">DigiWall</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Create your account</h1>
          <p className="text-sm text-slate-500 mb-8">Start collaborating with your students today</p>
          <SignupForm />
        </div>
      </div>
    </div>
  )
}
