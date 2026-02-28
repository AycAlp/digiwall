import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = { title: 'Sign in' }

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-violet-700 via-indigo-600 to-blue-600 p-12 text-white">
        <div>
          <span className="text-3xl font-black tracking-tight">DigiWall</span>
        </div>
        <div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Your classroom,<br />brought to life.
          </h2>
          <p className="text-violet-200 text-lg leading-relaxed">
            Create interactive boards, collect ideas in real-time, and engage every student — no matter the format.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[['Canvas', 'Free-form ideas'], ['Kanban', 'Organized workflow'], ['Grid', 'Gallery view']].map(([title, desc]) => (
            <div key={title} className="rounded-2xl bg-white/10 backdrop-blur p-4">
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-violet-300 text-xs mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 text-center">
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">DigiWall</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
          <p className="text-sm text-slate-500 mb-8">Sign in to your DigiWall</p>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
