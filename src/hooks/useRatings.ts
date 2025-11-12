import toast from "react-hot-toast";
import { useAuth } from "../features/auth/AuthContext";
import { useState, useEffect } from "react";

export interface Rating {
  id: number;
  recipeId: number;
  userId: number;
  rating: number;
}

// Temporary kill switch until ratings API exists
const RATINGS_ENABLED = false;

export function useRatings() {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<Rating[]>([]);

  async function fetchRatings(recipeId?: number) {
    if (!RATINGS_ENABLED) {
      setRatings([]);
      return { success: true, data: [] } as const;
    }
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
        toast.error("Det gick inte att ladda betyg");
        return { success: false };
      }
    } catch {
      toast.error("Nätverksfel, försök igen senare");
      return { success: false };
    }
  }

  async function addRating(recipeId: number, rating: number) {
    if (!user) {
      toast.error("Vänligen logga in för att betygsätta");
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
        toast.success("Betyget har sparats!");
        await fetchRatings(recipeId);
        return { success: true };
      } else {
        toast.error("Det gick inte att spara betyget");
        return { success: false };
      }
    } catch {
      toast.error("Nätverksfel, försök igen senare");
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
        toast.success("Betyg uppdaterat!");
        setRatings((prev) =>
          prev.map((r) => (r.id === id ? { ...r, rating } : r))
        );
        return { success: true };
      } else {
        toast.error("Kunde inte uppdatera betyget");
        return { success: false };
      }
    } catch {
      toast.error("Nätverksfel, försök igen senare");
      return { success: false };
    }
  }

  useEffect(() => {
    if (RATINGS_ENABLED) fetchRatings();
  }, [user]);

  return { ratings, fetchRatings, addRating, updateRating };
}
