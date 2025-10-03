import toast from "react-hot-toast";
import { useAuth } from "./useAuth";
import { useState, useEffect } from "react";

export interface Rating {
  id: number;
  recipeId: number;
  userId: number;
  rating: number;
}

export function useRatings() {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<Rating[]>([]);

  async function fetchRatings(recipeId?: number) {
    try {
      const url = recipeId
        ? `/api/ratings?where=recipeId=${recipeId}`
        : `/api/ratings`;

      const res = await fetch(url);
      const data = await res.json();

      if (res.ok) {
        setRatings(data);
        return { success: true, data };
      } else {
        toast.error("Failed to load ratings");
        return { success: false };
      }
    } catch {
      toast.error("Network error, please try again later");
      return { success: false };
    }
  }

  async function addRating(recipeId: number, rating: number) {
    if (!user) {
      toast.error("Please log in to rate");
      return { success: false };
    }

    try {
      const existing = ratings.find(
        (r) => r.recipeId === recipeId && r.userId === user.id
      );

      if (existing) {
        return await updateRating(existing.id, rating);
      }

      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId, userId: user.id, rating }),
      });

      if (res.ok) {
        toast.success("Rating saved!");
        await fetchRatings(recipeId);
        return { success: true };
      } else {
        toast.error("Could not save rating");
        return { success: false };
      }
    } catch {
      toast.error("Network error, please try again later");
      return { success: false };
    }
  }

  async function updateRating(id: number, rating: number) {
    try {
      const res = await fetch(`/api/ratings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });

      if (res.ok) {
        toast.success("Rating updated!");
        setRatings((prev) =>
          prev.map((r) => (r.id === id ? { ...r, rating } : r))
        );
        return { success: true };
      } else {
        toast.error("Could not update rating");
        return { success: false };
      }
    } catch {
      toast.error("Network error, please try again later");
      return { success: false };
    }
  }

  useEffect(() => {
    fetchRatings();
  }, [user]);

  return { ratings, fetchRatings, addRating, updateRating };
}
