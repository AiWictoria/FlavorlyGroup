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
    const res = await fetch(`/api/savedRecipes?userId=${user.id}`);
    const data = await res.json();
    if (res.ok) setSavedRecipes(data);
  }

  async function saveRecipe(recipeId: number) {
    if (!user) return alert("You must be logged in");
    const res = await fetch("/api/savedRecipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, recipeId }),
    });
    if (res.ok) fetchSavedRecipes();
  }

  async function removeSaved(id: number) {
    await fetch(`/api/savedRecipes/${id}`, { method: "DELETE" });
    setSavedRecipes(prev => prev.filter(r => r.id !== id));
  }

  useEffect(() => {
    fetchSavedRecipes();
  }, [user]);

  return { savedRecipes, saveRecipe, removeSaved };
}
