import { useState } from "react";

export interface Comment {
  id: number;
  recipeId: number;
  userId: number;
  author: string;
  content: string;
}

export function useComments() {
  const [comments, setComments] = useState<Comment[]>([]);

  async function fetchComments(recipeId: number) {
    try {
      const res = await fetch(`/api/commentsView?where=recipeId=${recipeId}`);
      const data = await res.json();

      if (res.ok) setComments(data);
    } catch {
    }
  }



  async function addComment(recipeId: number, content: string, userId: number) {
  try {
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipeId, userId, content }),
    });

    if (res.ok) {
      await fetchComments(recipeId);
      return { success: true };

    } else {
      const errorData = await res.json().catch(() => ({}));
      return { success: false, errorData };
    }
  } catch (err) {
    return { success: false };
  }
}

  return { comments, fetchComments, addComment };
}
