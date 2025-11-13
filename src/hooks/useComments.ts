import { useState } from "react";
import { toast } from "react-hot-toast";

export interface Comment {
  id: string;
  recipeId: string;
  userId: string;
  author: string;
  content: string;
}

export function useComments(initialComments: Comment[] = []) {
  const [comments, setComments] = useState<Comment[]>(initialComments);

  async function fetchComments(recipeId: string) {
    try {
      const res = await fetch(`/api/commentsView?where=recipeId=${recipeId}`);
      const data = await res.json();

      if (res.ok) {
        setComments(data);
        return { success: true, data };
      } else {
        toast.error("Kunde inte ladda kommentarer, försök igen senare");
      }
    } catch {
      toast.error("Nätverksfel, försök igen senare");
      return { success: false };
    }
  }

  async function addComment(recipeId: string, content: string, userId: string) {
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId, userId, content }),
      });

      if (res.ok) {
        await fetchComments(recipeId);
        toast.success("Kommentaren har sparats");
        return { success: true };
      } else {
        toast.error("Kunde inte spara kommentaren, försök igen senare.");
        return { success: false };
      }
    } catch {
      toast.error("Nätverksfel, försök igen senare");
      return { success: false };
    }
  }

  return { comments, setComments, fetchComments, addComment };
}
