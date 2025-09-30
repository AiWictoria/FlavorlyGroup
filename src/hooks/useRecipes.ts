import { useEffect, useState } from "react";
import { useAuth } from "./useAuth"

export interface Recipe {
  recipeId: number
  userId: number
  title: string
  category: string
  ingredients: string
  instructions: string
  imageUrl?: string
  author?: string
  averageRating?: number
  commentsCount?: number
}

export function useRecipes() {

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const {user} = useAuth()

  async function fetchRecipes() {
    try {
      const res = await fetch("/api/recipeSummary", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok) setRecipes(data)
    }
    catch (error) {
      alert("Något gick fel");
    }
  }

  async function fetchRecipeById(id: number) {
    try {
      const res = await fetch(`/api/recipes/${id}`)
      const data = await res.json()

      if (res.ok) return data
      else return null
    }
    catch (error) {
      console.log("Something went wrong")
    }
  }

  async function createRecipe(recipe: Omit<Recipe, "recipeId" | "userId"> & {image?: File | null}){
    if (user === null) {
      alert("Logga in för att skapa recept")
      return { success: false }
    }
    try {
      const { image, ...recipeData } = recipe
      const recipeWithUserId = { ...recipeData, userId: user.id }
      
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipeWithUserId)
      })
      const data = await res.json()

      if (res.ok) {
        setRecipes((prev) => [...prev, data])
        const insertId = data.insertId
        return {success: true, insertId}
      }
    }
      catch (error) {
      return { success: false, error: "Något gick fel"}
    }
  }
  async function updateRecipe(id: number, recipe: Partial<Recipe>) {
    if (user === null) {
      alert("Logga in för att uppdatera recept");
      return { success: false };
    }
    try {
      const res = await fetch(`/api/recipes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipe),
      });
      const data = await res.json();

      if (res.ok) {
        setRecipes((prev) =>
          prev.map((r) => (r.recipeId === id ? { ...r, ...data } : r))
        );
        return { success: true };
      }
    } catch (error) {
      console.error("Fel vid uppdatering av recept:", error);
      return { success: false };
    }
  }
  
  useEffect(() => {
    fetchRecipes();
  }, []);
  
  return {recipes, fetchRecipes, createRecipe, fetchRecipeById, updateRecipe}
}