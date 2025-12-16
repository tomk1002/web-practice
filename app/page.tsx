// app/page.tsx
import { supabase } from "@/lib/supabase";
import CreatePost from "@/components/CreatePost"; // Import the new component
import Link from 'next/link' // 링크 기능 추가

// 1. CACHE CONTROL:
// Next.js aggressively caches pages to be fast.
// "revalidate = 0" forces this page to be "Dynamic".
// It effectively says: "Run the code below on EVERY request. Never serve a stale snapshot."
// Without this, you might post a comment, refresh, and still not see it.
export const revalidate = 0;

// 2. ASYNC COMPONENT:
// Notice the 'async'. Standard React components can't be async, but
// Next.js Server Components CAN. This allows us to await database calls directly in the UI code.
export default async function Home() {
  // 3. DATABASE FETCH:
  // This runs on the server (in Oregon/Virginia/Seoul), not the user's laptop.
  // It fetches the data before the HTML is even generated.
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Practice Board</h1>
      
      <CreatePost />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Feed</h2>
        
        {posts?.map((post) => (
          <Link key={post.id} href={`/post/${post.id}`} className="block group">
            <div className="border p-5 rounded shadow-sm bg-white hover:border-black transition-colors cursor-pointer">
              {/* [NEW] 제목 강조 */}
              <h3 className="text-xl font-bold text-black group-hover:text-blue-600 mb-2 truncate">
                {post.title || '제목 없음'}
              </h3>
              
              {/* 내용은 살짝 보여주기 (2줄까지만) */}
              <p className="text-gray-600 line-clamp-2 text-sm">{post.content}</p>
              
              <p className="text-xs text-gray-400 mt-4 text-right">
                {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}
        
        {(!posts || posts.length === 0) && (
            <p className="text-gray-500 text-center py-10">작성된 글이 없습니다.</p>
        )}
      </div>
    </main>
  )
}