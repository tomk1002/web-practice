"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function CreatePost() {
  const [title, setTitle] = useState(""); // [NEW] 제목 상태 추가
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user ?? false);
    };
    getUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !user) return;

    setIsLoading(true);
    const { error } = await supabase.from("posts").insert([
      {
        title: title, // [NEW] 제목 저장
        content: content,
        user_id: user.id,
      },
    ]);

    if (error) {
      alert("Error posting!");
    } else {
      setTitle(""); // 초기화
      setContent("");
      router.refresh();
    }
    setIsLoading(false);
  };

  // [변경됨] handleLogout 함수 삭제함 (Navbar가 처리함)

  // 1. 로딩 중일 때 (깜빡임 방지용 빈 화면)
  if (user === null) return null;
  // 2. 로그아웃 상태일 때
  if (user === false) {
    return (
      <div className="mb-8 p-4 bg-gray-50 rounded text-center text-gray-500 text-sm">
        Log in via the top bar to post.
      </div>
    );
  }

  // 3. 로그인 상태일 때 (글쓰기 폼)
  // [변경됨] 우측 상단 'Sign Out' 버튼 삭제함 (Navbar에 있음)
  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 border p-6 rounded bg-white shadow-sm flex flex-col gap-3"
    >
      <h3 className="font-bold text-black mb-1">새 게시물</h3>

      {/* 제목 입력창 */}
      <input
        type="text"
        className="w-full p-2 border rounded text-gray-900 font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10
  transition-all"
        placeholder="제목을 입력하세요"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isLoading}
      />

      {/* 내용 입력창 */}
      <textarea
        className="w-full p-2 border rounded text-gray-900 resize-none placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 transition-all"
        rows={3}
        placeholder="내용을 입력하세요..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isLoading}
      />

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-black text-white px-6 py-2 rounded font-bold hover:opacity-80 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? "저장 중..." : "게시하기"}
        </button>
      </div>
    </form>
  );
}
