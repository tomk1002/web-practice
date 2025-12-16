// components/CreatePost.tsx
'use client' // Essential: This makes the component interactive
// 1. DIRECTIVE: This tells Next.js "Send the JavaScript for this file to the browser."
// Without this, hooks like useState or onClick events will crash the app because 
// Next.js tries to render everything on the server by default.

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function CreatePost() {
  // 2. STATE MANAGEMENT:
  // content: Stores what the user is typing in real-time.
  // isLoading: A flag to disable the button so users can't spam-click "Post".
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
	// 3. ROUTER HOOK:
  // This is special to Next.js. It allows us to reload data without refreshing the whole browser.
  const router = useRouter()


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // Stops the browser from reloading the page (standard HTML behavior).
    if (!content.trim()) return // Guard clause: Don't submit empty spaces.

    setIsLoading(true) // Lock the interface.

		// 4. SUPABASE INTERACTION:
    // .from('posts'): Select table.
    // .insert([...]): Add a row. keys must match DB column names exactly.
    // data is ignored here, we only care if there is an 'error'.
    const { error } = await supabase
      .from('posts')
      .insert([{ content: content }]) 

    if (error) {
      console.error('Error posting:', error)
      alert('Error posting!')
    } else {
      setContent('') // Clear the text box

			// 5. THE MAGIC TRICK (router.refresh()):
      // This tells Next.js: "Re-run the Server Components (page.tsx) to fetch new data, 
      // but keep the current page state (scroll position, etc) intact."
      // This is what makes the new post appear "instantly" without a white flash.
      router.refresh() // Refresh the page to show the new post
    }
    
    setIsLoading(false) // Unlock the interface.
  }

  return (
		// Standard JSX (HTML in JS). 
    // Note 'disabled={isLoading}' on both input and button.
    // This is a UI best practice to prevent double-submissions.
    <form onSubmit={handleSubmit} className="mb-8 border p-4 rounded bg-gray-50 shadow-sm">
      <h3 className="font-bold mb-2">Create a new post</h3>
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
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
        disabled={isLoading}
      >
        {isLoading ? 'Posting...' : 'Post'}
      </button>
    </form>
  )
}