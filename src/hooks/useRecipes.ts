import { useEffect, useState } from "react";
import { useAuth } from "./useAuth"

export interface Recipe {
  id: number
  userId: number
  title: string
  category: string
  ingredients: string
  instructions: string
}

export function useRecipes() {

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const {user} = useAuth()

  async function fetchRecipes() {
    try {
      const res = await fetch("/api/recipes", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if(res.ok) setRecipes(data)
    }
    catch (error) {
      alert("Något gick fel");
    }
  }

  async function createRecipe(recipe: Omit<Recipe, "id" | "userId">) {
    if (user === null) {
      alert("Logga in för att skapa recept")
      return { success: false }
    }
    try {
      const recipeWithUserId = {... recipe, userId: user.id}
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipeWithUserId)
      })
      const data = await res.json()
      if (res.ok) {
        setRecipes((prev) => [...prev, data])
        return {success: true, data}
      }
    }
      catch (error) {
      return alert("Något gick fel");
    }
  }
  
  useEffect(() => {
    fetchRecipes();
  }, []);
  
  return {recipes, fetchRecipes, createRecipe}
}