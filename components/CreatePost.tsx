'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function CreatePost() {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user ?? false)
    }
    getUser()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !user) return

    setIsLoading(true)
    const { error } = await supabase
      .from('posts')
      .insert([{ content, user_id: user.id }]) 

    if (error) {
      alert('Error posting!')
    } else {
      setContent('')
      router.refresh()
    }
    setIsLoading(false)
  }

  // [변경됨] handleLogout 함수 삭제함 (Navbar가 처리함)

  // 1. 로딩 중일 때 (깜빡임 방지용 빈 화면)
  if (user === null) return null

  // 2. 로그아웃 상태일 때
  // [변경됨] 거대한 로그인/가입 버튼들을 삭제하고 단순 안내 문구로 변경
  if (user === false) {
    return (
      <div className="mb-8 p-4 bg-gray-50 rounded text-center text-gray-500 text-sm">
        Log in via the top bar to post.
      </div>
    )
  }

  // 3. 로그인 상태일 때 (글쓰기 폼)
  // [변경됨] 우측 상단 'Sign Out' 버튼 삭제함 (Navbar에 있음)
  return (
    <form onSubmit={handleSubmit} className="mb-8 border p-4 rounded bg-white shadow-sm">
      <textarea
        className="w-full p-2 border rounded mb-2 text-black resize-none focus:outline-none focus:ring-1 focus:ring-black"
        rows={3}
        placeholder="What's happening?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isLoading}
      />
      <div className="flex justify-end">
        <button 
          type="submit" 
          className="bg-black text-white px-4 py-1.5 rounded-full text-sm font-bold hover:opacity-80 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  )
}