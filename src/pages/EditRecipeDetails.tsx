import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { type Recipe } from "../hooks/useRecipes";
import RecipeLayout from "../components/recipe/RecipeLayout";
import { useAuth } from "../features/auth/AuthContext";
import { getRecipe, updateRecipe as apiUpdateRecipe } from "../api/recipeapi";
import type { RecipePostDto } from "@models/recipe";

EditRecipeDetails.route = {
  path: "/recipes/:id/edit",
  adminOnly: false,
  protected: true,
};

export default function EditRecipeDetails() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!id || !user) return;
    (async () => {
      try {
        const r = await getRecipe(String(id));
        if (r.user?.id && r.user.id !== user.id) {
          navigate("/notAuthorized");
          return;
        }
        const uiRecipe: Recipe = {
          id: r.id,
          title: r.title,
          image: r.recipeImage?.paths?.[0] ?? undefined,
          slug: "",
          description: r.description ?? "",
          instructions: r.items
            .filter((i) => i.contentType === "Instruction")
            .map((i: any) => ({ order: i.order ?? i.step, text: i.text ?? i.content ?? "" })),
          categoryId: undefined,
          prepTimeMinutes: r.prepTimeMinutes,
          cookTimeMinutes: r.cookTimeMinutes,
          servings: r.servings,
          ingredients: r.items
            .filter((i) => i.contentType === "RecipeItem")
            .map((i: any) => ({
              ingredientId: i.ingredient?.id ?? "",
              ingredient: { id: i.ingredient?.id ?? "", name: i.ingredient?.title ?? i.ingredient?.name ?? "" },
              quantity: i.quantity ?? 0,
              unit: { id: i.unit?.id ?? "", name: i.unit?.title ?? "" },
            })),
          comments: [],
          userAuthor: r.user ? { userId: r.user.id, username: r.user.username } : undefined,
        } as unknown as Recipe;
        setRecipe(uiRecipe);
      } catch {
        navigate("/recipes");
      }
    })();
  }, [id, user]);

  function handleChange(field: string, value: string) {
    setRecipe((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  async function handleSubmit() {
    if (!recipe || !id) return;

    // Build a minimal patch for Orchard Core
    const patch: Partial<RecipePostDto> = {
      title: recipe.title,
      description: (recipe as any).category || recipe.description || undefined,
    };

    // Intentionally do not send items in edit to avoid Orchard appending/duplicating

    // Optionally upload and include image path
    if (imageFile) {
      try {
        const form = new FormData();
        form.append("file", imageFile);
        const res = await fetch("/api/media-upload", { method: "POST", body: form });
        if (res.ok) {
          const contentType = res.headers.get("content-type") || "";
          let mediaPath: string | undefined = undefined;
          if (contentType.includes("application/json")) {
            const data: any = await res.json();
            mediaPath = data?.path || data?.mediaPath || (Array.isArray(data?.paths) ? data.paths[0] : undefined);
          } else {
            const text = await res.text();
            mediaPath = text || undefined;
          }
          if (mediaPath) patch.recipeImage = { paths: [mediaPath], mediaTexts: [""] };
        }
      } catch {
        // ignore upload failure for now
      }
    }

    try {
      await apiUpdateRecipe(String(id), patch);
      navigate(`/recipes/${id}`);
    } catch {
      // surface via any global handler if present
    }
  }

  if (!recipe) return <p>Loading...</p>;

  return (
    <RecipeLayout
      mode="edit"
      recipe={recipe}
      onChange={handleChange}
      onFileSelect={setImageFile}
      onSubmit={handleSubmit}
    />
  );
}
