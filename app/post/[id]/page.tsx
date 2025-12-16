import { createClient } from '@/utils/supabase/server' // 서버용 클라이언트
import PostDetail from '@/components/PostDetail'
import CommentSection from '@/components/CommentSection' // [NEW] 댓글 컴포넌트

export const revalidate = 0

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  // 1. 게시글 가져오기
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()

  // [NEW] 2. 이 글에 달린 댓글들 가져오기 (오래된 순 정렬)
  const { data: comments, error: commentError } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', id)
    .order('created_at', { ascending: true })

  // 3. 현재 유저 정보 (댓글 작성 권한 등 확인용)
  const { data: { user } } = await supabase.auth.getUser()

  if (postError || !post) {
    return <div className="p-16 text-center">글을 찾을 수 없습니다.</div>
  }

  return (
    <div className="pt-8 pb-20">
       {/* 게시글 본문 */}
       <PostDetail post={post} currentUser={user} />
       
       {/* 구분선 */}
       <hr className="max-w-3xl mx-auto border-gray-200" />

       {/* [NEW] 댓글 영역 */}
       <CommentSection 
          postId={post.id} 
          initialComments={comments || []} 
          currentUser={user} 
       />
    </div>
  )
}