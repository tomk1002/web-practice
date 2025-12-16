'use client' 
// 1. DIRECTIVE: This tells Next.js "Send the JavaScript for this file to the browser."
// Essential for useState, useEffect, and onClick events.

// [NEW] Added 'useEffect' to the import list.
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function CreatePost() {
  // 2. STATE MANAGEMENT:
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // [NEW] User State
  // We use a "Tri-state" here:
  // null  = We don't know yet (Checking...)
  // false = We know for sure they are NOT logged in.
  // object = They are logged in (contains their email/id).
  const [user, setUser] = useState<any>(null)

  const router = useRouter()

  // [NEW] CHECK AUTH ON LOAD
  // useEffect runs code exactly once when the component first appears (mounts).
  useEffect(() => {
    const getUser = async () => {
      // Ask Supabase: "Who is currently logged in?"
      const { data: { user } } = await supabase.auth.getUser()
      
      // If user is null, set to false. Otherwise set to the user object.
      setUser(user ?? false)
    }
    getUser()
  }, []) // The empty [] array means "Run this only once".

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() 
    // [NEW] Security Guard: Don't submit if empty OR if user is not logged in.
    if (!content.trim() || !user) return 

    setIsLoading(true) 

    // 4. SUPABASE INTERACTION:
    const { error } = await supabase
      .from('posts')
      .insert([
        { 
          content: content,
          // [NEW] Attach the User ID
          // Now we explicitly stamp the post with the author's ID.
          // This is critical for RLS (Permissions) to work correctly later.
          user_id: user.id 
        }
      ]) 

    if (error) {
      console.error('Error posting:', error)
      alert('Error posting!')
    } else {
      setContent('') 
      // 5. THE MAGIC TRICK (router.refresh()):
      router.refresh() 
    }
    
    setIsLoading(false) 
  }

  // [NEW] LOGOUT FUNCTION
  const handleLogout = async () => {
    await supabase.auth.signOut() // Tells Supabase to delete the session cookie.
    setUser(false) // Immediately update UI to show "Logged Out" state.
    router.refresh() // Refresh page to update any other data dependent on user.
  }

  // [NEW] CONDITIONAL RENDERING (The "Traffic Cop" Logic)
  
  // Scenario A: Still checking (Loading)
  // Prevents the login button from flashing briefly before we know the user is logged in.
  if (user === null) {
    return <div className="p-4 text-gray-500 text-sm">Loading user...</div>
  }

  // Scenario B: User is NOT logged in
  // Show a prompt to go to the login page instead of the form.
  if (user === false) {
  return (
    <div className="mb-8 border p-6 rounded bg-gray-50 text-center shadow-sm">
      <p className="mb-4 text-gray-600">Join the conversation to post.</p>
      <div className="flex justify-center gap-4">
          <button 
            onClick={() => router.push('/login')} // Links to Login Page
            className="bg-black text-white px-6 py-2 rounded hover:opacity-80 transition-opacity"
          >
            Log In
          </button>
          
          <button 
            onClick={() => router.push('/signup')} // Links to Signup Page
            className="bg-white text-black border border-black px-6 py-2 rounded hover:bg-gray-100 transition-colors"
          >
            Sign Up
          </button>
      </div>
    </div>
  )
}

  // Scenario C: User IS logged in
  // Render the original Form, but with a Logout button added.
  return (
    <div className="mb-8 border p-4 rounded bg-gray-50 shadow-sm relative">
      
       {/* [NEW] Small Logout button in top right corner */}
      <button 
        onClick={handleLogout}
        className="absolute top-2 right-2 text-xs text-red-500 hover:text-red-700 hover:underline"
      >
        Sign Out
      </button>

      <form onSubmit={handleSubmit}>
        {/* [NEW] Show who is posting */}
        <h3 className="font-bold mb-2 text-sm text-gray-700">
          Posting as: <span className="text-black">{user.email}</span>
        </h3>
        
        <textarea
          className="w-full p-2 border rounded mb-2 text-black"
          rows={3}
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  )
}