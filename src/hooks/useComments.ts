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
      alert("Something went wrong");
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
      }
    } catch {
      return { success: false };
    }
  }

  return { comments, fetchComments, addComment };
}
