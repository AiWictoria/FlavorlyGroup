import toast from "react-hot-toast";
import { useAuth } from "./useAuth";
import { useState, useEffect } from "react";

export interface SavedRecipe {
  id: number;
  userId: number;
  recipeId: number;
}

export function useSavedRecipes() {
  const { user } = useAuth();
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);

  async function fetchSavedRecipes() {
    if (!user) return;

    try {
      const res = await fetch(`/api/savedRecipes?userId=${user.id}`);
      const data = await res.json();
      if (res.ok) {
        setSavedRecipes(data);
        return { success: true };
      } else {
        toast.error("Failed to load saved recipes");
        return { success: false };
      }
    } catch {
      toast.error("Network error, please try again later");
      return { success: false };
    }
  }

  async function saveRecipe(recipeId: number) {
    if (!user) {
      toast.error("Please log in to save recipes");
      return { success: false };
    }
    try {
      const res = await fetch("/api/savedRecipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, recipeId }),
      });
      if (res.ok) {
        fetchSavedRecipes();
        return { success: true };
      } else {
        toast.error("Could not save recipe, try again later");
        return { success: false };
      }
    } catch {
      toast.error("Network error, please try again later");
      return { success: false };
    }
  }

  async function removeSaved(id: number) {
    try {
      const res = await fetch(`/api/savedRecipes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSavedRecipes((prev) => prev.filter((r) => r.id !== id));
        return { success: true };
      } else {
        toast.error("Could not delete saved recipe, try again later");
        return { success: false };
      }
    } catch {
      toast.error("Network error, please try again later");
      return { success: false };
    }
  }

  useEffect(() => {
    fetchSavedRecipes();
  }, [user]);

  return { savedRecipes, saveRecipe, removeSaved };
}
