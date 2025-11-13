import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../features/auth/AuthContext";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export interface Ingredient {
  ingredientId: string;
  ingredient: {
    id: string;
    name: string;
  };
  quantity: number;
  unit: {
    id: string;
    name: string;
  };
}

export interface Instruction {
  order?: number;
  text?: string;
}

export interface Comment {
  id: string;
  text: string;
  firstName: string;
}

export interface Recipe {
  id: string;
  title: string;
  image?: string;
  slug: string;
  description?: string;
  instructions?: Instruction[];
  categoryId?: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  ingredients: Ingredient[];
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
      const res = await fetch("/api/expand/Recipe", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (res.ok) {
        // Normalize Orchard responses to our Recipe shape for list views
        const normalized: Recipe[] = Array.isArray(data)
          ? (data as any[]).map((r: any) => {
              const items = Array.isArray(r.items) ? r.items : [];
              const imagePath: string | undefined =
                r?.recipeImage?.paths?.[0] ?? r?.image ?? undefined;
              const comments = items
                .filter((i: any) => i.contentType === "Comment")
                .map((i: any) => ({
                  id: i.id,
                  text: i.content ?? "",
                  authorUsername: i.user?.firstName ?? "",
                }));
              const n: any = {
                id: r.id,
                title: r.title,
                slug: r.slug ?? "",
                image: imagePath,
                description: r.description ?? r.category ?? "",
                // keep minimal list data; detail page fetch maps full items
                ingredients: [],
                comments,
                userAuthor: r.user
                  ? { userId: r.user.id, username: r.user.username }
                  : undefined,
              };

              return n as Recipe;
            })
          : [];
        setRecipes(normalized);
        return { success: true };
      } else {
        toast.error("Det gick inte att läsa in recept");
        return { success: false };
      }
    } catch {
      toast.error("Nätverksfel, försök igen senare");
      return { success: false };
    }
  }

  const fetchRecipeById = useCallback(
    async (id: string) => {
      try {
        // Prefer expanded single fetch so ingredientName can be derived
        const res = await fetch(`/api/expand/Recipe/${id}`);
        const data = await res.json();

        if (res.ok) {
          return { success: true, data: data as Recipe };
        } else {
          toast.error("Vi kunde inte hitta det receptet");
          navigate("/recipes");
          return { success: false, data: null };
        }
      } catch {
        toast.error("Nätverksfel, försök igen senare");
        return { success: false, data: null };
      }
    },
    [navigate]
  );

  async function createRecipe(recipe: {
    title: string;
    category?: string;
    ingredients?: string;
    instructions?: string;
    image?: File | null;
  }) {
    if (user === null) {
      toast.error("Vänligen logga in för att skapa recept");
      return { success: false };
    }
    try {
      // Minimal body for Orchard Core: only send title to avoid validation issues
      const body = { title: recipe.title };
      const res = await fetch("/api/Recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.ok) {
        const insertId = data.id as string;
        // Optimistically add a minimal recipe stub to local state
        setRecipes((prev) => [
          ...prev,
          {
            id: insertId,
            title: data.title ?? recipe.title,
            slug: "",
            ingredients: [],
          } as unknown as Recipe,
        ]);
        toast.success("Recipe created");
        navigate(`/recipes/${insertId}`);
        return { success: true, insertId };
      } else {
        toast.error("Kunde inte skapa receptet, försök igen senare");
        return { success: false };
      }
    } catch {
      toast.error("Nätverksfel, försök igen senare");
      return { success: false };
    }
  }
  async function updateRecipe(
    id: string,
    recipe: Partial<Recipe>
  ): Promise<{ success: boolean }> {
    if (user === null) {
      toast.error("Vänligen signera för att uppdatera receptet");
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
        toast.success("Receptet har uppdaterats");
        navigate(`/recipes/${id}`);
        return { success: true };
      }
      toast.error("Kunde inte uppdatera receptet, försök igen");
      return { success: false };
    } catch {
      toast.error("Nätverksfel, försök igen senare");
      return { success: false };
    }
  }

  async function uploadImage(image: File) {
    try {
      const formData = new FormData();
      formData.append("file", image);

      const res = await fetch("/api/media-upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        return { success: true };
      } else {
        toast.error("Kunde inte ladda upp bilden, försök igen senare");
        return { success: false };
      }
    } catch {
      toast.error("Nätverksfel, försök igen senare");
      return { success: false };
    }
  }

  async function deleteRecipe(id: string): Promise<{ success: boolean }> {
    if (user === null) {
      toast.error("Signera för att radera recept");
      return { success: false };
    }

    try {
      const res = await fetch(`/api/recipes/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setRecipes((prev) => prev.filter((r) => r.id !== id));
        toast.success("Recipe has been deleted");
        navigate("/recipes");
        return { success: true };
      }
      toast.error("Misslyckades med att ta bort receptet, försök igen");
      return { success: false };
    } catch {
      toast.error("Nätverksfel, försök igen senare");
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
