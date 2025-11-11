import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RecipeLayout from "../components/recipe/RecipeLayout";
import { useAuth } from "../features/auth/AuthContext";
import { createRecipe as apiCreateRecipe } from "../api/recipeapi";
import type { RecipeItemDto } from "@models/recipe";

CreateRecipe.route = {
  path: "/createRecipe",
  menuLabel: "Skapa Recept",
  index: 2,
  adminOnly: false,
  protected: true,
};

export default function CreateRecipe() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState({
    id: 0,
    userId: user?.id || 0,
    title: "",
    category: "",
    ingredients: "", // comma-separated free text (legacy UI)
    instructions: "", // newline-separated text (legacy UI)
    image: null as File | null,
  });
  const [recipeItems, setRecipeItems] = useState<RecipeItemDto[]>([]);

  function handleChange(field: string, value: string) {
    setRecipe((prev) => ({ ...prev, [field]: value }));
  }

  function handleFileSelect(file: File | null) {
    setRecipe((prev) => ({ ...prev, image: file }));
  }

  async function uploadImage(file: File): Promise<string | undefined> {
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/media-upload", { method: "POST", body: form });
      // Handle various possible shapes
      const contentType = res.headers.get("content-type") || "";
      if (!res.ok) return undefined;
      if (contentType.includes("application/json")) {
        const data: any = await res.json();
        // Try common keys
        return (
          data?.path ||
          data?.mediaPath ||
          data?.filePath ||
          (Array.isArray(data?.paths) ? data.paths[0] : undefined) ||
          (Array.isArray(data) && data[0]?.path) ||
          undefined
        );
      }
      // If server returns text, assume it is the path
      const text = await res.text();
      return text || undefined;
    } catch {
      return undefined;
    }
  }

  async function handleSubmit() {
    // Build Orchard Core RecipePostDto from current UI fields
    const instructionItems = recipe.instructions
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((text, idx) => ({ contentType: "Instruction" as const, text, order: idx + 1 }));

    // Ingredient free-text cannot be reliably converted to IDs yet; omit for now
    const dto: any = {
      title: recipe.title,
      description: recipe.category || undefined,
      user: user ? [{ id: user.id, username: user.username }] : undefined,
      items: [
        ...recipeItems,
        ...instructionItems,
      ],
    };

    // If image selected, upload first and include its media path
    if (recipe.image) {
      const mediaPath = await uploadImage(recipe.image);
      if (mediaPath) {
        dto.recipeImage = { paths: [mediaPath], mediaTexts: [""] };
      }
    }

    try {
      const created = await apiCreateRecipe(dto as any);
      // Reset local form state
      setRecipe({
        id: 0,
        userId: 0,
        title: "",
        category: "",
        ingredients: "",
        instructions: "",
        image: null,
      });
      setRecipeItems([]);
      // Navigate to details page for the new recipe
      if (created?.id) navigate(`/recipes/${created.id}`);
    } catch (err) {
      // Let existing toast handlers in fetch layer surface errors
    }
  }

  return (
    <>
      <RecipeLayout
        mode="create"
        recipe={recipe}
        onChange={handleChange}
        onFileSelect={handleFileSelect}
        onRecipeItemsChange={setRecipeItems}
        onSubmit={handleSubmit}
      />
    </>
  );
}
