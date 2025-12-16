"use client";

// 1. DIRECTIVE: This tells Next.js "Send the JavaScript for this file to the browser."
// Essential for useState, useEffect, and onClick events.

// [NEW] Added 'useEffect' to the import list.

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  // 2. STATE MANAGEMENT:
  // [NEW] User State
  // We use a "Tri-state" here:
  // null  = We don't know yet (Checking...)
  // false = We know for sure they are NOT logged in.
  // object = They are logged in (contains their email/id).
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // [NEW] CHECK AUTH ON LOAD
  // useEffect runs code exactly once when the component first appears (mounts).
  useEffect(() => {
    // Check active session
    const getUser = async () => {
      // Ask Supabase: "Who is currently logged in?"
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Listen for login/logout events automatically
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "SIGNED_OUT") router.refresh();
    });

    return () => subscription.unsubscribe();
  }, []); // The empty [] array means "Run this only once".

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <nav className="w-full border-b border-gray-200 py-4 px-8 flex justify-between items-center bg-white sticky top-0 z-50">
      {/* Logo / Home Link */}
      <Link
        href="/"
        className="font-extrabold text-xl tracking-tight text-black hover:opacity-80"
      >
        PracticeBoard
      </Link>

      {/* Right Side Actions */}
      {/* [수정] items-center를 추가하여 수직 정렬을 맞춤 */}
      <div className="flex items-center gap-4">
        {user ? (
          // LOGGED IN VIEW
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:inline">
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm border border-gray-300 px-4 py-2 rounded text-red-600 hover:bg-red-50 font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          // LOGGED OUT VIEW
          <div className="flex items-center gap-2">
            {/* [수정] Log In 버튼을 텍스트 링크에서 버튼 형태로 변경하여 높이를 맞춤 */}
            <Link
              href="/login"
              className="text-sm font-medium px-4 py-2 rounded text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Log In
            </Link>

            {/* Sign Up 버튼 */}
            <Link
              href="/signup"
              className="text-sm font-medium bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
