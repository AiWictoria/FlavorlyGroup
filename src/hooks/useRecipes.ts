import { useEffect, useState } from "react";

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
  
  useEffect(() => {
    fetchRecipes();
  }, []);
  
  return {recipes, fetchRecipes}
}