'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { formatDate } from "@/lib/date";


export default function PostDetail({ post, currentUser }: { post: any, currentUser: any }) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  
  // [NEW] 제목과 내용 각각 관리
  const [title, setTitle] = useState(post.title || '') 
  const [content, setContent] = useState(post.content)
  const [isLoading, setIsLoading] = useState(false)

  const isOwner = currentUser && currentUser.id === post.user_id

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    setIsLoading(true)
    const { error } = await supabase.from('posts').delete().eq('id', post.id)
    if (error) {
        alert('삭제 실패')
    } else {
        router.push('/') 
        router.refresh()
    }
    setIsLoading(false)
  }

  const handleUpdate = async () => {
    setIsLoading(true)
    const { error } = await supabase
      .from('posts')
      .update({ 
        title: title,    // [NEW] 제목 업데이트
        content: content // 내용 업데이트
      })
      .eq('id', post.id)

    if (error) {
        alert('수정 실패')
    } else {
        setIsEditing(false)
        router.refresh()
    }
    setIsLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="border p-8 rounded shadow-sm bg-white min-h-[300px] relative">
        
        {/* 날짜 */}
        <p className="text-sm text-gray-400 mb-6 border-b pb-2">
            작성일: {formatDate(post.created_at)}
        </p>

        {isEditing ? (
          // [수정 모드] 제목/내용 입력창
          <div className="flex flex-col gap-4">
            <input
                className="w-full p-2 text-2xl font-bold border-b focus:outline-none"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목"
            />
            <textarea
              className="w-full p-4 border rounded resize-none min-h-[300px] text-lg leading-relaxed focus:outline-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isLoading}
            />
            <div className="flex gap-2 justify-end mt-2">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded">취소</button>
                <button onClick={handleUpdate} className="px-4 py-2 bg-black text-white rounded font-bold">
                    {isLoading ? '저장 중...' : '저장하기'}
                </button>
            </div>
          </div>
        ) : (
          // [읽기 모드] 제목과 내용 분리 표시
          <div>
            <h1 className="text-3xl font-extrabold mb-8 text-black">{post.title}</h1>
            <div className="text-lg text-gray-800 whitespace-pre-wrap leading-8 min-h-[200px]">
                {post.content}
            </div>
          </div>
        )}

        {/* 수정/삭제 버튼 */}
        {!isEditing && isOwner && (
          <div className="border-t mt-8 pt-4 flex justify-end gap-3">
            <button 
              onClick={() => setIsEditing(true)} 
              className="text-gray-500 hover:text-blue-600 font-medium"
            >
              수정
            </button>
            <span className="text-gray-300">|</span>
            <button 
              onClick={handleDelete} 
              className="text-gray-500 hover:text-red-600 font-medium"
            >
              삭제
            </button>
          </div>
        )}
      </div>
      
      <button onClick={() => router.back()} className="mt-8 p-2 rounded bg-white text-gray-500 hover:text-black flex items-center gap-1">
        <span>←</span> 목록으로
      </button>
    </div>
  )
}