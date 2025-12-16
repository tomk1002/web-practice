// app/page.tsx
import { supabase } from '@/lib/supabase'
import CreatePost from '@/components/CreatePost' // Import the new component

// 1. CACHE CONTROL:
// Next.js aggressively caches pages to be fast. 
// "revalidate = 0" forces this page to be "Dynamic". 
// It effectively says: "Run the code below on EVERY request. Never serve a stale snapshot."
// Without this, you might post a comment, refresh, and still not see it.
export const revalidate = 0 

// 2. ASYNC COMPONENT:
// Notice the 'async'. Standard React components can't be async, but 
// Next.js Server Components CAN. This allows us to await database calls directly in the UI code.
export default async function Home() {
  // 3. DATABASE FETCH:
  // This runs on the server (in Oregon/Virginia/Seoul), not the user's laptop.
  // It fetches the data before the HTML is even generated.
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      {/* 4. COMPOSITION:
          We nest the Client Component (<CreatePost />) inside this Server Component.
          The server renders the list of posts (static HTML), 
          while the browser takes over the form (interactive JS).
      */}
      <h1 className="text-3xl font-bold mb-8 text-center">Practice Board</h1>
      
      {/* 1. The Write Feature (Your new button) */}
      <CreatePost />

      {/* 2. The Read Feature (The list) */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Recent Posts</h2>
        {posts?.map((post) => (
          <div key={post.id} className="border p-4 rounded shadow-sm bg-white text-black">
            <p className="text-lg">{post.content}</p>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(post.created_at).toLocaleString()}
            </p>
          </div>
        ))}
        
        {(!posts || posts.length === 0) && (
            <p className="text-gray-500 text-center py-10">No posts yet. Be the first!</p>
        )}
      </div>
    </main>
  )
}