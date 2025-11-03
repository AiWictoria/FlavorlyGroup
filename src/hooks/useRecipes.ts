import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export interface Recipe {
  id: number;
  userId: number;
  title: string;
  category: string;
  ingredients: string;
  instructions: string;
  imageUrl?: string;
  author?: string;
  averageRating?: number;
  commentsCount?: number;
}

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  async function fetchRecipes() {
    try {
      const res = await fetch('/api/Recipe', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (res.ok) {
        const mapped = data.map((r: any) => ({
          ...r,
          id: r.recipeId,
          userId: Number(r.userId),
        }));
        setRecipes(mapped);
        return { success: true };
      } else {
        toast.error('Failed loading recipes');
        return { success: false };
      }
    } catch (error) {
      toast.error('Network error, please try again later');
      return { success: false };
    }
  }

  async function fetchRecipeById(id: number) {
    try {
      const res = await fetch(`/api/recipes/${id}`);
      const data = await res.json();

      if (res.ok) {
        return { ...data, id: data.recipeId ?? data.id };
      } else {
        toast.error("We couldn't find that recipe");
        navigate('/recipes');
        return { success: false };
      }
    } catch (error) {
      toast.error('Network error, please try again later');
      return { success: false };
    }
  }

  async function createRecipe(
    recipe: Omit<Recipe, 'recipeId' | 'userId'> & { image?: File | null }
  ) {
    if (user === null) {
      toast.error('Please sign in to create recipes');
      return { success: false };
    }
    try {
      const { image, ...recipeData } = recipe;
      const recipeWithUserId = { ...recipeData, userId: user.id };

      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeWithUserId),
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
    } catch (error) {
      toast.error('Network error, please try again later');
      return { success: false };
    }
  }
  async function updateRecipe(
    id: number,
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
    } catch (error) {
      toast.error('Network error, please try again later');
      return { success: false };
    }
  }

  async function uploadImage(recipeId: number, image: File) {
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

  async function deleteRecipe(id: number): Promise<{ success: boolean }> {
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
