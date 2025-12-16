import Image from "next/image";
import { supabase } from '@/utils/supabase'

export default async function Home() {
  // 2. Fetch data from the 'posts' table
  // .select('*') means "get all columns"
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false }) // Newest posts first

    // 3. Handle errors (simple console log for now)
  if (error) {
    console.error("Error fetching posts:", error)
  }
  
  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Practice Board</h1>

      {/* 4. Map through the data and display it */}
      <div className="space-y-4">
        {posts?.map((post) => (
          <div key={post.id} className="border p-4 rounded shadow-sm bg-white text-black">
            <p className="text-lg">{post.content}</p>
            <p className="text-sm text-gray-500 mt-2">
              {new Date(post.created_at).toLocaleString()}
            </p>
          </div>
        ))}
        
        {/* Empty state check */}
        {posts?.length === 0 && (
            <p className="text-gray-500">No posts found.</p>
        )}
      </div>
    </main>
  );
}
