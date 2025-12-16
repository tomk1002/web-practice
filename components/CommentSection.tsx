'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function CommentSection({ postId, initialComments, currentUser }: { postId: number, initialComments: any[], currentUser: any }) {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    if (!currentUser) {
        alert("로그인이 필요합니다.")
        return
    }

    setIsLoading(true)
    const { error } = await supabase
      .from('comments')
      .insert({
        content,
        post_id: postId,
        user_email: currentUser.email, // 이메일을 같이 저장
        user_id: currentUser.id
      })

    if (error) {
        alert('댓글 작성 실패')
        console.error(error)
    } else {
        setContent('')
        router.refresh() // 새로고침해서 목록 갱신
    }
    setIsLoading(false)
  }

  const handleDelete = async (commentId: number) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return
    
    const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
    
    if (error) alert("삭제 실패")
    else router.refresh()
  }

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4">
      <h3 className="font-bold text-lg mb-4">댓글 ({initialComments.length})</h3>

      {/* 1. 댓글 입력 폼 */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
        <input
          className="flex-1 p-2 border rounded focus:outline-none focus:border-black"
          placeholder={currentUser ? "댓글을 입력하세요..." : "로그인이 필요합니다."}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isLoading || !currentUser}
        />
        <button 
          type="submit" 
          disabled={isLoading || !currentUser}
          className="bg-black text-white px-4 py-2 rounded font-bold disabled:opacity-50"
        >
          등록
        </button>
      </form>

      {/* 2. 댓글 목록 */}
      <div className="space-y-4">
        {initialComments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 p-4 rounded text-sm group">
            <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-gray-700">
                    {comment.user_email?.split('@')[0]} {/* 이메일 아이디만 표시 */}
                </span>
                <span className="text-gray-400 text-xs">
                    {new Date(comment.created_at).toLocaleString()}
                </span>
            </div>
            
            <p className="text-gray-800">{comment.content}</p>

            {/* 내 댓글일 때만 삭제 버튼 노출 */}
            {currentUser && currentUser.id === comment.user_id && (
                <div className="flex justify-end mt-1">
                    <button 
                        onClick={() => handleDelete(comment.id)}
                        className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        삭제
                    </button>
                </div>
            )}
          </div>
        ))}

        {initialComments.length === 0 && (
            <p className="text-center text-gray-400 py-4 text-sm">첫 번째 댓글을 남겨보세요.</p>
        )}
      </div>
    </div>
  )
}