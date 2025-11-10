import toast from "react-hot-toast";
import { useAuth } from "../features/auth/AuthContext";
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
        toast.error("Misslyckades med att ladda sparade recept");
        return { success: false };
      }
    } catch {
      toast.error("Nätverksfel, försök igen senare");
      return { success: false };
    }
  }

  async function saveRecipe(recipeId: number) {
    if (!user) {
      toast.error("Vänligen logga in för att spara recept");
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
        toast.error("Kunde inte spara receptet, försök igen senare");
        return { success: false };
      }
    } catch {
      toast.error("Nätverksfel, försök igen senare");
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
        toast.error("Kunde inte ta bort sparat recept, försök igen senare.");
        return { success: false };
      }
    } catch {
      toast.error("Nätverksfel, försök igen senare");
      return { success: false };
    }
  }

  useEffect(() => {
    fetchSavedRecipes();
  }, [user]);

  return { savedRecipes, saveRecipe, removeSaved };
}
