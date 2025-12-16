// app/login/page.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent, type: 'LOGIN' | 'SIGNUP') => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } =
        type === 'LOGIN'
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password })

      if (error) {
        alert(error.message)
      } else {
        router.push('/') // Redirect to home on success
        router.refresh()
      }
    } catch (error) {
      alert('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md border p-8 rounded bg-white shadow-md text-black">
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome Back</h1>
        
        <form className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 border rounded"
          />
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={(e) => handleLogin(e, 'LOGIN')}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Log In'}
            </button>
            <button
              onClick={(e) => handleLogin(e, 'SIGNUP')}
              disabled={loading}
              className="flex-1 bg-gray-200 text-black p-2 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}