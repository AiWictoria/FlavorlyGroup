import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export interface Ingredient {
  ingredientId: string;
  amount: number;
  unit: string;
  ingredientName?: string;
}

export interface Instruction {
  content: string;
}

export interface Comment {
  content: string;
  author: string;
  createdAt: string;
  userId: string;
  recipeId: string;
}

export interface Recipe {
  id: string;
  title: string;
  imageUrl?: string;
  slug: string;
  description?: string;
  ingredients: Ingredient[];
  instructions?: Instruction[];
  category?: string;
  comments?: Comment[];
  userAuthor?: {
    userId: string;
    username: string;
  };
}

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  async function fetchRecipes() {
    try {
      // Use expanded endpoint so relations (ingredients) are populated
      const res = await fetch('/api/expand/Recipe', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (res.ok) {
        setRecipes(data as Recipe[]);
        return { success: true };
      } else {
        toast.error('Failed loading recipes');
        return { success: false };
      }
    } catch {
      toast.error('Network error, please try again later');
      return { success: false };
    }
  }

  async function fetchRecipeById(id: string) {
    try {
      // Prefer expanded single fetch so ingredientName can be derived
      const res = await fetch(`/api/expand/Recipe/${id}`);
      const data = await res.json();

      if (res.ok) {
        return data as Recipe;
      } else {
        toast.error("We couldn't find that recipe");
        navigate('/recipes');
        return { success: false };
      }
    } catch {
      toast.error('Network error, please try again later');
      return { success: false };
    }
  }

  async function createRecipe(
    recipe: Omit<Recipe, 'id'> & { image?: File | null }
  ) {
    if (user === null) {
      toast.error('Please sign in to create recipes');
      return { success: false };
    }
    try {
      // Exkludera image utan att skapa oanvänd variabel
      const recipeData: Record<string, unknown> = { ...(recipe as Record<string, unknown>) };
      delete (recipeData as { image?: unknown }).image;
      // TODO: Anpassa POST mot backend PostRoutes om/när stöd finns
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeData),
      });
      const data = await res.json();

      if (res.ok) {
        setRecipes((prev) => [...prev, data]);
        const insertId = data.insertId;
        toast.success('Recipe created');
        navigate(`/recipes/${insertId}`);
        return { success: true, insertId };
      } else {
        toast.error('Could not create recipe, try again later');
        return { success: false };
      }
    } catch {
      toast.error('Network error, please try again later');
      return { success: false };
    }
  }
  async function updateRecipe(
    id: string,
    recipe: Partial<Recipe>
  ): Promise<{ success: boolean }> {
    if (user === null) {
      toast.error('Please sign it to update recipe');
      return { success: false };
    }

    try {
      const res = await fetch(`/api/recipes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipe),
      });
      const data = await res.json();

      if (res.ok) {
        setRecipes((prev) =>
          prev.map((r) => (r.id === id ? { ...r, ...data } : r))
        );
        toast.success('The recipe has been updated');
        navigate(`/recipes/${id}`);
        return { success: true };
      }
      toast.error('Could not update recipe, try again');
      return { success: false };
    } catch {
      toast.error('Network error, please try again later');
      return { success: false };
    }
  }

  async function uploadImage(recipeId: string, image: File) {
    try {
      const formData = new FormData();
      formData.append('id', recipeId.toString());
      formData.append('image', image);

      const res = await fetch('/api/imageUpload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        return { success: true };
      } else {
        toast.error('Could not upload image, try again later');
        return { success: false };
      }
    } catch {
      toast.error('Network error, please try again later');
      return { success: false };
    }
  }

  async function deleteRecipe(id: string): Promise<{ success: boolean }> {
    if (user === null) {
      toast.error('Sign it to delete recipe');
      return { success: false };
    }

    try {
      const res = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setRecipes((prev) => prev.filter((r) => r.id !== id));
        toast.success('Recipe has been deleted');
        navigate('/recipes');
        return { success: true };
      }
      toast.error('Failed to delete recipe, try again');
      return { success: false };
    } catch {
      toast.error('Network error, please try again later');
      return { success: false };
    }
  }

  useEffect(() => {
    fetchRecipes();
  }, []);

  return {
    recipes,
    fetchRecipes,
    createRecipe,
    fetchRecipeById,
    updateRecipe,
    uploadImage,
    deleteRecipe,
  };
}
