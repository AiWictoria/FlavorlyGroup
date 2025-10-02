import { useEffect, useState } from "react";
import { useAuth } from "./useAuth"

export interface Recipe {
  id: number
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

    if (res.ok) {
      const mapped = data.map((r: any) => ({
        ...r,
        id: r.recipeId,
        userId: Number(r.userId)
      }));
      setRecipes(mapped);
    }
  } catch (error) {
    alert("Something went wrong");
  }
}

  async function fetchRecipeById(id: number) {
  try {
    const res = await fetch(`/api/recipes/${id}`);
    const data = await res.json();

    if (res.ok) {
      return { ...data, id: data.recipeId ?? data.id };
    } else return null;
  } catch (error) {
    console.log("Something went wrong");
  }
}

  async function createRecipe(recipe: Omit<Recipe, "recipeId" | "userId"> & {image?: File | null}){
    if (user === null) {
      alert("Sign in to create recipe")
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
      return { success: false, error: "Something went wrong"}
    }
  }
  async function updateRecipe(id: number, recipe: Partial<Recipe>): Promise<{ success: boolean }> {
  if (user === null) {
    alert("Sign it to create recipes");
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
        prev.map((r) => (r.id === id ? { ...r, ...data } : r))
      );
      return { success: true };
    }

    return { success: false };
  } catch (error) {
    console.error("Something went wrong:", error);
    return { success: false };
  }
  }
  async function uploadImage(recipeId: number, image: File) {
    try {
      const formData = new FormData();
      formData.append("id", recipeId.toString());
      formData.append("image", image);

      const res = await fetch("/api/imageUpload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Upload failed:", data.error);
        return { success: false, error: data.error };
      }

      console.log("Image uploaded:", data.imageUrl);
      return { success: true, imageUrl: data.imageUrl };
    } catch (error) {
      console.error("Upload error:", error);
      return { success: false, error: "Unexpected error" };
    }
  }

  async function deleteRecipe(id: number): Promise<{ success: boolean }> {
  if (user === null) {
    alert("Sign in to continue");
    return { success: false };
  }

  try {
    const res = await fetch(`/api/recipes/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      return { success: true };
    }

    return { success: false };
  } catch (error) {
    console.error("Delete error:", error);
    return { success: false };
  }
}
  
  useEffect(() => {
    fetchRecipes();
  }, []);
  
  return {recipes, fetchRecipes, createRecipe, fetchRecipeById, updateRecipe, uploadImage, deleteRecipe}
}